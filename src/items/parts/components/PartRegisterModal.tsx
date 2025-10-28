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
} from "../../../components/common/ModalPageLayout";
import Button from "../../../components/common/Button";
import styled from "styled-components";
import { Select } from "../../../components/common/PageLayout";
import type { PartCate } from "../../../bom/BOMTypes";
import MaterialsTable from "../../../bom/components/MaterialsTable";
import type { PartFormModel } from "../PartTypes";

/** Part 등록/수정 DTO */
export type PartDTO = {
  partId?: string; // edit 시에만 존재
  partCode: string;
  partName: string;
  category: PartCate;
  materials: {
    materialCode: string;
    materialName: string;
    materialQty: number;
  }[];
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initial?: PartFormModel | null;
  onSubmit?: (payload: PartFormModel) => void;
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

const PartRegisterModal = ({
  isOpen,
  onClose,
  mode = "create",
  initial = null,
  onSubmit,
}: Props) => {
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
    if (!partCode.trim()) return alert("부품 코드를 입력하세요.");
    if (!partName.trim()) return alert("부품명을 입력하세요.");
    if (!partCate?.trim()) return alert("카테고리를 선택하세요.");
    if (materials.some((m) => !m.materialCode.trim() || !m.materialName.trim()))
      return alert("자재 코드/명을 입력하세요.");
    if (
      materials.some((m) => m.materialQty === "" || Number(m.materialQty) <= 0)
    )
      return alert("자재 수량은 1 이상이어야 합니다.");

    const payload: PartFormModel = {
      ...(initial?.partId ? { partId: initial.partId } : {}),
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
            <Title>{mode === "edit" ? "부품 수정" : "부품 등록"}</Title>
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
              <Select
                style={{ width: "50%" }}
                value={partCate}
                onChange={(e) => setPartCate(e.target.value as PartCate)}
              >
                {cateOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
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

          <div ref={listRef}>
            <MaterialsTable
              rows={materials}
              onChange={updateMaterial}
              onRemove={removeMaterial}
              maxHeight={220}
              compact
            />
          </div>
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

export default PartRegisterModal;

// 상단 자재 목록 행
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

// 모달 상단 인풋
const Input = styled.input`
  width: 50%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.92rem;
  background: #fff;
`;

// 하단 액션
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
