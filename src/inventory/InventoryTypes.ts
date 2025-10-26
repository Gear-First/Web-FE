export interface InventoryRecord {
  id: string; // 고유 식별자
  warehouseId: string; // 창고번호
  inventoryCode: string; // 부품코드
  inventoryName: string; // 부품이름
  inventoryQuantity: number; // 수량
}
