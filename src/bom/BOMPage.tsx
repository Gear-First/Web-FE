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
import type { BOMDTO, PartCate } from "./BOMTypes";
import BOMTable from "./components/BOMTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bomKeys, fetchBOMRecords, createBOM, updateBOM } from "./BOMApi";
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

  // 등록/수정 겸용 모달 상태
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<BOMDTO | null>(null);

  // 입력값(즉시 반영 X)
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 적용 필터(검색 버튼 눌렀을 때만 반영)
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

  const queryClient = useQueryClient();

  const { data: records = [], isLoading: loadingR } = useQuery({
    queryKey: [
      ...bomKeys.records,
      cate,
      applied.keyword,
      applied.startDate,
      applied.endDate,
    ],
    queryFn: fetchBOMRecords,
    select: (rows) => {
      const byCate =
        cate === "ALL" ? rows : rows.filter((r) => r.category === cate);
      const byKeyword = applied.keyword.trim()
        ? byCate.filter((r) => {
            const hay = `${r.partCode ?? ""} ${r.partName ?? ""}`.toLowerCase();
            return hay.includes(applied.keyword.toLowerCase());
          })
        : byCate;

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
    setCate("ALL");
    setApplied({ keyword: "", startDate: null, endDate: null });
  };

  return (
    <>
      <Layout>
        <PageContainer>
          <SectionCard>
            {/* 상단 제목 + 등록 버튼 */}
            <SectionHeader>
              <div>
                <SectionTitle>BOM</SectionTitle>
                <SectionCaption>
                  자재 소요량 산출 및 계획을 관리합니다.
                </SectionCaption>
              </div>
            </SectionHeader>

            <SectionHeader>
              <Button
                onClick={() => {
                  setRegMode("create");
                  setInitialForEdit(null);
                  setIsRegOpen(true);
                }}
              >
                BOM +
              </Button>

              <FilterGroup>
                {/* 카테고리 (즉시 반영) */}
                <Select
                  value={cate}
                  onChange={(e) => setCate(e.target.value as CateFilter)}
                >
                  {cateOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "ALL" ? "전체 카테고리" : opt}
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

            {loadingR ? "로딩중..." : <BOMTable rows={records} />}
          </SectionCard>
        </PageContainer>
      </Layout>

      {/* 등록/수정 겸용 모달 */}
      <BOMRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async () => {
          if (regMode === "create") {
            await createBOM();
          } else {
            await updateBOM();
          }
          // 목록 갱신
          queryClient.invalidateQueries({ queryKey: bomKeys.records });
        }}
      />
    </>
  );
}
