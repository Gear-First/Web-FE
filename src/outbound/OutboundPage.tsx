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
import OutboundTable from "./components/OutboundTable";
import { outboundKeys, fetchOutboundRecords } from "./OutboundApi";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Button from "../components/common/Button";
import Pagination from "../components/common/Pagination";

type StatusFilter = "all" | "done" | "not-done";

interface AppliedFilters {
  status: StatusFilter;
  keyword: string;
  dateFrom: string | null;
  dateTo: string | null;
  warehouseCode?: string;
}

export default function OutboundPage() {
  const statusOptions = [
    // API용 상태 필터 옵션
    { label: "전체", value: "all" },
    { label: "완료", value: "done" },
    { label: "미완료", value: "not-done" },
  ] as const;

  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 검색 조건 (검색 버튼 눌러야 반영)
  const [applied, setApplied] = useState<AppliedFilters>({
    status: "all",
    keyword: "",
    dateFrom: null,
    dateTo: null,
    warehouseCode: "",
  });

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading: isFetching } = useQuery({
    queryKey: [...outboundKeys.records, { applied, page, pageSize }],
    queryFn: () =>
      fetchOutboundRecords({
        status: applied.status,
        dateFrom: applied.dateFrom,
        dateTo: applied.dateTo,
        warehouseCode: applied.warehouseCode || "",
        page: page - 1,
        size: pageSize,
      }),
  });

  const records = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };

  const onSearch = () => {
    setApplied((prev) => ({
      ...prev,
      keyword: keyword.trim(),
      dateFrom: startDate || null,
      dateTo: endDate || null,
      warehouseCode: keyword.trim(),
    }));
    setPage(1);
  };

  const onReset = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setApplied({
      status: "all",
      keyword: "",
      dateFrom: null,
      dateTo: null,
      warehouseCode: "",
    });
    setPage(1);
  };

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>출고 관리</SectionTitle>
              <SectionCaption>
                작업 지시별 자재 출고 이력을 추적하고 현황을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
              <Select
                value={applied.status}
                onChange={(e) => {
                  const value = e.target.value as StatusFilter;
                  setApplied((prev) => ({ ...prev, status: value }));
                  setPage(1);
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {/* 날짜 범위 */}
              <DateRange
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />

              {/* 검색어 */}
              <SearchBox
                keyword={keyword}
                onKeywordChange={setKeyword}
                onSearch={onSearch}
                onReset={onReset}
                placeholder="부품코드 / 부품명 검색 / 창고"
              />

              <Button variant="icon" onClick={onSearch}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onReset}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>

          <OutboundTable rows={records} />
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
            totalPages={meta.totalPages}
            totalItems={meta.total}
            onChange={setPage}
            isBusy={isFetching}
            pageSize={pageSize}
            onChangePageSize={(n) => {
              setPageSize(n);
              setPage(1);
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
