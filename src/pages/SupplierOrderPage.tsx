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
import type { OrderPriority, OrderStatus } from "../models/erp";
import { useSupplierOrderViewModel } from "../viewmodels/SupplierOrderViewModel";

const statusToVariant: Record<OrderStatus, "warning" | "info" | "success"> = {
  요청: "warning",
  협상중: "info",
  발주완료: "success",
};

const priorityToVariant: Record<OrderPriority, "danger" | "warning" | "info"> =
  {
    높음: "danger",
    보통: "warning",
    낮음: "info",
  };

const SupplierOrderPage = () => {
  const {
    statusOptions,
    priorityOptions,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    filteredRequests,
    quotesByRequest,
    purchaseOrdersByRequest,
  } = useSupplierOrderViewModel();

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>구매 요청 현황</SectionTitle>
              <SectionCaption>
                요청부터 발주까지의 진행 상황과 우선순위를 모니터링합니다.
              </SectionCaption>
            </div>
            <FilterGroup>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as typeof statusFilter)
                }
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "전체 상태" : option}
                  </option>
                ))}
              </Select>
              <Select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value as typeof priorityFilter)
                }
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "전체 우선순위" : option}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>요청 번호</Th>
                <Th>자재</Th>
                <Th>요청 수량</Th>
                <Th>요청 부서</Th>
                <Th>요청일</Th>
                <Th>우선순위</Th>
                <Th>상태</Th>
                <Th>선정 업체</Th>
                <Th>발주 상태</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => {
                const purchaseOrder = purchaseOrdersByRequest[request.id];
                return (
                  <tr key={request.id}>
                    <Td>{request.id}</Td>
                    <Td>
                      <div>{request.materialName}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                        {request.materialCode}
                      </div>
                    </Td>
                    <Td>
                      {request.requestedQty.toLocaleString()} {request.unit}
                    </Td>
                    <Td>
                      {request.department}
                      <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                        {request.requester}
                      </div>
                    </Td>
                    <Td>{request.requestedDate}</Td>
                    <Td>
                      <StatusBadge
                        $variant={priorityToVariant[request.priority]}
                      >
                        {request.priority}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <StatusBadge $variant={statusToVariant[request.status]}>
                        {request.status}
                      </StatusBadge>
                    </Td>
                    <Td>{request.selectedVendor ?? "-"}</Td>
                    <Td>
                      {purchaseOrder ? (
                        <StatusBadge
                          $variant={
                            purchaseOrder.status === "발주"
                              ? "info"
                              : purchaseOrder.status === "입고완료"
                              ? "success"
                              : "warning"
                          }
                        >
                          {purchaseOrder.status}
                        </StatusBadge>
                      ) : (
                        "-"
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </SectionCard>

        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>업체 견적 비교</SectionTitle>
              <SectionCaption>
                요청 건별로 수집된 업체 견적과 리드타임을 확인합니다.
              </SectionCaption>
            </div>
          </SectionHeader>
          <Table>
            <thead>
              <tr>
                <Th>요청 번호</Th>
                <Th>업체</Th>
                <Th>단가 (원)</Th>
                <Th>리드 타임(일)</Th>
                <Th>견적 유효기간</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.flatMap((request) => {
                const quotes = quotesByRequest[request.id] ?? [];
                if (quotes.length === 0) {
                  return (
                    <tr key={`${request.id}-empty`}>
                      <Td>{request.id}</Td>
                      <Td colSpan={4} style={{ color: "#6b7280" }}>
                        등록된 견적이 없습니다.
                      </Td>
                    </tr>
                  );
                }
                return quotes.map((quote) => (
                  <tr key={`${request.id}-${quote.vendorName}`}>
                    <Td>{request.id}</Td>
                    <Td>{quote.vendorName}</Td>
                    <Td>{quote.pricePerUnit.toLocaleString()}</Td>
                    <Td>{quote.leadTimeDays}</Td>
                    <Td>{quote.validity}</Td>
                  </tr>
                ));
              })}
            </tbody>
          </Table>
        </SectionCard>
      </PageContainer>
    </Layout>
  );
};
export default SupplierOrderPage;
