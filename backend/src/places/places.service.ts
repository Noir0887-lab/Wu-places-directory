import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { PlaceImageDto } from './dto/place-image.dto';
import { RoomDto } from './dto/room.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

const LIST_INCLUDE = {
  type: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  _count: { select: { rooms: true } }
};
const DETAIL_INCLUDE = {
  type: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  rooms: { orderBy: [{ floor: 'asc' as const }, { name: 'asc' as const }] },
  _count: { select: { rooms: true } }
};

// ฟิลด์ที่จำเป็นต้องมีค่าเสมอ ห้ามตั้งเป็น null ตอนแก้ไข
const REQUIRED_FIELDS = ['name', 'code', 'typeId', 'latitude', 'longitude'] as const;

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, typeId?: number) {
    return this.prisma.place.findMany({
      where: {
        ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : {}),
        ...(typeId ? { typeId } : {})
      },
      include: LIST_INCLUDE,
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: number) {
    const place = await this.prisma.place.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    if (!place) throw new NotFoundException('ไม่พบข้อมูลอาคาร');
    return place;
  }

  async create(dto: CreatePlaceDto) {
    const images = this.normalizeImages(dto) ?? [];
    const rooms = dto.rooms ?? [];
    this.assertConsistent(dto.floors ?? null, images, rooms);
    await this.assertTypeExists(dto.typeId);

    try {
      return await this.prisma.place.create({
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description ?? '',
          imageUrl: images[0]?.url ?? '',
          latitude: dto.latitude,
          longitude: dto.longitude,
          floors: dto.floors ?? null,
          typeId: dto.typeId,
          images: { create: images.map((image, index) => this.toImageData(image, index)) },
          rooms: { create: rooms.map((room) => this.toRoomData(room)) }
        },
        include: DETAIL_INCLUDE
      });
    } catch (e) {
      this.rethrow(e);
    }
  }

  async update(id: number, dto: UpdatePlaceDto) {
    const existing = await this.findOne(id);
    for (const field of REQUIRED_FIELDS) {
      if ((dto as any)[field] === null) throw new BadRequestException([`ห้ามเว้นว่าง: ${field}`]);
    }

    const images = this.normalizeImages(dto);
    const rooms = dto.rooms;
    const floors = dto.floors !== undefined ? dto.floors : existing.floors;
    this.assertConsistent(
      floors,
      images ?? existing.images,
      rooms ?? existing.rooms.map((room) => ({ ...room, code: room.code, capacity: room.capacity ?? undefined }))
    );
    if (dto.typeId !== undefined) await this.assertTypeExists(dto.typeId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (images) {
          await tx.placeImage.deleteMany({ where: { placeId: id } });
          if (images.length) await tx.placeImage.createMany({ data: images.map((image, index) => ({ placeId: id, ...this.toImageData(image, index) })) });
        }
        if (rooms) {
          await tx.room.deleteMany({ where: { placeId: id } });
          if (rooms.length) await tx.room.createMany({ data: rooms.map((room) => ({ placeId: id, ...this.toRoomData(room) })) });
        }
        return tx.place.update({
          where: { id },
          data: {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.code !== undefined ? { code: dto.code } : {}),
            ...(dto.description !== undefined ? { description: dto.description ?? '' } : {}),
            ...(dto.typeId !== undefined ? { typeId: dto.typeId } : {}),
            ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
            ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
            ...(dto.floors !== undefined ? { floors: dto.floors } : {}),
            // รูปปกต้องตรงกับรูปแรกของแกลเลอรีเสมอ
            ...(images ? { imageUrl: images[0]?.url ?? '' } : {})
          },
          include: DETAIL_INCLUDE
        });
      });
    } catch (e) {
      this.rethrow(e);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.place.delete({ where: { id } });
    return { message: 'ลบข้อมูลอาคารสำเร็จ' };
  }

  /**
   * รวมรูปจากทั้งสองช่องทาง: images (ใหม่) หรือ imageUrl (client เดิม ส่งรูปเดียว)
   * คืน undefined เมื่อไม่ได้ส่งรูปมาเลย (หมายถึงไม่แตะต้องรูปเดิม)
   */
  private normalizeImages(dto: { images?: PlaceImageDto[] | null; imageUrl?: string | null }): PlaceImageDto[] | undefined {
    if (dto.images !== undefined && dto.images !== null) return dto.images;
    if (dto.imageUrl !== undefined && dto.imageUrl !== null) return dto.imageUrl ? [{ url: dto.imageUrl, caption: '' }] : [];
    return undefined;
  }

  private toImageData(image: PlaceImageDto, sortOrder: number) {
    return { url: image.url, caption: image.caption ?? '', sortOrder };
  }

  private toRoomData(room: RoomDto) {
    return {
      floor: room.floor,
      name: room.name,
      code: room.code ?? '',
      category: room.category ?? 'ห้องเรียน',
      capacity: room.capacity ?? null,
      description: room.description ?? ''
    };
  }

  /** ตรวจความสัมพันธ์ระหว่างข้อมูล (ที่ validator ระดับฟิลด์ตรวจไม่ได้) แล้วรายงานทุกข้อผิดพลาดพร้อมกัน */
  private assertConsistent(floors: number | null | undefined, images: { url: string }[], rooms: { floor: number; name: string; code?: string | null }[]): void {
    const problems: string[] = [];

    const seenUrls = new Set<string>();
    images.forEach((image, index) => {
      const key = image.url.trim().toLowerCase();
      if (seenUrls.has(key)) problems.push(`รูปที่ ${index + 1}: URL ซ้ำกับรูปก่อนหน้า`);
      seenUrls.add(key);
    });

    const seenCodes = new Set<string>();
    rooms.forEach((room, index) => {
      if (floors && room.floor > floors) problems.push(`ห้องที่ ${index + 1} (${room.name}): อยู่ชั้น ${room.floor} แต่อาคารมีเพียง ${floors} ชั้น`);
      const code = (room.code ?? '').trim().toLowerCase();
      if (code) {
        if (seenCodes.has(code)) problems.push(`ห้องที่ ${index + 1} (${room.name}): รหัสห้อง "${room.code}" ซ้ำกับห้องอื่นในอาคารเดียวกัน`);
        seenCodes.add(code);
      }
    });

    if (problems.length) throw new BadRequestException({ statusCode: 400, error: 'Bad Request', message: problems });
  }

  private async assertTypeExists(typeId: number): Promise<void> {
    const type = await this.prisma.placeType.findUnique({ where: { id: typeId } });
    if (!type) throw new BadRequestException({ statusCode: 400, error: 'Bad Request', message: ['ไม่พบประเภทอาคารที่เลือก'] });
  }

  private rethrow(e: any): never {
    if (e?.code === 'P2002') throw new ConflictException('รหัสอาคารนี้มีอยู่แล้ว');
    throw e;
  }
}
