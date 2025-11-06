import styled from "styled-components";
import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionHeader,
  SectionTitle,
} from "../components/common/PageLayout";
import { useDashboardData } from "./hooks/useDashboardData";
import { useDashboardCalculations } from "./hooks/useDashboardCalculations";
import { useMenuSummaries } from "./hooks/useMenuSummaries";
import HeroSection from "./components/HeroSection/HeroSection";
import SafetyStockAlert from "./components/SafetyStockAlert/SafetyStockAlert";
import WarehouseSafetyStockChart from "./components/WarehouseSafetyStockChart/WarehouseSafetyStockChart";
import MenuGrid from "./components/MenuGrid/MenuGrid";
import OperationsSummaryCard from "./components/OperationsSummaryCard/OperationsSummaryCard";
import TrendChart from "./components/TrendChart/TrendChart";

const PrimaryAnalyticsArea = styled.section`
  margin-top: 2.2rem;
`;

const PrimaryAnalyticsGrid = styled.div`
  display: grid;
  gap: 1.6rem;
  align-items: start;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.5fr);

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  gap: 1.75rem;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const SectionBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  margin-top: 2.6rem;
`;

export default function DashboardPage() {
  const data = useDashboardData();
  const {
    openWorkload,
    processedRatio,
    approvalRate,
    pendingCount,
    inboundCount,
    outboundCount,
    processedCount,
  } = useDashboardCalculations(data);
  const menuSummaries = useMenuSummaries(data);

  return (
    <Layout>
      <PageContainer>
        <HeroSection
          openWorkload={openWorkload}
          processedRatio={processedRatio}
          inboundWaiting={data.inboundRecords.data ?? 0}
          outboundWaiting={data.outboundRecords.data?.total ?? 0}
          isInboundLoading={data.inboundRecords.isLoading}
          isOutboundLoading={data.outboundRecords.isLoading}
        />

        <PrimaryAnalyticsArea>
          <PrimaryAnalyticsGrid>
            <TrendChart
              pendingSamples={data.pendingOrders.data?.items ?? []}
              processedSamples={data.processedOrders.data?.items ?? []}
              outboundItems={data.outboundRecords.data?.items ?? []}
              isPendingLoading={data.pendingOrders.isLoading}
              isProcessedLoading={data.processedOrders.isLoading}
              isOutboundLoading={data.outboundRecords.isLoading}
            />
            <OperationsSummaryCard
              pendingQuery={data.pendingOrders}
              inboundQuery={data.inboundRecords}
              outboundQuery={data.outboundRecords}
              processedQuery={data.processedOrders}
              approvalRate={approvalRate}
              openWorkload={openWorkload}
              pendingCount={pendingCount}
              inboundCount={inboundCount}
              outboundCount={outboundCount}
              processedCount={processedCount}
            />
          </PrimaryAnalyticsGrid>
        </PrimaryAnalyticsArea>

        <SectionBlock>
          <SectionHeader>
            <div>
              <SectionTitle>안전재고 모니터링</SectionTitle>
              <SectionCaption>
                창고별 위험도를 한눈에 보고, 재고 부족이 우려되는 품목을
                집중적으로 관리하세요.
              </SectionCaption>
            </div>
          </SectionHeader>

          <TwoColumnGrid>
            <WarehouseSafetyStockChart
              data={
                data.allInventoryData.data?.safetyStock.warehouseSummary ?? []
              }
              isLoading={data.allInventoryData.isLoading}
            />
            <SafetyStockAlert
              summary={
                data.allInventoryData.data?.safetyStock.warehouseSummary ?? []
              }
              riskItems={
                data.allInventoryData.data?.safetyStock.riskItems ?? []
              }
              totalCritical={
                data.allInventoryData.data?.safetyStock.totalCritical ?? 0
              }
              totalWarning={
                data.allInventoryData.data?.safetyStock.totalWarning ?? 0
              }
              totalNormal={
                data.allInventoryData.data?.safetyStock.totalNormal ?? 0
              }
              isLoading={data.allInventoryData.isLoading}
            />
          </TwoColumnGrid>
        </SectionBlock>

        <SectionBlock>
          <SectionHeader>
            <div>
              <SectionTitle>업무 메뉴 바로가기</SectionTitle>
              <SectionCaption>
                필요한 기능을 빠르게 열람하고 상세 업무 페이지로 이동하세요.
              </SectionCaption>
            </div>
          </SectionHeader>

          <MenuGrid menuSummaries={menuSummaries} />
        </SectionBlock>
      </PageContainer>
    </Layout>
  );
}
