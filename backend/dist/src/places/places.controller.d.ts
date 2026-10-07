import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
export declare class PlacesController {
    private readonly places;
    constructor(places: PlacesService);
    findAll(search?: string, typeId?: string): any;
    findOne(id: number): Promise<any>;
    create(dto: CreatePlaceDto): Promise<any>;
    update(id: number, dto: UpdatePlaceDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
