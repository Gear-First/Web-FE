import axios from "axios";
import type {
  PendingOrderResponse,
  ProcessedOrderResponse,
} from "./RequestTypes";

// React Query 키
export const requestKeys = {
  pendingOrders: ["request", "pending-orders"] as const,
  processedOrders: ["request", "processed-orders"] as const,
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
api.interceptors.request.use(
  (config) => {
    console.log(
      "[Request]",
      config.method?.toUpperCase(),
      config.url,
      config.data || config.params
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 로그
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "[Response Error]",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("[Network Error]", error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * ✅ 미승인 발주 요청 목록 조회 (POST)
 *
 * @param body - 페이지네이션 정보 { page, size, sort }
 * @param params - 선택적 필터 (startDate, endDate, branchCode, partName)
 */
// export async function fetchPendingOrders(
//   body: { page: number; size: number; sort: string },
//   params?: {
//     startDate?: string;
//     endDate?: string;
//     branchCode?: string;
//     partName?: string;
//   }
// ): Promise<PendingOrderResponse> {
//   try {
//     const res = await api.post("/purchase-orders/head/orders/pending", body, {
//       params,
//     });
//     console.log("✅ [Pending Orders Response]", res.data);
//     return res.data;
//   } catch (error: any) {
//     console.error(
//       "❌ fetchPendingOrders error:",
//       error.response?.data || error.message
//     );
//     throw new Error(
//       error.response?.data?.message || "발주 목록 조회 중 오류 발생"
//     );
//   }
// }

// ✅ 미승인 목록 조회
export async function fetchPendingOrders(
  body: { page: number; size: number; sort: string },
  params?: {
    startDate?: string;
    endDate?: string;
    branchCode?: string;
    partName?: string;
  }
): Promise<PendingOrderResponse> {
  const res = await api.post("/purchase-orders/head/orders/pending", body, {
    params,
  });
  return res.data;
}

// ✅ 승인/반려 목록 조회
export async function fetchProcessedOrders(body: {
  page: number;
  size: number;
  sort: string;
}): Promise<ProcessedOrderResponse> {
  const res = await api.post("/purchase-orders/head/orders/processed", body);
  return res.data;
}
