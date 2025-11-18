import { useState } from "react";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { OutboundRecord } from "../OutboundTypes";
import OutboundDetailModal from "../components/OutboundDetailModal";
import {
  OUTBOUND_STATUS_LABELS,
  OUTBOUND_STATUS_VARIANTS,
} from "../OutboundTypes";
import { fmtDate } from "../../utils/string";

interface OutboundTableProps {
  rows: OutboundRecord[];
  variant: "pending" | "done"; // 출고예정 / 출고완료 구분
}

export default function OutboundTable({ rows, variant }: OutboundTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<OutboundRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dateHeader = variant === "pending" ? "납품 예정일" : "출고 일시";

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
            <Th>{dateHeader}</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={8} style={{ textAlign: "center", color: "#999" }}>
                데이터가 없습니다.
              </Td>
            </tr>
          ) : (
            rows.map((r) => (
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
                <Td>{r.totalQty?.toLocaleString() ?? "-"}</Td>
                <Td>{fmtDate(r.requestedAt)}</Td>
                <Td>
                  {variant === "pending"
                    ? fmtDate(r.expectedShipDate)
                    : fmtDate(r.shippedAt ?? "")}
                </Td>
                <Td>
                  <StatusBadge $variant={OUTBOUND_STATUS_VARIANTS[r.status]}>
                    {OUTBOUND_STATUS_LABELS[r.status]}
                  </StatusBadge>
                </Td>
              </tr>
            ))
          )}
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
