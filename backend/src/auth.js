const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbService = require('./db');

let secret = null;
try {
  require('dotenv').config();
} catch (e) {}

const JWT_SECRET = process.env.JWT_SECRET || 'alcalde-tracker-dev-secret-cambiar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  nombre_completo: process.env.ADMIN_NOMBRE || 'Administrador del Sistema'
};

function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

function verifyPassword(plain, hash) {
  try {
    return bcrypt.compareSync(plain || '', hash || '');
  } catch (e) {
    return false;
  }
}

function generateToken(user) {
  return jwt.sign(
    { sub: user.id || user.username, username: user.username, rol: user.rol || 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function extractToken(req) {
  const header = req.headers && req.headers.authorization;
  if (!header) return null;
  const parts = header.split(' ');
  return parts[0].toLowerCase() === 'bearer' ? parts[1] : null;
}

async function login(username, password) {
  const user = await dbService.getAdminByUsername(username);
  if (!user) return { ok: false, error: 'Credenciales inválidas' };
  if (!verifyPassword(password, user.password_hash)) {
    return { ok: false, error: 'Credenciales inválidas' };
  }
  if (user.activo === false) {
    return { ok: false, error: 'Cuenta de administrador desactivada' };
  }
  const token = generateToken(user);
  return { ok: true, token, user: { id: user.id, username: user.username, nombre_completo: user.nombre_completo, rol: user.rol } };
}

function isAuthorized(req) {
  const token = extractToken(req);
  if (!token) return false;
  return verifyToken(token) !== null;
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  const payload = verifyToken(token || '');
  if (!payload) {
    return res.status(401).json({ success: false, message: 'No autorizado. Token JWT inválido o expirado.' });
  }
  req.user = payload;
  next();
}

async function ensureDefaultAdmin() {
  const existing = await dbService.getAdminByUsername(DEFAULT_ADMIN.username);
  if (!existing) {
    await dbService.createAdmin({
      username: DEFAULT_ADMIN.username,
      password_hash: hashPassword(DEFAULT_ADMIN.password),
      nombre_completo: DEFAULT_ADMIN.nombre_completo,
      rol: 'admin'
    });
  }
}

module.exports = {
  login,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  isAuthorized,
  ensureDefaultAdmin,
  DEFAULT_ADMIN
};