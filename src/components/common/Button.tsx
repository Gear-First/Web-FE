import React from "react";
import styled, { css } from "styled-components";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "gray" | "danger" | "black";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  variant?: "default" | "icon";
}

export default function Button({
  color = "black",
  size = "md",
  fullWidth,
  loading,
  children,
  disabled,
  variant = "default",
  ...rest
}: ButtonProps) {
  return (
    <StyledButton
      $color={color}
      $size={size}
      $full={fullWidth}
      $variant={variant}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "처리 중..." : children}
    </StyledButton>
  );
}

type ButtonColor = "primary" | "gray" | "danger" | "black";
type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "default" | "icon";

const iconVariant = css`
  background: transparent;
  padding: 6px;
  border-radius: 6px;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  &:active {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 6px 12px;
    font-size: 0.85rem;
  `,
  md: css`
    padding: 8px 16px;
    font-size: 0.9rem;
  `,
  lg: css`
    padding: 12px 20px;
    font-size: 1rem;
  `,
};

const colorStyles: Record<ButtonColor, ReturnType<typeof css>> = {
  primary: css`
    background: #2563eb;
    color: white;
    &:hover {
      background: #1d4ed8;
    }
    &:active {
      background: #1e40af;
    }
  `,
  gray: css`
    background: #e5e7eb;
    color: #111827;

    &:hover {
      background: #d1d5db;
    }

    &:active {
      background: #9ca3af;
    }
  `,
  danger: css`
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
    &:active {
      background: #b91c1c;
    }
  `,
  black: css`
    background: #111827;
    color: white;
    &:hover {
      background: #1f2937;
    }
    &:active {
      background: #0f172a;
    }
  `,
};

const StyledButton = styled.button<{
  $color: ButtonColor;
  $size: ButtonSize;
  $full?: boolean;
  $variant: ButtonVariant;
}>`
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  width: ${({ $full }) => ($full ? "100%" : "auto")};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${({ $variant, $size }) =>
    $variant === "icon" ? iconVariant : sizeStyles[$size]}

  /* ---- color (기본 variant용) ---- */
  ${({ $variant, $color }) =>
    $variant === "default" ? colorStyles[$color] : css``}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
