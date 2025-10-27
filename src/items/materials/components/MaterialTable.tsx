import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, Td, Th } from "../../../components/common/PageLayout";

// import PartRegisterModal from "./PartRegisterModal";
// import type { MaterialDTO } from "./PartRegisterModal";

// import PartDetailModal from "./PartDetailModal";
import type {
  MaterialRecords,
  MaterialCreateDTO,
  MaterialUpdateDTO,
  MaterialDTO,
} from "../MaterialTypes";
import {
  materialKeys,
  deleteMaterial,
  createMaterial,
  updateMaterial,
} from "../MaterialApi";
import MaterialDetailModal from "./MaterialDetailModal";
import MaterialRegisterModal from "./MaterialRegisterModal";

export default function MaterialTable({ rows }: { rows: MaterialRecords[] }) {
  const [selectedRecord, setSelectedRecord] = useState<MaterialRecords | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<MaterialDTO | null>(
    null
  );

  const queryClient = useQueryClient();

  const openDetail = (rec: MaterialRecords) => {
    setSelectedRecord(rec);
    setIsDetailOpen(true);
  };
  const closeDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    await deleteMaterial(selectedRecord.materialId);
    await queryClient.invalidateQueries({ queryKey: materialKeys.records });
    closeDetail();
  };

  // DTO -> API payload 변환기
  const toCreatePayload = (dto: MaterialDTO): MaterialCreateDTO => ({
    materialName: dto.materialName.trim(),
    materialCode: dto.materialCode.trim(),
  });

  const toPatchPayload = (dto: MaterialDTO): MaterialUpdateDTO => ({
    materialName: dto.materialName.trim(),
    materialCode: dto.materialCode.trim(),
  });

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>자재 번호</Th>
            <Th>자재 코드</Th>
            <Th>자재명</Th>
            <Th>작성일자</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.materialId}
              style={{ cursor: "pointer" }}
              onClick={() => openDetail(r)}
            >
              <Td>{r.materialId}</Td>
              <Td>{r.materialCode}</Td>
              <Td>{r.materialName}</Td>
              <Td>{r.createdDate}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 상세 모달 */}
      <MaterialDetailModal
        record={selectedRecord}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onDelete={handleDelete}
        onEdit={(rec) => {
          closeDetail();
          setRegMode("edit");
          setInitialForEdit({
            materialId: rec.materialId,
            materialCode: rec.materialCode,
            materialName: rec.materialName,
          });
          setIsRegOpen(true);
        }}
      />

      {/* 등록/수정 모달 */}
      <MaterialRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload) => {
          if (regMode === "edit" && payload.materialId) {
            await updateMaterial(payload.materialId, toPatchPayload(payload));
          } else {
            await createMaterial(toCreatePayload(payload));
          }
          await queryClient.invalidateQueries({
            queryKey: materialKeys.records,
          });
          setIsRegOpen(false);
        }}
      />
    </>
  );
}
