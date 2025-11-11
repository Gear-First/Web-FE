import type { PartResponse } from "./PartTypes";
import { WAREHOUSE_BASE_PATH } from "../api";

export const partKeys = {
  records: ["part", "part-records"] as const,
};

const BASE_URL = `${WAREHOUSE_BASE_PATH}/inventory/on-hand`;

export async function fetchPartRecords(params: {
  q?: string;
  page?: number;
  size?: number;
  warehouseCode?: string;
  partKeyword?: string;
  supplierName?: string;
}): Promise<PartResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  const url = query.size > 0 ? `${BASE_URL}?${query.toString()}` : BASE_URL;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`재고 정보를 불러오지 못했습니다 (${res.status})`);
  }

  return res.json() as Promise<PartResponse>;
}
