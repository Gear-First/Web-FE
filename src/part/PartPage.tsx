import {
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
import Pagination from "../components/common/Pagination";
import Page from "../components/common/Page";
import PageSection from "../components/common/sections/PageSection";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import { usePagination } from "../hooks/usePagination";

export default function PartPage() {
  // 입력 상태
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const {
    page,
    pageSize,
    onChangePage,
    onChangePageSize,
    resetPage,
  } = usePagination(1, 10);

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
    resetPage();
  };

  const onReset = () => {
    setKeyword("");
    setAppliedKeyword("");
    resetPage();
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

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize) || 1
  );

  return (
    <Page>
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

      <PageSection
        title="재고 관리"
        caption="창고별 부품 재고 현황을 확인합니다."
        filters={
          <FilterGroup>
            <FilterResetButton onClick={onReset} />
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              onReset={onReset}
              placeholder="창고 / 대리점 / 부품코드 / 부품명 검색"
            />
          </FilterGroup>
        }
        isBusy={fetchStatus === "fetching"}
        footer={
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={onChangePage}
            totalItems={totalItems}
            pageSize={pageSize}
            onChangePageSize={onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <PartTable rows={items} />
      </PageSection>
    </Page>
  );
}
