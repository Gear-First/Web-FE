import {
  INVENTORY_ENDPOINTS,
  type ApiPage,
  type ApiResponse,
  type ListResponse,
} from "../api";
import {
  type BOMRecord,
  type ServerBOMItem,
  type Material,
  type ServerBOMMaterialItem,
  toBOMRecord,
  toMaterial,
  type BOMCreateDTO,
  type DeleteBOMMaterialsDTO,
} from "./BOMTypes";

export const bomKeys = {
  records: ["bom", "records"] as const,
  detail: (id: string) => ["bom", "detail", id] as const, // 목록 헤더(필요시)
  materials: (id: string) => ["bom", "materials", id] as const, // 파트 자재
};

export type BOMListParams = {
  q?: string;
  category?: string | "ALL";
  startDate?: string | null;
  endDate?: string | null;
  page?: number; // 화면 1-based
  pageSize?: number;
};

export async function fetchBOMRecords(
  params?: BOMListParams
): Promise<ListResponse<BOMRecord[]>> {
  const qs = new URLSearchParams();

  if (params?.category && params.category !== "ALL")
    qs.set("category", params.category);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  if (params?.q?.trim()) qs.set("keyword", params.q.trim());
  if (params?.page != null)
    qs.set("page", String(Math.max(0, params.page - 1))); // 0-based
  if (params?.pageSize != null) qs.set("size", String(params.pageSize));

  const url = qs.toString()
    ? `${INVENTORY_ENDPOINTS.BOM_LIST}/getBomList?${qs.toString()}`
    : `${INVENTORY_ENDPOINTS.BOM_LIST}/getBomList`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`BOM 목록 요청 실패 (${res.status})`);

  const json = (await res.json()) as ApiResponse<ApiPage<ServerBOMItem>>;
  if (!json.success) throw new Error(json.message || "BOM 목록 조회 실패");

  const page = json.data;
  const rows = (page.content ?? []).map(toBOMRecord);

  return {
    data: rows,
    meta: {
      total: page.totalElements,
      page: (page.page ?? 0) + 1, // 다시 1-based로
      pageSize: page.size,
      totalPages: page.totalPages,
    },
  };
}

export async function fetchBOMMaterials(
  bomCodeId: string
): Promise<Material[]> {
  const url = `${INVENTORY_ENDPOINTS.BOM_LIST}/getMaterialList/${bomCodeId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BOM 자재 목록 요청 실패 (${res.status})`);

  const json = (await res.json()) as ApiResponse<ServerBOMMaterialItem[]>;
  if (!json.success) throw new Error(json.message || "BOM 자재 목록 조회 실패");

  return (json.data ?? []).map(toMaterial);
}

export async function addBOMMaterials(
  dto: BOMCreateDTO
): Promise<{ ok: boolean }> {
  const url = `${INVENTORY_ENDPOINTS.BOM_LIST}/addMaterialList/${dto.partId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("등록 실패");
  return { ok: true };
}

export async function deleteBOMMaterials(
  dto: DeleteBOMMaterialsDTO
): Promise<{ ok: boolean }> {
  const partIdNum = Number(dto.partId);
  if (!Number.isFinite(partIdNum)) {
    throw new Error(`partId가 유효하지 않습니다: ${String(dto.partId)}`);
  }
  if (!Array.isArray(dto.materialIds) || dto.materialIds.length === 0) {
    throw new Error("materialIds는 1개 이상인 배열이어야 합니다.");
  }

  const url = `${INVENTORY_ENDPOINTS.BOM_LIST}/deleteMaterialList/${partIdNum}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ partId: partIdNum, materialIds: dto.materialIds }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(
      `BOM 자재 삭제 실패 (${res.status})${msg ? ` - ${msg}` : ""}`
    );
  }
  try {
    return (await res.json()) ?? { ok: true };
  } catch {
    return { ok: true };
  }
}
