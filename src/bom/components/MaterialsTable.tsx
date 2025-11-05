import { styled } from "styled-components";
import { Th, Td } from "../../components/common/PageLayout";
import { TableScroll, StickyTable } from "../../components/common/ScrollTable";
import type { ReactNode } from "react";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/ModalPageLayout";

export type MaterialRow = {
  id: string;
  materialId: number | "";
  materialCode: string;
  materialName: string;
  materialQty: number | "";
};

type Props = {
  rows: MaterialRow[];
  onChange: <K extends keyof MaterialRow>(
    id: string,
    key: K,
    value: MaterialRow[K]
  ) => void;
  onRemove: (id: string) => void;
  maxHeight?: number | string;
  compact?: boolean;
  verticalLines?: boolean;
  sticky?: boolean;
  renderSearchButton?: (row: MaterialRow) => ReactNode;
};

export default function MaterialsTable({
  rows,
  onChange,
  onRemove,
  maxHeight = 220,
  verticalLines = true,
}: Props) {
  return (
    <TableScroll $maxHeight={maxHeight}>
      <StickyTable
        $colWidths={["30%", "30%", "10%", "10%"]}
        $stickyTop={0}
        $headerBg="#fafbfc"
        $zebra
        $verticalLines={verticalLines}
      >
        <thead>
          <tr>
            <Th>자재코드</Th>
            <Th>자재명</Th>
            <Th>수량</Th>
            <Th>삭제</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                자재 행이 없습니다.
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <CellValue data-empty={!row.materialCode}>
                    {row.materialCode || "자재를 선택해주세요"}
                  </CellValue>
                </Td>

                <Td>
                  <CellValue data-empty={!row.materialName}>
                    {row.materialName || "자재를 선택해주세요"}
                  </CellValue>
                </Td>

                <Td>
                  <QtyInput
                    type="number"
                    min={1}
                    value={row.materialQty}
                    onChange={(e) =>
                      onChange(
                        row.id,
                        "materialQty",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </Td>

                <Td>
                  <Button color="danger" onClick={() => onRemove(row.id)}>
                    삭제
                  </Button>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </StickyTable>
    </TableScroll>
  );
}

const CellValue = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #111827;

  &[data-empty="true"] {
    color: #9ca3af;
  }
`;

const QtyInput = styled(Input)`
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;

  &:focus {
    border-color: #cbd5e1;
  }
`;
