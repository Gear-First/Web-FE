export type PurchasingStatus = "등록" | "선정";

export interface PurchasingRecord {
  purchasingId: string; // 요청번호
  materialId?: number;
  materialCode?: string; // 자재코드
  materialName: string; // 자재명
  purchasingDate?: string; // 계약일시
  company: string; // 공급업체
  purchasingPrice: number; // 단가
  surveyDate: string; // 조사일
  expiryDate: string; // 유효기간
  status: PurchasingStatus; // 상태
  // 소요시기 (100개/1일) => (requiredQuantityPerPeriod/requiredPeriodInDays일)
  requiredQuantityPerPeriod: number; // 소요수량 (예: 100)
  requiredPeriodInDays: number; // 소요기간 (예: 1)
  orderCnt?: number;
  createdAt?: string;
}

export interface CompanyRecord {
  companyId: number; // 업체 고유 ID
  registNum: string; // 등록번호 (예: "RG-20251102-001")
  companyName: string; // 업체명
  materialCode: string; // 자재코드
  materialName: string; // 자재명
  price: number; // 단가
  quantity: number; // 수량
  surveyDate: string; // 조사일
  untilDate: string; // 유효기간
  orderCnt: number; // 발주 횟수
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

export interface MaterialItem {
  id: number;
  materialCode: string;
  materialName: string;
}
