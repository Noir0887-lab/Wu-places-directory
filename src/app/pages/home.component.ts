import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlacesApiService } from '../services/places-api.service';
import { PLACE_TYPES, Place } from '../models/place.model';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-9 text-white sm:px-10 sm:py-12">
      <div class="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl"></div>
      <div class="absolute bottom-0 right-24 h-36 w-36 rounded-full bg-amber-300/10 blur-2xl"></div>
      <div class="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-orange-100">
            <span class="h-2 w-2 rounded-full bg-orange-400"></span> WALAILAK UNIVERSITY
          </div>
          <h1 class="max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">ค้นหาอาคารเรียน<br><span class="text-orange-400">ได้ง่ายในที่เดียว</span></h1>
          <p class="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">สำรวจอาคารเรียนรวม อาคารเรียน และอาคารปฏิบัติการ พร้อมค้นหาข้อมูลและดูตำแหน่งบนแผนที่</p>
          <div class="mt-7 flex flex-wrap gap-3">
            <a routerLink="/map" class="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400">เปิดแผนที่อาคาร ↗</a>
            <a href="#places" class="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">ดูอาคารทั้งหมด</a>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
            <div class="text-3xl font-semibold">{{ allPlaces().length }}</div><div class="mt-1 text-sm text-slate-300">อาคารในรายการ</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
            <div class="text-3xl font-semibold">{{ types.length }}</div><div class="mt-1 text-sm text-slate-300">ประเภทอาคาร</div>
          </div>
          <div class="col-span-2 rounded-2xl border border-white/10 bg-white/[0.07] p-5">
            <div class="flex items-center justify-between gap-3"><div><div class="text-sm font-medium">WU Campus Guide</div><div class="mt-1 text-xs text-slate-300">ค้นหา • สำรวจ • นำทาง</div></div><div class="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500 text-2xl">⌖</div></div>
          </div>
        </div>
      </div>
    </section>

    <section id="places" class="mt-9">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p class="text-xs font-semibold uppercase tracking-[.2em] text-orange-600">Explore campus</p><h2 class="mt-1 text-2xl font-semibold text-slate-900">สำรวจอาคาร</h2><p class="mt-1 text-sm text-slate-500">ค้นหาอาคารตามชื่อ รหัส หรือประเภท</p></div>
        <div class="text-sm text-slate-500">พบ <span class="font-semibold text-slate-900">{{ filteredPlaces().length }}</span> รายการ</div>
      </div>

      <div class="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_230px_auto]">
        <label class="relative block">
          <span class="sr-only">ค้นหาอาคาร</span>
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
          <input class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="ค้นหาชื่ออาคารหรือรหัส เช่น RB1..." [value]="query()" (input)="query.set($any($event.target).value)">
        </label>
        <select class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-orange-400" [value]="typeFilter()" (change)="typeFilter.set(+$any($event.target).value)">
          <option value="0">ทุกประเภทอาคาร</option>
          @for (type of types; track type.id) { <option [value]="type.id">{{ type.name }}</option> }
        </select>
        <button class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50" (click)="clearFilters()">ล้างตัวกรอง</button>
      </div>

      @if (filteredPlaces().length) {
        <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (place of filteredPlaces(); track place.id) {
            <article class="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
              <a [routerLink]="['/places', place.id]" class="relative block h-48 overflow-hidden bg-slate-100">
                <img [src]="place.imageUrl" [alt]="place.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy">
                <span class="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700">{{ place.code }}</span>
                <span class="absolute bottom-3 left-3 rounded-lg bg-slate-950/75 px-2.5 py-1 text-xs text-white">{{ typeName(place.typeId) }}</span>
              </a>
              <div class="p-5">
                <a [routerLink]="['/places', place.id]" class="line-clamp-2 min-h-14 text-lg font-semibold leading-7 text-slate-900 hover:text-orange-600">{{ place.name }}</a>
                <p class="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{{ place.description }}</p>
                <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span class="text-xs text-slate-500">รหัส {{ place.code }}</span>
                  <a [routerLink]="['/places', place.id]" class="text-sm font-semibold text-orange-600 hover:text-orange-700">ดูรายละเอียด <span aria-hidden="true">→</span></a>
                </div>
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div class="text-3xl">⌕</div><h3 class="mt-3 font-semibold">ไม่พบอาคารที่ตรงกับการค้นหา</h3><p class="mt-1 text-sm text-slate-500">ลองเปลี่ยนคำค้นหาหรือเลือกประเภทอื่น</p>
          <button class="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white" (click)="clearFilters()">ล้างตัวกรอง</button>
        </div>
      }
    </section>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(PlacesApiService);
  readonly types = PLACE_TYPES;
  readonly query = signal('');
  readonly typeFilter = signal(0);
  readonly allPlaces = signal<Place[]>([]);

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.api.getAll().subscribe({
      next: (places) => this.allPlaces.set(places),
      error: (err) => console.error('Failed to load places', err)
    });
  }

  readonly filteredPlaces = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const typeId = this.typeFilter();
    return this.allPlaces().filter(place =>
      (!q || place.name.toLocaleLowerCase().includes(q) || place.code.toLocaleLowerCase().includes(q)) &&
      (!typeId || place.typeId === typeId)
    );
  });

  typeName(id: number): string { return this.types.find(t => t.id === id)?.name ?? 'ไม่ระบุประเภท'; }
  clearFilters(): void { this.query.set(''); this.typeFilter.set(0); }
}