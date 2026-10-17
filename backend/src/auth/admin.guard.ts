import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/** ใช้กับ endpoint ที่เปลี่ยนแปลงข้อมูล: ต้องแนบ Authorization: Bearer <token> ของผู้ดูแล */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header: string = request.headers?.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('กรุณาเข้าสู่ระบบผู้ดูแลก่อน');
    const payload = this.auth.verify(token);
    if (!payload) throw new UnauthorizedException('เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบอีกครั้ง');
    request.admin = payload;
    return true;
  }
}
