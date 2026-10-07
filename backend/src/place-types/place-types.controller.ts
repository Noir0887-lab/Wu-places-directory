import { Controller, Get } from '@nestjs/common';
import { PlaceTypesService } from './place-types.service';
@Controller('place-types')
export class PlaceTypesController {
  constructor(private readonly types: PlaceTypesService) {}
  @Get() findAll() { return this.types.findAll(); }
}
