import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Td, Th } from "../../../components/common/PageLayout";
import type { CategoryFormModel, CategoryRecord } from "../CategoryTypes";
import CategoryDetailModal from "./CategoryDetailModal";
import CategoryRegisterModal from "./CategoryRegisterModal";
import { categoryKeys, updateCategory, deleteCategory } from "../CategoryApi";

export default function CategoryTable({ rows }: { rows: CategoryRecord[] }) {
  const [selected, setSelected] = useState<CategoryRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 등록/수정 모달
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regMode, setRegMode] = useState<"create" | "edit">("create");
  const [initialForEdit, setInitialForEdit] =
    useState<CategoryFormModel | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const qc = useQueryClient();

  const updateMut = useMutation({
    mutationFn: ({
      id,
      form,
    }: {
      id: string | number;
      form: CategoryFormModel;
    }) =>
      updateCategory(id, { name: form.name, description: form.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.records });
      setIsRegOpen(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string | number) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.records });
      setIsDetailOpen(false);
      setSelected(null);
    },
  });

  const openDetail = (r: CategoryRecord) => {
    setSelected(r);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>카테고리명</Th>
            <Th>설명</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={3} style={{ textAlign: "center", color: "#6b7280" }}>
                데이터가 없습니다.
              </Td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={r.id}
                style={{ cursor: "pointer" }}
                onClick={() => openDetail(r)}
              >
                <Td>{r.name}</Td>
                <Td>{r.description ?? "-"}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* 상세 모달 */}
      {isDetailOpen && selected && (
        <CategoryDetailModal
          record={selected}
          isOpen
          onClose={() => {
            setIsDetailOpen(false);
            setSelected(null);
          }}
          onEdit={(detail) => {
            setIsDetailOpen(false);
            setSelected(null);
            setRegMode("edit");
            setEditingId(detail.id);
            setInitialForEdit({
              name: detail.name,
              description: detail.description ?? "",
            });
            setIsRegOpen(true);
          }}
          onDelete={(id) => deleteMut.mutate(id)}
        />
      )}

      {/* 등록/수정 모달 */}
      <CategoryRegisterModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        mode={regMode}
        initial={initialForEdit}
        onSubmit={async (form) => {
          if (regMode === "edit" && editingId != null) {
            await updateMut.mutateAsync({ id: editingId, form });
          }
          // (create는 다른 곳에서 쓰면 연결)
        }}
      />
    </>
  );
}
