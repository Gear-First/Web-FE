import {
  type ApiResponse,
  type ListResponse,
  WAREHOUSE_BASE_PATH,
} from "../api";
import {
  type CarModelRecord,
  type PartCarModelCreateDTO,
  type PartCarModelMapping,
  type PartCarModelUpdateDTO,
  type ServerCarModel,
  type ServerCarModelPart,
  type ServerPage,
  type ServerPartCarModel,
  type CarModelPartRecord,
  toCarModelPartRecord,
  toCarModelRecord,
  toPartCarModelMapping,
} from "./CarModelTypes";

const CAR_MODEL_ENDPOINT = `${WAREHOUSE_BASE_PATH}/car-models`;
const PARTS_ENDPOINT = `${WAREHOUSE_BASE_PATH}/parts`;

const MODEL_SORT_WHITELIST = new Set(["name", "createdAt", "updatedAt"]);
const PART_SORT_WHITELIST = new Set(["name", "code", "createdAt", "updatedAt"]);

export const carModelKeys = {
  list: (params: unknown) => ["carModel", "list", params] as const,
};

export const partCarModelKeys = {
  list: (partId: number | string, params: unknown) =>
    ["part", "carModels", String(partId), params] as const,
};

export const carModelPartKeys = {
  list: (carModelId: number | string, params: unknown) =>
    ["carModel", "parts", String(carModelId), params] as const,
};

export type CarModelListParams = {
  q?: string;
  enabled?: boolean;
  page?: number; // 1-based
  pageSize?: number;
  sort?: string | string[];
};

export type PartCarModelListParams = {
  name?: string;
  page?: number;
  pageSize?: number;
  sort?: string | string[];
};

export type CarModelPartListParams = {
  code?: string;
  name?: string;
  categoryId?: number | string;
  page?: number;
  pageSize?: number;
  sort?: string | string[];
};

/* ======================= helpers ======================= */

function buildSort(qs: URLSearchParams, sort: string | string[] | undefined) {
  if (!sort) return;
  const entries = Array.isArray(sort) ? sort : [sort];
  entries.forEach((value) => {
    if (!value) return;
    const [fieldRaw, orderRaw] = value.split(",");
    const field = fieldRaw?.trim();
    if (!field) return;
    const order = orderRaw?.trim().toLowerCase() === "desc" ? "desc" : "asc";
    qs.append("sort", `${field},${order}`);
  });
}

function mapPagedResponse<T, R>(
  payload: ServerPage<T> | undefined,
  mapper: (item: T) => R
): ListResponse<R[]> {
  const page = payload ?? {};
  const source = Array.isArray(page.items)
    ? page.items
    : Array.isArray(page.content)
    ? page.content
    : [];
  const rows = source.map(mapper);
  const total = page.total ?? page.totalElements ?? rows.length;
  const size = page.size ?? (rows.length > 0 ? rows.length : 0);
  const totalPages = page.totalPages
    ? Math.max(1, page.totalPages)
    : size > 0
    ? Math.max(1, Math.ceil(total / Math.max(1, size)))
    : 1;
  return {
    data: rows,
    meta: {
      total,
      page: (page.page ?? 0) + 1,
      pageSize: size || rows.length,
      totalPages,
    },
  };
}

function appendPaging(qs: URLSearchParams, page?: number, size?: number) {
  if (page != null) qs.set("page", String(Math.max(0, page - 1)));
  if (size != null) qs.set("size", String(size));
}

function resolvePartId(partId: number | string): number {
  if (typeof partId === "number") return partId;
  const parsed = Number(partId);
  if (Number.isNaN(parsed)) {
    throw new Error("유효하지 않은 부품 ID");
  }
  return parsed;
}

/* ======================= APIs ======================= */

export async function fetchCarModels(
  params?: CarModelListParams
): Promise<ListResponse<CarModelRecord[]>> {
  const qs = new URLSearchParams();
  if (params?.q?.trim()) qs.set("q", params.q.trim());
  if (params?.enabled !== undefined)
    qs.set("enabled", String(params.enabled));
  appendPaging(qs, params?.page, params?.pageSize);

  if (params?.sort) {
    const entries = Array.isArray(params.sort) ? params.sort : [params.sort];
    entries.forEach((value) => {
      if (!value) return;
      const [fieldRaw, orderRaw] = value.split(",");
      const field = fieldRaw?.trim();
      if (!field || !MODEL_SORT_WHITELIST.has(field)) return;
      const order = orderRaw?.trim().toLowerCase() === "desc" ? "desc" : "asc";
      qs.append("sort", `${field},${order}`);
    });
  } else {
    qs.append("sort", "name,asc");
  }

  const url = qs.toString() ? `${CAR_MODEL_ENDPOINT}?${qs.toString()}` : CAR_MODEL_ENDPOINT;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`차량 모델 목록 요청 실패 (${res.status})`);
  const json: ApiResponse<ServerPage<ServerCarModel>> = await res.json();
  if (!json.success) throw new Error(json.message || "차량 모델 목록 조회 실패");
  return mapPagedResponse(json.data, toCarModelRecord);
}

