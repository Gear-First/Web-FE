import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import Logo from "../../assets/logo_gearfirst.svg";
import UserMenu from "./UserMenu";
import { readCurrentUserFromToken } from "../../auth/utils/currentUser";
import { NotificationList } from "../../notification/components/NotificationList";

/* ─ tokens: 절제된 기업 톤 */
const color = {
  bg: "rgba(255, 255, 255, 0.92)",
  text: "#15161c",
  textDim: "#7a7c84",
  primary: "#0f0f11",
  line: "rgba(17, 17, 26, 0.08)",
  hoverBg: "rgba(17, 17, 26, 0.08)",
  focus: "rgba(17, 17, 26, 0.18)",
};

const TopBarContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 60;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: ${color.bg};
  border-bottom: 1px solid ${color.line};
  box-shadow: 0 12px 24px rgba(12, 12, 18, 0.06);
`;

const Inner = styled.div`
  min-height: 64px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 12px 28px;
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
  filter: saturate(0);
`;

/* 가운데 메뉴: 심플 중앙 정렬 */
const MenuBar = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
`;

const MenuGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
`;

/* 미니멀 탭 */
const MenuLink = styled(NavLink).attrs({ end: false })`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 14px;
  font-weight: 600;
  font-size: 0.88rem;
  color: ${color.text};
  text-decoration: none;
  border-radius: 999px;
  transition: color 0.18s ease, background-color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background: ${color.hoverBg};
    color: ${color.primary};
    transform: translateY(-1px);
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
    bottom: -6px;
    height: 3px;
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
  gap: 12px;
`;

const TopBar: React.FC = () => {
  const [profile, setProfile] = useState(readCurrentUserFromToken());

  useEffect(() => {
    const syncProfile = () => {
      setProfile(readCurrentUserFromToken());
    };

    window.addEventListener("storage", syncProfile);
    window.addEventListener("focus", syncProfile);

    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("focus", syncProfile);
    };
  }, []);

  const menus = [
    { id: -1, name: "대시보드", path: "/dashboard" },
    { id: 0, name: "요청관리", path: "/request" },
    { id: 1, name: "자재 소요량 산출 및 계획", path: "/mrp" },
    { id: 2, name: "구매 관리", path: "/purchasing" },
    { id: 4, name: "품목 관리", path: "/items" },
    { id: 5, name: "재고 관리", path: "/part" },
    { id: 10, name: "차량 모델", path: "/car-models" },
    { id: 6, name: "자산 관리", path: "/property" },
    { id: 7, name: "입고 관리", path: "/inbound" },
    { id: 8, name: "출고 관리", path: "/outbound" },
    { id: 9, name: "인사 관리", path: "/human" },
  ];

  return (
    <TopBarContainer>
      <Inner>
        <LogoArea to="/dashboard" aria-label="GearFirst 홈">
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
          <NotificationList />
        </RightActions>
      </Inner>
    </TopBarContainer>
  );
};

export default TopBar;
