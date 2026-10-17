import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { ValidationError } from 'class-validator';

/** ตัดช่องว่างหน้า-หลังของข้อความ */
export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/** ตัดช่องว่างแล้วแปลงเป็นตัวพิมพ์ใหญ่ (ใช้กับรหัสอาคาร) */
export const TrimUpper = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value));

/** รูปแบบ URL ที่รับ: ต้องมี http:// หรือ https:// */
export const HTTP_URL_OPTIONS = { protocols: ['http', 'https'], require_protocol: true };

const LIST_LABELS: Record<string, string> = { rooms: 'ห้องที่', images: 'รูปที่' };

function collect(errors: ValidationError[], prefix: string, out: string[]): void {
  for (const error of errors) {
    if (error.constraints) {
      for (const message of Object.values(error.constraints)) out.push(prefix ? `${prefix}: ${message}` : message);
    }
    if (!error.children?.length) continue;
    const label = LIST_LABELS[error.property];
    for (const child of error.children) {
      // ข้อผิดพลาดของสมาชิกใน array: property จะเป็นลำดับ (0, 1, 2, ...)
      if (label && /^\d+$/.test(child.property)) collect(child.children ?? [], `${label} ${Number(child.property) + 1}`, out);
      else collect([child], prefix, out);
    }
  }
}

/** แปลงข้อผิดพลาดของ class-validator เป็นรายการข้อความภาษาไทยที่อ่านง่าย */
export function validationExceptionFactory(errors: ValidationError[]): BadRequestException {
  const messages: string[] = [];
  collect(errors, '', messages);
  return new BadRequestException({ statusCode: 400, error: 'Bad Request', message: messages });
}
