import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { Payload as TooltipPayload } from "recharts/types/component/DefaultTooltipContent";
import type {
  PendingOrderItem,
  ProcessedOrderItem,
} from "../../../request/RequestTypes";
import type { OutboundRecord } from "../../../outbound/OutboundTypes";
import { formatNumber } from "../../utils/formatNumber";

const TrendCard = styled.section`
  width: 100%;
  box-sizing: border-box;
  border-radius: 20px;
  border: 1px solid rgba(228, 228, 231, 0.8);
  background: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%);
  padding: 1.7rem 1.8rem;
  box-shadow: 0 26px 44px rgba(15, 15, 23, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  height: 100%;
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
  max-width: 340px;
  line-height: 1.45;
`;

const TrendControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
`;

const TimeframeToggle = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.18rem;
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.9);
  gap: 0.25rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  border: 0;
  padding: 0.32rem 0.75rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  color: ${({ $active }) => ($active ? "#ffffff" : "#4b5563")};
  background: ${({ $active }) =>
    $active ? "#111827" : "rgba(148, 163, 184, 0.18)"};

  &:hover {
    background: ${({ $active }) =>
      $active ? "#0f172a" : "rgba(100, 116, 139, 0.22)"};
  }
`;

const TrendMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #6c6c72;

  strong {
    font-size: 0.85rem;
    font-weight: 600;
    color: #111111;
  }
