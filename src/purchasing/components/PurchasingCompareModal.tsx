import React from "react";
import styled from "styled-components";
import {
  Overlay,
  ModalContainer as BaseModalContainer,
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
} from "../../components/common/ModalPageLayout";
import type { PurchasingRecord } from "../PurchasingTypes";

/* --- transient prop을 추가한 래퍼 --- */
const SafeModalContainer = styled(BaseModalContainer)<{ $maxWidth?: string }>`
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth};`}
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  records: PurchasingRecord[];
}

/* 기존 Compare 컴포넌트 그대로 */
const CompareGrid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols}, 1fr);
  gap: 1.2rem;
  margin-top: 1.2rem;
`;

const CompareCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(17, 17, 17, 0.06);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  padding: 1.4rem 1.8rem;
  transition: transform 0.18s ease;
  &:hover {
    transform: translateY(-2px);
  }
`;

const CompanyTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f0f11;
  margin-bottom: 1.2rem;
  text-align: center;
  letter-spacing: -0.01em;
`;

export default function PurchasingCompareModal({
  isOpen,
  onClose,
  records,
}: Props) {
  if (!isOpen || records.length < 2) return null;
  const compareCount = Math.min(records.length, 3);
  const data = records.slice(0, compareCount);

  const prices = data.map((r) => r.purchasingPrice);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  return (
    <Overlay>
      <SafeModalContainer width="92%" $maxWidth="1080px">
        <Header>
          <HeaderLeft>
            <Title>업체 비교</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Section>
          <SectionTitle>비교 요약</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>비교 개수</Label>
              <Value>{compareCount}개 업체</Value>
            </DetailItem>
            <DetailItem>
              <Label>최고 단가</Label>
              <Value>₩{maxPrice.toLocaleString()}</Value>
            </DetailItem>
            <DetailItem>
              <Label>최저 단가</Label>
              <Value>₩{minPrice.toLocaleString()}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>상세 비교</SectionTitle>
          <CompareGrid $cols={compareCount}>
            {data.map((r, i) => (
              <CompareCard key={r.purchasingId}>
                <CompanyTitle>
                  업체 {String.fromCharCode(65 + i)} — {r.company}
                </CompanyTitle>
                <DetailGrid $cols={2}>
                  <DetailItem>
                    <Label>자재명</Label>
                    <Value>{r.materialName}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>단가</Label>
                    <Value
                      style={{
                        color:
                          r.purchasingPrice === maxPrice
                            ? "#d92d20"
                            : r.purchasingPrice === minPrice
                            ? "#15803d"
                            : "#111113",
                      }}
                    >
                      ₩{r.purchasingPrice.toLocaleString()}
                    </Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>소요 수량</Label>
                    <Value>{r.requiredQuantityPerPeriod}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>소요 기간(일)</Label>
                    <Value>{r.requiredPeriodInDays}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>조사일</Label>
                    <Value>{r.surveyDate}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>유효기간</Label>
                    <Value>{r.expiryDate}</Value>
                  </DetailItem>
                </DetailGrid>
              </CompareCard>
            ))}
          </CompareGrid>
        </Section>
      </SafeModalContainer>
    </Overlay>
  );
}
