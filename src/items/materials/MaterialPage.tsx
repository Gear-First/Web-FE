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
import type {
  MaterialCreateDTO,
  MaterialRecords,
  MaterialUpdateDTO,
} from "./MaterialTypes";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  createMaterial,
  fetchMaterialRecords,
  type ListResponse,
  materialKeys,
  updateMaterial,
} from "./MaterialApi";
import SearchBox from "../../components/common/SearchBox";
import searchIcon from "../../assets/search.svg";
import resetIcon from "../../assets/reset.svg";
import Pagination from "../../components/common/Pagination";
import MaterialTable from "./components/MaterialTable";
import MaterialRegisterModal from "./components/MaterialRegisterModal";

type MaterialDTO = {
  materialId?: string;
  materialName: string;
  materialCode: string;
};

type AppliedFilters = {
  keyword: string;
  startDate: string | null;
  endDate: string | null;
};

const toCreatePayload = (dto: MaterialDTO): MaterialCreateDTO => ({
  materialName: dto.materialName.trim(),
  materialCode: dto.materialCode.trim(),
});

const toPatchPayload = (dto: MaterialDTO): MaterialUpdateDTO => ({
  materialName: dto.materialName.trim(),
  materialCode: dto.materialCode.trim(),
});

export default function MaterialPage() {
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
  const [initialForEdit, setInitialForEdit] = useState<MaterialDTO | null>(
    null
  );

  const queryClient = useQueryClient();

  const queryKey: QueryKey = useMemo(
    () => [
      ...materialKeys.records,
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
    startDate: applied.startDate || undefined,
    endDate: applied.endDate || undefined,
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<
    ListResponse<MaterialRecords[]>,
    Error
  >({
    queryKey,
    queryFn: () => fetchMaterialRecords(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    gcTime: 30 * 60 * 1000,
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

  const createMut = useMutation<MaterialRecords, Error, MaterialCreateDTO>({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.records });
      setIsRegOpen(false);
    },
  });

  const updateMut = useMutation<
    MaterialRecords,
    Error,
    { id: string; patch: MaterialUpdateDTO }
  >({
    mutationFn: ({ id, patch }) => updateMaterial(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.records });
      setIsRegOpen(false);
    },
  });

  return (
    <>
      <SectionCard>
        <SectionHeader>
          <div>
            <SectionTitle>Materials</SectionTitle>
            <SectionCaption>자재 기본정보를 관리합니다.</SectionCaption>
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
            Materials +
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
              placeholder="자재코드 / 자재명 검색"
            />
            <Button variant="icon" onClick={onSearch}>
              <img src={searchIcon} width={18} height={18} alt="검색" />
            </Button>
            <Button variant="icon" onClick={onReset}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
          </FilterGroup>
        </SectionHeader>

        <MaterialTable rows={records} />

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

      <MaterialRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload: MaterialDTO) => {
          if (regMode === "create") {
            await createMut.mutateAsync(toCreatePayload(payload));
          } else if (initialForEdit?.materialId) {
            await updateMut.mutateAsync({
              id: initialForEdit.materialId,
              patch: toPatchPayload(payload),
            });
          }
        }}
      />
    </>
  );
}
