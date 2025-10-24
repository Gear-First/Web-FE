import { useState, useEffect } from "react";
import type { RequestRecord, RequestStatus } from "../RequestTypes";
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
  InventoryList,
  RemarkSection,
} from "../../components/common/ModalPageLayout";

interface Props {
  record: RequestRecord | null;
  isOpen: boolean;
  onClose: () => void;
}
const statusVariant: Record<RequestStatus, "rejected" | "info" | "success"> = {
  반려: "rejected",
  미승인: "info",
  승인: "success",
};

const RequestDetailModal = ({ record, isOpen, onClose }: Props) => {
  // 부품 전체보기 여부 상태
  const [showAll, setShowAll] = useState(false);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen && record) {
      setShowAll(false);
    }
  }, [isOpen, record]);

  // 모달이 닫혀 있거나 데이터가 없을 경우 렌더링하지 않음
  if (!isOpen || !record) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>요청 상세 정보</Title>
            <StatusBadge
              style={{ fontSize: "0.8rem" }}
              $variant={statusVariant[record.status]}
            >
              {record.status}
            </StatusBadge>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        {/* 요청 정보 */}
        <Section>
          <SectionTitle>요청 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>발주번호</Label>
              <Value>{record.requestId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>요청일시</Label>
              <Value>{record.requestDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>접수일시</Label>
              <Value>{record.submissionDate}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>
        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          {/* 부품 정보 테이블 헤더 */}
          <DetailGrid>
            <DetailItem>
              <Label>부품명</Label>
            </DetailItem>
            <DetailItem>
              <Label>부품코드</Label>
            </DetailItem>
            <DetailItem>
              <Label>수량</Label>
            </DetailItem>
          </DetailGrid>
          {/* 부품 리스트 */}
          <InventoryList>
            {record.inventoryItems && record.inventoryItems.length > 0 ? (
              <>
                {/*showAll이 false면 2개까지만 표시 */}
                {(showAll
                  ? record.inventoryItems
                  : record.inventoryItems.slice(0, 2)
                ).map((item, index) => (
                  <DetailGrid key={index} style={{ marginBottom: "4px" }}>
                    <DetailItem>
                      <Value>{item.inventoryName}</Value>
                    </DetailItem>
                    <DetailItem>
                      <Value>{item.inventoryCode}</Value>
                    </DetailItem>
                    <DetailItem>
                      <Value>{item.requestQuantity} EA</Value>
                    </DetailItem>
                  </DetailGrid>
                ))}

                {/* 부품이 2개보다 많고 아직 전체보기 안 눌렀을 때만 버튼 표시 */}
                {!showAll && record.inventoryItems.length > 2 && (
                  <div style={{ textAlign: "center", marginTop: "8px" }}>
                    <button
                      onClick={() => setShowAll(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      전체 보기 ({record.inventoryItems.length}개)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Value>등록된 부품이 없습니다.</Value>
            )}
          </InventoryList>
        </Section>
        {/* 대리점 정보 */}
        <Section>
          <SectionTitle>대리점 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>대리점</Label>
              <Value>{record.agency}</Value>
            </DetailItem>
            <DetailItem>
              <Label>대리점 위치</Label>
              <Value>{record.agencyLocation}</Value>
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
              <Label>직책</Label>
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
          <RemarkSection>{record.remarks}</RemarkSection>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default RequestDetailModal;
