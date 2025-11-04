import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  type ProcessedOrderItem,
  type OrderStatus,
} from "../RequestTypes";

/** 승인/반려 처리된 요청 목록 테이블 */
export default function RequestTable({
  rows,
  onRowClick,
}: {
  rows: ProcessedOrderItem[];
  onRowClick: (row: ProcessedOrderItem) => void;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>발주 번호</Th>
          <Th>대리점</Th>
          <Th>담당자</Th>
          <Th>요청 일시</Th>
          <Th>처리 일시</Th>
          <Th>상태</Th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <Td colSpan={6} style={{ textAlign: "center", color: "#6b7280" }}>
              데이터가 없습니다.
            </Td>
          </tr>
        ) : (
          rows.map((r) => {
            const status = r.orderStatus as OrderStatus;
            return (
              <tr
                key={r.orderId}
                style={{ cursor: "pointer" }}
                onClick={() => onRowClick(r)}
              >
                <Td>{r.orderNumber}</Td>
                <Td>{r.branchCode}</Td>
                <Td>{r.engineerName}</Td>
                <Td>
                  {new Date(r.requestDate).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Td>
                <Td>
                  {r.processedDate
                    ? new Date(r.processedDate).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </Td>
                <Td>
                  <StatusBadge $variant={ORDER_STATUS_VARIANTS[status]}>
                    {ORDER_STATUS_LABELS[status]}
                  </StatusBadge>
                </Td>
              </tr>
            );
          })
        )}
      </tbody>
    </Table>
  );
}
