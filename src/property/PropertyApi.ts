import axios from "axios";
import type { PropertyResponse } from "./PropertyTypes";

// --- query keys ---
export const propertyKeys = {
  records: ["property", "property-records"] as const,
};

// axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://34.120.215.23/warehouse/api/v1", // 백엔드 API 주소
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 제한
});

export async function fetchPropertyRecords(params: {
  q?: string; // 창고코드, 부품코드/부품명, 공급업체
  page?: number;
  size?: number;
}): Promise<PropertyResponse> {
  const res = await api.get("/inventory/on-hand", { params });
  return res.data;
}
