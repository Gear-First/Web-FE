import type {
  PendingOrderResponse,
  ProcessedOrderResponse,
  CancelOrderResponse,
  OrderDetailResponse,
} from "./RequestTypes";
import { fetchWithAuth } from "../auth/api/fetchWithAuth";

export const requestKeys = {
  pendingOrders: ["request", "pending-orders"] as const,
  processedOrders: ["request", "processed-orders"] as const,
  cancelOrders: ["request", "cancel-orders"] as const,
  orderDetail: (id: number) => ["request", "order-detail", id] as const,
};

const REQUEST_BASE_URL = "https://gearfirst-auth.duckdns.org/order/api/v1";

type QueryValue = string | number | boolean | undefined | null;

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const url = new URL(`${REQUEST_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, QueryValue>
): Promise<T> {
  const res = await fetchWithAuth(buildUrl(path, params), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(
      `요청 API 호출 실패 (${res.status} ${res.statusText || ""})`.trim()
    );
  }

  return res.json() as Promise<T>;
}

// 미승인 목록 조회
export async function fetchPendingOrders(params: {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PendingOrderResponse> {
  return requestJson<PendingOrderResponse>(
    "/purchase-orders/head/orders/pending",
    {},
    params
  );
}

// 승인 목록 조회
export async function fetchProcessedOrders(params: {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<ProcessedOrderResponse> {
  return requestJson<ProcessedOrderResponse>(
    "/purchase-orders/head/orders/processed",
    {},
    params
  );
}

// 승인/반려 목록 조회
export async function fetchCancelOrders(params: {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<CancelOrderResponse> {
  return requestJson<CancelOrderResponse>(
    "/purchase-orders/head/orders/cancel",
    {},
    params
  );
}

// 상세
export async function fetchOrderDetail(
  orderId: number
): Promise<OrderDetailResponse> {
  return requestJson<OrderDetailResponse>(`/purchase-orders/head/${orderId}`);
}

// 발주 반려
export async function rejectOrder(orderId: number, note: string) {
  return requestJson<any>(`/purchase-orders/${orderId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}

// 발주 승인
export async function approveOrder(orderId: number, note: string) {
  return requestJson<any>(`/purchase-orders/${orderId}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}
