import type {
  MaterialRecord,
  MaterialCreateDTO,
  MaterialUpdateDTO,
} from "./MaterialTypes";
import {
  BASE_URL,
  type ApiPage,
  type ApiResponse,
  type ListResponse,
} from "../../api";

export const materialKeys = {
  records: ["material", "records"] as const,
  detail: (id: string) => ["material", "detail", id] as const,
};

// 서버 단일 아이템
type MaterialListItem = {
  id?: number; // 서버가 주면 사용 (예시 응답에 존재)
  materialName: string;
  materialCode: string;
  createdDate?: string;
};

// 목록 조회 파라미터 (서버가 지원하는 것만 전달)
export type MaterialListParams = {
  q?: string; // 서버가 지원하면 사용
  startDate?: string | null; // 서버가 지원하면 사용
  endDate?: string | null; // 서버가 지원하면 사용
  page?: number; // 1-based(화면 기준) -> 서버 0-based로 변환
  pageSize?: number;
};

// 서버 → 앱 모델 변환
function toMaterialRecord(item: MaterialListItem): MaterialRecord {
  return {
    materialCode: item.materialCode,
    materialName: item.materialName,
    createdDate: item.createdDate ?? "",
  };
}

// 목록 조회: 서버 페이징 그대로 사용
export async function fetchMaterialRecords(
  params?: MaterialListParams
): Promise<ListResponse<MaterialRecord[]>> {
  const qs = new URLSearchParams();

  // 페이지/사이즈: 화면은 1-based, 서버는 0-based
  if (params?.page != null)
    qs.set("page", String(Math.max(0, params.page - 1)));
  if (params?.pageSize != null) qs.set("size", String(params.pageSize));

  // 검색/날짜: 서버가 지원하는 경우에만 전달 (미지원이면 제거)
  if (params?.q) qs.set("q", params.q.trim());
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);

  const url = qs.toString()
    ? `${BASE_URL}/inventory/api/v1/getMaterialList?${qs.toString()}`
    : `${BASE_URL}/inventory/api/v1/getMaterialList`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Material 목록 요청 실패 (${res.status})`);

  const json: ApiResponse<ApiPage<MaterialListItem>> = await res.json();
  if (!json.success) throw new Error(json.message || "자재 목록 조회 실패");

  const page = json.data;
  const rows = page.content.map(toMaterialRecord);

  // 서버 메타 → 앱 메타로 그대로 매핑 (화면은 1-based)
  return {
    data: rows,
    meta: {
      total: page.totalElements,
      page: (page.page ?? 0) + 1,
      pageSize: page.size,
      totalPages: page.totalPages,
    },
  };
}

// 상세/생성/수정/삭제: 기존(MSW) 유지
export async function fetchMaterialDetail(id: string): Promise<MaterialRecord> {
  const res = await fetch(`/api/materials/records/${id}`);
  if (!res.ok) throw new Error(`Material 상세 요청 실패 (${res.status})`);
  return res.json();
}

export async function createMaterial(
  payload: MaterialCreateDTO
): Promise<MaterialRecord> {
  const res = await fetch(`/api/materials/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Material 생성 실패 (${res.status})`);
  return res.json();
}

export async function updateMaterial(
  id: string,
  patch: MaterialUpdateDTO
): Promise<MaterialRecord> {
  const res = await fetch(`/api/materials/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Material 수정 실패 (${res.status})`);
  return res.json();
}

export async function deleteMaterial(
  id: string
): Promise<{ ok: boolean; removedId: string }> {
  const res = await fetch(`/api/materials/records/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Material 삭제 실패 (${res.status})`);
  return res.json();
}
