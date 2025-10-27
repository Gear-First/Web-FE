export interface PropertyRecord {
  id: string; // 고유 식별자
  warehouseId: string; //창고번호
  partCode: string; //부품코드
  partName: string; //부품명
  partQuantity: number; //수량
  partPrice: number; // 단가
}
