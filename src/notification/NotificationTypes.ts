export interface NotificationItem {
  id: number;
  eventId: string; // eventid
  type: string; // 제목
  message: string; // 알림 내용
  receiver: string; // 수신자 (본사 등)
  read: boolean; // 읽음 여부
  createdAt?: string; // (선택) 추후 추가 가능
}
