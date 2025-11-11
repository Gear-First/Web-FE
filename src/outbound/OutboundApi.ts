import type { OutboundRecord } from "./OutboundTypes";

const OUTBOUND_BASE_URL = "http://34.120.215.23/warehouse/api/v1/shipping";
const OUTBOUND_NOTES_ENDPOINT = `${OUTBOUND_BASE_URL}/notes`;

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_MIN = 1;
const PAGE_SIZE_MAX = 100;

export const outboundKeys = {
  base: ["outbound"] as const,
  notDoneRecords: ["outbound", "not-done"] as const,
  doneRecords: ["outbound", "done"] as const,
  detail: (id: string | number) => ["outbound", "detail", id] as const,
};

export type OutboundListParams = {
  status?: "all" | "not-done" | "done";
  dateFrom?: string | null;
  dateTo?: string | null;
  warehouseCode?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

function clampPageSize(size?: number): number {
  if (typeof size !== "number" || Number.isNaN(size)) return DEFAULT_PAGE_SIZE;
  return Math.max(PAGE_SIZE_MIN, Math.min(PAGE_SIZE_MAX, size));
}

function buildOutboundQuery(params?: OutboundListParams): URLSearchParams {
  const qs = new URLSearchParams();
  const status = params?.status ?? "all";
  qs.set("status", status);

  const pageZeroBased = Math.max(0, (params?.page ?? 1) - 1);
  qs.set("page", String(pageZeroBased));
  qs.set("size", String(clampPageSize(params?.pageSize)));

  const q = params?.q?.trim();
  if (q) qs.set("q", q);

  const warehouseCode = params?.warehouseCode?.trim();
  if (warehouseCode) qs.set("warehouseCode", warehouseCode);

  if (params?.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params?.dateTo) qs.set("dateTo", params.dateTo);

  return qs;
}

async function requestOutboundList(
  params: OutboundListParams | undefined,
  defaultStatus?: OutboundListParams["status"]
): Promise<ListResponse<OutboundRecord[]>> {
  const mergedParams: OutboundListParams = {
    ...(params ?? {}),
    ...(defaultStatus && !params?.status ? { status: defaultStatus } : {}),
  };

  const qs = buildOutboundQuery(mergedParams);
  const url =
    qs.toString().length > 0
      ? `${OUTBOUND_NOTES_ENDPOINT}?${qs.toString()}`
      : OUTBOUND_NOTES_ENDPOINT;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`출고 데이터 요청 실패 (${res.status})`);
  }

  const payload: any = await res.json().catch(() => ({}));
  const { items, total, page, size } = payload?.data ?? {};
  const resolvedSize = clampPageSize(size ?? mergedParams.pageSize);

  return {
    data: items ?? [],
    meta: {
      total: total ?? 0,
      page: (page ?? 0) + 1,
      pageSize: resolvedSize,
      totalPages:
        resolvedSize > 0
          ? Math.max(1, Math.ceil((total ?? 0) / resolvedSize))
          : 1,
    },
  };
}

export function fetchOutboundRecords(
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  return requestOutboundList(params, "all");
}

export function fetchOutboundNotDoneRecords(
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  return requestOutboundList(params, "not-done");
}

export function fetchOutboundDoneRecords(
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  return requestOutboundList(params, "done");
}

export async function fetchOutboundDetail(
  noteId: string | number
): Promise<OutboundRecord> {
  const url = `${OUTBOUND_NOTES_ENDPOINT}/${noteId}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`출고 상세 요청 실패 (${res.status})`);
  }

  const payload: any = await res.json().catch(() => ({}));
  return payload?.data as OutboundRecord;
}
