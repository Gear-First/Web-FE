import { WAREHOUSE_ENDPOINTS, type ListResponse } from "../../api";
import {
  type CategoryRecord,
  type CategoryCreateDTO,
  type CategoryUpdateDTO,
  type CategoryDetailRecord,
} from "./CategoryTypes";

export const categoryKeys = {
  records: ["category", "records"] as const,
  detail: (id: string | number) => ["category", "detail", String(id)] as const,
};

export type CategoryListParams = {
  keyword?: string;
  startDate?: string | null;
  endDate?: string | null;
  page?: number; // 1-base
  pageSize?: number;
};

// 서버: { status, success, message, data: Category[] } 형태라고 가정
type ApiResponse<T> = {
  status: number;
  success: boolean;
  message: string;
  data: T;
};

// 배열 응답을 ListResponse로 감싸고, 클라에서 페이지네이션/검색 수행
export async function fetchCategory(
  params: CategoryListParams
): Promise<ListResponse<CategoryRecord[]>> {
  const url = `${WAREHOUSE_ENDPOINTS.PART_CATEGORIES}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`카테고리 조회 실패 (${res.status})`);
  const json: ApiResponse<CategoryRecord[]> = await res.json();
  if (!json.success) throw new Error(json.message || "카테고리 조회 실패");

  // 클라 필터/검색
  const keyword = (params.keyword ?? "").trim().toLowerCase();
  let items = Array.isArray(json.data) ? json.data : [];

  if (keyword) {
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        (c.description ?? "").toLowerCase().includes(keyword)
    );
  }

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return {
    data: paged,
    meta: { total, page, pageSize, totalPages },
  };
}

export async function fetchCategoryDetail(
  id: string | number
): Promise<CategoryDetailRecord> {
  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PART_CATEGORIES}/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`카테고리 상세 조회 실패 (${res.status})`);

  const json: ApiResponse<CategoryDetailRecord> = await res.json();
  if (!json.success) throw new Error(json.message || "카테고리 상세 조회 실패");

  return json.data;
}

export async function createCategory(
  dto: CategoryCreateDTO
): Promise<CategoryRecord> {
  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PART_CATEGORIES}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`카테고리 생성 실패 (${res.status})`);
  const json: ApiResponse<CategoryRecord> = await res.json();
  if (!json.success) throw new Error(json.message || "카테고리 생성 실패");
  return json.data;
}

export async function updateCategory(
  id: string | number,
  dto: CategoryUpdateDTO
): Promise<CategoryRecord> {
  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PART_CATEGORIES}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`카테고리 수정 실패 (${res.status})`);
  const json: ApiResponse<CategoryRecord> = await res.json();
  if (!json.success) throw new Error(json.message || "카테고리 수정 실패");
  return json.data;
}

export async function deleteCategory(
  id: string | number
): Promise<{ ok: true; removedId: string }> {
  const res = await fetch(`${WAREHOUSE_ENDPOINTS.PART_CATEGORIES}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`카테고리 삭제 실패 (${res.status})`);
  return { ok: true, removedId: String(id) };
}
