import { Table, Th, Td } from "../../components/common/PageLayout";
import type { PendingOrderItem } from "../RequestTypes";

/** 미승인 발주 요청 목록 테이블 */
export default function OrderTable({
  rows,
  onRowClick,
}: {
  rows: PendingOrderItem[];
  onRowClick: (row: PendingOrderItem) => void;
}) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>발주 번호</Th>
            <Th>요청 일시</Th>
            <Th>대리점</Th>
            <Th>담당자</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={5} style={{ textAlign: "center", color: "#6b7280" }}>
                데이터가 없습니다.
              </Td>
            </tr>
          ) : (
            rows.map((r) => (
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
                <Td>{r.orderStatus}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
