import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen">
      <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-200 dark:shadow-orange-950/50">WU</div>
            <div>
              <div class="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Places Directory</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">Walailak University</div>
            </div>
          </a>
          <nav class="flex flex-wrap items-center gap-1 sm:gap-2">
            <a routerLink="/" routerLinkActive="!bg-orange-50 !text-orange-700 dark:!bg-orange-500/15 dark:!text-orange-300" [routerLinkActiveOptions]="{ exact: true }" class="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">สำรวจอาคาร</a>
            <a routerLink="/map" routerLinkActive="!bg-orange-50 !text-orange-700 dark:!bg-orange-500/15 dark:!text-orange-300" class="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">แผนที่</a>

            @if (auth.isAdmin()) {
              <a routerLink="/places/new" class="ml-1 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 sm:px-4">+ เพิ่มอาคาร</a>
              <span class="ml-1 hidden items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 md:inline-flex">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> แอดมิน{{ auth.username() ? ': ' + auth.username() : '' }}
              </span>
              <button type="button" (click)="logout()" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">ออกจากระบบ</button>
            } @else {
              <a routerLink="/login" routerLinkActive="!bg-orange-50 !text-orange-700 dark:!bg-orange-500/15 dark:!text-orange-300" class="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">สำหรับแอดมิน</a>
            }

            <button type="button" (click)="theme.toggle()" [attr.aria-label]="theme.dark() ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'" [attr.title]="theme.dark() ? 'โหมดสว่าง' : 'โหมดมืด'" class="ml-1 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              @if (theme.dark()) {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
              }
            </button>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <router-outlet />
      </main>

      <footer class="mt-10 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© WU Places Directory · Student project</span>
          <span>แผนที่ © <a class="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></span>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
