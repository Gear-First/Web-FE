import { trimOrUndefined, toBoolean } from "../../utils/string";

/** 서버 응답 스키마 */
export interface ServerPartCategory {
  id: number | string;
  name: string;
}
export interface ServerPartListItem {
  id: number | string;
  code: string;
  name: string;
  price?: number | null;
  imageUrl?: string | null;
  safetyStockQty?: number | null;
  enabled?: boolean;
  category?: ServerPartCategory | null;
  categoryId?: number | string | null;
  categoryName?: string | null;
  carModelIds?: Array<number | string>;
  carModelNames?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface ServerPartDetail extends ServerPartListItem {
  description?: string | null;
}

/** UI 레코드 (테이블) — 서버와 거의 동일, 필드만 평탄화 */
export interface PartRecord {
  partId: string;
  partCode: string;
  partName: string;
  price: number;
  safetyStockQty: number | null;
  category: { id: number | string; name: string };
  carModelNames: string[];
  imageUrl?: string;
  enabled?: boolean; // 상세에는 필수, 목록에는 선택 (서버에 따라 없을 수 있음)
  createdDate: string; // createdAt
  updatedDate: string;
}

/** UI 상세 레코드 */
export interface PartDetailRecord extends PartRecord {
  enabled: boolean; // 상세는 항상 존재
}

/** UI 폼 모델 */
export interface PartFormModel {
  partCode: string;
  partName: string;
  partPrice: number;
  categoryId: number | string;
  imageUrl?: string;
  enabled?: boolean; // 수정에서만 사용
}

/** 서버 DTO (서버 키로 통일) */
export interface PartCreateDTO {
  code: string;
  name: string;
  price: number;
  categoryId: number | string;
  imageUrl?: string;
}
export type PartUpdateDTO = Partial<PartCreateDTO> & { enabled?: boolean };

/** ===== 정규화 & 매핑 ===== */

/** 폼 → 내부 정규화(한 번만) */
function normalizePartForm(form: PartFormModel) {
  return {
    code: form.partCode.trim(),
    name: form.partName.trim(),
    price: Number(form.partPrice),
    categoryId:
      typeof form.categoryId === "string"
        ? form.categoryId.trim()
        : Number(form.categoryId),
    imageUrl: trimOrUndefined(form.imageUrl),
    enabled: toBoolean(form.enabled),
  };
}

/** 폼 -> 생성 DTO */
export function toPartCreateDTO(form: PartFormModel): PartCreateDTO {
  const n = normalizePartForm(form);
  const dto: PartCreateDTO = {
    code: n.code,
    name: n.name,
    price: n.price,
    // 문자열/숫자 모두 허용(서버 스펙에 맞게)
    categoryId: n.categoryId,
  };
  if (n.imageUrl !== undefined) dto.imageUrl = n.imageUrl;
  return dto;
}

/** 폼 -> 수정 DTO (Partial, omit 정책) */
export function toPartUpdateDTO(form: PartFormModel): PartUpdateDTO {
  const n = normalizePartForm(form);
  const patch: PartUpdateDTO = {};
  if (n.code) patch.code = n.code;
  if (n.name) patch.name = n.name;
  if (!Number.isNaN(n.price)) patch.price = n.price;
  if (n.categoryId !== undefined) patch.categoryId = n.categoryId;
  if (n.imageUrl !== undefined) patch.imageUrl = n.imageUrl;
  if (n.enabled !== undefined) patch.enabled = n.enabled;
  return patch;
}

/** 서버 → UI(목록) */
const toCategory = (
  source: ServerPartListItem | ServerPartDetail
): { id: number | string; name: string } => {
  const fromObject = source.category;
  const id =
    fromObject?.id ??
    (source.categoryId !== undefined && source.categoryId !== null
      ? source.categoryId
      : 0);
  const name =
    fromObject?.name ??
    (source.categoryName !== undefined && source.categoryName !== null
      ? source.categoryName
      : "");
  return {
    id,
    name,
  };
};

const normalizeCarModels = (names?: string[] | null): string[] =>
  Array.isArray(names) && names.length > 0 ? names.filter(Boolean) : [];

const normalizeSafetyStock = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

/** 서버 → UI(목록) */
export function mapServerToPartRecord(
  s: ServerPartListItem | ServerPartDetail
): PartRecord {
  return {
    partId: String(s.id),
    partCode: s.code,
    partName: s.name,
    price: Number(s.price ?? 0),
    safetyStockQty: normalizeSafetyStock(s.safetyStockQty),
    category: toCategory(s),
    carModelNames: normalizeCarModels(s.carModelNames),
    imageUrl: s.imageUrl || undefined,
    enabled: "enabled" in s ? Boolean(s.enabled) : undefined,
    createdDate: s.createdAt ?? "",
    updatedDate: s.updatedAt ?? "",
  };
}

/** 서버 → UI(상세) */
export function mapServerToPartDetail(s: ServerPartDetail): PartDetailRecord {
  const base = mapServerToPartRecord(s);
  return {
    ...base,
    enabled: Boolean(s.enabled),
  };
}
