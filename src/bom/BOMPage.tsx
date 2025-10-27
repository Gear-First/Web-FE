import { useCallback, useMemo, useState } from "react";
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
import {
  toBOMCreatePayload,
  type BOMDTO, // 폼 모델(등록/수정 공용)
  type BOMRecord, // 서버 응답 타입
  type PartCate,
  type BOMCreateDTO, // 생성 요청 DTO
} from "./BOMTypes";
import BOMTable from "./components/BOMTable";
import {
  useQuery,
  useQueryClient,
  useMutation,
  type QueryKey,
} from "@tanstack/react-query";
import {
  bomKeys,
  fetchBOMRecords,
  createBOM,
  type ListResponse,
} from "./BOMApi";
import Button from "../components/common/Button";
import BOMRegisterModal from "./components/BOMRegisterModal";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Pagination from "../components/common/Pagination";

type CateFilter = PartCate | "ALL";
type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
};

const CATE_OPTIONS: CateFilter[] = [
  "ALL",
  "카테고리 A",
  "카테고리 B",
  "카테고리 C",
  "카테고리 D",
];

export default function BOMPage() {
  // 필터 상태
  const [cate, setCate] = useState<CateFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 검색 적용 상태
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 등록/수정 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<BOMDTO | null>(null);

  const queryClient = useQueryClient();

  // queryKey는 순수 원시값으로 구성
  const queryKey: QueryKey = useMemo(
    () => [
      ...bomKeys.records,
      cate,
      applied.keyword,
      applied.startDate,
      applied.endDate,
      page,
      pageSize,
    ],
    [cate, applied.keyword, applied.startDate, applied.endDate, page, pageSize]
  );

  const params = {
    category: cate,
    q: applied.keyword || undefined,
    startDate: applied.startDate || undefined,
    endDate: applied.endDate || undefined,
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<ListResponse<BOMRecord[]>, Error>({
    queryKey,
    queryFn: () => fetchBOMRecords(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    gcTime: 30 * 60 * 1000,
  });

  const isFetching = fetchStatus === "fetching";
  const records = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // 핸들러
  const onSearch = useCallback(() => {
    setApplied({
      keyword: keyword.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
    });
    setPage(1);
  }, [keyword, startDate, endDate]);

  const onReset = useCallback(() => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setCate("ALL");
    setPage(1);
    setApplied({ keyword: "", startDate: null, endDate: null });
  }, []);

  const onChangeCate = useCallback((next: CateFilter) => {
    setCate(next);
    setPage(1);
  }, []);

  const onChangePageSize = useCallback((n: number) => {
    setPageSize(n);
    setPage(1);
  }, []);

  // 생성/수정 뮤테이션 — 타입 시그니처 정리
  const createMut = useMutation<BOMRecord, Error, BOMCreateDTO>({
    mutationFn: createBOM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bomKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <Layout>
        <PageContainer>
          <SectionCard>
            {/* 상단 제목 */}
            <SectionHeader>
              <div>
                <SectionTitle>BOM</SectionTitle>
                <SectionCaption>
                  자재 소요량 산출 및 계획을 관리합니다.
                </SectionCaption>
              </div>
            </SectionHeader>

            {/* 상단 도구 모음 */}
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
                  onChange={(e) => onChangeCate(e.target.value as CateFilter)}
                >
                  {CATE_OPTIONS.map((opt) => (
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

            {/* 테이블 */}
            <BOMTable rows={records} />

            {/* 하단 상태/총건수 */}
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
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    로딩중…
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                총 {total.toLocaleString()}건
              </span>
            </div>

            {/* 페이지네이션 */}
            <Pagination
              page={page}
              totalPages={Math.max(1, totalPages)}
              onChange={setPage}
              isBusy={isFetching}
              maxButtons={5}
              totalItems={total}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              onChangePageSize={onChangePageSize}
              showSummary
              showPageSize
              align="center"
              dense={false}
              sticky={false}
            />
          </SectionCard>
        </PageContainer>
      </Layout>

      {/* 등록/수정 모달 */}
      <BOMRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload: BOMDTO) => {
          if (regMode === "create") {
            await createMut.mutateAsync(toBOMCreatePayload(payload));
          }
        }}
      />
    </>
  );
}
