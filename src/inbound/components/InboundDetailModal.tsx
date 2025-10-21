import { useEffect } from "react";
import { StatusBadge } from "../../components/common/PageLayout";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Header,
  HeaderLeft,
  Label,
  ModalContainer,
  Overlay,
  RemarkSection,
  Section,
  SectionTitle,
  Title,
  Value,
} from "../../components/common/ModalPageLayout";
import type { InboundRecord, InboundStatus } from "../InboundTypes";

interface Props {
  record: InboundRecord | null;
  isOpen: boolean;
  onClose: () => void;
}
const statusVariant: Record<
  InboundStatus,
  "accepted" | "pending" | "rejected"
> = {
  합격: "accepted",
  보류: "pending",
  불합격: "rejected",
};

const InboundDetailModal = ({ record, isOpen, onClose }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
            <Title>입고 상세 정보</Title>
            <StatusBadge
              style={{ fontSize: "0.8rem" }}
              $variant={statusVariant[record.status]}
            >
              {record.status}
            </StatusBadge>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{record.partName}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품코드</Label>
              <Value>{record.partCode}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>입고 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>입고 번호</Label>
              <Value>{record.inboundId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>LOT 번호</Label>
              <Value>{record.lotId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>입고 수량</Label>
              <Value>{record.inboundQty}</Value>
            </DetailItem>
            <DetailItem>
              <Label>접수 일자</Label>
              <Value>{record.receivedDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>입고 예상일</Label>
              <Value>{record.expectedInDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>입고 일자</Label>
              <Value>{record.inDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>입고 대상</Label>
              <Value>{record.warehouse}</Value>
              <Value style={{ fontSize: "0.8rem" }}>
                서울광역시 금천구 독산동
              </Value>
            </DetailItem>
            <DetailItem>
              <Label>공급업체</Label>
              <Value>{record.vendor}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>검수자 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>검수자</Label>
              <Value>{record.inspector}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부서</Label>
              <Value>검수 1팀</Value>
            </DetailItem>
            <DetailItem>
              <Label>연락처</Label>
              <Value>test@test.com</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>비고</SectionTitle>
          <RemarkSection>
            <Value>{record.note}</Value>
          </RemarkSection>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default InboundDetailModal;
