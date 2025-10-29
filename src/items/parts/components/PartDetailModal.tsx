import { useEffect } from "react";
import type { PartRecords } from "../PartTypes";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
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
  record: PartRecords | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (record: PartRecords) => void;
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

  const { data: detail, isLoading } = useQuery({
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

  const enabledText = isLoading
    ? "로딩중…"
    : detail?.enabled === true
    ? "사용"
    : detail?.enabled === false
    ? "중지"
    : "—";

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="part-detail-title"
      >
        <Header>
          <HeaderLeft>
            <Title id="part-detail-title">부품 상세 정보</Title>
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
              <Value>{detail?.price}</Value>
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
              <Label>작성일자</Label>
              <Value>{detail?.createdDate ?? record.createdDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>최근 수정일</Label>
              <Value>{detail?.updatedDate}</Value>
            </DetailItem>
            <DetailItem>
              <Label>작성자</Label>
              <Value>박우진</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 액션 */}
        <Section
          style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}
        >
          <Button onClick={() => onEdit?.(record)} title="수정">
            수정
          </Button>
          <Button color="danger" onClick={handleDelete} title="삭제">
            삭제
          </Button>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default PartDetailModal;
