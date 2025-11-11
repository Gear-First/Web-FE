import axios from "axios";
import type { NotificationItem } from "./NotificationTypes";

const BASE_URL = "/notification";

/** 단일 알림 읽음 처리 */
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

/** SSE 연결 (서버가 비정형 data 포맷 보낼 경우 파싱 보정 포함) */
export function connectSSE(
  receiver: string,
  onMessage: (data: NotificationItem | string) => void,
  onError?: (error: any) => void
): EventSource {
  const url = `${BASE_URL}/sse/subscribe?receiver=${receiver}`;
  // console.groupCollapsed("[SSE 연결 시도]");
  // console.log("▶ URL:", url);
  console.groupEnd();

  let eventSource: EventSource;

  try {
    eventSource = new EventSource(url);
    // console.log("EventSource 생성됨:", eventSource);

    /** 연결 성공 */
    eventSource.onopen = (e) => {
      console.log("[SSE] 연결 성공:", e);
    };

    /** 데이터 정규화 파서 */
    const normalizeData = (raw: string): any => {
      try {
        // 괄호() → 중괄호{} 교체
        let fixed = raw
          .trim()
          .replace(/^\(|\)$/g, "{")
          .replace(/\)\s*$/, "}");
        // key 앞뒤 따옴표 정규화
        fixed = fixed.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
        // JSON.parse 시도
        return JSON.parse(fixed);
      } catch (err) {
        console.warn("데이터 파싱 실패 (raw):", raw);
        return raw;
      }
    };

    /** 기본 message 수신 */
    eventSource.onmessage = (e) => {
      // console.log("[기본 message 수신]");
      // console.log("raw data:", e.data);
      const parsed = normalizeData(e.data);
      console.log("파싱 결과:", parsed);
      onMessage(parsed);
    };

    /** event: notification 수신 */
    eventSource.addEventListener("notification", (e: MessageEvent) => {
      // console.log("[notification 이벤트]");
      // console.log("raw data:", e.data);
      const parsed = normalizeData(e.data);
      // console.log("파싱 결과:", parsed);
      onMessage(parsed);
    });

    /** 에러 처리 */
    eventSource.onerror = (e) => {
      console.error("[SSE 오류 발생]", e);
      if (onError) onError(e);
      if (eventSource.readyState === 2) {
        console.warn("연결 닫힘 → 5초 후 재시도");
        eventSource.close();
        setTimeout(() => connectSSE(receiver, onMessage, onError), 5000);
      }
    };

    /** 창 닫을 때 정리 */
    window.addEventListener("beforeunload", () => {
      console.log("[SSE 연결 종료]");
      eventSource.close();
    });
  } catch (err) {
    console.error("[EventSource 생성 예외]", err);
    throw err;
  }

  return eventSource!;
}
