// src/features/part/components/PartTable.tsx
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Table, Td, Th } from "../../../components/common/PageLayout";

import PartRegisterModal from "./PartRegisterModal";
import PartDetailModal from "./PartDetailModal";

import {
  toPartUpdatePayload,
  type PartFormModel,
  type PartRecords,
  type PartUpdateDTO,
} from "../PartTypes";
import { partKeys, deletePart, updatePart } from "../PartApi";

export default function PartTable({ rows }: { rows: PartRecords[] }) {
  const [selectedRecord, setSelectedRecord] = useState<PartRecords | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 등록/수정 겸용 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] = useState<PartFormModel | null>(
    null
  );

  // 수정 대상 id를 별도로 저장 (form에는 id가 없으므로)
  const [editingId, setEditingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const openDetail = (rec: PartRecords) => {
    setSelectedRecord(rec);
    setIsDetailOpen(true);
  };
  const closeDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const updateMut = useMutation<
    PartRecords,
    Error,
    { id: string; patch: PartUpdateDTO }
  >({
    mutationFn: ({ id, patch }) => updatePart(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.records });
      setIsRegOpen(false);
    },
  });

  const deleteMut = useMutation<
    { ok: boolean; removedId: string },
    Error,
    string
  >({
    mutationFn: (id) => deletePart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partKeys.records });
      closeDetail();
    },
  });

  const handleDelete = async () => {
    if (!selectedRecord) return;
    await deleteMut.mutateAsync(selectedRecord.partId);
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>부품코드</Th>
            <Th>부품명</Th>
            <Th>카테고리</Th>
            <Th>작성일자</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.partCode}
              style={{ cursor: "pointer" }}
              onClick={() => openDetail(r)}
            >
              <Td>{r.partCode}</Td>
              <Td>{r.partName}</Td>
              <Td>{r.category.name}</Td>
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
          setEditingId(rec.partId); // ⛳️ 수정 대상 id 저장

          // ⛳️ 주의: PartRecords에는 price가 없음. 상세 프리필이 필요하면
          // PartDetail을 fetch해서 채워 넣거나, 일단 기본값으로 둡니다.
          setInitialForEdit({
            partCode: rec.partCode,
            partName: rec.partName,
            partPrice: 0, // TODO: 편집 시에는 상세 조회로 실제 가격을 불러오세요.
            categoryId: rec.category.id,
            // imageUrl / enabled 등 필요시 여기서 추가
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
        onSubmit={async (form: PartFormModel) => {
          if (regMode !== "edit") return;
          if (!editingId) return;
          const patch = toPartUpdatePayload(form);
          await updateMut.mutateAsync({ id: editingId, patch });
        }}
      />
    </>
  );
}
