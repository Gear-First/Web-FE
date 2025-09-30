import React from "react";
import styled from "styled-components";

const TopBarContainer = styled.div`
  height: 64px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MenuGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const MenuItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>`
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  color: ${(props) => (props.active ? "#1976d2" : "#333")};
  cursor: pointer;
`;

const RightActions = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

interface TopBarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeMenu, setActiveMenu }) => {
  const menus = ["재고관리", "통계", "지점관리"];

  return (
    <TopBarContainer>
      <div>GearFirst</div>
      <MenuGroup>
        {menus.map((menu) => (
          <MenuItem
            key={menu}
            active={menu === activeMenu}
            onClick={() => setActiveMenu(menu)}
          >
            {menu}
          </MenuItem>
        ))}
      </MenuGroup>
      <RightActions>
        <div>홍길동님</div>
        <button>🔔</button>
        <button>⚙️</button>
      </RightActions>
    </TopBarContainer>
  );
};

export default TopBar;
