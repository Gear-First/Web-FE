// 조회용 (서버 응답)
export interface MaterialRecord {
  id: number;
  materialName: string;
  materialCode: string;
  createdDate?: string;
}

// 생성용 DTO (등록)
export interface MaterialCreateDTO {
  materialId: number;
  materialName: string;
  materialCode: string;
}

// 수정용 DTO (PATCH)
export type MaterialUpdateDTO = Partial<MaterialCreateDTO>;

// 화면 폼 모델 (등록/수정 공용)
export interface MaterialFormModel extends MaterialCreateDTO {
  createdDate?: string;
}

// 폼 → 서버 전송용 payload (생성)
export const toMaterialCreatePayload = (
  dto: MaterialFormModel
): MaterialCreateDTO => ({
  materialId: dto.materialId,
  materialName: dto.materialName.trim(),
  materialCode: dto.materialCode.trim(),
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
