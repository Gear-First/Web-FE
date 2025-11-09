import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import BellIcon from "../../assets/BellIcon.png";
import { markAsRead, connectSSE } from "../NotificationApi";
import type { NotificationItem } from "../NotificationTypes";

const BellWrap = styled.div`
  position: relative;
`;

const IconButton = styled.button`
  --size: 40px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: 99999px;
  border: 1px solid rgba(17, 17, 26, 0.1);
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  &:hover {
    background: rgba(17, 17, 26, 0.08);
    border-color: rgba(17, 17, 26, 0.16);
  }
`;

const BellImg = styled.img`
  width: 18px;
  height: 18px;
  opacity: 0.9;
`;

const BadgeDot = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 9px;
  height: 9px;
  background: #c41e3a;
  border-radius: 999px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.92);
`;

const Dropdown = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid rgba(17, 17, 26, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
`;

const Item = styled.div<{ $isRead: boolean }>`
  padding: 10px 14px;
  font-size: 0.9rem;
  color: ${({ $isRead }) => ($isRead ? "#7a7c84" : "#15161c")};
  border-bottom: 1px solid rgba(17, 17, 26, 0.05);
  cursor: pointer;
  background: ${({ $isRead }) =>
    $isRead ? "rgba(17,17,26,0.02)" : "transparent"};
  transition: background 0.15s;
  &:hover {
    background: rgba(17, 17, 26, 0.05);
  }
  &:last-child {
    border-bottom: none;
  }
  strong {
    display: block;
    font-weight: 600;
    margin-bottom: 3px;
  }
  span {
    font-size: 0.82rem;
    color: #6b6b73;
  }
`;

export const NotificationList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("(아직 수신 없음)");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // SSE 연결
  useEffect(() => {
    const receiver = "HQ";

    const eventSource = connectSSE(
      receiver,
      (newNotification) => {
        console.log("[프론트 수신] ", newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
        setLastMessage(JSON.stringify(newNotification, null, 2)); // 마지막 수신 데이터 출력용
      },
      (error) => {
        console.error("SSE 오류:", error);
        setLastMessage(`SSE 오류: ${error.type}`);
      }
    );

    return () => eventSource.close();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
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

  // 알림 클릭 시 읽음 처리
  const handleClick = async (item: NotificationItem) => {
    await markAsRead(item.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    navigate("/dashboard");
    setIsOpen(false);
  };

  return (
    <BellWrap ref={dropdownRef}>
      <IconButton onClick={() => setIsOpen((prev) => !prev)} aria-label="알림">
        <BellImg src={BellIcon} alt="알림" />
        {notifications.some((n) => !n.read) && <BadgeDot />}
      </IconButton>

      {isOpen && (
        <Dropdown>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #eee" }}>
            <strong style={{ fontSize: "0.85rem", color: "#555" }}>
              📡 실시간 수신 데이터:
            </strong>
            <pre
              style={{
                fontSize: "0.75rem",
                color: "#444",
                background: "#fafafa",
                padding: "6px",
                borderRadius: "6px",
                marginTop: "4px",
                overflowX: "auto",
              }}
            >
              {lastMessage}
            </pre>
          </div>

          {notifications.length > 0 ? (
            notifications.map((n) => (
              <Item key={n.id} $isRead={n.read} onClick={() => handleClick(n)}>
                <strong>[{n.type}] 새 알림</strong>
                <span>{n.message}</span>
              </Item>
            ))
          ) : (
            <div style={{ padding: 12, textAlign: "center", color: "#888" }}>
              새 알림이 없습니다.
            </div>
          )}
        </Dropdown>
      )}
    </BellWrap>
  );
};
