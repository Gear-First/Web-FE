import { useRef, useState, useEffect } from "react";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Header,
  HeaderLeft,
  Input,
  Label,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";
import styled from "styled-components";
import MaterialsTable, { type MaterialRow } from "./MaterialsTable";
import PartSearchModal from "./PartSearchModal";
import MaterialSearchModal from "./MaterialSearchModal";
import type { PartRecord } from "../../items/parts/PartTypes";
import type { MaterialRecord } from "../../items/materials/MaterialTypes";

export type BOMDTO = {
  bomId?: string;
  partCode?: string;
  partName?: string;
  category?: string;
  createdDate?: string;
  materials?: Array<{
    materialId?: number;
    materialCode: string;
    materialName: string;
    materialQty: number;
  }>;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initial?: BOMDTO | null;
  onSubmit?: (payload: AddMaterialsPayload) => void;
}

export type AddMaterialsPayload = {
  partId: number;
  materialInfos: Array<{
    materialId: number;
    quantity: number;
  }>;
};

const BOMRegisterModal = ({
  isOpen,
  onClose,
  mode = "create",
  initial = null,
  onSubmit,
}: Props) => {
  const [partId, setPartId] = useState<number | "">("");

  const [partCode, setPartCode] = useState("");
  const [partName, setPartName] = useState("");
  const [partCate, setPartCate] = useState("");

  const createEmptyMaterialRow = (): MaterialRow => ({
    id: crypto.randomUUID(),
    materialId: "" as number | "",
    materialCode: "",
    materialName: "",
    materialQty: 1 as number | "",
  });

  const [materials, setMaterials] = useState<MaterialRow[]>([
    createEmptyMaterialRow(),
  ]);

  const [isPartSearchOpen, setPartSearchOpen] = useState(false);

  const [isMaterialSearchOpen, setMaterialSearchOpen] = useState(false);
  const [materialSearchRowId, setMaterialSearchRowId] = useState<string | null>(
    null
  );

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initial) {
      setPartId(
        Number.isInteger(Number(initial.bomId)) ? Number(initial.bomId) : ""
      );

      setPartCode(initial.partCode ?? "");
      setPartName(initial.partName ?? "");
      setPartCate(initial.category ?? "");

      setMaterials(
        (initial.materials?.length
          ? initial.materials
          : [
              {
                materialId: undefined,
                materialCode: "",
                materialName: "",
                materialQty: 1,
              },
            ]
        ).map((m) => ({
          id: crypto.randomUUID(),
          materialId: (m.materialId ?? "") as number | "",
          materialCode: m.materialCode ?? "",
          materialName: m.materialName ?? "",
          materialQty: m.materialQty ?? 1,
        }))
      );
    } else {
      setPartId("");
      setPartCode("");
      setPartName("");
      setPartCate("");
      setMaterials([createEmptyMaterialRow()]);
    }
  }, [isOpen, mode, initial]);

  const removeMaterial = (id: string) => {
    setMaterials((arr) => {
      // 행이 하나뿐이면 내용만 초기화
      if (arr.length === 1) {
        return [
          {
            ...arr[0],
            materialId: "",
            materialCode: "",
            materialName: "",
            materialQty: 1,
          },
        ];
      }

      // 여러 개면 해당 행 제거
      return arr.filter((m) => m.id !== id);
    });
  };

  const removeAllMaterials = () => {
    if (materials.length === 0) return;

    const confirmReset = window.confirm("모든 자재 정보를 초기화하시겠습니까?");
    if (!confirmReset) return;

    // 자재 행이 1개면 내용만 비우고 유지
    if (materials.length === 1) {
      setMaterials([
        {
          ...materials[0],
          materialId: "",
          materialCode: "",
          materialName: "",
          materialQty: 1,
        },
      ]);
      return;
    }

    // 여러 개면 전체 삭제 후 1개 비어있는 행만 남김
    setMaterials([
      {
        id: crypto.randomUUID(),
        materialId: "",
        materialCode: "",
        materialName: "",
        materialQty: 1,
      },
    ]);
  };

  const updateMaterial = <K extends keyof MaterialRow>(
    id: string,
    key: K,
    value: MaterialRow[K]
  ) => {
    setMaterials((arr) =>
      arr.map((m) => {
        if (m.id !== id) return m;
        const next = { ...m, [key]: value };
        if (key === "materialCode" || key === "materialName") {
          return { ...next, materialId: "" };
        }
        return next;
      })
    );
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [materials.length]);

  const handleSubmit = () => {
    if (partId === "" || !Number.isInteger(Number(partId)))
      return alert("부품을 검색하여 선택하세요.");

    if (materials.some((m) => m.materialId === ""))
      return alert("모든 자재의 ID를 검색/선택하세요.");

    if (
      materials.some((m) => m.materialQty === "" || Number(m.materialQty) <= 0)
    )
      return alert("자재 수량은 1 이상이어야 합니다.");

    const payload: AddMaterialsPayload = {
      partId: Number(partId),
      materialInfos: materials.map((m) => ({
        materialId: Number(m.materialId),
        quantity: Number(m.materialQty),
      })),
    };

    onSubmit?.(payload);
    onClose();
  };

  if (!isOpen) return null;

  const onSelectPart = (part: PartRecord) => {
    const numericId = Number(part.partId);
    if (!Number.isFinite(numericId)) {
      alert("선택한 부품 ID가 유효하지 않습니다.");
      return;
    }

    setPartId(numericId);
    setPartCode(part.partCode);
    setPartName(part.partName);
    setPartCate(part.category?.name ?? "");
    setMaterials([createEmptyMaterialRow()]);
  };

  const onSelectMaterial = (material: MaterialRecord) => {
    const numericId = Number(material.id);
    if (!Number.isFinite(numericId)) {
      alert("선택한 자재 ID가 유효하지 않습니다.");
      return;
    }

    const targetRowId = materialSearchRowId;
    const dupIdx = materials.findIndex((r) => r.materialId === numericId);
    if (targetRowId) {
      const targetIdx = materials.findIndex((r) => r.id === targetRowId);
      if (dupIdx >= 0 && dupIdx !== targetIdx) {
        alert("이미 선택된 자재입니다. 동일 자재를 중복 추가할 수 없습니다.");
        setMaterialSearchOpen(false);
        setMaterialSearchRowId(null);
        return;
      }
    } else {
      if (dupIdx >= 0) {
        alert("이미 선택된 자재입니다. 동일 자재를 중복 추가할 수 없습니다.");
        setMaterialSearchOpen(false);
        setMaterialSearchRowId(null);
        return;
      }
    }

    setMaterials((prev) => {
      if (targetRowId) {
        return prev.map((row) =>
          row.id === targetRowId
            ? {
                ...row,
                materialId: numericId,
                materialCode: material.materialCode,
                materialName: material.materialName,
                materialQty: row.materialQty || 1,
              }
            : row
        );
      }

      const emptyIdx = prev.findIndex((r) => r.materialId === "");
      if (emptyIdx >= 0) {
        const next = [...prev];
        next[emptyIdx] = {
          ...next[emptyIdx],
          materialId: numericId,
          materialCode: material.materialCode,
          materialName: material.materialName,
          materialQty: next[emptyIdx].materialQty || 1,
        };
        return next;
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          materialId: numericId,
          materialCode: material.materialCode,
          materialName: material.materialName,
          materialQty: 1,
        },
      ];
    });

    setMaterialSearchOpen(false);
    setMaterialSearchRowId(null);
  };

  return (
    <>
      <Overlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <Header>
            <HeaderLeft>
              <Title>
                {mode === "edit"
                  ? "BOM 수정(자재 등록)"
                  : "BOM 등록(자재 등록)"}
              </Title>
            </HeaderLeft>
            <CloseButton onClick={onClose} aria-label="닫기">
              &times;
            </CloseButton>
          </Header>

          <Section>
            <SectionTitle>부품 정보</SectionTitle>
            <DetailGrid>
              <DetailItem>
                <Label>부품 선택</Label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Button onClick={() => setPartSearchOpen(true)}>
                    부품 검색
                  </Button>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>
                    {partId
                      ? `선택됨: ${partCode} / ${partName} (ID: ${partId})`
                      : "미선택"}
                  </span>
                </div>
              </DetailItem>
            </DetailGrid>

            <DetailGrid style={{ marginTop: "1rem" }}>
              <DetailItem>
                <Label>부품 코드</Label>
                <Input
                  value={partCode}
                  onChange={(e) => setPartCode(e.target.value)}
                  readOnly
                />
              </DetailItem>

              <DetailItem>
                <Label>부품명</Label>
                <Input
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  readOnly
                />
              </DetailItem>

              <DetailItem>
                <Label>부품 카테고리</Label>
                <Input
                  style={{ width: "50%" }}
                  value={partCate}
                  onChange={(e) => setPartCate(e.target.value)}
                  readOnly
                />
              </DetailItem>
            </DetailGrid>
          </Section>

          <Section>
            <HeaderRow>
              <SectionTitle>자재 목록</SectionTitle>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  onClick={() => {
                    setMaterialSearchRowId(null);
                    setMaterialSearchOpen(true);
                  }}
                >
                  자재 검색
                </Button>
                <Button
                  onClick={() => {
                    removeAllMaterials();
                  }}
                >
                  초기화
                </Button>
              </div>
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

      <PartSearchModal
        isOpen={isPartSearchOpen}
        onClose={() => setPartSearchOpen(false)}
        onSelect={onSelectPart}
      />

      <MaterialSearchModal
        isOpen={isMaterialSearchOpen}
        onClose={() => {
          setMaterialSearchOpen(false);
          setMaterialSearchRowId(null);
        }}
        onSelect={onSelectMaterial}
      />
    </>
  );
};

export default BOMRegisterModal;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
