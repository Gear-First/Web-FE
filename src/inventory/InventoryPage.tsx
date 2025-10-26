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
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import InventoryTable from "./components/InventoryTable";
import { inventoryKeys, fetchInventoryRecords } from "./InventoryApi";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";

// 필터 타입 정의: 전체(ALL) 또는 특정 창고 ID
type WarehouseFilter = "ALL" | string;
type AppliedFilters = {
  keyword: string;
};

export default function InventoryPage() {
  // 선택된 창고 상태 관리
  const [warehouse, setWarehouse] = useState<WarehouseFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [applied, setApplied] = useState<AppliedFilters>({
    keyword: "",
  });

  // 모든 데이터 조회
  const { data: records = [], isLoading: loadingR } = useQuery({
    queryKey: inventoryKeys.records,
    queryFn: fetchInventoryRecords,
    staleTime: 5 * 60 * 1000,
  });

  // 재고 데이터에서 고유한 창고 리스트 추출 (useMemo를 사용하여 records가 바뀔 때만 계산)
  const warehouseList = useMemo(
    () => Array.from(new Set(records.map((r) => r.warehouseId))),
    [records]
  );

  // 필터링된 데이터 (창고 + 검색어)
  const filteredRecords = useMemo(() => {
    let result = records;

    // 창고 필터
    if (warehouse !== "ALL") {
      result = result.filter((r) => r.warehouseId === warehouse);
    }

    // 검색어 필터
    if (applied.keyword.trim()) {
      const keywordLower = applied.keyword.toLowerCase();
      result = result.filter((r) => {
        const hay = `${r.inventoryCode ?? ""} ${
          r.inventoryName ?? ""
        }`.toLowerCase();
        return hay.includes(keywordLower);
      });
    }

    return result;
  }, [records, warehouse, applied]);

  // 검색 버튼 클릭 시 적용
  const onSearch = () => {
    setApplied({ keyword: keyword.trim() });
  };

  // 초기화 버튼 클릭 시
  const onReset = () => {
    setKeyword("");
    setApplied({ keyword: "" });
    setWarehouse("ALL");
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
            <FilterGroup>
              <Select
                value={warehouse}
                onChange={(e) =>
                  setWarehouse(e.target.value as WarehouseFilter)
                }
              >
                <option value="ALL">전체 창고</option>
                {warehouseList.map((wh) => (
                  <option key={wh} value={wh}>
                    {wh}
                  </option>
                ))}
              </Select>
              {/* 검색어 */}
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
          {loadingR ? "로딩중..." : <InventoryTable rows={filteredRecords} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
