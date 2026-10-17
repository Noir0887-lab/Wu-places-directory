import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'wu-theme';

/** สลับโหมดสว่าง/มืด: จำค่าที่ผู้ใช้เลือกไว้ ถ้ายังไม่เคยเลือกจะตามค่าของระบบปฏิบัติการ */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal<boolean>(this.initial());

  constructor() {
    effect(() => {
      const isDark = this.dark();
      document.documentElement.classList.toggle('dark', isDark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0b1120' : '#f97316');
    });
  }

  toggle(): void {
    const next = !this.dark();
    this.dark.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // ใช้ได้เฉพาะในหน้าต่างนี้
    }
  }

  private initial(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // ข้ามไปใช้ค่าของระบบ
    }
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
