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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PartTable from "./components/PartTable";
import { fetchPartRecords } from "./PartApi";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import Pagination from "../components/common/Pagination";

export default function PartPage() {
  // 입력 상태
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: partData, fetchStatus: fetchStatus } = useQuery({
    queryKey: ["part-records", page, pageSize, appliedKeyword],
    queryFn: () =>
      fetchPartRecords({
        q: appliedKeyword,
        page: page - 1,
        size: pageSize,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const onSearch = () => {
    setAppliedKeyword(keyword.trim());
    setPage(1);
  };

  const onReset = () => {
    setKeyword("");
    setAppliedKeyword("");
    setPage(1);
  };

  const items = partData?.data.items ?? [];
  const totalItems = partData?.data.total ?? 0;
  const lowStockCount = items.filter((r) => r.lowStock).length;
  const avgQty =
    items.length > 0
      ? Math.round(
          items.reduce((sum, item) => sum + item.onHandQty, 0) / items.length
        )
      : 0;

  return (
    <Layout>
      <PageContainer>
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>총 재고 품목</SummaryLabel>
            <SummaryValue>
              {fetchStatus === "fetching"
                ? "· · ·"
                : totalItems.toLocaleString()}
            </SummaryValue>
            <SummaryNote>창고 전체 등록 품목 수</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>안전재고 이하</SummaryLabel>
            <SummaryValue>{lowStockCount.toLocaleString()}</SummaryValue>
            <SummaryNote>보충 필요 품목 비중</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>평균 보유 수량</SummaryLabel>
            <SummaryValue>
              {fetchStatus === "fetching" ? "· · ·" : avgQty.toLocaleString()}
            </SummaryValue>
            <SummaryNote>표본 기준 가용 재고</SummaryNote>
          </SummaryCard>
        </SummaryGrid>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>재고 관리</SectionTitle>
              <SectionCaption>
                창고별 부품 재고 현황을 확인합니다.
              </SectionCaption>
            </div>
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
              placeholder="창고 / 대리점 / 부품코드 / 부품명 검색"
            />
          </FilterGroup>

          <PartTable rows={partData?.data.items ?? []} />

          {/* 로딩 표시 */}
          <div style={{ height: 18, marginTop: 8, marginBottom: 12 }}>
            {fetchStatus === "fetching" && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
            )}
          </div>

          <Pagination
            page={page}
            totalPages={Math.ceil(
              (partData?.data.total ?? 1) / (partData?.data.size ?? 10)
            )}
            onChange={setPage}
            isBusy={fetchStatus === "fetching"}
            totalItems={partData?.data.total ?? 0}
            pageSize={pageSize}
            onChangePageSize={(n) => {
              setPageSize(n);
              setPage(1);
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
