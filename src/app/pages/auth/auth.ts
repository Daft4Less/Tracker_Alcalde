import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  ngOnInit() {
    if (this.auth.hasValidToken()) {
      this.router.navigate(['/admin']);
    }
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Ingresa usuario y contraseña.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.username, this.password).subscribe({
      next: res => {
        if (res.success && res.token && res.user) {
          this.auth.setSession(res.token, res.user);
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = res.message || 'Error al iniciar sesión.';
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Permite ingreso con admin / admin123 en el demo estático de GitHub Pages cuando la API backend esté offline
        if (this.username === 'admin' && this.password === 'admin123') {
          const mockPayload = btoa(JSON.stringify({ username: 'admin', rol: 'admin', exp: Math.floor(Date.now() / 1000) + 86400 }));
          const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockPayload}.demoSignature`;
          this.auth.setSession(mockToken, { id: 1, username: 'admin', nombre_completo: 'Administrador del Sistema', rol: 'admin' });
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        }
      }
    });
  }
}