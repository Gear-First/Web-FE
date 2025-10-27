import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

interface SideBarProps {
  open: boolean;
  onToggle: () => void;
}

interface SideBarWrapperProps {
  $open: boolean;
}

const SideBarWrapper = styled.aside<SideBarWrapperProps>`
  position: relative;
  width: ${({ $open }) => ($open ? "220px" : "0px")};
  background: #1e2a38;
  color: #fff;
  padding: ${({ $open }) => ($open ? "20px" : "20px 0")};
  transition: width 0.3s ease, padding 0.25s ease;
  overflow: visible;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
`;

const Inner = styled.div<SideBarWrapperProps>`
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: translateX(${({ $open }) => ($open ? "0" : "-10px")});
  transition: opacity 0.2s ease, transform 0.25s ease;
`;

const MenuItem = styled(NavLink)`
  display: block;
  min-width: 200px;
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

const ToggleButton = styled.button<{ $open: boolean }>`
  position: absolute;
  top: 50%;
  left: ${({ $open }) => ($open ? "220px" : "0px")};
  transform: translateY(-50%);
  width: 28px;
  height: 50px;
  background: #1e2a38;
  border: none;
  color: #fff;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: left 0.3s ease, background 0.2s ease;

  &:hover {
    background: #000318;
  }
`;

const menuItems = [
  { to: "/request", label: "요청 관리" },
  { to: "/mrp", label: "자재 소요량 산출 및 계획" },
  { to: "/supplierOrder", label: "구매 활동" },
  { to: "/inventory", label: "재고 관리" },
  { to: "/property", label: "자산 관리" },
  { to: "/inbound", label: "입고 관리" },
  { to: "/outbound", label: "출고 관리" },
];

const SideBar: React.FC<SideBarProps> = ({ open, onToggle }) => {
  return (
    <SideBarWrapper $open={open}>
      <Inner $open={open}>
        {menuItems.map((menu) => (
          <MenuItem key={menu.to} to={menu.to}>
            {menu.label}
          </MenuItem>
        ))}
      </Inner>
      <ToggleButton onClick={onToggle} $open={open}>
        {open ? "◀" : "▶"}
      </ToggleButton>
    </SideBarWrapper>
  );
};

export default SideBar;
