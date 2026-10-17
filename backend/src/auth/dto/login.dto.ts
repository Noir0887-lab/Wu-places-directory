import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'กรุณากรอกชื่อผู้ใช้' })
  @MinLength(1, { message: 'กรุณากรอกชื่อผู้ใช้' })
  @MaxLength(50, { message: 'ชื่อผู้ใช้ยาวเกินไป' })
  username!: string;

  @IsString({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(1, { message: 'กรุณากรอกรหัสผ่าน' })
  @MaxLength(200, { message: 'รหัสผ่านยาวเกินไป' })
  password!: string;
}
