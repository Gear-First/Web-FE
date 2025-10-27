import { styled } from "styled-components";
import { Th, Td } from "../../components/common/PageLayout";
import { TableScroll, StickyTable } from "../../components/common/ScrollTable";

type MaterialRow = {
  id: string;
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
};

export default function MaterialsTable({
  rows,
  onChange,
  onRemove,
  maxHeight = 200,
  compact = true,
  verticalLines = true,
}: Props) {
  return (
    <ScrollWithRightRail $maxHeight={maxHeight}>
      <GridTable
        $compact={compact}
        $verticalLines={verticalLines}
        $colWidths={["33%", "44%", "23%"]}
      >
        <thead>
          <tr>
            <MT_Th>자재 코드</MT_Th>
            <MT_Th>자재명</MT_Th>
            <MT_Th>자재 수량</MT_Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <Td>
                <CellInput
                  placeholder="예) MAT-BLD-130"
                  value={m.materialCode}
                  onChange={(e) =>
                    onChange(m.id, "materialCode", e.target.value)
                  }
                />
              </Td>
              <Td>
                <CellInput
                  placeholder="예) 팬 블레이드"
                  value={m.materialName}
                  onChange={(e) =>
                    onChange(m.id, "materialName", e.target.value)
                  }
                />
              </Td>

              <ActionCell>
                <CellNumber
                  min={1}
                  placeholder="1"
                  value={m.materialQty}
                  onChange={(e) =>
                    onChange(
                      m.id,
                      "materialQty",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
                <RowDeleteBtn
                  type="button"
                  onClick={() => onRemove(m.id)}
                  aria-label="행 삭제"
                  title="삭제"
                >
                  ×
                </RowDeleteBtn>
              </ActionCell>
            </tr>
          ))}
        </tbody>
      </GridTable>
    </ScrollWithRightRail>
  );
}

const ScrollWithRightRail = styled(TableScroll)``;

const GridTable = styled(StickyTable)`
  thead th {
    /* StickyTable에도 있지만 여기서 우선순위 높여서 보강 */
    position: sticky;
    top: 0;
    z-index: 5; /* ⬅ 헤더가 가장 위 */
    background: #fafbfc;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb; /* ⬅ 하단 라인 고정 */
    // box-shadow: inset 0 -1px 0 #e5e7eb; /* ⬅ 경계선 보강(스크롤 시 깜빡임 방지) */
  }
`;

const MT_Th = styled(Th)`
  border-top: px solid #f0f0f0;
`;
const ActionCell = styled(Td)`
  position: relative;
  padding-right: 40px; /* input과 버튼 간격 */
  border-right: none; /* 끝선 제거(선택) */
  border-top: none;
`;

const CellInput = styled.input.attrs({ type: "text" })`
  width: 90%;
  border: none;
  background: transparent;
  padding: 6px 4px;
  font-size: 0.9rem;
  text-align: left;
  outline: none;
  color: #111827;

  &:focus {
    outline: none;
    border: none;
    background: transparent;
  }
  &::placeholder {
    color: #9ca3af;
  }
`;

const CellNumber = styled(CellInput).attrs({
  type: "number",
  inputMode: "numeric",
})`
  width: 70%;
  text-align: right;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const RowDeleteBtn = styled.button`
  position: absolute;
  top: 50%;
  right: 6px; /* ⬅ 표 '안쪽 레일'로 이동 (더 이상 -30px 금지) */
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  background: transparent; /* 기본 투명 */
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  display: grid;
  place-items: center;
  transition: background 0.15s, color 0.15s;
  z-index: 1; /* ⬅ 헤더(z-index:5)보다 낮게 */

  &:hover {
    background: #d9d9d9; /* 호버 시만 회색 */
    color: #111827;
  }
`;
