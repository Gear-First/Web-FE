import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Table, Td, Th } from "../../components/common/PageLayout";
import BOMDetailModal from "./BOMDetailModal";
import BOMRegisterModal from "./BOMRegisterModal";

import {
  type BOMRecord,
  type BOMFormModel,
  type BOMUpdateDTO,
  toBOMPatchPayload,
} from "../BOMTypes";
import { bomKeys, deleteBOM, updateBOM } from "../BOMApi";

export default function BOMTable({ rows }: { rows: BOMRecord[] }) {
  const safeRows: BOMRecord[] = Array.isArray(rows) ? rows : [];

  const [selectedRecord, setSelectedRecord] = useState<BOMRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 등록/수정 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("edit"); // 이 테이블에선 수정만 사용
  const [initialForEdit, setInitialForEdit] = useState<BOMFormModel | null>(
    null
  );

  const queryClient = useQueryClient();

  const openDetail = (rec: BOMRecord) => {
    setSelectedRecord(rec);
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const updateMut = useMutation<
    BOMRecord,
    Error,
    { id: string; patch: BOMUpdateDTO }
  >({
    mutationFn: ({ id, patch }) => updateBOM(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bomKeys.records });
      setIsRegOpen(false);
    },
  });

  const deleteMut = useMutation<
    { ok: boolean; removedId: string },
    Error,
    string
  >({
    mutationFn: (id) => deleteBOM(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bomKeys.records });
      closeDetail();
    },
  });

  const handleDelete = async () => {
    if (!selectedRecord) return;
    await deleteMut.mutateAsync(selectedRecord.bomCodeId);
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
          {safeRows.length === 0 ? (
            <tr>
              <Td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                등록된 BOM이 없습니다.
              </Td>
            </tr>
          ) : (
            safeRows.map((r) => (
              <tr
                key={r.bomCodeId}
                style={{ cursor: "pointer" }}
                onClick={() => openDetail(r)}
              >
                <Td>{r.bomCodeId}</Td>
                <Td>{r.partCode}</Td>
                <Td>{r.partName}</Td>
                <Td>{r.createdDate}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* 상세 모달 */}
      <BOMDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={closeDetail}
        onDelete={handleDelete}
        onEdit={(rec) => {
          closeDetail();
          setRegMode("edit");
          setInitialForEdit({
            bomId: rec.bomCodeId,
            partCode: rec.partCode,
            partName: rec.partName,
            category: rec.category,
            materials: rec.materials.map((m) => ({
              materialCode: m.materialCode,
              materialName: m.materialName,
              materialQty: m.materialQty,
            })),
            createdDate: rec.createdDate, // 표시용
          });
          setIsRegOpen(true);
        }}
      />

      {/* 등록/수정 모달 (여기서는 수정에만 사용) */}
      <BOMRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (payload: BOMFormModel) => {
          if (!payload.bomId) return;
          await updateMut.mutateAsync({
            id: payload.bomId,
            patch: toBOMPatchPayload(payload),
          });
        }}
      />
    </>
  );
}
