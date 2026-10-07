"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PlacesService = class PlacesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(search, typeId) {
        return this.prisma.place.findMany({
            where: { ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : {}), ...(typeId ? { typeId } : {}) },
            include: { type: true }, orderBy: { name: 'asc' }
        });
    }
    async findOne(id) {
        const place = await this.prisma.place.findUnique({ where: { id }, include: { type: true } });
        if (!place)
            throw new common_1.NotFoundException('ไม่พบข้อมูลอาคาร');
        return place;
    }
    async create(dto) {
        try {
            return await this.prisma.place.create({ data: { ...dto, code: dto.code.trim().toUpperCase(), name: dto.name.trim() }, include: { type: true } });
        }
        catch (e) {
            if (e?.code === 'P2002')
                throw new common_1.ConflictException('รหัสอาคารนี้มีอยู่แล้ว');
            throw e;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        try {
            return await this.prisma.place.update({ where: { id }, data: { ...dto, ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}), ...(dto.name ? { name: dto.name.trim() } : {}) }, include: { type: true } });
        }
        catch (e) {
            if (e?.code === 'P2002')
                throw new common_1.ConflictException('รหัสอาคารนี้มีอยู่แล้ว');
            throw e;
        }
    }
    async remove(id) { await this.findOne(id); await this.prisma.place.delete({ where: { id } }); return { message: 'ลบข้อมูลอาคารสำเร็จ' }; }
};
exports.PlacesService = PlacesService;
exports.PlacesService = PlacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlacesService);
//# sourceMappingURL=places.service.js.map