import { useState } from "react";
import Page from "../components/common/Page";
import {
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
import Pagination from "../components/common/Pagination";
import PageSection from "../components/common/sections/PageSection";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import { usePagination } from "../hooks/usePagination";

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
  const pendingPagination = usePagination(1, 10);
  const donePagination = usePagination(1, 10);

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
    pendingPagination.page,
    pendingPagination.pageSize
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
  const paramsDone = buildParams(
    appliedDone,
    donePagination.page,
    donePagination.pageSize
  );
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
    pendingPagination.resetPage();
  };

  const onResetNotDone = () => {
    setKeywordNotDone("");
    setStartNotDone("");
    setEndNotDone("");
    setAppliedNotDone({ keyword: "", dateFrom: null, dateTo: null });
    pendingPagination.resetPage();
  };

  const onSearchDone = () => {
    setAppliedDone({
      keyword: keywordDone.trim(),
      dateFrom: startDone || null,
      dateTo: endDone || null,
    });
    donePagination.resetPage();
  };

  const onResetDone = () => {
    setKeywordDone("");
    setStartDone("");
    setEndDone("");
    setAppliedDone({ keyword: "", dateFrom: null, dateTo: null });
    donePagination.resetPage();
  };

  return (
    <Page>
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

      <PageSection
        title="입고 예정"
        caption="입고예정 자재의 검수 상태와 보관 위치를 확인합니다."
        filters={
          <>
            <FilterResetButton onClick={onResetNotDone} />
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
          </>
        }
        isBusy={isFetchingNotDone}
        minHeight={260}
        footer={
          <Pagination
            page={pendingPagination.page}
            totalPages={Math.max(1, totalPagesNotDone)}
            onChange={pendingPagination.onChangePage}
            isBusy={isFetchingNotDone}
            maxButtons={5}
            totalItems={totalNotDone}
            pageSize={pendingPagination.pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={pendingPagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <InboundTable rows={recordsNotDone} variant="pending" />
      </PageSection>

      <PageSection
        title="입고 완료"
        caption="입고된 자재의 검수 상태와 보관 위치를 확인합니다."
        filters={
          <>
            <FilterResetButton onClick={onResetDone} />
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
          </>
        }
        isBusy={isFetchingDone}
        minHeight={260}
        footer={
          <Pagination
            page={donePagination.page}
            totalPages={Math.max(1, totalPagesDone)}
            onChange={donePagination.onChangePage}
            isBusy={isFetchingDone}
            maxButtons={5}
            totalItems={totalDone}
            pageSize={donePagination.pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={donePagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <InboundTable rows={recordsDone} variant="done" />
      </PageSection>
    </Page>
  );
}
