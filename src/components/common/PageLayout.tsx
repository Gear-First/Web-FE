import styled from "styled-components";

export const PageContainer = styled.div`
  flex: 1;
  padding: 2.25rem 10rem;
  background: #f4f4f5;
  overflow: auto;
`;

export const SectionCard = styled.section`
  background: #ffffff;
  border-radius: 18px;
  padding: 1.75rem;
  border: 1px solid #e4e4e7;
  box-shadow: 0 20px 40px rgba(15, 15, 23, 0.05);
  margin-bottom: 1.75rem;
`;

export const SectionHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.35rem;
  gap: 1.2rem;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #111111;
`;

export const SectionCaption = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: #6c6c72;
`;

export const FilterGroup = styled.div`
  display: flex;
  margin-bottom: 1.35rem;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 100%;
`;

export const Select = styled.select`
  min-width: 140px;
  padding: 0.48rem 0.65rem;
  border-radius: 12px;
  border: 1px solid #d4d4d8;
  background: #fff;
  font-size: 0.9rem;
  color: #1f1f24;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: #111111;
    box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.12);
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  padding: 0.72rem 0.6rem;
  text-align: center;
  background: #f8f8f9;
  border-bottom: 1px solid #e4e4e7;
  font-size: 0.8rem;
  font-weight: 600;
  color: #3a3a40;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const Td = styled.td`
  padding: 0.72rem 0.6rem;
  text-align: center;
  border-bottom: 1px solid #ededf0;
  font-size: 0.86rem;
  color: #1a1a1e;
`;

type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accepted"
  | "pending"
  | "rejected";

const statusColors: Record<StatusVariant, { bg: string; color: string }> = {
  success: { bg: "#dcfce7", color: "#166534" },
  accepted: { bg: "#dcfce7", color: "#166534" },

  warning: { bg: "#fef3c7", color: "#92400e" },
  pending: { bg: "#fef3c7", color: "#92400e" },

  danger: { bg: "#fee2e2", color: "#991b1b" },
  rejected: { bg: "#fee2e2", color: "#991b1b" },

  info: { bg: "#dbeafe", color: "#1d4ed8" },
};

export const StatusBadge = styled.span<{ $variant?: StatusVariant }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.25rem 0.55rem;
  width: fit-content;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $variant = "info" }) => statusColors[$variant].bg};
  color: ${({ $variant = "info" }) => statusColors[$variant].color};
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1.1rem;
  margin-bottom: 1.75rem;
`;

export const SummaryCard = styled.div<{ $accent?: string }>`
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  padding: 1.2rem 1.4rem;
  border: 1px solid #e4e4e7;
  box-shadow: 0 18px 32px rgba(15, 15, 23, 0.04);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1px solid ${({ $accent = "#0f0f11" }) => $accent};
    opacity: 0.1;
    pointer-events: none;
  }
`;

export const SummaryLabel = styled.div`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

export const SummaryValue = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: #111111;
  margin-top: 0.4rem;
  letter-spacing: -0.01em;
`;

export const SummaryNote = styled.p`
  margin: 0.45rem 0 0;
  font-size: 0.75rem;
  color: #6c6c72;
`;

export const Legend = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

export const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;
