import { Table, Th, Td } from "../../components/common/PageLayout";
import type { VendorQuote } from "../PurchasingTypes";
import Button from "../../components/common/Button";

export default function VendorQuotesTable({
  rows,
  needDate,
  onSelect,
}: {
  rows: VendorQuote[];
  needDate?: string;
  onSelect: (quote: VendorQuote) => void;
}) {
  const canMeet = (expiryDate?: string, needDate?: string) => {
    if (!expiryDate || !needDate) return true;
    const exp = new Date(expiryDate);
    const need = new Date(needDate);
    return need <= exp;
  };

  return (
    <Table>
      <thead>
        <tr>
          <Th>공급업체</Th>
          <Th>단가</Th>
          <Th>소요시기</Th>
          <Th>유효기간</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <Td colSpan={6} style={{ textAlign: "center", color: "#9ca3af" }}>
              후보 없음
            </Td>
          </tr>
        )}
        {rows.map((c) => {
          const meet = canMeet(c.expiryDate, needDate);
          return (
            <tr key={c.vendorId}>
              <Td>{c.vendorName}</Td>
              <Td>{c.unitPrice}</Td>
              <Td>
                {c.requiredQuantityPerPeriod}/{c.requiredPeriodInDays}일
              </Td>
              <Td>{c.expiryDate}</Td>
              <Td>
                <Button
                  disabled={!meet}
                  onClick={() => onSelect(c)}
                  color={meet ? "black" : "gray"}
                  size="sm"
                  onMouseEnter={(e) => {
                    if (meet) e.currentTarget.style.opacity = "0.85";
                  }}
                  onMouseLeave={(e) => {
                    if (meet) e.currentTarget.style.opacity = "1";
                  }}
                >
                  {meet ? "선정" : "유효기간 만료"}
                </Button>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
