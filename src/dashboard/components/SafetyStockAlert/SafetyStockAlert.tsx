import styled from "styled-components";
import { formatNumber } from "../../utils/formatNumber";
import type { PartRecord } from "../../../part/PartTypes";

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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const Label = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const AlertBadge = styled.span<{ $severity: "high" | "medium" | "low" }>`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: ${({ $severity }) =>
    $severity === "high"
      ? "rgba(239, 68, 68, 0.12)"
      : $severity === "medium"
      ? "rgba(245, 158, 11, 0.12)"
      : "rgba(16, 185, 129, 0.12)"};
  color: ${({ $severity }) =>
    $severity === "high"
      ? "#dc2626"
      : $severity === "medium"
      ? "#d97706"
      : "#059669"};
  border: 1px solid
    ${({ $severity }) =>
      $severity === "high"
        ? "rgba(239, 68, 68, 0.3)"
        : $severity === "medium"
        ? "rgba(245, 158, 11, 0.3)"
        : "rgba(16, 185, 129, 0.3)"};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SummaryValue = styled.span<{ $tone?: "danger" | "warning" | "success" }>`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === "danger"
      ? "#dc2626"
      : $tone === "warning"
      ? "#d97706"
      : $tone === "success"
      ? "#059669"
      : "#0f0f11"};
`;

const SummaryLabel = styled.span`
  font-size: 0.72rem;
  color: #6c6c72;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const RiskList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
`;

const RiskItem = styled.li<{ $severity: "high" | "medium" }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: ${({ $severity }) =>
    $severity === "high"
      ? "rgba(239, 68, 68, 0.06)"
      : "rgba(245, 158, 11, 0.06)"};
  border: 1px solid
    ${({ $severity }) =>
      $severity === "high"
        ? "rgba(239, 68, 68, 0.2)"
        : "rgba(245, 158, 11, 0.2)"};
`;

const RiskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
`;

const RiskName = styled.strong`
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f0f11;
`;

const RiskDetail = styled.span`
  font-size: 0.72rem;
  color: #6c6c72;
`;

const RiskRatio = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
`;

const RatioValue = styled.span<{ $tone: "danger" | "warning" }>`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ $tone }) => ($tone === "danger" ? "#dc2626" : "#d97706")};
`;

const RatioLabel = styled.span`
  font-size: 0.68rem;
  color: #6c6c72;
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: #6c6c72;
  font-size: 0.82rem;
`;

type SafetyStockSummary = {
  warehouseCode: string;
  critical: number; // 안전재고 이하
  warning: number; // 안전재고의 120% 이하
  normal: number;
  total: number;
};

type RiskItem = {
  warehouseCode: string;
  partCode: string;
  partName: string;
  currentQty: number;
  safetyQty: number;
  ratio: number; // currentQty / safetyQty
  severity: "high" | "medium";
};

type SafetyStockAlertProps = {
  summary: SafetyStockSummary[];
  riskItems: RiskItem[];
  totalCritical: number;
  totalWarning: number;
  totalNormal: number;
  isLoading: boolean;
};

export default function SafetyStockAlert({
  summary,
  riskItems,
  totalCritical,
  totalWarning,
  totalNormal,
  isLoading,
}: SafetyStockAlertProps) {
  const getOverallSeverity = (): "high" | "medium" | "low" => {
    if (totalCritical > 0) return "high";
    if (totalWarning > 0) return "medium";
    return "low";
  };

  const severity = getOverallSeverity();
  const severityLabel =
    severity === "high"
      ? "위험"
      : severity === "medium"
      ? "주의"
      : "정상";

  if (isLoading) {
    return (
      <Card>
        <Label>안전재고 위험 알림</Label>
        <EmptyState>데이터 로딩 중...</EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <Label>안전재고 위험 알림</Label>
        <AlertBadge $severity={severity}>{severityLabel}</AlertBadge>
      </Header>

      <SummaryGrid>
        <SummaryItem>
          <SummaryValue $tone="danger">{formatNumber(totalCritical)}</SummaryValue>
          <SummaryLabel>위험 (안전재고 이하)</SummaryLabel>
        </SummaryItem>
        <SummaryItem>
          <SummaryValue $tone="warning">{formatNumber(totalWarning)}</SummaryValue>
          <SummaryLabel>주의 (120% 이하)</SummaryLabel>
        </SummaryItem>
        <SummaryItem>
          <SummaryValue $tone="success">{formatNumber(totalNormal)}</SummaryValue>
          <SummaryLabel>정상</SummaryLabel>
        </SummaryItem>
      </SummaryGrid>

      {riskItems.length > 0 && (
        <>
          <Label style={{ marginTop: "0.5rem", fontSize: "0.72rem" }}>
            위험 부품 Top {Math.min(5, riskItems.length)}
          </Label>
          <RiskList>
            {riskItems.slice(0, 5).map((item, index) => (
              <RiskItem
                key={`${item.warehouseCode}-${item.partCode}-${index}`}
                $severity={item.severity}
              >
                <RiskInfo>
                  <RiskName>
                    [{item.warehouseCode}] {item.partName}
                  </RiskName>
                  <RiskDetail>
                    현재: {formatNumber(item.currentQty)} / 안전재고:{" "}
                    {formatNumber(item.safetyQty)}
                  </RiskDetail>
                </RiskInfo>
                <RiskRatio>
                  <RatioValue
                    $tone={item.severity === "high" ? "danger" : "warning"}
                  >
                    {formatNumber(item.ratio)}%
                  </RatioValue>
                  <RatioLabel>
                    {item.severity === "high" ? "위험" : "주의"}
                  </RatioLabel>
                </RiskRatio>
              </RiskItem>
            ))}
          </RiskList>
        </>
      )}

      {riskItems.length === 0 && totalCritical === 0 && totalWarning === 0 && (
        <EmptyState>안전재고 위험 항목이 없습니다</EmptyState>
      )}
    </Card>
  );
}
