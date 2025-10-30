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

export const inboundKeys = {
  records: ["inbound", "records"] as const,
  detail: (id: string | number) => ["inbound", "detail", id] as const,
};

export type InboundListParams = {
  /** 서버 스펙: 단일 날짜(예: 20201212) */
  date?: string;
  /** 서버 스펙: 창고 ID */
  warehouseId?: string | number;

  /** 기존 필드들 유지(선택): 상태/검색어 등 – 이번 엔드포인트에선 서버가 무시할 수 있음 */
  status?: InboundStatus | "ALL";
  q?: string;

  /** 페이지네이션: 서버는 page/size 사용 */
  page?: number; // 주의: 서버가 0/1 기반 혼용 가능 – 아래 meta에서 +1로 UI 표기
  pageSize?: number; // 서버 파라미터명은 size
};

// ── 서버 응답 모델 ──────────────────────────────────────────
type ServerInboundListItem = {
  noteId: number;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: string; // ex) COMPLETED_ISSUE, COMPLETED_OK
  completedAt: string; // ex) 2025-10-29T05:00Z
};

type ServerInboundList = {
  items: ServerInboundListItem[];
  page: number; // 예시: 0
  size: number; // 예시: 20
  total: number; // 예시: 2
};

function mapServerStatusToInboundStatus(s: string | undefined): InboundStatus {
  const u = (s ?? "").toUpperCase();
  if (u.includes("OK") || u.includes("PASS")) return "합격";
  if (u.includes("REJECT") || u.includes("FAIL") || u.includes("NG"))
    return "불합격";
  return "보류"; // ISSUE/HOLD/PENDING 등
}

function toInboundRecord(s: ServerInboundListItem): InboundRecord {
  return {
    inboundId: String(s.noteId),
    vendor: s.supplierName,
    itemKindsNumber: s.itemKindsNumber,
    inboundQty: s.totalQty,
    status: mapServerStatusToInboundStatus(s.status),
    completedAt: s.completedAt,
    warehouse: "-",
    note: "",
  };
}

/**
 * 입고 기록 목록 조회 API (서버 스펙: /receiving/done?date&warehouseId&page&size)
 * 요청 예: /receiving/done?date=20201212&warehouseId=2&page=1&size=20
 * 응답 예: { status, success, message, data: { items:[...], page, size, total } }
 */
export async function fetchInboundRecords(
  params?: InboundListParams
): Promise<ListResponse<InboundRecord[]>> {
  const qs = new URLSearchParams();

  if (params?.date) qs.set("date", params.date);
  if (params?.warehouseId !== undefined)
    qs.set("warehouseId", String(params.warehouseId));

  // 페이지네이션: 서버는 page/size 사용
  if (params && params.page !== undefined)
    qs.set("page", String(Math.max(1, params.page) - 1));
  if (params && params.pageSize !== undefined)
    qs.set("size", String(params.pageSize));

  // (참고) status, q 등은 현재 서버 스펙엔 없지만 추후 확장 대비 남김
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);

  const base = `${WAREHOUSE_ENDPOINTS.INBOUND_LIST}/done`;
  const url = qs.toString() ? `${base}?${qs.toString()}` : base;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`입고 데이터 요청 실패 (${res.status})`);

  const json: ApiResponse<ServerInboundList> = await res.json();
  if (!json.success) throw new Error(json.message || "입고 목록 조회 실패");

  const page = json.data ?? { items: [], page: 0, size: 0, total: 0 };
  const rows = Array.isArray(page.items) ? page.items.map(toInboundRecord) : [];

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

// 서버 모델(참고용)
type ServerInboundDetail = {
  noteId: number;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: InboundDetailStatusRaw;
  completedAt: string | null;
  receivingNo: string;
  warehouseId: number;
  requestedAt: string;
  expectedReceiveDate: string | null;
  receivedAt: string | null;
  inspectorName: string | null;
  inspectorDept: string | null;
  inspectorPhone: string | null;
  remark: string;
  lines: Array<{
    lineId: number;
    product: {
      id: number;
      lot: string;
      serial: string;
      name: string;
      imgUrl: string;
    };
    orderedQty: number;
    inspectedQty: number;
    issueQty: number;
    status: InboundLineStatusRaw;
  }>;
};

// 상태 매핑: 서버 원본 → UI 3단계
export function mapDetailHeaderStatus(
  raw?: InboundDetailStatusRaw
): InboundStatus {
  const u = (raw ?? "").toUpperCase();
  if (u.includes("OK") || u.includes("PASS") || u === "ACCEPTED") return "합격";
  if (u.includes("REJECT")) return "불합격";
  // ISSUE/HOLD/IN_PROGRESS 등은 보류
  return "보류";
}

export function mapDetailLineStatus(raw?: InboundLineStatusRaw): InboundStatus {
  const u = (raw ?? "").toUpperCase();
  if (u === "ACCEPTED") return "합격";
  if (u === "REJECTED") return "불합격";
  return "보류"; // ON_HOLD 등
}

// 서버 → UI 상세 레코드 변환
export function toInboundDetailRecord(
  s: ServerInboundDetail
): InboundDetailRecord {
  return {
    inboundId: String(s.noteId),
    receivingNo: s.receivingNo,

    vendor: s.supplierName,
    itemKindsNumber: s.itemKindsNumber,
    inboundQty: s.totalQty,

    status: mapDetailHeaderStatus(s.status),
    statusRaw: s.status,

    completedAt: s.completedAt,
    requestedAt: s.requestedAt,
    expectedReceiveDate: s.expectedReceiveDate,
    receivedAt: s.receivedAt,

    warehouseId: s.warehouseId ?? null,
    inspectorName: s.inspectorName ?? null,
    inspectorDept: s.inspectorDept ?? null,
    inspectorPhone: s.inspectorPhone ?? null,
    note: s.remark ?? "",

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
      issueQty: l.issueQty,
      status: mapDetailLineStatus(l.status),
      statusRaw: l.status,
    })),
  };
}

export async function fetchInboundDetail(
  id: string | number
): Promise<InboundDetailRecord> {
  const url = `${WAREHOUSE_ENDPOINTS.INBOUND_LIST}/${id}`;
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) throw new Error(`입고 상세 요청 실패 (${res.status})`);

  const json: ApiResponse<ServerInboundDetail> = await res.json();
  if (!json.success) throw new Error(json.message || "입고 상세 조회 실패");

  return toInboundDetailRecord(json.data);
}
