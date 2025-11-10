import { useCallback, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import DateRange from "../../components/common/DateRange";
import PageSection from "../../components/common/sections/PageSection";
import {
  toMaterialCreatePayload,
  type MaterialCreateDTO,
  type MaterialFormModel,
} from "./MaterialTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMaterial, materialKeys } from "./MaterialApi";
import SearchBox from "../../components/common/SearchBox";
import Pagination from "../../components/common/Pagination";
import MaterialTable from "./components/MaterialTable";
import MaterialRegisterModal from "./components/MaterialRegisterModal";
import { useMaterialSearch } from "./hooks/useMaterialSearch";
import FilterResetButton from "../../components/common/filters/FilterResetButton";
import { usePagination } from "../../hooks/usePagination";

type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
};

export default function MaterialPage() {
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });

  const {
    page,
    pageSize,
    onChangePage,
    onChangePageSize,
    resetPage,
  } = usePagination(1, 10);

  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] =
    useState<MaterialFormModel | null>(null);

  const queryClient = useQueryClient();

  const params = useMemo(
    () => ({
      keyword: applied.keyword || undefined,
      startDate: applied.startDate || undefined,
      endDate: applied.endDate || undefined,
      page,
      pageSize,
    }),
    [applied.keyword, applied.startDate, applied.endDate, page, pageSize]
  );

  const { data, fetchStatus } = useMaterialSearch({
    params,
    placeholderData: (prev) => prev,
  });

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

  const createMut = useMutation<MaterialCreateDTO, Error, MaterialCreateDTO>({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <PageSection
        title="자재 관리"
        caption="자재 기본정보를 관리합니다."
        actions={
          <Button
            onClick={() => {
              setRegMode("create");
              setInitialForEdit(null);
              setIsRegOpen(true);
            }}
          >
            자재 +
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
              placeholder="자재코드 / 자재명 검색"
              width="150px"
            />
          </>
        }
        isBusy={isFetching}
        minHeight={200}
        footer={
          <Pagination
            page={page}
            totalPages={Math.max(1, totalPages)}
            onChange={onChangePage}
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
        }
      >
        <MaterialTable rows={records} />
      </PageSection>

      <MaterialRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload: MaterialFormModel) => {
          if (regMode === "create") {
            await createMut.mutateAsync(toMaterialCreatePayload(payload));
          }
        }}
      />
    </>
  );
}
