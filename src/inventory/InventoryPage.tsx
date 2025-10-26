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

// 필터 타입 정의: 전체(ALL) 또는 특정 창고 ID
type WarehouseFilter = "ALL" | string;

export default function InventoryPage() {
  // 선택된 창고 상태 관리
  const [warehouse, setWarehouse] = useState<WarehouseFilter>("ALL");

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

  // 선택된 창고에 따른 필터링
  const filteredRecords = useMemo(() => {
    if (warehouse === "ALL") return records; // 전체 선택 시 원본 데이터 반환
    return records.filter((r) => r.warehouseId === warehouse); // 특정 창고 필터
  }, [records, warehouse]);

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
            </FilterGroup>
          </SectionHeader>
          {loadingR ? "로딩중..." : <InventoryTable rows={filteredRecords} />}
        </SectionCard>
      </PageContainer>
    </Layout>
  );
}
