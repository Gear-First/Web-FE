// 조회용 (서버 응답)
export interface MaterialRecord {
  materialId?: string;
  materialCode: string;
  materialName: string;
  createdDate?: string;
}

// 생성용 DTO (등록)
export interface MaterialCreateDTO {
  materialCode: string;
  materialName: string;
}

// 수정용 DTO (PATCH)
export type MaterialUpdateDTO = Partial<MaterialCreateDTO>;

// 화면 폼 모델 (등록/수정 공용)
export interface MaterialFormModel extends MaterialCreateDTO {
  materialId?: string;
  createdDate?: string;
}

// 폼 → 서버 전송용 payload (생성)
export const toMaterialCreatePayload = (
  dto: MaterialFormModel
): MaterialCreateDTO => ({
  materialCode: dto.materialCode.trim(),
  materialName: dto.materialName.trim(),
});

// 폼 → 서버 전송용 payload (수정)
export const toMaterialPatchPayload = (
  dto: MaterialFormModel
): MaterialUpdateDTO => {
  const patch: MaterialUpdateDTO = {};
  if (dto.materialCode?.trim()) patch.materialCode = dto.materialCode.trim();
  if (dto.materialName?.trim()) patch.materialName = dto.materialName.trim();
  return patch;
};
