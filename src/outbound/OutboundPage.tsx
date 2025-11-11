import Page from "../components/common/Page";
import {
  SummaryGrid,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
  SummaryNote,
} from "../components/common/PageLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  outboundKeys,
  fetchOutboundNotDoneRecords,
  fetchOutboundDoneRecords,
} from "./OutboundApi";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Pagination from "../components/common/Pagination";
import OutboundTable from "./components/OutboundTable";
import type { OutboundStatus } from "./OutboundTypes";
import PageSection from "../components/common/sections/PageSection";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import { usePagination } from "../hooks/usePagination";

export default function OutboundPage() {
  // 출고 예정 (미완료) 상태
  const [pendingStatus, setPendingStatus] = useState<
    Extract<OutboundStatus, "PENDING" | "IN_PROGRESS"> | "ALL"
  >("ALL");
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [pendingStartDate, setPendingStartDate] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const [appliedPending, setAppliedPending] = useState({
    status: "ALL" as typeof pendingStatus,
    keyword: "",
    dateFrom: null as string | null,
    dateTo: null as string | null,
  });
  const pendingPagination = usePagination(1, 10);

  const {
    data: notDoneData,
    isPending: isPendingNotDone,
    isFetching: isFetchingNotDone,
  } = useQuery({
    queryKey: [
      ...outboundKeys.notDoneRecords,
      {
        appliedPending,
        page: pendingPagination.page,
        pageSize: pendingPagination.pageSize,
      },
    ],
    queryFn: () =>
      fetchOutboundNotDoneRecords({
        dateFrom: appliedPending.dateFrom,
        dateTo: appliedPending.dateTo,
        q: appliedPending.keyword || undefined,
        page: pendingPagination.page,
        pageSize: pendingPagination.pageSize,
      }),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const hasPendingData = typeof notDoneData !== "undefined";
  const pendingRecords = notDoneData?.data ?? [];
  const pendingMeta = notDoneData?.meta ?? { total: 0, totalPages: 1 };
  const isPendingLoading = isPendingNotDone && !hasPendingData;
  const isPendingRefreshing = isFetchingNotDone && !isPendingNotDone;

  const onSearchPending = () => {
    setAppliedPending({
      status: pendingStatus,
      keyword: pendingKeyword.trim(),
      dateFrom: pendingStartDate || null,
      dateTo: pendingEndDate || null,
    });
    pendingPagination.resetPage();
  };

  const onResetPending = () => {
    setPendingStatus("ALL");
    setPendingKeyword("");
    setPendingStartDate("");
    setPendingEndDate("");
    setAppliedPending({
      status: "ALL",
      keyword: "",
      dateFrom: null,
      dateTo: null,
    });
    pendingPagination.resetPage();
  };

  // 출고 완료 상태
  const [doneStatus, setDoneStatus] = useState<
    Extract<OutboundStatus, "COMPLETED" | "DELAYED"> | "ALL"
  >("ALL");
  const [doneKeyword, setDoneKeyword] = useState("");
  const [doneStartDate, setDoneStartDate] = useState("");
  const [doneEndDate, setDoneEndDate] = useState("");
  const [appliedDone, setAppliedDone] = useState({
    status: "ALL" as typeof doneStatus,
    keyword: "",
    dateFrom: null as string | null,
    dateTo: null as string | null,
  });
  const donePagination = usePagination(1, 10);

  const {
    data: doneData,
    isPending: isPendingDone,
    isFetching: isFetchingDone,
  } = useQuery({
    queryKey: [
      ...outboundKeys.doneRecords,
      {
        appliedDone,
        page: donePagination.page,
        pageSize: donePagination.pageSize,
      },
    ],
    queryFn: () =>
      fetchOutboundDoneRecords({
        dateFrom: appliedDone.dateFrom,
        dateTo: appliedDone.dateTo,
        q: appliedDone.keyword || undefined,
        page: donePagination.page,
        pageSize: donePagination.pageSize,
      }),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const hasDoneData = typeof doneData !== "undefined";
  const doneRecords = doneData?.data ?? [];
  const doneMeta = doneData?.meta ?? { total: 0, totalPages: 1 };
  const doneTotal = doneMeta.total ?? 0;

  const pendingTotal = pendingMeta.total ?? 0;

  const completedRecords = doneRecords.filter((r) => r.status === "COMPLETED");
  const delayedRecords = doneRecords.filter((r) => r.status === "DELAYED");

  const completedCount = completedRecords.length;
  const delayedCount = delayedRecords.length;

  const completionRate =
    pendingTotal + doneTotal > 0
      ? Math.round((completedCount / (pendingTotal + doneTotal)) * 100)
      : 0;
  const backlogQty = pendingRecords.reduce(
    (sum, record) => sum + (record.totalQty ?? 0),
    0
  );

  const onSearchDone = () => {
    setAppliedDone({
      status: doneStatus,
      keyword: doneKeyword.trim(),
      dateFrom: doneStartDate || null,
      dateTo: doneEndDate || null,
    });
    donePagination.resetPage();
  };

  const onResetDone = () => {
    setDoneStatus("ALL");
    setDoneKeyword("");
    setDoneStartDate("");
    setDoneEndDate("");
    setAppliedDone({
      status: "ALL",
      keyword: "",
      dateFrom: null,
      dateTo: null,
    });
    donePagination.resetPage();
  };

  return (
    <Page>
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>출고 예정</SummaryLabel>
          <SummaryValue>{pendingTotal.toLocaleString()}건</SummaryValue>
          <SummaryNote>예정 수량 {backlogQty.toLocaleString()}ea</SummaryNote>
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
        caption={pendingCaption}
        filters={
          <>
            <FilterResetButton onClick={onResetPending} />
            <DateRange
              startDate={pendingStartDate}
              endDate={pendingEndDate}
              onStartDateChange={setPendingStartDate}
              onEndDateChange={setPendingEndDate}
            />
            <SearchBox
              keyword={pendingKeyword}
              onKeywordChange={setPendingKeyword}
              onSearch={onSearchPending}
              onReset={onResetPending}
              placeholder="출고번호 / 대리점 / 창고 검색"
            />
          </>
        }
        isBusy={isPendingLoading}
        minHeight={260}
        footer={
          <Pagination
            page={pendingPagination.page}
            totalPages={pendingMeta.totalPages}
            totalItems={pendingMeta.total}
            onChange={pendingPagination.onChangePage}
            isBusy={isPendingLoading}
            pageSize={pendingPagination.pageSize}
            onChangePageSize={pendingPagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <OutboundTable rows={pendingRecords} variant="pending" />
      </PageSection>

      <PageSection
        title="출고 완료"
        caption={doneCaption}
        filters={
          <>
            <FilterResetButton onClick={onResetDone} />
            <DateRange
              startDate={doneStartDate}
              endDate={doneEndDate}
              onStartDateChange={setDoneStartDate}
              onEndDateChange={setDoneEndDate}
            />
            <SearchBox
              keyword={doneKeyword}
              onKeywordChange={setDoneKeyword}
              onSearch={onSearchDone}
              onReset={onResetDone}
              placeholder="출고번호 / 대리점 / 창고 검색"
            />
          </>
        }
        isBusy={isDoneLoading}
        minHeight={260}
        footer={
          <Pagination
            page={donePagination.page}
            totalPages={doneMeta.totalPages}
            totalItems={doneMeta.total}
            onChange={donePagination.onChangePage}
            isBusy={isDoneLoading}
            pageSize={donePagination.pageSize}
            onChangePageSize={donePagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <OutboundTable rows={doneRecords} variant="done" />
      </PageSection>
    </Page>
  );
}
