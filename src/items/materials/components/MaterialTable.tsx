import { useState } from "react";
import {
  toMaterialPatchPayload,
  type MaterialFormModel,
  type MaterialRecord,
  type MaterialUpdateDTO,
} from "../MaterialTypes";
import MaterialDetailModal from "./MaterialDetailModal";
import MaterialRegisterModal from "./MaterialRegisterModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMaterial, materialKeys, updateMaterial } from "../MaterialApi";
import { Table, Td, Th } from "../../../components/common/PageLayout";

export default function MaterialTable({ rows }: { rows: MaterialRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<MaterialRecord | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] =
    useState<MaterialFormModel | null>(null);

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

    const data = {
      materialId: selectedRecord.id,
      materialName: selectedRecord.materialName,
      materialCode: selectedRecord.materialCode,
    };

    await deleteMaterial(data);
    await queryClient.invalidateQueries({ queryKey: materialKeys.records });
    closeDetail();
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>자재 코드</Th>
            <Th>자재명</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.materialCode}
              style={{ cursor: "pointer" }}
              onClick={() => openDetail(r)}
            >
              <Td>{r.materialCode}</Td>
              <Td>{r.materialName}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <MaterialDetailModal
        record={selectedRecord}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onDelete={handleDelete}
        onEdit={(rec) => {
          closeDetail();
          setRegMode("edit");
          setInitialForEdit({
            materialId: rec.id,
            materialCode: rec.materialCode,
            materialName: rec.materialName,
          });
          setIsRegOpen(true);
        }}
      />

      <MaterialRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload: MaterialFormModel) => {
          await updateMut.mutateAsync({
            id: payload.materialCode,
            patch: toMaterialPatchPayload(payload),
          });
        }}
      />
    </>
  );
}
