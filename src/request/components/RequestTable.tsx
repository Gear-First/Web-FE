import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { RequestRecord, RequestStatus } from "../RequestTypes";

// 요청 상태
const statusVariant: Record<RequestStatus, "rejected" | "info" | "success"> = {
  반려: "rejected",
  미승인: "info",
  승인: "success",
};

/** 승인/반려 처리된 요청 목록 테이블 */
export default function RequestTable({
  rows,
  onRowClick,
}: {
  rows: RequestRecord[];
  onRowClick: (row: RequestRecord) => void; // 부모 콜백
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
            <Th>접수 일시</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.requestId}
              style={{ cursor: "pointer" }}
              onClick={() => onRowClick(r)} // 부모 콜백
            >
              <Td>{r.requestId}</Td>
              <Td>{r.requestDate}</Td>
              <Td>{r.agency}</Td>
              <Td>{r.manager}</Td>
              <Td>{r.submissionDate}</Td>
              <Td>
                <StatusBadge $variant={statusVariant[r.status]}>
                  {r.status}
                </StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
