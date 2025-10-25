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
import type { PartCate } from "./BOMTypes";
import BOMTable from "./components/BOMTable";
import { useQuery } from "@tanstack/react-query";
import { bomKeys, fetchBOMRecords } from "./BOMApi";
import Button from "../components/common/Button";
import BOMRegisterModal from "./components/BOMRegisterModal";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";

type CateFilter = PartCate | "ALL";

type AppliedFilters = {
  keyword: string;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
};

export default function BOMPage() {
  const [cate, setCate] = useState<CateFilter>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 입력값(즉시 반영 X)
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 검색 버튼을 눌렀을 때만 적용되는 필터
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });

  const cateOptions: CateFilter[] = [
    "ALL",
    "카테고리 A",
    "카테고리 B",
    "카테고리 C",
    "카테고리 D",
  ];

  const { data: records = [], isLoading: loadingR } = useQuery({
    // 카테고리는 즉시 반영, 나머지는 applied 기준
    queryKey: [
      ...bomKeys.records,
      cate,
      applied.keyword,
      applied.startDate,
      applied.endDate,
    ],
    queryFn: fetchBOMRecords,
    // 서버에서 필터링하지 않을 경우 클라이언트에서 필터
    select: (rows) => {
      const byCate =
        cate === "ALL" ? rows : rows.filter((r) => r.category === cate);
      const byKeyword = applied.keyword.trim()
        ? byCate.filter((r) => {
            const hay = `${r.partCode ?? ""} ${r.partName ?? ""}`.toLowerCase();
            return hay.includes(applied.keyword.toLowerCase());
          })
        : byCate;

      // 날짜 기준은 예: r.createdDate(YYYY-MM-DD) 기준으로 필터
      const start = applied.startDate ? new Date(applied.startDate) : null;
      const end = applied.endDate ? new Date(applied.endDate) : null;

      const byDate =
        start || end
          ? byKeyword.filter((r) => {
              const d = new Date(r.createdDate);
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
    setApplied({ keyword: "", startDate: null, endDate: null });
  };

  return (
    <>
      <Layout>
        <PageContainer>
          <SectionCard>
            <SectionHeader>
              <div>
                <SectionTitle>BOM</SectionTitle>
                <SectionCaption>
                  자재 소요량 산출 및 계획을 관리합니다.
                </SectionCaption>
              </div>
            </SectionHeader>
            <SectionHeader>
              {/* 등록 버튼 */}
              <Button onClick={() => setIsModalOpen(true)}>BOM +</Button>
              <FilterGroup
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* 카테고리 (즉시 반영) */}

                <Select
                  value={cate}
                  onChange={(e) => setCate(e.target.value as CateFilter)}
                >
                  {cateOptions.map((cate) => (
                    <option key={cate} value={cate}>
                      {cate === "ALL" ? "전체 카테고리" : cate}
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

                {/* 액션 버튼 */}
                <Button variant="icon" onClick={onSearch}>
                  <img src={searchIcon} width={18} height={18} />
                </Button>
                <Button variant="icon" onClick={onReset}>
                  <img src={resetIcon} width={18} height={18} />
                </Button>
              </FilterGroup>
            </SectionHeader>

            {loadingR ? "로딩중..." : <BOMTable rows={records} />}
          </SectionCard>
        </PageContainer>
      </Layout>

      <BOMRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
