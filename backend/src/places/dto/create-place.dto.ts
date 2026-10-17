import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { HTTP_URL_OPTIONS, Trim, TrimUpper } from '../../common/validation';
import { PlaceImageDto } from './place-image.dto';
import { RoomDto } from './room.dto';

export class CreatePlaceDto {
  @Trim()
  @IsString({ message: 'กรุณากรอกชื่ออาคาร' })
  @Length(2, 200, { message: 'ชื่ออาคารต้องมี 2-200 ตัวอักษร' })
  name!: string;

  @TrimUpper()
  @IsString({ message: 'กรุณากรอกรหัสอาคาร' })
  @Length(1, 30, { message: 'รหัสอาคารต้องมี 1-30 ตัวอักษร' })
  @Matches(/^[A-Z0-9-]*$/, { message: 'รหัสอาคารใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย - เท่านั้น' })
  code!: string;

  @Type(() => Number)
  @IsInt({ message: 'กรุณาเลือกประเภทอาคาร' })
  @Min(1, { message: 'กรุณาเลือกประเภทอาคาร' })
  typeId!: number;

  @IsOptional()
  @Trim()
  @IsString({ message: 'คำอธิบายต้องเป็นข้อความ' })
  @MaxLength(2000, { message: 'คำอธิบายยาวเกิน 2,000 ตัวอักษร' })
  description?: string;

  // รองรับ client เดิมที่ส่งรูปเดียวมาใน imageUrl (ถ้ามี images จะใช้ images แทน)
  @ValidateIf((o) => o.imageUrl !== undefined && o.imageUrl !== null && o.imageUrl !== '')
  @Trim()
  @IsUrl(HTTP_URL_OPTIONS, { message: 'URL รูปภาพไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)' })
  imageUrl?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'กรุณาระบุละติจูดเป็นตัวเลข' })
  @Min(-90, { message: 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90' })
  @Max(90, { message: 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90' })
  latitude!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'กรุณาระบุลองจิจูดเป็นตัวเลข' })
  @Min(-180, { message: 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180' })
  @Max(180, { message: 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180' })
  longitude!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'จำนวนชั้นต้องเป็นจำนวนเต็ม' })
  @Min(1, { message: 'จำนวนชั้นต้องไม่ต่ำกว่า 1' })
  @Max(100, { message: 'จำนวนชั้นต้องไม่เกิน 100' })
  floors?: number | null;

  // รูปภาพทั้งหมดของอาคาร เรียงตามลำดับ (รูปแรกคือรูปปก)
  @IsOptional()
  @IsArray({ message: 'รูปภาพต้องเป็นรายการ' })
  @ArrayMaxSize(12, { message: 'เพิ่มรูปภาพได้สูงสุด 12 รูป' })
  @ValidateNested({ each: true })
  @Type(() => PlaceImageDto)
  images?: PlaceImageDto[];

  // รายละเอียดภายในอาคาร (ห้อง/พื้นที่แต่ละชั้น)
  @IsOptional()
  @IsArray({ message: 'รายการห้องต้องเป็นรายการ' })
  @ArrayMaxSize(500, { message: 'เพิ่มห้องได้สูงสุด 500 ห้องต่ออาคาร' })
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms?: RoomDto[];
}
