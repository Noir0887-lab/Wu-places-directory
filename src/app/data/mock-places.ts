import { Place } from '../models/place.model';

// พิกัดเป็นตำแหน่งตัวอย่างโดยประมาณในบริเวณมหาวิทยาลัย
// ควรตรวจสอบพิกัดอาคารจริงก่อนนำไปใช้งานจริง
export const MOCK_PLACES: Place[] = [
  {
    id: 1, name: 'อาคารเรียนรวม 1', code: 'RB1', typeId: 1,
    description: 'อาคารสำหรับการเรียนการสอนและห้องเรียนรวม',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6426, longitude: 99.8972, floors: 4
  },
  {
    id: 2, name: 'อาคารเรียนรวม 3', code: 'RB3', typeId: 1,
    description: 'พื้นที่ห้องเรียนสำหรับการเรียนการสอนของนักศึกษา',
    imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6418, longitude: 99.8962, floors: 4
  },
  {
    id: 3, name: 'อาคารเรียนรวม 5', code: 'RB5', typeId: 1,
    description: 'อาคารเรียนรวมภายในมหาวิทยาลัยวลัยลักษณ์',
    imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6434, longitude: 99.8954, floors: 4
  },
  {
    id: 4, name: 'อาคารเรียนรวม 7', code: 'RB7', typeId: 1,
    description: 'อาคารเรียนสำหรับรายวิชาต่าง ๆ ของมหาวิทยาลัย',
    imageUrl: 'https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6442, longitude: 99.8970, floors: 4
  },
  {
    id: 5, name: 'อาคารศาสตราจารย์ ดร. สมบัติ ธำรงธัญวงศ์', code: 'ST', typeId: 2,
    description: 'อาคารเรียนและพื้นที่ใช้งานทางวิชาการ',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6407, longitude: 99.8948, floors: 5
  },
  {
    id: 6, name: 'อาคารปฏิบัติการสถาปัตยกรรมและการออกแบบ', code: 'AD', typeId: 3,
    description: 'พื้นที่ปฏิบัติการและการเรียนรู้ด้านสถาปัตยกรรมและการออกแบบ',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6399, longitude: 99.8981, floors: 3
  },
  {
    id: 7, name: 'อาคาร Next Gen', code: 'NG', typeId: 2,
    description: 'พื้นที่การเรียนรู้ที่รองรับรูปแบบการเรียนการสอนสมัยใหม่',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
    latitude: 8.6450, longitude: 99.8990, floors: 4
  }
];