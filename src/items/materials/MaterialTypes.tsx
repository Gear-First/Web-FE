export interface MaterialRecord {
  materialId: string;
  materialName: string;
  materialCode: string;
  createdDate: string;
}

/** 생성용 DTO (등록 폼 → 서버) */
export interface MaterialCreateDTO {
  materialCode: string;
  materialName: string;
}

/** 수정용 DTO (부분 수정 허용) */
export type MaterialUpdateDTO = Partial<MaterialCreateDTO>;

/** 화면 폼 모델 (등록/수정 공용) — 화면 상태 보관용 */
export interface MaterialFormModel extends MaterialCreateDTO {
  materialId?: string; // 수정 시 존재
  createdDate?: string; // 화면 표시용
}

/** (옵션) 기존 코드 호환용 별칭 — 필요 없으면 제거 가능 */
export type MaterialDTO = MaterialFormModel;

/* ---- 편의 매퍼(원하면 사용) ---- */

/** 폼 DTO → 서버 전송용 payload (생성) */
export const toMaterialCreatePayload = (
  dto: MaterialFormModel
): MaterialCreateDTO => ({
  materialCode: dto.materialCode.trim(),
  materialName: dto.materialName.trim(),
});

/** 폼 DTO → 서버 전송용 payload (수정) */
export const toMaterialPatchPayload = (
  dto: MaterialFormModel
): MaterialUpdateDTO => {
  const patch: MaterialUpdateDTO = {};
  if (dto.materialCode) patch.materialCode = dto.materialCode.trim();
  if (dto.materialName) patch.materialName = dto.materialName.trim();
  return patch;
};
