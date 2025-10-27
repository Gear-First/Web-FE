import type { BOMRecord, BOMCreateDTO, BOMUpdateDTO } from "./BOMTypes";

export const bomKeys = {
  records: ["bom", "records"] as const,
};

export type BOMListParams = {
  q?: string;
  category?: string | "ALL";
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  pageSize?: number;
};

export type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export async function fetchBOMRecords(
  params?: BOMListParams
): Promise<ListResponse<BOMRecord[]>> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.category) qs.set("category", params.category);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));

  const url = qs.toString()
    ? `/api/bom/records?${qs.toString()}`
    : `/api/bom/records`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`BOM 목록 요청 실패 (${res.status})`);
  return res.json();
}

export async function fetchBOMDetail(id: string): Promise<BOMRecord> {
  const res = await fetch(`/api/bom/records/${id}`);
  if (!res.ok) throw new Error(`BOM 상세 요청 실패 (${res.status})`);
  return res.json();
}

export async function createBOM(payload: BOMCreateDTO): Promise<BOMRecord> {
  const res = await fetch(`/api/bom/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`BOM 생성 실패 (${res.status})`);
  return res.json();
}

export async function updateBOM(
  id: string,
  patch: BOMUpdateDTO
): Promise<BOMRecord> {
  const res = await fetch(`/api/bom/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`BOM 수정 실패 (${res.status})`);
  return res.json();
}

export async function deleteBOM(
  id: string
): Promise<{ ok: boolean; removedId: string }> {
  const res = await fetch(`/api/bom/records/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`BOM 삭제 실패 (${res.status})`);
  return res.json();
}