`;

const EmptyState = styled.div`
  width: 100%;
  height: 220px;
  border-radius: 18px;
  border: 1px dashed rgba(228, 228, 231, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c6c72;
  font-size: 0.82rem;
  background: rgba(248, 250, 252, 0.6);
`;

const ChartHolder = styled.div`
  width: 100%;
  height: 240px;
  padding: 0.4rem 0.1rem 1rem;
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
  margin-top: auto;
`;

const SummaryCard = styled.div`
  padding: 0.75rem 0.9rem;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(240, 249, 255, 0.55);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SummaryLabel = styled.span`
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const SummaryValue = styled.span`
  font-size: 1.18rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.01em;
`;

const SummaryDelta = styled.span`
  font-size: 0.74rem;
  color: #475569;
`;

type TrendChartProps = {
  pendingSamples: PendingOrderItem[];
  processedSamples: ProcessedOrderItem[];
  outboundItems: OutboundRecord[];
  isPendingLoading: boolean;
  isProcessedLoading: boolean;
  isOutboundLoading: boolean;
};

type SeriesPoint = {
  label: string;
  pending: number;
  processed: number;
  outbound: number;
  start: Date;
  end: Date;
  tooltipLabel: string;
};

const buildLabel = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};
type Timeframe = "week" | "month" | "year";

const TIMEFRAME_OPTIONS: Array<{ key: Timeframe; label: string }> = [
  { key: "week", label: "주" },
  { key: "month", label: "월" },
  { key: "year", label: "년" },
];

const DAY_KOR = ["일", "월", "화", "수", "목", "금", "토"];

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfWeek = (date: Date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as start
  d.setDate(d.getDate() - diff);
  return d;
};

const startOfMonth = (date: Date) => {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
};

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return startOfMonth(d);
};

const formatDate = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;

const formatMonthShort = (date: Date) =>
  `${String(date.getFullYear()).slice(-2)}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

const formatMonthKorean = (date: Date) =>
  `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

const countEventsInRange = (dates: Date[], start: Date, end: Date) => {
  let count = 0;
  for (const d of dates) {
    if (d >= start && d < end) count++;
  }
  return count;
};

const toDateArray = (items: unknown[], extractor: (item: any) => string | null | undefined) =>
  items
    .map((item) => {
      const raw = extractor(item);
      if (!raw) return null;
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) return null;
      return startOfDay(parsed);
    })
    .filter((d): d is Date => Boolean(d));

type SeriesBuildResult = {
  series: SeriesPoint[];
  summary: { primaryLabel: string; rangeLabel: string } | null;
};

const buildTimeframeSeries = (
  timeframe: Timeframe,
  pendingDates: Date[],
  processedDates: Date[],
  outboundDates: Date[]
): SeriesBuildResult => {
  const today = startOfDay(new Date());

  if (timeframe === "week") {
    const points: SeriesPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = addDays(today, -i);
      const end = addDays(start, 1);
      const label = buildLabel(start);
      const tooltipLabel = `${formatDate(start)} (${DAY_KOR[start.getDay()]})`;

      points.push({
        label,
        pending: countEventsInRange(pendingDates, start, end),
        processed: countEventsInRange(processedDates, start, end),
        outbound: countEventsInRange(outboundDates, start, end),
        start,
        end,
        tooltipLabel,
      });
    }

    const rangeLabel = `${formatDate(points[0].start)} ~ ${formatDate(
      addDays(points[points.length - 1].end, -1)
    )}`;

    return {
      series: points,
      summary: {
        primaryLabel: "최근 7일",
        rangeLabel,
      },
    };
  }

  if (timeframe === "month") {
    const points: SeriesPoint[] = [];
    const weekCount = 6;
    const currentWeekStart = startOfWeek(today);

    for (let i = weekCount - 1; i >= 0; i--) {
      const start = addDays(currentWeekStart, -7 * i);
      const end = addDays(start, 7);
      const label = buildLabel(start);
      const tooltipLabel = `${formatDate(start)} ~ ${formatDate(addDays(end, -1))}`;

      points.push({
        label,
        pending: countEventsInRange(pendingDates, start, end),
        processed: countEventsInRange(processedDates, start, end),
        outbound: countEventsInRange(outboundDates, start, end),
        start,
        end,
        tooltipLabel,
      });
    }

    const rangeLabel = `${formatDate(points[0].start)} ~ ${formatDate(
      addDays(points[points.length - 1].end, -1)
    )}`;

    return {
      series: points,
      summary: {
        primaryLabel: "최근 6주",
        rangeLabel,
      },
    };
  }

  // year
  const points: SeriesPoint[] = [];
  const months = 12;
  const currentMonthStart = startOfMonth(today);

  for (let i = months - 1; i >= 0; i--) {
    const start = addMonths(currentMonthStart, -i);
    const end = addMonths(start, 1);
    const label = formatMonthShort(start);
    const tooltipLabel = formatMonthKorean(start);

    points.push({
      label,
      pending: countEventsInRange(pendingDates, start, end),
      processed: countEventsInRange(processedDates, start, end),
      outbound: countEventsInRange(outboundDates, start, end),
      start,
      end,
      tooltipLabel,
    });
  }

  const rangeLabel = `${formatMonthKorean(points[0].start)} ~ ${formatMonthKorean(
    points[points.length - 1].start
  )}`;

  return {
    series: points,
    summary: {
      primaryLabel: "최근 12개월",
      rangeLabel,
    },
  };
};

export default function TrendChart({
  pendingSamples,
  processedSamples,
  outboundItems,
  isPendingLoading,
  isProcessedLoading,
  isOutboundLoading,
}: TrendChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("week");

  const pendingDates = useMemo(
    () =>
      toDateArray(pendingSamples, (item) => item.requestDate),
    [pendingSamples]
  );
  const processedDates = useMemo(
    () =>
      toDateArray(
        processedSamples,
        (item) => item.processedDate ?? item.requestDate
      ),
    [processedSamples]
  );
  const outboundDates = useMemo(
    () =>
      toDateArray(
        outboundItems,
        (item) => item.expectedShipDate ?? item.completedAt ?? item.requestedAt
      ),
    [outboundItems]
  );

  const { series, summary } = useMemo(
    () =>
      buildTimeframeSeries(timeframe, pendingDates, processedDates, outboundDates),
    [timeframe, pendingDates, processedDates, outboundDates]
  );

  const captionText = useMemo(() => {
    switch (timeframe) {
      case "month":
        return "최근 6주 동안의 요청 생성, 승인 완료, 출고 예정 건수를 비교합니다.";
      case "year":
        return "최근 12개월 동안의 요청 생성, 승인 완료, 출고 예정 건수를 비교합니다.";
      case "week":
      default:
        return "최근 7일 동안의 요청 생성, 승인 완료, 출고 예정 건수를 비교합니다.";
    }
  }, [timeframe]);

  const summaryStats = useMemo(() => {
    if (!series.length) {
      return {
        totalPending: 0,
        totalProcessed: 0,
        totalOutbound: 0,
        completionRate: 0,
        outboundDelta: 0,
        outboundTrendLabel: "전일 대비",
      };
    }

    const totalPending = series.reduce((acc, point) => acc + point.pending, 0);
    const totalProcessed = series.reduce(
      (acc, point) => acc + point.processed,
      0
    );
    const totalOutbound = series.reduce(
      (acc, point) => acc + point.outbound,
      0
    );

    const completionRate =
      totalPending + totalProcessed > 0
        ? Math.round((totalProcessed / (totalPending + totalProcessed)) * 100)
        : 0;

    const outboundDelta =
      series.length >= 2
        ? series[series.length - 1].outbound - series[series.length - 2].outbound
        : 0;

    const outboundTrendLabel =
      timeframe === "year"
        ? "최근 월 대비"
        : timeframe === "month"
        ? "최근 주 대비"
        : "전일 대비";

    return {
      totalPending,
      totalProcessed,
      totalOutbound,
      completionRate,
      outboundDelta,
      outboundTrendLabel,
    };
  }, [series, timeframe]);

  const isLoading = isPendingLoading || isProcessedLoading || isOutboundLoading;
  const hasData = series.some(
    (point) => point.pending || point.processed || point.outbound
  );

  return (
    <TrendCard>
      <TrendHeader>
        <div>
          <TrendTitle>업무 흐름</TrendTitle>
          <TrendCaption>{captionText}</TrendCaption>
        </div>
        <TrendControls>
          <TimeframeToggle>
            {TIMEFRAME_OPTIONS.map((option) => (
              <ToggleButton
                key={option.key}
                type="button"
                onClick={() => setTimeframe(option.key)}
                $active={timeframe === option.key}
              >
                {option.label}
              </ToggleButton>
            ))}
          </TimeframeToggle>
          {summary && (
            <TrendMeta>
              <strong>{summary.primaryLabel}</strong>
              <span>{summary.rangeLabel}</span>
            </TrendMeta>
          )}
        </TrendControls>
      </TrendHeader>

      {isLoading ? (
        <EmptyState>지표를 불러오는 중입니다...</EmptyState>
      ) : hasData ? (
        <>
          <ChartHolder>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 14, right: 24, left: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pendingFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="processedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="outboundFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
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
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#6c6c72" }}
                width={32}
                allowDecimals={false}
              />
              <Tooltip<number, "pending" | "processed" | "outbound">
                cursor={{ stroke: "#111111", strokeWidth: 0.6, opacity: 0.3 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e4e4e7",
                  boxShadow: "0 12px 32px rgba(15,15,23,0.08)",
                  background: "#ffffff",
                  padding: "0.6rem 0.75rem",
                  fontSize: "0.78rem",
                }}
                labelStyle={{ color: "#6c6c72", marginBottom: 4 }}
                labelFormatter={(label, payload) => {
                  const first = payload?.[0] as
                    | TooltipPayload<number, "pending" | "processed" | "outbound">
                    | undefined;
                  const point = first?.payload as SeriesPoint | undefined;
                  return point?.tooltipLabel ?? label;
                }}
                formatter={(value: number, name) => [
                  `${formatNumber(value)}건`,
                  name === "pending"
                    ? "신규 요청"
                    : name === "processed"
                    ? "승인 완료"
                    : "출고 예정",
                ]}
              />
              <Legend
                verticalAlign="top"
                height={24}
                iconType="circle"
                formatter={(value) => {
                  const map: Record<string, string> = {
                    pending: "신규 요청",
                    processed: "승인 완료",
                    outbound: "출고 예정",
                  };
                  return <span style={{ color: "#52525b" }}>{map[value]}</span>;
                }}
              />
              <Area
                type="monotone"
                dataKey="pending"
                stroke="#6366f1"
                strokeWidth={1.6}
                fill="url(#pendingFill)"
                dot={{ r: 2.8 }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="processed"
                stroke="#10b981"
                strokeWidth={1.6}
                fill="url(#processedFill)"
                dot={{ r: 2.8 }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="outbound"
                stroke="#f59e0b"
                strokeWidth={1.6}
                fill="url(#outboundFill)"
                dot={{ r: 2.8 }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartHolder>
          <SummaryRow>
            <SummaryCard>
              <SummaryLabel>신규 요청</SummaryLabel>
              <SummaryValue>
                {formatNumber(summaryStats.totalPending)}
              </SummaryValue>
              <SummaryDelta>누적 합계</SummaryDelta>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>승인 완료율</SummaryLabel>
              <SummaryValue>{summaryStats.completionRate}%</SummaryValue>
              <SummaryDelta>처리 / 요청 기준</SummaryDelta>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>출고 예정</SummaryLabel>
              <SummaryValue>
                {formatNumber(summaryStats.totalOutbound)}
              </SummaryValue>
              <SummaryDelta>
                {`${summaryStats.outboundTrendLabel} ${formatNumber(
                  summaryStats.outboundDelta
                )}`}
              </SummaryDelta>
            </SummaryCard>
          </SummaryRow>
        </>
      ) : (
        <EmptyState>최근 7일 동안 추적할 이벤트가 없습니다</EmptyState>
      )}
    </TrendCard>
  );
}
