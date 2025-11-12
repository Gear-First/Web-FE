import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import SearchBox from "../../components/common/SearchBox";
import Pagination from "../../components/common/Pagination";
import {
  FilterGroup,
  Select,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../../components/common/PageLayout";
import { useCarModelSearch } from "../hooks/useCarModelSearch";
import type { CarModelRecord, CarModelCreateDTO } from "../CarModelTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  carModelPartKeys,
  createCarModel,
  updateCarModel,
  fetchCarModelParts,
  type CarModelPartListParams,
} from "../CarModelApi";
import CarModelRegisterModal from "./CarModelRegisterModal";
import PageSection from "../../components/common/sections/PageSection";
import FilterResetButton from "../../components/common/filters/FilterResetButton";
import { usePagination } from "../../hooks/usePagination";

const MODEL_PAGE_SIZE = 8;
const PART_PAGE_SIZE = 10;

type StatusFilter = "all" | "true" | "false";

export default function CarModelExplorerSection() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [applied, setApplied] = useState({
    keyword: "",
    status: "all" as StatusFilter,
  });
  const modelPagination = usePagination(1, MODEL_PAGE_SIZE);
  const [isCarModelRegisterModalOpen, setIsCarModelRegisterModalOpen] =
    useState(false);

  const params = useMemo(
    () => ({
      q: applied.keyword || undefined,
      enabled:
        applied.status === "all"
          ? undefined
          : applied.status === "true"
          ? true
          : false,
      page: modelPagination.page,
      pageSize: modelPagination.pageSize,
      sort: "name,asc",
    }),
    [applied, modelPagination.page, modelPagination.pageSize]
  );

  const { data, fetchStatus } = useCarModelSearch({
    params,
    enabled: true,
    placeholderData: (prev) => prev,
  });

  const models = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const isFetching = fetchStatus === "fetching";

  const [selected, setSelected] = useState<CarModelRecord | null>(null);

  useEffect(() => {
    if (!selected && models.length > 0) {
      setSelected(models[0]);
      return;
    }
    if (selected && models.every((m) => m.id !== selected.id)) {
      setSelected(models[0] ?? null);
    }
  }, [models, selected]);

  const [partKeyword, setPartKeyword] = useState("");
  const [appliedPartKeyword, setAppliedPartKeyword] = useState("");
  const partPagination = usePagination(1, PART_PAGE_SIZE);

  useEffect(() => {
    setPartKeyword("");
    setAppliedPartKeyword("");
    partPagination.resetPage();
  }, [selected?.id]);

  const partParams = useMemo<CarModelPartListParams>(
    () => ({
      name: appliedPartKeyword || undefined,
      page: partPagination.page,
      pageSize: partPagination.pageSize,
      sort: "name,asc",
    }),
    [appliedPartKeyword, partPagination.page, partPagination.pageSize]
  );

  const partQueryKey = useMemo(
    () =>
      carModelPartKeys.list(selected?.id ?? "none", JSON.stringify(partParams)),
    [selected?.id, partParams]
  );

  const { data: partData, fetchStatus: partFetchStatus } = useQuery({
    queryKey: partQueryKey,
    queryFn: () => fetchCarModelParts(selected!.id, partParams),
    enabled: !!selected,
    placeholderData: (prev) => prev,
  });

  const partRows = partData?.data ?? [];
  const partTotal = partData?.meta?.total ?? 0;
  const partTotalPages = partData?.meta?.totalPages ?? 1;
  const partFetching = partFetchStatus === "fetching";

  const onSearch = () => {
    setApplied({ keyword: keyword.trim(), status });
    modelPagination.resetPage();
  };

  const onReset = () => {
    setKeyword("");
    setStatus("all");
    setApplied({ keyword: "", status: "all" });
    modelPagination.resetPage();
  };

  const onSearchParts = () => {
    setAppliedPartKeyword(partKeyword.trim());
    partPagination.resetPage();
  };

  const onResetParts = () => {
    setPartKeyword("");
    setAppliedPartKeyword("");
    partPagination.resetPage();
  };

  const toggleModelMut = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      updateCarModel(id, { enabled }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["carModel"], exact: false });
      setSelected((prev) =>
        prev && prev.id === variables.id
          ? { ...prev, enabled: variables.enabled }
          : prev
      );
    },
    onError: (error: Error) => alert(error.message),
  });

  const createCarModelMut = useMutation({
    mutationFn: createCarModel,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carModel"],
        exact: false,
      });
      setIsCarModelRegisterModalOpen(false);
    },
    onError: (error: Error) => alert(error.message),
  });

  const handleCreateCarModel = async (payload: CarModelCreateDTO) => {
    await createCarModelMut.mutateAsync(payload);
  };

  const handleToggleModel = async (model: CarModelRecord) => {
    const nextEnabled = !model.enabled;
    if (!nextEnabled) {
      const ok = window.confirm(
        `"${model.name}" 모델을 비활성화하시겠어요?\n(활성 매핑이 있을 경우 취소될 수 있습니다.)`
      );
      if (!ok) return;
    }
    await toggleModelMut.mutateAsync({ id: model.id, enabled: nextEnabled });
  };

  return (
    <>
      <PageSection
        title="차량 모델별 적용 현황"
        caption="좌측에서 모델을 선택하면 우측에서 적용된 부품 목록을 확인할 수 있습니다."
        filters={
          <>
            <FilterResetButton onClick={onReset} />
            <Select
              value={status}
              onChange={(e) => {
                const value = e.target.value as StatusFilter;
                setStatus(value);
                setApplied((prev) => ({ ...prev, status: value }));
                modelPagination.resetPage();
              }}
              style={{ minWidth: 120 }}
            >
              <option value="all">전체</option>
              <option value="true">활성</option>
              <option value="false">중지</option>
            </Select>
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              placeholder="모델명 검색"
              width="200px"
            />
            <Button
              color="black"
              onClick={() => setIsCarModelRegisterModalOpen(true)}
            >
              차량 모델 등록
            </Button>
          </>
        }
        isBusy={
          isFetching ||
          partFetching ||
          toggleModelMut.isPending ||
          createCarModelMut.isPending
        }
        minHeight={520}
      >
        <ExplorerGrid>
          <Pane>
            <PaneHeader>
              <PaneTitle>차량 모델 목록</PaneTitle>
            </PaneHeader>

            <CenteredTable>
              <thead>
                <tr>
                  <Th style={{ width: 70 }}>ID</Th>
                  <Th>모델명</Th>
                  <Th style={{ width: 120 }}>상태</Th>
                  <Th style={{ width: 140 }}>동작</Th>
                </tr>
              </thead>
              <tbody>
                {models.length === 0 ? (
                  <tr>
                    <Td
                      colSpan={4}
                      style={{ textAlign: "center", color: "#9ca3af" }}
                    >
                      {isFetching ? "불러오는 중..." : "데이터가 없습니다."}
                    </Td>
                  </tr>
                ) : (
                  models.map((model) => (
                    <ModelRow
                      key={model.id}
                      $active={selected?.id === model.id}
                      onClick={() => {
                        setSelected(model);
                        partPagination.resetPage();
                      }}
                    >
                      <Td>{model.id}</Td>
                      <Td>{model.name}</Td>
                      <Td>
                        <StatusBadge
                          $variant={model.enabled ? "success" : "danger"}
                        >
                          {model.enabled ? "활성" : "중지"}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          color={model.enabled ? "danger" : "black"}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleToggleModel(model);
                          }}
                          disabled={toggleModelMut.isPending}
                        >
                          {model.enabled ? "중지" : "활성"}
                        </Button>
                      </Td>
                    </ModelRow>
                  ))
                )}
              </tbody>
            </CenteredTable>

            <Pagination
              page={modelPagination.page}
              totalPages={Math.max(1, totalPages)}
              onChange={modelPagination.onChangePage}
              totalItems={total}
              pageSize={modelPagination.pageSize}
              onChangePageSize={modelPagination.onChangePageSize}
              pageSizeOptions={[6, 8, 10]}
              align="center"
              showSummary={false}
              showPageSize={false}
              dense
            />
          </Pane>

          <Pane>
            {selected ? (
              <div>
                <PaneHeader>
                  <div>
                    <PaneTitle>{selected.name}</PaneTitle>
                    <small style={{ color: "#6b7280" }}>
                      ID {selected.id} · {selected.enabled ? "활성" : "중지"}
                    </small>
                  </div>
                  <FilterGroup
                    style={{ justifyContent: "flex-end", marginBottom: 0 }}
                  >
                    <FilterResetButton onClick={onResetParts} />
                    <SearchBox
                      keyword={partKeyword}
                      onKeywordChange={setPartKeyword}
                      onSearch={onSearchParts}
                      placeholder="부품명 검색"
                      width="220px"
                    />
                  </FilterGroup>
                </PaneHeader>

                <CenteredTable>
                  <thead>
                    <tr>
                      <Th style={{ width: 120 }}>부품 코드</Th>
                      <Th>부품명</Th>
                      <Th style={{ width: 140 }}>카테고리</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {partRows.length === 0 ? (
                      <tr>
                        <Td colSpan={3} style={{ textAlign: "center" }}>
                          {partFetching
                            ? "불러오는 중..."
                            : "적용된 부품이 없습니다."}
                        </Td>
                      </tr>
                    ) : (
                      partRows.map((part) => (
                        <tr key={`${part.id}-${part.code}`}>
                          <Td>{part.code}</Td>
                          <Td>{part.name}</Td>
                          <Td>{part.category?.name ?? "-"}</Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </CenteredTable>

                <Pagination
                  page={partPagination.page}
                  totalPages={Math.max(1, partTotalPages)}
                  onChange={partPagination.onChangePage}
                  totalItems={partTotal}
                  pageSize={partPagination.pageSize}
                  onChangePageSize={partPagination.onChangePageSize}
                  pageSizeOptions={[10, 20, 50]}
                  align="center"
                  dense
                />
              </div>
            ) : (
              <EmptyState>좌측에서 차량 모델을 선택하세요.</EmptyState>
            )}
          </Pane>
        </ExplorerGrid>
      </PageSection>
      <CarModelRegisterModal
        isOpen={isCarModelRegisterModalOpen}
        onClose={() => setIsCarModelRegisterModalOpen(false)}
        onSubmit={handleCreateCarModel}
        loading={createCarModelMut.isPending}
      />
    </>
  );
}

const ExplorerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Pane = styled.div`
  background: #fdfdfd;
  border: 1px solid #e4e4e7;
  border-radius: 16px;
  padding: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  min-width: 0;
`;

const PaneHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

const PaneTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
`;

const ModelRow = styled.tr<{ $active?: boolean }>`
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#eef2ff" : "transparent")};
  transition: background 0.15s ease;
  &:hover {
    background: ${({ $active }) => ($active ? "#e0e7ff" : "#f4f4f5")};
  }
`;

const EmptyState = styled.div`
  padding: 60px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
`;

const CenteredTable = styled(Table)`
  th,
  td {
    text-align: center;
    white-space: nowrap;
  }
`;
