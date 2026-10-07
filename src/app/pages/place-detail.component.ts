import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlacesApiService } from '../services/places-api.service';
import { PLACE_TYPES, Place } from '../models/place.model';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (place) {
      <a routerLink="/" class="text-sm font-medium text-slate-500 hover:text-orange-600">← กลับไปหน้ารายการอาคาร</a>
      <div class="mt-5 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div class="overflow-hidden rounded-3xl bg-slate-100"><img [src]="place.imageUrl" [alt]="place.name" class="h-72 w-full object-cover sm:h-[430px]"></div>
        <section class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div class="flex flex-wrap gap-2"><span class="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">{{ place.code }}</span><span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">{{ typeName(place.typeId) }}</span></div>
          <h1 class="mt-5 text-2xl font-semibold leading-relaxed sm:text-3xl">{{ place.name }}</h1>
          <p class="mt-4 text-sm leading-7 text-slate-600">{{ place.description }}</p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-slate-50 p-4"><div class="text-xs text-slate-500">รหัสอาคาร</div><div class="mt-1 font-semibold">{{ place.code }}</div></div>
            <div class="rounded-xl bg-slate-50 p-4"><div class="text-xs text-slate-500">จำนวนชั้น</div><div class="mt-1 font-semibold">{{ place.floors ? place.floors + ' ชั้น' : 'ยังไม่มีข้อมูล' }}</div></div>
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <a [routerLink]="['/map']" class="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600">ดูแผนที่</a>
            <a [routerLink]="['/places', place.id, 'edit']" class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50">แก้ไขข้อมูล</a>
            <button (click)="deletePlace(place.id)" class="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">ลบอาคาร</button>
          </div>
          <p class="mt-5 text-xs leading-5 text-slate-400">หมายเหตุ: ข้อมูลดึงมาจาก Backend PostgreSQL ผ่าน API Service</p>
        </section>
      </div>
    } @else {
      <div class="rounded-2xl bg-white p-10 text-center"><h1 class="text-xl font-semibold">ไม่พบอาคารนี้</h1><a routerLink="/" class="mt-4 inline-block text-sm text-orange-600">กลับหน้าหลัก</a></div>
    }
  `
})
export class PlaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PlacesApiService);

  place?: Place;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.api.getById(id).subscribe({
        next: (data) => this.place = data,
        error: (err) => console.error('Failed to get place details', err)
      });
    }
  }

  typeName(id: number): string { return PLACE_TYPES.find(t => t.id === id)?.name ?? 'ไม่ระบุประเภท'; }

  deletePlace(id: number): void {
    if (confirm('ยืนยันลบข้อมูลอาคารนี้หรือไม่?')) {
      this.api.delete(id).subscribe({
        next: () => {
          void this.router.navigateByUrl('/');
        },
        error: (err) => {
          console.error('Failed to delete place', err);
          alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      });
    }
  }
}