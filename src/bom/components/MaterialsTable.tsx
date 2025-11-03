import { styled } from "styled-components";
import { Th, Td } from "../../components/common/PageLayout";
import { TableScroll, StickyTable } from "../../components/common/ScrollTable";
import type { ReactNode } from "react";
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
  renderSearchButton,
}: Props) {
  return (
    <TableScroll $maxHeight={maxHeight}>
      <StickyTable
        $stickyTop={0}
        $headerBg="#fafbfc"
        $zebra
        $verticalLines={verticalLines}
      >
        <thead>
          <tr>
            <Th style={{ width: 140 }}>자재코드</Th>
            <Th>자재명</Th>
            <Th style={{ width: 120 }}>수량</Th>
            {renderSearchButton && <Th style={{ width: 120 }}>검색</Th>}
            <Th style={{ width: 90 }}>삭제</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <Td
                colSpan={renderSearchButton ? 5 : 4}
                style={{ textAlign: "center", color: "#6b7280" }}
              >
                자재 행이 없습니다.
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <Input
                    value={row.materialCode}
                    onChange={(e) =>
                      onChange(row.id, "materialCode", e.target.value)
                    }
                    readOnly
                  />
                </Td>
                <Td>
                  <Input
                    value={row.materialName}
                    onChange={(e) =>
                      onChange(row.id, "materialName", e.target.value)
                    }
                    readOnly
                  />
                </Td>
                <Td>
                  <Input
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

                {renderSearchButton && <Td>{renderSearchButton(row)}</Td>}

                <Td>
                  <DeleteBtn type="button" onClick={() => onRemove(row.id)}>
                    삭제
                  </DeleteBtn>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </StickyTable>
    </TableScroll>
  );
}

/* ---------- styled ---------- */

const DeleteBtn = styled.button`
  border: 1px solid #ef4444;
  color: #ef4444;
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background: #fee2e2;
  }
`;
