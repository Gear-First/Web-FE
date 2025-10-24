import { useState } from "react";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { RequestRecord, RequestStatus } from "../RequestTypes";
import RequestDetailModal from "./RequestDetailModal";

// 요청 상태별 스타일 매핑
const statusVariant: Record<RequestStatus, "rejected" | "info" | "success"> = {
  반려: "rejected",
  미승인: "info",
  승인: "success",
};

export default function RequestTable({ rows }: { rows: RequestRecord[] }) {
  // 클릭된 요청 데이터 상태
  const [selectedRecord, setSelectedRecord] = useState<RequestRecord | null>(
    null
  );
  // 모달 열림 여부 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      {/* 요청 목록 테이블 */}
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
          {/* 전달받은 rows 배열을 반복 렌더링 */}
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
              <Td>{r.submissionDate}</Td>
              <Td>
                {/* 상태값에 따라 색상 다른 뱃지 표시 */}
                <StatusBadge $variant={statusVariant[r.status]}>
                  {r.status}
                </StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <RequestDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
