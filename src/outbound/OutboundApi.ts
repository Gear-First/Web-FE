// OutboundApi.ts
import axios from "axios";
import type { OutboundRecord } from "./OutboundTypes";

export const outboundKeys = {
  records: ["outbound", "records"] as const,
};

export type OutboundListParams = {
  status?: "done" | "not-done" | "all";
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

export async function fetchOutboundRecords(
  params?: OutboundListParams
): Promise<ListResponse<OutboundRecord[]>> {
  const qs = new URLSearchParams();

  if (params?.warehouseCode) qs.set("warehouseCode", params.warehouseCode);
  if (params?.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params?.dateTo) qs.set("dateTo", params.dateTo);
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.size !== undefined) qs.set("size", String(params.size));

  const url = `http://34.120.215.23/warehouse/api/v1/shipping/notes?${qs.toString()}`;
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

// 출고 상세 조회
export async function fetchOutboundDetail(
  noteId: string
): Promise<OutboundRecord> {
  const url = `http://34.120.215.23/warehouse/api/v1/shipping/${noteId}`;
  const res = await axios.get(url);

  if (res.status !== 200)
    throw new Error(`출고 상세 요청 실패 (${res.status})`);

  return res.data?.data as OutboundRecord;
}
