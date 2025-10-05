import Layout from "../components/common/Layout";
import {
  FilterGroup,
  PageContainer,
  SectionCaption,
  SectionCard,
  SectionHeader,
  SectionTitle,
  Select,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../components/common/PageLayout";
import type { IssuanceStatus } from "../models/erp";
import { useIssuanceViewModel } from "../viewmodels/IssuanceViewModel";

const statusVariant: Record<IssuanceStatus, "warning" | "info" | "success"> = {
  대기: "warning",
  진행중: "info",
  완료: "success",
};

const scheduleVariant = {
  준비완료: "success" as const,
  자재부족: "danger" as const,
};

const IssuancePage = () => {
  const {
    statusOptions,
    statusFilter,
    setStatusFilter,
    filteredRecords,
    schedule,
  } = useIssuanceViewModel();

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>자재 출고 기록</SectionTitle>
              <SectionCaption>
                작업 지시별 자재 출고 이력을 추적하고 현황을 확인합니다.
              </SectionCaption>
            </div>
            <FilterGroup>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as IssuanceStatus | "ALL")
                }
              >
                {statusOptions.map((option) => {
                  return (
                    <option key={option} value={option}>
                      {option === "ALL" ? "전체" : option}
                    </option>
                  );
                })}
              </Select>
            </FilterGroup>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>출고 번호</Th>
                <Th>자재</Th>
                <Th>수량</Th>
                <Th>출고일</Th>
                <Th>작업 지시</Th>
                <Th>출고 대상</Th>
                <Th>담당자</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <Td>{record.id}</Td>
                  <Td>
                    <div>{record.inventoryName}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {record.inventoryCode}
                    </div>
                  </Td>
                  <Td>{record.quantity.toLocaleString()}</Td>
                  <Td>{record.issuedDate}</Td>
                  <Td>{record.workOrderCode}</Td>
                  <Td>{record.destination}</Td>
                  <Td>{record.handledBy}</Td>
                  <Td>
                    <StatusBadge $variant={statusVariant[record.status]}>
                      {record.status}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>출고 예정</SectionTitle>
              <SectionCaption>
                향후 작업 지시별 자재 준비 상태를 점검합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>작업 지시</Th>
                <Th>제품</Th>
                <Th>필요 일자</Th>
                <Th>준비 자재 수</Th>
                <Th>상태</Th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.workOrder}>
                  <Td>{item.workOrder}</Td>
                  <Td>{item.inventoryName}</Td>
                  <Td>{item.requiredDate}</Td>
                  <Td>{item.preparedQuantity}</Td>
                  <Td>
                    <StatusBadge
                      $variant={scheduleVariant[item.status] ?? "info"}
                    >
                      {item.status}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SectionCard>
      </PageContainer>
    </Layout>
  );
};

export default IssuancePage;
