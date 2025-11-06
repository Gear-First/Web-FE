import { useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { OutboundRecord } from "../../outbound/OutboundTypes";

export type SLARiskAlert = {
  type: "outbound" | "inbound" | "request";
  label: string;
  count: number;
  severity: "high" | "medium" | "low";
  detail?: string;
};

type SLAAlertsInput = {
  outboundRecords: UseQueryResult<{ total: number; items: OutboundRecord[] }, unknown>;
  pendingOrdersTotal: number;
  pendingOrdersData?: any; // 실제 데이터 구조에 맞게 수정 필요
};

export function useSLARiskAlerts({ 
  outboundRecords, 
  pendingOrdersTotal 
}: SLAAlertsInput): SLARiskAlert[] {
  return useMemo(() => {
    const alerts: SLARiskAlert[] = [];
    const now = new Date();

    // 출고 SLA 위험 (납기예정일이 지났거나 3일 이내)
    if (outboundRecords.data?.items) {
      const outboundItems = outboundRecords.data.items;
      let highRiskCount = 0;
      let mediumRiskCount = 0;

      outboundItems.forEach((item) => {
        if (!item.expectedShipDate) return;

        const expectedDate = new Date(item.expectedShipDate);
        const daysUntilDue = Math.ceil(
          (expectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue < 0) {
          highRiskCount++;
        } else if (daysUntilDue <= 3) {
          mediumRiskCount++;
        }
      });

      if (highRiskCount > 0) {
        alerts.push({
          type: "outbound",
          label: "납기 지연 출고",
          count: highRiskCount,
          severity: "high",
          detail: "납기예정일이 지난 출고 건",
        });
      }

      if (mediumRiskCount > 0) {
        alerts.push({
          type: "outbound",
          label: "납기 임박 출고",
          count: mediumRiskCount,
          severity: "medium",
          detail: "3일 이내 납기예정 출고 건",
        });
      }
    }

    // 요청 SLA 위험 (장기 미처리 요청)
    if (pendingOrdersTotal >= 10) {
      alerts.push({
        type: "request",
        label: "대량 미처리 요청",
        count: pendingOrdersTotal,
        severity: pendingOrdersTotal >= 20 ? "high" : "medium",
        detail: "승인 대기 중인 요청이 많습니다",
      });
    }

    // 심각도 순으로 정렬 (high > medium > low)
    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [outboundRecords.data, pendingOrdersTotal]);
}

