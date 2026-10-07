import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
@Injectable()
export class PlaceTypesService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.placeType.findMany({ include: { _count: { select: { places: true } } }, orderBy: { name: 'asc' } }); }
}
