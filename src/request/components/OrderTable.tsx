import { useState } from "react";
import { Table, Th, Td } from "../../components/common/PageLayout";
import type { RequestRecord } from "../RequestTypes";
import OrderDetailModal from "./OrderDetailModal";

export default function OrderTable({ rows }: { rows: RequestRecord[] }) {
  // 선택된 발주 레코드 상태 (행 클릭 시 모달에 전달)
  const [selectedRecord, setSelectedRecord] = useState<RequestRecord | null>(
    null
  );
  // 모달 열림 여부 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      {/* 발주 목록 테이블 */}
      <Table>
        <thead>
          <tr>
            <Th>발주 번호</Th>
            <Th>요청 일시</Th>
            <Th>대리점</Th>
            <Th>담당자</Th>
          </tr>
        </thead>
        {/* 전달받은 rows 배열을 반복 렌더링 */}
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.requestId}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(r);
                setIsModalOpen(true);
              }}
            >
              <Td>{r.requestId}</Td>
              <Td>{r.requestDate}</Td>
              <Td>{r.agency}</Td>
              <Td>{r.manager}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* 상세 모달 */}
      <OrderDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
