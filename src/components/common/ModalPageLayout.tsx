import { forwardRef, type HTMLAttributes } from "react";
import styled, { css } from "styled-components";
import LoadingOverlay from "./LoadingOverlay";

/* 모달 전체 배경 */
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 9, 12, 0.52);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 2000;
`;
interface ModalContainerStyleProps {
  width?: string; // ex) "800px" or "60%"
  maxWidth?: string; // ex) "90%"
  height?: string; // ex) "600px"
  padding?: string; // ex) "24px"
}

export type ModalContainerProps = ModalContainerStyleProps &
  HTMLAttributes<HTMLDivElement> & {
    loading?: boolean;
    loadingLabel?: string;
  };

const StyledModalContainer = styled.div<ModalContainerStyleProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(155deg, #ffffff 0%, #f6f6f8 100%);
  border-radius: 26px;
  border: 1px solid rgba(17, 17, 17, 0.06);
  box-shadow: 0 36px 70px rgba(10, 10, 15, 0.16);
  overflow: hidden;
  animation: modalFade 0.25s ease-out;

  ${({ width }) =>
    width &&
    css`
      width: ${width};
    `}
  ${({ maxWidth }) =>
    maxWidth &&
    css`
      max-width: ${maxWidth};
    `}
  ${({ height }) =>
    height &&
    css`
      height: ${height};
    `}
  ${({ padding }) =>
    padding
      ? css`
          padding: ${padding};
        `
      : css`
          padding: 0;
        `}

  /* 기본값 */
  ${({ width }) =>
    !width &&
    css`
      width: 920px;
    `}
  ${({ maxWidth }) =>
    !maxWidth &&
    css`
      max-width: 95%;
    `}

  @keyframes modalFade {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/* 모달 컨테이너 */
export const ModalContainer = forwardRef<HTMLDivElement, ModalContainerProps>(
  (
    { children, loading = false, loadingLabel = "처리 중입니다...", ...rest },
    ref
  ) => (
    <StyledModalContainer ref={ref} {...rest}>
      {children}
      <LoadingOverlay
        visible={Boolean(loading)}
        label={loadingLabel}
        coverParent
      />
    </StyledModalContainer>
  )
);
ModalContainer.displayName = "ModalContainer";

export const ModalContainerBase = StyledModalContainer;

/* 모달 상단 헤더 */
export const Header = styled.header`
  padding: 1.55rem 2.1rem 1.1rem;
  border-bottom: 1px solid rgba(17, 17, 17, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* 제목 + 상태 뱃지 묶음 (왼쪽 영역) */
export const HeaderLeft = styled.header`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

/* 모달 제목 */
export const Title = styled.h3`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f0f11;
  margin: 0;
`;

/* 닫기 버튼 (X) */
export const CloseButton = styled.button`
  --size: 38px;
  border: none;
  background: transparent;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  font-size: 1.1rem;
  color: #1f1f24;
  cursor: pointer;
  transition: transform 0.18s ease, background-color 0.18s ease,
    color 0.18s ease;

  &:hover {
    background: rgba(17, 17, 17, 0.06);
    color: #0f0f11;
    transform: translateY(-1px);
  }
`;

/* 각 섹션 */
export const Section = styled.section`
  padding: 1.6rem 2.1rem;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(17, 17, 17, 0.05);
  }
`;

/* 섹션 제목 */
export const SectionTitle = styled.h4`
  margin: 0 0 1rem;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  color: #787881;
`;

type DetailGridProps = { $cols?: number };

/* 상세 정보 그리드 */
export const DetailGrid = styled.div<DetailGridProps>`
  display: grid;
  grid-template-columns: repeat(${({ $cols = 3 }) => $cols}, 1fr);
  gap: 0.8rem 1.5rem;
`;

/* 각 항목의 묶음 (Label + Value) */
export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

/* 항목 이름 (예: 담당자, 부품코드 등) */
export const Label = styled.span`
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #90909a;
`;

/* 항목 값 */
export const Value = styled.span`
  font-size: 0.98rem;
  font-weight: 600;
  color: #111113;
`;

/* 부품 리스트 */
export const PartList = styled.div`
  border: 1px solid rgba(17, 17, 17, 0.06);
  border-radius: 14px;
  background: #f7f7f9;
  padding: 0.75rem;
  max-height: 64px;
  overflow-y: scroll;
`;

/* 비고 영역 (텍스트가 길 경우 내부 스크롤) */
export const RemarkSection = styled(Section)`
  max-height: 160px;
  overflow-y: auto;
  padding: 1.1rem 1.6rem;
  border: 1px solid rgba(17, 17, 17, 0.05);
  border-radius: 18px;
`;

/* 비고 입력 래퍼 */
export const TextareaWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

/* 비고 입력 텍스트창 */
export const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 72px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  resize: none;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
  background: #ffffff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &:focus {
    outline: none;
    border-color: rgba(17, 17, 17, 0.32);
    box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
  }
`;

export const Footer = styled.div`
  padding: 1.4rem 2.1rem 1.8rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
`;

/* 버튼 */
export const Button = styled.button<{ color?: string }>`
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: ${({ color }) => color || "#0f0f11"};
  color: ${({ color }) => {
    if (!color) return "#ffffff";
    const normalized = color.toLowerCase();
    return ["black", "#0f0f11", "#111111", "#000", "#000000"].includes(
      normalized
    )
      ? "#ffffff"
      : "#0f0f11";
  }};
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(15, 15, 23, 0.18);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

/* 입력창 */
export const Input = styled.input`
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  &:focus {
    border-color: #111;
    outline: none;
  }
`;
