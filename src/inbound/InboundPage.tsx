import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Layout from "../components/common/Layout";
import {
  FilterGroup,
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  SummaryGrid,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
  SummaryNote,
} from "../components/common/PageLayout";
import type { InboundRecord } from "./InboundTypes";
import { useQuery } from "@tanstack/react-query";
import {
  fetchInboundNotDoneRecords,
  fetchInboundDoneRecords,
  inboundKeys,
} from "./InboundApi";
import InboundTable from "./components/InboundTable";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import Pagination from "../components/common/Pagination";

type AppliedFilters = {
  keyword: string;
  dateFrom: string | null;
  dateTo: string | null;
};

type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export default function InboundPage() {
  // 공통 필터
  const [keywordNotDone, setKeywordNotDone] = useState("");
  const [startNotDone, setStartNotDone] = useState("");
  const [endNotDone, setEndNotDone] = useState("");
  const [appliedNotDone, setAppliedNotDone] = useState<AppliedFilters>({
    keyword: "",
    dateFrom: null,
    dateTo: null,
  });

  const [keywordDone, setKeywordDone] = useState("");
  const [startDone, setStartDone] = useState("");
  const [endDone, setEndDone] = useState("");
  const [appliedDone, setAppliedDone] = useState<AppliedFilters>({
    keyword: "",
    dateFrom: null,
    dateTo: null,
  });

  // 섹션별 페이지네이션
  const [pageNotDone, setPageNotDone] = useState(1);
  const [pageDone, setPageDone] = useState(1);
  const [pageSizeNotDone, setPageSizeNotDone] = useState(10);
  const [pageSizeDone, setPageSizeDone] = useState(10);

  const buildParams = (
    appliedFilters: AppliedFilters,
    page: number,
    pageSize: number
  ) => ({
    q: appliedFilters.keyword || undefined,
    dateFrom: appliedFilters.dateFrom || undefined,
    dateTo: appliedFilters.dateTo || undefined,
    page,
    pageSize,
  });

  // 입고 예정(Not Done)
  const paramsNotDone = buildParams(
    appliedNotDone,
    pageNotDone,
    pageSizeNotDone
  );
  const { data: dataNotDone, fetchStatus: fetchStatusNotDone } = useQuery<
    ListResponse<InboundRecord[]>,
    Error
  >({
    queryKey: [...inboundKeys.records, "not-done", paramsNotDone],
    queryFn: () => fetchInboundNotDoneRecords(paramsNotDone),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // 입고 완료(Done)
  const paramsDone = buildParams(appliedDone, pageDone, pageSizeDone);
  const { data: dataDone, fetchStatus: fetchStatusDone } = useQuery<
    ListResponse<InboundRecord[]>,
    Error
  >({
    queryKey: [...inboundKeys.records, "done", paramsDone],
    queryFn: () => fetchInboundDoneRecords(paramsDone),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const isFetchingNotDone = fetchStatusNotDone === "fetching";
  const isFetchingDone = fetchStatusDone === "fetching";

  const recordsNotDone = dataNotDone?.data ?? [];
  const totalNotDone = dataNotDone?.meta?.total ?? 0;
  const totalPagesNotDone = dataNotDone?.meta?.totalPages ?? 1;

  const recordsDone = dataDone?.data ?? [];
  const totalDone = dataDone?.meta?.total ?? 0;
  const totalPagesDone = dataDone?.meta?.totalPages ?? 1;

  const completionRate =
    totalDone + totalNotDone > 0
      ? Math.round((totalDone / (totalDone + totalNotDone)) * 100)
      : 0;
  const backlogQty = recordsNotDone.reduce(
    (sum, record) => sum + (record.totalQty ?? 0),
    0
  );
  const avgKindsDone = recordsDone.length
    ? Math.round(
        recordsDone.reduce((sum, r) => sum + (r.itemKindsNumber ?? 0), 0) /
          recordsDone.length
      )
    : 0;

  const onSearchNotDone = () => {
    setAppliedNotDone({
      keyword: keywordNotDone.trim(),
      dateFrom: startNotDone || null,
      dateTo: endNotDone || null,
    });
    setPageNotDone(1);
  };

  const onResetNotDone = () => {
    setKeywordNotDone("");
    setStartNotDone("");
    setEndNotDone("");
    setAppliedNotDone({ keyword: "", dateFrom: null, dateTo: null });
    setPageNotDone(1);
  };

  const onSearchDone = () => {
    setAppliedDone({
      keyword: keywordDone.trim(),
      dateFrom: startDone || null,
      dateTo: endDone || null,
    });
    setPageDone(1);
  };

  const onResetDone = () => {
    setKeywordDone("");
    setStartDone("");
    setEndDone("");
    setAppliedDone({ keyword: "", dateFrom: null, dateTo: null });
    setPageDone(1);
  };

  return (
    <Layout>
      <PageContainer>
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>입고 예정</SummaryLabel>
            <SummaryValue>{totalNotDone.toLocaleString()}건</SummaryValue>
            <SummaryNote>
              대기 중 수량 {backlogQty.toLocaleString()}ea
            </SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>입고 완료</SummaryLabel>
            <SummaryValue>{totalDone.toLocaleString()}건</SummaryValue>
            <SummaryNote>처리율 {completionRate}%</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>평균 품목 종류</SummaryLabel>
            <SummaryValue>{avgKindsDone.toLocaleString()}개</SummaryValue>
            <SummaryNote>완료 건 기준</SummaryNote>
          </SummaryCard>
        </SummaryGrid>
        {/* 입고 예정 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>입고 예정</SectionTitle>
              <SectionCaption>
                입고예정 자재의 검수 상태와 보관 위치를 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <FilterGroup>
            <Button variant="icon" onClick={onResetNotDone}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
            <DateRange
              startDate={startNotDone}
              endDate={endNotDone}
              onStartDateChange={setStartNotDone}
              onEndDateChange={setEndNotDone}
            />
            <SearchBox
              keyword={keywordNotDone}
              onKeywordChange={setKeywordNotDone}
              onSearch={onSearchNotDone}
              onReset={onResetNotDone}
              placeholder="입고번호 / 입고대상 / 공급업체 검색"
            />
          </FilterGroup>

          <SectionContent>
            <InboundTable rows={recordsNotDone} variant="pending" />

            <Pagination
              page={pageNotDone}
              totalPages={Math.max(1, totalPagesNotDone)}
              onChange={(next) => setPageNotDone(next)}
              isBusy={isFetchingNotDone}
              maxButtons={5}
              totalItems={totalNotDone}
              pageSize={pageSizeNotDone}
              pageSizeOptions={[10, 20, 50, 100]}
              onChangePageSize={(n) => {
                setPageSizeNotDone(n);
                setPageNotDone(1);
              }}
              showSummary
              showPageSize
              align="center"
              dense={false}
              sticky={false}
            />

            {isFetchingNotDone ? (
              <LoadingOverlay label="데이터를 불러오는 중입니다..." />
            ) : null}
          </SectionContent>
        </SectionCard>

        {/* 입고 완료 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>입고 완료</SectionTitle>
              <SectionCaption>
                입고된 자재의 검수 상태와 보관 위치를 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <FilterGroup>
            <Button variant="icon" onClick={onResetDone}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
            <DateRange
              startDate={startDone}
              endDate={endDone}
              onStartDateChange={setStartDone}
              onEndDateChange={setEndDone}
            />
            <SearchBox
              keyword={keywordDone}
              onKeywordChange={setKeywordDone}
              onSearch={onSearchDone}
              onReset={onResetDone}
              placeholder="입고번호 / 입고대상 / 공급업체 검색"
            />
          </FilterGroup>

          <SectionContent>
            <InboundTable rows={recordsDone} variant="done" />

            <Pagination
              page={pageDone}
              totalPages={Math.max(1, totalPagesDone)}
              onChange={(next) => setPageDone(next)}
              isBusy={isFetchingDone}
              maxButtons={5}
              totalItems={totalDone}
              pageSize={pageSizeDone}
              pageSizeOptions={[10, 20, 50, 100]}
              onChangePageSize={(n) => {
                setPageSizeDone(n);
                setPageDone(1);
              }}
              showSummary
              showPageSize
              align="center"
              dense={false}
              sticky={false}
            />

            {isFetchingDone ? (
              <LoadingOverlay label="데이터를 불러오는 중입니다..." />
            ) : null}
          </SectionContent>
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}

const SectionContent = styled.div`
  position: relative;
  min-height: 240px;
  padding-bottom: 12px;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 18px;
  z-index: 10;
  text-align: center;
  padding: 24px;
`;

const Spinner = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid rgba(37, 99, 235, 0.2);
  border-top-color: #2563eb;
  animation: ${spin} 0.85s linear infinite;
`;

const OverlayText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #4b5563;
`;

function LoadingOverlay({ label }: { label: string }) {
  return (
    <Overlay role="status" aria-live="polite">
      <Spinner />
      <OverlayText>{label}</OverlayText>
    </Overlay>
  );
}
