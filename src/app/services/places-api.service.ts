import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Place } from '../models/place.model';

// API client scaffold for the NestJS backend. Use this service when migrating pages
// away from PlaceStoreService (localStorage prototype).
@Injectable({ providedIn: 'root' })
export class PlacesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  getAll(search = '', typeId?: number): Observable<Place[]> {
    let params = new HttpParams();
    if (search.trim()) params = params.set('search', search.trim());
    if (typeId) params = params.set('typeId', typeId);
    return this.http.get<Place[]>(`${this.baseUrl}/places`, { params });
  }
  getById(id: number): Observable<Place> { return this.http.get<Place>(`${this.baseUrl}/places/${id}`); }
  create(data: Omit<Place, 'id'>): Observable<Place> { return this.http.post<Place>(`${this.baseUrl}/places`, data); }
  update(id: number, data: Partial<Omit<Place, 'id'>>): Observable<Place> { return this.http.patch<Place>(`${this.baseUrl}/places/${id}`, data); }
  delete(id: number): Observable<{ message: string }> { return this.http.delete<{ message: string }>(`${this.baseUrl}/places/${id}`); }
  getTypes(): Observable<{ id: number; name: string }[]> { return this.http.get<{ id: number; name: string }[]>(`${this.baseUrl}/place-types`); }
}
