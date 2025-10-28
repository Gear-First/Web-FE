import { Table, Th, Td } from "../../components/common/PageLayout";
import type { PurchasingRecord } from "../PurchasingTypes";

export default function PurchasingTable({
  rows,
  showContractDate = true,
  onRowClick,
}: {
  rows: PurchasingRecord[];
  showContractDate?: boolean;
  onRowClick?: (record: PurchasingRecord) => void;
}) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>요청 번호</Th>
            <Th>자재</Th>
            <Th>요청 수량</Th>
            <Th>조사일</Th>
            {showContractDate ? <Th>계약일</Th> : null}
            <Th>공급업체</Th>
            <Th>단가</Th>
            <Th>유효기간</Th>
            <Th>소요시기</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.purchasingId}
              style={{ cursor: "pointer" }}
              onClick={() => onRowClick?.(r)}
            >
              <Td>{r.purchasingId}</Td>
              <Td>{r.materialName}</Td>
              <Td>{r.purchasingQuantity.toLocaleString()}</Td>
              <Td>{r.surveyDate}</Td>
              {showContractDate && <Td>{r.purchasingDate}</Td>}
              <Td>{r.company}</Td>
              <Td>{r.purchasingPrice.toLocaleString()}</Td>
              <Td>{r.expiryDate}</Td>
              <Td>
                {r.requiredQuantityPerPeriod}/{r.requiredPeriodInDays}일
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
