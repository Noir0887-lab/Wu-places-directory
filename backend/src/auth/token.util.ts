import { createHmac, timingSafeEqual } from 'crypto';

// โทเคนรูปแบบ JWT (HS256) ที่สร้างด้วย crypto ของ Node เอง ไม่ต้องติดตั้งแพ็กเกจเพิ่ม
export interface TokenPayload {
  sub: number;
  username: string;
  iat: number;
  exp: number;
}

const encode = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');
const sign = (data: string, secret: string): Buffer => createHmac('sha256', secret).update(data).digest();

export function signToken(claims: { sub: number; username: string }, secret: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encode(JSON.stringify({ ...claims, iat: now, exp: now + ttlSeconds }));
  const signature = sign(`${header}.${body}`, secret).toString('base64url');
  return `${header}.${body}.${signature}`;
}

/** คืนค่า payload เมื่อโทเคนถูกต้องและยังไม่หมดอายุ มิฉะนั้นคืน null */
export function verifyToken(token: string, secret: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  try {
    // รับเฉพาะ HS256 เท่านั้น (กันการโจมตีด้วย alg: none)
    const head = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    if (head?.alg !== 'HS256') return null;

    const expected = sign(`${header}.${body}`, secret);
    const given = Buffer.from(signature, 'base64url');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload?.exp !== 'number' || payload.exp <= now) return null;
    if (typeof payload.sub !== 'number' || typeof payload.username !== 'string') return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
