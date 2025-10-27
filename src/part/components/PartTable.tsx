import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { PartRecord, PartStatus } from "../PartTypes";

// 요청 상태
const statusVariant: Record<PartStatus, "rejected" | "info" | "success"> = {
  적정: "info",
  여유: "success",
  부족: "rejected",
};

export default function PartTable({ rows }: { rows: PartRecord[] }) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>창고 번호</Th>
            <Th>부품 코드</Th>
            <Th>부품명</Th>
            <Th>가용 재고</Th>
            <Th>안전 재고</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>{r.warehouseId}</Td>
              <Td>{r.partCode}</Td>
              <Td>{r.partName}</Td>
              <Td>{r.partQuantity.toLocaleString()}</Td>
              <Td>{r.safetyStock.toLocaleString()}</Td>
              <Td>
                <StatusBadge $variant={statusVariant[r.status]}>
                  {r.status}
                </StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
