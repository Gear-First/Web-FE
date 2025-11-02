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
  page?: number;
  pageSize?: number;
  sort?: string[] | string;
};

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
      serial: string;
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
        serial: l.product.serial,
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
export async function fetchInboundRecords(
  params?: InboundListParams
): Promise<ListResponse<InboundRecord[]>> {
  const qs = new URLSearchParams();

  if (params?.status) qs.set("status", params.status);
  if (params?.date) qs.set("date", params.date);
  if (params?.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params?.dateTo) qs.set("dateTo", params.dateTo);
  if (params?.warehouseCode) qs.set("warehouseCode", params.warehouseCode);

  qs.set("page", String(Math.max(0, (params?.page ?? 1) - 1)));
  qs.set("size", String(params?.pageSize ?? 20));

  if (params?.sort) {
    const sorts = Array.isArray(params.sort) ? params.sort : [params.sort];
    sorts.forEach((s) => qs.append("sort", s));
  }

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
