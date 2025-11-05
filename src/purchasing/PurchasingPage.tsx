import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  FilterGroup,
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
import resetIcon from "../assets/reset.svg";

export default function PurchasingPage() {
  const queryClient = useQueryClient();

  const [pageAll, setPageAll] = useState(1);
  const [pageSizeAll, setPageSizeAll] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const { data: allCompaniesData, fetchStatus: fetchAllStatus } = useQuery({
    queryKey: ["companyList", "all", pageAll, pageSizeAll, appliedKeyword],
    queryFn: () =>
      fetchCompanyList({
        keyword: appliedKeyword,
        page: pageAll - 1,
        size: pageSizeAll,
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
    setPageAll(1);
  };

  const onReset = () => {
    setKeyword("");
    setAppliedKeyword("");
    setPageAll(1);
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
  const [pageSelected, setPageSelected] = useState(1);
  const [pageSizeSelected, setPageSizeSelected] = useState(10);
  const [keywordSelected, setKeywordSelected] = useState("");
  const [appliedKeywordSelected, setAppliedKeywordSelected] = useState("");

  const { data: selectedCompaniesData, fetchStatus: fetchSelectedStatus } =
    useQuery({
      queryKey: [
        "companyList",
        true,
        pageSelected,
        pageSizeSelected,
        appliedKeywordSelected,
      ],
      queryFn: () =>
        fetchCompanyList({
          keyword: appliedKeywordSelected,
          isSelected: true,
          page: pageSelected - 1,
          size: pageSizeSelected,
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
          (sum, record) => sum + Number(record.purchasingPrice ?? 0),
          0
        ) / allCompanies.length
      )
    : 0;
  const coverageRate = totalAll > 0
    ? Math.round((totalSelected / totalAll) * 100)
    : 0;

  const onSearchSelected = () => {
    setAppliedKeywordSelected(keywordSelected.trim());
    setPageSelected(1);
  };
  const onResetSelected = () => {
    setKeywordSelected("");
    setAppliedKeywordSelected("");
    setPageSelected(1);
  };

  return (
    <Layout>
      <PageContainer>
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>등록된 업체</SummaryLabel>
            <SummaryValue>
              {isFetchingAll ? "· · ·" : totalAll.toLocaleString()}
            </SummaryValue>
            <SummaryNote>전체 공급 네트워크 규모</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>선정 업체</SummaryLabel>
            <SummaryValue>
              {isFetchingSelected ? "· · ·" : totalSelected.toLocaleString()}
            </SummaryValue>
            <SummaryNote>선정 비율 {coverageRate}%</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>평균 단가</SummaryLabel>
            <SummaryValue>
              ₩
              {isFetchingAll ? "· · ·" : avgPrice.toLocaleString()}
            </SummaryValue>
            <SummaryNote>조회된 업체 기준</SummaryNote>
          </SummaryCard>
        </SummaryGrid>
        {/* 등록된 업체 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>등록된 업체</SectionTitle>
              <SectionCaption>조회된 전체 목록</SectionCaption>
            </div>
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
          </SectionHeader>

          <FilterGroup>
            <Button variant="icon" onClick={onReset}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              onReset={onReset}
              placeholder="자재명 / 업체명 검색"
            />
          </FilterGroup>

          {/* 로딩중에도 테이블 유지 */}
          <PurchasingTable
            rows={allCompanies}
            showContractDate={false}
            showOrderCount={false}
            onRowClick={(r) => {
              setSelectedRecord(r);
              setModalMode("view");
              setIsModalOpen(true);
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {isFetchingAll && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

          <Pagination
            page={pageAll}
            totalPages={Math.max(1, totalPagesAll)}
            onChange={(next) => setPageAll(next)}
            isBusy={isFetchingAll}
            maxButtons={5}
            totalItems={totalAll}
            pageSize={pageSizeAll}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={(n) => {
              setPageSizeAll(n);
              setPageAll(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>

        {/* 등록 모달 */}
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

        {/* 공급업체 선정 섹션 */}
        <SourcingSection />

        {/* 선정된 업체 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>선정된 업체</SectionTitle>
              <SectionCaption>
                isSelected=true 조건으로 조회된 목록
              </SectionCaption>
            </div>
          </SectionHeader>

          <FilterGroup>
            <Button variant="icon" onClick={onResetSelected}>
              <img src={resetIcon} width={18} height={18} alt="초기화" />
            </Button>
            <SearchBox
              keyword={keywordSelected}
              onKeywordChange={setKeywordSelected}
              onSearch={onSearchSelected}
              onReset={onResetSelected}
              placeholder="자재명 / 업체명 검색"
            />
          </FilterGroup>

          {/* 로딩중에도 테이블 유지 */}
          <PurchasingTable
            rows={selectedCompanies}
            showContractDate={true}
            showOrderCount={true}
            onRowClick={(r) => {
              setSelectedRecord(r);
              setModalMode("view");
              setIsModalOpen(true);
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {isFetchingSelected && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

          <Pagination
            page={pageSelected}
            totalPages={Math.max(1, totalPagesSelected)}
            onChange={(next) => setPageSelected(next)}
            isBusy={isFetchingSelected}
            maxButtons={5}
            totalItems={totalSelected}
            pageSize={pageSizeSelected}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={(n) => {
              setPageSizeSelected(n);
              setPageSelected(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
