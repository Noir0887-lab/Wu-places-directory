import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlacesApiService } from '../services/places-api.service';
import { PLACE_TYPES, Place } from '../models/place.model';
import * as L from 'leaflet';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><p class="text-xs font-semibold uppercase tracking-[.2em] text-orange-600">Campus map</p><h1 class="mt-1 text-2xl font-semibold">แผนที่อาคารเรียน</h1><p class="mt-2 text-sm text-slate-500">เลือกหมุดบนแผนที่เพื่อดูชื่อและเปิดรายละเอียดอาคาร</p></div>
      <a routerLink="/" class="text-sm font-semibold text-orange-600 hover:text-orange-700">← กลับไปหน้ารายการ</a>
    </div>
    <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
        <div id="campus-map" class="h-[480px] w-full rounded-xl sm:h-[620px]"></div>
        <p class="px-3 py-2 text-xs leading-5 text-slate-500">แผนที่ใช้ OpenStreetMap ส่วนพิกัดหมุดเป็นข้อมูลตัวอย่างโดยประมาณ กรุณาตรวจสอบก่อนใช้สำหรับนำทางจริง</p>
      </div>
      <aside class="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 class="font-semibold">รายการอาคาร <span class="text-sm font-normal text-slate-400">({{ places.length }})</span></h2>
        <div class="mt-3 space-y-2">
          @for (place of places; track place.id) {
            <button class="flex w-full items-start gap-3 rounded-xl border border-slate-100 p-3 text-left hover:border-orange-200 hover:bg-orange-50" (click)="focus(place)">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-xs font-bold text-orange-700">{{ place.code }}</span>
              <span><span class="block text-sm font-medium leading-5">{{ place.name }}</span><span class="mt-1 block text-xs text-slate-500">{{ typeName(place.typeId) }}</span></span>
            </button>
          }
        </div>
      </aside>
    </div>
  `
})
export class MapPageComponent implements AfterViewInit, OnDestroy {
  private api = inject(PlacesApiService);
  places: Place[] = [];
  private map?: L.Map;
  private markers = new Map<number, L.Marker>();

  ngAfterViewInit(): void {
    this.initMap();
    this.loadPlaces();
  }

  private initMap(): void {
    this.map = L.map('campus-map').setView([8.6426, 99.8972], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private loadPlaces(): void {
    this.api.getAll().subscribe({
      next: (data) => {
        this.places = data;
        this.renderMarkers();
      },
      error: (err) => console.error('Failed to load places for map', err)
    });
  }

  private renderMarkers(): void {
    if (!this.map) return;

    for (const place of this.places) {
      const marker = L.marker([place.latitude, place.longitude]).addTo(this.map);
      marker.bindPopup(`<strong>${this.escapeHtml(place.name)}</strong><br>${this.escapeHtml(place.code)}<br><a href="/places/${place.id}">ดูรายละเอียดอาคาร</a>`);
      this.markers.set(place.id, marker);
    }
  }

  focus(place: Place): void {
    this.map?.setView([place.latitude, place.longitude], 18, { animate: true });
    this.markers.get(place.id)?.openPopup();
  }

  typeName(id: number): string { return PLACE_TYPES.find(t => t.id === id)?.name ?? 'ไม่ระบุประเภท'; }
  private escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }
  ngOnDestroy(): void { this.map?.remove(); }
}