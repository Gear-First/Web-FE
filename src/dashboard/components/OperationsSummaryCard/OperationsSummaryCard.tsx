import styled from "styled-components";
import type { UseQueryResult } from "@tanstack/react-query";
import type { OutboundRecord } from "../../../outbound/OutboundTypes";
import type {
  PendingOrderItem,
  ProcessedOrderItem,
} from "../../../request/RequestTypes";
import { formatNumber } from "../../utils/formatNumber";
import StatusChip from "../StatusChip/StatusChip";

const Card = styled.section`
  width: 100%;
  box-sizing: border-box;
  border-radius: 20px;
  border: 1px solid rgba(228, 228, 231, 0.8);
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  padding: 1.65rem 1.8rem;
  box-shadow: 0 26px 44px rgba(15, 15, 23, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.12rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #111111;
`;

const Caption = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #6c6c72;
  line-height: 1.5;
`;

const ApprovalBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ApprovalLabel = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const ApprovalValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f0f11;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #ededf0;
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color?: string }>`
  width: ${({ $percentage }) => `${Math.min(100, Math.max(0, $percentage))}%`};
  height: 100%;
  background: ${({ $color }) => $color ?? "#111111"};
  transition: width 0.3s ease;
`;

const Metrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  flex: 1;
`;

const MetricCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.8);
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
`;

const MetricLabel = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f0f11;
`;

const MetricValueRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const MetricValue = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f0f11;
`;

const MetricShare = styled.span`
  font-size: 0.76rem;
  color: #6c6c72;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  font-size: 0.82rem;
  color: #6c6c72;
  margin-top: auto;
`;

const FooterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    color: #0f0f11;
    font-weight: 600;
  }
`;

type OperationsSummaryCardProps = {
  pendingQuery: UseQueryResult<
    { total: number; items: PendingOrderItem[] },
    unknown
  >;
  inboundQuery: UseQueryResult<number, unknown>;
  outboundQuery: UseQueryResult<
    { total: number; items: OutboundRecord[] },
    unknown
  >;
  processedQuery: UseQueryResult<
    { total: number; items: ProcessedOrderItem[] },
    unknown
  >;
  approvalRate: number;
  openWorkload: number;
  pendingCount: number;
  inboundCount: number;
  outboundCount: number;
  processedCount: number;
};

type Severity = {
  tone: "accent" | "warning" | "danger" | "muted";
  label: string;
};

const getSeverity = (
  value: number,
  share: number,
  thresholds: { warning: number; danger: number }
): Severity => {
  if (value === 0) {
    return { tone: "accent", label: "정상" };
  }
  if (value >= thresholds.danger || share >= 60) {
    return { tone: "danger", label: "지연 위험" };
  }
  if (value >= thresholds.warning || share >= 35) {
    return { tone: "warning", label: "대기 중" };
  }
  return { tone: "accent", label: "진행 중" };
};

