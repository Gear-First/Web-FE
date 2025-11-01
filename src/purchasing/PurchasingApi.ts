import type { PurchasingRecord } from "./PurchasingTypes";

export const purchasingKeys = {
  records: ["purchasing", "records"] as const,
};

// ✅ 업체 등록 API (POST)
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
    materialId: 2,
    materialCode: data.materialCode.trim(),
    materialName: data.materialName.trim(),
    price: Number(data.price),
    companyName: data.companyName.trim(),
    quantity: Number(data.quantity),
    spentDay: Number(data.spentDay),
    surveyDate: data.surveyDate || "2025-11-01",
    untilDate: data.untilDate || "2025-11-01",
  };

  console.log("📤 addCompany 요청 payload:", payload);
  console.log(
    "📦 addCompany 실제 요청 Body:",
    JSON.stringify(payload, null, 2)
  );

  const res = await fetch("http://34.120.215.23/inventory/api/v1/addCompany", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log("✅ 응답:", json);
  return json;
}

// 구매 목록 조회 API (임시로 빈 배열 반환, 나중에 getCompanyList로 대체)
export async function fetchPurchasingRecords(): Promise<PurchasingRecord[]> {
  return [];
}

// 자재 소요량 / 견적 조회용 더미 데이터 제거
export const getMaterialRequirements = async () => {
  // 추후 API 연동 시 서버에서 받아오는 로직으로 교체
  return [];
};

export const getVendorQuotes = async () => {
  // 추후 API 연동 시 서버에서 받아오는 로직으로 교체
  return [];
};
