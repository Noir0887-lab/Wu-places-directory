import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
@Controller('places')
export class PlacesController {
  constructor(private readonly places: PlacesService) {}
  @Get() findAll(@Query('search') search?: string, @Query('typeId') typeId?: string) { return this.places.findAll(search, typeId ? Number(typeId) : undefined); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.places.findOne(id); }
  @Post() create(@Body() dto: CreatePlaceDto) { return this.places.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlaceDto) { return this.places.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.places.remove(id); }
}
