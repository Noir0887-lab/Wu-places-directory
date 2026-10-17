import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlacesApiService } from '../services/places-api.service';
import { AuthService } from '../services/auth.service';
import { PLACE_TYPES, Place, PlaceImage, Room, placeImages } from '../models/place.model';

interface FloorGroup {
  floor: number;
  rooms: Room[];
}

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (place(); as p) {
      <a routerLink="/" class="text-sm font-medium text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400">← กลับไปหน้ารายการอาคาร</a>
      <div class="mt-5 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <!-- แกลเลอรีรูปภาพ -->
        <div>
          <div class="relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
            @if (currentImage(); as img) {
              <button type="button" class="block w-full cursor-zoom-in" (click)="lightbox.set(true)" aria-label="ดูรูปขยาย">
                <img [src]="img.url" [alt]="img.caption || p.name" class="h-72 w-full object-cover sm:h-[430px]">
              </button>
              @if (img.caption) {
                <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-5 pb-4 pt-10 text-sm text-white">{{ img.caption }}</div>
              }
              @if (images().length > 1) {
                <button type="button" (click)="step(-1)" class="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-slate-950/60 text-lg text-white hover:bg-slate-950/80" aria-label="รูปก่อนหน้า">‹</button>
                <button type="button" (click)="step(1)" class="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-slate-950/60 text-lg text-white hover:bg-slate-950/80" aria-label="รูปถัดไป">›</button>
                <span class="absolute right-3 top-3 rounded-lg bg-slate-950/70 px-2.5 py-1 text-xs text-white">{{ imageIndex() + 1 }} / {{ images().length }}</span>
              }
            } @else {
              <div class="grid h-72 place-items-center text-sm text-slate-400 dark:text-slate-500 sm:h-[430px]">ยังไม่มีรูปภาพของอาคารนี้</div>
            }
          </div>
          @if (images().length > 1) {
            <div class="mt-3 flex gap-2 overflow-x-auto pb-1">
              @for (img of images(); track $index) {
                <button type="button" (click)="imageIndex.set($index)" [attr.aria-label]="'ดูรูปที่ ' + ($index + 1)" class="h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition" [class]="$index === imageIndex() ? 'border-orange-500' : 'border-transparent opacity-70 hover:opacity-100'">
                  <img [src]="img.url" [alt]="img.caption || p.name" class="h-full w-full object-cover" loading="lazy">
                </button>
              }
            </div>
          }
        </div>

        <section class="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div class="flex flex-wrap gap-2"><span class="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">{{ p.code }}</span><span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ typeName(p.typeId) }}</span></div>
          <h1 class="mt-5 text-2xl font-semibold leading-relaxed text-slate-900 dark:text-slate-100 sm:text-3xl">{{ p.name }}</h1>
          <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">{{ p.description }}</p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><div class="text-xs text-slate-500 dark:text-slate-400">รหัสอาคาร</div><div class="mt-1 font-semibold text-slate-900 dark:text-slate-100">{{ p.code }}</div></div>
            <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><div class="text-xs text-slate-500 dark:text-slate-400">จำนวนชั้น</div><div class="mt-1 font-semibold text-slate-900 dark:text-slate-100">{{ p.floors ? p.floors + ' ชั้น' : 'ยังไม่มีข้อมูล' }}</div></div>
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <a [routerLink]="['/map']" class="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600">ดูแผนที่</a>
            @if (auth.isAdmin()) {
              <a [routerLink]="['/places', p.id, 'edit']" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">แก้ไขข้อมูล</a>
              <button (click)="deletePlace(p.id)" class="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10">ลบอาคาร</button>
            }
          </div>
          @if (actionError()) {
            <div class="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200" role="alert">{{ actionError() }}</div>
          }
        </section>
      </div>

      <!-- รายละเอียดภายในอาคาร -->
      <section class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[.2em] text-orange-600 dark:text-orange-400">Inside the building</p>
            <h2 class="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">รายละเอียดภายในอาคาร</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">ห้องและพื้นที่ใช้งานในแต่ละชั้น{{ rooms().length ? ' (ทั้งหมด ' + rooms().length + ' รายการ)' : '' }}</p>
          </div>
          @if (rooms().length > 5) {
            <input class="field sm:max-w-xs" placeholder="ค้นหาห้อง ชื่อ หรือรหัส..." [value]="roomQuery()" (input)="roomQuery.set($any($event.target).value)" aria-label="ค้นหาห้อง">
          }
        </div>

        @if (floorGroups().length) {
          <div class="mt-5 space-y-5">
            @for (group of floorGroups(); track group.floor) {
              <div>
                <h3 class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <span class="grid h-7 min-w-7 place-items-center rounded-lg bg-orange-500 px-2 text-xs font-bold text-white">{{ group.floor }}</span>
                  ชั้น {{ group.floor }}
                  <span class="text-xs font-normal text-slate-400">({{ group.rooms.length }})</span>
                </h3>
                <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  @for (room of group.rooms; track $index) {
                    <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div class="flex items-start justify-between gap-2">
                        <div class="font-medium leading-6 text-slate-900 dark:text-slate-100">{{ room.name }}</div>
                        @if (room.code) { <span class="shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{{ room.code }}</span> }
                      </div>
                      <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span class="rounded-md bg-orange-50 px-2 py-0.5 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">{{ room.category || 'อื่นๆ' }}</span>
                        @if (room.capacity) { <span class="text-slate-500 dark:text-slate-400">ความจุ {{ room.capacity }} คน</span> }
                      </div>
                      @if (room.description) { <p class="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ room.description }}</p> }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else if (rooms().length) {
          <div class="mt-5 rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">ไม่พบห้องที่ตรงกับ "{{ roomQuery() }}"</div>
        } @else {
          <div class="mt-5 rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">ยังไม่มีข้อมูลรายละเอียดภายในอาคารนี้</div>
        }
      </section>

      <!-- ดูรูปขยาย -->
      @if (lightbox() && currentImage(); as big) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4" role="dialog" aria-modal="true" aria-label="รูปขยาย" (click)="lightbox.set(false)">
          <img [src]="big.url" [alt]="big.caption || p.name" class="max-h-full max-w-full rounded-xl object-contain" (click)="$event.stopPropagation()">
          <button type="button" class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25" (click)="lightbox.set(false)" aria-label="ปิด">✕</button>
          @if (images().length > 1) {
            <button type="button" class="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25" (click)="step(-1); $event.stopPropagation()" aria-label="รูปก่อนหน้า">‹</button>
            <button type="button" class="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25" (click)="step(1); $event.stopPropagation()" aria-label="รูปถัดไป">›</button>
          }
        </div>
      }
    } @else if (notFound()) {
      <div class="rounded-2xl bg-white p-10 text-center dark:bg-slate-900"><h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">ไม่พบอาคารนี้</h1><a routerLink="/" class="mt-4 inline-block text-sm text-orange-600 dark:text-orange-400">กลับหน้าหลัก</a></div>
    } @else {
      <div class="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">กำลังโหลดข้อมูลอาคาร...</div>
    }
  `
})
export class PlaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PlacesApiService);
  readonly auth = inject(AuthService);

  readonly place = signal<Place | undefined>(undefined);
  readonly notFound = signal(false);
  readonly actionError = signal('');
  readonly imageIndex = signal(0);
  readonly lightbox = signal(false);
  readonly roomQuery = signal('');

  readonly images = computed<PlaceImage[]>(() => {
    const p = this.place();
    return p ? placeImages(p) : [];
  });
  readonly currentImage = computed<PlaceImage | undefined>(() => this.images()[this.imageIndex()]);
  readonly rooms = computed<Room[]>(() => this.place()?.rooms ?? []);

  /** ห้องทั้งหมดจัดกลุ่มตามชั้น (กรองตามคำค้นหา) */
  readonly floorGroups = computed<FloorGroup[]>(() => {
    const q = this.roomQuery().trim().toLocaleLowerCase();
    const byFloor = new Map<number, Room[]>();
    for (const room of this.rooms()) {
      if (q && !room.name.toLocaleLowerCase().includes(q) && !(room.code ?? '').toLocaleLowerCase().includes(q)) continue;
      byFloor.set(room.floor, [...(byFloor.get(room.floor) ?? []), room]);
    }
    return [...byFloor.entries()].sort((a, b) => a[0] - b[0]).map(([floor, rooms]) => ({ floor, rooms }));
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.notFound.set(true);
      return;
    }
    this.api.getById(id).subscribe({
      next: (data) => this.place.set(data),
      error: (err) => {
        console.error('Failed to get place details', err);
        this.notFound.set(true);
      }
    });
  }

  step(delta: number): void {
    const total = this.images().length;
    if (total < 2) return;
    this.imageIndex.set((this.imageIndex() + delta + total) % total);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.lightbox.set(false);
    else if (event.key === 'ArrowLeft') this.step(-1);
    else if (event.key === 'ArrowRight') this.step(1);
  }

  typeName(id: number): string { return PLACE_TYPES.find(t => t.id === id)?.name ?? 'ไม่ระบุประเภท'; }

  deletePlace(id: number): void {
    if (!confirm('ยืนยันลบข้อมูลอาคารนี้หรือไม่? (รูปภาพและรายละเอียดภายในอาคารจะถูกลบด้วย)')) return;
    this.actionError.set('');
    this.api.delete(id).subscribe({
      next: () => {
        void this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error('Failed to delete place', err);
        // 401 จะถูก interceptor พาไปหน้า login อยู่แล้ว
        if (err.status !== 401) this.actionError.set(err.error?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    });
  }
}
