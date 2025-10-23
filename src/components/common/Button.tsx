import React from "react";
import styled from "styled-components";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "gray" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

export default function Button({
  color = "primary",
  size = "md",
  fullWidth,
  loading,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <StyledButton
      $color={color}
      $size={size}
      $full={fullWidth}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "처리 중..." : children}
    </StyledButton>
  );
}

const StyledButton = styled.button<{
  $color: "primary" | "gray" | "danger";
  $size: "sm" | "md" | "lg";
  $full?: boolean;
}>`
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  width: ${({ $full }) => ($full ? "100%" : "auto")};

  /* ---- size ---- */
  ${({ $size }) =>
    $size === "sm"
      ? `padding: 6px 12px; font-size: 0.85rem;`
      : $size === "lg"
      ? `padding: 12px 20px; font-size: 1rem;`
      : `padding: 8px 16px; font-size: 0.9rem;`}

  /* ---- color ---- */
  ${({ $color }) => {
    switch ($color) {
      case "gray":
        return `
          background: #f3f4f6;
          color: #111827;
          &:hover { background: #e5e7eb; }
          &:active { background: #d1d5db; }
        `;
      case "danger":
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
          &:active { background: #b91c1c; }
        `;
      default:
        return `
          background: #2563eb;
          color: white;
          &:hover { background: #1d4ed8; }
          &:active { background: #1e40af; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
