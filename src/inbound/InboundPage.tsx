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
import type { InboundStatus } from "./InboundTypes";
import { useQuery } from "@tanstack/react-query";
import { fetchInboundRecords, inboundKeys } from "./InboundApi";
import InboundTable from "./components/InboundTable";

type StatusFilter = InboundStatus | "ALL";

export default function InboundPage() {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const statusOptions: StatusFilter[] = ["ALL", "합격", "보류", "불합격"];

  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
    startDate: null,
    endDate: null,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 서버(=MSW) 필터로 위임: queryKey에 파라미터를 전부 포함
  const params = {
    status,
    q: applied.keyword || undefined,
    startDate: applied.startDate || undefined,
    endDate: applied.endDate || undefined,
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<ListResponse<InboundRecord[]>, Error>({
    queryKey: [...inboundKeys.records, params],
    queryFn: () => fetchInboundRecords(params),
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

          {loadingR ? "로딩중..." : <InboundTable rows={records} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
