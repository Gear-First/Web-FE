import { useState } from "react";
import { Table, Td, Th } from "../../components/common/PageLayout";
import BOMDetailModal from "./BOMDetailModal";
import type { BOMRecord } from "../BOMTypes";

export default function BOMTable({ rows }: { rows: BOMRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<BOMRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>BOM 번호</Th>
            <Th>부품코드</Th>
            <Th>부품명</Th>
            <Th>작성일시</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.bomId}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(r);
                setIsModalOpen(true);
              }}
            >
              <Td>{r.bomId}</Td>
              <Td>{r.partCode}</Td>
              <Td>{r.partName}</Td>
              <Td>{r.createdDate}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <BOMDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      ></BOMDetailModal>
    </>
  );
}
