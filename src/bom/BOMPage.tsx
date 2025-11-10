import { useCallback, useMemo, useState } from "react";
import Page from "../components/common/Page";
import { Select } from "../components/common/PageLayout";
import {
  toBOMCreatePayload,
  type BOMCreateDTO,
  type BOMDTO, // 폼 모델(등록/수정 공용)
  type BOMRecord, // 서버 응답 타입 (category: string)
} from "./BOMTypes";
import BOMTable from "./components/BOMTable";
import {
  useQuery,
  useQueryClient,
  useMutation,
  type QueryKey,
} from "@tanstack/react-query";
import { addBOMMaterials, bomKeys, fetchBOMRecords } from "./BOMApi";
import Button from "../components/common/Button";
import BOMRegisterModal, {
  type AddMaterialsPayload,
} from "./components/BOMRegisterModal";
import SearchBox from "../components/common/SearchBox";
import DateRange from "../components/common/DateRange";
import Pagination from "../components/common/Pagination";
import type { ListResponse } from "../api";
import PageSection from "../components/common/sections/PageSection";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import { usePagination } from "../hooks/usePagination";

type CateFilter = string | "ALL";

type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
};

// 예시 옵션 (자유 문자열이므로 나중에 서버 목록으로 대체 가능)
const CATE_OPTIONS: CateFilter[] = ["ALL", "브레이크", "엔진"];

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

  // 페이지네이션 (화면 1-based)
  const {
    page,
    pageSize,
    onChangePage,
    onChangePageSize,
    resetPage,
  } = usePagination(1, 10);

  // 등록 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<BOMDTO | null>(null);

  const queryClient = useQueryClient();

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
    category: cate === "ALL" ? undefined : cate,
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
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const isFetching = fetchStatus === "fetching";

  const records = useMemo(() => {
    const arr = data?.data;
    return Array.isArray(arr) ? arr : [];
  }, [data]);

  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // 핸들러
  const onSearch = useCallback(() => {
    setApplied({
      keyword: keyword.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
    });
    resetPage();
  }, [keyword, startDate, endDate, resetPage]);

  const onReset = useCallback(() => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setCate("ALL");
    resetPage();
    setApplied({ keyword: "", startDate: null, endDate: null });
  }, [resetPage]);

  const onChangeCate = useCallback((next: CateFilter) => {
    setCate(next);
    resetPage();
  }, []);

  // 생성
  const createMut = useMutation<{ ok: boolean }, Error, BOMCreateDTO>({
    mutationFn: addBOMMaterials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bomKeys.records });
      setIsRegOpen(false);
    },
    onError: (err) => {
      alert(err.message ?? "BOM 등록 중 오류가 발생했습니다.");
    },
  });

  return (
    <>
      <Page>
        <PageSection
          title="BOM"
          caption="자재 소요량 산출 및 계획을 관리합니다."
          actions={
            <Button
              onClick={() => {
                setRegMode("create");
                setInitialForEdit(null);
                setIsRegOpen(true);
              }}
            >
              BOM +
            </Button>
          }
          filters={
            <>
              <FilterResetButton onClick={onReset} />
              <Select
                value={cate}
                onChange={(e) => onChangeCate(e.target.value as CateFilter)}
                style={{ minWidth: 180 }}
              >
                {CATE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체 카테고리" : opt}
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
                placeholder="부품코드 / 부품명 검색"
              />
            </>
          }
          isBusy={isFetching}
          footer={
            <Pagination
              page={page}
              totalPages={Math.max(1, totalPages)}
              onChange={onChangePage}
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
          }
        >
          <BOMTable rows={records} />
        </PageSection>
      </Page>
      <BOMRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload: AddMaterialsPayload) => {
          if (regMode === "create") {
            const dto = toBOMCreatePayload(payload);
            await createMut.mutateAsync(dto);
          }
        }}
      />
    </>
  );
}
