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
import PropertyTable from "./components/PropertyTable";
import { fetchPropertyRecords } from "./PropertyApi";
import type { PropertyResponse } from "./PropertyTypes";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import Pagination from "../components/common/Pagination";

export default function PropertyPage() {
  // 입력 상태
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: propertyData, fetchStatus } = useQuery<PropertyResponse>({
    queryKey: ["property-records", page, pageSize, appliedKeyword],
    queryFn: () =>
      fetchPropertyRecords({
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
  const items = propertyData?.data.items ?? [];
  const totalItems = propertyData?.data.total ?? 0;

  const assetValue = items.reduce(
    (sum, item) =>
      sum +
      (item.price ?? item.partPrice ?? 0) * (item.onHandQty ?? item.partQuantity ?? 0),
    0
  );
  const avgUnit =
    items.length > 0
      ? Math.round(
          items.reduce(
            (sum, i) => sum + (i.price ?? i.partPrice ?? 0),
            0
          ) / items.length
        )
      : 0;

  return (
    <Layout>
      <PageContainer>
        <SummaryGrid>
          <SummaryCard>
            <SummaryLabel>총 자산 항목</SummaryLabel>
            <SummaryValue>
              {fetchStatus === "fetching"
                ? "· · ·"
                : totalItems.toLocaleString()}
            </SummaryValue>
            <SummaryNote>필터 기준 자산 등록 건수</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>표본 자산 가치</SummaryLabel>
            <SummaryValue>
              ₩
              {fetchStatus === "fetching"
                ? "· · ·"
                : assetValue.toLocaleString()}
            </SummaryValue>
            <SummaryNote>현재 페이지의 총 금액 합계</SummaryNote>
          </SummaryCard>
          <SummaryCard>
            <SummaryLabel>평균 단가</SummaryLabel>
            <SummaryValue>
              ₩{fetchStatus === "fetching" ? "· · ·" : avgUnit.toLocaleString()}
            </SummaryValue>
            <SummaryNote>표본 기준 평균 단가</SummaryNote>
          </SummaryCard>
        </SummaryGrid>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>자산 관리</SectionTitle>
              <SectionCaption>
                부품별 재고 수량과 총 자산 금액을 조회할 수 있습니다
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

          <PropertyTable rows={propertyData?.data.items ?? []} />

          {/* 로딩 표시 */}
          <div style={{ height: 18, marginTop: 8, marginBottom: 12 }}>
            {fetchStatus === "fetching" && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
            )}
          </div>

          <Pagination
            page={page}
            totalPages={Math.ceil(
              (propertyData?.data.total ?? 1) / (propertyData?.data.size ?? 10)
            )}
            onChange={setPage}
            isBusy={fetchStatus === "fetching"}
            totalItems={propertyData?.data.total ?? 0}
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
