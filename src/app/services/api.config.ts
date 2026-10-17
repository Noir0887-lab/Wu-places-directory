// ที่อยู่ของ Backend API: ถ้าเปิดเว็บจาก localhost จะต่อกับ backend ในเครื่อง (npm run start:dev ในโฟลเดอร์ backend)
// นอกนั้นต่อกับ Backend ที่ deploy บน Render
const isLocal = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

export const API_URL = isLocal ? 'http://localhost:3000/api' : 'https://wu-places-directory.onrender.com/api';
