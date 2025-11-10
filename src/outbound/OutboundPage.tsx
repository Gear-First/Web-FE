import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCard,
  SectionHeader,
  SectionTitle,
  SectionCaption,
  FilterGroup,
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
import resetIcon from "../assets/reset.svg";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Button from "../components/common/Button";
import Pagination from "../components/common/Pagination";
import OutboundTable from "./components/OutboundTable";
import type { OutboundStatus } from "./OutboundTypes";

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
  const [pagePending, setPagePending] = useState(1);
  const [pageSizePending, setPageSizePending] = useState(10);

  const { data: notDoneData, isLoading: isPendingLoading } = useQuery({
    queryKey: [
      ...outboundKeys.notDoneRecords,
      { appliedPending, pagePending, pageSizePending },
    ],
    queryFn: () =>
      fetchOutboundNotDoneRecords({
        dateFrom: appliedPending.dateFrom,
        dateTo: appliedPending.dateTo,
        q: appliedPending.keyword || undefined,
        page: pagePending,
        pageSize: pageSizePending,
      }),
    staleTime: 60 * 1000,
  });

  const pendingRecords = notDoneData?.data ?? [];
  const pendingMeta = notDoneData?.meta ?? { total: 0, totalPages: 1 };

  const onSearchPending = () => {
    setAppliedPending({
      status: pendingStatus,
      keyword: pendingKeyword.trim(),
      dateFrom: pendingStartDate || null,
      dateTo: pendingEndDate || null,
    });
    setPagePending(1);
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
    setPagePending(1);
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
  const [pageDone, setPageDone] = useState(1);
  const [pageSizeDone, setPageSizeDone] = useState(10);

  const { data: doneData, isLoading: isDoneLoading } = useQuery({
    queryKey: [
      ...outboundKeys.doneRecords,
      { appliedDone, pageDone, pageSizeDone },
    ],
    queryFn: () =>
      fetchOutboundDoneRecords({
        dateFrom: appliedDone.dateFrom,
        dateTo: appliedDone.dateTo,
        q: appliedDone.keyword || undefined,
        page: pageDone,
        pageSize: pageSizeDone,
      }),
    staleTime: 60 * 1000,
  });

  const doneRecords = doneData?.data ?? [];
  const doneMeta = doneData?.meta ?? { total: 0, totalPages: 1 };

  const pendingTotal = pendingMeta.total ?? 0;
  const doneTotal = doneMeta.total ?? 0;
  const completionRate =
    pendingTotal + doneTotal > 0
      ? Math.round((doneTotal / (pendingTotal + doneTotal)) * 100)
      : 0;
  const backlogQty = pendingRecords.reduce(
    (sum, record) => sum + (record.totalQty ?? 0),
    0
  );
  const delayedCount = pendingRecords.filter(
    (record) => record.status === "DELAYED"
  ).length;
  const avgKindsDone = doneRecords.length
    ? Math.round(
        doneRecords.reduce((sum, r) => sum + (r.itemKindsNumber ?? 0), 0) /
          doneRecords.length
      )
    : 0;

  const onSearchDone = () => {
    setAppliedDone({
      status: doneStatus,
      keyword: doneKeyword.trim(),
      dateFrom: doneStartDate || null,
      dateTo: doneEndDate || null,
    });
    setPageDone(1);
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
    setPageDone(1);
  };

  return (
    <Layout>
      <PageContainer>
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>출고 대기</SummaryLabel>
            <SummaryValue>{pendingTotal.toLocaleString()}건</SummaryValue>
            <SummaryNote>대기 수량 {backlogQty.toLocaleString()}ea</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>출고 완료</SummaryLabel>
            <SummaryValue>{doneTotal.toLocaleString()}건</SummaryValue>
            <SummaryNote>완료율 {completionRate}%</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>지연 + 평균 품목</SummaryLabel>
            <SummaryValue>
              {delayedCount.toLocaleString()} / {avgKindsDone.toLocaleString()}
            </SummaryValue>
            <SummaryNote>지연 건수 / 평균 품목 종류</SummaryNote>
          </SummaryCard>
        </SummaryGrid>
        {/* 출고 예정 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>출고 예정</SectionTitle>
              <SectionCaption>
                대기 및 진행중 상태의 출고 요청을 조회합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <FilterGroup>
            <Button variant="icon" onClick={onResetPending}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
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
          </FilterGroup>

          <OutboundTable rows={pendingRecords} variant="pending" />
          <Pagination
            page={pagePending}
            totalPages={pendingMeta.totalPages}
            totalItems={pendingMeta.total}
            onChange={setPagePending}
            isBusy={isPendingLoading}
            pageSize={pageSizePending}
            onChangePageSize={(n) => {
              setPageSizePending(n);
              setPagePending(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>

        {/* 출고 완료 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>출고 완료</SectionTitle>
              <SectionCaption>
                완료 및 지연 상태의 출고 요청을 조회합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <FilterGroup>
            <Button variant="icon" onClick={onResetDone}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
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
          </FilterGroup>

          <OutboundTable rows={doneRecords} variant="done" />
          <Pagination
            page={pageDone}
            totalPages={doneMeta.totalPages}
            totalItems={doneMeta.total}
            onChange={setPageDone}
            isBusy={isDoneLoading}
            pageSize={pageSizeDone}
            onChangePageSize={(n) => {
              setPageSizeDone(n);
              setPageDone(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
