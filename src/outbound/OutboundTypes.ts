export type OutboundStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type OutboundPartStatus = "PENDING" | "READY" | "COMPLETED";

export interface OutboundPartItem {
  lineId: number; // 라인 ID
  productSerial: string; // 제품 시리얼
  productName: string; // 제품명
  pickedQty: number; // 출고 수량
  status: OutboundPartStatus; // 상태
}

export interface OutboundRecord {
  noteId: number; // 출고요청 ID
  shippingNo: string; // 출고번호
  shippedAt?: string; // 출고일시
  requestedAt: string; // 요청일시
  expectedShipDate?: string; // 납품예정일
  branchName: string; // 대리점명
  totalQty: number; // 총 수량
  assigneeName?: string; // 담당자
  assigneeDept?: string; // 담당자 부서
  assigneePhone?: string; // 담당자 연락처
  status: OutboundStatus; // 상태
  warehouseCode: string; // 창고코드
  remark?: string; // 비고
  completedAt: string | null; // 완료일시
  itemKindsNumber: number; // 품목 종류 수
  lines?: OutboundPartItem[]; // 부품 리스트
}
