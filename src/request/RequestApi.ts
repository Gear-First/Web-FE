import axios from "axios";
import type {
  PendingOrderResponse,
  ProcessedOrderResponse,
  CancelOrderResponse,
  OrderDetailResponse,
} from "./RequestTypes";

export const requestKeys = {
  pendingOrders: ["request", "pending-orders"] as const,
  processedOrders: ["request", "processed-orders"] as const,
  cancelOrders: ["request", "cancel-orders"] as const,
  orderDetail: (id: number) => ["request", "order-detail", id] as const,
};

// axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://34.120.215.23/order/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 제한
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      // Authorization 헤더 추가
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized 발생:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// 미승인 목록 조회
export async function fetchPendingOrders(params: {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PendingOrderResponse> {
  const res = await api.get("/purchase-orders/head/orders/pending", { params });
  return res.data;
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
  const res = await api.get("/purchase-orders/head/orders/processed", {
    params,
  });
  return res.data;
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
  const res = await api.get("/purchase-orders/head/orders/cancel", {
    params,
  });
  return res.data;
}

// 상세
export async function fetchOrderDetail(
  orderId: number
): Promise<OrderDetailResponse> {
  const res = await api.get(`/purchase-orders/head/${orderId}`);
  return res.data;
}

// 발주 반려
export async function rejectOrder(orderId: number, note: string) {
  const res = await api.patch(`/purchase-orders/${orderId}/reject`, {
    note,
  });
  return res.data;
}
