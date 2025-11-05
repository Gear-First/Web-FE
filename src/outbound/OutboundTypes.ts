// 출고 상태 Enum
export type OutboundStatus =
  | "PENDING" // 대기
  | "IN_PROGRESS" // 진행중
  | "COMPLETED" // 완료
  | "DELAYED"; // 지연

// 부품 상태 Enum
export type OutboundPartStatus = "PENDING" | "READY" | "COMPLETED";

// 출고 상태 한글 변환
export const OUTBOUND_STATUS_LABELS: Record<OutboundStatus, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  DELAYED: "지연",
};

// 출고 상태 색상 매핑
export const OUTBOUND_STATUS_VARIANTS: Record<
  OutboundStatus,
  "info" | "warning" | "success" | "rejected"
> = {
  PENDING: "info",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  DELAYED: "rejected",
};

// 부품 상태 한글 변환
export const OUTBOUND_PART_STATUS_LABELS: Record<OutboundPartStatus, string> = {
  PENDING: "대기",
  READY: "출고 준비",
  COMPLETED: "완료",
};

// 부품 상태 색상 매핑
export const OUTBOUND_PART_STATUS_VARIANTS: Record<
  OutboundPartStatus,
  "info" | "warning" | "success"
> = {
  PENDING: "info",
  READY: "warning",
  COMPLETED: "success",
};

export interface OutboundPartItem {
  lineId: number;
  product: {
    id: number;
    lot: string;
    code: string;
    name: string;
    imgUrl: string;
  };
  orderedQty: number;
  pickedQty: number;
  status: OutboundPartStatus | string;
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
