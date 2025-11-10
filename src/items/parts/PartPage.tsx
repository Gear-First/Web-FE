import { useCallback, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import { Select } from "../../components/common/PageLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import PartTable from "./components/PartTable";
import PartRegisterModal from "./components/PartRegisterModal";

import { partKeys, createPart } from "./PartApi";
import {
  toPartCreateDTO,
  type PartCreateDTO,
  type PartFormModel,
  type PartRecord,
} from "./PartTypes";

import SearchBox from "../../components/common/SearchBox";
import Pagination from "../../components/common/Pagination";
import { usePartSearch } from "./hooks/usePartSearch";
import PageSection from "../../components/common/sections/PageSection";
import FilterResetButton from "../../components/common/filters/FilterResetButton";
import { usePagination } from "../../hooks/usePagination";

type AppliedFilters = {
  keyword: string;
  enabled: "all" | "true" | "false";
};

export default function PartPage() {
  // 검색 상태
  const [keyword, setKeyword] = useState("");
  const [enabledFilter, setEnabledFilter] =
    useState<AppliedFilters["enabled"]>("all");

  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    enabled: "all",
  });

  // 페이지네이션 (UI 1-based)
  const {
    page,
    pageSize,
    onChangePage,
    onChangePageSize,
    resetPage,
  } = usePagination(1, 10);

  // 등록/수정 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<PartFormModel | null>(
    null
  );

  const queryClient = useQueryClient();

  const params = useMemo(
    () => ({
      q: applied.keyword || undefined,
      enabled:
        applied.enabled === "all"
          ? undefined
          : applied.enabled === "true"
          ? true
          : false,
      page,
      pageSize,
    }),
    [applied, page, pageSize]
  );

  const { data, fetchStatus } = usePartSearch({
    params,
    placeholderData: (prev) => prev,
  });

  const isFetching = fetchStatus === "fetching";
  const records = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // 검색/리셋
  const onSearch = useCallback(() => {
    setApplied({
      keyword: keyword.trim(),
      enabled: enabledFilter,
    });
    resetPage();
  }, [keyword, enabledFilter, resetPage]);

  const onReset = useCallback(() => {
    setKeyword("");
    setEnabledFilter("all");
    setApplied({
      keyword: "",
      enabled: "all",
    });
    resetPage();
  }, [resetPage]);

  const onChangeEnabledFilter = useCallback(
    (value: AppliedFilters["enabled"]) => {
      setEnabledFilter(value);
      setApplied((prev) => ({
        ...prev,
        keyword: keyword.trim(),
        enabled: value,
      }));
      resetPage();
    },
    [keyword, resetPage]
  );

  // 생성 뮤테이션 (UI DTO → 서버 바디 매핑은 createPart 내부에서 처리)
  const createMut = useMutation<PartRecord, Error, PartCreateDTO>({
    mutationFn: createPart,
    onSuccess: () => {
      // 현재 페이지 포함 전체 리스트 무효화
      queryClient.invalidateQueries({ queryKey: partKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <PageSection
        title="부품 관리"
        caption="부품 기본정보 및 자재구성을 관리합니다."
        actions={
          <Button
            onClick={() => {
              setRegMode("create");
              setInitialForEdit(null);
              setIsRegOpen(true);
            }}
          >
            부품 +
          </Button>
        }
        filters={
          <>
            <FilterResetButton onClick={onReset} />
            <Select
              value={enabledFilter}
              onChange={(e) =>
                onChangeEnabledFilter(
                  e.target.value as AppliedFilters["enabled"]
                )
              }
              style={{ minWidth: 140 }}
            >
              <option value="all">전체 상태</option>
              <option value="true">사용</option>
              <option value="false">중지</option>
            </Select>
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              placeholder="카테고리 / 차모델 / 부품코드 / 부품명 검색"
              width="320px"
            />
          </>
        }
        isBusy={isFetching}
        minHeight={220}
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
        <PartTable rows={records} />
      </PageSection>

      <PartRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (form: PartFormModel) => {
          if (regMode === "create") {
            const dto = toPartCreateDTO(form);
            await createMut.mutateAsync(dto);
          }
        }}
      />
    </>
  );
}
