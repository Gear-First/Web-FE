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
import OutboundTable from "./components/OutboundTable";
import type { OutboundStatus } from "./OutboundTypes";
import { outboundKeys, fetchOutboundRecords } from "./OutboundApi";

type StatusFilter = OutboundStatus | "ALL";

export default function OutboundPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "대기", "진행중", "완료"];

  const { data: records = [], isLoading: loadingR } = useQuery({
    queryKey: outboundKeys.records,
    queryFn: fetchOutboundRecords,
    select: (rows) =>
      status === "ALL" ? rows : rows.filter((r) => r.status === status),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>출고 관리</SectionTitle>
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
          {loadingR ? "로딩중..." : <OutboundTable rows={records} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
