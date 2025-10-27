// src/features/part/components/PartDetailModal.tsx
import { useEffect } from "react";
import type { PartRecords } from "../PartTypes"; // 프로젝트 경로에 맞게 조정
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
  Value,
} from "../../../components/common/ModalPageLayout";
import Button from "../../../components/common/Button";

interface Props {
  record: PartRecords | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (record: PartRecords) => void;
  onDelete?: (record: PartRecords) => void;
  disableOverlayClose?: boolean;
}

const PartDetailModal = ({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  disableOverlayClose = false,
}: Props) => {
  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const handleDelete = () => {
    if (!onDelete) return;
    const ok = window.confirm(
      `정말 삭제하시겠어요?\nPart 번호: ${record.partId}`
    );
    if (ok) onDelete(record);
  };

  const mats = Array.isArray(record.materials) ? record.materials : [];

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()} role="dialog">
        <Header>
          <HeaderLeft>
            <Title id="part-detail-title">Part 상세 정보</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>Part 번호</Label>
              <Value>{record.partId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품 코드</Label>
              <Value>{record.partCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{record.partName}</Value>
            </DetailItem>
            <DetailItem>
              <Label>카테고리</Label>
              <Value>{record.category}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 자재 정보 */}
        <Section>
          <SectionTitle>자재 정보</SectionTitle>

          {mats.length === 0 ? (
            <p style={{ color: "#6b7280", margin: "8px 0 0" }}>
              등록된 자재가 없습니다.
            </p>
          ) : (
            mats.map((mat, idx) => (
              <div key={`${mat.materialCode}-${idx}`}>
                <DetailGrid>
                  <DetailItem>
                    <Label>자재코드</Label>
                    <Value>{mat.materialCode}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>자재명</Label>
                    <Value>{mat.materialName}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>자재수량</Label>
                    <Value>{mat.materialQty}</Value>
                  </DetailItem>
                </DetailGrid>
              </div>
            ))
          )}
        </Section>

        {/* 작성 정보 */}
        <Section>
          <SectionTitle>작성 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>작성일자</Label>
              <Value>{record.createdDate}</Value>
            </DetailItem>
            {/* 필요 시 확장:
            <DetailItem><Label>작성자</Label><Value>{record.createdBy}</Value></DetailItem>
            */}
          </DetailGrid>
        </Section>

        {/* 액션 */}
        <Section
          style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}
        >
          <Button onClick={() => onEdit?.(record)} title="수정">
            수정
          </Button>
          <Button color="danger" onClick={handleDelete} title="삭제">
            삭제
          </Button>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default PartDetailModal;
