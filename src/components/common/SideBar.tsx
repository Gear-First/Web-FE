import React from "react";
import styled from "styled-components";

const SideBarWrapper = styled.div`
  width: 220px;
  background: #1e2a38;
  color: #fff;
  padding: 20px;
`;

const MenuItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>`
  padding: 10px 0;
  font-weight: ${({ isActive }) => (isActive ? "bold" : "normal")};
  color: ${({ isActive }) => (isActive ? "#00c4ff" : "#fff")};
  cursor: pointer;
`;

interface SideBarProps {
  activeMenu: string;
}

const SideBar: React.FC<SideBarProps> = ({ activeMenu }) => {
  const menus = [
    { key: "dashboard", label: "대시보드" },
    { key: "inventory", label: "재고 관리" },
    { key: "orders", label: "주문 관리" },
  ];

  return (
    <SideBarWrapper>
      {menus.map((menu) => (
        <MenuItem key={menu.key} isActive={activeMenu === menu.key}>
          {menu.label}
        </MenuItem>
      ))}
    </SideBarWrapper>
  );
};

export default SideBar;
