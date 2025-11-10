import {
  WAREHOUSE_ENDPOINTS,
  type ApiResponse,
  type ListResponse,
} from "../api";

import type {
  InboundDetailRecord,
  InboundDetailStatusRaw,
  InboundLineStatusRaw,
  InboundRecord,
  InboundStatus,
} from "./InboundTypes";

import { mapDetailLineStatus, mapNoteStatusToGroup } from "./InboundTypes";

export const inboundKeys = {
  records: ["inbound", "records"] as const,
  detail: (id: string | number) => ["inbound", "detail", id] as const,
};

/* ========== 목록 조회 파라미터 ========== */
export type InboundListParams = {
  status?: InboundStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  warehouseCode?: string;
  q?: string;
  receivingNo?: string;
  supplierName?: string;
  page?: number;
  pageSize?: number;
  sort?: string[] | string;
};

const SORTABLE_FIELDS = new Set([
  "requestedAt",
  "expectedReceiveDate",
  "completedAt",
  "receivingNo",
  "noteId",
  "status",
  "supplierName",
  "warehouseCode",
]);
const DEFAULT_SORTS = ["noteId,desc", "requestedAt,desc"];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_MIN = 1;
const PAGE_SIZE_MAX = 100;

function clampPageSize(size?: number): number {
  if (typeof size !== "number" || Number.isNaN(size)) return DEFAULT_PAGE_SIZE;
  return Math.max(PAGE_SIZE_MIN, Math.min(PAGE_SIZE_MAX, size));
}

function normalizeSort(sort?: string[] | string): string[] {
  const entries = Array.isArray(sort)
    ? sort
    : typeof sort === "string"
    ? [sort]
    : [];

  const sanitized = entries
    .map((entry) => {
      if (!entry) return null;
      const [fieldRaw, dirRaw] = entry.split(",");
      const field = (fieldRaw ?? "").trim();
      if (!field || !SORTABLE_FIELDS.has(field)) return null;
      const direction =
        (dirRaw ?? "").trim().toLowerCase() === "asc" ? "asc" : "desc";
      return `${field},${direction}`;
    })
    .filter(Boolean) as string[];

  return sanitized.length ? sanitized : [...DEFAULT_SORTS];
}

function sanitizeDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (DATE_REGEX.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : undefined;
}

function buildDateFilters(params?: InboundListParams): {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
} {
  if (!params) return {};

  const hasRange = Boolean(params.dateFrom || params.dateTo);
  const singleDate = !hasRange ? sanitizeDate(params.date) : undefined;

  let fromDate = hasRange ? sanitizeDate(params.dateFrom) : singleDate;
  let toDate = hasRange ? sanitizeDate(params.dateTo) : singleDate;

  if (!hasRange && !singleDate) return {};

  if (!fromDate && singleDate) fromDate = singleDate;
  if (!toDate && singleDate) toDate = singleDate;

  if (fromDate && toDate && fromDate > toDate) {
    const tmp = fromDate;
    fromDate = toDate;
    toDate = tmp;
  }

  if (!hasRange && singleDate) {
    return { date: singleDate };
  }

  const result: { date?: string; dateFrom?: string; dateTo?: string } = {};
  if (fromDate) result.dateFrom = fromDate;
  if (toDate) result.dateTo = toDate;
  return result;
}

function buildInboundQuery(params?: InboundListParams): URLSearchParams {
  const qs = new URLSearchParams();
  const status = params?.status ?? "all";
  qs.set("status", status);

  const pageZeroBased = Math.max(0, (params?.page ?? 1) - 1);
  qs.set("page", String(pageZeroBased));

  qs.set("size", String(clampPageSize(params?.pageSize)));

  const q = params?.q?.trim();
  if (q) qs.set("q", q);

  const receivingNo = params?.receivingNo?.trim();
  if (receivingNo) qs.set("receivingNo", receivingNo);

  const supplierName = params?.supplierName?.trim();
  if (supplierName) qs.set("supplierName", supplierName);

  const warehouseCode = params?.warehouseCode?.trim();
  if (warehouseCode) qs.set("warehouseCode", warehouseCode);

  const dateFilters = buildDateFilters(params);
  if (dateFilters.date) qs.set("date", dateFilters.date);
  if (dateFilters.dateFrom) qs.set("dateFrom", dateFilters.dateFrom);
  if (dateFilters.dateTo) qs.set("dateTo", dateFilters.dateTo);

  normalizeSort(params?.sort).forEach((s) => qs.append("sort", s));

  return qs;
}

/* ========== 서버 DTO ========== */
type ServerInboundListItem = {
  noteId: number;
  receivingNo?: string;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: string;
  warehouseCode?: string;
  requestedAt?: string;
  expectedReceiveDate?: string;
  completedAt: string | null;
};

