import { useState } from "react";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { OutboundRecord, OutboundStatus } from "../OutboundTypes";
import OutboundDetailModal from "../components/OutboundDetailModal";

const statusVariant: Record<
  OutboundStatus,
  "warning" | "rejected" | "info" | "success"
> = {
  대기: "warning",
  지연: "rejected",
  진행중: "info",
  완료: "success",
};

export default function OutboundTable({ rows }: { rows: OutboundRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<OutboundRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formatDate = (dateStr: string) =>
    dateStr ? dateStr.slice(0, 16).replace("T", " ") : "-";

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>출고 번호</Th>
            <Th>대리점</Th>
            <Th>출고 수량</Th>
            <Th>접수 일시</Th>
            <Th>출고 일시</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.outboundId}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(r);
                setIsModalOpen(true);
              }}
            >
              <Td>{r.outboundId}</Td>
              <Td>{r.destination}</Td>
              <Td>{r.totalQuantity.toLocaleString() || "-"}</Td>
              <Td>{formatDate(r.receiptDate)}</Td>
              <Td>{formatDate(r.issuedDate)}</Td>
              <Td>
                <StatusBadge $variant={statusVariant[r.status]}>
                  {r.status}
                </StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <OutboundDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
