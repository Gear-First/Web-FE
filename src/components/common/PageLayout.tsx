import styled from "styled-components";

export const PageContainer = styled.div`
  flex: 1;
  padding: 2rem;
  background: #f5f6fa;
  overflow-y: auto;
`;

export const SectionCard = styled.section`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
  margin-bottom: 1.5rem;
`;

export const SectionHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1f2937;
`;

export const SectionCaption = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
`;

export const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const Select = styled.select`
  min-width: 140px;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  background: #fff;
  font-size: 0.9rem;
  color: #374151;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  padding: 0.65rem 0.6rem;
  text-align: center;
  background: #f3f5f8;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4b5563;
`;

export const Td = styled.td`
  padding: 0.65rem 0.6rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.85rem;
  color: #1f2937;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const SummaryCard = styled.div<{ $accent?: string }>`
  background: #fff;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  border-left: 4px solid ${({ $accent = "#2563eb" }) => $accent};
`;

export const SummaryLabel = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
`;

export const SummaryValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0.35rem;
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
