import type { OutboundRecord, OutboundStatus } from "../OutboundTypes";
import { StatusBadge } from "../../components/common/PageLayout";
import {
  Overlay,
  ModalContainer,
  Header,
  HeaderLeft,
  Title,
  CloseButton,
  Section,
  SectionTitle,
  DetailGrid,
  DetailItem,
  Label,
  Value,
  RemarkSection,
} from "../../components/common/ModalPageLayout";

interface Props {
  record: OutboundRecord | null;
  isOpen: boolean;
  onClose: () => void;
}
const statusVariant: Record<OutboundStatus, "warning" | "info" | "success"> = {
  대기: "warning",
  진행중: "info",
  완료: "success",
};

const OutboundDetailModal = ({ record, isOpen, onClose }: Props) => {
  if (!isOpen || !record) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>출고 상세 정보</Title>
            <StatusBadge
              style={{ fontSize: "0.8rem" }}
              $variant={statusVariant[record.status]}
            >
              {record.status}
            </StatusBadge>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        {/* 자재/납품 정보 */}
        <Section>
          <SectionTitle>자재/납품 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{record.partItems[0]?.partName ?? "-"}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품코드</Label>
              <Value>{record.partItems[0]?.partCode ?? "-"}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>
        {/* 출고 정보 */}
        <Section>
          <SectionTitle>출고 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>출고번호</Label>
              <Value>{record.outboundId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>출고수량</Label>
              <Value>
                {record.partItems
                  .reduce((sum, item) => sum + item.outboundQuantity, 0)
                  .toLocaleString()}
              </Value>
            </DetailItem>
            <DetailItem>
              <Label>접수일시</Label>
              <Value>{record.issuedDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>출고대상(창고)</Label>
              <Value>{record.deliveryFactory}</Value>
            </DetailItem>
            <DetailItem>
              <Label>납품처</Label>
              <Value>{record.destination}</Value>
            </DetailItem>
            <DetailItem>
              <Label>출고일시</Label>
              <Value>{record.receiptDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>창고위치</Label>
              <Value>서울</Value>
            </DetailItem>
            <DetailItem>
              <Label>납품예정일</Label>
              <Value>{record.expectedDeliveryDate}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>
        {/* 담당자 정보 */}
        <Section>
          <SectionTitle>담당자 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>담당자</Label>
              <Value>{record.manager}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부서</Label>
              <Value>{record.managerPosition}</Value>
            </DetailItem>
            <DetailItem>
              <Label>연락처</Label>
              <Value>{record.managerContact}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>
        <Section>
          <SectionTitle>비고</SectionTitle>
          <RemarkSection>
            <Value>{record.remarks}</Value>
          </RemarkSection>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default OutboundDetailModal;
