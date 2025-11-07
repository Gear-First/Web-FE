import { Table, Th, Td } from "../../components/common/PageLayout";
import type { PropertyRecord } from "../PropertyTypes";

export default function PropertyTable({ rows }: { rows: PropertyRecord[] }) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>창고</Th>
            <Th>부품 코드</Th>
            <Th>부품명</Th>
            <Th>수량</Th>
            <Th>대리점</Th>
            <Th>단가</Th>
            <Th>총 금액</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, i) => {
              return (
                <tr key={i}>
                  <Td>{r.warehouseCode}</Td>
                  <Td>{r.part.code}</Td>
                  <Td>{r.part.name}</Td>
                  <Td>{r.onHandQty}</Td>
                  <Td>{r.supplierName}</Td>
                  <Td>{r.price.toLocaleString()}</Td>
                  <Td>{r.priceTotal.toLocaleString()}</Td>
                </tr>
              );
            })
          ) : (
            <tr>
              <Td colSpan={6} style={{ textAlign: "center", color: "#6b7280" }}>
                재고 데이터가 없습니다.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
