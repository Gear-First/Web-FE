import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import styled, { keyframes } from "styled-components";
import Button from "./Button";
import { logout } from "../../auth/api/logout";
import {
  getUserProfile,
  subscribeToUserProfile,
} from "../../auth/store/userStore";
import { useNavigate } from "react-router-dom";

type Props = {
  displayName?: string; // 기본 로그인 사용자
  email?: string;
};

export default function UserMenu({ displayName = "사용자", email }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profile = useSyncExternalStore(
    subscribeToUserProfile,
    getUserProfile,
    getUserProfile
  );

  const effectiveName = profile?.name ?? displayName;
  const navigate = useNavigate();

  const close = useCallback(() => setOpen(false), []);

  // 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  const handleProfile = () => {
    close(); // 메뉴 닫기
    navigate("/profile"); // 프로필 페이지로 이동
  };

  const handleLogout = async () => {
    if (confirm("로그아웃하시겠습니까?")) await logout();
  };

  const initials = getInitials(effectiveName);

  return (
    <Wrapper ref={menuRef}>
      <Trigger
        size="md"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar aria-hidden>{initials}</Avatar>
        <Name>{effectiveName}</Name>
        <Caret $open={open} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Caret>
      </Trigger>

      {open && (
        <Menu role="menu" aria-label="user menu">
          <Arrow />
          <MenuHeader>
            <HeaderAvatar>{initials}</HeaderAvatar>
            <HeaderInfo>
              <strong>{effectiveName}</strong>
            </HeaderInfo>
          </MenuHeader>
          <Divider />
          <MenuItem
            variant="default"
            size="md"
            onClick={handleProfile}
            role="menuitem"
          >
            마이 프로필
          </MenuItem>
          <MenuItem
            $danger
            variant="default"
            size="md"
            onClick={handleLogout}
            role="menuitem"
          >
            로그아웃
          </MenuItem>
        </Menu>
      )}
    </Wrapper>
  );
}

/* ========== styled ========== */

const Wrapper = styled.div`
  position: relative;
`;

const Trigger = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;

  &:hover {
    background: #f9fafb;
  }
`;

const Avatar = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f6feb 0%, #3b82f6 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-grid;
  place-items: center;
  letter-spacing: 0.5px;
`;

const Name = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #111827;
`;

const Caret = styled.svg<{ $open: boolean }>`
  width: 18px;
  height: 18px;
  opacity: 0.8;
  transform: rotate(${(p) => (p.$open ? 180 : 0)}deg);
  transition: transform 0.15s ease;
`;

const pop = keyframes`
  0% { opacity: 0; transform: translateY(-6px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  z-index: 2000;
  padding: 8px;
  animation: ${pop} 140ms ease-out both;
  backdrop-filter: saturate(140%) blur(2px);
`;

const Arrow = styled.div`
  position: absolute;
  top: -7px;
  right: 18px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  border-top: 1px solid #e5e7eb;
  transform: rotate(45deg);
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
`;

const HeaderAvatar = styled(Avatar)`
  width: 32px;
  height: 32px;
  font-size: 13px;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    color: #111827;
  }
  small {
    font-size: 12px;
    color: #6b7280;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 6px 0;
`;

const MenuItem = styled(Button)<{ $danger?: boolean }>`
  width: 100%;
  justify-content: flex-start;
  border-radius: 10px;
  background: transparent;

  color: ${({ $danger }) => ($danger ? "#dc2626" : "#374151")};
  padding: 10px 12px;

  &:hover {
    background: #f3f4f6;
  }
`;

/* ========== utils ========== */

function getInitials(name: string): string {
  // 한글/영문 섞여도 앞 글자 2개 정도를 이니셜로
  const trimmed = name.replace(/님$/, "").trim();
  if (!trimmed) return "U";
  // 공백 기준 분리 후 앞글자 조합
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = (first + second).toUpperCase();
  return initials || "U";
}
