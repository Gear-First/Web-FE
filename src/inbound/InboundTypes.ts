// 목록(요약) 상태 그룹
export type InboundStatus = "done" | "not-done" | "all";

// 상세 헤더(품질) UI 상태
export type InboundUIStatus = "합격" | "불합격" | "보류";

// 서버가 상세 헤더로 내려주는 원문 상태
export type InboundDetailStatusRaw =
  | "IN_PROGRESS"
  | "COMPLETED_OK"
  | "COMPLETED_ISSUE"
  | "PENDING"
  | (string & {});

export const InboundStatusLabelMap: Record<string, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행중",
  COMPLETED_OK: "완료",
  COMPLETED_ISSUE: "재입고 대기",
};

// 상세 라인 상태(서버 원문)
export type InboundLineStatusRaw =
  | "ACCEPTED"
  | "REJECTED"
  | "PENDING"
  | (string & {});

// 상세 라인 상태(UI 배지용)
export type InboundLineStatus = "accepted" | "rejected" | "pending";

/** 목록 행에서 쓰는 요약 레코드 */
export interface InboundRecord {
  noteId: number;
  receivingNo: string;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: InboundStatus;
  statusRaw?: string;
  completedAt: string | null;
  requestedAt: string | null;
  warehouseCode: string;
}

/** 상세 라인 제품 정보 */
export interface InboundDetailProduct {
  id: number;
  lot: string;
  serial: string;
  name: string;
  imgUrl?: string | null;
}

/** 상세 라인(accepted/rejected/pending) */
export interface InboundDetailLine {
  lineId: string;
  product: InboundDetailProduct;
  orderedQty: number;
  inspectedQty: number;
  status: InboundLineStatus; // UI 배지 상태
}

/** 상세 레코드(헤더 + 라인들) */
export interface InboundDetailRecord {
  receivingNo: string;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;

  status: InboundDetailStatusRaw;

  completedAt?: string | null;
  requestedAt: string;
  expectedReceiveDate?: string | null;
  receivedAt?: string | null;
  warehouseCode?: string | null;

  inspectorName?: string | null;
  inspectorDept?: string | null;
  inspectorPhone?: string | null;
  remark?: string;

  lines: InboundDetailLine[];
}

/* ========== 공용 유틸 (상태 정규화/라벨) ========== */

/** 서버 원문 상태 정규화: 공백/언더스코어 → 하이픈, 소문자 */
export function normalizeNoteStatus(raw?: string) {
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function mapNoteStatusToGroup(raw?: string): InboundStatus {
  const u = normalizeNoteStatus(raw);
  if (u === "completed-ok" || u === "completed-issue") return "done";
  if (u === "pending" || u === "in-progress") return "not-done";
  return "not-done";
}

/** 목록 배지 라벨 */
export function labelForGroupStatus(s: InboundStatus) {
  if (s === "done") return "입고완료";
  if (s === "not-done") return "입고예정";
  return "전체";
}

/** 상세 라인 원문 → accepted/rejected/pending */
export function mapDetailLineStatus(
  raw?: InboundLineStatusRaw
): InboundLineStatus {
  const u = (raw ?? "").trim().toUpperCase();
  if (u === "ACCEPTED") return "accepted";
  if (u === "REJECTED") return "rejected";
  return "pending";
}

/** 라인 배지 한글 라벨(원하면 사용) */
export function labelForLineStatus(s: InboundLineStatus) {
  return s === "accepted" ? "합격" : s === "rejected" ? "불합격" : "보류";
}
export function mapDetailHeaderStatus(
  raw?: InboundDetailStatusRaw
): InboundUIStatus {
  const u = (raw ?? "").trim().toUpperCase();

  // 서버 원문: IN_PROGRESS | COMPLETED_OK | COMPLETED_ISSUE | PENDING
  if (u === "COMPLETED_OK") return "합격";
  if (u === "COMPLETED_ISSUE") return "보류"; // 이슈가 있으니 합격 대신 보류 처리
  if (u === "PENDING" || u === "IN_PROGRESS") return "보류";

  // 혹시 확장 상태(예: *_REJECTED)가 생길 경우 대비
  if (u.includes("REJECT") || u.includes("FAIL") || u.includes("NG"))
    return "불합격";

  return "보류";
}

/** 서버 원문 상태 → 한글 라벨 */
export const inboundStatusLabelMap: Record<string, string> = {
  PENDING: "입고요청",
  IN_PROGRESS: "입고진행중",
  COMPLETED_OK: "입고완료",
  COMPLETED_ISSUE: "재입고대기(불량)",

  // 혹시 모르는 확장값 대비
  DEFAULT: "기타",
};

/** 서버 원문 상태 → 배지 색상 variant */
export const inboundStatusVariantMap: Record<
  string,
  "pending" | "accepted" | "rejected"
> = {
  PENDING: "pending", // 회색 or 기본색
  IN_PROGRESS: "pending", // 파랑 계열로 표현 가능
  COMPLETED_OK: "accepted", // 초록색
  COMPLETED_ISSUE: "rejected", // 주황/빨강 계열
  DEFAULT: "pending",
};

/** 라벨 헬퍼 함수 */

/** 배지색 헬퍼 함수 */
export function getInboundStatusVariant(
  status?: string
): "pending" | "accepted" | "rejected" {
  const key = (status ?? "").trim().toUpperCase();
  return inboundStatusVariantMap[key] || inboundStatusVariantMap.DEFAULT;
}
