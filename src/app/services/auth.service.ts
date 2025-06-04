import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'accessToken';
  private roleKey = 'userRole';
  private userIdKey = 'userId';

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId(): number | null {
    const userId = localStorage.getItem(this.userIdKey);
    return userId ? parseInt(userId, 10) : null;
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
  }

  /**
   * Guarda token, rol y ID del usuario en localStorage
   */
  setSession(token: string, role: string, userId: number): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    localStorage.setItem(this.userIdKey, userId.toString());
  }

  debugSession(): void {
    console.log('🔑 Token:', this.getToken());
    console.log('🎭 Rol:', this.getRole());
    console.log('🆔 Usuario ID:', this.getUserId());
  }

  /**
   * Hace una petición al backend para obtener los datos del usuario logueado
   */
  fetchUserInfo(): Observable<any> {
    const userId = this.getUserId();
    const token = this.getToken();

    if (!userId) {
      Swal.fire('Error', 'Usuario no identificado', 'error');
      throw new Error('Usuario no identificado');
    }

    if (!token) {
      Swal.fire('Error', 'Token no encontrado', 'error');
      throw new Error('Token no encontrado');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`http://localhost:8000/api/usuarios/${userId}/`, { headers }).pipe(
      map((response) => response),
      catchError((error) => {
        if (error.status === 401) {
          this.clearSession();
          Swal.fire({
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/login';
            }
          });
        }
        return throwError(() => error);
      })
    );
  }
}
