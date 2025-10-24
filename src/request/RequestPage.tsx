import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  FilterGroup,
  Select,
} from "../components/common/PageLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OrderTable from "./components/OrderTable";
import RequestTable from "./components/RequestTable";
import type { RequestRecord, RequestStatus } from "./RequestTypes";
import { requestKeys, fetchRequestRecords } from "./RequestApi";
import DetailModal from "./components/RequestModal";

type StatusFilter = RequestStatus | "ALL";

export default function RequestPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "승인", "반려"];

  // 단일 모달 상태: 선택 레코드/ 열림 여부/ 모달 모드
  const [selectedRecord, setSelectedRecord] = useState<RequestRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"order" | "request">(
    "order"
  );

  // 서버에서 전체 요청 목록 조회
  const { data: allRecords = [], isLoading } = useQuery({
    queryKey: requestKeys.records,
    queryFn: fetchRequestRecords,
    staleTime: 5 * 60 * 1000,
  });

  // 미승인 목록
  const pendingRecords = allRecords.filter((r) => r.status === "미승인");

  // 처리완료(승인/반려) 목록
  const processedRecords = allRecords.filter((r) => {
    if (r.status === "미승인") return false; // 미승인 제외
    if (status === "ALL") return true; // 전체
    return r.status === status; // 선택된 상태만
  });

  // 행 클릭 핸들러: 미승인 -> 발주 상세
  const handleOpenOrder = (rec: RequestRecord) => {
    setSelectedRecord(rec);
    setModalVariant("order");
    setIsModalOpen(true);
  };

  // 행 클릭 핸들러: 처리완료 -> 요청 상세
  const handleOpenRequest = (rec: RequestRecord) => {
    setSelectedRecord(rec);
    setModalVariant("request");
    setIsModalOpen(true);
  };

  // 승인/반려 액션
  const handleApprove = (requestId: string, remark?: string) => {
    console.log("승인", requestId, remark);
    // TODO: API 호출
  };
  const handleReject = (requestId: string, remark?: string) => {
    console.log("반려", requestId, remark);
    // TODO: API 호출
  };

  return (
    <Layout>
      <PageContainer>
        {/* 미승인 요청 목록 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>발주 요청 목록</SectionTitle>
              <SectionCaption>
                아직 승인되지 않은 발주 요청들을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          {isLoading ? (
            "로딩중..."
          ) : (
            <OrderTable
              rows={pendingRecords}
              onRowClick={handleOpenOrder} // 발주 모달 오픈
            />
          )}
        </SectionCard>

        {/* 승인/반려 목록 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>승인 및 반려 목록</SectionTitle>
              <SectionCaption>처리된 요청들을 확인합니다.</SectionCaption>
            </div>
            {/* 상태 필터 */}
            <FilterGroup>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체" : opt}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </SectionHeader>
          {isLoading ? (
            "로딩중..."
          ) : (
            <RequestTable
              rows={processedRecords}
              onRowClick={handleOpenRequest} // 요청 모달 오픈
            />
          )}
        </SectionCard>
      </PageContainer>

      {/* 상세 모달 */}
      <DetailModal
        variant={modalVariant}
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // 발주 모드일 때만 승인/반려 버튼을 보이도록 콜백 전달
        onApprove={modalVariant === "order" ? handleApprove : undefined}
        onReject={modalVariant === "order" ? handleReject : undefined}
      />
    </Layout>
  );
}
