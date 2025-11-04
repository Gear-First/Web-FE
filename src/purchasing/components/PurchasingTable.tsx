import { Table, Th, Td } from "../../components/common/PageLayout";
import type { PurchasingRecord } from "../PurchasingTypes";

export default function PurchasingTable({
  rows,
  showContractDate = false,
  showOrderCount = false,
  onRowClick,
}: {
  rows: PurchasingRecord[];
  showContractDate?: boolean;
  showOrderCount?: boolean;
  onRowClick?: (record: PurchasingRecord) => void;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>등록번호</Th>
          <Th>업체명</Th>
          <Th>자재명</Th>
          <Th>단가</Th>
          <Th>생산량/일</Th>
          <Th>조사일</Th>
          <Th>유효기간</Th>
          {showOrderCount && <Th>발주 개수</Th>}
          {showContractDate && <Th>선정일</Th>}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows.map((r) => (
            <tr
              key={r.purchasingId}
              style={{ cursor: "pointer" }}
              onClick={() => onRowClick?.(r)}
            >
              <Td>{r.purchasingId}</Td>
              <Td>{r.company}</Td>
              <Td>{r.materialName}</Td>
              <Td>{r.purchasingPrice.toLocaleString()}</Td>
              <Td>
                {Math.ceil(
                  r.requiredQuantityPerPeriod / (r.requiredPeriodInDays || 1)
                )}
                /1일
              </Td>
              <Td>{r.surveyDate}</Td>
              <Td>{r.expiryDate}</Td>
              {showOrderCount && <Td>{r.orderCnt ?? 0}</Td>}
              {showContractDate && (
                <Td>
                  {r.createdAt
                    ? new Date(r.createdAt).toISOString().split("T")[0]
                    : "-"}
                </Td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <Td colSpan={8} style={{ textAlign: "center", color: "#9ca3af" }}>
              등록된 업체가 없습니다.
            </Td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
