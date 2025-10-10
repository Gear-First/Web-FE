import React from "react";
import Layout from "../components/common/Layout";
import {
  FilterGroup,
  PageContainer,
  SectionCard,
  SectionCaption,
  SectionHeader,
  SectionTitle,
  Select,
  Table,
  Td,
  Th,
} from "../components/common/PageLayout";
import { useMRPViewModel } from "../viewmodels/MRPViewModel";

const MRPPage: React.FC = () => {
  const {
    dateOptions,
    productOptions,
    selectedDate,
    setSelectedDate,
    selectedProduct,
    setSelectedProduct,
    filteredPlans,
  } = useMRPViewModel();

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>생산 계획</SectionTitle>
              <SectionCaption>
                제품별 생산 일정과 계획 수량을 확인합니다.
              </SectionCaption>
            </div>
            <FilterGroup>
              <Select
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              >
                {dateOptions.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </Select>
              <Select
                value={selectedProduct}
                onChange={(event) => setSelectedProduct(event.target.value)}
              >
                {productOptions.map((product) => (
                  <option key={product.value} value={product.value}>
                    {product.label}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>제품 코드</Th>
                <Th>제품명</Th>
                <Th>생산 계획 수량</Th>
                <Th>계획 시작일</Th>
                <Th>계획 종료일</Th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan.id}>
                  <Td>{plan.productCode}</Td>
                  <Td>{plan.productName}</Td>
                  <Td>{plan.plannedQuantity.toLocaleString()} EA</Td>
                  <Td>{plan.plannedStartDate}</Td>
                  <Td>{plan.plannedEndDate}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SectionCard>
      </PageContainer>
    </Layout>
  );
};

export default MRPPage;
