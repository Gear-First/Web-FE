import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, Td, Th } from "../../../components/common/PageLayout";

import PartRegisterModal from "./PartRegisterModal";
import type { PartDTO } from "./PartRegisterModal";

import PartDetailModal from "./PartDetailModal";
import type { PartRecords, PartCreateDTO, PartUpdateDTO } from "../PartTypes";
import { partKeys, deletePart, createPart, updatePart } from "../PartApi";

export default function PartTable({ rows }: { rows: PartRecords[] }) {
  const [selectedRecord, setSelectedRecord] = useState<PartRecords | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 등록/수정 겸용 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<PartDTO | null>(null);

  const queryClient = useQueryClient();

  const openDetail = (rec: PartRecords) => {
    setSelectedRecord(rec);
    setIsDetailOpen(true);
  };
  const closeDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    await deletePart(selectedRecord.partId);
    await queryClient.invalidateQueries({ queryKey: partKeys.records });
    closeDetail();
  };

  // DTO -> API payload 변환기
  const toCreatePayload = (dto: PartDTO): PartCreateDTO => ({
    partName: dto.partName.trim(),
    partCode: dto.partCode.trim(),
    category: dto.category,
    materials: dto.materials.map((m) => ({
      materialCode: m.materialCode.trim(),
      materialName: m.materialName.trim(),
      materialQty: Number(m.materialQty),
    })),
  });

  const toPatchPayload = (dto: PartDTO): PartUpdateDTO => ({
    partName: dto.partName.trim(),
    partCode: dto.partCode.trim(),
    category: dto.category,
    materials: dto.materials.map((m) => ({
      materialCode: m.materialCode.trim(),
      materialName: m.materialName.trim(),
      materialQty: Number(m.materialQty),
    })),
  });

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>Part 번호</Th>
            <Th>부품코드</Th>
            <Th>부품명</Th>
            <Th>카테고리</Th>
            <Th>작성일자</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.partId}
              style={{ cursor: "pointer" }}
              onClick={() => openDetail(r)}
            >
              <Td>{r.partId}</Td>
              <Td>{r.partCode}</Td>
              <Td>{r.partName}</Td>
              <Td>{r.category}</Td>
              <Td>{r.createdDate}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 상세 모달 */}
      <PartDetailModal
        record={selectedRecord}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onDelete={handleDelete}
        onEdit={(rec) => {
          closeDetail();
          setRegMode("edit");
          setInitialForEdit({
            partId: rec.partId,
            partCode: rec.partCode,
            partName: rec.partName,
            category: rec.category,
            materials: rec.materials.map((m) => ({
              materialCode: m.materialCode,
              materialName: m.materialName,
              materialQty: m.materialQty,
            })),
          });
          setIsRegOpen(true);
        }}
      />

      {/* 등록/수정 모달 */}
      <PartRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload) => {
          if (regMode === "edit" && payload.partId) {
            await updatePart(payload.partId, toPatchPayload(payload));
          } else {
            await createPart(toCreatePayload(payload));
          }
          await queryClient.invalidateQueries({ queryKey: partKeys.records });
          setIsRegOpen(false);
        }}
      />
    </>
  );
}
