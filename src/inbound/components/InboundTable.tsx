import { useState } from "react";
import { StatusBadge, Table, Td, Th } from "../../components/common/PageLayout";
import type { InboundRecord, InboundStatus } from "../InboundTypes";
import InboundDetailModal from "./InboundDetailModal";

const qualityVariant: Record<
  InboundStatus,
  "accepted" | "pending" | "rejected"
> = {
  합격: "accepted",
  보류: "pending",
  불합격: "rejected",
};

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
            <Th>입고 번호</Th>
            <Th>부품</Th>
            <Th>입고 수량</Th>
            <Th>접수 일시</Th>
            {/* <Th>입고 예정일</Th> */}
            <Th>입고 일시</Th>
            {/* <Th>보관 창고</Th> */}
            <Th>상태</Th>
            {/* <Th>공급처</Th> */}
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
              <Td>{r.partName}</Td>
              <Td>{r.inboundQty}</Td>
              <Td>{r.receivedDate}</Td>
              {/* <Td>{r.expectedInDate}</Td> */}
              <Td>{r.inDate}</Td>
              {/* <Td>{r.warehouse}</Td> */}
              <Td>
                <StatusBadge $variant={qualityVariant[r.status]}>
                  {r.status}
                </StatusBadge>
              </Td>
              {/* <Td>{r.vendor}</Td> */}
            </tr>
          ))}
        </tbody>
      </Table>
      <InboundDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
