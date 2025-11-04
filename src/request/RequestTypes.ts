// 상태 Enum (서버 ENUM 기준 그대로)
export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

// 상태 한글 변환
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  SHIPPED: "출고 중",
  COMPLETED: "납품 완료",
  CANCELLED: "취소",
};

// 상태 색상 매핑 (PageLayout.StatusBadge에서 사용)
export const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  "info" | "success" | "rejected" | "warning"
> = {
  PENDING: "info",
  APPROVED: "success",
  REJECTED: "rejected",
  SHIPPED: "warning",
  COMPLETED: "success",
  CANCELLED: "info",
};

// 미승인 발주 목록 DTO
export interface PendingOrderItem {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  branchCode: string;
  engineerName: string;
  engineerRole: string;
  requestDate: string;
  processedDate: string | null;
}

export interface PendingOrderResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    content: PendingOrderItem[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

// 승인/반려 목록
export interface ProcessedOrderItem {
  orderId: number;
  orderNumber: string;
  orderStatus: string; // APPROVED, REJECTED, CANCELLED 등
  branchCode: string;
  engineerName: string;
  engineerRole: string;
  requestDate: string;
  processedDate: string;
}

export interface ProcessedOrderResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    content: ProcessedOrderItem[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}
