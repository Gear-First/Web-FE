import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { fetchNotifications } from "../NotificationApi";
import type { NotificationItem } from "../NotificationTypes";
import BellIcon from "../../assets/BellIcon.png";

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
  width: 300px;
  max-height: 360px; /* 스크롤 가능 영역 */
  overflow-y: auto;
  background: white;
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

const Empty = styled.div`
  padding: 16px;
  text-align: center;
  color: #7a7c84;
  font-size: 0.85rem;
`;

const Loading = styled.div`
  padding: 10px;
  text-align: center;
  font-size: 0.8rem;
  color: #7a7c84;
`;

export const NotificationList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications().then(setNotifications);
  }, []);

  // 외부 클릭 시 닫기
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 클릭 시: 읽음 처리 + 리스트에서 제거 + 페이지 이동
  const handleClick = (item: NotificationItem) => {
    setNotifications((prev) => prev.filter((n) => n.id !== item.id)); // 리스트에서 제거
    setIsOpen(false);
    if (item.link) navigate(item.link);
  };

  // 무한 스크롤
  const loadMore = useCallback(() => {
    if (visibleCount < notifications.length) {
      setIsLoading(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + 10);
        setIsLoading(false);
      }, 400);
    }
  }, [visibleCount, notifications.length]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 1.0 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleNotifications = notifications.slice(0, visibleCount);

  return (
    <BellWrap ref={dropdownRef}>
      <IconButton onClick={() => setIsOpen((prev) => !prev)} aria-label="알림">
        <BellImg src={BellIcon} alt="알림" />
        {unreadCount > 0 && <BadgeDot />}
      </IconButton>

      {isOpen && (
        <Dropdown>
          {visibleNotifications.length > 0 ? (
            <>
              {visibleNotifications.map((n) => (
                <Item
                  key={n.id}
                  $isRead={n.isRead}
                  onClick={() => handleClick(n)}
                >
                  <strong>{n.title}</strong>
                  <span>{n.message}</span>
                </Item>
              ))}
              <div ref={loaderRef} />
              {isLoading && <Loading>불러오는 중...</Loading>}
            </>
          ) : (
            <Empty>새로운 알림이 없습니다</Empty>
          )}
        </Dropdown>
      )}
    </BellWrap>
  );
};
