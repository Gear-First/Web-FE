// src/features/inbound/InboundPage.tsx
import { useState } from "react";
import Layout from "../components/common/Layout";
import {
  FilterGroup,
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  Select,
} from "../components/common/PageLayout";
import type { InboundRecord, InboundStatus } from "./InboundTypes";
import { useQuery } from "@tanstack/react-query";
import { fetchInboundRecords, inboundKeys } from "./InboundApi";
import InboundTable from "./components/InboundTable";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Button from "../components/common/Button";
import searchIcon from "../assets/search.svg";
import resetIcon from "../assets/reset.svg";
import Pagination from "../components/common/Pagination";

type StatusFilter = InboundStatus | "ALL";
type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
};

type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export default function InboundPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "합격", "보류", "불합격"];

  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 서버(=MSW) 필터로 위임: queryKey에 파라미터를 전부 포함
  const params = {
    status,
    q: applied.keyword || undefined,
    startDate: applied.startDate || undefined,
    endDate: applied.endDate || undefined,
    page,
    pageSize,
  };

  const {
    data,
    isLoading: loadingR,
    fetchStatus,
  } = useQuery<ListResponse<InboundRecord[]>, Error>({
    queryKey: [...inboundKeys.records, params],
    queryFn: () => fetchInboundRecords(params),
    staleTime: 5 * 60 * 1000,
    // v5: keepPreviousData 대체 -> 이전 데이터를 placeholder로 유지 (로딩중에도 UI 유지)
    placeholderData: (prev) => prev,
  });

  const isFetching = fetchStatus === "fetching";

  const records = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const onSearch = () => {
    setApplied({
      keyword: keyword.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
    });
    setPage(1);
  };

  const onReset = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setStatus("ALL");
    setPage(1);
    setApplied({ keyword: "", startDate: null, endDate: null });
  };

  const onChangeStatus = (next: StatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>입고 관리</SectionTitle>
              <SectionCaption>
                입고된 자재의 검수 상태와 보관 위치를 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
              <Select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value as StatusFilter)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체" : opt}
                  </option>
                ))}
              </Select>

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
                placeholder="입고번호 / 부품명 / 공급업체 검색"
              />
              <Button variant="icon" onClick={onSearch}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onReset}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>

          <InboundTable rows={records} />
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
            page={page}
            totalPages={Math.max(1, totalPages)}
            onChange={(next) => setPage(next)}
            isBusy={isFetching}
            maxButtons={5}
            totalItems={total}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={(n) => {
              setPageSize(n);
              setPage(1);
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
