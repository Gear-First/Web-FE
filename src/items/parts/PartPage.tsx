import { useCallback, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import {
  FilterGroup,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  Select,
} from "../../components/common/PageLayout";
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
import resetIcon from "../../assets/reset.svg";
import Pagination from "../../components/common/Pagination";
import { usePartSearch } from "./hooks/usePartSearch";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    setPage(1);
  }, [keyword, enabledFilter]);

  const onReset = useCallback(() => {
    setKeyword("");
    setEnabledFilter("all");
    setApplied({
      keyword: "",
      enabled: "all",
    });
    setPage(1);
  }, []);

  const onChangeEnabledFilter = useCallback(
    (value: AppliedFilters["enabled"]) => {
      setEnabledFilter(value);
      setApplied((prev) => ({
        ...prev,
        keyword: keyword.trim(),
        enabled: value,
      }));
      setPage(1);
    },
    [keyword]
  );

  const onChangePageSize = useCallback((n: number) => {
    setPageSize(n);
    setPage(1);
  }, []);

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
      <SectionCard>
        <SectionHeader>
          <div>
            <SectionTitle>부품 관리</SectionTitle>
            <SectionCaption>
              부품 기본정보 및 자재구성을 관리합니다.
            </SectionCaption>
          </div>
          <Button
            onClick={() => {
              setRegMode("create");
              setInitialForEdit(null);
              setIsRegOpen(true);
            }}
          >
            부품 +
          </Button>
        </SectionHeader>

        <FilterGroup>
          <Button variant="icon" onClick={onReset} aria-label="초기화">
            <img src={resetIcon} width={18} height={18} alt="초기화" />
          </Button>
          <Select
            value={enabledFilter}
            onChange={(e) =>
              onChangeEnabledFilter(e.target.value as AppliedFilters["enabled"])
            }
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
        </FilterGroup>

        <PartTable rows={records} />

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
