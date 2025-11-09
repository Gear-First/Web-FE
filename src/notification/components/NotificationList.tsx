import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { connectSSE } from "../NotificationApi";
import type { NotificationItem } from "../NotificationTypes";

/* ===========================
 🎨 Styled Components
=========================== */
const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const BellButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #f9fafb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: #f1f1f1;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 9px;
  height: 9px;
  background: #e53935;
  border-radius: 50%;
  border: 2px solid white;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 48px;
  width: 320px;
  max-height: 420px;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  padding: 10px;
  animation: fadeIn 0.2s ease-in-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const NotificationCard = styled.div`
  background: #f8faff;
  border: 1px solid #e3e6ee;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  transition: 0.2s ease;
  &:hover {
    background: #eef3ff;
  }
`;

const Message = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #222;
`;

const SubInfo = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
`;

export const NotificationList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [connected, setConnected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null); // SSE 유지용 ref

  // ✅ SSE 최초 연결 (1회만)
  useEffect(() => {
    if (eventSourceRef.current) return; // 이미 연결되어 있으면 스킵

    const receiver = "HQ";
    console.log("🚀 SSE 연결 시작");

    const es = connectSSE(
      receiver,
      (data) => {
        console.log("📩 새 알림 수신:", data);

        // 새 알림 객체 생성
        const newItem: NotificationItem = {
          id: data.id ?? Date.now(),
          message: data.message ?? "(메시지 없음)",
          type: data.type ?? "notice",
          eventId: data.eventId ?? "",
          receiver: receiver,
          read: false,
        };

        // ✅ 누적 (최신이 위로)
        setNotifications((prev) => [newItem, ...prev]);
      },
      (err) => {
        console.error("❌ SSE 오류:", err);
        setConnected(false);
      }
    );

    es.onopen = () => {
      console.log("✅ [SSE] 연결 성공");
      setConnected(true);
    };

    eventSourceRef.current = es;

    // cleanup 시 연결 닫기
    return () => {
      console.log("🔌 SSE 연결 해제");
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // ✅ 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Wrapper ref={dropdownRef}>
      <BellButton onClick={() => setIsOpen((prev) => !prev)}>🔔</BellButton>
      {notifications.some((n) => !n.read) && <Badge />}

      {isOpen && (
        <Dropdown>
          {connected ? (
            notifications.length > 0 ? (
              notifications.map((n) => (
                <NotificationCard key={n.id}>
                  <Message>{n.message}</Message>
                  <SubInfo>ID: {n.id}</SubInfo>
                </NotificationCard>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#888", padding: 12 }}>
                아직 알림이 없습니다.
              </div>
            )
          ) : (
            <div style={{ textAlign: "center", color: "#777", padding: 12 }}>
              ⏳ 서버와 연결 중...
            </div>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};
