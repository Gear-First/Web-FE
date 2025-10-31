export type OutboundStatus = "대기" | "지연" | "진행중" | "완료";
export type OutboundPartStatus = "대기" | "출고" | "완료";

export interface PartItem {
  partCode: string; // 부품코드
  partName: string; // 부품명
  partQuantity: number; // 수량
  partStatus: OutboundPartStatus; // 상태
}

export interface OutboundRecord {
  outboundId: string; // 출고번호
  issuedDate: string; // 출고일시
  expectedDeliveryDate: string; // 납품예정일
  receiptDate: string; // 접수일시
  destination: string; // 납품처
  totalQuantity: number; // 총수량
  manager: string; // 담당자
  managerPosition: string; // 담당자직책
  managerContact: string; // 담당자연락처
  status: OutboundStatus; // 상태
  deliveryFactory: string; // 출고대상(창고)
  remarks: string; // 비고
  partItems: PartItem[]; // 여러 부품 묶음
}
