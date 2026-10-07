import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen">
      <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-200">WU</div>
            <div>
              <div class="text-base font-bold tracking-tight text-slate-900">Places Directory</div>
              <div class="text-xs text-slate-500">Walailak University</div>
            </div>
          </a>
          <nav class="flex items-center gap-1 sm:gap-2">
            <a routerLink="/" routerLinkActive="!bg-orange-50 !text-orange-700" [routerLinkActiveOptions]="{ exact: true }" class="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">สำรวจอาคาร</a>
            <a routerLink="/map" routerLinkActive="!bg-orange-50 !text-orange-700" class="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">แผนที่</a>
            <a routerLink="/places/new" class="ml-1 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 sm:px-4">+ เพิ่มอาคาร</a>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <router-outlet />
      </main>

      <footer class="mt-10 border-t border-slate-200 bg-white">
        <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© WU Places Directory · Student project</span>
          <span>แผนที่ © <a class="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></span>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {}