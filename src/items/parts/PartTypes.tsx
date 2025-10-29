/** 서버 카테고리 모델 (응답용) */
export interface ServerPartCategory {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 서버 목록 아이템 */
export interface ServerPartListItem {
  id: number;
  code: string;
  name: string;
  category: { id: number; name: string };
  createdAt?: string;
}

/** 서버 상세 */
export interface ServerPartDetail {
  id: number;
  code: string;
  name: string;
  price: number;
  category: { id: number; name: string };
  imageUrl?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 공통 래퍼 */
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PageData<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

/* ================= 화면 모델 ================= */

/** 서버 카테고리 모델 */
export interface PartCategory {
  id: number;
  name: string;
  description?: string;
}

/** 목록/테이블용 레코드 */
export interface PartRecords {
  partId: string;
  partName: string;
  partCode: string;
  category: PartCategory;
  enabled?: boolean;
  createdDate: string;
}

/** 상세 전용(상세 화면/수정 프리필) */
export interface PartDetail {
  partId: string;
  partName: string;
  partCode: string;
  price: number;
  category: PartCategory;
  imageUrl?: string;
  enabled: boolean;
  createdDate: string; // createdAt
  updatedDate: string; // updatedAt
}

/** 생성 DTO (서버로 전달) — 서버 스펙에 enabled 없음 */
export interface PartCreateDTO {
  partCode: string;
  partName: string;
  partPrice: number;
  categoryId: number;
  imageUrl?: string;
}

/** 수정 DTO (PATCH/PUT) — enabled 허용 */
export type PartUpdateDTO = Partial<PartCreateDTO> & { enabled?: boolean };

/** 화면 폼 모델(등록/수정 공용) */
export interface PartFormModel {
  partCode: string;
  partName: string;
  partPrice: number;
  categoryId: number;
  imageUrl?: string;
  enabled?: boolean; // 수정에서만 사용
}

/** (옵션) 기존 코드 호환용 별칭 — 필요 없으면 제거 */
export type PartDTO = PartFormModel;

/* =============== 매퍼 =============== */

/** 서버 → 화면: 목록 아이템 */
export const mapSvrListItemToRecord = (
  svr: ServerPartListItem
): PartRecords => ({
  partId: String(svr.id),
  partCode: svr.code,
  partName: svr.name,
  category: { id: svr.category.id, name: svr.category.name },
  createdDate: svr.createdAt ?? "",
});

/** 서버 → 화면: 상세 */
export const mapSvrDetailToDetail = (svr: ServerPartDetail): PartDetail => ({
  partId: String(svr.id),
  partCode: svr.code,
  partName: svr.name,
  price: svr.price,
  category: { id: svr.category.id, name: svr.category.name },
  imageUrl: svr.imageUrl,
  enabled: svr.enabled,
  createdDate: svr.createdAt,
  updatedDate: svr.updatedAt,
});

/** 화면 폼 → 생성 payload(서버 바디) */
export const toPartCreateBody = (dto: PartFormModel) => ({
  code: dto.partCode.trim(),
  name: dto.partName.trim(),
  price: Number(dto.partPrice),
  categoryId: Number(dto.categoryId),
  ...(dto.imageUrl ? { imageUrl: dto.imageUrl.trim() } : {}),
  // enabled는 생성 스펙에 없으므로 제외
});

/** 화면 폼 → 수정 payload(서버 바디) */
export const toPartUpdateBody = (dto: PartFormModel) => {
  const body: {
    code?: string;
    name?: string;
    price?: number;
    categoryId?: number;
    imageUrl?: string;
    enabled?: boolean;
  } = {};
  if (dto.partCode) body.code = dto.partCode.trim();
  if (dto.partName) body.name = dto.partName.trim();
  if (dto.partPrice != null) body.price = Number(dto.partPrice);
  if (dto.categoryId != null) body.categoryId = Number(dto.categoryId);
  if (dto.imageUrl != null && dto.imageUrl !== "")
    body.imageUrl = dto.imageUrl.trim();
  if (dto.enabled != null) body.enabled = Boolean(dto.enabled);
  return body;
};

export const toPartCreatePayload = (form: PartFormModel): PartCreateDTO => ({
  partCode: form.partCode.trim(),
  partName: form.partName.trim(),
  partPrice: Number(form.partPrice),
  categoryId: Number(form.categoryId),
  ...(form.imageUrl ? { imageUrl: form.imageUrl.trim() } : {}),
});

export const toPartUpdatePayload = (form: PartFormModel): PartUpdateDTO => {
  const patch: PartUpdateDTO = {};

  if (form.partCode && form.partCode.trim() !== "") {
    patch.partCode = form.partCode.trim();
  }
  if (form.partName && form.partName.trim() !== "") {
    patch.partName = form.partName.trim();
  }
  if (form.partPrice != null) {
    patch.partPrice = Number(form.partPrice);
  }
  if (form.categoryId != null) {
    patch.categoryId = Number(form.categoryId);
  }
  if (form.imageUrl != null) {
    const v = form.imageUrl.trim();
    if (v !== "") patch.imageUrl = v;
  }
  if (form.enabled != null) {
    patch.enabled = Boolean(form.enabled);
  }

  return patch;
};

/* =============== 응답 타입 별칭 (편의) =============== */

export type PartListResponse = ApiResponse<PageData<ServerPartListItem>>;
export type PartDetailResponse = ApiResponse<ServerPartDetail>;
export type PartCreateResponse = ApiResponse<ServerPartDetail>; // 생성 응답도 상세와 동일 구조
export type PartUpdateResponse = ApiResponse<ServerPartDetail>;
