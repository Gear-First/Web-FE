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

type StatusFilter = InboundStatus;
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
  const [status, setStatus] = useState<StatusFilter>("all");
  const statusOptions: StatusFilter[] = ["all", "not-done", "done"];

  const statusLabelMap: Record<StatusFilter, string> = {
    all: "전체",
    "not-done": "입고예정",
    done: "입고완료",
  };
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    dateFrom: null,
    dateTo: null,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = {
    status,
    q: applied.keyword || undefined,
    dateFrom: applied.dateFrom || undefined,
    dateTo: applied.dateTo || undefined,
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<ListResponse<InboundRecord[]>, Error>({
    queryKey: [...inboundKeys.records, params],
    queryFn: () => fetchInboundRecords(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const isFetching = fetchStatus === "fetching";

  const records = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const onSearch = () => {
    setApplied({
      keyword: keyword.trim(),
      dateFrom: startDate || null,
      dateTo: endDate || null,
    });
    setPage(1);
  };

  const onReset = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setStatus("all");
    setPage(1);
    setApplied({ keyword: "", dateFrom: null, dateTo: null });
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
                    {statusLabelMap[opt]}
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
                placeholder="입고번호 / 입고대상 / 공급업체 검색"
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
