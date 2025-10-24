import { useState, useEffect, useMemo } from "react";
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
  TextareaWrapper,
  StyledTextarea,
  Button,
  RemarkSection,
} from "../../components/common/ModalPageLayout";

// 모달의 동작 모드: 발주/요청 상세
type DetailVariant = "order" | "request";

// 상태값
const statusVariant: Record<RequestStatus, "rejected" | "info" | "success"> = {
  반려: "rejected",
  미승인: "info",
  승인: "success",
};

interface DetailModalProps {
  record: RequestRecord | null; // 상세에 표시할 레코드
  isOpen: boolean; // 모달 열림 여부
  onClose: () => void; // 모달 닫기 콜백
  variant: DetailVariant; // 모달 모드 (order/request)
  onApprove?: (requestId: string, remark?: string) => void; // 승인(발주 모드에서만)
  onReject?: (requestId: string, remark?: string) => void; // 반려(발주 모드에서만)
}

/** 부품 리스트 섹션 */
const InventoryListSection = ({
  items,
}: {
  items: RequestRecord["inventoryItems"];
}) => {
  // 전체 보기 버튼 상태
  const [showAll, setShowAll] = useState(false);

  // 아이템이 바뀌면 항상 접은 상태로 초기화
  useEffect(() => {
    setShowAll(false);
  }, [items]);

  // 아이템이 없을 때 처리
  if (!items || items.length === 0) {
    return (
      <InventoryList>
        <Value>등록된 부품이 없습니다.</Value>
      </InventoryList>
    );
  }

  // showAll=false면 최대 2개만 노출
  const visible = showAll ? items : items.slice(0, 2);

  return (
    <InventoryList>
      {visible.map((item, idx) => (
        <DetailGrid
          key={`${item.inventoryCode}-${idx}`}
          style={{ marginBottom: "4px" }}
        >
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
    </InventoryList>
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

// 모드별 UI 설정값
const VARIANT_CONFIG = {
  order: {
    title: "발주 상세 정보", // 헤더 타이틀
    showStatus: false, // StatusBadge 표시 여부
    showSubmissionDate: false, // 접수일시 필드 표시 여부
    remarkMode: "editable" as const, // 비고 편집 가능
    showActions: true, // 승인/반려 버튼 표시
  },
  request: {
    title: "요청 상세 정보",
    showStatus: true,
    showSubmissionDate: true,
    remarkMode: "readonly" as const, // 비고 읽기 전용
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

  // 발주 모드에서만 사용하는 비고 입력 상태
  const [remark, setRemark] = useState("");

  // 모달 열릴 때마다 선택 레코드의 비고 초기화
  useEffect(() => {
    if (isOpen && record) {
      setRemark(record.remarks || "");
    }
  }, [isOpen, record]);

  // record가 없을 때는 빈 배열을 반환하여 안전하게 처리
  const requestFields = useMemo(() => {
    if (!record) return [];
    return [
      { label: "발주번호", value: record.requestId },
      { label: "요청일시", value: record.requestDate },
      ...(cfg.showSubmissionDate
        ? [{ label: "접수일시", value: record.submissionDate }]
        : []),
    ];
  }, [record, cfg.showSubmissionDate]);

  // 모달이 닫힌 상태이거나 레코드가 없으면 렌더링하지 않음
  if (!isOpen || !record) return null;

  // 헤더 좌측(타이틀 + 상태 뱃지)
  const headerLeft = (
    <HeaderLeft>
      <Title>{cfg.title}</Title>
      {cfg.showStatus && (
        <StatusBadge
          style={{ fontSize: "0.8rem" }}
          $variant={statusVariant[record.status]}
        >
          {record.status}
        </StatusBadge>
      )}
    </HeaderLeft>
  );

  return (
    <Overlay onClick={onClose}>
      {/* 오버레이 클릭으로 닫히되, 컨테이너 클릭은 전파 중단 */}
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          {headerLeft}
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {/* 상단 정보 (요청/발주) */}
        <Section>
          <SectionTitle>
            {variant === "order" ? "발주 정보" : "요청 정보"}
          </SectionTitle>
          <DetailFields fields={requestFields} />
        </Section>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          {/* 테이블 헤더 */}
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
          <InventoryListSection items={record.inventoryItems} />
        </Section>

        {/* 대리점 정보 */}
        <Section>
          <SectionTitle>대리점 정보</SectionTitle>
          <DetailFields
            fields={[
              { label: "대리점", value: record.agency },
              { label: "대리점 위치", value: record.agencyLocation },
            ]}
          />
        </Section>

        {/* 담당자 정보 */}
        <Section>
          <SectionTitle>담당자 정보</SectionTitle>
          <DetailFields
            fields={[
              { label: "담당자", value: record.manager },
              { label: "직책", value: record.managerPosition },
              { label: "연락처", value: record.managerContact },
            ]}
          />
        </Section>

        {/* 비고 + 승인/반려 액션 (variant에 따라 분기) */}
        <Section>
          <SectionTitle>비고</SectionTitle>
          {cfg.remarkMode === "editable" ? (
            <>
              {/* 발주 모드: 비고 편집 가능 */}
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
                  {/* 승인/반려 버튼 → 상위 콜백 호출 */}
                  <Button
                    color="#4CAF50"
                    onClick={() => onApprove?.(record.requestId, remark)}
                  >
                    승인
                  </Button>
                  <Button
                    color="#F44336"
                    onClick={() => onReject?.(record.requestId, remark)}
                  >
                    반려
                  </Button>
                </div>
              )}
            </>
          ) : (
            // 요청 모드: 비고 읽기 전용
            <RemarkSection>{record.remarks}</RemarkSection>
          )}
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default DetailModal;
