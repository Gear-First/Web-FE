import styled from "styled-components";
import { formatNumber } from "../../utils/formatNumber";

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

const Value = styled.span<{
  $tone: "positive" | "warning" | "negative" | "neutral";
}>`
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: ${({ $tone }) =>
    $tone === "negative"
      ? "#dc2626"
      : $tone === "warning"
      ? "#f59e0b"
      : $tone === "positive"
      ? "#0f0f11"
      : "#6c6c72"};
`;

const Delta = styled.span<{ $tone: "positive" | "neutral" | "negative" }>`
  font-size: 0.82rem;
  color: ${({ $tone }) =>
    $tone === "positive"
      ? "#0f766e"
      : $tone === "negative"
      ? "#dc2626"
      : "#52525b"};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e4e4e7;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => `${Math.min(100, Math.max(0, $percentage))}%`};
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

type InactiveStockCardProps = {
  inactiveCount: number;
  totalCount: number;
  inactivePercentage: number;
  isLoading: boolean;
};

export default function InactiveStockCard({
  inactiveCount,
  totalCount,
  inactivePercentage,
  isLoading,
}: InactiveStockCardProps) {
  const getTone = (percentage: number): "positive" | "warning" | "negative" => {
    if (percentage < 10) return "positive";
    if (percentage < 25) return "warning";
    return "negative";
  };

  const getColor = (percentage: number): string => {
    if (percentage < 10) return "#10b981";
    if (percentage < 25) return "#f59e0b";
    return "#ef4444";
  };

  const tone = getTone(inactivePercentage);
  const color = getColor(inactivePercentage);

  return (
    <Card>
      <Label>비활성 재고 (90일+ 미출고)</Label>
      {isLoading ? (
        <Value $tone="neutral">· · ·</Value>
      ) : (
        <>
          <Value $tone={tone}>{formatNumber(inactiveCount)}건</Value>
          <Delta $tone={tone === "negative" ? "negative" : "neutral"}>
            전체 재고 중 {inactivePercentage.toFixed(1)}%
          </Delta>
          <ProgressBar>
            <ProgressFill $percentage={inactivePercentage} $color={color} />
          </ProgressBar>
          <Delta $tone="neutral">
            총 {formatNumber(totalCount)}건 중 {formatNumber(inactiveCount)}건이 90일 이상
            미출고 상태
          </Delta>
        </>
      )}
    </Card>
  );
}
