import axios from "axios";
import type { NotificationItem } from "./NotificationTypes";

// const api = axios.create({
//   baseURL: "http://34.120.215.23/common/api/v1",
//   headers: { "Content-Type": "application/json" },
// });

// export async function fetchNotifications(): Promise<NotificationRecord[]> {
//   const res = await api.get("/notifications");
//   return res.data.data ?? [];
// }

export const dummyNotifications: NotificationItem[] = [
  // 📦 출고 관련
  {
    id: 1,
    title: "출고 요청 승인 완료",
    message: "부산지점의 출고 요청이 승인되었습니다.",
    createdAt: "2025-11-08T09:12:00Z",
    isRead: false,
    link: "/outbound",
  },
  {
    id: 2,
    title: "출고 대기 중",
    message: "서울창고의 부품이 출고 준비 중입니다.",
    createdAt: "2025-11-08T08:40:00Z",
    isRead: false,
    link: "/outbound",
  },
  {
    id: 3,
    title: "출고 지연 발생",
    message: "대전지점의 출고 일정이 지연되었습니다.",
    createdAt: "2025-11-07T19:10:00Z",
    isRead: false,
    link: "/outbound",
  },
  {
    id: 4,
    title: "출고 완료 보고",
    message: "광주지점의 출고가 정상적으로 완료되었습니다.",
    createdAt: "2025-11-07T16:05:00Z",
    isRead: false,
    link: "/outbound",
  },

  // 입고 관련
  {
    id: 5,
    title: "입고 요청 등록",
    message: "신규 부품이 입고 요청 상태로 추가되었습니다.",
    createdAt: "2025-11-07T14:55:00Z",
    isRead: false,
    link: "/inbound",
  },
  {
    id: 6,
    title: "입고 완료 처리",
    message: "서울창고의 자재가 입고 완료되었습니다.",
    createdAt: "2025-11-07T13:32:00Z",
    isRead: false,
    link: "/inbound",
  },
  {
    id: 7,
    title: "입고 반려됨",
    message: "A-112 품목의 입고 요청이 반려되었습니다.",
    createdAt: "2025-11-06T18:22:00Z",
    isRead: true,
    link: "/inbound",
  },
  {
    id: 8,
    title: "입고 예정 안내",
    message: "내일 오전 10시, 신품 자재 입고가 예정되어 있습니다.",
    createdAt: "2025-11-06T09:05:00Z",
    isRead: false,
    link: "/inbound",
  },

  // 구매 관련
  {
    id: 9,
    title: "구매 발주 확정",
    message: "A-9001 품목의 구매 발주가 확정되었습니다.",
    createdAt: "2025-11-06T08:45:00Z",
    isRead: false,
    link: "/purchasing",
  },
  {
    id: 10,
    title: "구매 발주 취소됨",
    message: "B-4502 품목의 구매 발주가 취소되었습니다.",
    createdAt: "2025-11-05T22:30:00Z",
    isRead: false,
    link: "/purchasing",
  },
  {
    id: 11,
    title: "구매 단가 변경",
    message: "‘와이퍼 블레이드’의 단가가 조정되었습니다.",
    createdAt: "2025-11-05T18:05:00Z",
    isRead: false,
    link: "/purchasing",
  },
  {
    id: 12,
    title: "공급업체 신규 등록",
    message: "협력사 ‘AutoTech’가 신규 등록되었습니다.",
    createdAt: "2025-11-05T11:12:00Z",
    isRead: true,
    link: "/purchasing",
  },

  // 품목 관련
  {
    id: 13,
    title: "품목 신규 등록",
    message: "‘브레이크 패드 세트’ 품목이 추가되었습니다.",
    createdAt: "2025-11-05T10:00:00Z",
    isRead: false,
    link: "/items",
  },
  {
    id: 14,
    title: "품목 정보 수정",
    message: "‘엔진오일 필터’의 사양 정보가 업데이트되었습니다.",
    createdAt: "2025-11-04T20:15:00Z",
    isRead: false,
    link: "/items",
  },
  {
    id: 15,
    title: "품목 단종 알림",
    message: "‘A-2222 모듈’ 품목이 단종 처리되었습니다.",
    createdAt: "2025-11-04T13:25:00Z",
    isRead: true,
    link: "/items",
  },
  {
    id: 16,
    title: "품목 재분류 완료",
    message: "부품 카테고리 조정이 완료되었습니다.",
    createdAt: "2025-11-04T09:00:00Z",
    isRead: true,
    link: "/items",
  },

  // 자산 관련
  {
    id: 17,
    title: "자산 점검 예정",
    message: "3공장 검사 설비의 점검일이 다가옵니다.",
    createdAt: "2025-11-03T22:00:00Z",
    isRead: false,
    link: "/property",
  },
  {
    id: 18,
    title: "자산 신규 등록",
    message: "‘지게차 #4’가 신규 자산으로 추가되었습니다.",
    createdAt: "2025-11-03T18:40:00Z",
    isRead: false,
    link: "/property",
  },
  {
    id: 19,
    title: "자산 폐기 완료",
    message: "‘컨베이어 벨트 #2’ 자산이 폐기 처리되었습니다.",
    createdAt: "2025-11-03T14:10:00Z",
    isRead: true,
    link: "/property",
  },
  {
    id: 20,
    title: "자산 이동 보고",
    message: "창고 간 자산 이동이 완료되었습니다.",
    createdAt: "2025-11-03T09:35:00Z",
    isRead: true,
    link: "/property",
  },

  // 재고 관련
  {
    id: 21,
    title: "재고 부족 경고",
    message: "‘엔진오일 필터’ 재고가 최소 수량 이하입니다.",
    createdAt: "2025-11-02T23:10:00Z",
    isRead: false,
    link: "/part",
  },
  {
    id: 22,
    title: "재고 조정 완료",
    message: "월말 재고 실사 결과가 반영되었습니다.",
    createdAt: "2025-11-02T19:00:00Z",
    isRead: true,
    link: "/part",
  },
  {
    id: 23,
    title: "재고 이동 처리",
    message: "부산창고 → 서울창고 간 자재 이동이 완료되었습니다.",
    createdAt: "2025-11-02T14:20:00Z",
    isRead: true,
    link: "/part",
  },
  {
    id: 24,
    title: "재고 파손 보고",
    message: "‘C-3101 모듈’ 파손으로 재고 수량이 감소했습니다.",
    createdAt: "2025-11-02T08:55:00Z",
    isRead: false,
    link: "/part",
  },

  // 발주 관련
  {
    id: 25,
    title: "발주 요청 등록",
    message: "인천지점에서 신규 발주 요청을 등록했습니다.",
    createdAt: "2025-11-01T22:40:00Z",
    isRead: false,
    link: "/request",
  },
  {
    id: 26,
    title: "발주 승인 완료",
    message: "대구지점 발주 요청이 본사에서 승인되었습니다.",
    createdAt: "2025-11-01T19:50:00Z",
    isRead: false,
    link: "/request",
  },
  {
    id: 27,
    title: "발주 반려 처리",
    message: "부산지점 발주 요청이 누락 사유로 반려되었습니다.",
    createdAt: "2025-11-01T16:30:00Z",
    isRead: true,
    link: "/request",
  },
  {
    id: 28,
    title: "발주 검토 중",
    message: "서울지점에서 발주 요청이 검토 중입니다.",
    createdAt: "2025-11-01T12:00:00Z",
    isRead: true,
    link: "/request",
  },

  // 기타 / 시스템 알림
  {
    id: 29,
    title: "시스템 점검 안내",
    message: "이번 주 토요일 오전 2시에 서버 점검이 예정되어 있습니다.",
    createdAt: "2025-10-31T09:00:00Z",
    isRead: true,
    link: "/dashboard",
  },
  {
    id: 30,
    title: "새로운 기능 업데이트",
    message: "알림 시스템이 개선되어 UI가 업데이트되었습니다.",
    createdAt: "2025-10-30T08:30:00Z",
    isRead: true,
    link: "/dashboard",
  },
];

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(dummyNotifications), 300);
  });
}
