import { useMemo, useState } from "react";
import styled from "styled-components";
import Layout from "../components/common/Layout";
import {
  FilterGroup,
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../components/common/PageLayout";
import Button from "../components/common/Button";
import SearchBox from "../components/common/SearchBox";
import Pagination from "../components/common/Pagination";
import resetIcon from "../assets/reset.svg";
import PartSearchModal from "../bom/components/PartSearchModal";
import type { PartRecord } from "../items/parts/PartTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPartCarModelMapping,
  createCarModel,
  deletePartCarModelMapping,
  fetchPartCarModels,
  partCarModelKeys,
  updatePartCarModelMapping,
  type PartCarModelListParams,
} from "./CarModelApi";
import type {
  PartCarModelMapping,
  PartCarModelCreateDTO,
  PartCarModelUpdateDTO,
} from "./CarModelTypes";
import CarModelMappingModal from "./components/CarModelMappingModal";
import CarModelRegisterModal from "./components/CarModelRegisterModal";
import CarModelExplorerSection from "./components/CarModelExplorerSection";

export default function CarModelPage() {
  const [selectedPart, setSelectedPart] = useState<PartRecord | null>(null);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isCarModelRegisterModalOpen, setIsCarModelRegisterModalOpen] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const mappingParams = useMemo<PartCarModelListParams>(
    () => ({
      name: appliedKeyword || undefined,
      page,
      pageSize,
      sort: "name,asc",
    }),
    [appliedKeyword, page, pageSize]
  );

  const queryClient = useQueryClient();

  const mappingKey = useMemo(
    () =>
      partCarModelKeys.list(
        selectedPart?.partId ?? "none",
        JSON.stringify(mappingParams)
      ),
    [selectedPart?.partId, mappingParams]
  );

  const { data, fetchStatus } = useQuery({
    queryKey: mappingKey,
    queryFn: () => fetchPartCarModels(selectedPart!.partId, mappingParams),
    enabled: !!selectedPart,
    placeholderData: (prev) => prev,
  });

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const isFetching = fetchStatus === "fetching";

  const createMut = useMutation({
    mutationFn: ({
      partId,
      payload,
    }: {
      partId: number | string;
      payload: PartCarModelCreateDTO;
    }) => createPartCarModelMapping(partId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["part", "carModels", String(variables.partId)],
        exact: false,
      });
      setIsMappingModalOpen(false);
    },
    onError: (error: Error) => alert(error.message),
  });

  const updateMut = useMutation({
    mutationFn: ({
      partId,
      carModelId,
      payload,
    }: {
      partId: number | string;
      carModelId: number;
      payload: PartCarModelUpdateDTO;
    }) => updatePartCarModelMapping(partId, carModelId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["part", "carModels", String(variables.partId)],
        exact: false,
      });
      setIsMappingModalOpen(false);
    },
    onError: (error: Error) => alert(error.message),
  });

  const deleteMut = useMutation({
    mutationFn: ({
      partId,
      carModelId,
    }: {
      partId: number | string;
      carModelId: number;
    }) => deletePartCarModelMapping(partId, carModelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["part", "carModels", String(variables.partId)],
        exact: false,
      });
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

  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [mappingMode, setMappingMode] = useState<"create" | "edit">("create");
  const [editingMapping, setEditingMapping] = useState<PartCarModelMapping | null>(
    null
  );

  const openCreateModal = () => {
    if (!selectedPart) {
      setIsPartModalOpen(true);
      return;
    }
    setMappingMode("create");
    setEditingMapping(null);
    setIsMappingModalOpen(true);
  };

  const openEditModal = (mapping: PartCarModelMapping) => {
    setMappingMode("edit");
    setEditingMapping(mapping);
    setIsMappingModalOpen(true);
  };

  const handleSubmitMapping = async (payload: {
    carModelId: number;
    note?: string;
    enabled: boolean;
  }) => {
    if (!selectedPart) return;
    if (mappingMode === "create") {
      await createMut.mutateAsync({
        partId: selectedPart.partId,
        payload,
      });
    } else if (editingMapping) {
      await updateMut.mutateAsync({
        partId: selectedPart.partId,
        carModelId: editingMapping.carModelId,
        payload,
      });
    }
  };

  const handleDelete = async (mapping: PartCarModelMapping) => {
    if (!selectedPart) return;
    const ok = window.confirm(
      `${mapping.carModelName} 모델과의 매핑을 삭제하시겠어요?`
    );
    if (!ok) return;
    await deleteMut.mutateAsync({
      partId: selectedPart.partId,
      carModelId: mapping.carModelId,
    });
  };

  const handleSearchPart = (part: PartRecord) => {
    setSelectedPart(part);
    setIsPartModalOpen(false);
    setKeyword("");
    setAppliedKeyword("");
    setPage(1);
  };

  const onSearch = () => {
    setAppliedKeyword(keyword.trim());
    setPage(1);
  };

  const onResetFilters = () => {
    setKeyword("");
    setAppliedKeyword("");
    setPage(1);
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  const handleCreateCarModel = async (payload: { name: string; enabled: boolean }) => {
    await createCarModelMut.mutateAsync(payload);
  };

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>부품별 차량 모델 매핑</SectionTitle>
              <SectionCaption>
                부품과 적용 차량 모델 간의 관계를 조회·관리합니다.
              </SectionCaption>
            </div>
            <HeaderActions>
              <Button color="black" onClick={() => setIsCarModelRegisterModalOpen(true)}>
                차량 모델 등록
              </Button>
              <Button color="black" onClick={() => setIsPartModalOpen(true)}>
                부품 선택
              </Button>
            </HeaderActions>
          </SectionHeader>

          {selectedPart ? (
            <>
              <SelectedPartCard>
                <div>
                  <span className="label">선택된 부품</span>
                  <strong>{selectedPart.partName}</strong>
                  <span className="code">{selectedPart.partCode}</span>
                </div>
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setIsPartModalOpen(true)}
                >
                  변경
                </Button>
              </SelectedPartCard>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "16px 0",
                  gap: 12,
                }}
              >
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  총 {total.toLocaleString()}건
                </div>
                <Button color="black" onClick={openCreateModal}>
                  차량 모델 추가
                </Button>
              </div>

              <FilterGroup>
                <Button
                  variant="icon"
                  onClick={onResetFilters}
                  aria-label="초기화"
                >
                  <img src={resetIcon} width={18} height={18} alt="초기화" />
                </Button>
                <SearchBox
                  keyword={keyword}
                  onKeywordChange={setKeyword}
                  onSearch={onSearch}
                  placeholder="모델명 검색"
                  width="280px"
                />
              </FilterGroup>

              <Table>
                <thead>
                  <tr>
                    <Th>모델명</Th>
                    <Th>비고</Th>
                    <Th style={{ width: 120 }}>상태</Th>
                    <Th style={{ width: 160 }}>최근 수정</Th>
                    <Th style={{ width: 180 }}>관리</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <Td colSpan={5} style={{ textAlign: "center" }}>
                        {isFetching ? "불러오는 중..." : "등록된 매핑이 없습니다."}
                      </Td>
                    </tr>
                  ) : (
                    rows.map((mapping) => (
                      <tr key={`${mapping.carModelId}`}>
                        <Td style={{ textAlign: "left" }}>{mapping.carModelName}</Td>
                        <Td style={{ textAlign: "left" }}>
                          {mapping.note ?? "-"}
                        </Td>
                        <Td>
                          <StatusBadge
                            $variant={mapping.enabled ? "success" : "danger"}
                          >
                            {mapping.enabled ? "활성" : "중지"}
                          </StatusBadge>
                        </Td>
                        <Td>{mapping.updatedAt ?? "-"}</Td>
                        <Td>
                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <Button
                              color="gray"
                              size="sm"
                              onClick={() => openEditModal(mapping)}
                            >
                              수정
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(mapping)}
                              loading={deleteMut.isPending}
                            >
                              삭제
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

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
                align="center"
                dense
              />
            </>
          ) : (
            <EmptyState>
              먼저 상단의 “부품 선택” 버튼을 눌러 관리할 부품을 선택하세요.
            </EmptyState>
          )}
        </SectionCard>

        <CarModelExplorerSection />
      </PageContainer>

      <PartSearchModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSelect={handleSearchPart}
      />

      <CarModelMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        mode={mappingMode}
        part={selectedPart}
        mapping={editingMapping}
        onSubmit={handleSubmitMapping}
        loading={isMutating}
      />

      <CarModelRegisterModal
        isOpen={isCarModelRegisterModalOpen}
        onClose={() => setIsCarModelRegisterModalOpen(false)}
        onSubmit={handleCreateCarModel}
        loading={createCarModelMut.isPending}
      />
    </Layout>
  );
}

const SelectedPartCard = styled.div`
  border: 1px solid #e4e4e7;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  .label {
    display: block;
    font-size: 0.78rem;
    color: #6b7280;
    text-transform: uppercase;
  }

  strong {
    display: block;
    font-size: 1.15rem;
    margin-top: 4px;
  }

  .code {
    display: block;
    color: #4b5563;
    font-size: 0.9rem;
  }
`;

const EmptyState = styled.div`
  padding: 48px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;
