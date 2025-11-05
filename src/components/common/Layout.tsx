import type { FC, ReactNode } from "react";
import styled from "styled-components";
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
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutWrapper>
      <TopBar />
      <MainWrapper>
        <ContentArea>{children}</ContentArea>
      </MainWrapper>
    </LayoutWrapper>
  );
};

export default Layout;
