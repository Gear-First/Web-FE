import styled from "styled-components";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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

const Label = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const ChartHolder = styled.div`
  width: 100%;
  height: 300px;
  padding: 0.5rem 0;
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: #6c6c72;
  font-size: 0.82rem;
`;

type WarehouseSafetyData = {
  warehouseCode: string;
  critical: number;
  warning: number;
  normal: number;
  total: number;
};

type WarehouseSafetyStockChartProps = {
  data: WarehouseSafetyData[];
  isLoading: boolean;
};

export default function WarehouseSafetyStockChart({
  data,
  isLoading,
}: WarehouseSafetyStockChartProps) {
  if (isLoading) {
    return (
      <ChartCard>
        <Label>창고별 안전재고 현황</Label>
        <EmptyState>데이터 로딩 중...</EmptyState>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard>
        <Label>창고별 안전재고 현황</Label>
        <EmptyState>데이터가 없습니다</EmptyState>
      </ChartCard>
    );
  }

  const chartData = data.map((item) => ({
    warehouse: `창고 ${item.warehouseCode}`,
    위험: item.critical,
    주의: item.warning,
    정상: item.normal,
    전체: item.total,
  }));

  return (
    <ChartCard>
      <Label>창고별 안전재고 현황</Label>
      <ChartHolder>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 14, right: 24, left: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#e4e4e7" strokeDasharray="3 6" />
            <XAxis
              dataKey="warehouse"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6c6c72", fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6c6c72" }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e4e4e7",
                boxShadow: "0 12px 32px rgba(15,15,23,0.08)",
                background: "#ffffff",
                padding: "0.6rem 0.75rem",
                fontSize: "0.78rem",
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend
              wrapperStyle={{ paddingTop: "1rem" }}
              iconType="square"
              formatter={(value) => {
                const colors: Record<string, string> = {
                  위험: "#dc2626",
                  주의: "#f59e0b",
                  정상: "#10b981",
                };
                return <span style={{ color: colors[value] || "#6c6c72" }}>{value}</span>;
              }}
            />
            <Bar
              dataKey="위험"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
              name="위험"
            />
            <Bar
              dataKey="주의"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              name="주의"
            />
            <Bar
              dataKey="정상"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="정상"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartHolder>
    </ChartCard>
  );
}

