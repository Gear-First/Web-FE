import styled from "styled-components";
import { formatNumber } from "../../utils/formatNumber";

const HeroCard = styled.section`
  background: #ffffff;
  border-radius: 22px;
  padding: 2rem 2.4rem;
  border: 1px solid #e4e4e7;
  box-shadow: 0 24px 48px rgba(15, 15, 23, 0.05);
  margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.6rem, 2.3vw, 2.1rem);
  letter-spacing: -0.02em;
  color: #0f0f11;
`;

const HeroSubtitle = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.96rem;
  color: #5e5e63;
  line-height: 1.5;
`;

const HeroSummary = styled.div`
  margin-top: 1.8rem;
  display: inline-flex;
  padding: 0.95rem 1.25rem;
  border-radius: 999px;
  border: 1px solid #e4e4e7;
  background: rgba(17, 17, 17, 0.03);
  gap: 1.25rem;
  align-items: center;
`;

const HeroSummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: #6c6c72;

  strong {
    font-size: 1.2rem;
    font-weight: 700;
    color: #0f0f11;
    letter-spacing: -0.01em;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 36px;
  background: rgba(17, 17, 17, 0.12);
`;

type HeroSectionProps = {
  openWorkload: number;
  processedRatio: string;
  inboundWaiting: number;
  outboundWaiting: number;
  isInboundLoading: boolean;
  isOutboundLoading: boolean;
};

export default function HeroSection({
  openWorkload,
  processedRatio,
  inboundWaiting,
  outboundWaiting,
  isInboundLoading,
  isOutboundLoading,
}: HeroSectionProps) {
  return (
    <HeroCard>
      <HeroTitle>GearFirst 운영 현황</HeroTitle>
      <HeroSubtitle>
        오늘 처리해야 할 물류·조달·인력 워크로드를 빠르게 확인하세요.
        실시간 주요 지표를 요약했습니다.
      </HeroSubtitle>

      <HeroSummary>
        <HeroSummaryItem>
          <span>열린 업무</span>
          <strong>{formatNumber(openWorkload)}</strong>
        </HeroSummaryItem>
        <Divider />
        <HeroSummaryItem>
          <span>승인 진행률</span>
          <strong>{processedRatio}</strong>
        </HeroSummaryItem>
        <Divider />
        <HeroSummaryItem>
          <span>출·입고 대기</span>
          <strong>
            {isInboundLoading || isOutboundLoading
              ? "· · ·"
              : formatNumber(inboundWaiting + outboundWaiting)}
          </strong>
        </HeroSummaryItem>
      </HeroSummary>
    </HeroCard>
  );
}

