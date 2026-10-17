import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AdminGuard, PrismaService],
  exports: [AuthService, AdminGuard]
})
export class AuthModule {}
