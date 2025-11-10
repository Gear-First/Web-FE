import type { PropsWithChildren, ReactNode } from "react";
import styled from "styled-components";
import {
  FilterGroup,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
} from "../PageLayout";
import LoadingOverlay from "../LoadingOverlay";

interface PageSectionProps {
  title?: string;
  caption?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  footer?: ReactNode;
  isBusy?: boolean;
  loadingText?: string;
  minHeight?: number;
  showOverlay?: boolean;
}

const PageSection = ({
  title,
  caption,
  actions,
  filters,
  children,
  footer,
  isBusy,
  loadingText = "데이터를 불러오는 중입니다...",
  minHeight = 240,
  showOverlay = true,
}: PropsWithChildren<PageSectionProps>) => {
  return (
    <SectionCard>
      {(title || caption || actions) && (
        <SectionHeader>
          <Heading>
            {title ? <SectionTitle>{title}</SectionTitle> : null}
            {caption ? <SectionCaption>{caption}</SectionCaption> : null}
          </Heading>
          {actions}
        </SectionHeader>
      )}

      {filters ? <FilterGroup>{filters}</FilterGroup> : null}

      <Body $minHeight={minHeight}>
        {children}
        <LoadingOverlay
          visible={Boolean(isBusy && showOverlay)}
          label={loadingText}
          coverParent
        />
      </Body>

      {footer ? <Footer>{footer}</Footer> : null}
    </SectionCard>
  );
};

export default PageSection;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Body = styled.div<{ $minHeight: number }>`
  position: relative;
  min-height: ${({ $minHeight }) => `${Math.max(0, $minHeight)}px`};
`;

const Footer = styled.div`
  margin-top: 0.85rem;
`;
