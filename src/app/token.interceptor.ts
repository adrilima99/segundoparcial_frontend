// src/app/token.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import Swal from 'sweetalert2';
import { catchError, throwError, of, Observable, switchMap } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const modifiedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/login')) {
        authService.clearSession();

        return new Observable<HttpEvent<any>>((observer) => {
          Swal.fire({
            title: 'Sesión Expirada',
            text: 'Por favor, inicia sesión nuevamente.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then(() => {
            window.location.href = '/login';
            observer.error(error); // Termina el flujo
          });
        });
      }

      return throwError(() => error);
    })
  );
};
