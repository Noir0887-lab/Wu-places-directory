import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { validationExceptionFactory } from './common/validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  // อยู่หลัง proxy ของ Render: ให้ req.ip เป็น IP ของผู้ใช้จริง (ใช้จำกัดการล็อกอินผิดซ้ำๆ)
  app.set('trust proxy', 1);
  app.enableCors({
    origin: ['http://localhost:4200', 'https://wu-places-directory.vercel.app'],
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // อนุญาตให้ละเว้น property ส่วนเกินจาก Angular Form
      stopAtFirstError: true, // แต่ละช่องแจ้งข้อผิดพลาดแรกข้อเดียว ไม่ซ้ำซ้อน
      exceptionFactory: validationExceptionFactory // ข้อความภาษาไทย + ระบุลำดับรูป/ห้องที่ผิด
    })
  );

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`WU Places API running at http://localhost:${port}/api`);
}
bootstrap();
