import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api.config';
import { AuthService } from './auth.service';

/** แนบ token ของแอดมินไปกับทุกคำขอที่ส่งไป API ของเรา และพากลับไปหน้า login เมื่อ token หมดอายุ */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  const isOurApi = req.url.startsWith(API_URL);
  const isLogin = req.url === `${API_URL}/auth/login`;

  const outgoing = token && isOurApi && !isLogin ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && token && isOurApi && !isLogin) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url, expired: 1 } });
      }
      return throwError(() => err);
    })
  );
};
