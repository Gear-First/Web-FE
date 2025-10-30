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

/** 서버가 반환하는 레코드(조회/상세) */
export interface BOMRecord {
  bomCodeId: string;
  bomCode: string;
  category: PartCate;
  partCode: string;
  partName: string;
  materials: Material[];
  createdDate: string;
}

/** 생성 요청용 DTO (클라이언트 → 서버) */
export interface BOMCreateDTO {
  partCode: string;
  partName: string;
  category: PartCate;
  materials: Array<
    Pick<Material, "materialCode" | "materialName" | "materialQty">
  >;
}

/** 수정 요청용 DTO (부분 수정 허용) */
export type BOMUpdateDTO = Partial<BOMCreateDTO>;

/** 화면 폼 모델(등록/수정 공용) */
export interface BOMFormModel extends BOMCreateDTO {
  bomId?: string;
  createdDate?: string;
}

/** 기존 DTO 별칭이 필요하면 유지 */
export type BOMDTO = BOMFormModel;

/* ------ 편의 매퍼 ------ */
export const toBOMCreatePayload = (dto: BOMFormModel): BOMCreateDTO => ({
  partCode: dto.partCode.trim(),
  partName: dto.partName.trim(),
  category: dto.category,
  materials: dto.materials.map((m) => ({
    materialCode: m.materialCode.trim(),
    materialName: m.materialName.trim(),
    materialQty: Number(m.materialQty),
  })),
});

export const toBOMPatchPayload = (dto: BOMFormModel): BOMUpdateDTO => {
  const patch: BOMUpdateDTO = {};
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
