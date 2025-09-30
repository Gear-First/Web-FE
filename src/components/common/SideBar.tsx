import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const SideBarWrapper = styled.aside`
  width: 220px;
  background: #1e2a38;
  color: #fff;
  padding: 20px;
`;

const MenuItem = styled(NavLink)`
  display: block;
  padding: 10px 0;
  font-weight: 500;
  color: #fff;
  text-decoration: none;
  transition: color 0.2s ease;

  &.active {
    font-weight: 700;
    color: #00c4ff;
  }

  &:hover {
    color: #00c4ff;
  }
`;

const menuItems = [
  { to: "/", label: "자재 소요량 산출 및 계획" },
  { to: "/", label: "구매 활동" },
  { to: "/inventory", label: "자재 입고 및 보관" },
  { to: "/", label: "자재 출고" },
];

const SideBar: React.FC = () => {
  return (
    <SideBarWrapper>
      {menuItems.map((menu) => (
        <MenuItem key={menu.to} to={menu.to}>
          {menu.label}
        </MenuItem>
      ))}
    </SideBarWrapper>
  );
};

export default SideBar;
