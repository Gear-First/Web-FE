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
import type { RequestStatus } from "./RequestTypes";
import { requestKeys, fetchRequestRecords } from "./RequestApi";

// 필터용 상태 타입: 승인/반려/전체
type StatusFilter = RequestStatus | "ALL";

export default function RequestPage() {
  // 선택된 상태 필터 상태
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "승인", "반려"];

  // 모든 데이터 가져오기
  const { data: allRecords = [], isLoading } = useQuery({
    queryKey: requestKeys.records,
    queryFn: fetchRequestRecords,
    staleTime: 5 * 60 * 1000,
  });

  // 아직 승인되지 않은 발주 요청 목록
  const pendingRecords = allRecords.filter((r) => r.status === "미승인");

  // 처리 완료된 발주 요청 목록 (승인/반려만 포함) + 필터 적용
  const processedRecords = allRecords.filter((r) => {
    if (r.status === "미승인") return false; // 미승인은 제외
    if (status === "ALL") return true; // 전체 보기
    return r.status === status; // 선택된 상태만 보기
  });

  return (
    <Layout>
      <PageContainer>
        {/* 미승인 요청 목록 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>발주 요청 목록</SectionTitle>
              <SectionCaption>
                아직 승인되지 않은 발주 요청들을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          {/* 데이터 로딩 중이면 로딩 표시, 아니면 테이블 */}
          {isLoading ? "로딩중..." : <OrderTable rows={pendingRecords} />}
        </SectionCard>
        {/* 승인/반려 요청 목록 섹션 */}
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>승인 및 반려 목록</SectionTitle>
              <SectionCaption>처리된 요청들을 확인합니다.</SectionCaption>
            </div>
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
          {/* 데이터 로딩 중이면 로딩 표시, 아니면 테이블 */}
          {isLoading ? "로딩중..." : <RequestTable rows={processedRecords} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
