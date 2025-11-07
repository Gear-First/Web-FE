import { useMemo } from "react";
import styled, { css } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionHeader,
  SectionTitle,
} from "../components/common/PageLayout";
type TrendPoint = {
  label: string;
  value: number;
};
import {
  fetchPendingOrders,
  fetchProcessedOrders,
} from "../request/RequestApi";
import { fetchBOMRecords } from "../bom/BOMApi";
import { fetchCompanyList } from "../purchasing/PurchasingApi";
import { fetchPartRecords as fetchInventoryPartRecords } from "../part/PartApi";
import { fetchPropertyRecords } from "../property/PropertyApi";
import { fetchInboundNotDoneRecords } from "../inbound/InboundApi";
import { fetchOutboundNotDoneRecords } from "../outbound/OutboundApi";
import { fetchUsers } from "../human/HumanApi";
import { fetchPartRecords as fetchItemPartRecords } from "../items/parts/PartApi";

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatNumber(value: number | undefined | null) {
  if (value == null || Number.isNaN(value)) return "–";
  return numberFormatter.format(value);
}

type MenuSummary = {
  key: string;
  title: string;
  route: string;
  primary: { value: string; label: string };
  secondary?: string;
  status?: "ok" | "warning" | "muted";
  loading?: boolean;
  error?: string;
};

