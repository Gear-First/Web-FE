import type { PropertyRecord } from "./PropertyTypes";

// --- query keys ---
export const propertyKeys = {
  records: ["property", "records"] as const,
};

export type PropertyQueryParams = {
  warehouse?: string;
  keyword?: string; // 부품코드/부품명
  page: number;
  pageSize: number;
};

export type ListResponse<T> = {
  data: T;
  meta: { total: number; page: number; pageSize: number; totalPages: number };
  facets?: { warehouses?: string[] };
};

export async function fetchPropertyRecords(params: PropertyQueryParams) {
  const qs = new URLSearchParams({
    ...(params.warehouse && params.warehouse !== "ALL"
      ? { warehouse: params.warehouse }
      : {}),
    ...(params.keyword ? { keyword: params.keyword } : {}),
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  const res = await fetch(`/api/property/records?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch property records");
  return (await res.json()) as ListResponse<PropertyRecord[]>;
}
