import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge, Td, Th } from "../../components/common/PageLayout";
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
import { StickyTable, TableScroll } from "../../components/common/ScrollTable";
import type { InboundStatus, InboundRecord } from "../InboundTypes";
import { fetchInboundDetail, inboundKeys } from "../InboundApi";

interface Props {
  record: InboundRecord | null;
  isOpen: boolean;
  onClose: () => void;
  disableOverlayClose?: boolean;
}

const statusVariant: Record<
  InboundStatus,
  "accepted" | "pending" | "rejected"
> = {
  합격: "accepted",
  보류: "pending",
  불합격: "rejected",
};

const InboundDetailModal = ({
  record,
  isOpen,
  onClose,
  disableOverlayClose = false,
}: Props) => {
  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const inboundId = record?.inboundId ?? 0;
  const {
    data: detail,
    isLoading,
    error,
  } = useQuery({
    queryKey: inboundKeys.detail(inboundId),
    queryFn: () => fetchInboundDetail(inboundId),
    enabled: !!record && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  if (!isOpen || !record) return null;

  const fmt = (v?: string | null) => (v && v.trim() ? v : "-");
  const uiStatus: InboundStatus = detail?.status ?? "보류";
  const lines = Array.isArray(detail?.lines) ? detail!.lines : [];

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="inbound-detail-title"
      >
        <Header>
          <HeaderLeft>
            <Title id="inbound-detail-title">입고 상세 정보</Title>
            <StatusBadge
              style={{ fontSize: "0.8rem" }}
              $variant={statusVariant[uiStatus]}
              title={detail?.statusRaw}
            >
              {uiStatus}
              {isLoading ? " (로딩중…)" : ""}
            </StatusBadge>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {/* 에러 표시 */}
        {error && (
          <Section>
            <div style={{ color: "#ef4444", fontSize: 14 }}>
              상세 조회 실패: {(error as Error).message}
            </div>
          </Section>
        )}

        {/* 헤더 정보 */}
        <Section>
          <SectionTitle>입고 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>요청서 ID</Label>
              <Value>{record.inboundId}</Value>
            </DetailItem>
            <DetailItem>
              <Label>입고 번호</Label>
              <Value>{fmt(detail?.receivingNo)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>공급업체</Label>
              <Value>{detail?.vendor ?? record.vendor}</Value>
            </DetailItem>
            <DetailItem>
              <Label>품목 종류 수</Label>
              <Value>
                {(
                  detail?.itemKindsNumber ?? record.itemKindsNumber
                )?.toLocaleString?.() ?? "-"}
              </Value>
            </DetailItem>
            <DetailItem>
              <Label>총 수량</Label>
              <Value>
                {(
                  detail?.inboundQty ?? record.inboundQty
                )?.toLocaleString?.() ?? "-"}
              </Value>
            </DetailItem>
            <DetailItem>
              <Label>보관 창고</Label>
              <Value>{detail?.warehouseId ?? "-"}</Value>
            </DetailItem>
            <DetailItem>
              <Label>요청 일시</Label>
              <Value>{fmt(detail?.requestedAt)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>입고 예정일</Label>
              <Value>{fmt(detail?.expectedReceiveDate)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>입고 일시</Label>
              <Value>{fmt(detail?.receivedAt)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>완료 일시</Label>
              <Value>{fmt(detail?.completedAt ?? record.completedAt)}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 라인 테이블 */}
        <Section>
          <SectionTitle>라인(부품) 정보</SectionTitle>
          <TableScroll $maxHeight={260}>
            <StickyTable $stickyTop={0} $headerBg="#fafbfc" $zebra>
              <thead>
                <tr>
                  <Th>부품명</Th>
                  <Th>시리얼</Th>
                  <Th>LOT</Th>
                  <Th>주문수량</Th>
                  <Th>검사수량</Th>
                  <Th>이슈수량</Th>
                  <Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <Td
                      colSpan={7}
                      style={{ textAlign: "center", color: "#6b7280" }}
                    >
                      라인 불러오는 중…
                    </Td>
                  </tr>
                ) : lines.length > 0 ? (
                  lines.map((l) => (
                    <tr key={l.lineId}>
                      <Td>{l.product.name}</Td>
                      <Td>{l.product.serial}</Td>
                      <Td>{l.product.lot}</Td>
                      <Td>{l.orderedQty.toLocaleString()}</Td>
                      <Td>{l.inspectedQty.toLocaleString()}</Td>
                      <Td>{l.issueQty.toLocaleString()}</Td>
                      <Td>
                        <StatusBadge
                          style={{ fontSize: "0.7rem" }}
                          $variant={statusVariant[l.status]}
                          title={l.statusRaw}
                        >
                          {l.status}
                        </StatusBadge>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <Td
                      colSpan={7}
                      style={{ textAlign: "center", color: "#6b7280" }}
                    >
                      라인이 없습니다.
                    </Td>
                  </tr>
                )}
              </tbody>
            </StickyTable>
          </TableScroll>
        </Section>

        {/* 검수자 */}
        <Section>
          <SectionTitle>검수자 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>검수자</Label>
              <Value>{fmt(detail?.inspectorName)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부서</Label>
              <Value>{fmt(detail?.inspectorDept)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>연락처</Label>
              <Value>{fmt(detail?.inspectorPhone)}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 비고 */}
        <Section>
          <SectionTitle>비고</SectionTitle>
          <RemarkSection>
            <Value>{fmt(detail?.note)}</Value>
          </RemarkSection>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default InboundDetailModal;
