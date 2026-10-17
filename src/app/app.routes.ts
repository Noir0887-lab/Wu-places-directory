import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { PlaceDetailComponent } from './pages/place-detail.component';
import { PlaceFormComponent } from './pages/place-form.component';
import { MapPageComponent } from './pages/map-page.component';
import { LoginComponent } from './pages/login.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'ค้นหาอาคาร | WU Places Directory' },
  { path: 'map', component: MapPageComponent, title: 'แผนที่ | WU Places Directory' },
  { path: 'login', component: LoginComponent, title: 'เข้าสู่ระบบผู้ดูแล | WU Places Directory' },
  { path: 'places/new', component: PlaceFormComponent, canActivate: [adminGuard], title: 'เพิ่มอาคาร | WU Places Directory' },
  { path: 'places/:id/edit', component: PlaceFormComponent, canActivate: [adminGuard], title: 'แก้ไขอาคาร | WU Places Directory' },
  { path: 'places/:id', component: PlaceDetailComponent, title: 'รายละเอียดอาคาร | WU Places Directory' },
  { path: '**', redirectTo: '' }
];
