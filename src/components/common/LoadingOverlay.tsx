import type { FC } from "react";
import styled, { keyframes } from "styled-components";

interface LoadingOverlayProps {
  label?: string;
  visible?: boolean;
  coverParent?: boolean;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({
  label = "데이터를 불러오는 중입니다...",
  visible = true,
  coverParent = true,
}) => {
  if (!visible) return null;

  return (
    <Overlay role="status" aria-live="polite" $coverParent={coverParent}>
      <Spinner />
      {label ? <OverlayText>{label}</OverlayText> : null}
    </Overlay>
  );
};

export default LoadingOverlay;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Overlay = styled.div<{ $coverParent: boolean }>`
  position: ${({ $coverParent }) => ($coverParent ? "absolute" : "relative")};
  inset: ${({ $coverParent }) => ($coverParent ? "0" : "auto")};
  background: ${({ $coverParent }) =>
    $coverParent ? "rgba(255, 255, 255, 0.92)" : "transparent"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 18px;
  z-index: 10;
  text-align: center;
  padding: 24px 16px;
  min-height: 120px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(37, 99, 235, 0.2);
  border-top-color: #2563eb;
  animation: ${spin} 0.85s linear infinite;
`;

const OverlayText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #4b5563;
`;
