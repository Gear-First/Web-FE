import axios from "axios";

const api = axios.create({
  baseURL: "http://34.120.215.23/inventory/api/v1",
  headers: { "Content-Type": "application/json" },
});

import type { PurchasingRecord } from "./PurchasingTypes";

export const purchasingKeys = {
  records: ["purchasing", "records"] as const,
};

// 업체 등록 API
export async function addCompany(data: {
  materialId?: number;
  materialCode: string;
  materialName: string;
  price: number | string;
  companyName: string;
  quantity: number | string;
  spentDay: number | string;
  surveyDate: string;
  untilDate: string;
}) {
  try {
    const res = await api.post("/addCompany", data);
    console.log("응답:", res.data);
    return res.data;
  } catch (err) {
    console.error("업체 등록 실패:", err);
    throw err;
  }
}

// 자재 리스트
export async function fetchMaterialList(query: string, page = 0, size = 10) {
  try {
    const res = await fetch(
      `http://34.120.215.23/inventory/api/v1/getMaterialList?page=${page}&size=${size}&sort=createdAt`
    );
    const json = await res.json();
    return json.data?.content ?? [];
  } catch (err) {
    console.error("자재 목록 조회 실패:", err);
    return [];
  }
}

// 업체 리스트
export async function fetchCompanyList(params?: {
  keyword?: string;
  isSelected?: boolean;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();

  if (params?.keyword) query.append("keyword", params.keyword);
  if (params?.isSelected !== undefined)
    query.append("isSelected", params.isSelected ? "true" : "false");

  query.append("page", String(params?.page ?? 0));
  query.append("size", String(params?.size ?? 10));
  query.append("sort", "createdAt");

  try {
    const res = await api.get(`/getCompanyList?${query.toString()}`);
    const json = res.data;

    if (!json.success) throw new Error(json.message || "조회 실패");

    const data = json.data ?? {};
    const content = data.content ?? [];

    return {
      data: content.map((c: any) => ({
        purchasingId: c.registNum,
        materialName: c.materialName,
        materialCode: c.materialCode,
        company: c.companyName,
        purchasingPrice: c.price,
        requiredQuantityPerPeriod: c.quantity,
        requiredPeriodInDays: c.spendDay,
        surveyDate: c.surveyDate,
        expiryDate: c.untilDate,
        status: "등록",
        orderCnt: c.orderCnt,
        createdAt: c.createdAt,
      })),
      meta: {
        total: data.totalElements ?? 0,
        page: data.page ?? 0,
        size: data.size ?? 10,
        totalPages: data.totalPages ?? 1,
      },
    };
  } catch (err) {
    console.error("업체 리스트 조회 실패:", err);
    throw err;
  }
}

// 업체 후보 리스트 조회 (공급업체 선정용)
export async function fetchCompanyCandidates(params: {
  endDate: string;
  material: string;
}) {
  try {
    const res = await api.get("/getCompanyList", {
      params: {
        endDate: params.endDate,
        material: params.material,
        page: 0,
        size: 10,
        sort: "createdAt",
      },
    });

    const json = res.data;
    if (!json.success) throw new Error(json.message || "조회 실패");
    return json.data?.content ?? [];
  } catch (err) {
    console.error("업체 후보 조회 실패:", err);
    return [];
  }
}

// PO 생성 API
export async function createPurchaseOrders(
  payload: { id: number; orderCnt: number; totalPrice: number }[]
) {
  try {
    const res = await api.post("/selectCompany", payload);
    console.log("PO 생성 성공:", res.data);
    return res.data;
  } catch (err) {
    console.error("PO 생성 실패:", err);
    throw err;
  }
}
