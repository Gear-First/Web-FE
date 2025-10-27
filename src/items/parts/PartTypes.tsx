import type { PartCate, Material } from "../../bom/BOMTypes";

/** 서버가 반환하는 완전한 레코드(조회/상세용) */
export interface PartRecords {
  partId: string;
  partName: string;
  partCode: string;
  category: PartCate;
  materials: Material[];
  createdDate: string; // 서버(또는 핸들러)에서 채움
}

/** 생성용 DTO(폼 → 서버) */
export interface PartCreateDTO {
  partCode: string;
  partName: string;
  category: PartCate;
  materials: Array<
    Pick<Material, "materialCode" | "materialName" | "materialQty">
  >;
}

/** 수정용 DTO(부분 수정 허용) */
export type PartUpdateDTO = Partial<PartCreateDTO>;

/** 화면 폼 모델(등록/수정 공용) — 화면 상태 보관용 */
export interface PartFormModel extends PartCreateDTO {
  partId?: string; // 수정 시에만 존재
  createdDate?: string; // 화면 표시에만 필요하면 선택
}

/** (옵션) 기존 코드 호환용 별칭 — 필요 없으면 제거 가능 */
export type PartDTO = PartFormModel;

/* ---- 편의 매퍼(원하면 사용) ---- */
export const toPartCreatePayload = (dto: PartFormModel): PartCreateDTO => ({
  partCode: dto.partCode.trim(),
  partName: dto.partName.trim(),
  category: dto.category,
  materials: dto.materials.map((m) => ({
    materialCode: m.materialCode.trim(),
    materialName: m.materialName.trim(),
    materialQty: Number(m.materialQty),
  })),
});

export const toPartPatchPayload = (dto: PartFormModel): PartUpdateDTO => {
  const patch: PartUpdateDTO = {};
  if (dto.partCode) patch.partCode = dto.partCode.trim();
  if (dto.partName) patch.partName = dto.partName.trim();
  if (dto.category) patch.category = dto.category;
  if (dto.materials) {
    patch.materials = dto.materials.map((m) => ({
      materialCode: m.materialCode.trim(),
      materialName: m.materialName.trim(),
      materialQty: Number(m.materialQty),
    }));
  }
  return patch;
};
