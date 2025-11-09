import {
  type PartCreateDTO,
  type PartUpdateDTO,
  toPartUpdateDTO,
  toPartCreateDTO,
  type PartRecord,
  type PartDetailRecord,
  type ServerPartCategory,
  type ServerPartDetail,
  type ServerPartListItem,
  mapServerToPartDetail,
  mapServerToPartRecord,
} from "./PartTypes";
import {
  type ApiResponse,
  type ListResponse,
  WAREHOUSE_ENDPOINTS,
} from "../../api";

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
  categoryId?: number | string;
  categoryName?: string;
  carModelId?: number | string;
  carModelName?: string;
  enabled?: boolean;
  page?: number; // 1-based
  pageSize?: number;
  /** 정렬을 커스텀하려면 넣음. 예: ["name,desc","code,asc"] */
  sort?: string[] | string;
};

type ServerPartList = {
  items?: ServerPartListItem[];
  content?: ServerPartListItem[];
  page?: number; // 0-based
  size?: number;
  total?: number;
  totalElements?: number;
  totalPages?: number;
};

const SORT_WHITELIST = new Set([
  "code",
  "name",
  "price",
  "createdAt",
  "updatedAt",
]);

function buildQuery(params?: PartListParams) {
  const qs = new URLSearchParams();
  if (!params) {
    qs.append("sort", "updatedAt,desc");
    return qs;
  }

  // UI 1-based → 서버 0-based
  if (params.page != null) qs.set("page", String(Math.max(1, params.page) - 1));
  if (params.pageSize != null) qs.set("size", String(params.pageSize));

  const q = params.q?.trim();
  if (q) qs.set("q", q);

  if (params.categoryId != null)
    qs.set("categoryId", String(params.categoryId));
  if (params.categoryName?.trim())
    qs.set("categoryName", params.categoryName.trim());
  if (params.carModelId != null)
    qs.set("carModelId", String(params.carModelId));
  if (params.carModelName?.trim())
    qs.set("carModelName", params.carModelName.trim());
  if (params.enabled !== undefined)
    qs.set("enabled", String(params.enabled));

  let sortApplied = false;
  if (params.sort) {
    const sorts = Array.isArray(params.sort) ? params.sort : [params.sort];
    sorts.forEach((entry) => {
      const [fieldRaw, orderRaw] = entry.split(",");
      const field = fieldRaw?.trim();
      if (!field || !SORT_WHITELIST.has(field)) return;
      const order = orderRaw?.trim().toLowerCase() === "desc" ? "desc" : "asc";
      qs.append("sort", `${field},${order}`);
      sortApplied = true;
    });
  }

  if (!sortApplied) {
    qs.append("sort", "updatedAt,desc");
  }

  return qs;
}

/* ========== API ========== */

/** 목록 조회 */
export async function fetchPartRecords(
  params?: PartListParams
): Promise<ListResponse<PartRecord[]>> {
  const qs = buildQuery(params);
  const integratedBase =
    WAREHOUSE_ENDPOINTS.PARTS_INTEGRATED ??
    `${WAREHOUSE_ENDPOINTS.PARTS_LIST}/integrated`;
  const url = qs.toString()
    ? `${integratedBase}?${qs.toString()}`
    : integratedBase;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`부품 목록 요청 실패 (${res.status})`);

  const json: ApiResponse<ServerPartList> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 목록 조회 실패");

  const page = json.data ?? {};
  const items =
    (Array.isArray(page.items) && page.items.length > 0
      ? page.items
      : Array.isArray(page.content)
      ? page.content
      : []) as ServerPartListItem[];
  const rows = items.map((item) => mapServerToPartRecord(item));
  const totalPages =
    (page.size ?? 0) > 0
      ? Math.max(
          1,
          Math.ceil(
            (page.total ?? page.totalElements ?? rows.length) /
              (page.size ?? 1)
          )
        )
      : 1;

  return {
    data: rows,
    meta: {
      total: page.total ?? page.totalElements ?? rows.length,
      page: (page.page ?? 0) + 1,
      pageSize: page.size ?? rows.length,
      totalPages,
    },
  };
}

export async function fetchPartDetail(
  id: string | number
): Promise<PartDetailRecord> {
  const url = `${WAREHOUSE_ENDPOINTS.PARTS_LIST}/${id}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Part 상세 요청 실패 (${res.status})`);
  const json: ApiResponse<ServerPartDetail> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 상세 조회 실패");
  return mapServerToPartDetail(json.data);
}

export async function createPart(payload: PartCreateDTO): Promise<PartRecord> {
  const body = toPartCreateDTO({
    // PartCreateDTO(화면명)과 PartFormModel 구조가 같다는 전제. 필요시 변환.
    partCode: payload.code,
    partName: payload.name,
    partPrice: payload.price,
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
  return mapServerToPartRecord(json.data);
}

/** 수정 — PATCH로 부분 수정 */
export async function updatePart(
  id: string | number,
  patch: PartUpdateDTO
): Promise<PartRecord> {
  const body = toPartUpdateDTO({
    partCode: patch.code ?? "",
    partName: patch.name ?? "",
    partPrice: patch.price as number,
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
  return mapServerToPartRecord(json.data);
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
): Promise<ServerPartCategory[]> {
  const base =
    WAREHOUSE_ENDPOINTS.PART_CATEGORIES ??
    `${WAREHOUSE_ENDPOINTS.PARTS_LIST}/categories`;
  const url =
    keyword && keyword.trim()
      ? `${base}?keyword=${encodeURIComponent(keyword.trim())}`
      : base;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`카테고리 목록 요청 실패 (${res.status})`);
  const json: ApiResponse<ServerPartCategory[]> = await res.json();
  if (!json.success) throw new Error(json.message || "카테고리 목록 조회 실패");
  return json.data;
}
