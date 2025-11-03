import axios from "axios";
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
  const payload = {
    materialId: data.materialId,
    materialCode: data.materialCode,
    materialName: data.materialName,
    price: data.price,
    companyName: data.companyName,
    quantity: data.quantity,
    spentDay: data.spentDay,
    surveyDate: data.surveyDate,
    untilDate: data.untilDate,
  };

  console.log("addCompany 요청 payload:", payload);

  const res = await fetch("http://34.120.215.23/inventory/api/v1/addCompany", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log("응답:", json);
  return json;
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
}): Promise<{
  data: PurchasingRecord[];
  meta: { total: number; page: number; size: number; totalPages: number };
}> {
  const query = new URLSearchParams();

  if (params?.keyword) {
    query.append("keyword", params.keyword);
  }

  query.append("page", String(params?.page ?? 0));
  query.append("size", String(params?.size ?? 10));
  query.append("sort", "createdAt");

  if (params?.isSelected !== undefined) {
    query.append("isSelected", params.isSelected ? "true" : "false");
  }

  const url = `http://34.120.215.23/inventory/api/v1/getCompanyList?${query.toString()}`;
  console.log("fetchCompanyList 요청 URL:", url);

  const res = await fetch(url, { method: "GET" });

  const json = await res.json();
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
      requiredPeriodInDays: c.spentDay,
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
}

// 업체 후보 리스트 조회 (공급업체 선정용)
export async function fetchCompanyCandidates(params: {
  endDate: string;
  material: string;
}) {
  const { endDate, material } = params;

  const url = `http://34.120.215.23/inventory/api/v1/getCompanyList?endDate=${endDate}&material=${encodeURIComponent(
    material
  )}&page=0&size=10&sort=createdAt`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();

    if (!json.success) throw new Error(json.message || "조회 실패");

    return json.data?.content ?? [];
  } catch (err) {
    console.error("업체 후보 조회 실패:", err);
    return [];
  }
}

// PO 생성 API
export async function createPurchaseOrders(
  payload: {
    id: number; // companyId
    orderCnt: number;
    totalPrice: number;
  }[]
) {
  try {
    console.log("createPurchaseOrders 요청 payload:", payload);

    const res = await fetch(
      "http://34.120.215.23/inventory/api/v1/selectCompany",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    console.log("응답:", json);

    if (!res.ok || json.success === false) {
      throw new Error(json.message || "PO 생성 실패");
    }

    return json;
  } catch (err) {
    console.error("PO 생성 중 오류:", err);
    throw err;
  }
}
