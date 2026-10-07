import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const types = await Promise.all([
    prisma.placeType.upsert({ where: { name: 'อาคารเรียนรวม' }, update: {}, create: { name: 'อาคารเรียนรวม' } }),
    prisma.placeType.upsert({ where: { name: 'อาคารเรียน' }, update: {}, create: { name: 'อาคารเรียน' } }),
    prisma.placeType.upsert({ where: { name: 'อาคารปฏิบัติการ' }, update: {}, create: { name: 'อาคารปฏิบัติการ' } })
  ]);
  await prisma.place.upsert({ where: { code: 'RB1' }, update: {}, create: { name: 'อาคารเรียนรวม 1', code: 'RB1', description: 'ข้อมูลตัวอย่างสำหรับทดสอบระบบ กรุณาตรวจสอบรายละเอียดจริงก่อนนำเสนอ', typeId: types[0].id, latitude: 8.6426, longitude: 99.8972, floors: 5, imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85' } });
  await prisma.place.upsert({ where: { code: 'ST' }, update: {}, create: { name: 'อาคารศาสตราจารย์ ดร. สมบัติ ธำรงธัญวงศ์', code: 'ST', description: 'ข้อมูลตัวอย่าง กรุณาตรวจสอบข้อมูลทางการ', typeId: types[1].id, latitude: 8.6420, longitude: 99.8960, floors: 4, imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85' } });
}
main().finally(() => prisma.$disconnect());
