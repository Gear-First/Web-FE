// src/features/part/PartPage.tsx
import { useCallback, useMemo, useState } from "react";
import {
  FilterGroup,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  Select,
} from "../../components/common/PageLayout";
import {
  useQuery,
  useQueryClient,
  useMutation,
  type QueryKey,
} from "@tanstack/react-query";

import PartTable from "./components/PartTable";
import PartRegisterModal from "./components/PartRegisterModal";

import type { PartCate } from "../../bom/BOMTypes";
import {
  partKeys,
  fetchPartRecords,
  createPart,
  updatePart,
  type ListResponse,
} from "./PartApi";
import type { PartRecords, PartCreateDTO, PartUpdateDTO } from "./PartTypes";

import Button from "../../components/common/Button";
import resetIcon from "../../assets/reset.svg";
import searchIcon from "../../assets/search.svg";
import SearchBox from "../../components/common/SearchBox";
import DateRange from "../../components/common/DateRange";
import Pagination from "../../components/common/Pagination";

/** 등록/수정 폼 DTO (모달과 합의된 형태, 화면 상태 전용) */
type PartDTO = {
  partId?: string;
  partName: string;
  partCode: string;
  category: PartCate;
  materials: {
    materialCode: string;
    materialName: string;
    materialQty: number;
  }[];
};

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

/** DTO → 생성 payload (서버에서 partId/createdDate 채움) */
const toCreatePayload = (dto: PartDTO): PartCreateDTO => ({
  partName: dto.partName.trim(),
  partCode: dto.partCode.trim(),
  category: dto.category,
  materials: dto.materials.map((m) => ({
    materialCode: m.materialCode.trim(),
    materialName: m.materialName.trim(),
    materialQty: Number(m.materialQty),
  })),
});

/** DTO → 부분수정 payload */
const toPatchPayload = (dto: PartDTO): PartUpdateDTO => ({
  partName: dto.partName.trim(),
  partCode: dto.partCode.trim(),
  category: dto.category,
  materials: dto.materials.map((m) => ({
    materialCode: m.materialCode.trim(),
    materialName: m.materialName.trim(),
    materialQty: Number(m.materialQty),
  })),
});

export default function PartPage() {
  // 필터 상태
  const [cate, setCate] = useState<CateFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 검색 적용 상태 (버튼 눌러야 반영)
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
  const [initialForEdit, setInitialForEdit] = useState<PartDTO | null>(null);

  const queryClient = useQueryClient();

  // queryKey는 원시값으로만 구성
  const queryKey: QueryKey = useMemo(
    () => [
      ...partKeys.records, // ["part","records"]
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

  // 생성/수정 뮤테이션 (정확한 타입 지정)
  const createMut = useMutation<PartRecords, Error, PartCreateDTO>({
    mutationFn: createPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.records });
      setIsRegOpen(false);
    },
  });

  const updateMut = useMutation<
    PartRecords,
    Error,
    { id: string; patch: PartUpdateDTO }
  >({
    mutationFn: ({ id, patch }) => updatePart(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <SectionCard>
        {/* 상단 제목 */}
        <SectionHeader>
          <div>
            <SectionTitle>Part</SectionTitle>
            <SectionCaption>
              부품 기본정보 및 자재구성을 관리합니다.
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
            Part +
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

        {/* 테이블 */}
        <PartTable rows={records} />

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
              <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
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

      {/* 등록/수정 모달 */}
      <PartRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload: PartDTO) => {
          if (regMode === "create") {
            await createMut.mutateAsync(toCreatePayload(payload));
          } else if (initialForEdit?.partId) {
            await updateMut.mutateAsync({
              id: initialForEdit.partId,
              patch: toPatchPayload(payload),
            });
          }
        }}
      />
    </>
  );
}
