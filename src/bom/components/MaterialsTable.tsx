import { styled } from "styled-components";
import { Th, Td } from "../../components/common/PageLayout";
import { TableScroll, StickyTable } from "../../components/common/ScrollTable";
import type { ReactNode } from "react";
import { Input } from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";

// 상단에 추가
const CellInput = styled(Input)`
  width: 100%;
  box-sizing: border-box;
`;

// 필요하면 셀도 감싸서 overflow 제어
const Cell = styled(Td)`
  overflow: hidden;
`;

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
              {/* 빈행일 때는 colSpan 지정 안 하면 셀 깨집니다 */}
              <Td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                자재 행이 없습니다.
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Cell>
                  <CellInput
                    value={row.materialCode}
                    onChange={(e) =>
                      onChange(row.id, "materialCode", e.target.value)
                    }
                    readOnly
                  />
                </Cell>
                <Cell>
                  <CellInput
                    value={row.materialName}
                    onChange={(e) =>
                      onChange(row.id, "materialName", e.target.value)
                    }
                    readOnly
                  />
                </Cell>
                <Cell>
                  <CellInput
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
                </Cell>
                <Cell>
                  <Button color="danger" onClick={() => onRemove(row.id)}>
                    삭제
                  </Button>
                </Cell>
              </tr>
            ))
          )}
        </tbody>
      </StickyTable>
    </TableScroll>
  );
}
