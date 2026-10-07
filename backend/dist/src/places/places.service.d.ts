import { PrismaService } from '../prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
export declare class PlacesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string, typeId?: number): any;
    findOne(id: number): Promise<any>;
    create(dto: CreatePlaceDto): Promise<any>;
    update(id: number, dto: UpdatePlaceDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
