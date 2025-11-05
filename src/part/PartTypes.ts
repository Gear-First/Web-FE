export type PartStatus = "여유" | "적정" | "부족";

export interface PartRecord {
  warehouseCode: string; // 창고번호
  part: PartItem; // 부품
  onHandQty: number; // 수량 (가용 재고)
  lastUpdatedAt: string; // 마지막 수정일
  lowStock: boolean; // 상태
  safetyStockQty: number; // 안전 재고
}

export interface PartItem {
  id: number; // 부품 ID
  code: string; // 부품 코드
  name: string; // 부품명
}

export interface PartResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    items: PartRecord[];
    page: number;
    size: number;
    total: number;
  };
}
