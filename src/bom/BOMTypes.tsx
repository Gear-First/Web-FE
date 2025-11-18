import type { AddMaterialsPayload } from "./components/BOMRegisterModal";

export interface Material {
  materialId: number;
  materialName: string;
  materialCode: string;
  materialQty: number;
  materialPrice?: number;
}

export interface BOMRecord {
  bomCodeId: string;
  bomCode: string;
  category: string;
  partId: string;
  partCode: string;
  partName: string;
  createdDate: string;
  materials?: Material[];
}

export interface BOMDetail extends BOMRecord {
  materials: Material[];
}

export type BOMCreateDTO = {
  partId: number;
  materialInfos: { materialId: number; quantity: number }[];
};

export const toBOMCreatePayload = (dto: AddMaterialsPayload): BOMCreateDTO => ({
  partId: Number(dto.partId),
  materialInfos: dto.materialInfos.map((m) => ({
    materialId: Number(m.materialId),
    quantity: Number(m.quantity),
  })),
});

export type BOMUpdateDTO = Partial<BOMCreateDTO>;

export interface BOMFormModel extends BOMCreateDTO {
  bomId?: string;
  createdDate?: string;
}

export type BOMDTO = BOMFormModel;

export const toBOMPatchPayload = (dto: BOMFormModel): BOMUpdateDTO => {
  const patch: BOMUpdateDTO = {};
  if (dto.partId !== undefined) patch.partId = Number(dto.partId);
  if (dto.materialInfos?.length) {
    patch.materialInfos = dto.materialInfos.map((m) => ({
      materialId: Number(m.materialId),
      quantity: Number(m.quantity),
    }));
  }
  return patch;
};

export interface ServerBOMItem {
  bomCodeId: number;
  bomCode: string;
  category: string;
  partId: string;
  partCode: string;
  partName: string;
  createdAt: string;
}
export interface ServerBOMMaterialItem {
  materialId: number;
  materialName: string;
  materialCode: string;
  materialPrice: number;
  materialQuantity: number;
}
export const toBOMRecord = (s: ServerBOMItem): BOMRecord => ({
  bomCodeId: String(s.bomCodeId),
  bomCode: s.bomCode,
  category: s.category,
  partId: s.partId,
  partCode: s.partCode,
  partName: s.partName,
  createdDate: s.createdAt,
});
export const toMaterial = (s: ServerBOMMaterialItem): Material => ({
  materialId: s.materialId,
  materialName: s.materialName,
  materialCode: s.materialCode,
  materialQty: Number(s.materialQuantity),
  materialPrice: Number(s.materialPrice),
});

export type DeleteBOMMaterialsDTO = {
  partId: number | string;
  materialIds: number[];
};
