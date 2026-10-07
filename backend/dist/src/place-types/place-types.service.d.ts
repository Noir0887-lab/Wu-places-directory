import { PrismaService } from '../prisma.service';
export declare class PlaceTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
}
