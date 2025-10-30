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
  category?: ServerPartCategory;
  createdAt?: string;
}
export interface ServerPartDetail {
  id: number | string;
  code: string;
  name: string;
  price: number;
  category?: ServerPartCategory;
  imageUrl?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** UI 레코드 (테이블) — 서버와 거의 동일, 필드만 평탄화 */
export interface PartRecord {
  partId: string;
  partCode: string;
  partName: string;
  category: { id: number | string; name: string };
  createdDate: string; // createdAt
  enabled?: boolean; // 상세에는 필수, 목록에는 선택 (서버에 따라 없을 수 있음)
}

/** UI 상세 레코드 */
export interface PartDetailRecord extends PartRecord {
  price: number;
  imageUrl?: string;
  enabled: boolean; // 상세는 항상 존재
  updatedDate: string; // updatedAt
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
export function mapServerToPartRecord(
  s: ServerPartListItem | ServerPartDetail
): PartRecord {
  return {
    partId: String(s.id),
    partCode: s.code,
    partName: s.name,
    category: { id: s.category?.id ?? 0, name: s.category?.name ?? "" },
    createdDate: "createdAt" in s ? s.createdAt ?? "" : "",
    enabled:
      "enabled" in s ? Boolean((s as ServerPartDetail).enabled) : undefined,
  };
}

/** 서버 → UI(상세) */
export function mapServerToPartDetail(s: ServerPartDetail): PartDetailRecord {
  return {
    partId: String(s.id),
    partCode: s.code,
    partName: s.name,
    price: Number(s.price ?? 0),
    category: { id: s.category?.id ?? 0, name: s.category?.name ?? "" },
    imageUrl: s.imageUrl || undefined,
    enabled: Boolean(s.enabled),
    createdDate: s.createdAt ?? "",
    updatedDate: s.updatedAt ?? "",
  };
}
