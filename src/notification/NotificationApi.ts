import axios from "axios";
import type { NotificationItem } from "./NotificationTypes";

// NotificationApi.ts
const BASE_URL = "/notification";

// 단일 알림 읽음 처리
export async function markAsRead(id: number) {
  try {
    const res = await axios.post(
      `${BASE_URL}/notifications/${id}/read`,
      {},
      { withCredentials: true }
    );
    if (res.data?.success) {
      console.log(`[${id}] 읽음 처리 성공`);
    } else {
      console.warn(`[${id}] 읽음 처리 실패`, res.data);
    }
  } catch (err) {
    console.error(`[${id}] 읽음 처리 중 오류`, err);
  }
}

// SSE 연결 (이벤트 스트림 생성)
// NotificationApi.ts
export function connectSSE(
  receiver: string,
  onMessage: (data: NotificationItem) => void,
  onError?: (error: any) => void
) {
  const url = `${BASE_URL}/sse/subscribe?receiver=${receiver}`;
  console.log("[SSE 연결 시도]", url);

  const eventSource = new EventSource(url); // withCredentials 제거

  eventSource.onopen = () => console.log("[SSE] 연결 성공");
  eventSource.onerror = (err) => {
    console.error("[SSE] 연결 오류:", err);
    if (onError) onError(err);
  };

  // 서버에서 'notification' 이벤트로 보낼 경우
  eventSource.addEventListener("notification", (event) => {
    try {
      console.log("📨 [notification]", event.data);
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("알림 파싱 오류:", err, event.data);
    }
  });

  // 서버가 그냥 기본 message로 보낼 경우도 대응
  eventSource.onmessage = (event) => {
    console.log("💬 [message]", event.data);
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.warn("⚠️ 기본 메시지 이벤트 파싱 실패:", event.data);
    }
  };

  return eventSource;
}
