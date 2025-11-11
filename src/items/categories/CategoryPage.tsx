import { useCallback, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import DateRange from "../../components/common/DateRange";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import SearchBox from "../../components/common/SearchBox";
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
import PageSection from "../../components/common/sections/PageSection";
import FilterResetButton from "../../components/common/filters/FilterResetButton";
import { usePagination } from "../../hooks/usePagination";

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

  const { page, pageSize, onChangePage, onChangePageSize, resetPage } =
    usePagination(1, 10);

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
    resetPage();
  }, [keyword, startDate, endDate, resetPage]);

  const onReset = useCallback(() => {
    setKeyword("");
    setStartDate("");
    setEndDate("");
    resetPage();
    setApplied({ keyword: "", startDate: null, endDate: null });
  }, [resetPage]);

  const createMut = useMutation<CategoryRecord, Error, CategoryFormModel>({
    mutationFn: (form) => createCategory(toCategoryCreatePayload(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <PageSection
        title="카테고리 관리"
        caption="부품 카테고리를 생성/수정/삭제합니다."
        actions={
          <Button
            onClick={() => {
              setRegMode("create");
              setInitialForEdit(null);
              setIsRegOpen(true);
            }}
          >
            카테고리 +
          </Button>
        }
        filters={
          <>
            <FilterResetButton onClick={onReset} />
            <DateRange
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              width="80px"
            />
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              onReset={onReset}
              placeholder="카테고리명 / 설명 검색"
              width="150px"
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
        <CategoryTable rows={records} />
      </PageSection>

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
