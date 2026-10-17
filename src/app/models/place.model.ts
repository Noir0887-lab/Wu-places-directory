export interface PlaceType {
  id: number;
  name: string;
}

export interface PlaceImage {
  id?: number;
  url: string;
  caption?: string;
}

// ห้อง / พื้นที่ภายในอาคาร
export interface Room {
  id?: number;
  floor: number;
  name: string;
  code?: string;
  category?: string;
  capacity?: number | null;
  description?: string;
}

export interface Place {
  id: number;
  name: string;
  code: string;
  typeId: number;
  description: string;
  // รูปปก (= รูปแรกของ images) เก็บไว้เพื่อให้ข้อมูลเดิมยังใช้ได้
  imageUrl: string;
  latitude: number;
  longitude: number;
  floors?: number | null;
  images?: PlaceImage[];
  rooms?: Room[];
  _count?: { rooms: number };
}

// ข้อมูลที่ส่งไปสร้าง/แก้ไขอาคาร
export type PlacePayload = Omit<Place, 'id' | '_count'>;

export const PLACE_TYPES: PlaceType[] = [
  { id: 1, name: 'อาคารเรียนรวม' },
  { id: 2, name: 'อาคารเรียน' },
  { id: 3, name: 'อาคารปฏิบัติการ' }
];

// ประเภทห้อง (ต้องตรงกับ ROOM_CATEGORIES ใน backend/src/places/dto/room.dto.ts)
export const ROOM_CATEGORIES = [
  'ห้องเรียน',
  'ห้องปฏิบัติการ',
  'ห้องประชุม',
  'ห้องพักอาจารย์/สำนักงาน',
  'ห้องน้ำ',
  'ลิฟต์/บันได',
  'ร้านอาหาร/ร้านค้า',
  'พื้นที่ส่วนกลาง',
  'อื่นๆ'
];

export const MAX_IMAGES = 12;

/** รูปทั้งหมดของอาคาร: ใช้ images ถ้ามี ไม่เช่นนั้นใช้ imageUrl เดิม (ข้อมูลเก่า) */
export function placeImages(place: Pick<Place, 'images' | 'imageUrl'>): PlaceImage[] {
  if (place.images?.length) return place.images;
  return place.imageUrl ? [{ url: place.imageUrl }] : [];
}

export function coverImage(place: Pick<Place, 'images' | 'imageUrl'>): string {
  return placeImages(place)[0]?.url ?? '';
}
