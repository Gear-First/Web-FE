export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string; // 클릭 시 이동할 주소
}
