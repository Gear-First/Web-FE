// OutboundApi.ts
import axios from "axios";
import type { OutboundRecord } from "./OutboundTypes";

export const outboundKeys = {
  base: ["outbound"] as const, // 기본 키
  notDoneRecords: ["outbound", "not-done"] as const,
  doneRecords: ["outbound", "done"] as const,
};

export type OutboundListParams = {
  dateFrom?: string | null;
  dateTo?: string | null;
  warehouseCode?: string;
  page?: number;
  size?: number;
};

export type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

// 공통 fetch 함수 (코드 중복 제거용)
async function fetchOutboundList(
  baseUrl: string,
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  const qs = new URLSearchParams();

  if (params?.warehouseCode) qs.set("warehouseCode", params.warehouseCode);
  if (params?.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params?.dateTo) qs.set("dateTo", params.dateTo);
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.size !== undefined) qs.set("size", String(params.size));

  const url = `${baseUrl}?${qs.toString()}`;
  const res = await axios.get(url);

  if (res.status !== 200)
    throw new Error(`출고 데이터 요청 실패 (${res.status})`);

  const { items, total, page, size } = res.data?.data ?? {};

  return {
    data: items ?? [],
    meta: {
      total: total ?? 0,
      page: page ?? 0,
      pageSize: size ?? params?.size ?? 20,
      totalPages: Math.max(1, Math.ceil((total ?? 0) / (size ?? 20))),
    },
  };
}

// 미완료 출고 목록 (not-done)
export async function fetchOutboundNotDoneRecords(
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  const baseUrl =
    "https://gearfirst-auth.duckdns.org/warehouse/api/v1/shipping/not-done";
  return fetchOutboundList(baseUrl, params);
}

// 완료 출고 목록 (done)
export async function fetchOutboundDoneRecords(
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  const baseUrl =
    "https://gearfirst-auth.duckdns.org/warehouse/api/v1/shipping/done";
  return fetchOutboundList(baseUrl, params);
}

// 출고 상세 조회
export async function fetchOutboundDetail(
  noteId: string
): Promise<OutboundRecord> {
  const url = `https://gearfirst-auth.duckdns.org/warehouse/api/v1/shipping/${noteId}`;
  const res = await axios.get(url);

  if (res.status !== 200)
    throw new Error(`출고 상세 요청 실패 (${res.status})`);

  return res.data.data;
}
