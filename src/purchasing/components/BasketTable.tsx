import { Table, Th, Td } from "../../components/common/PageLayout";
import type { BasketLine } from "../PurchasingTypes";
import Button from "../../components/common/Button";

export default function BasketTable({
  lines,
  onChangeQty,
  onRemove,
  onCreatePO,
}: {
  lines: BasketLine[];
  onChangeQty: (itemCode: string, qty: number) => void;
  onRemove: (itemCode: string) => void;
  onCreatePO: () => void;
}) {
  const total = lines.reduce((s, l) => s + l.orderQty * l.unitPrice, 0);

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <Th>자재</Th>
            <Th>공급업체</Th>
            <Th>주문수량</Th>
            <Th>단가</Th>
            <Th>금액</Th>
            {/* <Th>도착예정일</Th> */}
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <Td colSpan={7} style={{ textAlign: "center", color: "#9ca3af" }}>
                선택된 항목이 없습니다.
              </Td>
            </tr>
          )}
          {lines.map((b) => (
            <tr key={`${b.materialCode}-${b.vendorId}`}>
              <Td>{b.materialName}</Td>
              <Td>{b.vendorName}</Td>
              <Td>
                <input
                  type="number"
                  value={b.orderQty}
                  onChange={(e) =>
                    onChangeQty(b.materialCode, Number(e.target.value) || 0)
                  }
                  style={{
                    width: 96,
                    textAlign: "right",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "4px 6px",
                  }}
                />
              </Td>
              <Td>{b.unitPrice.toLocaleString()}</Td>
              <Td>{(b.orderQty * b.unitPrice).toLocaleString()}</Td>
              {/* <Td>{b.eta}</Td> */}
              <Td>
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => onRemove(b.materialCode)}
                >
                  삭제
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 총 금액 표시 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "#111827",
            fontWeight: 500,
          }}
        >
          총 금액:{" "}
          <b style={{ fontSize: 16, color: "#000" }}>
            {total.toLocaleString()}
          </b>{" "}
          원
        </div>
      </div>

      {/* 버튼 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 8,
        }}
      >
        <Button color="black" onClick={onCreatePO}>
          PO 생성
        </Button>
      </div>
    </div>
  );
}
