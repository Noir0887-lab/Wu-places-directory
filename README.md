# WU Places Directory — Full-stack Project

ระบบสารบบอาคารเรียนและสถานที่สำคัญ มหาวิทยาลัยวลัยลักษณ์ พัฒนาขึ้นเป็นโปรเจกต์ Full-stack สมบูรณ์แบบตามโจทย์รายวิชา

## 1. สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend:** Angular (Standalone Components, Tailwind CSS, Responsive Design)
- **Backend:** NestJS พร้อม REST API
- **Database & ORM:** PostgreSQL จัดการผ่าน Prisma ORM
- **Cloud Deployment:** 
  - Frontend โฮสต์บน **Vercel** (`https://wu-places-directory.vercel.app`)
  - Backend โฮสต์บน **Render** (`https://wu-places-directory.onrender.com/api`)

## 2. ฟีเจอร์และการทำงานของระบบ
- แสดงรายชื่ออาคารและรายละเอียดข้อมูลสถานที่
- ระบบค้นหาอาคารตามชื่อหรือรหัส และตัวกรองแยกตามประเภทอาคาร
- ฟังก์ชันเพิ่ม, แก้ไข, และลบข้อมูลอาคาร (CRUD Operations) เชื่อมต่อฐานข้อมูลจริงผ่าน API
- รองรับการแสดงผลพิกัดแผนที่สถานที่

## 3. ลิงก์เข้าชมระบบออนไลน์ (สำหรับอาจารย์ตรวจงาน)
- **เว็บไซต์หลัก (Frontend):** https://wu-places-directory.vercel.app
- **ระบบหลังบ้าน (Backend API):** https://wu-places-directory.onrender.com/api/places
- **Source Code (GitHub):** https://github.com/Noir0887-lab/Wu-places-directory

> **หมายเหตุ:** เนื่องจากระบบ Backend โฮสต์บนเซิร์ฟเวอร์ฟรีของ Render หากไม่มีการใช้งานเป็นเวลานาน เซิร์ฟเวอร์อาจเข้าสู่โหมดประหยัดพลังงาน (Sleep) การกดเข้าใช้งานครั้งแรกอาจใช้เวลาโหลดประมาณ 30–50 วินาทีในคำขอแรก หลังจากนั้นระบบจะทำงานได้อย่างรวดเร็วตามปกติ

## 4. Business Rules & Database
- ชื่ออาคารและรหัสอาคารห้ามว่าง และรหัสอาคารต้องไม่ซ้ำกัน
- ประเภทอาคารที่มีการใช้งานอยู่จะไม่สามารถลบได้ (`onDelete: Restrict`)
- โครงสร้างฐานข้อมูลประกอบด้วยตาราง `Place` (ข้อมูลอาคาร) และ `PlaceType` (ประเภทอาคาร) เชื่อมความสัมพันธ์แบบ One-to-Many