export interface PropertyRecord {
  warehouseCode: string; // 창고번호
  part: PropertyItem; // 부품
  onHandQty: number; // 수량 (가용 재고)
  updatedAt: string; // 마지막 수정일
  supplierName: string; // 대리점
  price: number; // 단가
  priceTotal: number; // 총 금액
}

export interface PropertyItem {
  id: number; // 부품 ID
  code: string; // 부품 코드
  name: string; // 부품명
}

export interface PropertyResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    items: PropertyRecord[];
    page: number;
    size: number;
    total: number;
  };
}
