import { INVENTORY_BASE_PATH } from "../api";

const BASE_URL = INVENTORY_BASE_PATH;

async function requestJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(
      `구매 API 호출 실패 (${res.status} ${res.statusText || ""})`.trim()
    );
  }

  return res.json() as Promise<T>;
}

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
    const json = await requestJson<any>("/addCompany", {
      method: "POST",
      body: JSON.stringify(data),
    });
    console.log("응답:", json);
    return json;
  } catch (err) {
    console.error("업체 등록 실패:", err);
    throw err;
  }
}

// 자재 리스트
export async function fetchMaterialList(query: string, page = 0, size = 10) {
  try {
    const res = await fetch(
      `https://gearfirst-auth.duckdns.org/inventory/api/v1/getMaterialList?page=${page}&size=${size}&sort=createdAt`
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
    const json = await requestJson<any>(`/getCompanyList?${query.toString()}`);

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
  keyword: string;
}) {
  try {
    const query = new URLSearchParams({
      endDate: params.endDate,
      keyword: params.keyword,
      page: "0",
      size: "10",
      sort: "createdAt",
    });

    const json = await requestJson<any>(`/getCompanyList?${query.toString()}`);
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
    const json = await requestJson<any>("/selectCompany", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("PO 생성 성공:", json);
    return json;
  } catch (err) {
    console.error("PO 생성 실패:", err);
    throw err;
  }
}
