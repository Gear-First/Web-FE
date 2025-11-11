import { useState } from "react";
import Page from "../components/common/Page";
import {
  SummaryGrid,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
  SummaryNote,
} from "../components/common/PageLayout";
import { useQuery } from "@tanstack/react-query";
import {
  fetchOutboundNotDoneRecords,
  fetchOutboundDoneRecords,
  outboundKeys,
} from "./OutboundApi";
import OutboundTable from "./components/OutboundTable";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Pagination from "../components/common/Pagination";
import PageSection from "../components/common/sections/PageSection";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import { usePagination } from "../hooks/usePagination";
import type { OutboundRecord } from "./OutboundTypes";

type AppliedFilters = {
  keyword: string;
  dateFrom: string | null;
  dateTo: string | null;
};

type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export default function OutboundPage() {
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

  // 페이지네이션
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

  // ✅ 출고 예정(Not Done)
  const paramsNotDone = buildParams(
    appliedNotDone,
    pendingPagination.page,
    pendingPagination.pageSize
  );

  const { data: dataNotDone, fetchStatus: fetchStatusNotDone } = useQuery<
    ListResponse<OutboundRecord[]>,
    Error
  >({
    queryKey: [...outboundKeys.notDoneRecords, paramsNotDone],
    queryFn: () => fetchOutboundNotDoneRecords(paramsNotDone),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ✅ 출고 완료(Done)
  const paramsDone = buildParams(
    appliedDone,
    donePagination.page,
    donePagination.pageSize
  );

  const { data: dataDone, fetchStatus: fetchStatusDone } = useQuery<
    ListResponse<OutboundRecord[]>,
    Error
  >({
    queryKey: [...outboundKeys.doneRecords, paramsDone],
    queryFn: () => fetchOutboundDoneRecords(paramsDone),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ✅ 상태
  const isFetchingNotDone = fetchStatusNotDone === "fetching";
  const isFetchingDone = fetchStatusDone === "fetching";

  // ✅ 데이터
  const recordsNotDone = dataNotDone?.data ?? [];
  const totalNotDone = dataNotDone?.meta?.total ?? 0;
  const totalPagesNotDone = dataNotDone?.meta?.totalPages ?? 1;

  const recordsDone = dataDone?.data ?? [];
  const totalDone = dataDone?.meta?.total ?? 0;
  const totalPagesDone = dataDone?.meta?.totalPages ?? 1;

  // ✅ 상태별 분류
  const completedRecords = recordsDone.filter((r) => r.status === "COMPLETED");
  const delayedRecords = recordsDone.filter((r) => r.status === "DELAYED");

  const completedCount = completedRecords.length;
  const delayedCount = delayedRecords.length;

  // ✅ 지표 계산
  const backlogQty = recordsNotDone.reduce(
    (sum, r) => sum + (r.totalQty ?? 0),
    0
  );
  const completionRate =
    totalDone + totalNotDone > 0
      ? Math.round((completedCount / (totalDone + totalNotDone)) * 100)
      : 0;

  // ✅ 검색 및 리셋
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

  // ✅ 렌더
  return (
    <Page>
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>출고 예정</SummaryLabel>
          <SummaryValue>{totalNotDone.toLocaleString()}건</SummaryValue>
          <SummaryNote>대기 수량 {backlogQty.toLocaleString()}ea</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>출고 완료</SummaryLabel>
          <SummaryValue>{completedCount.toLocaleString()}건</SummaryValue>
          <SummaryNote>완료율 {completionRate}%</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>지연 현황</SummaryLabel>
          <SummaryValue>{delayedCount.toLocaleString()}건</SummaryValue>
          <SummaryNote>지연된 출고 요청 수</SummaryNote>
        </SummaryCard>
      </SummaryGrid>

      <PageSection
        title="출고 예정"
        caption="대기 및 진행중 상태의 출고 요청을 조회합니다."
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
              placeholder="출고번호 / 대리점 / 창고 검색"
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
        <OutboundTable rows={recordsNotDone} variant="pending" />
      </PageSection>

      <PageSection
        title="출고 완료"
        caption="완료 및 지연 상태의 출고 요청을 조회합니다."
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
              placeholder="출고번호 / 대리점 / 창고 검색"
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
        <OutboundTable rows={recordsDone} variant="done" />
      </PageSection>
    </Page>
  );
}
