import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { OutboundRecord, OutboundStatus } from "../OutboundTypes";

const statusVariant: Record<OutboundStatus, "warning" | "info" | "success"> = {
  대기: "warning",
  진행중: "info",
  완료: "success",
};

export default function OutboundTable({ rows }: { rows: OutboundRecord[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>출고 번호</Th>
          <Th>부품</Th>
          <Th>출고 수량</Th>
          <Th>접수 일시</Th>
          <Th>출고 일시</Th>
          <Th>상태</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>{r.id}</Td>
            <Td>{r.inventoryName}</Td>
            <Td>{r.quantity.toLocaleString()}</Td>
            <Td>{r.receiptDate}</Td>
            <Td>{r.issuedDate}</Td>
            <Td>
              <StatusBadge $variant={statusVariant[r.status]}>
                {r.status}
              </StatusBadge>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
