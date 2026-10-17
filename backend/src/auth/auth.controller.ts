import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto.username, dto.password, req.ip ?? 'unknown');
  }

  /** ใช้ให้หน้าเว็บตรวจว่าโทเคนที่เก็บไว้ยังใช้ได้ */
  @Get('me')
  @UseGuards(AdminGuard)
  me(@Req() req: any) {
    return { username: req.admin.username };
  }
}
