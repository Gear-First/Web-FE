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
import type { InboundStatus } from "./InboundTypes";
import { useQuery } from "@tanstack/react-query";
import { fetchInboundRecords, inboundKeys } from "./InboundApi";
import InboundTable from "./components/InboundTable";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Button from "../components/common/Button";
import searchIcon from "../assets/search.svg";
import resetIcon from "../assets/reset.svg";

type StatusFilter = InboundStatus | "ALL";

type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
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

  const { data: records = [], isLoading: loadingR } = useQuery({
    queryKey: [
      ...inboundKeys.records,
      status,
      applied.keyword,
      applied.startDate,
      applied.endDate,
    ],
    queryFn: fetchInboundRecords,
    select: (rows) => {
      const byStatus =
        status === "ALL" ? rows : rows.filter((r) => r.status === status);
      const byKeyword = applied.keyword.trim()
        ? byStatus.filter((r) => {
            const hay = `${r.inboundId ?? ""} ${
              r.partName ?? ""
            }`.toLowerCase();
            return hay.includes(applied.keyword.toLowerCase());
          })
        : byStatus;
      const start = applied.startDate ? new Date(applied.startDate) : null;
      const end = applied.endDate ? new Date(applied.endDate) : null;

      const byDate =
        start || end
          ? byKeyword.filter((r) => {
              const d = new Date(r.receivedDate);
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

  const onSearch = () => {
    setApplied({
      keyword: keyword.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
    });
  };
  const onReset = () => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setStatus("ALL");
    setApplied({ keyword: "", startDate: null, endDate: null });
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
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
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
                placeholder="입고번호 / 부품명 검색"
              />
              <Button variant="icon" onClick={onSearch}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onReset}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>

          {loadingR ? "로딩중..." : <InboundTable rows={records} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
