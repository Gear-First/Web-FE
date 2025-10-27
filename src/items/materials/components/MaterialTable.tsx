import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Td, Th } from "../../../components/common/PageLayout";
import {
  type MaterialRecord,
  type MaterialDTO,
  type MaterialFormModel,
  toMaterialPatchPayload,
  type MaterialUpdateDTO,
} from "../MaterialTypes";
import { materialKeys, deleteMaterial, updateMaterial } from "../MaterialApi";
import MaterialDetailModal from "./MaterialDetailModal";
import MaterialRegisterModal from "./MaterialRegisterModal";

export default function MaterialTable({ rows }: { rows: MaterialRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<MaterialRecord | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<MaterialDTO | null>(
    null
  );

  const queryClient = useQueryClient();

  const openDetail = (rec: MaterialRecord) => {
    setSelectedRecord(rec);
    setIsDetailOpen(true);
  };
  const closeDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const updateMut = useMutation<
    MaterialRecord,
    Error,
    { id: string; patch: MaterialUpdateDTO }
  >({
    mutationFn: ({ id, patch }) => updateMaterial(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.records });
      setIsRegOpen(false);
    },
  });

  const handleDelete = async () => {
    if (!selectedRecord) return;
    await deleteMaterial(selectedRecord.materialId);
    await queryClient.invalidateQueries({ queryKey: materialKeys.records });
    closeDetail();
  };

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
        onSubmit={async (payload: MaterialFormModel) => {
          if (!payload.materialId) return;
          await updateMut.mutateAsync({
            id: payload.materialId,
            patch: toMaterialPatchPayload(payload),
          });
        }}
      />
    </>
  );
}
