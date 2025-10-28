export type PurchasingStatus = "등록" | "선정";

export interface PurchasingRecord {
  purchasingId: string; // 요청번호
  materialCode: string; // 자재코드
  materialName: string; // 자재명
  purchasingQuantity: number; // 요청수량
  purchasingDate?: string; // 계약일시
  company: string; // 공급업체
  purchasingPrice: number; // 단가
  surveyDate: string; // 조사일
  status: PurchasingStatus; // 상태
  expiryDate: string; // 유효기간
  // 소요시기 (100개/1일) => (requiredQuantityPerPeriod/requiredPeriodInDays일)
  requiredQuantityPerPeriod: number; // 소요수량 (예: 100)
  requiredPeriodInDays: number; // 소요기간 (예: 1)
}

export interface PurchasingFilters {
  status?: PurchasingStatus | "ALL";
  company?: string;
}

// Sourcing Types
export interface MaterialRequirement {
  materialCode: string; //자재코드
  materialName: string; //자재명
  required: number; // 필요한수량
  needDate: string; // YYYY-MM-DD
}

export interface VendorQuote {
  materialCode: string;
  materialName: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  requiredPeriodInDays: number;
  requiredQuantityPerPeriod: number;
  expiryDate: string;
}

export interface BasketLine {
  materialCode: string;
  materialName: string;
  vendorId: string;
  vendorName: string;
  orderQty: number;
  unitPrice: number;
  leadTimeDays: number;
  eta: string; // YYYY-MM-DD
}
