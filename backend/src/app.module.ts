import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PlacesModule } from './places/places.module';
import { PlaceTypesModule } from './place-types/place-types.module';
import { PrismaService } from './prisma.service';

@Module({ imports: [AuthModule, PlacesModule, PlaceTypesModule], providers: [PrismaService] })
export class AppModule {}
