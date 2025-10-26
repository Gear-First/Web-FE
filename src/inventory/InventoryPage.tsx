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
import InventoryTable from "./components/InventoryTable";
import {
  fetchInventoryRecords,
  inventoryKeys,
  type InventoryQueryParams,
  type ListResponse,
} from "./InventoryApi";
import type { InventoryRecord } from "./InventoryTypes";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";
import Pagination from "../components/common/Pagination";

type WarehouseFilter = "ALL" | string;

export default function InventoryPage() {
  // 입력 상태
  const [warehouse, setWarehouse] = useState<WarehouseFilter>("ALL");
  const [keyword, setKeyword] = useState("");

  // 적용 상태(검색 버튼으로 확정)
  const [appliedKeyword, setAppliedKeyword] = useState("");

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 서버(=MSW)로 위임할 파라미터
  const params: InventoryQueryParams = {
    warehouse: warehouse !== "ALL" ? warehouse : undefined,
    keyword: appliedKeyword || undefined,
    page,
    pageSize,
  };

  const { data, fetchStatus, isLoading } = useQuery<
    ListResponse<InventoryRecord[]>,
    Error
  >({
    queryKey: [...inventoryKeys.records, params],
    queryFn: () => fetchInventoryRecords(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev, // 페이지 전환시 화면 유지
  });

  const isFetching = fetchStatus === "fetching";

  // 서버 응답 사용
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);
  const warehouses = data?.facets?.warehouses ?? [];

  const onSearch = () => {
    setAppliedKeyword(keyword.trim());
    setPage(1);
  };

  const onReset = () => {
    setWarehouse("ALL");
    setKeyword("");
    setAppliedKeyword("");
    setPage(1);
  };

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>재고 관리</SectionTitle>
              <SectionCaption>
                창고별 부품 재고 현황을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <SectionHeader style={{ justifyContent: "flex-end" }}>
            <FilterGroup>
              {/* 창고 옵션: 서버 facets 기준 */}
              <Select
                value={warehouse}
                onChange={(e) => {
                  setWarehouse(e.target.value as WarehouseFilter);
                  setPage(1);
                }}
              >
                <option value="ALL">전체 창고</option>
                {warehouses.map((wh) => (
                  <option key={wh} value={wh}>
                    {wh}
                  </option>
                ))}
              </Select>
              <SearchBox
                keyword={keyword}
                onKeywordChange={setKeyword}
                onSearch={onSearch}
                onReset={onReset}
                placeholder="부품코드 / 부품명 검색"
              />
              <Button variant="icon" onClick={onSearch}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onReset}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>

          <InventoryTable rows={items} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {(isLoading || isFetching) && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            isBusy={isFetching}
            maxButtons={5}
            totalItems={total}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
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
