import { useMemo } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { formatNumber } from "../utils/formatNumber";
import type { MenuSummary } from "../types/dashboard";
import type { OutboundRecord } from "../../outbound/OutboundTypes";
import type {
  PendingOrderItem,
  ProcessedOrderItem,
} from "../../request/RequestTypes";

type DashboardData = {
  pendingOrders: UseQueryResult<
    { total: number; items: PendingOrderItem[] },
    unknown
  >;
  processedOrders: UseQueryResult<
    { total: number; items: ProcessedOrderItem[] },
    unknown
  >;
  bomRecords: UseQueryResult<number, unknown>;
  companyRecords: UseQueryResult<number, unknown>;
  inventoryParts: UseQueryResult<number, unknown>;
  propertyRecords: UseQueryResult<{ total: number; assetValue: number }, unknown>;
  inboundRecords: UseQueryResult<number, unknown>;
  outboundRecords: UseQueryResult<{ total: number; items: OutboundRecord[] }, unknown>;
  humanRecords: UseQueryResult<number, unknown>;
  itemPartRecords: UseQueryResult<number, unknown>;
};

export function useMenuSummaries(data: DashboardData): MenuSummary[] {
  return useMemo<MenuSummary[]>(() => {
    const cards: MenuSummary[] = [
      {
        key: "request",
        title: "요청 관리",
        route: "/request",
        primary: {
          value: data.pendingOrders.isLoading
            ? "· · ·"
            : formatNumber(data.pendingOrders.data?.total ?? 0),
          label: "승인 대기",
        },
        secondary: data.processedOrders.isLoading
          ? "승인 데이터를 불러오는 중"
          : `이번 주 처리 ${formatNumber(data.processedOrders.data?.total ?? 0)}건`,
        status:
          data.processedOrders.data && data.processedOrders.data.total > 0 ? "ok" : "muted",
        loading: data.pendingOrders.isLoading || data.processedOrders.isLoading,
        error:
          data.pendingOrders.isError || data.processedOrders.isError
            ? "요청 현황을 불러오지 못했습니다"
            : undefined,
      },
      {
        key: "mrp",
        title: "자재 소요량 계획",
        route: "/mrp",
        primary: {
          value: data.bomRecords.isLoading ? "· · ·" : formatNumber(data.bomRecords.data),
          label: "등록된 BOM",
        },
        secondary: "MRP는 최신 BOM 기준으로 계산됩니다",
        status: "muted",
        loading: data.bomRecords.isLoading,
        error: data.bomRecords.isError
          ? "BOM 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "purchasing",
        title: "구매 관리",
        route: "/purchasing",
        primary: {
          value: data.companyRecords.isLoading
            ? "· · ·"
            : formatNumber(data.companyRecords.data),
          label: "협력사 보유",
        },
        secondary: "가격·납기 데이터 최신화 상태를 확인하세요",
        status:
          data.companyRecords.data && data.companyRecords.data > 0 ? "ok" : "warning",
        loading: data.companyRecords.isLoading,
        error: data.companyRecords.isError
          ? "협력사 목록을 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "items",
        title: "품목 관리",
        route: "/items",
        primary: {
          value: data.itemPartRecords.isLoading
            ? "· · ·"
            : formatNumber(data.itemPartRecords.data),
          label: "등록된 품목",
        },
        secondary: "부품·자재·카테고리를 한 화면에서 관리합니다",
        status:
          data.itemPartRecords.data && data.itemPartRecords.data > 0 ? "ok" : "muted",
        loading: data.itemPartRecords.isLoading,
        error: data.itemPartRecords.isError
          ? "품목 정보를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "part",
        title: "재고 관리",
        route: "/part",
        primary: {
          value: data.inventoryParts.isLoading
            ? "· · ·"
            : formatNumber(data.inventoryParts.data),
          label: "창고별 품목",
        },
        secondary:
          data.propertyRecords.isLoading
            ? "자산 가치를 계산 중입니다"
            : `표본 자산 ₩${formatNumber(
                data.propertyRecords.data?.assetValue ?? 0
              )}`,
        status:
          data.inventoryParts.data && data.inventoryParts.data > 0 ? "ok" : "warning",
        loading: data.inventoryParts.isLoading || data.propertyRecords.isLoading,
        error:
          data.inventoryParts.isError || data.propertyRecords.isError
            ? "재고/자산 데이터를 불러오지 못했습니다"
            : undefined,
      },
      {
        key: "property",
        title: "자산 관리",
        route: "/property",
        primary: {
          value: data.propertyRecords.isLoading
            ? "· · ·"
            : formatNumber(data.propertyRecords.data?.total),
          label: "자산 항목",
        },
        secondary:
          data.propertyRecords.isLoading
            ? undefined
            : `총액 ₩${formatNumber(
                data.propertyRecords.data?.assetValue ?? 0
              )}`,
        status:
          data.propertyRecords.data && data.propertyRecords.data.total > 0
            ? "ok"
            : "muted",
        loading: data.propertyRecords.isLoading,
        error: data.propertyRecords.isError
          ? "자산 정보를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "inbound",
        title: "입고 관리",
        route: "/inbound",
        primary: {
          value: data.inboundRecords.isLoading
            ? "· · ·"
            : formatNumber(data.inboundRecords.data),
          label: "입고 예정",
        },
        secondary: "검수 준비 통제를 확인하세요",
        status:
          data.inboundRecords.data && data.inboundRecords.data > 0 ? "warning" : "ok",
        loading: data.inboundRecords.isLoading,
        error: data.inboundRecords.isError
          ? "입고 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "outbound",
        title: "출고 관리",
        route: "/outbound",
        primary: {
          value: data.outboundRecords.isLoading
            ? "· · ·"
            : formatNumber(data.outboundRecords.data?.total ?? 0),
          label: "출고 대기",
        },
        secondary: "납기 위험 출고를 우선 확인하세요",
        status:
          data.outboundRecords.data && data.outboundRecords.data.total > 0 ? "warning" : "ok",
        loading: data.outboundRecords.isLoading,
        error: data.outboundRecords.isError
          ? "출고 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "human",
        title: "인사 관리",
        route: "/human",
        primary: {
          value: data.humanRecords.isLoading
            ? "· · ·"
            : formatNumber(data.humanRecords.data),
          label: "등록 인원",
        },
        secondary: "현장 인력 구성과 역량 분포를 살펴보세요",
        status: data.humanRecords.data && data.humanRecords.data > 0 ? "ok" : "muted",
        loading: data.humanRecords.isLoading,
        error: data.humanRecords.isError
          ? "인사 데이터를 불러오지 못했습니다"
          : undefined,
      },
    ];

    return cards;
  }, [
    data.pendingOrders.isLoading,
    data.pendingOrders.data,
    data.pendingOrders.isError,
    data.processedOrders.isLoading,
    data.processedOrders.data,
    data.processedOrders.isError,
    data.bomRecords.isLoading,
    data.bomRecords.data,
    data.bomRecords.isError,
    data.companyRecords.isLoading,
    data.companyRecords.data,
    data.companyRecords.isError,
    data.itemPartRecords.isLoading,
    data.itemPartRecords.data,
    data.itemPartRecords.isError,
    data.inventoryParts.isLoading,
    data.inventoryParts.data,
    data.inventoryParts.isError,
    data.propertyRecords.isLoading,
    data.propertyRecords.data,
    data.propertyRecords.isError,
    data.inboundRecords.isLoading,
    data.inboundRecords.data,
    data.inboundRecords.isError,
    data.outboundRecords.isLoading,
    data.outboundRecords.data,
    data.outboundRecords.isError,
    data.humanRecords.isLoading,
    data.humanRecords.data,
    data.humanRecords.isError,
  ]);
}
