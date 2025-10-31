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
import type { OutboundStatus } from "./OutboundTypes";
import { outboundKeys, fetchOutboundRecords } from "./OutboundApi";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Button from "../components/common/Button";
import Pagination from "../components/common/Pagination";

type StatusFilter = OutboundStatus | "ALL";

type AppliedFilters = {
  status: StatusFilter;
  keyword: string;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
};

export default function OutboundPage() {
  const statusOptions: StatusFilter[] = [
    "ALL",
    "대기",
    "지연",
    "진행중",
    "완료",
  ]; // 입력값(즉시 반영 X)
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 적용 필터(검색 버튼 눌렀을 때만 반영)
  const [applied, setApplied] = useState<AppliedFilters>({
    status: "ALL",
    keyword: "",
    startDate: null,
    endDate: null,
  });

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading: isFetching } = useQuery({
    queryKey: [...outboundKeys.records, { applied, page, pageSize }],
    queryFn: () =>
      fetchOutboundRecords({
        status: applied.status,
        q: applied.keyword,
        startDate: applied.startDate,
        endDate: applied.endDate,
        page: page - 1,
        pageSize,
      }),
    // placeholderData: keepPreviousData,
  });

  const records = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };
  const onSearch = () => {
    setApplied((prev) => ({
      ...prev,
      keyword: keyword.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
    }));
    setPage(1);
  };

  const onReset = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setApplied({ status: "ALL", keyword: "", startDate: null, endDate: null });
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
                  setApplied((prev) => ({ ...prev, status: value })); // applied 상태 업데이트
                  setPage(1); // 페이지 초기화
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체" : opt}
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
                placeholder="부품코드 / 부품명 검색"
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
