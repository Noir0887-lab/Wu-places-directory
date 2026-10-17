import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';
import { Trim } from '../../common/validation';

// ประเภทของห้อง/พื้นที่ภายในอาคาร (ต้องตรงกับรายการใน frontend: place.model.ts)
export const ROOM_CATEGORIES = [
  'ห้องเรียน',
  'ห้องปฏิบัติการ',
  'ห้องประชุม',
  'ห้องพักอาจารย์/สำนักงาน',
  'ห้องน้ำ',
  'ลิฟต์/บันได',
  'ร้านอาหาร/ร้านค้า',
  'พื้นที่ส่วนกลาง',
  'อื่นๆ'
];

export class RoomDto {
  @Type(() => Number)
  @IsInt({ message: 'ชั้นต้องเป็นจำนวนเต็ม' })
  @Min(1, { message: 'ชั้นต้องไม่ต่ำกว่า 1' })
  @Max(100, { message: 'ชั้นต้องไม่เกิน 100' })
  floor!: number;

  @Trim()
  @IsString({ message: 'กรุณากรอกชื่อห้อง' })
  @Length(1, 150, { message: 'ชื่อห้องต้องมี 1-150 ตัวอักษร' })
  name!: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'รหัสห้องต้องเป็นข้อความ' })
  @MaxLength(30, { message: 'รหัสห้องยาวเกิน 30 ตัวอักษร' })
  code?: string;

  @IsOptional()
  @IsIn(ROOM_CATEGORIES, { message: 'ประเภทห้องไม่ถูกต้อง' })
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ความจุต้องเป็นจำนวนเต็ม' })
  @Min(1, { message: 'ความจุต้องไม่ต่ำกว่า 1' })
  @Max(10000, { message: 'ความจุต้องไม่เกิน 10,000' })
  capacity?: number | null;

  @IsOptional()
  @Trim()
  @IsString({ message: 'รายละเอียดห้องต้องเป็นข้อความ' })
  @MaxLength(1000, { message: 'รายละเอียดห้องยาวเกิน 1,000 ตัวอักษร' })
  description?: string;
}
