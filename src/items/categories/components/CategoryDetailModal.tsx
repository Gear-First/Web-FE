import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CloseButton,
  Header,
  HeaderLeft,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
  DetailGrid,
  DetailItem,
  Label,
  Value,
  Footer,
} from "../../../components/common/ModalPageLayout";
import Button from "../../../components/common/Button";
import { fetchCategoryDetail, categoryKeys } from "../CategoryApi";
import type { CategoryRecord, CategoryDetailRecord } from "../CategoryTypes";

interface Props {
  record: CategoryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (detail: CategoryDetailRecord) => void;
  onDelete?: (id: string | number) => void;
  disableOverlayClose?: boolean;
}

const CategoryDetailModal = ({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  disableOverlayClose = false,
}: Props) => {
  const id = record?.id ?? "";

  const {
    data: detail,
    isLoading,
    error,
  } = useQuery<CategoryDetailRecord, Error>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategoryDetail(id),
    enabled: Boolean(isOpen && id), // 모달 열리고 id 있을 때만 요청
    staleTime: 5 * 60 * 1000,
  });

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const fmt = (v?: string | null) => (v ? v : "-");

  const handleEdit = () => {
    if (!detail) return;
    onEdit?.(detail);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    const ok = window.confirm(
      `정말 삭제하시겠어요?\n카테고리 ID: ${record.id}`
    );
    if (ok) onDelete(record.id);
  };

  return (
    <Overlay onClick={disableOverlayClose ? undefined : onClose}>
      <ModalContainer width="40%" onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>카테고리 상세 정보</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <Section>
          <SectionTitle>기본 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>ID</Label>
              <Value>{record.id}</Value>
            </DetailItem>
            <DetailItem>
              <Label>카테고리명</Label>
              <Value>{record.name}</Value>
            </DetailItem>
            <DetailItem>
              <Label>설명</Label>
              <Value>{record.description ?? "-"}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>등록 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>생성일</Label>
              <Value>{fmt(detail?.createdAt)}</Value>
            </DetailItem>
            <DetailItem>
              <Label>수정일</Label>
              <Value>{fmt(detail?.updatedAt)}</Value>
            </DetailItem>
          </DetailGrid>
          {isLoading && (
            <Value style={{ fontSize: 12, color: "#6b7280" }}>
              불러오는 중...
            </Value>
          )}
          {error && (
            <Value style={{ fontSize: 12, color: "#ef4444" }}>
              {error.message}
            </Value>
          )}
        </Section>

        {(onEdit || onDelete) && (
          <Footer>
            {onEdit && (
              <Button color="black" onClick={handleEdit} disabled={!detail}>
                수정
              </Button>
            )}
            {onDelete && (
              <Button color="danger" onClick={handleDelete}>
                삭제
              </Button>
            )}
          </Footer>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default CategoryDetailModal;
