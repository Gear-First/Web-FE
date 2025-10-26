import type { InboundRecord, InboundStatus } from "./InboundTypes";

export const inboundKeys = {
  records: ["inbound", "records"] as const,
};

export type InboundListParams = {
  status?: InboundStatus | "ALL";
  q?: string;
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  pageSize?: number;
};

type ListResponse<T> = {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export async function fetchInboundRecords(
  params?: InboundListParams
): Promise<ListResponse<InboundRecord[]>> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));

  const url = qs.toString()
    ? `/api/inbound/records?${qs.toString()}`
    : `/api/inbound/records`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch inbound records");
  return res.json();
}
