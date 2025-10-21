export type OutboundStatus = "대기" | "진행중" | "완료";

export interface OutboundRecord {
  id: string; // 출고번호
  inventoryCode: string; // 부품코드
  inventoryName: string; // 부품이름
  quantity: number; // 출고수량
  issuedDate: string; // 출고일시
  expectedDeliveryDate: string; // 납품예정일
  receiptDate: string; // 접수일시
  destination: string; // 납품처
  handledBy: string; // 담당자
  status: OutboundStatus; // 상태
  deliveryFactory: string; // 출고대상(창고)
}

export interface OutboundSchedule {
  workOrder: string;
  inventoryName: string;
  requiredDate: string;
  preparedQuantity: number;
  status: "준비완료" | "자재부족";
}
