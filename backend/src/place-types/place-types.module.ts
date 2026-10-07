import { Module } from '@nestjs/common';
import { PlaceTypesController } from './place-types.controller';
import { PlaceTypesService } from './place-types.service';
import { PrismaService } from '../prisma.service';
@Module({ controllers: [PlaceTypesController], providers: [PlaceTypesService, PrismaService] })
export class PlaceTypesModule {}