export default function OperationsSummaryCard({
  pendingQuery,
  inboundQuery,
  outboundQuery,
  processedQuery,
  approvalRate,
  openWorkload,
  pendingCount,
  inboundCount,
  outboundCount,
  processedCount,
}: OperationsSummaryCardProps) {
  const isLoading =
    pendingQuery.isLoading || inboundQuery.isLoading || outboundQuery.isLoading;

  const hasError =
    pendingQuery.isError || inboundQuery.isError || outboundQuery.isError;

  const backlogTotal = openWorkload;

  const metrics = [
    {
      key: "pending",
      label: "승인 대기",
      value: pendingCount,
      share:
        backlogTotal > 0 ? Math.round((pendingCount / backlogTotal) * 100) : 0,
      thresholds: { warning: 10, danger: 30 },
    },
    {
      key: "inbound",
      label: "입고 대기",
      value: inboundCount,
      share:
        backlogTotal > 0 ? Math.round((inboundCount / backlogTotal) * 100) : 0,
      thresholds: { warning: 8, danger: 20 },
    },
    {
      key: "outbound",
      label: "출고 대기",
      value: outboundCount,
      share:
        backlogTotal > 0 ? Math.round((outboundCount / backlogTotal) * 100) : 0,
      thresholds: { warning: 8, danger: 20 },
    },
  ];

  const orderVolume = pendingCount + processedCount;
  const hasOrderVolume = orderVolume > 0;
  const hasBacklog = backlogTotal > 0;

  const approvalSeverity: Severity = !hasOrderVolume
    ? { tone: "muted", label: "대상 없음" }
    : approvalRate >= 80
    ? { tone: "accent", label: "원활" }
    : approvalRate >= 50
    ? { tone: "warning", label: "모니터링" }
    : { tone: "danger", label: "집중 필요" };

  const headerStatus: Severity = hasBacklog
    ? approvalSeverity
    : hasOrderVolume
    ? { tone: "accent", label: "여유" }
    : { tone: "muted", label: "대기 없음" };

  const approvalBarPercent = hasOrderVolume ? approvalRate : 0;
  const approvalDisplay = hasOrderVolume
    ? `${formatNumber(approvalRate)}%`
    : "데이터 없음";

  if (hasError) {
    return (
      <Card>
        <Header>
          <Title>업무량 상세</Title>
          <StatusChip tone="danger">오류</StatusChip>
        </Header>
        <Caption>승인·입고·출고 대기량을 불러오지 못했습니다.</Caption>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <Header>
          <Title>업무량 상세</Title>
          <StatusChip tone="muted">로딩 중</StatusChip>
        </Header>
        <Caption>승인·입고·출고 대기량을 계산하는 중입니다.</Caption>
        <ApprovalBlock>
          <ApprovalLabel>승인 완료율</ApprovalLabel>
          <ApprovalValue>· · ·</ApprovalValue>
          <ProgressBar>
            <ProgressFill $percentage={0} />
          </ProgressBar>
        </ApprovalBlock>
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <div>
          <Title>업무량 상세</Title>
          <Caption>승인·입고·출고 대기량 분포와 진행 상황입니다.</Caption>
        </div>
        <StatusChip tone={headerStatus.tone}>{headerStatus.label}</StatusChip>
      </Header>

      <ApprovalBlock>
        <ApprovalLabel>승인 완료율</ApprovalLabel>
        <ApprovalValue>{approvalDisplay}</ApprovalValue>
        <ProgressBar>
          <ProgressFill $percentage={approvalBarPercent} />
        </ProgressBar>
      </ApprovalBlock>

      <Metrics>
        {metrics.map((metric) => {
          const severity = getSeverity(
            metric.value,
            metric.share,
            metric.thresholds
          );
          return (
            <MetricCard key={metric.key}>
              <MetricHeader>
                <MetricLabel>{metric.label}</MetricLabel>
                <StatusChip tone={severity.tone}>{severity.label}</StatusChip>
              </MetricHeader>
              <MetricValueRow>
                <MetricValue>{formatNumber(metric.value)}</MetricValue>
                <MetricShare>{metric.share}%</MetricShare>
              </MetricValueRow>
              <ProgressBar>
                <ProgressFill
                  $percentage={metric.share}
                  $color={
                    severity.tone === "danger"
                      ? "#ef4444"
                      : severity.tone === "warning"
                      ? "#f59e0b"
                      : "#111111"
                  }
                />
              </ProgressBar>
            </MetricCard>
          );
        })}
      </Metrics>

      <Footer>
        <FooterItem>
          <strong>총 대기</strong>
          <span>{formatNumber(backlogTotal)}건</span>
        </FooterItem>
        <FooterItem>
          <strong>승인 완료</strong>
          <span>
            {processedQuery.isError
              ? "데이터 없음"
              : processedQuery.isLoading
              ? "· · ·"
              : `${formatNumber(processedCount)}건`}
          </span>
        </FooterItem>
      </Footer>
    </Card>
  );
}
