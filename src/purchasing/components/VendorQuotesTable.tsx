import { useState, useMemo } from "react";
import { Table, Th, Td } from "../../components/common/PageLayout";
import type { VendorQuote } from "../PurchasingTypes";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";

export default function VendorQuotesTable({
  rows,
  needDate,
  onSelect,
}: {
  rows: (VendorQuote & { selected?: boolean })[]; // 수정됨
  needDate?: string;
  onSelect: (quote: VendorQuote) => void;
}) {
  /** 페이지네이션 상태 */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3); // 최소 5개씩 표시

  /** 현재 페이지 데이터 계산 */
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
  }, [rows, page, pageSize]);

  /** 전체 페이지 수 계산 */
  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  const canMeet = (expiryDate?: string, needDate?: string) => {
    if (!expiryDate || !needDate) return true;
    const exp = new Date(expiryDate);
    const need = new Date(needDate);
    return need <= exp;
  };

  return (
    <div>
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
          {pagedRows.map((c) => {
            const meet = canMeet(c.expiryDate, needDate);
            return (
              <tr key={c.vendorId}>
                <Td>{c.vendorName}</Td>
                <Td>{c.unitPrice}</Td>
                <Td>{c.requiredQuantityPerPeriod}/1일</Td>
                <Td>{c.expiryDate}</Td>
                <Td>
                  <Button
                    disabled={c.selected || !meet}
                    onClick={() => onSelect(c)}
                    color={c.selected ? "gray" : "black"}
                    size="sm"
                  >
                    {c.selected ? "선정 완료" : meet ? "선정" : "유효기간 만료"}
                  </Button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {/* 페이지네이션 */}
      {pagedRows.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(next) => setPage(next)}
          isBusy={false}
          totalItems={rows.length}
          pageSize={pageSize}
          onChangePageSize={(n) => {
            setPageSize(n);
            setPage(1);
          }}
          showSummary={false}
          showPageSize={false}
          align="center"
          dense
          arrowsOnly
        />
      )}
    </div>
  );
}
