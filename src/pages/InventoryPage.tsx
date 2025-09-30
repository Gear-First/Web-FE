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
  StatusBadge,
  Table,
  Td,
  Th,
} from "../components/common/PageLayout";
import { useReceivingStorageViewModel } from "../viewmodels/InventoryViewModel";
import type { QualityStatus } from "../models/erp";

const qualityVariant: Record<QualityStatus, "success" | "warning" | "danger"> =
  {
    합격: "success",
    보류: "warning",
    불합격: "danger",
  };

const InventoryPage: React.FC = () => {
  const {
    locationOptions,
    qualityFilter,
    setQualityFilter,
    locationFilter,
    setLocationFilter,
    filteredRecords,
    inventorySnapshot,
  } = useReceivingStorageViewModel();

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>입고 및 검수 내역</SectionTitle>
              <SectionCaption>
                입고된 자재의 검수 상태와 보관 위치를 확인합니다.
              </SectionCaption>
            </div>
            <FilterGroup>
              <Select
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "전체 위치" : option}
                  </option>
                ))}
              </Select>
              <Select
                value={qualityFilter}
                onChange={(event) =>
                  setQualityFilter(event.target.value as QualityStatus | "ALL")
                }
              >
                {["ALL", "합격", "보류", "불합격"].map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "전체 상태" : option}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>입고 번호</Th>
                <Th>자재</Th>
                <Th>입고 수량</Th>
                <Th>입고 일자</Th>
                <Th>보관 창고</Th>
                <Th>검수 상태</Th>
                <Th>LOT 번호</Th>
                <Th>검수자</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <Td>{record.id}</Td>
                  <Td>
                    <div>{record.materialName}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {record.materialCode}
                    </div>
                  </Td>
                  <Td>
                    {record.quantityReceived.toLocaleString()} {record.unit}
                  </Td>
                  <Td>{record.receivedDate}</Td>
                  <Td>{record.storageLocation}</Td>
                  <Td>
                    <StatusBadge
                      $variant={qualityVariant[record.qualityStatus]}
                    >
                      {record.qualityStatus}
                    </StatusBadge>
                  </Td>
                  <Td>{record.lotNumber}</Td>
                  <Td>{record.inspector}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>재고 관리</SectionTitle>
              <SectionCaption>
                소재지별 재고 수준과 안전재고 대비 상태를 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>Lot 번호</Th>
                <Th>부품명</Th>
                <Th>보관 창고</Th>
                <Th>현재고 수량</Th>
                <Th>안전 재고 수량</Th>
                <Th>품질 상태</Th>
                <Th>입고 일자</Th>
              </tr>
            </thead>
            <tbody>
              {inventorySnapshot.map((snapshot) => {
                const shortage = snapshot.onHand < snapshot.safetyStock;
                return (
                  <tr key={snapshot.materialCode}>
                    <Td>{snapshot.materialCode}</Td>
                    <Td>{snapshot.materialName}</Td>
                    <Td>{snapshot.location}</Td>
                    <Td>{snapshot.onHand.toLocaleString()}</Td>
                    <Td>{snapshot.safetyStock.toLocaleString()}</Td>
                    <Td>
                      {shortage ? (
                        <StatusBadge $variant="danger">보충 필요</StatusBadge>
                      ) : (
                        <StatusBadge $variant="success">안정</StatusBadge>
                      )}
                    </Td>
                    <Td>{snapshot.lastUpdated}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </SectionCard>
      </PageContainer>
    </Layout>
  );
};

export default InventoryPage;
