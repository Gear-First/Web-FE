import { trimOrEmpty, trimOrUndefined } from "../../utils/string";

interface CategoryBase {
  name: string;
  description?: string;
}

export interface CategoryRecord extends CategoryBase {
  id: number | string;
}

export type CategoryCreateDTO = CategoryBase;
export type CategoryUpdateDTO = Partial<CategoryBase>;
export type CategoryFormModel = CategoryBase;

export interface CategoryDetailRecord extends CategoryRecord {
  createdAt: string;
  updatedAt: string;
}

function normalizeCategory(form: CategoryFormModel): CategoryBase {
  return {
    name: form.name.trim(),
    description: trimOrUndefined(form.description),
  };
}

// 폼 -> 생성 DTO
export function toCategoryCreatePayload(
  form: CategoryFormModel
): CategoryCreateDTO {
  const normalized = normalizeCategory(form);
  return {
    name: normalized.name,
    description: trimOrEmpty(normalized.description),
  };
}

// 폼 -> 수정 DTO
export function toCategoryUpdatePayload(
  form: CategoryFormModel
): CategoryUpdateDTO {
  const normalized = normalizeCategory(form);
  return {
    ...(normalized.name ? { name: normalized.name } : {}),
    ...(normalized.description !== undefined
      ? { description: normalized.description }
      : {}),
  };
}
