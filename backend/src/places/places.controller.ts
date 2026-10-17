import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Controller('places')
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  // อ่านข้อมูล: ทุกคนเข้าถึงได้
  @Get()
  findAll(@Query('search') search?: string, @Query('typeId') typeId?: string) {
    const parsedType = typeId ? Number(typeId) : undefined;
    return this.places.findAll(search?.trim() || undefined, parsedType && Number.isInteger(parsedType) ? parsedType : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.places.findOne(id);
  }

  // เพิ่ม/แก้ไข/ลบ: เฉพาะผู้ดูแลระบบ
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreatePlaceDto) {
    return this.places.create(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlaceDto) {
    return this.places.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.places.remove(id);
  }
}
