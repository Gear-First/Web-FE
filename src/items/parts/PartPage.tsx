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

import PartTable from "./components/PartTable";
import PartRegisterModal from "./components/PartRegisterModal";

import { partKeys, fetchPartRecords, createPart } from "./PartApi";
import {
  toPartCreateDTO,
  type PartCreateDTO,
  type PartFormModel,
  type PartRecord,
} from "./PartTypes";
import type { ListResponse } from "../../api";

import SearchBox from "../../components/common/SearchBox";
import searchIcon from "../../assets/search.svg";
import resetIcon from "../../assets/reset.svg";
import Pagination from "../../components/common/Pagination";

type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
};

export default function PartPage() {
  // 검색 상태
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
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

  // 쿼리 키
  const queryKey: QueryKey = useMemo(
    () => [
      ...partKeys.records,
      applied.keyword,
      applied.startDate,
      applied.endDate,
      page,
      pageSize,
    ],
    [applied.keyword, applied.startDate, applied.endDate, page, pageSize]
  );

  // 리스트 파라미터 (서버 변환은 PartApi에서 처리)
  const params = {
    q: applied.keyword || undefined,
    startDate: applied.startDate || undefined, // 서버 미지원 시 PartApi에서 제외
    endDate: applied.endDate || undefined, // 서버 미지원 시 PartApi에서 제외
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<ListResponse<PartRecord[]>, Error>({
    queryKey,
    queryFn: () => fetchPartRecords(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    gcTime: 30 * 60 * 1000,
  });

  const isFetching = fetchStatus === "fetching";
  const records = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // 검색/리셋
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
    setApplied({ keyword: "", startDate: null, endDate: null });
    setPage(1);
  }, []);

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
          {/* 우측으로 이동 */}
        </SectionHeader>

        <SectionHeader>
          <Button
            onClick={() => {
              setRegMode("create");
              setInitialForEdit(null);
              setIsRegOpen(true);
            }}
          >
            부품 +
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
              placeholder="부품코드 / 부품명 검색"
            />
            <Button variant="icon" onClick={onSearch} aria-label="검색">
              <img src={searchIcon} width={18} height={18} alt="검색" />
            </Button>
            <Button variant="icon" onClick={onReset} aria-label="초기화">
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
          </FilterGroup>
        </SectionHeader>

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
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            총 {total.toLocaleString()}건
          </span>
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
