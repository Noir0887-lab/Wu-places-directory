import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma.service';
import { hashPassword, verifyPassword } from './password.util';
import { signToken, TokenPayload, verifyToken } from './token.util';

const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8 ชั่วโมง
const MAX_FAILED_ATTEMPTS = 10;
const LOCK_WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly secret: string;
  private readonly failures = new Map<string, { count: number; since: number }>();
  private dummyHash?: Promise<string>;

  constructor(private prisma: PrismaService) {
    const configured = process.env.JWT_SECRET;
    if (configured && configured.length >= 16) {
      this.secret = configured;
    } else {
      // ไม่ใช้ค่าเริ่มต้นที่คนอื่นเดาได้: สุ่มใหม่ทุกครั้งที่เปิดเซิร์ฟเวอร์ (โทเคนเก่าจะใช้ไม่ได้หลังรีสตาร์ต)
      this.secret = randomBytes(32).toString('hex');
      this.logger.warn('ยังไม่ได้ตั้งค่า JWT_SECRET (อย่างน้อย 16 ตัวอักษร) จึงใช้ค่าสุ่มชั่วคราว ผู้ดูแลจะต้องล็อกอินใหม่ทุกครั้งที่เซิร์ฟเวอร์รีสตาร์ต');
    }
  }

  /** สร้าง/อัปเดตบัญชีผู้ดูแลจาก ADMIN_USERNAME + ADMIN_PASSWORD ใน environment */
  async onModuleInit(): Promise<void> {
    const username = process.env.ADMIN_USERNAME?.trim();
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) {
      this.logger.warn('ยังไม่ได้ตั้งค่า ADMIN_USERNAME / ADMIN_PASSWORD จึงยังไม่มีบัญชีผู้ดูแล (ดูข้อมูลได้ แต่เพิ่ม/แก้ไข/ลบไม่ได้)');
      return;
    }
    if (username.length > 50 || password.length < 8) {
      this.logger.error('ADMIN_USERNAME ต้องไม่เกิน 50 ตัวอักษร และ ADMIN_PASSWORD ต้องมีอย่างน้อย 8 ตัวอักษร จึงข้ามการสร้างบัญชีผู้ดูแล');
      return;
    }
    try {
      const existing = await this.prisma.adminUser.findUnique({ where: { username } });
      if (!existing) {
        await this.prisma.adminUser.create({ data: { username, passwordHash: await hashPassword(password) } });
        this.logger.log(`สร้างบัญชีผู้ดูแล "${username}" แล้ว`);
      } else if (!(await verifyPassword(password, existing.passwordHash))) {
        await this.prisma.adminUser.update({ where: { username }, data: { passwordHash: await hashPassword(password) } });
        this.logger.log(`อัปเดตรหัสผ่านของผู้ดูแล "${username}" ตามค่าใน environment แล้ว`);
      }
    } catch (e: any) {
      this.logger.error(`ตั้งค่าบัญชีผู้ดูแลไม่สำเร็จ (ลองรัน prisma migrate deploy แล้วหรือยัง?): ${e?.message ?? e}`);
    }
  }

  async login(username: string, password: string, clientKey: string) {
    this.assertNotLocked(clientKey);
    const user = await this.prisma.adminUser.findUnique({ where: { username: username.trim() } });
    // ตรวจรหัสผ่านทุกครั้ง (แม้ไม่พบผู้ใช้) เพื่อให้เวลาตอบใกล้เคียงกัน
    const hash = user?.passwordHash ?? (await this.getDummyHash());
    const ok = await verifyPassword(password, hash);
    if (!user || !ok) {
      this.recordFailure(clientKey);
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    this.failures.delete(clientKey);
    return {
      accessToken: signToken({ sub: user.id, username: user.username }, this.secret, TOKEN_TTL_SECONDS),
      tokenType: 'Bearer' as const,
      expiresIn: TOKEN_TTL_SECONDS,
      username: user.username
    };
  }

  verify(token: string): TokenPayload | null {
    return verifyToken(token, this.secret);
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
    return this.dummyHash;
  }

  private assertNotLocked(key: string): void {
    const entry = this.failures.get(key);
    if (!entry) return;
    if (Date.now() - entry.since > LOCK_WINDOW_MS) {
      this.failures.delete(key);
      return;
    }
    if (entry.count >= MAX_FAILED_ATTEMPTS) {
      throw new HttpException('ล็อกอินผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private recordFailure(key: string): void {
    const now = Date.now();
    const entry = this.failures.get(key);
    if (!entry || now - entry.since > LOCK_WINDOW_MS) this.failures.set(key, { count: 1, since: now });
    else entry.count += 1;
    if (this.failures.size > 1000) {
      for (const [k, v] of this.failures) if (now - v.since > LOCK_WINDOW_MS) this.failures.delete(k);
    }
  }
}
