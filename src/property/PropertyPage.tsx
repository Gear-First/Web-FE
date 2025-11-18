import {
  SummaryGrid,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
  SummaryNote,
} from "../components/common/PageLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyTable from "./components/PropertyTable";
import { fetchPropertyRecords } from "./PropertyApi";
import type { PropertyResponse } from "./PropertyTypes";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import Pagination from "../components/common/Pagination";
import Page from "../components/common/Page";
import PageSection from "../components/common/sections/PageSection";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import { usePagination } from "../hooks/usePagination";

export default function PropertyPage() {
  // 입력 상태
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const pagination = usePagination(1, 10);

  const { data: propertyData, fetchStatus } = useQuery<PropertyResponse>({
    queryKey: [
      "property-records",
      pagination.page,
      pagination.pageSize,
      appliedKeyword,
    ],
    queryFn: () =>
      fetchPropertyRecords({
        q: appliedKeyword,
        page: pagination.page - 1,
        size: pagination.pageSize,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const onSearch = () => {
    setAppliedKeyword(keyword.trim());
    pagination.resetPage();
  };

  const onReset = () => {
    setKeyword("");
    setAppliedKeyword("");
    pagination.resetPage();
  };
  const items = propertyData?.data.items ?? [];
  const totalItems = propertyData?.data.total ?? 0;

  const assetValue = items.reduce(
    (sum, item) =>
      sum +
      (item.price ?? item.partPrice ?? 0) *
        (item.onHandQty ?? item.partQuantity ?? 0),
    0
  );
  const avgUnit =
    items.length > 0
      ? Math.round(
          items.reduce((sum, i) => sum + (i.price ?? i.partPrice ?? 0), 0) /
            items.length
        )
      : 0;

  return (
    <Page>
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>총 자산 항목</SummaryLabel>
          <SummaryValue>
            {fetchStatus === "fetching" ? "0" : totalItems.toLocaleString()}
          </SummaryValue>
          <SummaryNote>필터 기준 자산 등록 건수</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>표본 자산 가치</SummaryLabel>
          <SummaryValue>
            ₩{fetchStatus === "fetching" ? "0" : assetValue.toLocaleString()}
          </SummaryValue>
          <SummaryNote>현재 페이지의 총 금액 합계</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>평균 단가</SummaryLabel>
          <SummaryValue>
            ₩{fetchStatus === "fetching" ? "0" : avgUnit.toLocaleString()}
          </SummaryValue>
          <SummaryNote>표본 기준 평균 단가</SummaryNote>
        </SummaryCard>
      </SummaryGrid>

      <PageSection
        title="자산 관리"
        caption="부품별 재고 수량과 총 자산 금액을 조회할 수 있습니다"
        filters={
          <>
            <FilterResetButton onClick={onReset} />
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={onSearch}
              onReset={onReset}
              placeholder="창고 / 대리점 / 부품코드 / 부품명 검색"
            />
          </>
        }
        isBusy={fetchStatus === "fetching"}
        footer={
          <Pagination
            page={pagination.page}
            totalPages={Math.ceil(
              (propertyData?.data.total ?? 1) / (propertyData?.data.size ?? 10)
            )}
            onChange={pagination.onChangePage}
            totalItems={propertyData?.data.total ?? 0}
            pageSize={pagination.pageSize}
            onChangePageSize={pagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <PropertyTable rows={propertyData?.data.items ?? []} />
      </PageSection>
    </Page>
  );
}
