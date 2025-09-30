import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import BellIcon from "../../assets/BellIcon.png";

const TopBarContainer = styled.header`
  height: 64px;
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
    { path: "/", label: "자재 소요량 산출 및 계획" },
    { path: "/", label: "구매 활동" },
    { path: "/inventory", label: "자재 입고 및 보관" },
    { path: "/", label: "자재 출고" },
  ];

  return (
    <TopBarContainer>
      <div>GearFirst</div>
      <MenuGroup>
        {menus.map((menu) => (
          <MenuLink key={menu.path} to={menu.path}>
            {menu.label}
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
