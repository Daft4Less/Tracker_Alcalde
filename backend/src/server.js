const http = require('http');
const url = require('url');
const dbService = require('./db');
const authService = require('./auth');

const PORT = process.env.PORT || 3000;

let expressApp = null;
try {
  const express = require('express');
  const cors = require('cors');

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/api/health', async (req, res) => {
    const health = await dbService.checkHealth();
    res.json({
      status: 'online',
      message: 'API RESTful Alcalde Tracker Quito Operativa',
      database: health,
      timestamp: new Date().toISOString()
    });
  });

  // Autenticación JWT
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar username y password' });
    }
    const result = await authService.login(username, password);
    if (!result.ok) return res.status(401).json({ success: false, message: result.error });
    res.json({ success: true, message: 'Inicio de sesión exitoso', token: result.token, user: result.user });
  });

  app.get('/api/auth/me', authService.requireAuth, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  app.get('/api/ejes', async (req, res) => {
    const ejes = await dbService.getEjes();
    res.json({ success: true, count: ejes.length, data: ejes });
  });

  app.get('/api/parroquias', async (req, res) => {
    const parroquias = await dbService.getParroquias();
    res.json({ success: true, count: parroquias.length, data: parroquias });
  });

  app.get('/api/obras', async (req, res) => {
    const filters = { estado: req.query.estado, id_parroquia: req.query.id_parroquia };
    const obras = await dbService.getObras(filters);
    res.json({ success: true, count: obras.length, filters, data: obras });
  });

  app.get('/api/obras/:id', async (req, res) => {
    const obra = await dbService.getObraById(req.params.id);
    if (!obra) return res.status(404).json({ success: false, message: 'Obra no encontrada' });
    res.json({ success: true, data: obra });
  });

  app.post('/api/obras', authService.requireAuth, async (req, res) => {
    const { barrio_sector, descripcion } = req.body;
    if (!barrio_sector || !descripcion) {
      return res.status(400).json({ success: false, message: 'Los campos barrio_sector y descripcion son obligatorios' });
    }
    const createdObra = await dbService.createObra(req.body);
    res.status(201).json({ success: true, message: 'Obra registrada exitosamente en el sistema', data: createdObra });
  });

  // Editar Obra Existente (PUT)
  app.put('/api/obras/:id', authService.requireAuth, async (req, res) => {
    try {
      const updatedObra = await dbService.updateObra(req.params.id, req.body);
      if (!updatedObra) {
        return res.status(404).json({ success: false, message: 'Obra no encontrada para actualizar' });
      }
      res.json({ success: true, message: 'Obra actualizada exitosamente', data: updatedObra });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Eliminar Obra (DELETE)
  app.delete('/api/obras/:id', authService.requireAuth, async (req, res) => {
    try {
      const deletedObra = await dbService.deleteObra(req.params.id);
      if (!deletedObra) {
        return res.status(404).json({ success: false, message: 'Obra no encontrada para eliminar' });
      }
      res.json({ success: true, message: 'Obra eliminada exitosamente', data: deletedObra });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Extraer Coordenadas desde Link de Google Maps
  app.post('/api/parse-maps-url', async (req, res) => {
    try {
      const { mapsUrl } = req.body;
      if (!mapsUrl) return res.status(400).json({ success: false, message: 'Debe proporcionar la propiedad mapsUrl' });

      // Intento 1: Expresión Regular Directa
      let match = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                  mapsUrl.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                  mapsUrl.match(/!3d(-?\d+\.\d+).*?!4d(-?\d+\.\d+)/);

      if (match) {
        return res.json({ success: true, lat: parseFloat(match[1]), lng: parseFloat(match[2]), source: 'direct_regex' });
      }

      // Intento 2: Si es un link acortado (maps.app.goo.gl), resolver redirección HTTP
      if (mapsUrl.includes('goo.gl') || mapsUrl.includes('maps.app')) {
        const fetchRes = await fetch(mapsUrl, { redirect: 'follow' });
        const finalUrl = fetchRes.url;
        match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                finalUrl.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                finalUrl.match(/!3d(-?\d+\.\d+).*?!4d(-?\d+\.\d+)/);
        if (match) {
          return res.json({ success: true, lat: parseFloat(match[1]), lng: parseFloat(match[2]), expandedUrl: finalUrl, source: 'expanded_redirect' });
        }
      }

      return res.status(400).json({ success: false, message: 'No se pudieron extraer coordenadas del enlace proporcionado.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  expressApp = app;
} catch (e) {
  // Express no disponible aún, usar el servidor HTTP nativo de Node.js
}

if (expressApp) {
  authService.ensureDefaultAdmin().then(() => {
    expressApp.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 API RESTful Express Alcalde Tracker Quito corriendo en:`);
      console.log(`👉 http://localhost:${PORT}`);
      console.log(`👉 http://127.0.0.1:${PORT}`);
      console.log(`=======================================================`);
    });
  });
} else {
  // Fallback Servidor HTTP Nativo (Zero Dependencies)
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Encabezados CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const sendJson = (statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (method === 'GET' && pathname === '/api/health') {
      const health = await dbService.checkHealth();
      return sendJson(200, { status: 'online', message: 'API RESTful Nativa Operativa', database: health, timestamp: new Date().toISOString() });
    }

    if (method === 'POST' && pathname === '/api/auth/login') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk.toString(); });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}');
          if (!body.username || !body.password) {
            return sendJson(400, { success: false, message: 'Debe proporcionar username y password' });
          }
          const result = await authService.login(body.username, body.password);
          if (!result.ok) return sendJson(401, { success: false, message: result.error });
          return sendJson(200, { success: true, message: 'Inicio de sesión exitoso', token: result.token, user: result.user });
        } catch (err) {
          return sendJson(400, { success: false, error: 'JSON inválido' });
        }
      });
      return;
    }

    if (method === 'GET' && pathname === '/api/auth/me') {
      if (!authService.isAuthorized(req)) return sendJson(401, { success: false, message: 'No autorizado' });
      const token = (req.headers.authorization || '').split(' ')[1];
      return sendJson(200, { success: true, user: authService.verifyToken(token) });
    }

    if (method === 'GET' && pathname === '/api/ejes') {
      const ejes = await dbService.getEjes();
      return sendJson(200, { success: true, count: ejes.length, data: ejes });
    }

    if (method === 'GET' && pathname === '/api/parroquias') {
      const parroquias = await dbService.getParroquias();
      return sendJson(200, { success: true, count: parroquias.length, data: parroquias });
    }

    if (method === 'GET' && pathname === '/api/obras') {
      const filters = { estado: parsedUrl.query.estado, id_parroquia: parsedUrl.query.id_parroquia };
      const obras = await dbService.getObras(filters);
      return sendJson(200, { success: true, count: obras.length, filters, data: obras });
    }

    if (method === 'GET' && pathname.startsWith('/api/obras/')) {
      const id = pathname.split('/')[3];
      const obra = await dbService.getObraById(id);
      if (!obra) return sendJson(404, { success: false, message: 'Obra no encontrada' });
      return sendJson(200, { success: true, data: obra });
    }

    if (method === 'POST' && pathname === '/api/obras') {
      if (!authService.isAuthorized(req)) return sendJson(401, { success: false, message: 'No autorizado. Token JWT inválido o expirado.' });
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk.toString(); });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}');
          if (!body.barrio_sector || !body.descripcion) {
            return sendJson(400, { success: false, message: 'Los campos barrio_sector y descripcion son obligatorios' });
          }
          const createdObra = await dbService.createObra(body);
          return sendJson(201, { success: true, message: 'Obra registrada exitosamente', data: createdObra });
        } catch (err) {
          return sendJson(400, { success: false, error: err.message });
        }
      });
      return;
    }

    if (method === 'PUT' && pathname.startsWith('/api/obras/')) {
      if (!authService.isAuthorized(req)) return sendJson(401, { success: false, message: 'No autorizado. Token JWT inválido o expirado.' });
      const id = pathname.split('/')[3];
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk.toString(); });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}');
          const updatedObra = await dbService.updateObra(id, body);
          if (!updatedObra) return sendJson(404, { success: false, message: 'Obra no encontrada' });
          return sendJson(200, { success: true, message: 'Obra actualizada exitosamente', data: updatedObra });
        } catch (err) {
          return sendJson(400, { success: false, error: err.message });
        }
      });
      return;
    }

    if (method === 'DELETE' && pathname.startsWith('/api/obras/')) {
      if (!authService.isAuthorized(req)) return sendJson(401, { success: false, message: 'No autorizado. Token JWT inválido o expirado.' });
      const id = pathname.split('/')[3];
      try {
        const deletedObra = await dbService.deleteObra(id);
        if (!deletedObra) return sendJson(404, { success: false, message: 'Obra no encontrada' });
        return sendJson(200, { success: true, message: 'Obra eliminada exitosamente', data: deletedObra });
      } catch (err) {
        return sendJson(500, { success: false, error: err.message });
      }
    }

    // Servir la API REST (sin interfaz web; el panel admin vive en el frontend Angular)
  });

  authService.ensureDefaultAdmin().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 API RESTful HTTP Nativa Alcalde Tracker Quito corriendo en:`);
      console.log(`👉 http://localhost:${PORT}`);
      console.log(`👉 http://127.0.0.1:${PORT}`);
      console.log(`=======================================================`);
    });
  });
}
