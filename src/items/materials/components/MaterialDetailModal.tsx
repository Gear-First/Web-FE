import { useEffect } from "react";
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
} from "../../../components/common/ModalPageLayout";
import Button from "../../../components/common/Button";
import type { MaterialRecord } from "../MaterialTypes";

interface Props {
  record: MaterialRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (record: MaterialRecord) => void;
  onDelete?: (record: MaterialRecord) => void;
  disableOverlayClose?: boolean;
}

const MaterialDetailModal = ({
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
      `정말 삭제하시겠어요?\n자재명: ${record.materialName}`
    );
    if (ok) onDelete(record);
  };

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer
        width="40%"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <Header>
          <HeaderLeft>
            <Title>자재 상세 정보</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {/* 자재 정보 */}
        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>자재 번호</Label>
              <Value>{record.id}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품 코드</Label>
              <Value>{record.materialCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{record.materialName}</Value>
            </DetailItem>
          </DetailGrid>
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
        <Footer>
          <Button color="black" onClick={() => onEdit?.(record)} title="수정">
            수정
          </Button>
          <Button color="gray" onClick={handleDelete} title="삭제">
            삭제
          </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

export default MaterialDetailModal;
