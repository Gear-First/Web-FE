import { useEffect } from "react";
import type { PartRecord } from "../PartTypes";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Footer,
  Header,
  HeaderLeft,
  Label,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
  Value,
} from "../../../components/common/ModalPageLayout";
import Button from "../../../components/common/Button";
import { fetchPartDetail, partKeys } from "../PartApi";
import { useQuery } from "@tanstack/react-query";

interface Props {
  record: PartRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (record: PartRecord) => void;
  onDelete?: () => void;
  disableOverlayClose?: boolean;
}

const PartDetailModal = ({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  disableOverlayClose = false,
}: Props) => {
  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const {
    data: detail,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: partKeys.detail(record?.partId ?? 0),
    queryFn: () => fetchPartDetail(record?.partId ?? 0),
    enabled: !!record && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  if (!isOpen || !record) return null;

  const handleDelete = () => {
    if (!onDelete) return;
    const ok = window.confirm(
      `정말 삭제하시겠어요?\nPart 번호: ${record.partId}`
    );
    if (ok) onDelete();
  };

  const isInitialPending = isPending && !detail;
  const isRefreshing = isFetching && !isPending;

  const enabledText = isInitialPending
    ? "로딩중…"
    : detail?.enabled === true
    ? "사용"
    : detail?.enabled === false
    ? "중지"
    : "—";
  const numberFormatter = new Intl.NumberFormat("ko-KR");
  const formatNumber = (value?: number | null) =>
    typeof value === "number" ? numberFormatter.format(value) : "—";
  const priceText = numberFormatter.format(detail?.price ?? record.price ?? 0);
  const safetyStockText = formatNumber(
    detail?.safetyStockQty ?? record.safetyStockQty
  );
  const carModels =
    (detail?.carModelNames?.length
      ? detail.carModelNames
      : record.carModelNames) ?? [];
  const carModelText =
    Array.isArray(carModels) && carModels.length > 0
      ? carModels.join(", ")
      : "—";

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer
        width="40%"
        onClick={(e) => e.stopPropagation()}
        loading={isInitialPending}
      >
        <Header>
          <HeaderLeft>
            <Title id="part-detail-title">부품 상세 정보</Title>
            {isRefreshing && (
              <span style={{ marginLeft: 8, color: "#6b7280" }}>
                최신 정보 동기화 중…
              </span>
            )}
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>부품 코드</Label>
              <Value>{record.partCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{record.partName}</Value>
            </DetailItem>
            <DetailItem>
              <Label>카테고리</Label>
              <Value>
                {record.category.name}
                {record.category.id != null && record.category.id !== 0 ? (
                  <span style={{ color: "#6b7280", marginLeft: 8 }}>
                    (ID: {record.category.id})
                  </span>
                ) : null}
              </Value>
            </DetailItem>
            <DetailItem>
              <Label>단가</Label>
              <Value>{priceText}</Value>
            </DetailItem>
            <DetailItem>
              <Label>안전재고</Label>
              <Value>{safetyStockText}</Value>
            </DetailItem>
            <DetailItem>
              <Label>적용 차종</Label>
              <Value>{carModelText}</Value>
            </DetailItem>
            <DetailItem>
              <Label>상태</Label>
              <Value>{enabledText}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 작성 정보 */}
        <Section>
          <SectionTitle>작성 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>작성일</Label>
              <Value>{detail?.createdDate ?? record.createdDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>최근 수정일</Label>
              <Value>{detail?.updatedDate}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 액션 */}
        <Footer>
          <Button color="black" onClick={() => onEdit?.(record)} title="수정">
            수정
          </Button>
          <Button color="gray" onClick={handleDelete} title="삭제">
            삭제
          </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

export default PartDetailModal;
