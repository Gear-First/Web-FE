import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
} from "../components/common/PageLayout";
import { useQuery } from "@tanstack/react-query";
import type { PurchasingRecord } from "./PurchasingTypes";
import PurchasingTable from "./components/PurchasingTable";
import { useMemo, useState } from "react";
import SourcingSection from "./components/SourcingSection";
import Button from "../components/common/Button";
import PurchasingRegisterModal from "./components/PurchasingModal";
import {
  purchasingKeys,
  fetchPurchasingRecords,
  addCompany,
} from "./PurchasingApi";

export default function PurchasingPage() {
  /** 데이터 fetch */
  const { data: records = [], isLoading: isFetching } = useQuery<
    PurchasingRecord[],
    Error
  >({
    queryKey: purchasingKeys.records,
    queryFn: fetchPurchasingRecords,
  });

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 선택된 레코드 상태 추가
  const [selectedRecord, setSelectedRecord] = useState<PurchasingRecord | null>(
    null
  );

  // 모달 모드 상태 (register | view | edit)
  const [modalMode, setModalMode] = useState<"register" | "view" | "edit">(
    "register"
  );

  // 등록 상태 필터
  const registeredRecords = useMemo(() => {
    return records.filter((r) => r.status === "등록");
  }, [records]);

  // 선정 상태 필터
  const selectedRecords = useMemo(() => {
    return records.filter((r) => r.status === "선정");
  }, [records]);

  return (
    <Layout>
      <PageContainer>
        {/* 등록된 업체 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>등록된 업체</SectionTitle>
              <SectionCaption>자재 견적/발주 레코드</SectionCaption>
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
          <PurchasingTable
            rows={registeredRecords}
            showContractDate={false}
            onRowClick={(r) => {
              setSelectedRecord(r);
              setModalMode("view");
              setIsModalOpen(true);
            }}
          />
        </SectionCard>

        {/* 등록 모달 (현재는 mock용, 서버 연동 시 mutation 사용) */}
        <PurchasingRegisterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={selectedRecord ?? undefined}
          mode={modalMode}
          onSubmit={async (data) => {
            try {
              // 백엔드로 보낼 데이터 변환
              const payload = {
                materialId: 0,
                materialCode: data.materialCode,
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
                // 등록 후 목록 새로고침 (react-query invalidate)
                // import { useQueryClient } from "@tanstack/react-query";
                // const queryClient = useQueryClient();
                // queryClient.invalidateQueries(purchasingKeys.records);
              } else {
                alert("등록 실패: " + res.message);
              }
            } catch (err) {
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
              <SectionTitle>선정 업체</SectionTitle>
              <SectionCaption>자재 견적/발주 레코드</SectionCaption>
            </div>
          </SectionHeader>

          <PurchasingTable rows={selectedRecords} showContractDate={true} />

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
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
