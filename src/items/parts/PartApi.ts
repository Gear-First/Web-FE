import type { PartCate } from "../../bom/BOMTypes";
import type { PartRecords, PartCreateDTO, PartUpdateDTO } from "./PartTypes";

export const partKeys = {
  records: ["part", "records"] as const,
  detail: (id: string) => ["part", "detail", id] as const,
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
export type PartListParams = {
  q?: string;
  category?: PartCate | "ALL";
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  pageSize?: number;
};

/** 유틸: URLSearchParams 빌더 */
function buildQuery(params?: PartListParams) {
  const qs = new URLSearchParams();
  if (!params) return qs;

  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.startDate) qs.set("startDate", params.startDate);
  if (params.endDate) qs.set("endDate", params.endDate);
  if (params.page != null) qs.set("page", String(params.page));
  if (params.pageSize != null) qs.set("pageSize", String(params.pageSize));

  return qs;
}

/** 목록 조회 */
export async function fetchPartRecords(
  params?: PartListParams
): Promise<ListResponse<PartRecords[]>> {
  const qs = buildQuery(params);
  const url = qs.toString()
    ? `/api/parts/records?${qs.toString()}`
    : `/api/parts/records`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Part 목록 요청 실패 (${res.status})`);
  return res.json();
}

/** 상세 조회 */
export async function fetchPartDetail(id: string): Promise<PartRecords> {
  const res = await fetch(`/api/parts/records/${id}`);
  if (!res.ok) throw new Error(`Part 상세 요청 실패 (${res.status})`);
  return res.json();
}

/** 생성 — createdDate/partId는 서버(MSW)에서 채움 */
export async function createPart(payload: PartCreateDTO): Promise<PartRecords> {
  const res = await fetch(`/api/parts/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Part 생성 실패 (${res.status})`);
  return res.json();
}

/** 수정(부분 업데이트) */
export async function updatePart(
  id: string,
  patch: PartUpdateDTO
): Promise<PartRecords> {
  const res = await fetch(`/api/parts/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Part 수정 실패 (${res.status})`);
  return res.json();
}

/** 삭제 */
export async function deletePart(
  id: string
): Promise<{ ok: boolean; removedId: string }> {
  const res = await fetch(`/api/parts/records/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Part 삭제 실패 (${res.status})`);
  return res.json();
}
