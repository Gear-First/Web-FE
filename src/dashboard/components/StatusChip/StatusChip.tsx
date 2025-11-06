import styled, { css } from "styled-components";

const StatusChipStyled = styled.span<{ $tone: "accent" | "warning" | "danger" | "muted" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0.8rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  ${({ $tone }) => {
    switch ($tone) {
      case "accent":
        return css`
          background: rgba(17, 17, 17, 0.08);
          color: #0f0f11;
          border: 1px solid rgba(17, 17, 17, 0.18);
        `;
      case "warning":
        return css`
          background: rgba(250, 204, 21, 0.18);
          color: #854d0e;
          border: 1px solid rgba(250, 204, 21, 0.45);
        `;
      case "danger":
        return css`
          background: rgba(248, 113, 113, 0.18);
          color: #991b1b;
          border: 1px solid rgba(248, 113, 113, 0.42);
        `;
      case "muted":
      default:
        return css`
          background: rgba(152, 152, 162, 0.18);
          color: #63636a;
          border: 1px solid rgba(152, 152, 162, 0.28);
        `;
    }
  }}
`;

type StatusChipProps = {
  tone: "accent" | "warning" | "danger" | "muted";
  children: React.ReactNode;
};

export default function StatusChip({ tone, children }: StatusChipProps) {
  return <StatusChipStyled $tone={tone}>{children}</StatusChipStyled>;
}

