import { StatusBadge, Table, Td, Th } from "../../components/common/PageLayout";
import type { InboundRecord, QualityStatus } from "../InboundTypes";

const qualityVariant: Record<
  QualityStatus,
  "accepted" | "pending" | "rejected"
> = {
  합격: "accepted",
  보류: "pending",
  불합격: "rejected",
};

export default function InboundTable({ rows }: { rows: InboundRecord[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>입고 번호</Th>
          <Th>LOT 번호</Th>
          <Th>부품</Th>
          <Th>입고 수량</Th>
          <Th>접수 일시</Th>
          <Th>입고 예정일</Th>
          <Th>입고 일시</Th>
          <Th>보관 창고</Th>
          <Th>상태</Th>
          <Th>검수자</Th>
          <Th>공급처</Th>
          <Th>비고</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.inboundId}>
            <Td>{r.inboundId}</Td>
            <Td>{r.lotId}</Td>
            <Td>
              <div>{r.partName}</div>
              <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                {r.partCode}
              </div>
            </Td>
            <Td>{r.inboundQty.toLocaleString()}</Td>
            <Td>{r.receivedDate}</Td>
            <Td>{r.expectedInDate}</Td>
            <Td>{r.inDate}</Td>
            <Td>{r.warehouse}</Td>
            <Td>
              <StatusBadge $variant={qualityVariant[r.status]}>
                {r.status}
              </StatusBadge>
            </Td>
            <Td>{r.inspector}</Td>
            <Td>{r.vendor}</Td>
            <Td>{r.note || "-"}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
