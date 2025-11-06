import styled from "styled-components";
import { formatNumber } from "../../utils/formatNumber";

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

type InsightCardsProps = {
  propertyAssetValue: number | undefined;
  propertyTotal: number | undefined;
  isPropertyLoading: boolean;
  companyRecords: number | undefined;
  humanRecords: number | undefined;
  itemPartRecords: number | undefined;
  propertyTotalQty?: number;
  propertyAvgUnitPrice?: number;
  propertyTop10Share?: number;
  propertyABC?: { a: number; b: number; c: number };
};

export default function InsightCards({
  propertyAssetValue,
  propertyTotal,
  isPropertyLoading,
  companyRecords,
  humanRecords,
  itemPartRecords,
  propertyTotalQty,
  propertyAvgUnitPrice,
  propertyTop10Share,
  propertyABC,
}: InsightCardsProps) {
  return (
    <InsightStack>
      <InsightCard>
        <InsightLabel>자산 포트폴리오</InsightLabel>
        <InsightValue>₩{formatNumber(propertyAssetValue ?? 0)}</InsightValue>
        <InsightDelta $tone="positive">
          {isPropertyLoading
            ? "데이터 로딩 중"
            : `자산 항목 ${formatNumber(propertyTotal ?? 0)}건`}
        </InsightDelta>

        {/* 개선된 핵심 지표 3줄 */}
        <InsightList>
          <li>
            <strong>총 수량</strong>
            <span>{formatNumber(propertyTotalQty)}</span>
          </li>
          <li>
            <strong>평균 단가</strong>
            <span>₩{formatNumber(propertyAvgUnitPrice)}</span>
          </li>
          <li>
            <strong>Top 10 집중도</strong>
            <span>{propertyTop10Share ?? 0}%</span>
          </li>
        </InsightList>

        {/* ABC 간단 막대표 */}
        {propertyABC && (
          <>
            <InsightBar>
              <span style={{ width: "60%" }} />
              <span style={{ width: "25%" }} />
              <span style={{ width: "15%" }} />
            </InsightBar>
            <InsightFootnote>
              ABC 분포: A {formatNumber(propertyABC.a)} · B{" "}
              {formatNumber(propertyABC.b)} · C {formatNumber(propertyABC.c)}
            </InsightFootnote>
          </>
        )}
      </InsightCard>

      <InsightCard>
        <InsightLabel>운영 네트워크</InsightLabel>
        <InsightValue>
          {formatNumber((companyRecords ?? 0) + (humanRecords ?? 0))}
        </InsightValue>
        <InsightDelta $tone="neutral">
          협력사 {formatNumber(companyRecords)}곳 · 인력{" "}
          {formatNumber(humanRecords)}명
        </InsightDelta>
        <InsightList>
          <li>
            <strong>구매</strong>
            <span>{formatNumber(companyRecords)} vendors</span>
          </li>
          <li>
            <strong>인력</strong>
            <span>{formatNumber(humanRecords)} staff</span>
          </li>
          <li>
            <strong>품목</strong>
            <span>{formatNumber(itemPartRecords)} items</span>
          </li>
        </InsightList>
      </InsightCard>
    </InsightStack>
  );
}
