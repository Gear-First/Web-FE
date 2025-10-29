import type {
  PartRecords,
  PartCreateDTO,
  PartUpdateDTO,
  PartDetail,
  PartCategory,
} from "./PartTypes";
import {
  type ApiResponse,
  type ListResponse,
  WAREHOUSE_ENDPOINTS,
} from "../../api";
import { toPartCreateBody, toPartUpdateBody } from "./PartTypes";

/** React Query keys */
export const partKeys = {
  records: ["part", "records"] as const,
  detail: (id: string | number) => ["part", "detail", String(id)] as const,
};

export const partCategoryKeys = {
  list: ["partCategory", "list"] as const,
};

/** 목록 조회 파라미터 */
export type PartListParams = {
  q?: string;
  /** 기본 auto: 코드처럼 보이면 code, 아니면 name */
  searchBy?: "auto" | "code" | "name";
  categoryId?: number;
  page?: number; // 1-based
  pageSize?: number;
  /** 정렬을 커스텀하려면 넣음. 예: ["name,desc","code,asc"] */
  sort?: string[] | string;
};

/* ========== 서버 스키마 ========== */
type ServerPartCategory = { id: number; name: string };
type ServerPartListItem = {
  id: number | string;
  code: string;
  name: string;
  category?: ServerPartCategory;
};
type ServerPartList = {
  items: ServerPartListItem[];
  page: number; // 0-based
  size: number;
  total: number;
};

type ServerPartDetail = {
  id: number | string;
  code: string;
  name: string;
  price: number;
  category?: ServerPartCategory;
  imageUrl?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

/* ========== 유틸/매핑 ========== */
const looksLikeCode = (q: string) => /^[A-Za-z0-9._-]+$/.test(q);

function toPartRecord(s: ServerPartListItem | ServerPartDetail): PartRecords {
  return {
    partId: String(s.id),
    partCode: s.code,
    partName: s.name,
    category: {
      id: s.category?.id ?? 0,
      name: s.category?.name ?? "",
    },
    createdDate: "createdAt" in s ? s.createdAt ?? "" : "",
    // enabled: "enabled" in s ? Boolean(s.enabled) : undefined,
  };
}

function toPartDetail(s: ServerPartDetail): PartDetail {
  return {
    partId: String(s.id),
    partCode: s.code,
    partName: s.name,
    price: Number(s.price ?? 0),
    category: {
      id: s.category?.id ?? 0,
      name: s.category?.name ?? "",
    },
    imageUrl: s.imageUrl || undefined,
    enabled: Boolean(s.enabled),
    createdDate: s.createdAt ?? "",
    updatedDate: s.updatedAt ?? "",
  };
}

function buildQuery(params?: PartListParams) {
  const qs = new URLSearchParams();
  if (!params) {
    // 기본 정렬
    qs.append("sort", "name,asc");
    qs.append("sort", "code,asc");
    return qs;
  }

  // UI 1-based → 서버 0-based
  if (params.page != null) qs.set("page", String(Math.max(1, params.page) - 1));
  if (params.pageSize != null) qs.set("size", String(params.pageSize));

  const q = params.q?.trim();
  if (q) {
    const mode = params.searchBy ?? "auto";
    if (mode === "code") qs.set("code", q);
    else if (mode === "name") qs.set("name", q);
    else qs.set(looksLikeCode(q) ? "code" : "name", q); // auto
  }

  if (params.categoryId != null) {
    qs.set("categoryId", String(params.categoryId));
  }

  // 정렬
  if (params.sort) {
    const sorts = Array.isArray(params.sort) ? params.sort : [params.sort];
    sorts.forEach((s) => qs.append("sort", s));
  } else {
    qs.append("sort", "name,asc");
    qs.append("sort", "code,asc");
  }

  return qs;
}

/* ========== API ========== */

/** 목록 조회 */
export async function fetchPartRecords(
  params?: PartListParams
): Promise<ListResponse<PartRecords[]>> {
  const qs = buildQuery(params);
  const url = qs.toString()
    ? `${WAREHOUSE_ENDPOINTS.PARTS_LIST}?${qs.toString()}`
    : `${WAREHOUSE_ENDPOINTS.PARTS_LIST}`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`부품 목록 요청 실패 (${res.status})`);

  const json: ApiResponse<ServerPartList> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 목록 조회 실패");

  const page = json.data;
  const rows = page.items.map(toPartRecord);
  const totalPages =
    page.size > 0 ? Math.max(1, Math.ceil(page.total / page.size)) : 1;

  return {
    data: rows,
    meta: {
      total: page.total,
      page: (page.page ?? 0) + 1,
      pageSize: page.size,
      totalPages,
    },
  };
}

/** 상세 조회 */
export async function fetchPartDetail(
  id: string | number
): Promise<PartDetail> {
  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PARTS_LIST}/${id}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`Part 상세 요청 실패 (${res.status})`);
  const json: ApiResponse<ServerPartDetail> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 상세 조회 실패");
  return toPartDetail(json.data);
}

/** 생성 — UI DTO → 서버 바디 매핑 사용 */
export async function createPart(payload: PartCreateDTO): Promise<PartRecords> {
  const body = toPartCreateBody({
    // PartCreateDTO(화면명)과 PartFormModel 구조가 같다는 전제. 필요시 변환.
    partCode: payload.partCode,
    partName: payload.partName,
    partPrice: payload.partPrice,
    categoryId: payload.categoryId,
    imageUrl: payload.imageUrl,
  });

  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PARTS_LIST}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Part 생성 실패 (${res.status})`);
  const json: ApiResponse<ServerPartDetail> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 생성 실패");
  return toPartRecord(json.data);
}

/** 수정 — PATCH로 부분 수정 */
export async function updatePart(
  id: string | number,
  patch: PartUpdateDTO
): Promise<PartRecords> {
  const body = toPartUpdateBody({
    partCode: patch.partCode ?? "",
    partName: patch.partName ?? "",
    partPrice: patch.partPrice as number,
    categoryId: patch.categoryId as number,
    imageUrl: patch.imageUrl,
    enabled: patch.enabled,
  });

  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PARTS_LIST}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Part 수정 실패 (${res.status})`);
  const json: ApiResponse<ServerPartDetail> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 수정 실패");
  return toPartRecord(json.data);
}

/** 삭제 */
export async function deletePart(
  id: string | number
): Promise<{ ok: boolean; removedId: string }> {
  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PARTS_LIST}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Part 삭제 실패 (${res.status})`);
  const json: ApiResponse<Record<string, boolean>> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 삭제 실패");
  return { ok: true, removedId: String(id) };
}

/** 카테고리 목록 조회 */
export async function fetchPartCategories(
  keyword?: string
): Promise<PartCategory[]> {
  const base =
    WAREHOUSE_ENDPOINTS.PART_CATEGORIES ??
    `${WAREHOUSE_ENDPOINTS.PARTS_LIST}/categories`;
  const url =
    keyword && keyword.trim()
      ? `${base}?keyword=${encodeURIComponent(keyword.trim())}`
      : base;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`카테고리 목록 요청 실패 (${res.status})`);
  const json: ApiResponse<PartCategory[]> = await res.json();
  if (!json.success) throw new Error(json.message || "카테고리 목록 조회 실패");
  return json.data;
}
