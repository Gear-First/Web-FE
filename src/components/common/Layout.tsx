import React from "react";
import styled from "styled-components";
import SideBar from "../common/SideBar";
import TopBar from "../common/TopBar";

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainWrapper = styled.div`
  display: flex;
  flex: 1;
`;

interface LayoutProps {
  activeMenu: string;
  setActiveMenu?: (menu: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  activeMenu,
  setActiveMenu,
  children,
}) => {
  return (
    <LayoutWrapper>
      <TopBar activeMenu={activeMenu} setActiveMenu={setActiveMenu!} />
      <MainWrapper>
        <SideBar activeMenu={activeMenu} />
        {children}
      </MainWrapper>
    </LayoutWrapper>
  );
};

export default Layout;
