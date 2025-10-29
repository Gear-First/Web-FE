// ─────────────────────────────────────────────────────────────
// 기존: 리스트용 타입 (그대로 유지)
// ─────────────────────────────────────────────────────────────
export type InboundStatus = "합격" | "보류" | "불합격";

export interface InboundRecord {
  /** 입고요청서 ID (서버 noteId) */
  inboundId: string;
  /** 공급업체명 (supplierName) */
  vendor: string;
  /** 품목 종류 수 (itemKindsNumber) */
  itemKindsNumber: number;
  /** 총 수량 (totalQty) */
  inboundQty: number;
  /** 상태 (COMPLETED_OK 등 → 합격/보류/불합격으로 매핑) */
  status: InboundStatus;
  /** 완료 일시 (completedAt) */
  completedAt: string;
  /** UI에서 사용할 추가 필드들 (서버에는 없음, 일단 안전값) */
  warehouse: string;
  note: string;
}

// ─────────────────────────────────────────────────────────────
// 신규: 상세용 타입들
// ─────────────────────────────────────────────────────────────

/** 서버에서 오는 상세 헤더 상태 (원본 값 보존용) */
export type InboundDetailStatusRaw =
  | "IN_PROGRESS"
  | "COMPLETED_OK"
  | "COMPLETED_ISSUE"
  | "COMPLETED_REJECTED"
  | (string & {}); // 미상/확장 대비

/** 서버에서 오는 상세 라인 상태 (원본 값 보존용) */
export type InboundLineStatusRaw =
  | "ACCEPTED"
  | "REJECTED"
  | "ON_HOLD"
  | (string & {});

/** 상세의 제품 정보 */
export interface InboundDetailProduct {
  id: number;
  lot: string;
  serial: string;
  name: string;
  imgUrl?: string | null;
}

/** 상세의 개별 라인 아이템 (UI용) */
export interface InboundDetailLine {
  lineId: string;
  product: InboundDetailProduct;

  orderedQty: number;
  inspectedQty: number;
  issueQty: number;

  /** UI 3단계 상태 */
  status: InboundStatus;
  /** 서버 원본 상태 값 (보존) */
  statusRaw: InboundLineStatusRaw;
}

/** 상세 레코드 (헤더 + 라인들) */
export interface InboundDetailRecord {
  /** 입고요청서 ID (서버 noteId) */
  inboundId: string;
  /** 입고번호 (receivingNo) */
  receivingNo: string;

  vendor: string;
  itemKindsNumber: number;
  inboundQty: number;

  /** UI 3단계 상태 */
  status: InboundStatus;
  /** 서버 원본 상태 값 (보존) */
  statusRaw: InboundDetailStatusRaw;

  /** 날짜/시간들 */
  completedAt?: string | null;
  requestedAt: string;
  expectedReceiveDate?: string | null;
  receivedAt?: string | null;

  /** 기타 */
  warehouseId?: number | null;
  inspectorName?: string | null;
  inspectorDept?: string | null;
  inspectorPhone?: string | null;
  note: string; // remark

  /** 라인들 */
  lines: InboundDetailLine[];
}
