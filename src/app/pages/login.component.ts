import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="mx-auto mt-6 max-w-md rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-9">
      <p class="text-xs font-semibold uppercase tracking-[.2em] text-orange-600 dark:text-orange-400">Admin</p>
      <h1 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">เข้าสู่ระบบผู้ดูแล</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">เฉพาะผู้ดูแลระบบที่เพิ่ม แก้ไข หรือลบข้อมูลอาคารได้ ผู้เข้าชมทั่วไปดูข้อมูลได้โดยไม่ต้องเข้าสู่ระบบ</p>

      @if (expired) {
        <div class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง</div>
      }
      @if (error) {
        <div class="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200" role="alert">{{ error }}</div>
      }

      <form class="mt-6 space-y-5" (ngSubmit)="submit()" #loginForm="ngForm">
        <div>
          <label for="username" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">ชื่อผู้ใช้</label>
          <input id="username" name="username" required maxlength="50" autocomplete="username" [(ngModel)]="username" class="field">
        </div>
        <div>
          <label for="password" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">รหัสผ่าน</label>
          <input id="password" name="password" type="password" required maxlength="200" autocomplete="current-password" [(ngModel)]="password" class="field">
        </div>
        <button [disabled]="loginForm.invalid || loading" class="w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>
      </form>
      <a routerLink="/" class="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400">← กลับหน้าหลัก</a>
      <p class="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">หากเซิร์ฟเวอร์เพิ่งตื่นจากโหมดพัก การเข้าสู่ระบบครั้งแรกอาจใช้เวลาประมาณ 30–50 วินาที</p>
    </section>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  error = '';
  loading = false;
  readonly expired = this.route.snapshot.queryParamMap.get('expired') === '1';

  constructor() {
    // ล็อกอินอยู่แล้ว: ไม่ต้องกรอกซ้ำ
    if (this.auth.isAdmin()) void this.router.navigateByUrl(this.returnUrl());
  }

  submit(): void {
    if (!this.username.trim() || !this.password) return;
    this.error = '';
    this.loading = true;
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigateByUrl(this.returnUrl());
      },
      error: (err) => {
        this.loading = false;
        this.password = '';
        if (err.status === 0) this.error = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง';
        else this.error = this.messageOf(err) || 'เข้าสู่ระบบไม่สำเร็จ';
      }
    });
  }

  /** กลับไปหน้าที่ผู้ใช้ตั้งใจจะเข้า (เฉพาะเส้นทางภายในเว็บเท่านั้น ป้องกันการเด้งไปเว็บอื่น) */
  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login') ? url : '/';
  }

  private messageOf(err: { error?: { message?: string | string[] } }): string {
    const message = err.error?.message;
    return Array.isArray(message) ? message.join(' / ') : (message ?? '');
  }
}
