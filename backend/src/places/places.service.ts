import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}
  findAll(search?: string, typeId?: number) {
    return this.prisma.place.findMany({
      where: { ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : {}), ...(typeId ? { typeId } : {}) },
      include: { type: true }, orderBy: { name: 'asc' }
    });
  }
  async findOne(id: number) {
    const place = await this.prisma.place.findUnique({ where: { id }, include: { type: true } });
    if (!place) throw new NotFoundException('ไม่พบข้อมูลอาคาร');
    return place;
  }
  async create(dto: CreatePlaceDto) {
    try { return await this.prisma.place.create({ data: { ...dto, code: dto.code.trim().toUpperCase(), name: dto.name.trim() }, include: { type: true } }); }
    catch (e: any) { if (e?.code === 'P2002') throw new ConflictException('รหัสอาคารนี้มีอยู่แล้ว'); throw e; }
  }
  async update(id: number, dto: UpdatePlaceDto) {
    await this.findOne(id);
    try { return await this.prisma.place.update({ where: { id }, data: { ...dto, ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}), ...(dto.name ? { name: dto.name.trim() } : {}) }, include: { type: true } }); }
    catch (e: any) { if (e?.code === 'P2002') throw new ConflictException('รหัสอาคารนี้มีอยู่แล้ว'); throw e; }
  }
  async remove(id: number) { await this.findOne(id); await this.prisma.place.delete({ where: { id } }); return { message: 'ลบข้อมูลอาคารสำเร็จ' }; }
}
