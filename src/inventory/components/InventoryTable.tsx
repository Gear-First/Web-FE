import { Table, Th, Td } from "../../components/common/PageLayout";
import type { InventoryRecord } from "../InventoryTypes";

export default function InventoryTable({ rows }: { rows: InventoryRecord[] }) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>창고 번호</Th>
            <Th>부품 코드</Th>
            <Th>부품명</Th>
            <Th>수량</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>{r.warehouseId}</Td>
              <Td>{r.inventoryCode}</Td>
              <Td>{r.inventoryName}</Td>
              <Td>{r.inventoryQuantity.toLocaleString()}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
