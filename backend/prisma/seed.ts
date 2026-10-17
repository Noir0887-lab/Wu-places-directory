import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
 
const SAMPLE_NOTE = 'ข้อมูลตัวอย่างสำหรับทดสอบระบบ กรุณาตรวจสอบรายละเอียดจริงก่อนนำเสนอ';
 
interface BuildingSeed {
  code: string;
  name: string;
  description: string;
  typeName: string;
  floors: number;
  latitude: number;
  longitude: number;
  // รูปเรียงตามลำดับที่แสดง: รูปแรก = รูปปกของอาคาร
  images: string[];
}
 
const BUILDINGS: BuildingSeed[] = [
  {
    code: 'RB1',
    name: 'อาคารเรียนรวม 1',
    description: SAMPLE_NOTE,
    typeName: 'อาคารเรียนรวม',
    floors: 3,
    latitude: 8.643765,
    longitude: 99.896627,
    images: [
      'https://i0.wp.com/ces.wu.ac.th/main/wp-content/uploads/2022/01/%E0%B8%A3%E0%B8%A7%E0%B8%A11-copy.jpg?fit=500%2C375&ssl=1',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Th7ghZypXbTzzn1A6q4r6m2LSBr1hZR-QKseWs7TX8u4NCxiOeAUf2gMuB8c25vVgxbDBbFdLhVqU9iLAXnMxBqlVCkdU_Oy1F0P3csP-RnYJcyFZ9OyjNI2KMF1KMpZgGoczDDxCTwY4=s680-w680-h510-rw',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9STRmnB43erVerXWjQjYTBNkDb2rAl4EcNHfBDkubV-54OkR0CTpZHCKgVGF_B6mQ3oLb614jehqxoSgWwI-7uUJEECtrKMt1ZAmAtkz_MYF9JU-L6GpHpaxsD1jqepQw_NOnRm=s680-w680-h510-rw'
    ]
  },
  {
    code: 'ST',
    name: 'อาคารศาสตราจารย์ ดร. สมบัติ ธำรงธัญวงศ์',
    description: 'ข้อมูลตัวอย่าง กรุณาตรวจสอบข้อมูลทางการ',
    typeName: 'อาคารเรียน',
    floors: 4,
    latitude: 8.644260296114611,
    longitude: 99.89914244049663,
    images: [
      'https://i0.wp.com/ces.wu.ac.th/main/wp-content/uploads/2022/04/ST-building.jpg?fit=555%2C555&ssl=1',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SdnZE1La4jIl_0swBi_XGdfvgONCgl_OOereAQcETZwNKHIfSH8lK-OhCJbbRwSWy7RN3z4Vbu4R6ud7lk3oKY24XsXSNCJY1jWGFuZbr3ubqsXZTr8tI1kadkPFLJsZ_g8VIuD8beuEcC=s680-w680-h510-rw',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QG0EHJDC2Mmb9iZm-5Fw8Xamdw_SWvRa-bRunZexCJHXFkWpbgxiTEJ43OZjcQI3ahFCO6cDbvPcRx3UYv1z-iBFawsLfF8WHEdkiE81IWGYi7MyZPTzNcltlsKaLKpVzrD0lEsVLvoX3y=s680-w680-h510-rw',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9S0L6yWQ877flwoMYaHPvsHzl272o1LwqBYoqbxR3751kipqgwn727kl_3H7PGkg8gWn2HLxUcwdzmXvExYBxl-uN9NXko6UCRcw84T6KuIij2ClXzTsJTGZ3KTJtXNdV8YScbpjw=s680-w680-h510-rw',
      'https://ces.wu.ac.th/registrar/img/st-011.png',
      'https://ces.wu.ac.th/registrar/img/st-022.png',
      'https://ces.wu.ac.th/registrar/img/st-033.png'
    ]
  },
  {
    code: 'AD',
    name: 'อาคารปฏิบัติการสถาปัตยกรรมและการออกแบบ (AD)',
    description: SAMPLE_NOTE,
    typeName: 'อาคารปฏิบัติการ',
    floors: 3,
    latitude: 8.64438,
    longitude: 99.893459,
    images: [
      'https://i0.wp.com/ces.wu.ac.th/main/wp-content/uploads/2025/05/%E0%B8%9C%E0%B8%B1%E0%B8%87%E0%B8%AD%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3-AD-NG-TH.jpg?fit=1024%2C682&ssl=1',
      'https://ces.wu.ac.th/main/wp-content/uploads/2025/06/%E0%B8%9C%E0%B8%B1%E0%B8%87%E0%B8%8A%E0%B8%B1%E0%B9%89%E0%B8%991ENG-scaled.jpg',
      'https://ces.wu.ac.th/main/wp-content/uploads/2022/04/%E0%B8%9C%E0%B8%B1%E0%B8%87%E0%B8%8A%E0%B8%B1%E0%B9%89%E0%B8%992ENG.jpg',
      'https://ces.wu.ac.th/main/wp-content/uploads/2022/04/%E0%B8%9C%E0%B8%B1%E0%B8%87%E0%B8%8A%E0%B8%B1%E0%B9%89%E0%B8%993ENG.jpg'
    ]
  }
];
 
const toImages = (urls: string[]) => urls.map((url, sortOrder) => ({ url, caption: '', sortOrder }));
 
async function main() {
  // ประเภทอาคาร (ไม่ซ้ำ: ใช้ชื่อเป็นคีย์)
  const typeIds = new Map<string, number>();
  for (const name of [...new Set(BUILDINGS.map((b) => b.typeName))]) {
    const type = await prisma.placeType.upsert({ where: { name }, update: {}, create: { name } });
    typeIds.set(name, type.id);
  }
 
  // รันซ้ำได้: ถ้ามีอาคารรหัสนี้อยู่แล้วจะอัปเดตข้อมูลและรูปให้ตรงกับด้านบน
  // (ข้อมูลที่แอดมินแก้เองของอาคาร 3 แห่งนี้จะถูกเขียนทับ ส่วนอาคารอื่นไม่ถูกแตะต้อง)
  for (const b of BUILDINGS) {
    const typeId = typeIds.get(b.typeName)!;
    const data = {
      name: b.name,
      description: b.description,
      typeId,
      latitude: b.latitude,
      longitude: b.longitude,
      floors: b.floors,
      imageUrl: b.images[0] // รูปปก = รูปแรกเสมอ
    };
    await prisma.place.upsert({
      where: { code: b.code },
      create: { code: b.code, ...data, images: { create: toImages(b.images) } },
      update: { ...data, images: { deleteMany: {}, create: toImages(b.images) } }
    });
    console.log(`seeded ${b.code}: ${b.images.length} images`);
  }
}
 
main().finally(() => prisma.$disconnect());
