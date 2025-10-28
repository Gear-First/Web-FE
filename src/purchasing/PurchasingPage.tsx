import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
} from "../components/common/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { purchasingKeys, fetchPurchasingRecords } from "./PurchasingApi";
import type { PurchasingRecord } from "./PurchasingTypes";
import PurchasingTable from "./components/PurchasingTable";
import { useMemo, useState } from "react";
import SourcingSection from "./components/SourcingSection";
import Button from "../components/common/Button";
import PurchasingRegisterModal from "./components/PurchasingModal";

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
          onSubmit={(data) => {
            console.log("저장/등록 데이터:", data);
            setIsModalOpen(false);
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
