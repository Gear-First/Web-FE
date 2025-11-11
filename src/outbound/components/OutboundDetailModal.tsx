import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { OutboundRecord } from "../OutboundTypes";
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
import { fetchOutboundDetail, outboundKeys } from "../OutboundApi";
import {
  OUTBOUND_STATUS_LABELS,
  OUTBOUND_STATUS_VARIANTS,
  OUTBOUND_PART_STATUS_LABELS,
  OUTBOUND_PART_STATUS_VARIANTS,
} from "../OutboundTypes";
import { fmtDate } from "../../utils/string";
import { useQuery } from "@tanstack/react-query";

interface Props {
  record: OutboundRecord | null;
  isOpen: boolean;
  onClose: () => void;
  disableOverlayClose?: boolean;
}

const OutboundDetailModal = ({
  record,
  isOpen,
  onClose,
  disableOverlayClose = false,
}: Props) => {
  // ESC로 닫기 지원
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const noteId = record?.noteId;
  const enabled = Boolean(isOpen && noteId);

  const {
    data: detail,
    isLoading,
    error,
  } = useQuery({
    queryKey: outboundKeys.detail(noteId ?? "nil"),
    queryFn: () => fetchOutboundDetail(noteId!),
    enabled,
    staleTime: 5 * 60 * 1000, // 5분 캐시
    placeholderData: (prev) => prev,
  });

  if (!isOpen || !record) return null;

  const fmt = (v?: string | null) => (v && v.trim() ? v : "-");
  const fmtNum = (n?: number | null) =>
    typeof n === "number" ? n.toLocaleString() : "-";

  const lines = Array.isArray(detail?.lines) ? detail!.lines : [];

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="outbound-detail-title"
      >
        <Header>
          <HeaderLeft>
            <Title id="outbound-detail-title">출고 상세 정보</Title>
            <StatusBadge
              $variant={OUTBOUND_STATUS_VARIANTS[record.status]}
              title={record.status || undefined}
            >
              {OUTBOUND_STATUS_LABELS[record.status]}
            </StatusBadge>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {error && (
          <Section>
            <div style={{ color: "#ef4444", fontSize: 14 }}>
              상세 조회 실패: {(error as Error).message}
            </div>
          </Section>
        )}

        {/* 출고 정보 */}
        <Section>
          <SectionTitle>출고 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>출고번호</Label>
              <Value>{fmt(detail?.shippingNo)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>출고수량</Label>
              <Value>{fmtNum(detail?.totalQty ?? record.totalQty)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>접수일시</Label>
              <Value>
                {fmtDate(detail?.requestedAt ?? record.requestedAt)}
              </Value>
            </DetailItem>
            <DetailItem>
              <Label>출고대상(창고)</Label>
              <Value>
                {fmt(detail?.warehouseCode ?? record.warehouseCode)}
              </Value>
            </DetailItem>
            <DetailItem>
              <Label>납품처</Label>
              <Value>{fmt(detail?.branchName ?? record.branchName)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>출고일시</Label>
              <Value>{fmtDate(detail?.shippedAt)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>납품예정일</Label>
              <Value>{fmtDate(detail?.expectedShipDate)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>완료일</Label>
              <Value>{fmtDate(detail?.completedAt)}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <TableScroll $maxHeight={240}>
            <StickyTable $stickyTop={0} $headerBg="#fafbfc" $zebra>
              <thead>
                <tr>
                  <Th>부품명</Th>
                  <Th>부품코드</Th>
                  <Th>LOT</Th>
                  <Th>주문수량</Th>
                  <Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <Td
                      colSpan={6}
                      style={{ textAlign: "center", color: "#6b7280" }}
                    >
                      라인 불러오는 중…
                    </Td>
                  </tr>
                ) : lines.length > 0 ? (
                  lines.map((line) => (
                    <tr key={line.lineId}>
                      <Td>{fmt(line.product?.name)}</Td>
                      <Td>{fmt(line.product?.code)}</Td>
                      <Td>{fmt(line.product?.lot)}</Td>
                      <Td>{fmtNum(line.orderedQty)}</Td>
                      <Td>
                        <StatusBadge
                          style={{ fontSize: "0.7rem" }}
                          $variant={
                            OUTBOUND_PART_STATUS_VARIANTS[
                              line.status as keyof typeof OUTBOUND_PART_STATUS_VARIANTS
                            ]
                          }
                        >
                          {
                            OUTBOUND_PART_STATUS_LABELS[
                              line.status as keyof typeof OUTBOUND_PART_STATUS_LABELS
                            ]
                          }
                        </StatusBadge>
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <Td
                      colSpan={6}
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

        {/* 담당자 정보 */}
        <Section>
          <SectionTitle>담당자 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>담당자</Label>
              <Value>{fmt(detail?.assigneeName)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부서</Label>
              <Value>{fmt(detail?.assigneeDept)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>연락처</Label>
              <Value>{fmt(detail?.assigneePhone)}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 비고 */}
        <Section>
          <SectionTitle>비고</SectionTitle>
          <RemarkSection>
            <Value>{fmt(detail?.remark)}</Value>
          </RemarkSection>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default OutboundDetailModal;
