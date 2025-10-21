import { useState } from "react";
import Layout from "../components/common/Layout";
import {
  FilterGroup,
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  Select,
} from "../components/common/PageLayout";
import type { QualityStatus } from "./InboundTypes";
import { useQuery } from "@tanstack/react-query";
import { fetchInboundRecords, inboundKeys } from "./InboundApi";
import InboundTable from "./components/InboundTable";

type QualityFilter = QualityStatus | "ALL";

export default function InboundPage() {
  const [status, setStatus] = useState<QualityFilter>("ALL");
  const statusOptions: QualityFilter[] = ["ALL", "합격", "보류", "불합격"];

  const { data: records = [], isLoading: loadingR } = useQuery({
    queryKey: inboundKeys.records,
    queryFn: fetchInboundRecords,
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
              <SectionTitle>입고 관리</SectionTitle>
              <SectionCaption>
                입고된 자재의 검수 상태와 보관 위치를 확인합니다.
              </SectionCaption>
            </div>
            <FilterGroup>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as QualityFilter)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체" : opt}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </SectionHeader>

          {loadingR ? "로딩중..." : <InboundTable rows={records} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