type ServerInboundList = {
  items: ServerInboundListItem[];
  page: number;
  size: number;
  total: number;
};

type ServerInboundDetail = {
  noteId: number;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: InboundDetailStatusRaw;
  completedAt: string | null;
  receivingNo: string;
  warehouseCode: string | null;
  requestedAt: string;
  expectedReceiveDate: string | null;
  receivedAt: string | null;
  inspectorName: string | null;
  inspectorDept: string | null;
  inspectorPhone: string | null;
  remark: string | null;
  lines: Array<{
    lineId: number;
    product: {
      id: number;
      lot: string;
      code: string;
      name: string;
      imgUrl: string | null;
    };
    orderedQty: number;
    inspectedQty: number;
    status: InboundLineStatusRaw;
  }>;
};

/* ========== 서버 → UI 변환 ========== */
function toInboundRecord(s: ServerInboundListItem): InboundRecord {
  return {
    noteId: s.noteId,
    receivingNo: s.receivingNo ?? "-",
    supplierName: s.supplierName,
    itemKindsNumber: s.itemKindsNumber,
    totalQty: s.totalQty,
    status: mapNoteStatusToGroup(s.status),
    statusRaw: s.status,
    completedAt: s.completedAt ?? null,
    requestedAt: s.requestedAt ?? null,
    expectedReceiveDate: s.expectedReceiveDate ?? null,
    warehouseCode: s.warehouseCode ?? "-",
  };
}

export function toInboundDetailRecord(
  s: ServerInboundDetail
): InboundDetailRecord {
  return {
    receivingNo: s.receivingNo,
    supplierName: s.supplierName,
    itemKindsNumber: s.itemKindsNumber,
    totalQty: s.totalQty,
    status: s.status,

    completedAt: s.completedAt,
    requestedAt: s.requestedAt,
    expectedReceiveDate: s.expectedReceiveDate,
    receivedAt: s.receivedAt,
    warehouseCode: s.warehouseCode ?? null,

    inspectorName: s.inspectorName ?? null,
    inspectorDept: s.inspectorDept ?? null,
    inspectorPhone: s.inspectorPhone ?? null,
    remark: s.remark ?? "",

    lines: (s.lines ?? []).map((l) => ({
      lineId: String(l.lineId),
      product: {
        id: l.product.id,
        lot: l.product.lot,
        code: l.product.code,
        name: l.product.name,
        imgUrl: l.product.imgUrl ?? null,
      },
      orderedQty: l.orderedQty,
      inspectedQty: l.inspectedQty,
      status: mapDetailLineStatus(l.status),
    })),
  };
}

/* ========== API 호출 ========== */
async function requestInboundList(
  params: InboundListParams | undefined,
  defaultStatus?: InboundStatus
): Promise<ListResponse<InboundRecord[]>> {
  const mergedParams: InboundListParams = {
    ...(params ?? {}),
    ...(defaultStatus && !params?.status ? { status: defaultStatus } : {}),
  };

  const qs = buildInboundQuery(mergedParams);
  const base = `${WAREHOUSE_ENDPOINTS.INBOUND_LIST}/notes`;
  const url = qs.toString() ? `${base}?${qs.toString()}` : base;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`입고 데이터 요청 실패 (${res.status})`);

  const json: ApiResponse<ServerInboundList> = await res.json();
  if (!json.success) throw new Error(json.message || "입고 목록 조회 실패");

  const page = json.data ?? { items: [], page: 0, size: 0, total: 0 };
  const rows = Array.isArray(page.items) ? page.items.map(toInboundRecord) : [];
  console.debug("[GET] inbound list:", url);

  const totalPages =
    page.size > 0 ? Math.max(1, Math.ceil(page.total / page.size)) : 1;

  return {
    data: rows,
    meta: {
      total: page.total,
      page: (page.page ?? 0) + 1,
      pageSize: page.size,
      totalPages,
    },
  };
}

export function fetchInboundRecords(
  params?: InboundListParams
): Promise<ListResponse<InboundRecord[]>> {
  return requestInboundList(params, "all");
}

export function fetchInboundDoneRecords(
  params?: InboundListParams
): Promise<ListResponse<InboundRecord[]>> {
  return requestInboundList(params, "done");
}

export function fetchInboundNotDoneRecords(
  params?: InboundListParams
): Promise<ListResponse<InboundRecord[]>> {
  return requestInboundList(params, "not-done");
}

export async function fetchInboundDetail(
  noteId: string | number
): Promise<InboundDetailRecord> {
  const url = `${WAREHOUSE_ENDPOINTS.INBOUND_LIST}/${noteId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`입고 상세 요청 실패 (${res.status})`);

  const json: ApiResponse<ServerInboundDetail> = await res.json();
  if (!json.success) throw new Error(json.message || "입고 상세 조회 실패");

  return toInboundDetailRecord(json.data);
}
