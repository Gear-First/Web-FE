import { useState, useEffect, useMemo } from "react";
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
  PartList,
  TextareaWrapper,
  StyledTextarea,
  RemarkSection,
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";

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

/** 날짜 문자열을 yyyy-mm-dd hh:mm:ss 형태로 간단 변환 */
const formatDate = (str?: string | null) =>
  str ? str.replace("T", " ").split(".")[0] : "-";

/** 부품 리스트 섹션 (임시) */
const PartListSection = ({ items }: { items?: any[] }) => {
  const [showAll, setShowAll] = useState(false);
  useEffect(() => setShowAll(false), [items]);
  if (!items || items.length === 0)
    return (
      <PartList>
        <Value>등록된 부품이 없습니다.</Value>
      </PartList>
    );

  const visible = showAll ? items : items.slice(0, 2);
  return (
    <PartList>
      {visible.map((item, idx) => (
        <DetailGrid
          key={`${item.partCode}-${idx}`}
          style={{ marginBottom: "4px" }}
        >
          <DetailItem>
            <Value>{item.partName}</Value>
          </DetailItem>
          <DetailItem>
            <Value>{item.partCode}</Value>
          </DetailItem>
          <DetailItem>
            <Value>{item.quantity ?? "-"} EA</Value>
          </DetailItem>
        </DetailGrid>
      ))}
      {!showAll && items.length > 2 && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
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
            전체 보기 ({items.length}개)
          </button>
        </div>
      )}
    </PartList>
  );
};

/** 라벨-값 그리드 공통 렌더러 */
const DetailFields = ({
  fields,
}: {
  fields: Array<{ label: string; value?: React.ReactNode }>;
}) => (
  <DetailGrid>
    {fields.map((f, i) => (
      <DetailItem key={i}>
        <Label>{f.label}</Label>
        <Value>{f.value ?? "-"}</Value>
      </DetailItem>
    ))}
  </DetailGrid>
);

const VARIANT_CONFIG = {
  order: {
    title: "발주 상세 정보",
    showStatus: true,
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

  useEffect(() => {
    if (isOpen && record) {
      setRemark((record as any).remarks || "");
    }
  }, [isOpen, record]);

  const orderStatus = (record?.orderStatus || "PENDING") as OrderStatus;

  const requestFields = useMemo(() => {
    if (!record) return [];
    return [
      { label: "발주 번호", value: record.orderNumber },
      { label: "요청 일시", value: formatDate(record.requestDate) },
      { label: "처리 일시", value: formatDate(record.processedDate) },
      { label: "대리점 코드", value: record.branchCode },
      { label: "담당자", value: record.engineerName },
      { label: "직책", value: record.engineerRole },
    ];
  }, [record]);

  if (!isOpen || !record) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>{cfg.title}</Title>
            {cfg.showStatus && (
              <StatusBadge $variant={ORDER_STATUS_VARIANTS[orderStatus]}>
                {ORDER_STATUS_LABELS[orderStatus]}
              </StatusBadge>
            )}
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {/* 기본 정보 */}
        <Section>
          <SectionTitle>기본 정보</SectionTitle>
          <DetailFields fields={requestFields} />
        </Section>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
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
          <PartListSection items={(record as any).items || []} />
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
                    color="primary"
                    onClick={() => onApprove?.(record.orderId, remark)}
                  >
                    승인
                  </Button>
                  <Button
                    color="danger"
                    onClick={() => onReject?.(record.orderId, remark)}
                  >
                    반려
                  </Button>
                </div>
              )}
            </>
          ) : (
            <RemarkSection>{remark || "비고 없음"}</RemarkSection>
          )}
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default DetailModal;
