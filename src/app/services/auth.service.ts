import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api.config';

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  username: string;
}

interface TokenClaims {
  exp?: number;
  username?: string;
}

const STORAGE_KEY = 'wu-admin-token';

/** อ่านข้อมูลในโทเคน JWT โดยไม่ตรวจลายเซ็น (ลายเซ็นตรวจที่ backend ทุกครั้งที่เรียก API) */
function readClaims(token: string): TokenClaims | null {
  try {
    const body = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenClaims;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenSignal = signal<string | null>(this.loadToken());
  /** true เมื่อมีโทเคนที่ยังไม่หมดอายุ (ใช้ซ่อน/แสดงปุ่มของแอดมิน) */
  readonly isAdmin = computed(() => !!this.tokenSignal());
  readonly username = computed(() => {
    const token = this.tokenSignal();
    return (token && readClaims(token)?.username) || '';
  });

  get token(): string | null {
    return this.tokenSignal();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { username, password }).pipe(
      tap((res) => this.setToken(res.accessToken))
    );
  }

  logout(): void {
    this.setToken(null);
  }

  private setToken(token: string | null): void {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // เบราว์เซอร์ปิดการเก็บข้อมูล: ล็อกอินได้เฉพาะในหน้าต่างนี้
    }
    this.tokenSignal.set(token);
  }

  private loadToken(): string | null {
    try {
      const token = localStorage.getItem(STORAGE_KEY);
      if (!token) return null;
      const exp = readClaims(token)?.exp;
      if (typeof exp !== 'number' || exp * 1000 <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }
}
