import { Table, Th, Td } from "../../components/common/PageLayout";
import type { RequestRecord } from "../RequestTypes";

/** 미승인 발주 요청 목록 테이블 */
export default function OrderTable({
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
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.requestId}
              style={{ cursor: "pointer" }}
              onClick={() => onRowClick(r)} // 클릭 시 해당 행 데이터 부모로 전달
            >
              <Td>{r.requestId}</Td>
              <Td>{r.requestDate}</Td>
              <Td>{r.agency}</Td>
              <Td>{r.manager}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
