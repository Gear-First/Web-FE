import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  StatusBadge,
  Table,
  Td,
  Th,
} from "../../../components/common/PageLayout";

import PartRegisterModal from "./PartRegisterModal";
import PartDetailModal from "./PartDetailModal";

import {
  toPartUpdateDTO,
  type PartFormModel,
  type PartRecord,
  type PartUpdateDTO,
} from "../PartTypes";
import { partKeys, deletePart, updatePart } from "../PartApi";

export default function PartTable({ rows }: { rows: PartRecord[] }) {
  const [selectedRecord, setSelectedRecord] = useState<PartRecord | null>(null);
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

  const openDetail = (rec: PartRecord) => {
    setSelectedRecord(rec);
    setIsDetailOpen(true);
  };
  const closeDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const updateMut = useMutation<
    PartRecord,
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

  const numberFormatter = new Intl.NumberFormat("ko-KR");
  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.slice(0, 10);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>부품코드</Th>
            <Th>부품명</Th>
            <Th>카테고리</Th>
            <Th>차량 모델</Th>
            <Th>안전재고</Th>
            <Th>단가</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.partId}
              style={{ cursor: "pointer" }}
              onClick={() => openDetail(r)}
            >
              <Td>{r.partCode}</Td>
              <Td>{r.partName}</Td>
              <Td>{r.category.name}</Td>
              <Td>
                {r.carModelNames.length > 0 ? r.carModelNames.join(", ") : "—"}
              </Td>
              <Td>
                {typeof r.safetyStockQty === "number"
                  ? numberFormatter.format(r.safetyStockQty)
                  : "—"}
              </Td>
              <Td>{numberFormatter.format(r.price ?? 0)}</Td>
              <Td>
                {r.enabled === undefined ? (
                  <StatusBadge $variant="info">확인 필요</StatusBadge>
                ) : r.enabled ? (
                  <StatusBadge $variant="success">사용</StatusBadge>
                ) : (
                  <StatusBadge $variant="danger">중지</StatusBadge>
                )}
              </Td>
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
          setEditingId(rec.partId); // 수정 대상 id 저장

          setInitialForEdit({
            partCode: rec.partCode,
            partName: rec.partName,
            partPrice: rec.price ?? 0,
            safetyQty: rec.safetyStockQty ?? 0,
            categoryId: rec.category.id,
            enabled: rec.enabled ?? true,
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
          const patch = toPartUpdateDTO(form);
          await updateMut.mutateAsync({ id: editingId, patch });
        }}
      />
    </>
  );
}
