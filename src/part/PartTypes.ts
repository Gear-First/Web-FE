export type PartStatus = "여유" | "적정" | "부족";

export interface InventoryPartRecord {
  id: string; // 고유 식별자
  warehouseId: string; // 창고번호
  partCode: string; // 부품코드
  partName: string; // 부품이름
  partQuantity: number; // 수량 (가용 재고)
  safetyStock: number; // 안전 재고
  status: PartStatus; // 상태
}
