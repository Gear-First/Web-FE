import { useState } from "react";
import { StatusBadge, Table, Td, Th } from "../../components/common/PageLayout";
import {
  getInboundStatusVariant,
  InboundStatusLabelMap,
  type InboundRecord,
} from "../InboundTypes";
import InboundDetailModal from "./InboundDetailModal";
import { fmtDate } from "../../utils/string";

interface InboundTableProps {
  rows: InboundRecord[];
  variant: "pending" | "done"; // 출고예정 / 출고완료 구분
}

export default function InboundTable({ rows, variant }: InboundTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<InboundRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fmtNum = (n?: number | null) =>
    typeof n === "number" ? n.toLocaleString() : "-";

  const fmt = (v?: string | null) => (v && v.trim() ? v : "-");

  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>입고번호</Th>
            <Th>공급업체</Th>
            <Th>품목수</Th>
            <Th>총수량</Th>
            <Th>요청일시</Th>
            <Th>{variant === "done" ? "완료일시" : "입고 예정일"}</Th>
            <Th>창고</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {safeRows.length === 0 ? (
            <tr>
              <Td colSpan={8} style={{ textAlign: "center", color: "#999" }}>
                데이터가 없습니다.
              </Td>
            </tr>
          ) : (
            safeRows.map((r) => (
              <tr
                key={r.noteId ?? crypto.randomUUID()}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedRecord(r);
                  setIsModalOpen(true);
                }}
              >
                <Td>{fmt(r.receivingNo)}</Td>
                <Td>{fmt(r.supplierName)}</Td>
                <Td>{fmtNum(r.itemKindsNumber)}</Td>
                <Td>{fmtNum(r.totalQty)}</Td>
                <Td>{fmtDate(r.requestedAt)}</Td>
                <Td>
                  {fmtDate(
                    variant === "done"
                      ? r.completedAt
                      : r.expectedReceiveDate ?? r.completedAt
                  )}
                </Td>
                <Td>{fmt(r.warehouseCode)}</Td>
                <Td>
                  <StatusBadge
                    $variant={getInboundStatusVariant(r.statusRaw)}
                    title={r.statusRaw || undefined}
                  >
                    {
                      InboundStatusLabelMap[
                        (r.statusRaw ?? "").trim().toUpperCase()
                      ]
                    }
                  </StatusBadge>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {isModalOpen && selectedRecord && (
        <InboundDetailModal
          record={selectedRecord}
          isOpen={true}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </>
  );
}
