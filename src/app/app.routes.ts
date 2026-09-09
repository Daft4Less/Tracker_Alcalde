import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'promesas', pathMatch: 'full' },
  { 
    path: 'promesas', 
    loadComponent: () => import('./pages/vista1/vista1').then(m => m.Vista1Component) 
  },
  { 
    path: 'cuadrante/:id', 
    loadComponent: () => import('./pages/detalle-cuadrante/detalle-cuadrante').then(m => m.DetalleCuadranteComponent) 
  },
  { 
    path: 'vista2', 
    loadComponent: () => import('./pages/vista2/vista2').then(m => m.Vista2Component) 
  },
  { 
    path: 'agenda', 
    loadComponent: () => import('./pages/vista3/vista3').then(m => m.Vista3Component) 
  },
  { 
    path: 'nosotros', 
    loadComponent: () => import('./pages/vista4/vista4').then(m => m.Vista4Component) 
  },
  // Rutas secretas del panel de administración (no enlazadas en la UI pública)
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin').then(m => m.AdminComponent)
  },
  // Backward compatibility redirects
  { path: 'vista1', redirectTo: 'promesas', pathMatch: 'full' },
  { path: 'vista3', redirectTo: 'agenda', pathMatch: 'full' },
  { path: 'vista4', redirectTo: 'nosotros', pathMatch: 'full' },
  { path: '**', redirectTo: 'promesas' }
];
