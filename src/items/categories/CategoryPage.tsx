import { useCallback, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import DateRange from "../../components/common/DateRange";
import {
  FilterGroup,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
} from "../../components/common/PageLayout";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import SearchBox from "../../components/common/SearchBox";
import searchIcon from "../../assets/search.svg";
import resetIcon from "../../assets/reset.svg";
import Pagination from "../../components/common/Pagination";
import type { ListResponse } from "../../api";

import CategoryTable from "./components/CategoryTable";
import CategoryRegisterModal from "./components/CategoryRegisterModal";
import { categoryKeys, createCategory, fetchCategory } from "./CategoryApi";
import {
  toCategoryCreatePayload,
  type CategoryFormModel,
  type CategoryRecord,
} from "./CategoryTypes";

type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
};

export default function CategoryPage() {
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

  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] =
    useState<CategoryFormModel | null>(null);

  const queryClient = useQueryClient();

  const queryKey: QueryKey = useMemo(
    () => [
      ...categoryKeys.records,
      applied.keyword,
      applied.startDate,
      applied.endDate,
      page,
      pageSize,
    ],
    [applied.keyword, applied.startDate, applied.endDate, page, pageSize]
  );

  const params = {
    keyword: applied.keyword || undefined,
    startDate: applied.startDate || undefined,
    endDate: applied.endDate || undefined,
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<ListResponse<CategoryRecord[]>, Error>(
    {
      queryKey,
      queryFn: () => fetchCategory(params),
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev,
      gcTime: 30 * 60 * 1000,
    }
  );

  const isFetching = fetchStatus === "fetching";
  const records = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

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
    setPage(1);
    setApplied({ keyword: "", startDate: null, endDate: null });
  }, []);

  const onChangePageSize = useCallback((n: number) => {
    setPageSize(n);
    setPage(1);
  }, []);

  const createMut = useMutation<CategoryRecord, Error, CategoryFormModel>({
    mutationFn: (form) => createCategory(toCategoryCreatePayload(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <SectionCard>
        <SectionHeader>
          <div>
            <SectionTitle>카테고리 관리</SectionTitle>
            <SectionCaption>
              부품 카테고리를 생성/수정/삭제합니다.
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
            카테고리 +
          </Button>

          <FilterGroup>
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
              placeholder="카테고리명 / 설명 검색"
            />
            <Button variant="icon" onClick={onSearch}>
              <img src={searchIcon} width={18} height={18} alt="검색" />
            </Button>
            <Button variant="icon" onClick={onReset}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
          </FilterGroup>
        </SectionHeader>

        <CategoryTable rows={records} />

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
          onChangePageSize={onChangePageSize}
          showSummary
          showPageSize
          align="center"
          dense={false}
          sticky={false}
        />
      </SectionCard>

      <CategoryRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (form: CategoryFormModel) => {
          if (regMode === "create") {
            const dto = toCategoryCreatePayload(form);
            await createMut.mutateAsync(dto);
          }
        }}
      />
    </>
  );
}
