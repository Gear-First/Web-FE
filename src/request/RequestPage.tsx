import Page from "../components/common/Page";
import {
  Select,
  SummaryGrid,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
  SummaryNote,
} from "../components/common/PageLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OrderTable from "./components/OrderTable";
import RequestTable from "./components/RequestTable";
import DetailModal from "./components/RequestDetailModal";
import Pagination from "../components/common/Pagination";
import DateRange from "../components/common/DateRange";
import SearchBox from "../components/common/SearchBox";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import PageSection from "../components/common/sections/PageSection";
import { usePagination } from "../hooks/usePagination";
import {
  fetchPendingOrders,
  fetchProcessedOrders,
  fetchCancelOrders,
  approveOrder,
  rejectOrder,
} from "./RequestApi";
import type {
  PendingOrderItem,
  ProcessedOrderItem,
  OrderStatus,
  PendingOrderResponse,
  ProcessedOrderResponse,
  CancelOrderResponse,
} from "./RequestTypes";
import { useQueryClient } from "@tanstack/react-query";

export default function RequestPage() {
  // 선택된 레코드 & 모달
  const [selectedRecord, setSelectedRecord] = useState<
    PendingOrderItem | ProcessedOrderItem | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 모달 모드: order(승인 가능) | request(읽기 전용)
  const [modalVariant, setModalVariant] = useState<"order" | "request">(
    "order"
  );

  const queryClient = useQueryClient();

  //승인 기능 (React Query invalidate 포함)
  const handleApprove = async (orderId: number, remark?: string) => {
    const note = remark?.trim() ?? "";

    try {
      const res = await approveOrder(orderId, note);
      alert(res.message || "승인되었습니다.");

      setIsModalOpen(false);

      // 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      queryClient.invalidateQueries({ queryKey: ["processed-orders"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "승인 요청 실패");
    }
  };

  // 반려 기능 (React Query invalidate 포함)
  const handleReject = async (orderId: number, remark?: string) => {
    const note = remark?.trim() ?? "";

    try {
      const res = await rejectOrder(orderId, note);
      alert(res.message || "반려되었습니다.");

      setIsModalOpen(false);

      // 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      queryClient.invalidateQueries({ queryKey: ["cancel-orders"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "반려 요청 실패");
    }
  };
  // 미승인 필터
  const [keywordPending, setKeywordPending] = useState("");
  const [appliedPendingKeyword, setAppliedPendingKeyword] = useState("");
  const [startDatePending, setStartDatePending] = useState("");
  const [endDatePending, setEndDatePending] = useState("");
  const [appliedStartDatePending, setAppliedStartDatePending] = useState("");
  const [appliedEndDatePending, setAppliedEndDatePending] = useState("");
  const pendingPagination = usePagination(1, 10);

  // 미승인 목록 조회
  const { data: pendingData, fetchStatus: pendingFetchStatus } =
    useQuery<PendingOrderResponse>({
      queryKey: [
        "pending-orders",
        pendingPagination.page,
        pendingPagination.pageSize,
        appliedPendingKeyword,
        appliedStartDatePending,
        appliedEndDatePending,
      ],
      queryFn: () =>
        fetchPendingOrders({
          page: pendingPagination.page - 1,
          size: pendingPagination.pageSize,
          sort: "",
          search: appliedPendingKeyword || undefined,
          startDate: appliedStartDatePending || undefined,
          endDate: appliedEndDatePending || undefined,
        }),
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev,
    });

  // 미승인 검색/초기화 핸들러
  const onSearchPending = () => {
    setAppliedPendingKeyword(keywordPending.trim());
    setAppliedStartDatePending(startDatePending);
    setAppliedEndDatePending(endDatePending);
    pendingPagination.resetPage();
  };

  const onResetPending = () => {
    setKeywordPending("");
    setAppliedPendingKeyword("");
    setStartDatePending("");
    setEndDatePending("");
    setAppliedStartDatePending("");
    setAppliedEndDatePending("");
    pendingPagination.resetPage();
  };

  // 승인/진행중/완료 (APPROVED, SHIPPED, COMPLETED)
  const [keywordProcessed, setKeywordProcessed] = useState("");
  const [appliedProcessedKeyword, setAppliedProcessedKeyword] = useState("");
  const [startDateProcessed, setStartDateProcessed] = useState("");
  const [endDateProcessed, setEndDateProcessed] = useState("");
  const [appliedStartDateProcessed, setAppliedStartDateProcessed] =
    useState("");
  const [appliedEndDateProcessed, setAppliedEndDateProcessed] = useState("");
  const processedPagination = usePagination(1, 10);

  const { data: processedData, fetchStatus: processedFetchStatus } =
    useQuery<ProcessedOrderResponse>({
      queryKey: [
        "processed-orders",
        processedPagination.page,
        processedPagination.pageSize,
        appliedProcessedKeyword,
        appliedStartDateProcessed,
        appliedEndDateProcessed,
      ],
      queryFn: () =>
        fetchProcessedOrders({
          page: processedPagination.page - 1,
          size: processedPagination.pageSize,
          sort: "",
          search: appliedProcessedKeyword || undefined,
          startDate: appliedStartDateProcessed || undefined,
          endDate: appliedEndDateProcessed || undefined,
        }),
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev,
    });

  const onSearchProcessed = () => {
    setAppliedProcessedKeyword(keywordProcessed.trim());
    setAppliedStartDateProcessed(startDateProcessed);
    setAppliedEndDateProcessed(endDateProcessed);
    processedPagination.resetPage();
  };

  const onResetProcessed = () => {
    setKeywordProcessed("");
    setAppliedProcessedKeyword("");
    setStartDateProcessed("");
    setEndDateProcessed("");
    setAppliedStartDateProcessed("");
    setAppliedEndDateProcessed("");
    processedPagination.resetPage();
  };

  // 반려/취소 (REJECTED, CANCELLED)
  const [keywordCancel, setKeywordCancel] = useState("");
  const [appliedCancelKeyword, setAppliedCancelKeyword] = useState("");
  const [startDateCancel, setStartDateCancel] = useState("");
  const [endDateCancel, setEndDateCancel] = useState("");
  const [appliedStartDateCancel, setAppliedStartDateCancel] = useState("");
  const [appliedEndDateCancel, setAppliedEndDateCancel] = useState("");
  const cancelPagination = usePagination(1, 10);

  const [status, setStatus] = useState("");

  const { data: cancelData, fetchStatus: cancelFetchStatus } =
    useQuery<CancelOrderResponse>({
      queryKey: [
        "cancel-orders",
        cancelPagination.page,
        cancelPagination.pageSize,
        appliedCancelKeyword,
        appliedStartDateCancel,
        appliedEndDateCancel,
      ],
      queryFn: () =>
        fetchCancelOrders({
          page: cancelPagination.page - 1,
          size: cancelPagination.pageSize,
          sort: "",
          search: appliedCancelKeyword || undefined,
          startDate: appliedStartDateCancel || undefined,
          endDate: appliedEndDateCancel || undefined,
        }),
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev,
    });

  const onSearchCancel = () => {
    setAppliedCancelKeyword(keywordCancel.trim());
    setAppliedStartDateCancel(startDateCancel);
    setAppliedEndDateCancel(endDateCancel);
    cancelPagination.resetPage();
  };

  const onResetCancel = () => {
    setKeywordCancel("");
    setAppliedCancelKeyword("");
    setStartDateCancel("");
    setEndDateCancel("");
    setAppliedStartDateCancel("");
    setAppliedEndDateCancel("");
    cancelPagination.resetPage();
  };

  const pendingTotal = pendingData?.data?.totalElements ?? 0;
  const processedTotal = processedData?.data?.totalElements ?? 0;
  const cancelTotal = cancelData?.data?.totalElements ?? 0;
  const openTotal = pendingTotal + cancelTotal;
  const approvalRate =
    processedTotal + pendingTotal > 0
      ? Math.round((processedTotal / (processedTotal + pendingTotal)) * 100)
      : 0;

  // 모달 열기
  const handleOpen = (
    rec: PendingOrderItem | ProcessedOrderItem,
    variant: "order" | "request"
  ) => {
    setSelectedRecord(rec);
    setModalVariant(variant);
    setIsModalOpen(true);
  };

  return (
    <Page>
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>승인 대기</SummaryLabel>
          <SummaryValue>
            {pendingFetchStatus === "fetching"
              ? "0"
              : pendingTotal.toLocaleString()}
          </SummaryValue>
          <SummaryNote>검토 필요 요청 수</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>승인 완료</SummaryLabel>
          <SummaryValue>
            {processedFetchStatus === "fetching"
              ? "0"
              : processedTotal.toLocaleString()}
          </SummaryValue>
          <SummaryNote>승인 진행률 {approvalRate}%</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>취소 · 반려</SummaryLabel>
          <SummaryValue>
            {cancelFetchStatus === "fetching"
              ? "0"
              : cancelTotal.toLocaleString()}
          </SummaryValue>
          <SummaryNote>재확인 필요 {openTotal.toLocaleString()}건</SummaryNote>
        </SummaryCard>
      </SummaryGrid>
      <PageSection
        title="발주 요청 목록"
        caption="아직 승인되지 않은 발주 요청들을 확인합니다."
        filters={
          <>
            <FilterResetButton onClick={onResetPending} />
            <DateRange
              startDate={startDatePending}
              endDate={endDatePending}
              onStartDateChange={setStartDatePending}
              onEndDateChange={setEndDatePending}
            />
            <SearchBox
              keyword={keywordPending}
              onKeywordChange={setKeywordPending}
              onSearch={onSearchPending}
              onReset={onResetPending}
              placeholder="발주번호 / 대리점 검색"
            />
          </>
        }
        isBusy={pendingFetchStatus === "fetching"}
        minHeight={280}
        footer={
          <Pagination
            page={pendingPagination.page}
            totalPages={pendingData?.data?.totalPages ?? 1}
            onChange={pendingPagination.onChangePage}
            isBusy={pendingFetchStatus === "fetching"}
            totalItems={pendingData?.data?.totalElements ?? 0}
            pageSize={pendingPagination.pageSize}
            onChangePageSize={pendingPagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <OrderTable
          rows={pendingData?.data?.content ?? []}
          onRowClick={(rec) => handleOpen(rec, "order")}
        />
      </PageSection>

      <PageSection
        title="승인 및 진행중 목록"
        caption="처리 중 및 완료된 요청들을 확인합니다."
        filters={
          <>
            <FilterResetButton onClick={onResetProcessed} />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | "ALL")}
            >
              <option value="ALL">전체</option>
              <option value="APPROVED">승인 완료</option>
              <option value="SHIPPED">출고 중</option>
              <option value="COMPLETED">납품 완료</option>
            </Select>
            <DateRange
              startDate={startDateProcessed}
              endDate={endDateProcessed}
              onStartDateChange={setStartDateProcessed}
              onEndDateChange={setEndDateProcessed}
            />
            <SearchBox
              keyword={keywordProcessed}
              onKeywordChange={setKeywordProcessed}
              onSearch={onSearchProcessed}
              onReset={onResetProcessed}
              placeholder="발주번호 / 대리점 검색"
            />
          </>
        }
        isBusy={processedFetchStatus === "fetching"}
        minHeight={280}
        footer={
          <Pagination
            page={processedPagination.page}
            totalPages={processedData?.data?.totalPages ?? 1}
            onChange={processedPagination.onChangePage}
            isBusy={processedFetchStatus === "fetching"}
            totalItems={processedData?.data?.totalElements ?? 0}
            pageSize={processedPagination.pageSize}
            onChangePageSize={processedPagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <RequestTable
          rows={processedData?.data?.content ?? []}
          onRowClick={(rec) => handleOpen(rec, "request")}
        />
      </PageSection>
      <PageSection
        title="취소 및 반려 목록"
        caption="취소 및 반려된 요청들을 확인합니다."
        filters={
          <>
            <FilterResetButton onClick={onResetCancel} />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | "ALL")}
            >
              <option value="ALL">전체</option>
              <option value="REJECTED">반려</option>
              <option value="CANCELLED">취소</option>
            </Select>
            <DateRange
              startDate={startDateCancel}
              endDate={endDateCancel}
              onStartDateChange={setStartDateCancel}
              onEndDateChange={setEndDateCancel}
            />
            <SearchBox
              keyword={keywordCancel}
              onKeywordChange={setKeywordCancel}
              onSearch={onSearchCancel}
              onReset={onResetCancel}
              placeholder="발주번호 / 대리점 검색"
            />
          </>
        }
        isBusy={cancelFetchStatus === "fetching"}
        minHeight={280}
        footer={
          <Pagination
            page={cancelPagination.page}
            totalPages={cancelData?.data?.totalPages ?? 1}
            onChange={cancelPagination.onChangePage}
            isBusy={cancelFetchStatus === "fetching"}
            totalItems={cancelData?.data?.totalElements ?? 0}
            pageSize={cancelPagination.pageSize}
            onChangePageSize={cancelPagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <RequestTable
          rows={cancelData?.data?.content ?? []}
          onRowClick={(rec) => handleOpen(rec, "request")}
        />
      </PageSection>
      <DetailModal
        variant={modalVariant}
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Page>
  );
}
