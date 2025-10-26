import { useEffect } from "react";
import type { BOMRecord } from "../BOMTypes";
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
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";
interface Props {
  record: BOMRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (record: BOMRecord) => void;
  onDelete?: (record: BOMRecord) => void;
  disableOverlayClose?: boolean;
}

const BOMDetailModal = ({
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

  // 삭제 클릭 핸들러 (확인창)
  const handleDelete = () => {
    if (!onDelete) return;
    const ok = window.confirm(
      `정말 삭제하시겠어요?\nBOM 번호: ${record.bomId}`
    );
    if (ok) onDelete(record);
  };

  // 자재 안전 렌더링
  const mats = Array.isArray(record.materials) ? record.materials : [];

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()} role="dialog">
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
              <Value>{record.bomId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품 코드</Label>
              <Value>{record.partCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{record.partName}</Value>
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

        {/* 작성자 정보 (필요 시 record에서 받아오도록 타입 확장 가능) */}
        <Section>
          <SectionTitle>작성자 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>작성자</Label>
              <Value>박우진</Value>
            </DetailItem>
            <DetailItem>
              <Label>직책</Label>
              <Value>팀장</Value>
            </DetailItem>
            <DetailItem>
              <Label>연락처</Label>
              <Value> test@test.com</Value>
            </DetailItem>
            <DetailItem>
              <Label>작성일시</Label>
              <Value>{record.createdDate}</Value>
            </DetailItem>
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

export default BOMDetailModal;
