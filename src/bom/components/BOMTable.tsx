import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, Td, Th } from "../../components/common/PageLayout";
import BOMDetailModal from "./BOMDetailModal";
import BOMRegisterModal from "./BOMRegisterModal";
import type { BOMRecord } from "../BOMTypes";
import { bomKeys, deleteBOM, updateBOM } from "../BOMApi";
import type { BOMDTO } from "./BOMRegisterModal";

export default function BOMTable({ rows }: { rows: BOMRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<BOMRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 수정(겸용) 등록 모달 상태
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<BOMDTO | null>(null);

  const queryClient = useQueryClient();

  const openDetail = (rec: BOMRecord) => {
    setSelectedRecord(rec);
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setIsModalOpen(false);
    // 다음 열림을 위해 선택값 정리
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const handleDelete = async () => {
    await deleteBOM();
    queryClient.invalidateQueries({ queryKey: bomKeys.records });
    closeDetail();
  };

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
              onClick={() => openDetail(r)}
            >
              <Td>{r.bomId}</Td>
              <Td>{r.partCode}</Td>
              <Td>{r.partName}</Td>
              <Td>{r.createdDate}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 상세 모달 */}
      <BOMDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={closeDetail}
        onDelete={handleDelete}
        onEdit={(rec) => {
          // 상세 닫고, 등록 모달을 edit 모드로 오픈
          closeDetail();
          setRegMode("edit");
          setInitialForEdit({
            bomNo: rec.bomId,
            partCode: rec.partCode,
            partName: rec.partName,
            materials: rec.materials.map((m) => ({
              materialCode: m.materialCode,
              materialName: m.materialName,
              materialQty: m.materialQty,
            })),
          });
          setIsRegOpen(true);
        }}
      />

      {/* 등록/수정 겸용 모달 (여기서는 수정에만 사용) */}
      <BOMRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async () => {
          await updateBOM();
          queryClient.invalidateQueries({ queryKey: bomKeys.records });
        }}
      />
    </>
  );
}
