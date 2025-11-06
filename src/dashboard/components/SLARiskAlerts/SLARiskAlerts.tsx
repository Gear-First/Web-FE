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

const AlertList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AlertItem = styled.li<{ $severity: "high" | "medium" | "low" }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: ${({ $severity }) =>
    $severity === "high"
      ? "rgba(239, 68, 68, 0.08)"
      : $severity === "medium"
      ? "rgba(245, 158, 11, 0.08)"
      : "rgba(59, 130, 246, 0.08)"};
  border: 1px solid
    ${({ $severity }) =>
      $severity === "high"
        ? "rgba(239, 68, 68, 0.25)"
        : $severity === "medium"
        ? "rgba(245, 158, 11, 0.25)"
        : "rgba(59, 130, 246, 0.25)"};
`;

const AlertInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const AlertTitle = styled.strong`
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f0f11;
`;

const AlertDetail = styled.span`
  font-size: 0.72rem;
  color: #6c6c72;
`;

const AlertCount = styled.span<{ $severity: "high" | "medium" | "low" }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ $severity }) =>
    $severity === "high"
      ? "#dc2626"
      : $severity === "medium"
      ? "#d97706"
      : "#2563eb"};
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: #6c6c72;
  font-size: 0.82rem;
`;

type SLARiskAlert = {
  type: "outbound" | "inbound" | "request";
  label: string;
  count: number;
  severity: "high" | "medium" | "low";
  detail?: string;
};

type SLARiskAlertsProps = {
  alerts: SLARiskAlert[];
  isLoading: boolean;
};

export default function SLARiskAlerts({ alerts, isLoading }: SLARiskAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <Label>SLA 위험 알림</Label>
        <EmptyState>데이터 로딩 중...</EmptyState>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <Label>SLA 위험 알림</Label>
        <EmptyState>위험 알림이 없습니다</EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <Label>SLA 위험 알림</Label>
      <AlertList>
        {alerts.map((alert, index) => (
          <AlertItem key={`${alert.type}-${index}`} $severity={alert.severity}>
            <AlertInfo>
              <AlertTitle>{alert.label}</AlertTitle>
              {alert.detail && <AlertDetail>{alert.detail}</AlertDetail>}
            </AlertInfo>
            <AlertCount $severity={alert.severity}>
              {formatNumber(alert.count)}
            </AlertCount>
          </AlertItem>
        ))}
      </AlertList>
    </Card>
  );
}

