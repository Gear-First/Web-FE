import React, { useState } from "react";
import styled from "styled-components";
import SideBar from "../common/SideBar";
import TopBar from "../common/TopBar";

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const MainWrapper = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <LayoutWrapper>
      <TopBar />
      <MainWrapper>
        {/* <SideBar
          open={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        /> */}
        <ContentArea>{children}</ContentArea>
      </MainWrapper>
    </LayoutWrapper>
  );
};

export default Layout;
