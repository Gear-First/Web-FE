import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  FilterGroup,
  Select,
} from "../components/common/PageLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OrderTable from "./components/OrderTable";
import RequestTable from "./components/RequestTable";
import DetailModal from "./components/RequestDetailModal";
import Pagination from "../components/common/Pagination";
import DateRange from "../components/common/DateRange";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";
import {
  fetchPendingOrders,
  fetchProcessedOrders,
  rejectOrder,
} from "./RequestApi";
import type {
  PendingOrderItem,
  ProcessedOrderItem,
  OrderStatus,
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

  // 반려 기능 (React Query invalidate 포함)
  const handleReject = async (orderId: number, remark?: string) => {
    const note = remark?.trim() ?? "";

    try {
      const res = await rejectOrder(orderId, note);
      alert(res.message || "반려되었습니다.");

      setIsModalOpen(false);

      // 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      queryClient.invalidateQueries({ queryKey: ["rejected-orders"] });
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
  const [pagePending, setPagePending] = useState(1);
  const [pageSizePending, setPageSizePending] = useState(10);

  // 미승인 목록 조회
  const { data: pendingData, fetchStatus: pendingFetchStatus } = useQuery({
    queryKey: [
      "pending-orders",
      pagePending,
      pageSizePending,
      appliedPendingKeyword,
      appliedStartDatePending,
      appliedEndDatePending,
    ],
    queryFn: () =>
      fetchPendingOrders({
        page: pagePending - 1,
        size: pageSizePending,
        sort: "",
        partName: appliedPendingKeyword || undefined,
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
    setPagePending(1);
  };

  const onResetPending = () => {
    setKeywordPending("");
    setAppliedPendingKeyword("");
    setStartDatePending("");
    setEndDatePending("");
    setAppliedStartDatePending("");
    setAppliedEndDatePending("");
    setPagePending(1);
  };

  // 승인/진행중 (APPROVED, SHIPPED, COMPLETED)
  const [keywordApproved, setKeywordApproved] = useState("");
  const [appliedApprovedKeyword, setAppliedApprovedKeyword] = useState("");
  const [startDateApproved, setStartDateApproved] = useState("");
  const [endDateApproved, setEndDateApproved] = useState("");
  const [appliedStartDateApproved, setAppliedStartDateApproved] = useState("");
  const [appliedEndDateApproved, setAppliedEndDateApproved] = useState("");
  const [pageApproved, setPageApproved] = useState(1);
  const [pageSizeApproved, setPageSizeApproved] = useState(10);

  const { data: approvedData, fetchStatus: approvedFetchStatus } = useQuery({
    queryKey: [
      "approved-orders",
      pageApproved,
      pageSizeApproved,
      appliedApprovedKeyword,
      appliedStartDateApproved,
      appliedEndDateApproved,
    ],
    queryFn: () =>
      fetchProcessedOrders({
        page: pageApproved - 1,
        size: pageSizeApproved,
        sort: "",
        partName: appliedApprovedKeyword || undefined,
        startDate: appliedStartDateApproved || undefined,
        endDate: appliedEndDateApproved || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const onSearchApproved = () => {
    setAppliedApprovedKeyword(keywordApproved.trim());
    setAppliedStartDateApproved(startDateApproved);
    setAppliedEndDateApproved(endDateApproved);
    setPageApproved(1);
  };

  const onResetApproved = () => {
    setKeywordApproved("");
    setAppliedApprovedKeyword("");
    setStartDateApproved("");
    setEndDateApproved("");
    setAppliedStartDateApproved("");
    setAppliedEndDateApproved("");
    setPageApproved(1);
  };

  // 반려/취소 (REJECTED, CANCELLED)
  const [keywordRejected, setKeywordRejected] = useState("");
  const [appliedRejectedKeyword, setAppliedRejectedKeyword] = useState("");
  const [startDateRejected, setStartDateRejected] = useState("");
  const [endDateRejected, setEndDateRejected] = useState("");
  const [appliedStartDateRejected, setAppliedStartDateRejected] = useState("");
  const [appliedEndDateRejected, setAppliedEndDateRejected] = useState("");
  const [pageRejected, setPageRejected] = useState(1);
  const [pageSizeRejected, setPageSizeRejected] = useState(10);

  const { data: rejectedData, fetchStatus: rejectedFetchStatus } = useQuery({
    queryKey: [
      "rejected-orders",
      pageRejected,
      pageSizeRejected,
      appliedRejectedKeyword,
      appliedStartDateRejected,
      appliedEndDateRejected,
    ],
    queryFn: () =>
      fetchProcessedOrders({
        page: pageRejected - 1,
        size: pageSizeRejected,
        sort: "",
        partName: appliedRejectedKeyword || undefined,
        startDate: appliedStartDateRejected || undefined,
        endDate: appliedEndDateRejected || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const onSearchRejected = () => {
    setAppliedRejectedKeyword(keywordRejected.trim());
    setAppliedStartDateRejected(startDateRejected);
    setAppliedEndDateRejected(endDateRejected);
    setPageRejected(1);
  };

  const onResetRejected = () => {
    setKeywordRejected("");
    setAppliedRejectedKeyword("");
    setStartDateRejected("");
    setEndDateRejected("");
    setAppliedStartDateRejected("");
    setAppliedEndDateRejected("");
    setPageRejected(1);
  };

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
    <Layout>
      <PageContainer>
        {/* 미승인 요청 목록 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>발주 요청 목록</SectionTitle>
              <SectionCaption>
                아직 승인되지 않은 발주 요청들을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          {/* 필터 영역 */}
          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
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
              <Button variant="icon" onClick={onSearchPending}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onResetPending}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>

          {/* 테이블 */}
          <OrderTable
            rows={pendingData?.data?.content ?? []}
            onRowClick={(rec) => handleOpen(rec, "order")}
          />

          {/* 로딩 표시 */}
          <div style={{ height: 18, marginTop: 8, marginBottom: 12 }}>
            {pendingFetchStatus === "fetching" && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
            )}
          </div>

          {/* 페이지네이션 */}
          <Pagination
            page={pagePending}
            totalPages={pendingData?.data?.totalPages ?? 1}
            onChange={setPagePending}
            isBusy={pendingFetchStatus === "fetching"}
            totalItems={pendingData?.data?.totalElements ?? 0}
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

        {/* 승인 및 진행중 목록 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>승인 및 진행중 목록</SectionTitle>
              <SectionCaption>
                처리 중 및 완료된 요청들을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          {/* 필터 영역 */}
          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as OrderStatus | "ALL")
                }
              >
                <option value="ALL">전체</option>
                <option value="APPROVED">승인 완료</option>
                <option value="SHIPPED">출고 중</option>
                <option value="COMPLETED">납품 완료</option>
              </Select>
              <DateRange
                startDate={startDateApproved}
                endDate={endDateApproved}
                onStartDateChange={setStartDateApproved}
                onEndDateChange={setEndDateApproved}
              />
              <SearchBox
                keyword={keywordApproved}
                onKeywordChange={setKeywordApproved}
                onSearch={onSearchApproved}
                onReset={onResetApproved}
                placeholder="발주번호 / 대리점 검색"
              />
              <Button variant="icon" onClick={onSearchApproved}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onResetApproved}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>
          <RequestTable
            rows={approvedData?.data?.content ?? []}
            onRowClick={(rec) => handleOpen(rec, "request")}
          />

          <Pagination
            page={pageApproved}
            totalPages={approvedData?.data?.totalPages ?? 1}
            onChange={setPageApproved}
            isBusy={approvedFetchStatus === "fetching"}
            totalItems={approvedData?.data?.totalElements ?? 0}
            pageSize={pageSizeApproved}
            onChangePageSize={(n) => {
              setPageSizeApproved(n);
              setPageApproved(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>
        {/* 반려 목록 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>취소 및 반려 목록</SectionTitle>
              <SectionCaption>
                취소 및 반려된 요청들을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          {/* 필터 영역 */}
          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as OrderStatus | "ALL")
                }
              >
                <option value="ALL">전체</option>
                <option value="REJECTED">반려</option>
                <option value="CANCELLED">취소</option>
              </Select>
              <DateRange
                startDate={startDateRejected}
                endDate={endDateRejected}
                onStartDateChange={setStartDatePending}
                onEndDateChange={setEndDatePending}
              />
              <SearchBox
                keyword={keywordRejected}
                onKeywordChange={setKeywordRejected}
                onSearch={onSearchRejected}
                onReset={onResetRejected}
                placeholder="발주번호 / 대리점 검색"
              />
              <Button variant="icon" onClick={onSearchRejected}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onResetRejected}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>
          <RequestTable
            rows={rejectedData?.data?.content ?? []}
            onRowClick={(rec) => handleOpen(rec, "request")}
          />

          <Pagination
            page={pageRejected}
            totalPages={rejectedData?.data?.totalPages ?? 1}
            onChange={setPageRejected}
            isBusy={rejectedFetchStatus === "fetching"}
            totalItems={rejectedData?.data?.totalElements ?? 0}
            pageSize={pageSizeRejected}
            onChangePageSize={(n) => {
              setPageSizeRejected(n);
              setPageRejected(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>
      </PageContainer>

      <DetailModal
        variant={modalVariant}
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReject={handleReject}
      />
    </Layout>
  );
}
