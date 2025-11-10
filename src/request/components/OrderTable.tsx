import { Table, Th, Td } from "../../components/common/PageLayout";
import type { PendingOrderItem } from "../RequestTypes";
import { fmtDate } from "../../utils/string";

/** 미승인 발주 요청 목록 테이블 */
export default function OrderTable({
  rows,
  onRowClick,
}: {
  rows: PendingOrderItem[];
  onRowClick: (row: PendingOrderItem) => void;
}) {
  const getBranchType = (code: string) => {
    if (code.includes("대리점")) return "대리점";
    else if (code.includes("창고")) return "창고";
  };
  const branchType =
    rows.length > 0 ? getBranchType(rows[0].branchCode) : "대리점";

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>발주 번호</Th>
            <Th>{branchType === "대리점" ? "대리점" : "창고"}</Th>
            <Th>담당자</Th>
            <Th>요청 일시</Th>
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
                <Td>{fmtDate(r.requestDate)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
