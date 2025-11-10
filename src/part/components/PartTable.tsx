import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { PartRecord, PartStatus } from "../PartTypes";
// import { fmtDate } from "../../utils/string";

// 요청 상태
const statusVariant: Record<PartStatus, "rejected" | "info" | "success"> = {
  적정: "info",
  여유: "success",
  부족: "rejected",
};

export default function PartTable({ rows }: { rows: PartRecord[] }) {
  // 상태 계산 로직
  const getStatus = (r: PartRecord): PartStatus => {
    if (r.lowStock) return "부족";
    if (r.onHandQty <= r.safetyStockQty * 1.2) return "적정";
    return "여유";
  };
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>창고</Th>
            <Th>부품 코드</Th>
            <Th>부품명</Th>
            <Th>가용 재고</Th>
            <Th>안전 재고</Th>
            <Th>대리점</Th>
            {/* <Th>수정일</Th> */}
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, i) => {
              const status = getStatus(r);
              return (
                <tr key={i}>
                  <Td>{r.warehouseCode}</Td>
                  <Td>{r.part.code}</Td>
                  <Td>{r.part.name}</Td>
                  <Td>{r.onHandQty.toLocaleString()}</Td>
                  <Td>{r.safetyStockQty.toLocaleString()}</Td>
                  <Td>{r.supplierName}</Td>
                  {/* <Td>{fmtDate(r.updatedAt)}</Td> */}
                  <Td>
                    <StatusBadge $variant={statusVariant[status]}>
                      {status}
                    </StatusBadge>
                  </Td>
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
