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
}
const BOMDetailModal = ({ record, isOpen, onClose }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key == "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>BOM 상세 정보</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
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

        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          {record.materials.map((mat, idx) => (
            <div key={idx}>
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
          ))}
        </Section>

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
              <Value>test@test.com</Value>
            </DetailItem>
            <DetailItem>
              <Label>작성일시</Label>
              <Value>{record.createdDate}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>
        <Section
          style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
        >
          <Button>수정</Button>
          <Button style={{ backgroundColor: "red" }}>삭제</Button>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default BOMDetailModal;
