import type {
  MaterialRecord,
  MaterialCreateDTO,
  MaterialUpdateDTO,
} from "./MaterialTypes";
import {
  INVENTORY_ENDPOINTS,
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
  id: number;
  materialName: string;
  materialCode: string;
  createdDate?: string;
};

// 목록 조회 파라미터 (서버가 지원하는 것만 전달)
export type MaterialListParams = {
  keyword?: string; // 서버가 지원하면 사용
  startDate?: string | null; // 서버가 지원하면 사용
  endDate?: string | null; // 서버가 지원하면 사용
  page?: number; // 1-based(화면 기준) -> 서버 0-based로 변환
  pageSize?: number;
};

// 서버 → 앱 모델 변환
function toMaterialRecord(item: MaterialListItem): MaterialRecord {
  return {
    id: item.id,
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

  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  if (params?.keyword) qs.set("keyword", params.keyword.trim());
  if (params?.page != null)
    qs.set("page", String(Math.max(0, params.page - 1)));
  if (params?.pageSize != null) qs.set("size", String(params.pageSize));

  const url = qs.toString()
    ? `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/getMaterialList?${qs.toString()}`
    : `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/getMaterialList`;

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

export async function fetchMaterialDetail(id: string): Promise<MaterialRecord> {
  const res = await fetch(`/api/materials/records/${id}`);
  if (!res.ok) throw new Error(`Material 상세 요청 실패 (${res.status})`);
  return res.json();
}

export async function createMaterial(
  payload: MaterialCreateDTO
): Promise<MaterialCreateDTO> {
  const url = `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/addMaterial`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([payload]),
  });
  if (!res.ok) throw new Error(`자재 생성 실패 (${res.status})`);
  return res.json();
}

export async function updateMaterial(
  id: string,
  patch: MaterialUpdateDTO
): Promise<MaterialRecord> {
  const res = await fetch(
    `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/updateMaterial/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  if (!res.ok) throw new Error(`Material 수정 실패 (${res.status})`);
  return res.json();
}

export async function deleteMaterial(item: {
  materialId: number;
  materialName?: string;
  materialCode?: string;
}): Promise<{
  ok: boolean;
  removedId: string;
}> {
  const res = await fetch(
    `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/deleteMaterial`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([item]),
    }
  );
  if (!res.ok) throw new Error(`Material 삭제 실패 (${res.status})`);
  return res.json();
}
