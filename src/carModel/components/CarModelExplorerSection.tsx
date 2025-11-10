import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import SearchBox from "../../components/common/SearchBox";
import Pagination from "../../components/common/Pagination";
import resetIcon from "../../assets/reset.svg";
import {
  FilterGroup,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  Select,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../../components/common/PageLayout";
import { useCarModelSearch } from "../hooks/useCarModelSearch";
import type { CarModelRecord } from "../CarModelTypes";
import { useQuery } from "@tanstack/react-query";
import {
  carModelPartKeys,
  fetchCarModelParts,
  type CarModelPartListParams,
} from "../CarModelApi";

const MODEL_PAGE_SIZE = 8;
const PART_PAGE_SIZE = 10;

type StatusFilter = "all" | "true" | "false";

export default function CarModelExplorerSection() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("true");
  const [applied, setApplied] = useState({
    keyword: "",
    status: "true" as StatusFilter,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(MODEL_PAGE_SIZE);

  const params = useMemo(
    () => ({
      q: applied.keyword || undefined,
      enabled:
        applied.status === "all"
          ? undefined
          : applied.status === "true"
          ? true
          : false,
      page,
      pageSize,
      sort: "name,asc",
    }),
    [applied, page, pageSize]
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
  const [partPage, setPartPage] = useState(1);
  const [partPageSize, setPartPageSize] = useState(PART_PAGE_SIZE);

  useEffect(() => {
    setPartKeyword("");
    setAppliedPartKeyword("");
    setPartPage(1);
  }, [selected?.id]);

  const partParams = useMemo<CarModelPartListParams>(
    () => ({
      name: appliedPartKeyword || undefined,
      page: partPage,
      pageSize: partPageSize,
      sort: "name,asc",
    }),
    [appliedPartKeyword, partPage, partPageSize]
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
    setPage(1);
  };

  const onReset = () => {
    setKeyword("");
    setStatus("true");
    setApplied({ keyword: "", status: "true" });
    setPage(1);
  };

  const onSearchParts = () => {
    setAppliedPartKeyword(partKeyword.trim());
    setPartPage(1);
  };

  const onResetParts = () => {
    setPartKeyword("");
    setAppliedPartKeyword("");
    setPartPage(1);
  };

  return (
    <SectionCard>
      <SectionHeader>
        <div>
          <SectionTitle>차량 모델별 적용 현황</SectionTitle>
          <SectionCaption>
            좌측에서 모델을 선택하면 우측에서 적용된 부품 목록을 확인할 수
            있습니다.
          </SectionCaption>
        </div>
      </SectionHeader>

      <ExplorerGrid>
        <Pane>
          <PaneHeader>
            <PaneTitle>차량 모델 목록</PaneTitle>
            <FilterGroup>
              <Button variant="icon" onClick={onReset} aria-label="초기화">
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
              <Select
                value={status}
                onChange={(e) => {
                  const value = e.target.value as StatusFilter;
                  setStatus(value);
                  setApplied((prev) => ({ ...prev, status: value }));
                  setPage(1);
                }}
                style={{ minWidth: 140 }}
              >
                <option value="true">활성</option>
                <option value="false">중지</option>
                <option value="all">전체</option>
              </Select>
              <SearchBox
                keyword={keyword}
                onKeywordChange={setKeyword}
                onSearch={onSearch}
                placeholder="모델명 검색"
                width="150px"
              />
            </FilterGroup>
          </PaneHeader>

          <CenteredTable>
            <thead>
              <tr>
                <Th style={{ width: 70 }}>ID</Th>
                <Th>모델명</Th>
                <Th style={{ width: 120 }}>상태</Th>
              </tr>
            </thead>
            <tbody>
              {models.length === 0 ? (
                <tr>
                  <Td colSpan={3} style={{ textAlign: "center" }}>
                    {isFetching ? "불러오는 중..." : "등록된 모델이 없습니다."}
                  </Td>
                </tr>
              ) : (
                models.map((model) => (
                  <ModelRow
                    key={model.id}
                    $active={selected?.id === model.id}
                    onClick={() => {
                      setSelected(model);
                      setPartPage(1);
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
                  </ModelRow>
                ))
              )}
            </tbody>
          </CenteredTable>

          <Pagination
            page={page}
            totalPages={Math.max(1, totalPages)}
            onChange={setPage}
            isBusy={isFetching}
            totalItems={total}
            pageSize={pageSize}
            onChangePageSize={(n) => {
              setPageSize(n);
              setPage(1);
            }}
            pageSizeOptions={[6, 8, 10]}
            align="center"
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
                  <Button
                    variant="icon"
                    onClick={onResetParts}
                    aria-label="초기화"
                  >
                    <img src={resetIcon} width={18} height={18} alt="초기화" />
                  </Button>
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
                page={partPage}
                totalPages={Math.max(1, partTotalPages)}
                onChange={setPartPage}
                isBusy={partFetching}
                totalItems={partTotal}
                pageSize={partPageSize}
                onChangePageSize={(n) => {
                  setPartPageSize(n);
                  setPartPage(1);
                }}
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
    </SectionCard>
  );
}

const ExplorerGrid = styled.div`
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
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
  }
`;
