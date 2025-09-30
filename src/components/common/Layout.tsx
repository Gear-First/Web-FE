import React from "react";
import styled from "styled-components";
import SideBar from "../common/SideBar";
import TopBar from "../common/TopBar";

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const MainWrapper = styled.div`
  display: flex;
  flex: 1;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutWrapper>
      <TopBar />
      <MainWrapper>
        <SideBar />
        {children}
      </MainWrapper>
    </LayoutWrapper>
  );
};

export default Layout;
