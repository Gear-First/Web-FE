import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCard,
  SectionHeader,
  SectionTitle,
  SectionCaption,
  FilterGroup,
  Select,
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
        warehouseCode: appliedPending.keyword,
        page: pagePending - 1,
        size: pageSizePending,
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
        warehouseCode: appliedDone.keyword,
        page: pageDone - 1,
        size: pageSizeDone,
      }),
    staleTime: 60 * 1000,
  });

  const doneRecords = doneData?.data ?? [];
  const doneMeta = doneData?.meta ?? { total: 0, totalPages: 1 };

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
            <Select
              value={pendingStatus}
              onChange={(e) =>
                setPendingStatus(e.target.value as typeof pendingStatus)
              }
            >
              <option value="ALL">전체</option>
              <option value="PENDING">대기</option>
              <option value="IN_PROGRESS">진행중</option>
            </Select>
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
              placeholder="창고코드 검색"
            />
          </FilterGroup>

          <OutboundTable rows={pendingRecords} />
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
            <Select
              value={doneStatus}
              onChange={(e) =>
                setDoneStatus(e.target.value as typeof doneStatus)
              }
            >
              <option value="ALL">전체</option>
              <option value="COMPLETED">완료</option>
              <option value="DELAYED">지연</option>
            </Select>
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
              placeholder="창고코드 검색"
            />
          </FilterGroup>

          <OutboundTable rows={doneRecords} />
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
