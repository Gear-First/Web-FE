import { useState } from "react";
import { StatusBadge, Table, Td, Th } from "../../components/common/PageLayout";
import { type InboundRecord } from "../InboundTypes";
import InboundDetailModal from "./InboundDetailModal";

export default function InboundTable({ rows }: { rows: InboundRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<InboundRecord | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>입고번호</Th>
            <Th>공급업체</Th>
            <Th>품목수</Th>
            <Th>총수량</Th>
            <Th>완료일시</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.inboundId}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(r);
                setIsModalOpen(true);
              }}
            >
              <Td>{r.inboundId}</Td>
              <Td>{r.vendor}</Td>
              <Td>{r.itemKindsNumber}</Td>
              <Td>{r.inboundQty}</Td>
              <Td>{r.completedAt}</Td>
              <Td>
                <StatusBadge
                  $variant={
                    r.status === "합격"
                      ? "accepted"
                      : r.status === "보류"
                      ? "pending"
                      : "rejected"
                  }
                >
                  {r.status}
                </StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {isModalOpen && selectedRecord && (
        <InboundDetailModal
          record={selectedRecord /* InboundRecord */}
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
