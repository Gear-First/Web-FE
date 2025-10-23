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
import type { PartCate } from "./BOMTypes";
import BOMTable from "./components/BOMTable";
import { useQuery } from "@tanstack/react-query";
import { bomKeys, fetchBOMRecords } from "./BOMApi";
import Button from "../components/common/Button";
import BOMRegisterModal from "./components/BOMRegisterModal";

type CateFilter = PartCate | "ALL";

export default function BOMPage() {
  const [cate, setCate] = useState<CateFilter>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cateOptions: CateFilter[] = [
    "ALL",
    "카테고리 A",
    "카테고리 B",
    "카테고리 C",
    "카테고리 D",
  ];

  const { data: records = [], isLoading: loadingR } = useQuery({
    queryKey: [...bomKeys.records, cate],
    queryFn: fetchBOMRecords,
    select: (rows) =>
      cate === "ALL" ? rows : rows.filter((r) => r.category === cate),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <Layout>
        <PageContainer>
          <SectionCard>
            <SectionHeader>
              <div>
                <SectionTitle>BOM</SectionTitle>
                <SectionCaption>
                  자재 소요량 산출 및 계획을 관리합니다.
                </SectionCaption>
              </div>

              <FilterGroup>
                <Select
                  value={cate}
                  onChange={(e) => setCate(e.target.value as CateFilter)}
                >
                  {cateOptions.map((cate) => (
                    <option key={cate} value={cate}>
                      {cate === "ALL" ? "전체 카테고리" : cate}
                    </option>
                  ))}
                </Select>

                <Button onClick={() => setIsModalOpen(true)}>등록</Button>
              </FilterGroup>
            </SectionHeader>

            {loadingR ? "로딩중..." : <BOMTable rows={records} />}
          </SectionCard>
        </PageContainer>
      </Layout>
      <BOMRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      ></BOMRegisterModal>
    </>
  );
}
