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
  keyword: string;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
};

export default function OutboundPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "대기", "진행중", "완료"]; // 입력값(즉시 반영 X)
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 적용 필터(검색 버튼 눌렀을 때만 반영)
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: records = [], isLoading: isFetching } = useQuery({
    queryKey: outboundKeys.records,
    queryFn: fetchOutboundRecords,
    select: (rows) => {
      const byCate =
        status === "ALL" ? rows : rows.filter((r) => r.status === status);
      const byKeyword = applied.keyword.trim()
        ? byCate.filter((r) => {
            const itemText = r.inventoryItems
              .map((item) => `${item.inventoryCode} ${item.inventoryName}`)
              .join(" ")
              .toLowerCase();

            return itemText.includes(applied.keyword.toLowerCase());
          })
        : byCate;

      const start = applied.startDate ? new Date(applied.startDate) : null;
      const end = applied.endDate ? new Date(applied.endDate) : null;

      const byDate =
        start || end
          ? byKeyword.filter((r) => {
              const d = new Date(r.receiptDate);
              if (Number.isNaN(d.getTime())) return false;
              const okStart = start ? d >= start : true;
              const okEnd = end ? d <= end : true;
              return okStart && okEnd;
            })
          : byKeyword;

      return byDate;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 현재 페이지 슬라이스
  const total = records.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedRecords = records.slice((page - 1) * pageSize, page * pageSize);

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
    setApplied({ keyword: "", startDate: null, endDate: null });
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
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as StatusFilter);
                  setPage(1);
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

          <OutboundTable rows={pagedRecords} />
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
            onChange={setPage}
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
