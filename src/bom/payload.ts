// src/features/bom/utils/payload.ts
import type { BOMDTO, BOMRecord, PartCate } from "./BOMTypes";

export const toCreatePayload = (dto: BOMDTO): Omit<BOMRecord, "bomId"> => ({
  partName: dto.partName.trim(),
  partCode: dto.partCode.trim(),
  category: dto.category as PartCate,
  materials: dto.materials.map((m) => ({
    materialName: m.materialName.trim(),
    materialCode: m.materialCode.trim(),
    materialQty: Number(m.materialQty) || 0,
  })),
  createdDate: dto.createdDate, // "YYYY-MM-DD"
});

// PATCH는 부분 업데이트 가능하므로 Partial로 가볍게 변환
export const toPatchPayload = (dto: BOMDTO): Partial<BOMRecord> => ({
  partName: dto.partName?.trim(),
  partCode: dto.partCode?.trim(),
  category: (dto.category as PartCate) ?? undefined,
  materials: dto.materials?.map((m) => ({
    materialName: m.materialName.trim(),
    materialCode: m.materialCode.trim(),
    materialQty: Number(m.materialQty) || 0,
  })),
  createdDate: dto.createdDate,
});
