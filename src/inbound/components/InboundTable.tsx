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
          <Th>자재</Th>
          <Th>입고 수량</Th>
          <Th>입고일</Th>
          <Th>보관 위치</Th>
          <Th>검수 상태</Th>
          <Th>LOT</Th>
          <Th>검수자</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>{r.id}</Td>
            <Td>
              <div>{r.materialName}</div>
              <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                {r.materialCode}
              </div>
            </Td>
            <Td>
              {r.quantityReceived.toLocaleString()} {r.unit}
            </Td>
            <Td>{r.receivedDate}</Td>
            <Td>{r.storageLocation}</Td>
            <Td>
              <StatusBadge $variant={qualityVariant[r.qualityStatus]}>
                {r.qualityStatus}
              </StatusBadge>
            </Td>
            <Td>{r.lotNumber}</Td>
            <Td>{r.inspector}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
