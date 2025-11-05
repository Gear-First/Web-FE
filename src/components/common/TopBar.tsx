import React from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import BellIcon from "../../assets/BellIcon.png";
import Logo from "../../assets/logo_gearfirst.svg";
import UserMenu from "./UserMenu";

/* ─ tokens: 절제된 기업 톤 */
const color = {
  bg: "#ffffff",
  text: "#0b1220", // 아주 진한 회색
  textDim: "#6b7280",
  primary: "#0f62fe", // 차분한 블루
  line: "#e6e8ec", // 옅은 라인
  hoverBg: "rgba(15, 98, 254, 0.06)",
  focus: "rgba(15, 98, 254, 0.28)",
};

const TopBarContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 60;
  background: ${color.bg};
  border-bottom: 1px solid ${color.line};
`;

const Inner = styled.div`
  min-height: 56px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 8px 20px;

  @media (min-width: 1440px) {
    padding: 8px 28px;
  }
`;

const LogoArea = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-width: 120px;
`;

const HeaderLogo = styled.img`
  width: 116px;
  height: auto;
  display: block;
`;

/* 가운데 메뉴: 심플 중앙 정렬 */
const MenuBar = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MenuGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px; /* 촘촘하지만 읽기 쉬운 간격 */
  white-space: nowrap; /* 한 줄 유지 */
`;

/* 미니멀 탭 */
const MenuLink = styled(NavLink).attrs({ end: false })`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  font-weight: 600;
  font-size: 0.92rem;
  color: ${color.text};
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    background: ${color.hoverBg};
    color: ${color.primary};
  }

  /* 활성: 얇은 언더라인만 */
  &.active {
    color: ${color.primary};
  }
  &.active::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -7px;
    height: 2px;
    border-radius: 999px;
    background: ${color.primary};
  }

  &:focus-visible {
    outline: 3px solid ${color.focus};
    outline-offset: 2px;
  }
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  --size: 34px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: 99999px;
  border: 1px solid ${color.line};
  background: ${color.bg};
  padding: 0;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    transform 0.06s ease;

  &:hover {
    background: ${color.hoverBg};
    border-color: #d9dbe0;
  }
  &:active {
    transform: translateY(1px);
  }
  &:focus-visible {
    outline: 3px solid ${color.focus};
    outline-offset: 2px;
  }
`;

const BellWrap = styled.div`
  position: relative;
`;
const BellImg = styled.img`
  width: 18px;
  height: 18px;
  display: block;
  opacity: 0.9;
`;

/* 작은 상태 점 (필요 시 숨기기) */
const BadgeDot = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  background: #fa5252;
  border-radius: 999px;
  box-shadow: 0 0 0 2px ${color.bg};
`;

const TopBar: React.FC = () => {
  const menus = [
    { id: 0, name: "요청관리", path: "/request" },
    { id: 1, name: "자재 소요량 산출 및 계획", path: "/mrp" },
    { id: 2, name: "구매 관리", path: "/purchasing" },
    { id: 4, name: "품목 관리", path: "/items" },
    { id: 5, name: "재고 관리", path: "/part" },
    { id: 6, name: "자산 관리", path: "/property" },
    { id: 7, name: "입고 관리", path: "/inbound" },
    { id: 8, name: "출고 관리", path: "/outbound" },
    { id: 9, name: "인사 관리", path: "/human" },
  ];

  const unread = true;

  return (
    <TopBarContainer>
      <Inner>
        <LogoArea to="/request" aria-label="GearFirst 홈">
          <HeaderLogo src={Logo} alt="GearFirst" />
        </LogoArea>

        <MenuBar aria-label="주요 메뉴">
          <MenuGroup>
            {menus.map((m) => (
              <MenuLink key={m.id} to={m.path}>
                {m.name}
              </MenuLink>
            ))}
          </MenuGroup>
        </MenuBar>

        <RightActions>
          <UserMenu />
          <IconButton aria-label="알림">
            <BellWrap>
              <BellImg src={BellIcon} alt="알림" />
              {unread && <BadgeDot />}
            </BellWrap>
          </IconButton>
        </RightActions>
      </Inner>
    </TopBarContainer>
  );
};

export default TopBar;
