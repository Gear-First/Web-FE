import { Table, Th, Td } from "../../components/common/PageLayout";
import type { PropertyRecord } from "../PropertyTypes";

export default function PropertyTable({ rows }: { rows: PropertyRecord[] }) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>창고 번호</Th>
            <Th>부품 코드</Th>
            <Th>부품명</Th>
            <Th>수량</Th>
            <Th>단가</Th>
            <Th>총 금액</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>{r.warehouseId}</Td>
              <Td>{r.partCode}</Td>
              <Td>{r.partName}</Td>
              <Td>{r.partQuantity.toLocaleString()}</Td>
              <Td>₩{r.partPrice.toLocaleString()}</Td>
              <Td>₩{(r.partQuantity * r.partPrice).toLocaleString()}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
