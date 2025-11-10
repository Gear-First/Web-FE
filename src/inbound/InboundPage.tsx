import { useState } from "react";
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
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    dateFrom: null,
    dateTo: null,
  });

  // 섹션별 페이지네이션
  const [pageNotDone, setPageNotDone] = useState(1);
  const [pageDone, setPageDone] = useState(1);
  const [pageSizeNotDone, setPageSizeNotDone] = useState(10);
  const [pageSizeDone, setPageSizeDone] = useState(10);

  const buildParams = (page: number, pageSize: number) => ({
    q: applied.keyword || undefined,
    dateFrom: applied.dateFrom || undefined,
    dateTo: applied.dateTo || undefined,
    page,
    pageSize,
  });

  // 입고 예정(Not Done)
  const paramsNotDone = buildParams(pageNotDone, pageSizeNotDone);
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
  const paramsDone = buildParams(pageDone, pageSizeDone);
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

  const onSearch = () => {
    setApplied({
      keyword: keyword.trim(),
      dateFrom: startDate || null,
      dateTo: endDate || null,
    });
    setPageNotDone(1);
    setPageDone(1);
  };

  const onReset = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setApplied({ keyword: "", dateFrom: null, dateTo: null });
    setPageNotDone(1);
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
            <Button variant="icon" onClick={onReset}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
            <DateRange
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              onReset={onReset}
              placeholder="입고번호 / 입고대상 / 공급업체 검색"
            />
          </FilterGroup>

          <InboundTable rows={recordsNotDone} variant="pending" />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {isFetchingNotDone && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

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
            <Button variant="icon" onClick={onReset}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
            <DateRange
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              onReset={onReset}
              placeholder="입고번호 / 입고대상 / 공급업체 검색"
            />
          </FilterGroup>

          <InboundTable rows={recordsDone} variant="done" />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {isFetchingDone && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

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
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
