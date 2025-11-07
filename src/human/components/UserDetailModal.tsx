import { useState } from "react";
import Button from "../../components/common/Button";
import { StatusBadge } from "../../components/common/PageLayout";
import type {
  CreateUserDTO,
  Rank,
  Region,
  UserRecord,
  WorkType,
} from "../HumanTypes";
import UserRegisterModal from "./UserRegisterModal";
import { getRankMeta } from "../utils/rank";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Footer,
  Header,
  Label,
  ModalContainer,
  Overlay,
  Section,
  Title,
  Value,
} from "../../components/common/ModalPageLayout";

type Props = {
  isOpen: boolean;
  record: UserRecord | null;
  onClose: () => void;
  onDelete?: (record: UserRecord) => void;
  onEdit?: (dto: CreateUserDTO) => Promise<void> | void;
  disableOverlayClose?: boolean;
  regions?: Region[];
  workTypes?: WorkType[];
  ranks?: Rank[];
};

export default function UserDetailModal({
  isOpen,
  record,
  onClose,
  onEdit,
  onDelete,
  disableOverlayClose = false,
}: Props) {
  const [openEdit, setOpenEdit] = useState(false);

  if (!isOpen || !record) return null;

  const handleOverlayClick = () => {
    if (!disableOverlayClose) onClose();
  };

  return (
    <>
      <Overlay onClick={handleOverlayClick}>
        <ModalContainer width="40%" onClick={(e) => e.stopPropagation()}>
          <Header>
            <Title>사용자 상세</Title>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </Header>

          <Section>
            <DetailGrid $cols={2}>
              <DetailItem>
                <Label>이름</Label>
                <Value>{record.name}</Value>
              </DetailItem>

              <DetailItem>
                <Label>직급</Label>
                <Value>
                  {(() => {
                    const meta = getRankMeta(record.rank);
                    return (
                      <StatusBadge $variant={meta.variant}>
                        {meta.label}
                      </StatusBadge>
                    );
                  })()}
                </Value>
              </DetailItem>

              <DetailItem>
                <Label>이메일</Label>
                <Value>{record.email}</Value>
              </DetailItem>

              <DetailItem>
                <Label>연락처</Label>
                <Value>{record.phoneNum}</Value>
              </DetailItem>

              <DetailItem>
                <Label>지역</Label>
                <Value>{record.region}</Value>
              </DetailItem>

              <DetailItem>
                <Label>지점</Label>
                <Value>{record.workType}</Value>
              </DetailItem>
            </DetailGrid>
          </Section>

          <Footer>
            {onDelete && (
              <Button color="danger" onClick={() => onDelete(record)}>
                삭제
              </Button>
            )}
            <Button
              type="button"
              color="black"
              onClick={() => {
                setOpenEdit(true);
              }}
            >
              수정
            </Button>
            <Button type="button" onClick={onClose} color="gray">
              닫기
            </Button>
          </Footer>
        </ModalContainer>
      </Overlay>

      <UserRegisterModal
        mode="edit"
        isOpen={openEdit}
        initial={record}
        onClose={() => setOpenEdit(false)}
        onUpdate={async (dto) => {
          await onEdit?.(dto);
          setOpenEdit(false);
          onClose();
        }}
      />
    </>
  );
}
