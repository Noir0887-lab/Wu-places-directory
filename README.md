# WU Places Directory — Full-stack coursework starter

ระบบสารบบอาคารเรียนมหาวิทยาลัยวลัยลักษณ์ ใช้เทคโนโลยีตามโจทย์อาจารย์: Angular + Tailwind CSS (Frontend), NestJS + REST API (Backend), PostgreSQL + Prisma ORM (Database) และ Leaflet/OpenStreetMap (ฟีเจอร์แผนที่เสริม)

> สถานะปัจจุบัน: Frontend เดิมยังเป็น prototype ที่เก็บข้อมูลใน localStorage ส่วน Backend API และฐานข้อมูล PostgreSQL/Prisma ถูกเพิ่มเป็นโครงสร้างพร้อมพัฒนา/ทดสอบแยกแล้ว **ยังต้องเชื่อม Angular service กับ API ก่อนจึงจะถือว่าเป็น Full-stack ที่สมบูรณ์ตามเกณฑ์อาจารย์** อย่านำเสนอว่าเชื่อม API แล้วจนกว่าจะทำ integration และทดสอบจริง

## 1. สิ่งที่มีในโปรเจกต์
- Frontend: Angular standalone components, Angular Routing, Tailwind CSS v4, responsive layout
- หน้ารายการอาคาร, รายละเอียด, เพิ่ม/แก้ไข, ค้นหา, กรองประเภท, validation, map
- Backend: NestJS REST API พร้อม CRUD, Search/Filter, validation, duplicate-code handling
- Database: PostgreSQL ผ่าน Docker Compose
- Prisma models: `Place` และ `PlaceType` มี one-to-many relation
- API endpoints: `GET /api/places`, `GET /api/places/:id`, `POST /api/places`, `PATCH /api/places/:id`, `DELETE /api/places/:id`, `GET /api/place-types`

## 2. สิ่งที่ต้องติดตั้ง
- Node.js LTS
- Docker Desktop (สำหรับเปิด PostgreSQL ง่ายที่สุด)
- VS Code

## 3. รัน Frontend
เปิด Terminal ที่โฟลเดอร์หลักนี้:
```bash
npm install
npm start
```
เปิด http://localhost:4200

## 4. รัน PostgreSQL
ต้องเปิด Docker Desktop ก่อน จากนั้นเปิด Terminal ที่โฟลเดอร์หลัก:
```bash
docker compose up -d
```
ถ้าไม่มี Docker Desktop ให้ติดตั้ง PostgreSQL เอง แล้วปรับ DATABASE_URL ใน `backend/.env` ให้ตรงกับการติดตั้ง

## 5. ตั้งค่าและรัน Backend
เปิด Terminal ใหม่ แล้วรัน:
```powershell
cd backend
npm install
```
คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วรัน:
```powershell
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```
Backend จะอยู่ที่ http://localhost:3000/api

## 6. ทดสอบ API
เปิดใน browser:
- http://localhost:3000/api/places
- http://localhost:3000/api/place-types

สำหรับ POST/PATCH/DELETE ใช้ Thunder Client หรือ Postman ได้

## 7. Business rules
- ชื่ออาคารและรหัสอาคารห้ามว่าง
- รหัสอาคารต้องไม่ซ้ำ (ตรวจซ้ำโดย unique constraint ใน PostgreSQL และแปลงเป็นตัวพิมพ์ใหญ่)
- ประเภทอาคารที่ถูกใช้งานอยู่จะไม่สามารถลบได้ (relation ใช้ onDelete: Restrict)
- จำนวนชั้นต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไปเมื่อระบุ

## 8. โครงสร้างฐานข้อมูล
- `PlaceType`: ประเภทอาคาร
- `Place`: ข้อมูลอาคาร และมี `typeId` เป็น foreign key ไปยัง `PlaceType.id`
- ความสัมพันธ์: PlaceType 1 รายการ มี Place ได้หลายรายการ (one-to-many)

## 9. ข้อควรตรวจสอบก่อนส่ง
- Frontend ยังใช้ localStorage; ต้องเปลี่ยน `PlaceStoreService` ให้เรียก `HttpClient` และปรับหน้าต่าง ๆ ให้รองรับ async API response
- เพิ่ม Loading/Error/Empty states จากผล API และทดสอบ CRUD จากหน้าเว็บจริง
- ข้อมูลตัวอย่าง รหัสอาคาร และพิกัดแผนที่เป็นข้อมูลเพื่อทดสอบเท่านั้น ต้องตรวจสอบข้อมูลทางการก่อนนำเสนอ
- ทุกคนในกลุ่มควรเข้าใจ Controller, Service, Prisma, relation และขั้นตอนที่เกิดขึ้นเมื่อเพิ่ม/แก้ไข/ลบข้อมูล
