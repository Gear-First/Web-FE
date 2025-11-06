import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import StatusChip from "../StatusChip/StatusChip";
import type { MenuSummary } from "../../types/dashboard";

const MenuCardStyled = styled(Link)<{ $status: "ok" | "warning" | "muted"; $isError: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.6rem;
  border-radius: 20px;
  text-decoration: none;
  color: inherit;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  ${({ $status, $isError }) =>
    !$isError &&
    ($status === "ok"
      ? css`
          border-color: rgba(17, 17, 17, 0.12);
        `
      : $status === "warning"
      ? css`
          border-color: rgba(17, 17, 17, 0.25);
        `
      : css`
          border-color: #e4e4e7;
        `)}

  ${({ $isError }) =>
    $isError &&
    css`
      border-color: rgba(239, 68, 68, 0.65);
    `}

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 52px rgba(15, 15, 23, 0.08);
    border-color: rgba(17, 17, 17, 0.28);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.02rem;
  font-weight: 600;
  color: #111111;
`;

const CardValue = styled.div`
  margin-top: 1.4rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f0f11;
  letter-spacing: -0.01em;
`;

const CardLabel = styled.div`
  margin-top: 0.45rem;
  font-size: 0.82rem;
  color: #52525b;
`;

const CardSecondary = styled.p`
  margin: 1.2rem 0 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #6c6c72;
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 1.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f0f11;
`;

type MenuCardProps = {
  card: MenuSummary;
};

export default function MenuCard({ card }: MenuCardProps) {
  const isError = Boolean(card.error);

  return (
    <MenuCardStyled
      to={card.route}
      $status={card.status ?? "muted"}
      $isError={isError}
    >
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
        {isError ? (
          <StatusChip tone="danger">연결 오류</StatusChip>
        ) : card.loading ? (
          <StatusChip tone="muted">갱신 중</StatusChip>
        ) : card.status === "warning" ? (
          <StatusChip tone="warning">주의</StatusChip>
        ) : (
          <StatusChip tone="accent">정상</StatusChip>
        )}
      </CardHeader>
      <CardValue>{card.primary.value}</CardValue>
      <CardLabel>{card.primary.label}</CardLabel>
      {card.secondary && <CardSecondary>{card.secondary}</CardSecondary>}
      <CardFooter>바로가기 →</CardFooter>
    </MenuCardStyled>
  );
}

