export interface PlaceType {
  id: number;
  name: string;
}

export interface Place {
  id: number;
  name: string;
  code: string;
  typeId: number;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  floors?: number;
}

export const PLACE_TYPES: PlaceType[] = [
  { id: 1, name: 'อาคารเรียนรวม' },
  { id: 2, name: 'อาคารเรียน' },
  { id: 3, name: 'อาคารปฏิบัติการ' }
];