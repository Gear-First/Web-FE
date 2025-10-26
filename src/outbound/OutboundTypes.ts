export type OutboundStatus = "대기" | "진행중" | "완료";

export interface InventoryItem {
  inventoryCode: string; // 부품코드
  inventoryName: string; // 부품명
  outboundQuantity: number; // 수량
}

export interface OutboundRecord {
  outboundId: string; // 출고번호
  issuedDate: string; // 출고일시
  expectedDeliveryDate: string; // 납품예정일
  receiptDate: string; // 접수일시
  destination: string; // 납품처
  manager: string; // 담당자
  managerPosition: string; // 담당자직책
  managerContact: string; // 담당자연락처
  status: OutboundStatus; // 상태
  deliveryFactory: string; // 출고대상(창고)
  remarks: string; // 비고
  inventoryItems: InventoryItem[]; // 여러 부품 묶음
}
