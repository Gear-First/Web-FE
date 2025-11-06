import { useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { OutboundRecord } from "../../outbound/OutboundTypes";
import type {
  PendingOrderItem,
  ProcessedOrderItem,
} from "../../request/RequestTypes";

type WarehouseDistribution = {
  warehouseId: string;
  value: number;
  assetValue: number;
};

type DashboardData = {
  pendingOrders: UseQueryResult<
    { total: number; items: PendingOrderItem[] },
    unknown
  >;
  processedOrders: UseQueryResult<
    { total: number; items: ProcessedOrderItem[] },
    unknown
  >;
  inboundRecords: UseQueryResult<number, unknown>;
  outboundRecords: UseQueryResult<
    { total: number; items: OutboundRecord[] },
    unknown
  >;
  companyRecords: UseQueryResult<number, unknown>;
  inventoryParts: UseQueryResult<number, unknown>;
  propertyRecords: UseQueryResult<
    {
      total: number;
      assetValue: number;
      warehouseDistribution?: WarehouseDistribution[];
    },
    unknown
  >;
  humanRecords: UseQueryResult<number, unknown>;
};

export function useDashboardCalculations(data: DashboardData) {
  const pendingCount = data.pendingOrders.data?.total ?? 0;
  const inboundCount = data.inboundRecords.data ?? 0;
  const outboundCount = data.outboundRecords.data?.total ?? 0;
  const processedCount = data.processedOrders.data?.total ?? 0;

  const openWorkload = useMemo(
    () => pendingCount + inboundCount + outboundCount,
    [pendingCount, inboundCount, outboundCount]
  );

  const { approvalRate, hasOrderVolume } = useMemo(() => {
    const totalOrders = pendingCount + processedCount;
    if (!totalOrders) {
      return { approvalRate: 0, hasOrderVolume: false };
    }
    const rate = Math.round((processedCount / totalOrders) * 100);
    return { approvalRate: rate, hasOrderVolume: true };
  }, [pendingCount, processedCount]);

  const processedRatio = useMemo(
    () => (hasOrderVolume ? `${approvalRate}%` : "–"),
    [approvalRate, hasOrderVolume]
  );

  return {
    openWorkload,
    processedRatio,
    approvalRate,
    pendingCount,
    inboundCount,
    outboundCount,
    processedCount,
  };
}
