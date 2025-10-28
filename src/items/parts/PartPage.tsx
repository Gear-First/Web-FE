// src/features/part/PartPage.tsx
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
  type PartRecords,
  type PartCreateDTO,
  toPartCreatePayload,
  type PartFormModel,
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
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });

  // 페이지네이션 (UI: 1-based)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 등록/수정 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<PartFormModel | null>(
    null
  );

  const queryClient = useQueryClient();

  // 쿼리키 & 파라미터
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

  const params = {
    q: applied.keyword || undefined,
    startDate: applied.startDate || undefined, // 서버 미지원시 PartApi에서 제외 처리
    endDate: applied.endDate || undefined, // 서버 미지원시 PartApi에서 제외 처리
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<ListResponse<PartRecords[]>, Error>({
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
    setPage(1);
    setApplied({ keyword: "", startDate: null, endDate: null });
  }, []);

  const onChangePageSize = useCallback((n: number) => {
    setPageSize(n);
    setPage(1);
  }, []);

  // 생성 뮤테이션
  const createMut = useMutation<PartRecords, Error, PartCreateDTO>({
    mutationFn: createPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <SectionCard>
        <SectionHeader>
          <div>
            <SectionTitle>Parts</SectionTitle>
            <SectionCaption>
              부품 기본정보 및 자재구성을 관리합니다.
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
            Part +
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
              placeholder="부품코드 / 부품명 / 자재명 검색"
            />
            <Button variant="icon" onClick={onSearch}>
              <img src={searchIcon} width={18} height={18} alt="검색" />
            </Button>
            <Button variant="icon" onClick={onReset}>
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
        onSubmit={async (payload: PartFormModel) => {
          if (regMode === "create") {
            await createMut.mutateAsync(toPartCreatePayload(payload));
          }
        }}
      />
    </>
  );
}
