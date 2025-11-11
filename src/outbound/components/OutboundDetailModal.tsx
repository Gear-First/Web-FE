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
}

const OutboundDetailModal = ({ record, isOpen, onClose }: Props) => {
  const noteId = record?.noteId;
  const enabled = Boolean(isOpen && noteId);

  const {
    data: detail,
    isPending,
    isFetching,
    error,
  } = useQuery<OutboundRecord, Error>({
    queryKey: outboundKeys.detail(noteId ?? "nil"),
    queryFn: () => fetchOutboundDetail(record!.noteId.toString()),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  if (!isOpen) return null;

  const isInitialPending = isPending && !detail;
  const isRefreshing = isFetching && !isPending;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        loading={isInitialPending}
      >
        <Header>
          <HeaderLeft>
            <Title>출고 상세 정보</Title>
            {isRefreshing && (
              <span
                style={{ marginLeft: 8, color: "#6b7280", fontSize: "0.85rem" }}
              >
                최신 데이터 갱신 중…
              </span>
            )}
            {detail && (
              <StatusBadge
                style={{ fontSize: "0.8rem" }}
                $variant={OUTBOUND_STATUS_VARIANTS[detail.status]}
              >
                {OUTBOUND_STATUS_LABELS[detail.status]}
              </StatusBadge>
            )}
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {error && (
          <Section>
            <div style={{ color: "#ef4444", fontSize: 14 }}>
              상세 조회 실패: {error.message}
            </div>
          </Section>
        )}

        {isInitialPending ? (
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
                  <Value>{detail.totalQty}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>접수일시</Label>
                  <Value>{fmtDate(detail.requestedAt)}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>출고대상(창고)</Label>
                  <Value>{detail.warehouseCode}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>납품처</Label>
                  <Value>{detail.branchName}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>출고일시</Label>
                  <Value>{fmtDate(detail.shippedAt ?? "")}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>납품예정일</Label>
                  <Value>{fmtDate(detail.expectedShipDate ?? "")}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>완료일</Label>
                  <Value>{fmtDate(detail.completedAt ?? "")}</Value>
                </DetailItem>
              </DetailGrid>
            </Section>

            {/* 부품 정보 */}
            <Section>
              <SectionTitle>부품 정보</SectionTitle>
              <TableScroll $maxHeight={200}>
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
                    {detail.lines?.length ? (
                      detail.lines.map((line) => (
                        <tr key={line.lineId}>
                          <Td>{line.product?.name ?? "-"}</Td>
                          <Td>{line.product?.code ?? "-"}</Td>
                          <Td>{line.product?.lot ?? "-"}</Td>
                          <Td>{line.orderedQty?.toLocaleString() ?? "-"}</Td>
                          <Td>
                            <StatusBadge
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
                          colSpan={5}
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
                <Value>{detail.remark ?? "비고 없음"}</Value>
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
