import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ 
  origin: ['http://localhost:4200', 'https://wu-places-directory.vercel.app'], 
  credentials: true 
});
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // อนุญาตให้ละเว้น property ส่วนเกินจาก Angular Form
    }),
  );

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`WU Places API running at http://localhost:${port}/api`);
}
bootstrap();