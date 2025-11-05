import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  FilterGroup,
} from "../components/common/PageLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PartTable from "./components/PartTable";
import { fetchPartRecords } from "./PartApi";
import SearchBox from "../components/common/SearchBox";
import Button from "../components/common/Button";
import resetIcon from "../assets/reset.svg";
import searchIcon from "../assets/search.svg";
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
        warehouseCode: appliedKeyword,
        partKeyword: "",
        supplierName: "",
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
