import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PLACE_TYPES, Place } from '../models/place.model';
import { PlacesApiService } from '../services/places-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <a routerLink="/" class="text-sm font-medium text-slate-500 hover:text-orange-600">← กลับไปหน้ารายการอาคาร</a>
    <section class="mx-auto mt-5 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">
      <p class="text-xs font-semibold uppercase tracking-[.2em] text-orange-600">Place management</p>
      <h1 class="mt-2 text-2xl font-semibold">{{ editing ? 'แก้ไขข้อมูลอาคาร' : 'เพิ่มอาคารใหม่' }}</h1>
      <p class="mt-2 text-sm text-slate-500">กรอกข้อมูลที่จำเป็นให้ครบถ้วน ช่องที่มี * จำเป็นต้องกรอก</p>
      @if (error) { <div class="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</div> }
      <form class="mt-7 space-y-5" (ngSubmit)="save()" #placeForm="ngForm">
        <div><label class="mb-2 block text-sm font-medium">ชื่ออาคาร *</label><input name="name" required minlength="2" [(ngModel)]="form.name" #name="ngModel" class="field" placeholder="เช่น อาคารเรียนรวม 1"><p class="error" *ngIf="name.invalid && name.touched">กรุณากรอกชื่ออาคารอย่างน้อย 2 ตัวอักษร</p></div>
        <div class="grid gap-5 sm:grid-cols-2">
          <div><label class="mb-2 block text-sm font-medium">รหัสอาคาร *</label><input name="code" required pattern="[A-Za-z0-9-]+" [(ngModel)]="form.code" #code="ngModel" class="field uppercase" placeholder="เช่น RB1"><p class="error" *ngIf="code.invalid && code.touched">ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ - เท่านั้น</p></div>
          <div><label class="mb-2 block text-sm font-medium">ประเภทอาคาร *</label><select name="typeId" required [(ngModel)]="form.typeId" class="field"><option [ngValue]="0" disabled>เลือกประเภท</option>@for (type of types; track type.id) {<option [ngValue]="type.id">{{ type.name }}</option>}</select></div>
        </div>
        <div><label class="mb-2 block text-sm font-medium">คำอธิบาย</label><textarea name="description" [(ngModel)]="form.description" rows="3" class="field" placeholder="รายละเอียดเบื้องต้นของอาคาร"></textarea></div>
        <div><label class="mb-2 block text-sm font-medium">URL รูปภาพ</label><input name="imageUrl" [(ngModel)]="form.imageUrl" class="field" placeholder="https://..."></div>
        <div class="grid gap-5 sm:grid-cols-3">
          <div><label class="mb-2 block text-sm font-medium">จำนวนชั้น</label><input name="floors" type="number" min="1" max="100" [(ngModel)]="form.floors" class="field" placeholder="เช่น 4"></div>
          <div><label class="mb-2 block text-sm font-medium">Latitude *</label><input name="latitude" type="number" required min="-90" max="90" step="any" [(ngModel)]="form.latitude" class="field"></div>
          <div><label class="mb-2 block text-sm font-medium">Longitude *</label><input name="longitude" type="number" required min="-180" max="180" step="any" [(ngModel)]="form.longitude" class="field"></div>
        </div>
        <div class="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <a routerLink="/" class="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold hover:bg-slate-50">ยกเลิก</a>
          <button [disabled]="placeForm.invalid || loading" class="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
            {{ loading ? 'กำลังบันทึก...' : (editing ? 'บันทึกการแก้ไข' : 'เพิ่มอาคาร') }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .field { width:100%; border:1px solid #e2e8f0; border-radius:12px; background:#f8fafc; padding:12px 14px; font-size:14px; outline:none; }
    .field:focus { border-color:#fb923c; background:white; box-shadow:0 0 0 3px #ffedd5; }
    .error { margin-top:6px; font-size:12px; color:#dc2626; }
  `]
})
export class PlaceFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PlacesApiService);

  readonly types = PLACE_TYPES;
  private id = Number(this.route.snapshot.paramMap.get('id'));
  readonly editing = this.route.snapshot.routeConfig?.path === 'places/:id/edit';
  error = '';
  loading = false;

  form: Omit<Place, 'id'> = {
    name: '', code: '', typeId: 0, description: '',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6426, longitude: 99.8972, floors: undefined
  };

  ngOnInit(): void {
    if (this.editing && this.id) {
      this.api.getById(this.id).subscribe({
        next: (existing) => {
          if (existing) {
            this.form = { ...existing };
          }
        },
        error: () => {
          this.error = 'ไม่พบข้อมูลอาคารที่ต้องการแก้ไข';
        }
      });
    }
  }

  save(): void {
    this.error = '';
    const name = this.form.name.trim();
    const code = this.form.code.trim().toUpperCase();

    if (!name || !code || !this.form.typeId) {
      this.error = 'กรุณากรอกชื่อ รหัส และประเภทอาคาร';
      return;
    }

    const payload = {
      ...this.form,
      name,
      code,
      imageUrl: this.form.imageUrl.trim() || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85'
    };

    this.loading = true;

    if (this.editing) {
      this.api.update(this.id, payload).subscribe({
        next: () => {
          this.loading = false;
          void this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล';
        }
      });
    } else {
      this.api.create(payload).subscribe({
        next: () => {
          this.loading = false;
          void this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'เกิดข้อผิดพลาดในการสร้างอาคาร หรือรหัสอาคารซ้ำ';
        }
      });
    }
  }
}