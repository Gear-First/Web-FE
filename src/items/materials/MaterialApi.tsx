import type {
  MaterialRecords,
  MaterialCreateDTO,
  MaterialUpdateDTO,
} from "./MaterialTypes";

/** React Query keys */
export const materialKeys = {
  records: ["material", "records"] as const,
  detail: (id: string) => ["material", "detail", id] as const,
};

export type ListResponse<T> = {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

/** 목록 조회 파라미터 */
export type MaterialListParams = {
  q?: string;
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  pageSize?: number;
};

/** 내부: URLSearchParams 빌더 */
function buildQuery(params?: MaterialListParams) {
  const qs = new URLSearchParams();
  if (!params) return qs;

  if (params.q) qs.set("q", params.q);
  if (params.startDate) qs.set("startDate", params.startDate);
  if (params.endDate) qs.set("endDate", params.endDate);
  if (params.page != null) qs.set("page", String(params.page));
  if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));

  return qs;
}

/** 목록 조회 */
export async function fetchMaterialRecords(
  params?: MaterialListParams
): Promise<ListResponse<MaterialRecords[]>> {
  const qs = buildQuery(params);
  const url = qs.toString()
    ? `/api/materials/records?${qs.toString()}`
    : `/api/materials/records`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Material 목록 요청 실패 (${res.status})`);
  return res.json();
}

/** 상세 조회 */
export async function fetchMaterialDetail(
  id: string
): Promise<MaterialRecords> {
  const res = await fetch(`/api/materials/records/${id}`);
  if (!res.ok) throw new Error(`Material 상세 요청 실패 (${res.status})`);
  return res.json();
}

/** 생성 — materialId/createdDate는 서버(MSW)에서 채움 */
export async function createMaterial(
  payload: MaterialCreateDTO
): Promise<MaterialRecords> {
  const res = await fetch(`/api/materials/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Material 생성 실패 (${res.status})`);
  return res.json();
}

/** 수정(부분 업데이트) */
export async function updateMaterial(
  id: string,
  patch: MaterialUpdateDTO
): Promise<MaterialRecords> {
  const res = await fetch(`/api/materials/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Material 수정 실패 (${res.status})`);
  return res.json();
}

/** 삭제 */
export async function deleteMaterial(
  id: string
): Promise<{ ok: boolean; removedId: string }> {
  const res = await fetch(`/api/materials/records/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Material 삭제 실패 (${res.status})`);
  return res.json();
}
