export type PartCate =
  | "카테고리 A"
  | "카테고리 B"
  | "카테고리 C"
  | "카테고리 D";

export interface Material {
  materialName: string;
  materialCode: string;
  materialQty: number;
}
export interface BOMRecord {
  bomId: string;
  partName: string;
  partCode: string;
  category: PartCate;
  materials: Material[];
  createdDate: string;
}
