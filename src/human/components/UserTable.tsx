import styled from "styled-components";
import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import { fmtDate } from "../../utils/string";
import type { UserRecord } from "../HumanTypes";

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
`;

export default function UserTable({ rows }: { rows?: UserRecord[] }) {
  const data = Array.isArray(rows) ? rows : [];
  if (data.length === 0) {
    return <Empty>등록된 사용자가 없습니다.</Empty>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>이름</Th>
          <Th>이메일</Th>
          <Th>연락처</Th>
          <Th>직급</Th>
          <Th>지역</Th>
          <Th>지점</Th>
          <Th>가입일</Th>
        </tr>
      </thead>
      <tbody>
        {data.map((u) => (
          <tr key={u.id}>
            <Td>{u.name}</Td>
            <Td>{u.email}</Td>
            <Td>{u.phone}</Td>
            <Td>
              <StatusBadge
              // $variant={u.role === "LEADER" ? "success" : "default"}
              >
                {u.role === "LEADER" ? "팀장" : "사원"}
              </StatusBadge>
            </Td>
            <Td>{u.region}</Td>
            <Td>{u.branch}</Td>
            <Td>{fmtDate(u.createdAt)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
