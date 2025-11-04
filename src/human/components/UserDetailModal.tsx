import { useState } from "react";
import styled from "styled-components";
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

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  width: 640px;
  max-width: 95%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
`;

const Body = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Footer = styled.div`
  padding: 14px 20px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.span`
  font-size: 0.82rem;
  color: #6b7280;
`;

const Value = styled.span`
  font-size: 0.96rem;
  color: #111827;
  word-break: break-all;
`;

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
        <Modal onClick={(e) => e.stopPropagation()}>
          <Header>
            <Title>사용자 상세</Title>
            <button
              type="button"
              onClick={onClose}
              aria-label="close"
              style={{
                background: "none",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </Header>

          <Body>
            <Item>
              <Label>이름</Label>
              <Value>{record.name}</Value>
            </Item>

            <Item>
              <Label>직급</Label>
              <Value>
                <StatusBadge
                  $variant={record.rank === "LEADER" ? "success" : "info"}
                >
                  {record.rank === "LEADER" ? "팀장" : "사원"}
                </StatusBadge>
              </Value>
            </Item>

            <Item>
              <Label>이메일</Label>
              <Value>{record.email}</Value>
            </Item>

            <Item>
              <Label>연락처</Label>
              <Value>{record.phoneNum}</Value>
            </Item>

            <Item>
              <Label>지역</Label>
              <Value>{record.region}</Value>
            </Item>

            <Item>
              <Label>지점</Label>
              <Value>{record.workType}</Value>
            </Item>
          </Body>

          <Footer>
            {onDelete && <Button onClick={() => onDelete(record)}>삭제</Button>}
            <Button
              type="button"
              onClick={() => {
                setOpenEdit(true);
              }}
            >
              수정
            </Button>
            <Button type="button" onClick={onClose} color="black">
              닫기
            </Button>
          </Footer>
        </Modal>
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
