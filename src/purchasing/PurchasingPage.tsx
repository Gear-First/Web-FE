import PurchasingCompareModal from "./components/PurchasingCompareModal";

import {
  SummaryGrid,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
  SummaryNote,
} from "../components/common/PageLayout";
import SearchBox from "../components/common/SearchBox";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addCompany, fetchCompanyList } from "./PurchasingApi";
import type { PurchasingRecord } from "./PurchasingTypes";
import PurchasingTable from "./components/PurchasingTable";
import { useState } from "react";
import SourcingSection from "./components/SourcingSection";
import Button from "../components/common/Button";
import PurchasingRegisterModal from "./components/PurchasingModal";
import Pagination from "../components/common/Pagination";
import Page from "../components/common/Page";
import PageSection from "../components/common/sections/PageSection";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import { usePagination } from "../hooks/usePagination";

export default function PurchasingPage() {
  const queryClient = useQueryClient();

  const allPagination = usePagination(1, 10);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const { data: allCompaniesData, fetchStatus: fetchAllStatus } = useQuery({
    queryKey: [
      "companyList",
      "all",
      allPagination.page,
      allPagination.pageSize,
      appliedKeyword,
    ],
    queryFn: () =>
      fetchCompanyList({
        keyword: appliedKeyword,
        page: allPagination.page - 1,
        size: allPagination.pageSize,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const allCompanies = allCompaniesData?.data ?? [];
  const totalAll = allCompaniesData?.meta?.total ?? 0;
  const totalPagesAll = allCompaniesData?.meta?.totalPages ?? 1;
  const isFetchingAll = fetchAllStatus === "fetching";

  const onSearch = () => {
    setAppliedKeyword(keyword.trim());
    allPagination.resetPage();
  };

  const onReset = () => {
    setKeyword("");
    setAppliedKeyword("");
    allPagination.resetPage();
  };

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PurchasingRecord | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"register" | "view" | "edit">(
    "register"
  );

  /** 선정된 업체 (isSelected=true) */
  const selectedPagination = usePagination(1, 10);
  const [keywordSelected, setKeywordSelected] = useState("");
  const [appliedKeywordSelected, setAppliedKeywordSelected] = useState("");

  const { data: selectedCompaniesData, fetchStatus: fetchSelectedStatus } =
    useQuery({
      queryKey: [
        "companyList",
        true,
        selectedPagination.page,
        selectedPagination.pageSize,
        appliedKeywordSelected,
      ],
      queryFn: () =>
        fetchCompanyList({
          keyword: appliedKeywordSelected,
          isSelected: true,
          page: selectedPagination.page - 1,
          size: selectedPagination.pageSize,
        }),
      staleTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev,
    });

  const selectedCompanies = selectedCompaniesData?.data ?? [];
  const totalSelected = selectedCompaniesData?.meta?.total ?? 0;
  const totalPagesSelected = selectedCompaniesData?.meta?.totalPages ?? 1;
  const isFetchingSelected = fetchSelectedStatus === "fetching";

  const avgPrice = allCompanies.length
    ? Math.round(
        allCompanies.reduce(
          (sum: number, record: PurchasingRecord) =>
            sum + Number(record.purchasingPrice ?? 0),
          0
        ) / allCompanies.length
      )
    : 0;
  const coverageRate =
    totalAll > 0 ? Math.round((totalSelected / totalAll) * 100) : 0;

  const onSearchSelected = () => {
    setAppliedKeywordSelected(keywordSelected.trim());
    selectedPagination.resetPage();
  };
  const onResetSelected = () => {
    setKeywordSelected("");
    setAppliedKeywordSelected("");
    selectedPagination.resetPage();
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 3) {
        alert("최대 3개까지만 선택할 수 있습니다.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedForCompare = allCompanies.filter((r: PurchasingRecord) =>
    selectedIds.includes(r.purchasingId)
  );

  return (
    <Page>
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>등록된 업체</SummaryLabel>
          <SummaryValue>
            {isFetchingAll ? "0" : totalAll.toLocaleString()}
          </SummaryValue>
          <SummaryNote>전체 공급 네트워크 규모</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>선정 업체</SummaryLabel>
          <SummaryValue>
            {isFetchingSelected ? "0" : totalSelected.toLocaleString()}
          </SummaryValue>
          <SummaryNote>선정 비율 {coverageRate}%</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>평균 단가</SummaryLabel>
          <SummaryValue>
            ₩{isFetchingAll ? "0" : avgPrice.toLocaleString()}
          </SummaryValue>
          <SummaryNote>조회된 업체 기준</SummaryNote>
        </SummaryCard>
      </SummaryGrid>

      <PageSection
        title="등록된 업체"
        caption="등록된 모든 업체의 정보를 조회합니다."
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              color="gray"
              disabled={selectedIds.length < 2 || selectedIds.length > 3}
              onClick={() => setIsCompareOpen(true)}
            >
              비교하기
            </Button>
            <Button
              color="black"
              onClick={() => {
                setModalMode("register");
                setSelectedRecord(null);
                setIsModalOpen(true);
              }}
            >
              업체 등록
            </Button>
          </div>
        }
        filters={
          <>
            <FilterResetButton onClick={onReset} />
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              onReset={onReset}
              placeholder="자재명 / 업체명 검색"
            />
          </>
        }
        isBusy={isFetchingAll}
        footer={
          <Pagination
            page={allPagination.page}
            totalPages={Math.max(1, totalPagesAll)}
            onChange={allPagination.onChangePage}
            maxButtons={5}
            totalItems={totalAll}
            pageSize={allPagination.pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={allPagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <PurchasingTable
          rows={allCompanies}
          showCheckbox={true}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          showContractDate={false}
          showOrderCount={false}
          onRowClick={(r) => {
            setSelectedRecord(r);
            setModalMode("view");
            setIsModalOpen(true);
          }}
        />
      </PageSection>

      <SourcingSection />

      <PageSection
        title="선정된 업체"
        caption="선정된 업체 목록을 확인합니다."
        filters={
          <>
            <FilterResetButton onClick={onResetSelected} />
            <SearchBox
              keyword={keywordSelected}
              onKeywordChange={setKeywordSelected}
              onSearch={onSearchSelected}
              onReset={onResetSelected}
              placeholder="자재명 / 업체명 검색"
            />
          </>
        }
        isBusy={isFetchingSelected}
        footer={
          <Pagination
            page={selectedPagination.page}
            totalPages={Math.max(1, totalPagesSelected)}
            onChange={selectedPagination.onChangePage}
            maxButtons={5}
            totalItems={totalSelected}
            pageSize={selectedPagination.pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={selectedPagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <PurchasingTable
          rows={selectedCompanies}
          showCheckbox={false}
          showContractDate={true}
          showOrderCount={true}
          onRowClick={(r) => {
            setSelectedRecord(r);
            setModalMode("view");
            setIsModalOpen(true);
          }}
        />
        <PurchasingCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          records={selectedForCompare}
        />
      </PageSection>

      <PurchasingRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedRecord ?? undefined}
        mode={modalMode}
        onSubmit={async (data) => {
          try {
            const payload = {
              materialId: data.materialId,
              materialCode: data.materialCode ?? "",
              materialName: data.materialName,
              price: data.purchasingPrice,
              companyName: data.company,
              quantity: data.requiredQuantityPerPeriod,
              spentDay: data.requiredPeriodInDays,
              surveyDate: data.surveyDate,
              untilDate: data.expiryDate,
            };
            const res = await addCompany(payload);
            if (res.success) {
              alert("업체 등록이 완료되었습니다.");
              setIsModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["companyList"] });
            } else {
              alert("등록 실패: " + res.message);
            }
          } catch {
            alert("등록 중 오류가 발생했습니다.");
          }
        }}
      />
    </Page>
  );
}
