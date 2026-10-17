import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** หน้าเพิ่ม/แก้ไขอาคาร: ต้องล็อกอินเป็นแอดมินก่อน ไม่เช่นนั้นพาไปหน้า login แล้วกลับมาที่หน้าเดิม */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
