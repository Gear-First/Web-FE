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
import { fetchPendingOrders, fetchProcessedOrders } from "./RequestApi";
import type { PendingOrderItem, ProcessedOrderItem } from "./RequestTypes";

export default function RequestPage() {
  // 선택된 레코드 & 모달
  const [selectedRecord, setSelectedRecord] = useState<
    PendingOrderItem | ProcessedOrderItem | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 미승인 필터
  const [keywordPending, setKeywordPending] = useState("");
  const [startDatePending, setStartDatePending] = useState("");
  const [endDatePending, setEndDatePending] = useState("");
  const [pagePending, setPagePending] = useState(1);
  const [pageSizePending, setPageSizePending] = useState(10);

  // 승인/반려 페이지네이션

  const [status, setStatus] = useState<"ALL" | "CANCELLED" | "SHIPPED">("ALL");
  const [pageProcessed, setPageProcessed] = useState(1);
  const [pageSizeProcessed, setPageSizeProcessed] = useState(10);

  const statusOptions = ["ALL", "CANCELLED", "SHIPPED"];

  // 미승인 목록 조회
  const { data: pendingData, fetchStatus: pendingFetchStatus } = useQuery({
    queryKey: [
      "pending-orders",
      pagePending,
      pageSizePending,
      startDatePending,
      endDatePending,
      keywordPending,
    ],
    queryFn: () =>
      fetchPendingOrders(
        { page: pagePending - 1, size: pageSizePending, sort: "" },
        {
          startDate: startDatePending || undefined,
          endDate: endDatePending || undefined,
          partName: keywordPending || undefined,
        }
      ),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // 승인/반려 목록 조회
  const { data: processedData, fetchStatus: processedFetchStatus } = useQuery({
    queryKey: ["processed-orders", pageProcessed, pageSizeProcessed],
    queryFn: () =>
      fetchProcessedOrders({
        page: pageProcessed - 1,
        size: pageSizeProcessed,
        sort: "",
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // 미승인 검색/초기화 핸들러
  const onSearchPending = () => setPagePending(1);
  const onResetPending = () => {
    setKeywordPending("");
    setStartDatePending("");
    setEndDatePending("");
    setPagePending(1);
  };

  // 모달 열기
  const handleOpen = (rec: PendingOrderItem | ProcessedOrderItem) => {
    setSelectedRecord(rec);
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
                placeholder="부품명 / 대리점 검색"
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
            onRowClick={handleOpen}
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

        {/* 승인/반려 목록 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>승인 및 반려 목록</SectionTitle>
              <SectionCaption>처리 완료된 요청들을 확인합니다.</SectionCaption>
            </div>
          </SectionHeader>
          {/* 필터 영역 */}
          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "ALL" | "CANCELLED" | "SHIPPED")
                }
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL"
                      ? "전체"
                      : opt === "SHIPPED"
                      ? "승인"
                      : opt === "REJECTED"
                      ? "반려"
                      : "취소"}
                  </option>
                ))}
              </Select>
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
                placeholder="부품명 / 대리점 검색"
              />
              <Button variant="icon" onClick={onSearchPending}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onResetPending}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>
          <RequestTable
            rows={processedData?.data?.content ?? []}
            onRowClick={handleOpen}
          />

          <Pagination
            page={pageProcessed}
            totalPages={processedData?.data?.totalPages ?? 1}
            onChange={setPageProcessed}
            isBusy={processedFetchStatus === "fetching"}
            totalItems={processedData?.data?.totalElements ?? 0}
            pageSize={pageSizeProcessed}
            onChangePageSize={(n) => {
              setPageSizeProcessed(n);
              setPageProcessed(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>
      </PageContainer>

      {/* 상세 모달 */}
      {/* <DetailModal
        variant={modalVariant}
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // 발주 모드일 때만 승인/반려 버튼을 보이도록 콜백 전달
        onApprove={modalVariant === "order" ? handleApprove : undefined}
        onReject={modalVariant === "order" ? handleReject : undefined}
      /> */}
      <DetailModal
        variant="order"
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
}
