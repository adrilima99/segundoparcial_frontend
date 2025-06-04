import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // Asegúrate de importar AuthService
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,
// TODO: `HttpClientModule` should not be imported into a component directly.
// Please refactor the code to add `provideHttpClient()` call to the provider list in the
// application bootstrap logic and remove the `HttpClientModule` import from this component.
HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string | null = null;
  showPassword: boolean = false;
  toastMessage: string | null = null;
  toastClass: string = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  showToast(message: string, type: string) {
    this.toastMessage = message;
    this.toastClass = type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
    setTimeout(() => {
      this.toastMessage = null;
      if (type === 'success') {
        this.router.navigate(['/dashboard']);
      }
    }, 2000);
  }

  onSubmit() {
    const credentials = {
      email: this.email, // 🔄 Cambio: ahora se envía `email` en lugar de `username`
      password: this.password
    };
    this.http.post<any>('http://localhost:8000/api/login/', credentials).subscribe(
      response => {
        if (response.access && response.user_data) {
          const token = response.access;
          const rol = response.user_data.role;
          const id = response.user_data.id;
          this.authService.setSession(token, rol, id);
          this.authService.debugSession();

          this.showToast('Usuario loggeado con éxito', 'success');
        } else {
          this.showToast('Respuesta inesperada del servidor.', 'error');
        }
      },
      error => {
        const msg = error.error?.error || 'Error en el login.';
        this.showToast(msg, 'error');
      }
    );


  }
}
