import { useState } from "react";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { OutboundRecord, OutboundStatus } from "../OutboundTypes";
import OutboundDetailModal from "../components/OutboundDetailModal";

const statusVariant: Record<
  OutboundStatus,
  "warning" | "info" | "success" | "rejected"
> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "rejected",
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
              key={r.noteId}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(r);
                setIsModalOpen(true);
              }}
            >
              <Td>{r.shippingNo}</Td>
              <Td>{r.branchName}</Td>
              <Td>{r.totalQty.toLocaleString() || "-"}</Td>
              <Td>{formatDate(r.requestedAt)}</Td>
              <Td>{formatDate(r.shippedAt)}</Td>
              <Td>
                <StatusBadge $variant={statusVariant[r.status ?? "PENDING"]}>
                  {r.status ?? "PENDING"}
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