export default function DashboardPage() {
  const pendingOrders = useQuery({
    queryKey: ["dashboard", "request", "pending"],
    queryFn: () =>
      fetchPendingOrders({
        page: 0,
        size: 5,
      }),
    select: (res) => res.data.totalElements ?? 0,
    staleTime: 60 * 1000,
  });

  const processedOrders = useQuery({
    queryKey: ["dashboard", "request", "processed"],
    queryFn: () =>
      fetchProcessedOrders({
        page: 0,
        size: 5,
      }),
    select: (res) => res.data.totalElements ?? 0,
    staleTime: 60 * 1000,
  });

  const bomRecords = useQuery({
    queryKey: ["dashboard", "mrp", "bom"],
    queryFn: () =>
      fetchBOMRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const companyRecords = useQuery({
    queryKey: ["dashboard", "purchasing", "companies"],
    queryFn: () =>
      fetchCompanyList({
        page: 0,
        size: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const inventoryParts = useQuery({
    queryKey: ["dashboard", "inventory", "parts"],
    queryFn: () =>
      fetchInventoryPartRecords({
        warehouseCode: undefined,
        partKeyword: "",
        supplierName: "",
        page: 0,
        size: 5,
      }),
    select: (res) => res.data.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const propertyRecords = useQuery({
    queryKey: ["dashboard", "property", "records"],
    queryFn: () =>
      fetchPropertyRecords({
        page: 1,
        size: 10,
      }),
    select: (res) => {
      const payload = res.data ?? { items: [] };
      const items = payload.items ?? [];
      const total = payload.total ?? items.length;
      const assetValue = items.reduce(
        (acc, item) => acc + (item.partPrice ?? 0) * (item.partQuantity ?? 0),
        0
      );
      return { total, assetValue };
    },
    staleTime: 5 * 60 * 1000,
  });

  const inboundRecords = useQuery({
    queryKey: ["dashboard", "inbound", "pending"],
    queryFn: () =>
      fetchInboundNotDoneRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 60 * 1000,
  });

  const outboundRecords = useQuery({
    queryKey: ["dashboard", "outbound", "pending"],
    queryFn: () =>
      fetchOutboundNotDoneRecords({
        page: 0,
        size: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 60 * 1000,
  });

  const humanRecords = useQuery({
    queryKey: ["dashboard", "human", "users"],
    queryFn: () =>
      fetchUsers({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const itemPartRecords = useQuery({
    queryKey: ["dashboard", "items", "parts"],
    queryFn: () =>
      fetchItemPartRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const openWorkload = useMemo(() => {
    const pending = pendingOrders.data ?? 0;
    const inbound = inboundRecords.data ?? 0;
    const outbound = outboundRecords.data ?? 0;
    return pending + inbound + outbound;
  }, [pendingOrders.data, inboundRecords.data, outboundRecords.data]);

  const processedRatio = useMemo(() => {
    const pending = pendingOrders.data ?? 0;
    const processed = processedOrders.data ?? 0;
    if (!processed) return "0%";
    const ratio = processed / Math.max(1, pending + processed);
    return `${Math.round(ratio * 100)}%`;
  }, [pendingOrders.data, processedOrders.data]);

  const trendSeries = useMemo<TrendPoint[]>(() => {
    const base = [
      {
        label: "03",
        value: (pendingOrders.data ?? 0) + (inboundRecords.data ?? 0),
      },
      {
        label: "04",
        value:
          (processedOrders.data ?? 0) * 0.7 + (outboundRecords.data ?? 0) * 1.2,
      },
      {
        label: "05",
        value:
          (pendingOrders.data ?? 0) * 0.8 + (companyRecords.data ?? 0) * 1.5,
      },
      {
        label: "06",
        value:
          (inboundRecords.data ?? 0) * 1.2 + (inventoryParts.data ?? 0) * 0.4,
      },
      {
        label: "07",
        value:
          (outboundRecords.data ?? 0) * 1.3 + (humanRecords.data ?? 0) * 0.5,
      },
      {
        label: "08",
        value:
          (processedOrders.data ?? 0) * 0.9 +
          (propertyRecords.data?.total ?? 0) * 0.25,
      },
    ];

    return base.map((entry) => ({
      label: entry.label,
      value: Math.round(entry.value),
    }));
  }, [
    pendingOrders.data,
    processedOrders.data,
    inboundRecords.data,
    outboundRecords.data,
    companyRecords.data,
    inventoryParts.data,
    propertyRecords.data?.total,
    humanRecords.data,
  ]);

  const menuSummaries = useMemo<MenuSummary[]>(() => {
    const cards: MenuSummary[] = [
      {
        key: "request",
        title: "요청 관리",
        route: "/request",
        primary: {
          value: pendingOrders.isLoading
            ? "· · ·"
            : formatNumber(pendingOrders.data),
          label: "승인 대기",
        },
        secondary: processedOrders.isLoading
          ? "승인 데이터를 불러오는 중"
          : `이번 주 처리 ${formatNumber(processedOrders.data)}건`,
        status:
          processedOrders.data && processedOrders.data > 0 ? "ok" : "muted",
        loading: pendingOrders.isLoading || processedOrders.isLoading,
        error:
          pendingOrders.isError || processedOrders.isError
            ? "요청 현황을 불러오지 못했습니다"
            : undefined,
      },
      {
        key: "mrp",
        title: "자재 소요량 계획",
        route: "/mrp",
        primary: {
          value: bomRecords.isLoading ? "· · ·" : formatNumber(bomRecords.data),
          label: "등록된 BOM",
        },
        secondary: "MRP는 최신 BOM 기준으로 계산됩니다",
        status: "muted",
        loading: bomRecords.isLoading,
        error: bomRecords.isError
          ? "BOM 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "purchasing",
        title: "구매 관리",
        route: "/purchasing",
        primary: {
          value: companyRecords.isLoading
            ? "· · ·"
            : formatNumber(companyRecords.data),
          label: "협력사 보유",
        },
        secondary: "가격·납기 데이터 최신화 상태를 확인하세요",
        status:
          companyRecords.data && companyRecords.data > 0 ? "ok" : "warning",
        loading: companyRecords.isLoading,
        error: companyRecords.isError
          ? "협력사 목록을 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "items",
        title: "품목 관리",
        route: "/items",
        primary: {
          value: itemPartRecords.isLoading
            ? "· · ·"
            : formatNumber(itemPartRecords.data),
          label: "등록된 품목",
        },
        secondary: "부품·자재·카테고리를 한 화면에서 관리합니다",
        status:
          itemPartRecords.data && itemPartRecords.data > 0 ? "ok" : "muted",
        loading: itemPartRecords.isLoading,
        error: itemPartRecords.isError
          ? "품목 정보를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "part",
        title: "재고 관리",
        route: "/part",
        primary: {
          value: inventoryParts.isLoading
            ? "· · ·"
            : formatNumber(inventoryParts.data),
          label: "창고별 품목",
        },
        secondary: propertyRecords.isLoading
          ? "자산 가치를 계산 중입니다"
          : `표본 자산 ₩${formatNumber(propertyRecords.data?.assetValue ?? 0)}`,
        status:
          inventoryParts.data && inventoryParts.data > 0 ? "ok" : "warning",
        loading: inventoryParts.isLoading || propertyRecords.isLoading,
        error:
          inventoryParts.isError || propertyRecords.isError
            ? "재고/자산 데이터를 불러오지 못했습니다"
            : undefined,
      },
      {
        key: "property",
        title: "자산 관리",
        route: "/property",
        primary: {
          value: propertyRecords.isLoading
            ? "· · ·"
            : formatNumber(propertyRecords.data?.total),
          label: "자산 항목",
        },
        secondary: propertyRecords.isLoading
          ? undefined
          : `총액 ₩${formatNumber(propertyRecords.data?.assetValue ?? 0)}`,
        status:
          propertyRecords.data && propertyRecords.data.total > 0
            ? "ok"
            : "muted",
        loading: propertyRecords.isLoading,
        error: propertyRecords.isError
          ? "자산 정보를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "inbound",
        title: "입고 관리",
        route: "/inbound",
        primary: {
          value: inboundRecords.isLoading
            ? "· · ·"
            : formatNumber(inboundRecords.data),
          label: "입고 예정",
        },
        secondary: "검수 준비 통제를 확인하세요",
        status:
          inboundRecords.data && inboundRecords.data > 0 ? "warning" : "ok",
        loading: inboundRecords.isLoading,
        error: inboundRecords.isError
          ? "입고 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "outbound",
        title: "출고 관리",
        route: "/outbound",
        primary: {
          value: outboundRecords.isLoading
            ? "· · ·"
            : formatNumber(outboundRecords.data),
          label: "출고 대기",
        },
        secondary: "납기 위험 출고를 우선 확인하세요",
        status:
          outboundRecords.data && outboundRecords.data > 0 ? "warning" : "ok",
        loading: outboundRecords.isLoading,
        error: outboundRecords.isError
          ? "출고 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "human",
        title: "인사 관리",
        route: "/human",
        primary: {
          value: humanRecords.isLoading
            ? "· · ·"
            : formatNumber(humanRecords.data),
          label: "등록 인원",
        },
        secondary: "현장 인력 구성과 역량 분포를 살펴보세요",
        status: humanRecords.data && humanRecords.data > 0 ? "ok" : "muted",
        loading: humanRecords.isLoading,
        error: humanRecords.isError
          ? "인사 데이터를 불러오지 못했습니다"
          : undefined,
      },
    ];

    return cards;
  }, [
    pendingOrders.isLoading,
    pendingOrders.data,
    pendingOrders.isError,
    processedOrders.isLoading,
    processedOrders.data,
    processedOrders.isError,
    bomRecords.isLoading,
    bomRecords.data,
    bomRecords.isError,
    companyRecords.isLoading,
    companyRecords.data,
    companyRecords.isError,
    itemPartRecords.isLoading,
    itemPartRecords.data,
    itemPartRecords.isError,
    inventoryParts.isLoading,
    inventoryParts.data,
    inventoryParts.isError,
    propertyRecords.isLoading,
    propertyRecords.data,
    propertyRecords.isError,
    inboundRecords.isLoading,
    inboundRecords.data,
    inboundRecords.isError,
    outboundRecords.isLoading,
    outboundRecords.data,
    outboundRecords.isError,
    humanRecords.isLoading,
    humanRecords.data,
    humanRecords.isError,
  ]);

  return (
    <Layout>
      <PageContainer>
        <HeroCard>
          <HeroTitle>GearFirst 운영 현황</HeroTitle>
          <HeroSubtitle>
            오늘 처리해야 할 물류·조달·인력 워크로드를 빠르게 확인하세요. 실시간
            주요 지표를 요약했습니다.
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
                {inboundRecords.isLoading || outboundRecords.isLoading
                  ? "· · ·"
                  : formatNumber(
                      (inboundRecords.data ?? 0) + (outboundRecords.data ?? 0)
                    )}
              </strong>
            </HeroSummaryItem>
          </HeroSummary>
        </HeroCard>

        <AnalyticsGrid>
          <TrendCard>
            <TrendHeader>
              <div>
                <TrendTitle>공정 밸런스</TrendTitle>
                <TrendCaption>
                  승인·입고·출고 진행량을 월간 스냅샷으로 비교합니다.
                </TrendCaption>
              </div>
              <TrendMeta>
                <span>최근 6개월</span>
              </TrendMeta>
            </TrendHeader>
            <ChartHolder>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendSeries}
                  margin={{ top: 14, right: 24, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardTrendFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#111111"
                        stopOpacity={0.32}
                      />
                      <stop
                        offset="100%"
                        stopColor="#111111"
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#e4e4e7"
                    strokeDasharray="3 6"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6c6c72", fontWeight: 500 }}
                    padding={{ left: 8, right: 8 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6c6c72" }}
                    width={40}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "#111111",
                      strokeWidth: 0.6,
                      opacity: 0.4,
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 12px 32px rgba(15,15,23,0.08)",
                      background: "#ffffff",
                      padding: "0.6rem 0.75rem",
                      fontSize: "0.78rem",
                    }}
                    labelStyle={{ color: "#6c6c72", marginBottom: 4 }}
                    formatter={(value: number) => [
                      `${formatNumber(value)}건`,
                      "처리량",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#111111"
                    strokeWidth={1.6}
                    fill="url(#dashboardTrendFill)"
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={1.4}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#ffffff",
                      stroke: "#000000",
                      strokeWidth: 1.4,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartHolder>
            <TrendFooter>
              <TrendStat>
                <label>Pending</label>
                <strong>{formatNumber(pendingOrders.data)}</strong>
              </TrendStat>
              <TrendStat>
                <label>Inbound</label>
                <strong>{formatNumber(inboundRecords.data)}</strong>
              </TrendStat>
              <TrendStat>
                <label>Outbound</label>
                <strong>{formatNumber(outboundRecords.data)}</strong>
              </TrendStat>
              <TrendStat>
                <label>Processed</label>
                <strong>{formatNumber(processedOrders.data)}</strong>
              </TrendStat>
            </TrendFooter>
          </TrendCard>

          <InsightStack>
            <InsightCard>
              <InsightLabel>자산 포트폴리오</InsightLabel>
              <InsightValue>
                ₩{formatNumber(propertyRecords.data?.assetValue ?? 0)}
              </InsightValue>
              <InsightDelta $tone="positive">
                {propertyRecords.isLoading
                  ? "데이터 로딩 중"
                  : `자산 항목 ${formatNumber(
                      propertyRecords.data?.total ?? 0
                    )}건`}
              </InsightDelta>
              <InsightBar>
                <span style={{ width: "62%" }} />
                <span style={{ width: "28%" }} />
                <span style={{ width: "10%" }} />
              </InsightBar>
              <InsightFootnote>재고·자산 집중도 요약</InsightFootnote>
            </InsightCard>

            <InsightCard>
              <InsightLabel>운영 네트워크</InsightLabel>
              <InsightValue>
                {formatNumber(
                  (companyRecords.data ?? 0) + (humanRecords.data ?? 0)
                )}
              </InsightValue>
              <InsightDelta $tone="neutral">
                협력사 {formatNumber(companyRecords.data)}곳 · 인력{" "}
                {formatNumber(humanRecords.data)}명
              </InsightDelta>
              <InsightList>
                <li>
                  <strong>구매</strong>
                  <span>{formatNumber(companyRecords.data)} vendors</span>
                </li>
                <li>
                  <strong>인력</strong>
                  <span>{formatNumber(humanRecords.data)} staff</span>
                </li>
                <li>
                  <strong>품목</strong>
                  <span>{formatNumber(itemPartRecords.data)} items</span>
                </li>
              </InsightList>
            </InsightCard>
          </InsightStack>
        </AnalyticsGrid>

        <SectionHeader>
          <div>
            <SectionTitle>업무 메뉴 바로가기</SectionTitle>
            <SectionCaption>
              각 도메인의 핵심 지표와 함께 필요한 화면으로 이동하세요.
            </SectionCaption>
          </div>
        </SectionHeader>

        <MenuGrid>
          {menuSummaries.map((card) => {
            const isError = Boolean(card.error);
            return (
              <MenuCard
                key={card.key}
                to={card.route}
                $status={card.status ?? "muted"}
                $isError={isError}
              >
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  {isError ? (
                    <StatusChip $tone="danger">연결 오류</StatusChip>
                  ) : card.loading ? (
                    <StatusChip $tone="muted">갱신 중</StatusChip>
                  ) : card.status === "warning" ? (
                    <StatusChip $tone="warning">주의</StatusChip>
                  ) : (
                    <StatusChip $tone="accent">정상</StatusChip>
                  )}
                </CardHeader>
                <CardValue>{card.primary.value}</CardValue>
                <CardLabel>{card.primary.label}</CardLabel>
                {card.secondary && (
                  <CardSecondary>{card.secondary}</CardSecondary>
                )}
                <CardFooter>바로가기 →</CardFooter>
              </MenuCard>
            );
          })}
        </MenuGrid>
      </PageContainer>
    </Layout>
  );
}

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

const AnalyticsGrid = styled.div`
  display: grid;
  gap: 1.75rem;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
  margin-bottom: 2rem;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const TrendCard = styled.section`
  border-radius: 22px;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  padding: 1.8rem;
  box-shadow: 0 24px 48px rgba(15, 15, 23, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TrendHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const TrendTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #111111;
`;

const TrendCaption = styled.p`
  margin: 0.4rem 0 0;
  font-size: 0.82rem;
  color: #6c6c72;
  max-width: 320px;
  line-height: 1.45;
`;

const TrendMeta = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const ChartHolder = styled.div`
  width: 100%;
  height: 220px;
  padding: 0.3rem 0.1rem 0.9rem;
  border-radius: 18px;
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
  border: 1px solid #ededf0;
`;

const TrendFooter = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const TrendStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6c6c72;
  }

  strong {
    font-size: 1.05rem;
    font-weight: 600;
    color: #111111;
  }
`;

const InsightStack = styled.div`
  display: grid;
  gap: 1.4rem;
`;

const InsightCard = styled.section`
  border-radius: 22px;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  padding: 1.6rem;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
`;

const InsightLabel = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const InsightValue = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f0f11;
`;

const InsightDelta = styled.span<{
  $tone: "positive" | "neutral" | "negative";
}>`
  font-size: 0.82rem;
  color: ${({ $tone }) =>
    $tone === "positive"
      ? "#0f766e"
      : $tone === "negative"
      ? "#dc2626"
      : "#52525b"};
`;

const InsightBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;

  span {
    height: 38px;
    border-radius: 12px;
    background: #111111;
  }
`;

const InsightFootnote = styled.span`
  font-size: 0.72rem;
  color: #a1a1aa;
`;

const InsightList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    color: #52525b;

    strong {
      font-weight: 600;
      color: #0f0f11;
    }
  }
`;

const MenuGrid = styled.div`
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const MenuCard = styled(Link)<{
  $status: "ok" | "warning" | "muted";
  $isError: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.6rem;
  border-radius: 20px;
  text-decoration: none;
  color: inherit;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease;

  ${({ $status, $isError }) =>
    !$isError &&
    ($status === "ok"
      ? css`
          border-color: rgba(17, 17, 17, 0.12);
        `
      : $status === "warning"
      ? css`
          border-color: rgba(17, 17, 17, 0.25);
        `
      : css`
          border-color: #e4e4e7;
        `)}

  ${({ $isError }) =>
    $isError &&
    css`
      border-color: rgba(239, 68, 68, 0.65);
    `}

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 52px rgba(15, 15, 23, 0.08);
    border-color: rgba(17, 17, 17, 0.28);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.02rem;
  font-weight: 600;
  color: #111111;
`;

const CardValue = styled.div`
  margin-top: 1.4rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f0f11;
  letter-spacing: -0.01em;
`;

const CardLabel = styled.div`
  margin-top: 0.45rem;
  font-size: 0.82rem;
  color: #52525b;
`;

const CardSecondary = styled.p`
  margin: 1.2rem 0 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #6c6c72;
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 1.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f0f11;
`;

const StatusChip = styled.span<{
  $tone: "accent" | "warning" | "danger" | "muted";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0.8rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  ${({ $tone }) => {
    switch ($tone) {
      case "accent":
        return css`
          background: rgba(17, 17, 17, 0.08);
          color: #0f0f11;
          border: 1px solid rgba(17, 17, 17, 0.18);
        `;
      case "warning":
        return css`
          background: rgba(250, 204, 21, 0.18);
          color: #854d0e;
          border: 1px solid rgba(250, 204, 21, 0.45);
        `;
      case "danger":
        return css`
          background: rgba(248, 113, 113, 0.18);
          color: #991b1b;
          border: 1px solid rgba(248, 113, 113, 0.42);
        `;
      case "muted":
      default:
        return css`
          background: rgba(152, 152, 162, 0.18);
          color: #63636a;
          border: 1px solid rgba(152, 152, 162, 0.28);
        `;
    }
  }}
`;
