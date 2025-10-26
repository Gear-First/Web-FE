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
import {
  Table,
  Td,
  Th,
  Select as PLSelect,
} from "../../components/common/PageLayout";
import type { BOMDTO, PartCate } from "../BOMTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initial?: BOMDTO | null;
  onSubmit?: (payload: BOMDTO) => void;
}

// UI 전용 행 타입
type MaterialRow = {
  id: string;
  materialCode: string;
  materialName: string;
  materialQty: number | "";
};

const cateOptions: PartCate[] = [
  "카테고리 A",
  "카테고리 B",
  "카테고리 C",
  "카테고리 D",
];

const BOMRegisterModal = ({
  isOpen,
  onClose,
  mode = "create",
  initial = null,
  onSubmit,
}: Props) => {
  const [bomNo, setBomNo] = useState(""); // = bomId
  const [partCode, setPartCode] = useState("");
  const [partName, setPartName] = useState("");
  const [partCate, setPartCate] = useState<PartCate>("카테고리 A");
  const [materials, setMaterials] = useState<MaterialRow[]>([
    {
      id: crypto.randomUUID(),
      materialCode: "",
      materialName: "",
      materialQty: 1,
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  /* 초기값 주입 */
  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initial) {
      setBomNo(initial.bomId ?? "");
      setPartCode(initial.partCode ?? "");
      setPartName(initial.partName ?? "");
      setPartCate(initial.category ?? "카테고리 A");
      setMaterials(
        (initial.materials?.length
          ? initial.materials
          : [{ materialCode: "", materialName: "", materialQty: 1 }]
        ).map((m) => ({ id: crypto.randomUUID(), ...m }))
      );
    } else {
      setBomNo("");
      setPartCode("");
      setPartName("");
      setPartCate("카테고리 A");
      setMaterials([
        {
          id: crypto.randomUUID(),
          materialCode: "",
          materialName: "",
          materialQty: 1,
        },
      ]);
    }
  }, [isOpen, mode, initial]);

  /* 자재 행 추가 시 자동 스크롤 */
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [materials.length]);

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

  const handleSubmit = () => {
    if (!bomNo.trim()) return alert("BOM 번호를 입력하세요.");
    if (!partCode.trim()) return alert("부품 코드를 입력하세요.");
    if (!partName.trim()) return alert("부품명을 입력하세요.");
    if (!partCate?.trim()) return alert("카테고리를 선택하세요.");
    if (materials.some((m) => !m.materialCode.trim() || !m.materialName.trim()))
      return alert("자재 코드/명을 입력하세요.");
    if (
      materials.some((m) => m.materialQty === "" || Number(m.materialQty) <= 0)
    )
      return alert("자재 수량은 1 이상이어야 합니다.");

    const payload: BOMDTO = {
      bomId: bomNo.trim(),
      partCode: partCode.trim(),
      partName: partName.trim(),
      category: partCate,
      materials: materials.map((m) => ({
        materialCode: m.materialCode.trim(),
        materialName: m.materialName.trim(),
        materialQty: Number(m.materialQty),
      })),
    };

    onSubmit?.(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>{mode === "edit" ? "BOM 수정" : "BOM 등록"}</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>BOM 번호</Label>
              <Input
                placeholder="예) BOM-250101-05"
                value={bomNo}
                onChange={(e) => setBomNo(e.target.value)}
                disabled={mode === "edit"} // 수정 시 식별자 잠금 권장
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

            <DetailItem>
              <Label>부품 카테고리</Label>
              <PLSelect
                style={{ width: "50%" }}
                value={partCate}
                onChange={(e) => setPartCate(e.target.value as PartCate)}
              >
                {cateOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </PLSelect>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 자재 목록 */}
        <Section>
          <HeaderRow>
            <SectionTitle>자재 목록</SectionTitle>
            <Button color="gray" onClick={addMaterial}>
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
                  <Th style={{ width: 64 }} />
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
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
            <Button onClick={handleSubmit}>
              {mode === "edit" ? "수정 저장" : "등록"}
            </Button>
          </Actions>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default BOMRegisterModal;

// 상단 자재 목록 행
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

//모달 상단 인풋
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

// 자재 테이블 전용 인풋(셀 폭 100%)
const CellInput = styled(Input)`
  width: 50%;
`;
const CellNumberInput = styled(CellInput).attrs({ type: "number" })``;

// 하단 액션
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

// 삭제 버튼
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

// 자재 테이블
const MaterialsScroll = styled.div`
  max-height: 360px;
  overflow: auto;
  border: 1px solid #edf1f5;
  border-radius: 10px;
`;

// sticky thead
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
