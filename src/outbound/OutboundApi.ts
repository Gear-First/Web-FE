// OutboundApi.ts
import axios from "axios";
import type {
  OutboundRecord,
  OutboundStatus,
  OutboundPartStatus,
} from "./OutboundTypes";

export const outboundKeys = {
  records: ["outbound", "records"] as const,
};

export type OutboundListParams = {
  status?: OutboundStatus | "ALL";
  q?: string;
  startDate?: string | null;
  endDate?: string | null;
  page?: number; // 0-based
  pageSize?: number; // e.g. 10
};

export type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

// 한글 → 서버 코드
const STATUS_TO_SERVER: Record<OutboundStatus, string> = {
  대기: "PENDING",
  지연: "DELAYED",
  진행중: "IN_PROGRESS",
  완료: "COMPLETED",
};
// 서버 코드 → 한글
const STATUS_TO_KO: Record<string, OutboundStatus> = {
  PENDING: "대기",
  DELAYED: "지연",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
};

export async function fetchOutboundRecords(
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  const qs = new URLSearchParams();

  // ALL은 보내지 않음
  if (params?.status && params.status !== "ALL") {
    qs.set("status", STATUS_TO_SERVER[params.status]);
  }
  if (params?.q) qs.set("q", params.q);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);

  // 0도 포함되도록 체크
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.pageSize !== undefined)
    qs.set("pageSize", String(params.pageSize));

  const url = `http://34.120.215.23/warehouse/api/v1/shipping/notes?${qs.toString()}`;
  const res = await axios.get(url);

  if (res.status !== 200)
    throw new Error(`출고 데이터 요청 실패 (${res.status})`);

  const { items, total, page, size } = res.data?.data ?? {};

  const mapped: OutboundRecord[] = (items ?? []).map((it: any) => ({
    outboundId: String(it.noteId),
    issuedDate: it.completedAt || "-", // 출고일시
    destination: it.customerName ?? "-",
    totalQuantity: it.totalQty ?? 0,
    status: STATUS_TO_KO[it.status] ?? "대기",
  }));

  const _size = size ?? params?.pageSize ?? 20;
  return {
    data: mapped,
    meta: {
      total: total ?? 0,
      page: page ?? params?.page ?? 0,
      pageSize: _size,
      totalPages: Math.max(1, Math.ceil((total ?? 0) / _size)),
    },
  };
}

// --- 출고 상세 조회 API ---
export async function fetchOutboundDetail(
  noteId: string
): Promise<OutboundRecord> {
  const url = `http://34.120.215.23/warehouse/api/v1/shipping/${noteId}`;
  const res = await axios.get(url);

  if (res.status !== 200) {
    throw new Error(`출고 상세 요청 실패 (${res.status})`);
  }

  const data = res.data?.data;
  const lineStatusMap: Record<string, OutboundPartStatus> = {
    READY: "출고",
    PENDING: "대기",
    COMPLETED: "완료",
  };

  return {
    outboundId: String(data.noteId),
    issuedDate: data.shippedAt || "-",
    expectedDeliveryDate: data.expectedShipDate || "-",
    receiptDate: data.requestedAt || "-",
    destination: data.customerName,
    totalQuantity: data.totalQty,
    manager: data.assigneeName || "-",
    managerPosition: data.assigneeDept || "-",
    managerContact: data.assigneePhone || "-",
    status: STATUS_TO_KO[data.status],
    deliveryFactory: String(data.warehouseId) || "-",
    remarks: data.remark || "-",
    partItems: (data.lines || []).map((line: any) => ({
      partCode: String(line.product?.serial || "-"),
      partName: line.product?.name || "-",
      partQuantity: line.pickedQty ?? 0,
      partStatus: lineStatusMap[line.status] || "대기",
    })),
  };
}
