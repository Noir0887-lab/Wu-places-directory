import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { HTTP_URL_OPTIONS, Trim } from '../../common/validation';

export class PlaceImageDto {
  @Trim()
  @IsString({ message: 'กรุณาระบุ URL รูปภาพ' })
  @IsUrl(HTTP_URL_OPTIONS, { message: 'URL รูปภาพไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)' })
  @MaxLength(2000, { message: 'URL รูปภาพยาวเกิน 2000 ตัวอักษร' })
  url!: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'คำบรรยายรูปต้องเป็นข้อความ' })
  @MaxLength(200, { message: 'คำบรรยายรูปยาวเกิน 200 ตัวอักษร' })
  caption?: string;
}
