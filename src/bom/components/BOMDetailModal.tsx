import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BOMRecord, DeleteBOMMaterialsDTO, Material } from "../BOMTypes";
import { bomKeys, fetchBOMMaterials } from "../BOMApi";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Footer,
  Header,
  HeaderLeft,
  Label,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
  Value,
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";
import { Td, Th } from "../../components/common/PageLayout";
import { StickyTable, TableScroll } from "../../components/common/ScrollTable";

type Props = {
  record: BOMRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (record: BOMRecord) => void;
  onDelete?: (dto: DeleteBOMMaterialsDTO) => void;
  disableOverlayClose?: boolean;
};

export default function BOMDetailModal({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  disableOverlayClose = false,
}: Props) {
  const open = isOpen && !!record;

  const partId = useMemo(() => (record ? record.partId : null), [record]);
  const bomCodeId = useMemo(() => (record ? record.bomCodeId : null), [record]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const {
    data: materials,
    isPending,
    isFetching,
  } = useQuery<Material[]>({
    queryKey: bomKeys.materials(bomCodeId ?? "__none__"),
    queryFn: () => fetchBOMMaterials(bomCodeId!),
    enabled: open && !!bomCodeId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    if (open) setSelectedIds([]); // 모달 열릴 때 초기화
  }, [open, partId]);

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const mats = useMemo(() => {
    return Array.isArray(materials) ? materials : [];
  }, [materials]);

  const allIds = useMemo(
    () =>
      mats
        .map((m) => m.materialId)
        .filter(
          (v): v is number => typeof v === "number" && Number.isFinite(v)
        ),
    [mats]
  );

  const allChecked =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const toggleAll = () => setSelectedIds(allChecked ? [] : allIds);

  const fmt = (n: number | undefined) =>
    typeof n === "number" && isFinite(n) ? n.toLocaleString() : "-";

  const handleDelete = () => {
    if (!open || !record || !onDelete) return;
    if (!partId) {
      alert("부품 ID가 없어 삭제할 수 없습니다.");
      return;
    }
    if (selectedIds.length === 0) {
      alert("삭제할 자재를 선택하세요.");
      return;
    }
    const ok = window.confirm(
      `정말 삭제하시겠어요?\n부품 ID: ${partId}\n자재 개수: ${selectedIds.length}`
    );
    if (!ok) return;

    onDelete({
      partId,
      materialIds: selectedIds,
    });
  };

  if (!open) return null;

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="bom-detail-title"
      >
        <Header>
          <HeaderLeft>
            <Title id="bom-detail-title">BOM 상세 정보</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>BOM 번호</Label>
              <Value>{record!.bomCodeId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>BOM 코드</Label>
              <Value>{record!.bomCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>카테고리</Label>
              <Value>{record!.category || "-"}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품 번호</Label>
              <Value>{record!.partId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품 코드</Label>
              <Value>{record!.partCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{record!.partName}</Value>
            </DetailItem>
            <DetailItem>
              <Label>작성일자</Label>
              <Value>{record!.createdDate}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <TableScroll $maxHeight={260}>
            <StickyTable $stickyTop={0} $headerBg="#fafbfc" $zebra>
              <thead>
                <tr>
                  <Th style={{ width: 48 }}>
                    <input
                      type="checkbox"
                      aria-label="전체 선택"
                      onChange={toggleAll}
                      checked={allChecked}
                      disabled={allIds.length === 0}
                    />
                  </Th>
                  <Th>자재번호</Th>
                  <Th>자재코드</Th>
                  <Th>자재명</Th>
                  <Th>수량</Th>
                  <Th>단가</Th>
                  <Th>합계</Th>
                </tr>
              </thead>
              <tbody>
                {isPending && !mats.length ? (
                  <tr>
                    <Td
                      colSpan={6}
                      style={{ textAlign: "center", color: "#6b7280" }}
                    >
                      자재 불러오는 중…
                    </Td>
                  </tr>
                ) : mats.length > 0 ? (
                  mats.map((m) => {
                    const total =
                      typeof m.materialPrice === "number"
                        ? m.materialPrice * m.materialQty
                        : undefined;
                    const mid =
                      typeof m.materialId === "number"
                        ? m.materialId
                        : undefined;

                    return (
                      <tr key={m.materialCode}>
                        <Td>
                          <input
                            type="checkbox"
                            aria-label={`${m.materialName} 선택`}
                            disabled={!mid}
                            checked={!!mid && selectedIds.includes(mid)}
                            onChange={() => mid && toggleOne(mid)}
                          />
                        </Td>
                        <Td>{m.materialId}</Td>
                        <Td>{m.materialCode}</Td>
                        <Td>{m.materialName}</Td>
                        <Td>{m.materialQty.toLocaleString()}</Td>
                        <Td>{fmt(m.materialPrice)}</Td>
                        <Td>{fmt(total)}</Td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <Td
                      colSpan={7}
                      style={{ textAlign: "center", color: "#6b7280" }}
                    >
                      등록된 자재가 없습니다.
                    </Td>
                  </tr>
                )}
              </tbody>
            </StickyTable>
          </TableScroll>
          {isFetching && mats.length > 0 && (
            <div
              style={{
                textAlign: "right",
                fontSize: 12,
                color: "#6b7280",
                marginTop: 6,
              }}
            >
              새로고치는 중…
            </div>
          )}
        </Section>

        <Footer>
          <Button
            color="black"
            onClick={() => onEdit?.({ ...record!, materials: mats })}
            title="수정"
          >
            수정
          </Button>
          <Button color="gray" onClick={handleDelete} title="삭제">
            삭제
          </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
}
