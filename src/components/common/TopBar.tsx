import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import BellIcon from "../../assets/BellIcon.png";

const TopBarContainer = styled.header`
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MenuGroup = styled.nav`
  display: flex;
  gap: 20px;
`;

const MenuLink = styled(NavLink)`
  font-weight: 500;
  color: #333;
  text-decoration: none;
  transition: color 0.2s ease;

  &.active {
    color: #1976d2;
    font-weight: 700;
  }

  &:hover {
    color: #1976d2;
  }
`;

const RightActions = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
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
    { id: 9, name: "인적 관리", path: "/human" },
  ];

  return (
    <TopBarContainer>
      <div>GearFirst</div>
      <MenuGroup>
        {menus.map((menu) => (
          <MenuLink key={menu.path} to={menu.path}>
            {menu.name}
          </MenuLink>
        ))}
      </MenuGroup>
      <RightActions>
        <div>박우진님</div>
        <IconButton>
          <img src={BellIcon} alt="알림" width={20} height={20} />
        </IconButton>
      </RightActions>
    </TopBarContainer>
  );
};

export default TopBar;
