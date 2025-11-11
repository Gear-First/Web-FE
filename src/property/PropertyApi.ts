import type { PropertyResponse } from "./PropertyTypes";
import { WAREHOUSE_BASE_PATH } from "../api";

// --- query keys ---
export const propertyKeys = {
  records: ["property", "property-records"] as const,
};

const BASE_URL = `${WAREHOUSE_BASE_PATH}/inventory/on-hand`;

export type PropertyQueryParams = {
  q?: string;
  keyword?: string;
  warehouseCode?: string;
  page?: number;
  size?: number;
  pageSize?: number;
};

export async function fetchPropertyRecords(
  params: PropertyQueryParams
): Promise<PropertyResponse> {
  const requestParams: Record<string, string | number | undefined> = {
    ...params,
  };

  if (requestParams.keyword && !requestParams.q) {
    requestParams.q = requestParams.keyword;
  }

  if (requestParams.pageSize != null) {
    requestParams.size = requestParams.pageSize;
  }

  delete requestParams.keyword;
  delete requestParams.pageSize;

  const query = new URLSearchParams();
  Object.entries(requestParams).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    query.set(key, String(value));
  });

  const url =
    query.size > 0 ? `${BASE_URL}?${query.toString()}` : BASE_URL;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`자산 정보를 불러오지 못했습니다 (${res.status})`);
  }

  return res.json() as Promise<PropertyResponse>;
}
