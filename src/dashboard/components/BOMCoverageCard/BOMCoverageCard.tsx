import styled from "styled-components";
import type { UseQueryResult } from "@tanstack/react-query";
import { formatNumber } from "../../utils/formatNumber";
import StatusChip from "../StatusChip/StatusChip";

const Card = styled.section`
  border-radius: 22px;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  padding: 1.6rem;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
`;

const Label = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
`;

const CoverageValue = styled.span`
  font-size: 1.6rem;
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

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${({ $percentage }) => `${Math.min(100, Math.max(0, $percentage))}%`};
  height: 100%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

const Metrics = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #52525b;

    strong {
      color: #0f0f11;
      font-weight: 600;
    }
  }
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: #6c6c72;
  font-size: 0.82rem;
`;

type BOMCoverageCardProps = {
  bomQuery: UseQueryResult<number, unknown>;
  itemQuery: UseQueryResult<number, unknown>;
};

export default function BOMCoverageCard({
  bomQuery,
  itemQuery,
}: BOMCoverageCardProps) {
  const isLoading = bomQuery.isLoading || itemQuery.isLoading;
  const hasError = bomQuery.isError || itemQuery.isError;

  if (hasError) {
    return (
      <Card>
        <Label>BOM 커버리지</Label>
        <EmptyState>BOM 또는 품목 정보를 불러오지 못했습니다</EmptyState>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <Label>BOM 커버리지</Label>
        <EmptyState>데이터 로딩 중...</EmptyState>
      </Card>
    );
  }

  const bomCount = bomQuery.data ?? 0;
  const itemCount = itemQuery.data ?? 0;

  if (!itemCount) {
    return (
      <Card>
        <Label>BOM 커버리지</Label>
        <EmptyState>등록된 품목이 없습니다</EmptyState>
      </Card>
    );
  }

  const rawCoverage = (bomCount / itemCount) * 100;
  const coverage = Math.round(Math.min(100, Math.max(0, rawCoverage)));
  const uncovered = Math.max(itemCount - bomCount, 0);

  let tone: "accent" | "warning" | "danger" = "accent";
  let toneLabel = "양호";
  let barColor = "#111111";

  if (coverage < 50) {
    tone = "danger";
    toneLabel = "위험";
    barColor = "#ef4444";
  } else if (coverage < 80) {
    tone = "warning";
    toneLabel = "주의";
    barColor = "#f59e0b";
  }

  return (
    <Card>
      <TitleRow>
        <Label>BOM 커버리지</Label>
        <StatusChip tone={tone}>{toneLabel}</StatusChip>
      </TitleRow>

      <CoverageValue>{coverage}%</CoverageValue>
      <ProgressBar>
        <ProgressFill $percentage={coverage} $color={barColor} />
      </ProgressBar>

      <Metrics>
        <li>
          <strong>등록된 BOM</strong>
          <span>{formatNumber(bomCount)}건</span>
        </li>
        <li>
          <strong>전체 품목</strong>
          <span>{formatNumber(itemCount)}건</span>
        </li>
        <li>
          <strong>미정의 품목</strong>
          <span>{formatNumber(uncovered)}건</span>
        </li>
      </Metrics>
    </Card>
  );
}
