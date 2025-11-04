import axios from "axios";
import type {
  PendingOrderResponse,
  ProcessedOrderResponse,
  OrderDetailResponse,
} from "./RequestTypes";

// React Query 키
export const requestKeys = {
  pendingOrders: ["request", "pending-orders"] as const,
  approvedOrders: ["request", "approved-orders"] as const,
  rejectedOrders: ["request", "rejected-orders"] as const,
  orderDetail: (id: number) => ["request", "order-detail", id] as const,
};

// axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://34.120.215.23/order/api/v1", // 백엔드 API 주소
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 제한
});

// 요청 로그
// api.interceptors.request.use(
//   (config) => {
//     console.log(
//       "[Request]",
//       config.method?.toUpperCase(),
//       config.url,
//       config.data || config.params
//     );
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // 응답 로그
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       console.error(
//         "[Response Error]",
//         error.response.status,
//         error.response.data
//       );
//     } else {
//       console.error("[Network Error]", error.message);
//     }
//     return Promise.reject(error);
//   }
// );

// 미승인 목록 조회
export async function fetchPendingOrders(params: {
  page: number;
  size: number;
  sort?: string;
  partName?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PendingOrderResponse> {
  const res = await api.get("/purchase-orders/head/orders/pending", { params });
  return res.data;
}

// 승인/반려 목록 조회
export async function fetchProcessedOrders(params: {
  page: number;
  size: number;
  sort?: string;
  partName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<ProcessedOrderResponse> {
  const res = await api.get("/purchase-orders/head/orders/other", { params });
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
