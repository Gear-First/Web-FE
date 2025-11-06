import styled from "styled-components";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatNumber } from "../../utils/formatNumber";

const ChartCard = styled.section`
  border-radius: 22px;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  padding: 1.6rem;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
`;

const ChartLabel = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const ChartHolder = styled.div`
  width: 100%;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #52525b;
`;

const LegendColor = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`;

const ChartValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f0f11;
  text-align: center;
  margin-top: 0.5rem;
`;

type WarehouseDistribution = {
  warehouseId: string;
  value: number;
  assetValue: number;
};

const COLORS = [
  "#111111",
  "#52525b",
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
  "#e4e4e7",
];

type WarehouseDistributionChartProps = {
  data: WarehouseDistribution[];
  isLoading: boolean;
};

export default function WarehouseDistributionChart({
  data,
  isLoading,
}: WarehouseDistributionChartProps) {
  if (isLoading) {
    return (
      <ChartCard>
        <ChartLabel>창고별 자산 분포</ChartLabel>
        <ChartHolder>
          <div style={{ color: "#6c6c72", fontSize: "0.82rem" }}>데이터 로딩 중...</div>
        </ChartHolder>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard>
        <ChartLabel>창고별 자산 분포</ChartLabel>
        <ChartHolder>
          <div style={{ color: "#6c6c72", fontSize: "0.82rem" }}>데이터가 없습니다</div>
        </ChartHolder>
      </ChartCard>
    );
  }

  const totalAssetValue = data.reduce((sum, item) => sum + item.assetValue, 0);
  const chartData = data.map((item) => ({
    name: `창고 ${item.warehouseId}`,
    value: item.value,
    assetValue: item.assetValue,
    percentage: totalAssetValue > 0 
      ? Math.round((item.assetValue / totalAssetValue) * 100) 
      : 0,
  }));

  return (
    <ChartCard>
      <ChartLabel>창고별 자산 분포</ChartLabel>
      <ChartHolder>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `₩${formatNumber(props.payload.assetValue)}`,
                `수량: ${formatNumber(value)}`,
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e4e4e7",
                boxShadow: "0 12px 32px rgba(15,15,23,0.08)",
                background: "#ffffff",
                padding: "0.6rem 0.75rem",
                fontSize: "0.78rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartHolder>
      <ChartLegend>
        {chartData.map((item, index) => (
          <LegendItem key={item.name}>
            <LegendColor $color={COLORS[index % COLORS.length]} />
            <span>{item.name}</span>
            <span style={{ marginLeft: "0.5rem", fontWeight: 600 }}>
              {item.percentage}%
            </span>
          </LegendItem>
        ))}
      </ChartLegend>
      <ChartValue>
        총 {formatNumber(data.length)}개 창고 · ₩{formatNumber(totalAssetValue)}
      </ChartValue>
    </ChartCard>
  );
}

