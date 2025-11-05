import { useState } from "react";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { OutboundRecord } from "../OutboundTypes";
import OutboundDetailModal from "../components/OutboundDetailModal";
import {
  OUTBOUND_STATUS_LABELS,
  OUTBOUND_STATUS_VARIANTS,
} from "../OutboundTypes";
import { fmtDate } from "../../utils/string";

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
            <Th>대리점</Th>
            <Th>창고</Th>
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
              <Td>{r.warehouseCode}</Td>
              <Td>{r.totalQty.toLocaleString() || "-"}</Td>
              <Td>{fmtDate(r.requestedAt)}</Td>
              <Td>{fmtDate(r.shippedAt ?? "")}</Td>
              <Td>
                <StatusBadge $variant={OUTBOUND_STATUS_VARIANTS[r.status]}>
                  {OUTBOUND_STATUS_LABELS[r.status]}
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
