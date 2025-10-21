import { useState } from "react";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { OutboundRecord, OutboundStatus } from "../OutboundTypes";
import OutboundDetailModal from "../components/OutboundDetailModal";

const statusVariant: Record<OutboundStatus, "warning" | "info" | "success"> = {
  대기: "warning",
  진행중: "info",
  완료: "success",
};

export default function OutboundTable({ rows }: { rows: OutboundRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<OutboundRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>출고 번호</Th>
            <Th>부품</Th>
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
              <Td>{r.inventoryName}</Td>
              <Td>{r.outboundQuantity.toLocaleString()}</Td>
              <Td>{r.receiptDate}</Td>
              <Td>{r.issuedDate}</Td>
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
