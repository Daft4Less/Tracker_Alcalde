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
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'No se pudo conectar con el servidor de administración.';
      }
    });
  }
}