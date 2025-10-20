// src/features/issuance/page.tsx
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
import IssuanceTable from "./components/IssuanceTable";
import ScheduleTable from "./components/ScheduleTable";
import type { IssuanceStatus } from "./IssuanceTypes";
import {
  issuanceKeys,
  fetchIssuanceRecords,
  fetchIssuanceSchedule,
} from "./IssuanceApi";

type StatusFilter = IssuanceStatus | "ALL";

export default function IssuancePage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "대기", "진행중", "완료"];

  const { data: records = [], isLoading: loadingR } = useQuery({
    queryKey: issuanceKeys.records,
    queryFn: fetchIssuanceRecords,
    select: (rows) =>
      status === "ALL" ? rows : rows.filter((r) => r.status === status),
    staleTime: 5 * 60 * 1000,
  });

  const { data: schedule = [], isLoading: loadingS } = useQuery({
    queryKey: issuanceKeys.schedule,
    queryFn: fetchIssuanceSchedule,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>자재 출고 기록</SectionTitle>
              <SectionCaption>
                작업 지시별 자재 출고 이력을 추적하고 현황을 확인합니다.
              </SectionCaption>
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

          {loadingR ? "로딩중..." : <IssuanceTable rows={records} />}
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>자재 출고 예정</SectionTitle>
              <SectionCaption>
                향후 작업 지시별 자재 준비 상태를 점검합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          {loadingS ? "로딩중..." : <ScheduleTable rows={schedule} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
