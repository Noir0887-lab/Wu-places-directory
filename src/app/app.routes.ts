import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { PlaceDetailComponent } from './pages/place-detail.component';
import { PlaceFormComponent } from './pages/place-form.component';
import { MapPageComponent } from './pages/map-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'ค้นหาอาคาร | WU Places Directory' },
  { path: 'map', component: MapPageComponent, title: 'แผนที่ | WU Places Directory' },
  { path: 'places/new', component: PlaceFormComponent, title: 'เพิ่มอาคาร | WU Places Directory' },
  { path: 'places/:id/edit', component: PlaceFormComponent, title: 'แก้ไขอาคาร | WU Places Directory' },
  { path: 'places/:id', component: PlaceDetailComponent, title: 'รายละเอียดอาคาร | WU Places Directory' },
  { path: '**', redirectTo: '' }
];