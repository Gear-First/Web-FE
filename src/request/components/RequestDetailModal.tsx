import { useState, useEffect } from "react";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  type PendingOrderItem,
  type ProcessedOrderItem,
  type OrderStatus,
} from "../RequestTypes";
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
  TextareaWrapper,
  StyledTextarea,
  RemarkSection,
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";
import { StickyTable, TableScroll } from "../../components/common/ScrollTable";
import { useQuery } from "@tanstack/react-query";
import { fetchOrderDetail } from "../RequestApi";
import { Td, Th } from "../../components/common/PageLayout";
import type { OrderInfoItem } from "../RequestTypes";
import { fmtDate } from "../../utils/string";

// 모달의 동작 모드: 발주/요청 상세
type DetailVariant = "order" | "request";

interface DetailModalProps {
  record: (PendingOrderItem | ProcessedOrderItem) | null;
  isOpen: boolean;
  onClose: () => void;
  variant: DetailVariant;
  onApprove?: (orderId: number, remark?: string) => void;
  onReject?: (orderId: number, remark?: string) => void;
}

const VARIANT_CONFIG = {
  order: {
    title: "발주 상세 정보",
    showStatus: false,
    remarkMode: "editable" as const,
    showActions: true,
  },
  request: {
    title: "요청 상세 정보",
    showStatus: true,
    remarkMode: "readonly" as const,
    showActions: false,
  },
};

const DetailModal = ({
  record,
  isOpen,
  onClose,
  variant,
  onApprove,
  onReject,
}: DetailModalProps) => {
  const cfg = VARIANT_CONFIG[variant];
  const [remark, setRemark] = useState("");

  const orderId = record?.orderId;
  const enabled = Boolean(isOpen && orderId);

  // 상세 데이터 조회
  const {
    data: detail,
    isPending,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => fetchOrderDetail(orderId!),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isOpen && record) {
      setRemark((record as any).remarks || "");
    }
  }, [isOpen, record]);

  const order = detail?.data as OrderInfoItem | undefined;
  const orderStatus = (record?.orderStatus || "PENDING") as OrderStatus;

  useEffect(() => {
    if (isOpen && order) setRemark(order.note || "");
  }, [isOpen, order]);

  if (!isOpen || !record) return null;

  const getBranchType = (code?: string) => {
    if (!code) return "";
    if (code.includes("대리점")) return "대리점";
    if (code.includes("창고")) return "창고";
  };

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
            <Title>{cfg.title}</Title>
            {isRefreshing && (
              <span
                style={{ marginLeft: 8, color: "#6b7280", fontSize: "0.85rem" }}
              >
                최신 데이터 동기화 중…
              </span>
            )}
            {cfg.showStatus && (
              <StatusBadge $variant={ORDER_STATUS_VARIANTS[orderStatus]}>
                {ORDER_STATUS_LABELS[orderStatus]}
              </StatusBadge>
            )}
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        {/* 발주 정보 */}
        <Section>
          <SectionTitle>발주 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>발주 번호</Label>
              <Value>{order?.orderNumber}</Value>
            </DetailItem>

            <DetailItem>
              <Label>요청 일시</Label>
              <Value>{fmtDate(order?.requestDate)}</Value>
            </DetailItem>
            <DetailItem></DetailItem>

            {variant === "request" && (
              <>
                <DetailItem>
                  <Label>처리 일시</Label>
                  <Value>{fmtDate(order?.processedDate)}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>출고 일시</Label>
                  <Value>{fmtDate(order?.transferDate)}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>완료 일시</Label>
                  <Value>{fmtDate(order?.completedDate)}</Value>
                </DetailItem>
              </>
            )}
          </DetailGrid>
        </Section>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <TableScroll $maxHeight={200}>
            <StickyTable
              $stickyTop={0}
              $headerBg="#fafbfc"
              style={{
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <Th style={{ textAlign: "center", padding: "6px 10px" }}>
                    부품명
                  </Th>
                  <Th style={{ textAlign: "center", padding: "6px 10px" }}>
                    부품코드
                  </Th>
                  <Th style={{ textAlign: "center", padding: "6px 10px" }}>
                    수량
                  </Th>
                </tr>
              </thead>
              <tbody>
                {isInitialPending ? (
                  <tr>
                    <Td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "8px 0",
                        fontSize: "0.8rem",
                      }}
                    >
                      불러오는 중…
                    </Td>
                  </tr>
                ) : error ? (
                  <tr>
                    <Td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        color: "#ef4444",
                        padding: "8px 0",
                        fontSize: "0.8rem",
                      }}
                    >
                      조회 실패
                    </Td>
                  </tr>
                ) : detail?.data?.items?.length ? (
                  detail.data.items.map((item: any, idx: number) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        background: idx % 2 === 0 ? "#fff" : "#f9fafb",
                      }}
                    >
                      <Td
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.partName ?? "-"}
                      </Td>
                      <Td
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.partCode ?? "-"}
                      </Td>
                      <Td
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.quantity ?? "-"}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <Td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "8px 0",
                        fontSize: "0.8rem",
                      }}
                    >
                      부품 정보가 없습니다.
                    </Td>
                  </tr>
                )}
              </tbody>
            </StickyTable>
          </TableScroll>
        </Section>
        {/* 지점 정보 */}
        <Section>
          <SectionTitle>{getBranchType(order?.branchCode)} 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>{getBranchType(order?.branchCode)}</Label>
              <Value>{order?.branchCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>{getBranchType(order?.branchCode)} 위치</Label>
              <Value>{order?.branchCode}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>
        {/* 담당자 정보 */}
        <Section>
          <SectionTitle>담당자 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>담당자</Label>
              <Value>{order?.engineerName ?? "-"}</Value>
            </DetailItem>
            <DetailItem>
              <Label>직책</Label>
              <Value>{order?.engineerRole ?? "-"}</Value>
            </DetailItem>
            <DetailItem>
              <Label>이메일</Label>
              <Value>{order?.engineerRole ?? "-"}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 비고 */}
        <Section>
          <SectionTitle>비고</SectionTitle>
          {cfg.remarkMode === "editable" ? (
            <>
              <TextareaWrapper>
                <StyledTextarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="비고를 입력하세요"
                />
              </TextareaWrapper>
              {cfg.showActions && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    marginTop: 6,
                  }}
                >
                  <Button
                    color="black"
                    onClick={() => onApprove?.(record.orderId, remark)}
                  >
                    승인
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => onReject?.(record.orderId, remark)}
                  >
                    반려
                  </Button>
                </div>
              )}
            </>
          ) : (
            <RemarkSection>{order?.note || "비고 없음"}</RemarkSection>
          )}
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default DetailModal;
