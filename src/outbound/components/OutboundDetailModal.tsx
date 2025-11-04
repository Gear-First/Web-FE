import { useState, useEffect } from "react";
import type {
  OutboundRecord,
  OutboundStatus,
  OutboundPartStatus,
} from "../OutboundTypes";
import { StatusBadge, Td, Th } from "../../components/common/PageLayout";
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
import { StickyTable, TableScroll } from "../../components/common/ScrollTable";
import { fetchOutboundDetail } from "../OutboundApi";

interface Props {
  record: OutboundRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusVariant: Record<
  OutboundStatus,
  "warning" | "rejected" | "info" | "success"
> = {
  대기: "warning",
  지연: "rejected",
  진행중: "info",
  완료: "success",
};

const statusPartVariant: Record<
  OutboundPartStatus,
  "warning" | "info" | "success"
> = {
  대기: "warning",
  출고: "info",
  완료: "success",
};

const OutboundDetailModal = ({ record, isOpen, onClose }: Props) => {
  const [detail, setDetail] = useState<OutboundRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateStr: string) =>
    dateStr ? dateStr.slice(0, 16).replace("T", " ") : "-";

  useEffect(() => {
    if (isOpen && record) {
      setIsLoading(true);
      fetchOutboundDetail(record.outboundId)
        .then((data) => setDetail(data))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>출고 상세 정보</Title>
            {detail && (
              <StatusBadge
                style={{ fontSize: "0.8rem" }}
                $variant={statusVariant[detail.status]}
              >
                {detail.status}
              </StatusBadge>
            )}
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {isLoading ? (
          <p style={{ padding: 20 }}>로딩중…</p>
        ) : detail ? (
          <>
            {/* 출고 정보 */}
            <Section>
              <SectionTitle>출고 정보</SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <Label>출고번호</Label>
                  <Value>{detail.shippingNo}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>출고수량</Label>
                  <Value>{detail.totalQty.toLocaleString()}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>접수일시</Label>
                  <Value>{formatDate(detail.requestedAt)}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>출고대상(창고)</Label>
                  <Value>{detail.shippedAt}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>납품처</Label>
                  <Value>{detail.branchName}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>출고일시</Label>
                  <Value>{formatDate(detail.shippedAt)}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>납품예정일</Label>
                  <Value>{formatDate(detail.expectedShipDate)}</Value>
                </DetailItem>
              </DetailGrid>
            </Section>

            {/* 부품 정보 */}
            <Section>
              <SectionTitle>부품 정보</SectionTitle>
              <TableScroll $maxHeight={200}>
                <StickyTable
                  $stickyTop={0}
                  $headerBg="#fafbfc"
                  $zebra
                  $colWidths={["20%", "20%", "15%", "15%"]}
                >
                  <thead>
                    <tr>
                      <Th>부품명</Th>
                      <Th>부품코드</Th>
                      <Th>수량</Th>
                      <Th>상태</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.lines?.map((line) => (
                      <tr key={line.lineId}>
                        <Td>{line.productName}</Td>
                        <Td>{line.productSerial}</Td>
                        <Td>{line.pickedQty.toLocaleString()}</Td>
                        <Td>
                          <StatusBadge
                            $variant={statusPartVariant[line.status]}
                          >
                            {line.status}
                          </StatusBadge>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </StickyTable>
              </TableScroll>
            </Section>

            {/* 담당자 정보 */}
            <Section>
              <SectionTitle>담당자 정보</SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <Label>담당자</Label>
                  <Value>{detail.assigneeName}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>부서</Label>
                  <Value>{detail.assigneeDept}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>연락처</Label>
                  <Value>{detail.assigneePhone}</Value>
                </DetailItem>
              </DetailGrid>
            </Section>

            {/* 비고 */}
            <Section>
              <SectionTitle>비고</SectionTitle>
              <RemarkSection>
                <Value>{detail.remark}</Value>
              </RemarkSection>
            </Section>
          </>
        ) : (
          <p style={{ padding: 20 }}>상세 데이터가 없습니다.</p>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default OutboundDetailModal;
