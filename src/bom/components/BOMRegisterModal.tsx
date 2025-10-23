import { useRef, useState, useEffect } from "react";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Header,
  HeaderLeft,
  Label,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";
import styled from "styled-components";
import { Table, Td, Th } from "../../components/common/PageLayout";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type MaterialRow = {
  id: string;
  materialCode: string;
  materialName: string;
  materialQty: number | "";
};

const BOMRegisterModal = ({ isOpen, onClose }: Props) => {
  const [bomNo, setBomNo] = useState("");
  const [partCode, setPartCode] = useState("");
  const [partName, setPartName] = useState("");
  const [materials, setMaterials] = useState<MaterialRow[]>([
    {
      id: crypto.randomUUID(),
      materialCode: "",
      materialName: "",
      materialQty: 1,
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const addMaterial = () => {
    setMaterials((arr) => [
      ...arr,
      {
        id: crypto.randomUUID(),
        materialCode: "",
        materialName: "",
        materialQty: 1,
      },
    ]);
  };

  const removeMaterial = (id: string) => {
    if (materials.length === 1) return;
    setMaterials((arr) => arr.filter((m) => m.id !== id));
  };

  const updateMaterial = <K extends keyof MaterialRow>(
    id: string,
    key: K,
    value: MaterialRow[K]
  ) => {
    setMaterials((arr) =>
      arr.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );
  };

  const handleRegister = () => {
    onClose();
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [materials.length]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>BOM 등록</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        {/* 부품 등록 */}
        <Section>
          <SectionTitle>부품 등록</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>BOM 번호</Label>
              <Input
                placeholder="예) BOM-250101-05"
                value={bomNo}
                onChange={(e) => setBomNo(e.target.value)}
              />
            </DetailItem>

            <DetailItem>
              <Label>부품 코드</Label>
              <Input
                placeholder="예) PRT-FAN-501"
                value={partCode}
                onChange={(e) => setPartCode(e.target.value)}
              />
            </DetailItem>

            <DetailItem>
              <Label>부품명</Label>
              <Input
                placeholder="예) 냉각 팬"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
              />
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 자재 등록 */}
        <Section>
          <HeaderRow>
            <SectionTitle>자재 등록</SectionTitle>
            <Button
              style={{ backgroundColor: "#ffffff", color: "black" }}
              onClick={addMaterial}
            >
              자재 추가
            </Button>
          </HeaderRow>

          <MaterialsScroll ref={listRef}>
            <StickyTable>
              <thead>
                <tr>
                  <Th style={{ width: "30%" }}>자재 코드</Th>
                  <Th>자재명</Th>
                  <Th style={{ width: "14%" }}>자재 수량</Th>
                  <Th style={{ width: "64px" }} />
                </tr>
              </thead>
              <tbody>
                {materials.map((m, idx) => (
                  <tr key={m.id}>
                    <Td>
                      <CellInput
                        placeholder="예) MAT-BLD-130"
                        value={m.materialCode}
                        onChange={(e) =>
                          updateMaterial(m.id, "materialCode", e.target.value)
                        }
                      />
                    </Td>
                    <Td>
                      <CellInput
                        placeholder="예) 팬 블레이드"
                        value={m.materialName}
                        onChange={(e) =>
                          updateMaterial(m.id, "materialName", e.target.value)
                        }
                      />
                    </Td>
                    <Td>
                      <CellNumberInput
                        min={1}
                        placeholder="1"
                        value={m.materialQty}
                        onChange={(e) =>
                          updateMaterial(
                            m.id,
                            "materialQty",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                    </Td>
                    <Td style={{ textAlign: "right" }}>
                      <SmallGhostBtn
                        type="button"
                        onClick={() => removeMaterial(m.id)}
                        aria-label="행 삭제"
                        title="삭제"
                      >
                        ×
                      </SmallGhostBtn>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </StickyTable>
          </MaterialsScroll>
        </Section>

        {/* 액션 */}
        <Section>
          <Actions>
            <Button color="gray" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleRegister}>등록</Button>
          </Actions>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default BOMRegisterModal;

/* 상단 "자재 등록" 행 */
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* 모달 상단 인풋(부품 등록) */
const Input = styled.input`
  width: 50%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.92rem;
  background: #fff;
  transition: box-shadow 0.12s, border-color 0.12s;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.28);
    border-color: #93c5fd;
  }
  &[aria-invalid="true"] {
    border-color: #ef4444;
  }
`;

/* 자재 테이블 전용 인풋(셀 폭 100%) */
const CellInput = styled(Input)`
  width: 50%;
`;
const CellNumberInput = styled(CellInput).attrs({ type: "number" })``;

/* 하단 액션 */
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

/* 삭제 버튼 */
const SmallGhostBtn = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 6px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

/* 자재 테이블 */
const MaterialsScroll = styled.div`
  max-height: 360px; /* 필요에 따라 320~420px 조절 */
  overflow: auto;
  border: 1px solid #edf1f5;
  border-radius: 10px;
`;

/* sticky thead + 줄간격 최적화 */
const StickyTable = styled(Table)`
  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #fafbfc;
  }
  tbody tr:nth-child(even) td {
    background: #fcfdff;
  }
`;
