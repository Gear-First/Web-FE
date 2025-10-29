export interface CategoryRecord {
  id: number | string;
  name: string;
  description?: string;
}

export interface CategoryCreateDTO {
  name: string;
  description?: string;
}

export type CategoryUpdateDTO = Partial<CategoryCreateDTO>;

export interface CategoryFormModel {
  name: string;
  description?: string;
}

export interface CategoryDetailRecord {
  id: number | string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 폼 -> 생성 DTO
export function toCategoryCreatePayload(
  form: CategoryFormModel
): CategoryCreateDTO {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || "",
  };
}

// 폼 -> 수정 DTO
export function toCategoryUpdatePayload(
  form: CategoryFormModel
): CategoryUpdateDTO {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || "",
  };
}
