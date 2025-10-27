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
import type { RequestRecord, RequestStatus } from "./RequestTypes";
import { requestKeys, fetchRequestRecords } from "./RequestApi";
import DetailModal from "./components/RequestDetailModal";
import Pagination from "../components/common/Pagination";
import DateRange from "../components/common/DateRange";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";

type StatusFilter = RequestStatus | "ALL";

type AppliedFilters = {
  keyword: string;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
};

export default function RequestPage() {
  // 단일 모달 상태: 선택 레코드/ 열림 여부/ 모달 모드
  const [selectedRecord, setSelectedRecord] = useState<RequestRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"order" | "request">(
    "order"
  );

  // 미승인
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [pendingStartDate, setPendingStartDate] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const [pendingApplied, setPendingApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });
  const [pagePending, setPagePending] = useState(1);
  const [pageSizePending, setPageSizePending] = useState(10);

  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "승인", "반려"];

  // 승인/반려
  const [processedKeyword, setProcessedKeyword] = useState("");
  const [processedStartDate, setProcessedStartDate] = useState("");
  const [processedEndDate, setProcessedEndDate] = useState("");
  const [processedApplied, setProcessedApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });
  const [pageProcessed, setPageProcessed] = useState(1);
  const [pageSizeProcessed, setPageSizeProcessed] = useState(10);

  // 서버에서 전체 요청 목록 조회
  const {
    data: allRecords = [],
    isLoading,
    fetchStatus,
  } = useQuery({
    queryKey: requestKeys.records,
    queryFn: fetchRequestRecords,
    staleTime: 5 * 60 * 1000,
  });

  const isFetching = fetchStatus === "fetching";

  // 미승인: 필터 + 페이지네이션
  const basePending = allRecords.filter((r) => r.status === "미승인");

  const filteredPending = basePending.filter((r) => {
    const kw = pendingApplied.keyword.trim().toLowerCase();
    const keywordOk =
      !kw ||
      `${r.requestId} ${r.agency} ${r.manager} ${r.partItems
        .map((it) => `${it.partCode} ${it.partName}`)
        .join(" ")}`
        .toLowerCase()
        .includes(kw);

    const s = pendingApplied.startDate
      ? new Date(pendingApplied.startDate)
      : null;
    const e = pendingApplied.endDate ? new Date(pendingApplied.endDate) : null;
    const d = new Date(r.requestDate);
    const dateOk = (!s || d >= s) && (!e || d <= e);

    return keywordOk && dateOk;
  });

  const totalPending = filteredPending.length;
  const totalPagesPending = Math.ceil(totalPending / pageSizePending);
  const pagedPending = filteredPending.slice(
    (pagePending - 1) * pageSizePending,
    pagePending * pageSizePending
  );

  // 승인/반려: 필터 + 페이지네이션
  const baseProcessed = allRecords.filter((r) => r.status !== "미승인");

  const filteredProcessed = baseProcessed.filter((r) => {
    // 상태 필터
    const statusOk = status === "ALL" ? true : r.status === status;

    // 키워드 필터
    const kw = processedApplied.keyword.trim().toLowerCase();
    const keywordOk =
      !kw ||
      `${r.requestId} ${r.agency} ${r.manager} ${r.partItems
        .map((it) => `${it.partCode} ${it.partName}`)
        .join(" ")}`
        .toLowerCase()
        .includes(kw);

    // 날짜 필터 (requestDate 기준)
    const s = processedApplied.startDate
      ? new Date(processedApplied.startDate)
      : null;
    const e = processedApplied.endDate
      ? new Date(processedApplied.endDate)
      : null;
    const d = new Date(r.requestDate);
    const dateOk = (!s || d >= s) && (!e || d <= e);

    return statusOk && keywordOk && dateOk;
  });

  const totalProcessed = filteredProcessed.length;
  const totalPagesProcessed = Math.ceil(totalProcessed / pageSizeProcessed);
  const pagedProcessed = filteredProcessed.slice(
    (pageProcessed - 1) * pageSizeProcessed,
    pageProcessed * pageSizeProcessed
  );

  // 미승인: 검색/초기화
  const onSearchPending = () => {
    setPendingApplied({
      keyword: pendingKeyword.trim(),
      startDate: pendingStartDate || null,
      endDate: pendingEndDate || null,
    });
    setPagePending(1);
  };
  const onResetPending = () => {
    setPendingKeyword("");
    setPendingStartDate("");
    setPendingEndDate("");
    setPendingApplied({ keyword: "", startDate: null, endDate: null });
    setPagePending(1);
  };

  // 승인/반려: 검색/초기화
  const onSearchProcessed = () => {
    setProcessedApplied({
      keyword: processedKeyword.trim(),
      startDate: processedStartDate || null,
      endDate: processedEndDate || null,
    });
    setPageProcessed(1);
  };
  const onResetProcessed = () => {
    setProcessedKeyword("");
    setProcessedStartDate("");
    setProcessedEndDate("");
    setProcessedApplied({ keyword: "", startDate: null, endDate: null });
    setStatus("ALL");
    setPageProcessed(1);
  };

  // 행 클릭 핸들러: 미승인 -> 발주 상세
  const handleOpenOrder = (rec: RequestRecord) => {
    setSelectedRecord(rec);
    setModalVariant("order");
    setIsModalOpen(true);
  };

  // 행 클릭 핸들러: 처리완료 -> 요청 상세
  const handleOpenRequest = (rec: RequestRecord) => {
    setSelectedRecord(rec);
    setModalVariant("request");
    setIsModalOpen(true);
  };

  // 승인/반려 액션
  const handleApprove = (requestId: string, remark?: string) => {
    console.log("승인", requestId, remark);
  };
  const handleReject = (requestId: string, remark?: string) => {
    console.log("반려", requestId, remark);
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
          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
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
                placeholder="대리점 / 부품명 / 담당자 검색"
              />
              <Button variant="icon" onClick={onSearchPending}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onResetPending}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>
          <OrderTable
            rows={pagedPending}
            onRowClick={handleOpenOrder} // 발주 모달 오픈
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {isFetching && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

          <Pagination
            page={pagePending}
            totalPages={Math.max(1, totalPagesPending)}
            onChange={setPagePending}
            isBusy={isFetching}
            maxButtons={5}
            totalItems={totalPending}
            pageSize={pageSizePending}
            pageSizeOptions={[10, 20, 50, 100]}
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
              <SectionCaption>처리된 요청들을 확인합니다.</SectionCaption>
            </div>
          </SectionHeader>
          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as StatusFilter);
                  setPageProcessed(1);
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체" : opt}
                  </option>
                ))}
              </Select>
              <DateRange
                startDate={processedStartDate}
                endDate={processedEndDate}
                onStartDateChange={setProcessedStartDate}
                onEndDateChange={setProcessedEndDate}
              />
              <SearchBox
                keyword={processedKeyword}
                onKeywordChange={setProcessedKeyword}
                onSearch={onSearchProcessed}
                onReset={onResetProcessed}
                placeholder="대리점 / 부품명 / 담당자 검색"
              />
              <Button variant="icon" onClick={onSearchProcessed}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onResetProcessed}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>
          <RequestTable rows={pagedProcessed} onRowClick={handleOpenRequest} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {isFetching && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

          <Pagination
            page={pageProcessed}
            totalPages={Math.max(1, totalPagesProcessed)}
            onChange={setPageProcessed}
            isBusy={isFetching}
            maxButtons={5}
            totalItems={totalProcessed}
            pageSize={pageSizeProcessed}
            pageSizeOptions={[10, 20, 50, 100]}
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
      <DetailModal
        variant={modalVariant}
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // 발주 모드일 때만 승인/반려 버튼을 보이도록 콜백 전달
        onApprove={modalVariant === "order" ? handleApprove : undefined}
        onReject={modalVariant === "order" ? handleReject : undefined}
      />
    </Layout>
  );
}
