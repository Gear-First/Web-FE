import styled from "styled-components";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { UserRecord } from "../HumanTypes";
import { useState } from "react";
import UserDetailModal from "./UserDetailModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, userKeys } from "../HumanApi";
import { getRankMeta } from "../utils/rank";

const EmptyRow = styled.tr`
  td {
    padding: 20px;
    text-align: center;
    color: #6b7280;
    font-size: 0.95rem;
  }
`;

export default function UserTable({ rows }: { rows?: UserRecord[] }) {
  const data = Array.isArray(rows) ? rows : [];
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const [open, setOpen] = useState(false);

  const qc = useQueryClient();

  const updateMut = useMutation({
    mutationFn: (dto: Parameters<typeof updateUser>[0]) => updateUser(dto),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: userKeys.list });
    },
  });

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>이름</Th>
            <Th>이메일</Th>
            <Th>연락처</Th>
            <Th>직급</Th>
            <Th>지역</Th>
            <Th>지점</Th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <EmptyRow>
              <td colSpan={6}>등록된 사용자가 없습니다.</td>
            </EmptyRow>
          ) : (
            data.map((u) => (
              <tr
                key={u.id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelected(u);
                  setOpen(true);
                }}
              >
                <Td>{u.name}</Td>
                <Td>{u.email}</Td>
                <Td>{u.phoneNum}</Td>
                <Td>
                  {(() => {
                    const meta = getRankMeta(u.rank);
                    return (
                      <StatusBadge $variant={meta.variant}>
                        {meta.label}
                      </StatusBadge>
                    );
                  })()}
                </Td>
                <Td>{u.region}</Td>
                <Td>{u.workType}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <UserDetailModal
        isOpen={open}
        record={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        onEdit={async (dto) => {
          await updateMut.mutateAsync(dto);
          setOpen(false);
          setSelected(null);
        }}
      />
    </>
  );
}