export async function fetchPartCarModels(
  partId: number | string,
  params?: PartCarModelListParams
): Promise<ListResponse<PartCarModelMapping[]>> {
  const numericId = resolvePartId(partId);
  if (!numericId)
    return { data: [], meta: { total: 0, page: 1, pageSize: 0, totalPages: 1 } };
  const qs = new URLSearchParams();
  if (params?.name?.trim()) qs.set("name", params.name.trim());
  appendPaging(qs, params?.page, params?.pageSize);
  if (params?.sort) buildSort(qs, params.sort);

  const url = qs.toString()
    ? `${PARTS_ENDPOINT}/${numericId}/car-models?${qs.toString()}`
    : `${PARTS_ENDPOINT}/${numericId}/car-models`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`부품-차량 모델 목록 요청 실패 (${res.status})`);
  const json: ApiResponse<ServerPage<ServerPartCarModel>> = await res.json();
  if (!json.success)
    throw new Error(json.message || "부품-차량 모델 목록 조회 실패");
  return mapPagedResponse(json.data, (item) =>
    toPartCarModelMapping(item, numericId)
  );
}

export async function createPartCarModelMapping(
  partId: number | string,
  payload: PartCarModelCreateDTO
): Promise<PartCarModelMapping> {
  const numericId = resolvePartId(partId);
  const res = await fetch(`${PARTS_ENDPOINT}/${numericId}/car-models`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`부품-차량 모델 매핑 생성 실패 (${res.status})`);
  const json: ApiResponse<ServerPartCarModel> = await res.json();
  if (!json.success) throw new Error(json.message || "매핑 생성 실패");
  return toPartCarModelMapping(json.data, numericId);
}

export async function updatePartCarModelMapping(
  partId: number | string,
  carModelId: number,
  payload: PartCarModelUpdateDTO
): Promise<PartCarModelMapping> {
  const numericId = resolvePartId(partId);
  const res = await fetch(`${PARTS_ENDPOINT}/${numericId}/car-models/${carModelId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`부품-차량 모델 매핑 수정 실패 (${res.status})`);
  const json: ApiResponse<ServerPartCarModel> = await res.json();
  if (!json.success) throw new Error(json.message || "매핑 수정 실패");
  return toPartCarModelMapping(json.data, numericId);
}

export async function deletePartCarModelMapping(
  partId: number | string,
  carModelId: number
): Promise<void> {
  const numericId = resolvePartId(partId);
  const res = await fetch(`${PARTS_ENDPOINT}/${numericId}/car-models/${carModelId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`부품-차량 모델 매핑 삭제 실패 (${res.status})`);
}

export async function fetchCarModelParts(
  carModelId: number,
  params?: CarModelPartListParams
): Promise<ListResponse<CarModelPartRecord[]>> {
  if (!carModelId)
    return { data: [], meta: { total: 0, page: 1, pageSize: 0, totalPages: 1 } };
  const qs = new URLSearchParams();
  if (params?.code?.trim()) qs.set("code", params.code.trim());
  if (params?.name?.trim()) qs.set("name", params.name.trim());
  if (params?.categoryId != null)
    qs.set("categoryId", String(params.categoryId));
  appendPaging(qs, params?.page, params?.pageSize);
  if (params?.sort) {
    const entries = Array.isArray(params.sort) ? params.sort : [params.sort];
    entries.forEach((value) => {
      if (!value) return;
      const [fieldRaw, orderRaw] = value.split(",");
      const field = fieldRaw?.trim();
      if (!field || !PART_SORT_WHITELIST.has(field)) return;
      const order = orderRaw?.trim().toLowerCase() === "desc" ? "desc" : "asc";
      qs.append("sort", `${field},${order}`);
    });
  }
  const url = qs.toString()
    ? `${CAR_MODEL_ENDPOINT}/${carModelId}/parts?${qs.toString()}`
    : `${CAR_MODEL_ENDPOINT}/${carModelId}/parts`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`차량 모델 적용 부품 목록 요청 실패 (${res.status})`);
  const json: ApiResponse<ServerPage<ServerCarModelPart>> = await res.json();
  if (!json.success)
    throw new Error(json.message || "차량 모델 적용 부품 조회 실패");
  return mapPagedResponse(json.data, toCarModelPartRecord);
}
