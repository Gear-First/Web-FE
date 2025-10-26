// src/components/common/FilterDateRange.tsx
import styled from "styled-components";

interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
}

export default function FilterDateRange({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  return (
    <Wrapper>
      <DateInput
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <span>~</span>
      <DateInput
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateInput = styled.input`
  padding: 7px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
`;
