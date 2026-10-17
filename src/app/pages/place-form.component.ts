import { Component, DoCheck, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MAX_IMAGES, PLACE_TYPES, PlaceImage, PlacePayload, PlaceType, ROOM_CATEGORIES, Room } from '../models/place.model';
import { PlacesApiService } from '../services/places-api.service';

const MAX_ROOMS = 500;

interface FormState {
  name: string;
  code: string;
  typeId: number;
  description: string;
  floors: number | null;
  latitude: number | null;
  longitude: number | null;
}

/** ห้องในฟอร์ม: ช่องตัวเลขอาจว่างได้ระหว่างพิมพ์ */
interface RoomRow {
  floor: number | null;
  name: string;
  code: string;
  category: string;
  capacity: number | null;
  description: string;
}

type ErrorMap = Record<string, string>;

const isBlank = (value: unknown): boolean => value === null || value === undefined || value === '';
const isIntInRange = (value: unknown, min: number, max: number): boolean => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/" class="text-sm font-medium text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400">← กลับไปหน้ารายการอาคาร</a>
    <section class="mx-auto mt-5 max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-9">
      <p class="text-xs font-semibold uppercase tracking-[.2em] text-orange-600 dark:text-orange-400">Place management</p>
      <h1 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ editing ? 'แก้ไขข้อมูลอาคาร' : 'เพิ่มอาคารใหม่' }}</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">กรอกข้อมูลที่จำเป็นให้ครบถ้วน ช่องที่มี * จำเป็นต้องกรอก</p>

      @if (loadingData) {
        <div class="mt-6 text-sm text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลอาคาร...</div>
      } @else {
        @if (serverErrors.length) {
          <div class="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200" role="alert">
            <div class="font-semibold">บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูล:</div>
            <ul class="mt-1 list-disc space-y-0.5 pl-5">
              @for (message of serverErrors; track $index) { <li>{{ message }}</li> }
            </ul>
          </div>
        }

        <form class="mt-7 space-y-8" (ngSubmit)="save()" novalidate>
          <!-- ข้อมูลทั่วไป -->
          <div class="space-y-5">
            <div>
              <label for="name" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">ชื่ออาคาร *</label>
              <input id="name" name="name" [(ngModel)]="form.name" (blur)="touch('name')" class="field" [class.invalid]="show('name')" placeholder="เช่น อาคารเรียนรวม 1" maxlength="200">
              @if (show('name')) { <p class="error">{{ errors()['name'] }}</p> }
            </div>
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label for="code" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">รหัสอาคาร *</label>
                <input id="code" name="code" [(ngModel)]="form.code" (blur)="touch('code')" class="field uppercase" [class.invalid]="show('code')" placeholder="เช่น RB1" maxlength="30">
                @if (show('code')) { <p class="error">{{ errors()['code'] }}</p> }
              </div>
              <div>
                <label for="typeId" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">ประเภทอาคาร *</label>
                <select id="typeId" name="typeId" [(ngModel)]="form.typeId" (blur)="touch('typeId')" class="field" [class.invalid]="show('typeId')">
                  <option [ngValue]="0" disabled>เลือกประเภท</option>
                  @for (type of types; track type.id) { <option [ngValue]="type.id">{{ type.name }}</option> }
                </select>
                @if (show('typeId')) { <p class="error">{{ errors()['typeId'] }}</p> }
              </div>
            </div>
            <div>
              <label for="description" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">คำอธิบาย</label>
              <textarea id="description" name="description" [(ngModel)]="form.description" (blur)="touch('description')" rows="3" class="field" [class.invalid]="show('description')" placeholder="รายละเอียดเบื้องต้นของอาคาร"></textarea>
              <p class="mt-1 text-right text-xs text-slate-400 dark:text-slate-500">{{ form.description.length }} / 2000</p>
              @if (show('description')) { <p class="error">{{ errors()['description'] }}</p> }
            </div>
            <div class="grid gap-5 sm:grid-cols-3">
              <div>
                <label for="floors" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">จำนวนชั้น</label>
                <input id="floors" name="floors" type="number" [(ngModel)]="form.floors" (blur)="touch('floors')" class="field" [class.invalid]="show('floors')" placeholder="เช่น 4">
                @if (show('floors')) { <p class="error">{{ errors()['floors'] }}</p> }
              </div>
              <div>
                <label for="latitude" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Latitude *</label>
                <input id="latitude" name="latitude" type="number" step="any" [(ngModel)]="form.latitude" (blur)="touch('latitude')" class="field" [class.invalid]="show('latitude')">
                @if (show('latitude')) { <p class="error">{{ errors()['latitude'] }}</p> }
              </div>
              <div>
                <label for="longitude" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Longitude *</label>
                <input id="longitude" name="longitude" type="number" step="any" [(ngModel)]="form.longitude" (blur)="touch('longitude')" class="field" [class.invalid]="show('longitude')">
                @if (show('longitude')) { <p class="error">{{ errors()['longitude'] }}</p> }
              </div>
            </div>
          </div>

          <!-- รูปภาพ -->
          <div class="border-t border-slate-100 pt-7 dark:border-slate-800">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">รูปภาพอาคาร</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">เพิ่มได้สูงสุด {{ maxImages }} รูป · รูปแรกจะเป็นรูปปกของอาคาร ({{ images.length }}/{{ maxImages }})</p>
              </div>
              <button type="button" (click)="addImage()" [disabled]="images.length >= maxImages" class="rounded-xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-orange-500/50 dark:text-orange-300 dark:hover:bg-orange-500/10">+ เพิ่มรูป</button>
            </div>

            @if (!images.length) {
              <div class="mt-4 rounded-2xl border border-dashed border-slate-300 px-6 py-7 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">ยังไม่มีรูปภาพ กด "+ เพิ่มรูป" เพื่อใส่ URL รูป</div>
            }
            <div class="mt-4 space-y-3">
              @for (image of images; track image; let i = $index) {
                <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700 sm:flex-row">
                  <div class="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:w-36">
                    @if (previewOk(image.url)) {
                      <img [src]="image.url.trim()" [alt]="'ตัวอย่างรูปที่ ' + (i + 1)" class="h-full w-full object-cover" loading="lazy">
                    } @else {
                      <div class="grid h-full place-items-center text-xs text-slate-400 dark:text-slate-500">ตัวอย่างรูป</div>
                    }
                  </div>
                  <div class="min-w-0 flex-1 space-y-2">
                    <div>
                      <input [name]="'imageUrl' + i" [ngModelOptions]="{standalone: true}" [(ngModel)]="image.url" (blur)="touch('image' + i)" class="field" [class.invalid]="show('image' + i)" placeholder="https://..." [attr.aria-label]="'URL รูปที่ ' + (i + 1)">
                      @if (show('image' + i)) { <p class="error">{{ errors()['image' + i] }}</p> }
                    </div>
                    <div>
                      <input [name]="'imageCaption' + i" [ngModelOptions]="{standalone: true}" [(ngModel)]="image.caption" (blur)="touch('imageCaption' + i)" class="field" [class.invalid]="show('imageCaption' + i)" placeholder="คำบรรยายรูป (ไม่บังคับ)" maxlength="200" [attr.aria-label]="'คำบรรยายรูปที่ ' + (i + 1)">
                      @if (show('imageCaption' + i)) { <p class="error">{{ errors()['imageCaption' + i] }}</p> }
                    </div>
                  </div>
                  <div class="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-between">
                    @if (i === 0) { <span class="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">รูปปก</span> } @else { <span></span> }
                    <div class="flex gap-1">
                      <button type="button" (click)="moveImage(i, -1)" [disabled]="i === 0" class="icon-btn" aria-label="ย้ายขึ้น">↑</button>
                      <button type="button" (click)="moveImage(i, 1)" [disabled]="i === images.length - 1" class="icon-btn" aria-label="ย้ายลง">↓</button>
                      <button type="button" (click)="removeImage(i)" class="icon-btn !text-red-600 dark:!text-red-300" aria-label="ลบรูปนี้">✕</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- รายละเอียดภายในอาคาร -->
          <div class="border-t border-slate-100 pt-7 dark:border-slate-800">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">รายละเอียดภายในอาคาร</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">ห้องและพื้นที่ใช้งานในแต่ละชั้น ({{ rooms.length }} รายการ){{ form.floors ? ' · อาคารนี้มี ' + form.floors + ' ชั้น' : '' }}</p>
              </div>
              <button type="button" (click)="addRoom()" [disabled]="rooms.length >= maxRooms" class="rounded-xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-orange-500/50 dark:text-orange-300 dark:hover:bg-orange-500/10">+ เพิ่มห้อง</button>
            </div>

            @if (!rooms.length) {
              <div class="mt-4 rounded-2xl border border-dashed border-slate-300 px-6 py-7 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">ยังไม่มีข้อมูลห้อง กด "+ เพิ่มห้อง" เพื่อเริ่มกรอก</div>
            }
            <div class="mt-4 space-y-3">
              @for (room of rooms; track room; let i = $index) {
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">ห้องที่ {{ i + 1 }}</span>
                    <button type="button" (click)="removeRoom(i)" class="text-sm font-medium text-red-600 hover:underline dark:text-red-300">ลบห้องนี้</button>
                  </div>
                  <div class="mt-3 grid gap-3 sm:grid-cols-6">
                    <div class="sm:col-span-1">
                      <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400" [attr.for]="'roomFloor' + i">ชั้น *</label>
                      <input [id]="'roomFloor' + i" [name]="'roomFloor' + i" type="number" [ngModelOptions]="{standalone: true}" [(ngModel)]="room.floor" (blur)="touch('room' + i + 'floor')" class="field" [class.invalid]="show('room' + i + 'floor')">
                    </div>
                    <div class="sm:col-span-3">
                      <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400" [attr.for]="'roomName' + i">ชื่อห้อง/พื้นที่ *</label>
                      <input [id]="'roomName' + i" [name]="'roomName' + i" [ngModelOptions]="{standalone: true}" [(ngModel)]="room.name" (blur)="touch('room' + i + 'name')" class="field" [class.invalid]="show('room' + i + 'name')" placeholder="เช่น ห้องบรรยาย 1" maxlength="150">
                    </div>
                    <div class="sm:col-span-2">
                      <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400" [attr.for]="'roomCode' + i">รหัสห้อง</label>
                      <input [id]="'roomCode' + i" [name]="'roomCode' + i" [ngModelOptions]="{standalone: true}" [(ngModel)]="room.code" (blur)="touch('room' + i + 'code')" class="field" [class.invalid]="show('room' + i + 'code')" placeholder="เช่น RB1-201" maxlength="30">
                    </div>
                    <div class="sm:col-span-3">
                      <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400" [attr.for]="'roomCategory' + i">ประเภท</label>
                      <select [id]="'roomCategory' + i" [name]="'roomCategory' + i" [ngModelOptions]="{standalone: true}" [(ngModel)]="room.category" class="field">
                        @for (category of categories; track category) { <option [ngValue]="category">{{ category }}</option> }
                      </select>
                    </div>
                    <div class="sm:col-span-3">
                      <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400" [attr.for]="'roomCapacity' + i">ความจุ (คน)</label>
                      <input [id]="'roomCapacity' + i" [name]="'roomCapacity' + i" type="number" [ngModelOptions]="{standalone: true}" [(ngModel)]="room.capacity" (blur)="touch('room' + i + 'capacity')" class="field" [class.invalid]="show('room' + i + 'capacity')" placeholder="ไม่บังคับ">
                    </div>
                    <div class="sm:col-span-6">
                      <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400" [attr.for]="'roomDesc' + i">รายละเอียดเพิ่มเติม</label>
                      <input [id]="'roomDesc' + i" [name]="'roomDesc' + i" [ngModelOptions]="{standalone: true}" [(ngModel)]="room.description" (blur)="touch('room' + i + 'description')" class="field" [class.invalid]="show('room' + i + 'description')" placeholder="เช่น มีเครื่องฉายโปรเจกเตอร์ ปลั๊กไฟทุกที่นั่ง" maxlength="1000">
                    </div>
                  </div>
                  @for (key of roomErrorKeys(i); track key) {
                    @if (show(key)) { <p class="error">{{ errors()[key] }}</p> }
                  }
                </div>
              }
            </div>
          </div>

          @if (submitted && errorCount() > 0) {
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200" role="alert">
              ยังมีข้อมูลที่ไม่ถูกต้อง {{ errorCount() }} จุด กรุณาแก้ไขช่องที่ขึ้นสีแดงก่อนบันทึก
            </div>
          }

          <div class="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
            <a routerLink="/" class="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">ยกเลิก</a>
            <button [disabled]="loading" class="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
              {{ loading ? 'กำลังบันทึก...' : (editing ? 'บันทึกการแก้ไข' : 'เพิ่มอาคาร') }}
            </button>
          </div>
        </form>
      }
    </section>
  `,
  styles: [`
    .icon-btn { display:grid; place-items:center; width:34px; height:34px; border-radius:10px; border:1px solid #e2e8f0; font-size:14px; color:#475569; background:transparent; cursor:pointer; }
    .icon-btn:hover:not(:disabled) { background:#f1f5f9; }
    .icon-btn:disabled { opacity:.35; cursor:not-allowed; }
    :host-context(.dark) .icon-btn { border-color:#334155; color:#cbd5e1; }
    :host-context(.dark) .icon-btn:hover:not(:disabled) { background:#1e293b; }
  `]
})
export class PlaceFormComponent implements OnInit, DoCheck {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PlacesApiService);

  types: PlaceType[] = PLACE_TYPES;
  readonly categories = ROOM_CATEGORIES;
  readonly maxImages = MAX_IMAGES;
  readonly maxRooms = MAX_ROOMS;

  private id = Number(this.route.snapshot.paramMap.get('id'));
  readonly editing = this.route.snapshot.routeConfig?.path === 'places/:id/edit';

  loading = false;
  loadingData = false;
  submitted = false;
  serverErrors: string[] = [];
  private touched = new Set<string>();
  private errorMap: ErrorMap = {};

  form: FormState = { name: '', code: '', typeId: 0, description: '', floors: null, latitude: 8.6426, longitude: 99.8972 };
  images: { url: string; caption: string }[] = [];
  rooms: RoomRow[] = [];

  ngOnInit(): void {
    this.api.getTypes().subscribe({
      next: (types) => { if (types.length) this.types = types; },
      error: () => { /* ใช้รายการประเภทที่มีในแอปแทน */ }
    });

    if (this.editing && this.id) {
      this.loadingData = true;
      this.api.getById(this.id).subscribe({
        next: (existing) => {
          this.form = {
            name: existing.name,
            code: existing.code,
            typeId: existing.typeId,
            description: existing.description ?? '',
            floors: existing.floors ?? null,
            latitude: existing.latitude,
            longitude: existing.longitude
          };
          const gallery: PlaceImage[] = existing.images?.length ? existing.images : (existing.imageUrl ? [{ url: existing.imageUrl }] : []);
          this.images = gallery.map((image) => ({ url: image.url, caption: image.caption ?? '' }));
          this.rooms = (existing.rooms ?? []).map((room: Room) => ({
            floor: room.floor,
            name: room.name,
            code: room.code ?? '',
            category: room.category ?? ROOM_CATEGORIES[0],
            capacity: room.capacity ?? null,
            description: room.description ?? ''
          }));
          this.loadingData = false;
        },
        error: () => {
          this.loadingData = false;
          this.serverErrors = ['ไม่พบข้อมูลอาคารที่ต้องการแก้ไข'];
        }
      });
    }
  }

  // ---------- รูปภาพ ----------
  addImage(): void {
    if (this.images.length < MAX_IMAGES) this.images = [...this.images, { url: '', caption: '' }];
  }

  removeImage(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
    this.resetTouched('image');
  }

  moveImage(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.images.length) return;
    const next = [...this.images];
    [next[index], next[target]] = [next[target], next[index]];
    this.images = next;
    this.resetTouched('image');
  }

  previewOk(url: string): boolean {
    return isHttpUrl((url ?? '').trim());
  }

  // ---------- ห้อง ----------
  addRoom(): void {
    if (this.rooms.length >= MAX_ROOMS) return;
    const last = this.rooms[this.rooms.length - 1];
    this.rooms = [...this.rooms, { floor: last?.floor ?? 1, name: '', code: '', category: last?.category ?? ROOM_CATEGORIES[0], capacity: null, description: '' }];
  }

  removeRoom(index: number): void {
    this.rooms = this.rooms.filter((_, i) => i !== index);
    this.resetTouched('room');
  }

  /** ลบ/ย้ายรายการ ทำให้ลำดับเปลี่ยน จึงล้างสถานะ "เคยแตะ" ของรายการเหล่านั้น ป้องกันข้อผิดพลาดแสดงผิดแถว */
  private resetTouched(prefix: string): void {
    this.touched = new Set([...this.touched].filter((key) => !key.startsWith(prefix)));
  }

  // ---------- การตรวจสอบข้อมูล (ต้องสอดคล้องกับ DTO ใน backend) ----------
  touch(key: string): void {
    this.touched.add(key);
  }

  show(key: string): boolean {
    return !!this.errors()[key] && (this.submitted || this.touched.has(key));
  }

  errorCount(): number {
    return Object.keys(this.errors()).length;
  }

  roomErrorKeys(index: number): string[] {
    return ['floor', 'name', 'code', 'capacity', 'description'].map((field) => `room${index}${field}`);
  }

  /** ผลการตรวจล่าสุด: คำนวณครั้งเดียวต่อรอบ change detection (ngDoCheck) แล้วให้ template อ่านซ้ำได้ฟรี */
  errors(): ErrorMap {
    return this.errorMap;
  }

  ngDoCheck(): void {
    this.errorMap = this.computeErrors();
  }

  private computeErrors(): ErrorMap {
    const e: ErrorMap = {};
    const f = this.form;
    const name = f.name.trim();
    const code = f.code.trim();

    if (name.length < 2 || name.length > 200) e['name'] = 'ชื่ออาคารต้องมี 2-200 ตัวอักษร';
    if (!code) e['code'] = 'กรุณากรอกรหัสอาคาร';
    else if (code.length > 30) e['code'] = 'รหัสอาคารต้องมี 1-30 ตัวอักษร';
    else if (!/^[A-Za-z0-9-]+$/.test(code)) e['code'] = 'รหัสอาคารใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย - เท่านั้น';
    if (!f.typeId) e['typeId'] = 'กรุณาเลือกประเภทอาคาร';
    if (f.description.trim().length > 2000) e['description'] = 'คำอธิบายยาวเกิน 2,000 ตัวอักษร';

    if (!isBlank(f.floors) && !isIntInRange(f.floors, 1, 100)) e['floors'] = 'จำนวนชั้นต้องเป็นจำนวนเต็ม 1-100';
    if (typeof f.latitude !== 'number' || Number.isNaN(f.latitude)) e['latitude'] = 'กรุณาระบุละติจูดเป็นตัวเลข';
    else if (f.latitude < -90 || f.latitude > 90) e['latitude'] = 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90';
    if (typeof f.longitude !== 'number' || Number.isNaN(f.longitude)) e['longitude'] = 'กรุณาระบุลองจิจูดเป็นตัวเลข';
    else if (f.longitude < -180 || f.longitude > 180) e['longitude'] = 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180';

    const seenUrls = new Set<string>();
    this.images.forEach((image, i) => {
      const url = (image.url ?? '').trim();
      if (!url) e['image' + i] = `รูปที่ ${i + 1}: กรุณาใส่ URL หรือลบรูปนี้`;
      else if (!isHttpUrl(url)) e['image' + i] = `รูปที่ ${i + 1}: URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)`;
      else if (seenUrls.has(url.toLowerCase())) e['image' + i] = `รูปที่ ${i + 1}: URL ซ้ำกับรูปก่อนหน้า`;
      seenUrls.add(url.toLowerCase());
      if ((image.caption ?? '').trim().length > 200) e['imageCaption' + i] = `รูปที่ ${i + 1}: คำบรรยายยาวเกิน 200 ตัวอักษร`;
    });

    const floorLimit = isIntInRange(f.floors, 1, 100) ? (f.floors as number) : null;
    const seenCodes = new Set<string>();
    this.rooms.forEach((room, i) => {
      const label = `ห้องที่ ${i + 1}`;
      const roomName = (room.name ?? '').trim();
      const roomCode = (room.code ?? '').trim();
      if (!isIntInRange(room.floor, 1, 100)) e[`room${i}floor`] = `${label}: ชั้นต้องเป็นจำนวนเต็ม 1-100`;
      else if (floorLimit && (room.floor as number) > floorLimit) e[`room${i}floor`] = `${label}: อยู่ชั้น ${room.floor} แต่อาคารมีเพียง ${floorLimit} ชั้น`;
      if (!roomName || roomName.length > 150) e[`room${i}name`] = `${label}: กรุณากรอกชื่อห้อง (ไม่เกิน 150 ตัวอักษร)`;
      if (roomCode.length > 30) e[`room${i}code`] = `${label}: รหัสห้องยาวเกิน 30 ตัวอักษร`;
      else if (roomCode) {
        if (seenCodes.has(roomCode.toLowerCase())) e[`room${i}code`] = `${label}: รหัสห้อง "${roomCode}" ซ้ำกับห้องอื่นในอาคารเดียวกัน`;
        seenCodes.add(roomCode.toLowerCase());
      }
      if (!isBlank(room.capacity) && !isIntInRange(room.capacity, 1, 10000)) e[`room${i}capacity`] = `${label}: ความจุต้องเป็นจำนวนเต็ม 1-10,000`;
      if ((room.description ?? '').trim().length > 1000) e[`room${i}description`] = `${label}: รายละเอียดยาวเกิน 1,000 ตัวอักษร`;
    });

    return e;
  }

  // ---------- บันทึก ----------
  save(): void {
    this.submitted = true;
    this.serverErrors = [];
    this.errorMap = this.computeErrors();
    if (this.errorCount() > 0) {
      // เลื่อนไปที่ช่องแรกที่ผิด เพื่อให้เห็นว่าต้องแก้ตรงไหน
      setTimeout(() => document.querySelector<HTMLElement>('.field.invalid')?.focus());
      return;
    }

    const f = this.form;
    const payload: PlacePayload = {
      name: f.name.trim(),
      code: f.code.trim().toUpperCase(),
      typeId: f.typeId,
      description: f.description.trim(),
      // รูปแรก = รูปปก (backend อัปเดต imageUrl ให้ตามรูปแรกเอง)
      imageUrl: this.images[0]?.url.trim() ?? '',
      latitude: f.latitude as number,
      longitude: f.longitude as number,
      floors: isBlank(f.floors) ? null : f.floors,
      images: this.images.map((image) => ({ url: image.url.trim(), caption: image.caption.trim() })),
      rooms: this.rooms.map((room) => ({
        floor: room.floor as number,
        name: room.name.trim(),
        code: room.code.trim(),
        category: room.category,
        capacity: isBlank(room.capacity) ? null : room.capacity,
        description: room.description.trim()
      }))
    };

    this.loading = true;
    const request = this.editing ? this.api.update(this.id, payload) : this.api.create(payload);
    request.subscribe({
      next: (saved) => {
        this.loading = false;
        void this.router.navigateByUrl(this.editing ? `/places/${this.id}` : `/places/${saved.id}`);
      },
      error: (err) => {
        this.loading = false;
        // 401 จะถูก interceptor พาไปหน้า login อยู่แล้ว
        if (err.status === 401) return;
        this.serverErrors = this.messagesOf(err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  private messagesOf(err: { status?: number; error?: { message?: string | string[] } }): string[] {
    if (err.status === 0) return ['เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง (หากเซิร์ฟเวอร์เพิ่งตื่น อาจต้องรอ 30–50 วินาที)'];
    const message = err.error?.message;
    if (Array.isArray(message)) return message;
    if (message) return [message];
    return [this.editing ? 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' : 'เกิดข้อผิดพลาดในการสร้างอาคาร'];
  }
}
