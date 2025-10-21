export type OutboundStatus = "대기" | "진행중" | "완료";

export interface OutboundRecord {
  outboundId: string; // 출고번호
  inventoryCode: string; // 부품코드
  inventoryName: string; // 부품이름
  outboundQuantity: number; // 출고수량
  issuedDate: string; // 출고일시
  expectedDeliveryDate: string; // 납품예정일
  receiptDate: string; // 접수일시
  destination: string; // 납품처
  manager: string; // 담당자
  status: OutboundStatus; // 상태
  deliveryFactory: string; // 출고대상(창고)
}

export interface OutboundSchedule {
  outboundId: string; // 출고번호
  inventoryName: string; // 부품이름
  requiredDate: string; // 필요일자
  preparedQuantity: number; // 준비자재수
  status: "준비완료" | "자재부족"; // 상태
}
