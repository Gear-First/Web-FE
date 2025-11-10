import axios from "axios";
import type { PropertyResponse } from "./PropertyTypes";

// --- query keys ---
export const propertyKeys = {
  records: ["property", "property-records"] as const,
};

// axios 인스턴스 생성
const api = axios.create({
  baseURL: "https://gearfirst-auth.duckdns.org/warehouse/api/v1", // 백엔드 API 주소
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 제한
});

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

  const res = await api.get("/inventory/on-hand", { params: requestParams });
  return res.data;
}
