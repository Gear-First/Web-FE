import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { forwardRef } from "react";

interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  width?: string;
}

// 안전 파서/포맷터
const toDate = (s?: string) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};
const fmt = (d: Date | null) => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// 마스킹 유틸
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const maskYYYYMMDD = (digits: string) => {
  const v = digits.slice(0, 8);
  if (v.length <= 4) return v; // YYYY
  if (v.length <= 6) return `${v.slice(0, 4)}-${v.slice(4)}`; // YYYY-MM
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`; // YYYY-MM-DD
};
const isValidYMD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// DatePicker용 커스텀 인풋
type CustomInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onValueChange?: (v: string) => void;
  $width?: string;
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ onValueChange, onChange, onBlur, $width, ...props }, ref) => {
    return (
      <InputWrap>
        <InputField
          ref={ref}
          {...props}
          inputMode="numeric"
          $width={$width}
          onChange={(e) => {
            const digits = onlyDigits(e.currentTarget.value);
            const masked = maskYYYYMMDD(digits);
            e.currentTarget.value = masked;

            onChange?.(e);

            if (isValidYMD(masked)) {
              onValueChange?.(masked);
            }
          }}
          onBlur={(e) => {
            const v = e.currentTarget.value;
            if (!isValidYMD(v)) {
              // e.currentTarget.value = "";
            }
            onBlur?.(e);
          }}
        />
        <CalendarIcon aria-hidden />
      </InputWrap>
    );
  }
);
CustomInput.displayName = "CustomInput";

export default function DateRange({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  width = "150px",
}: Props) {
  const start = toDate(startDate);
  const end = toDate(endDate);

  return (
    <Wrapper>
      {/* 시작일 */}
      <DatePicker
        selected={start}
        onChange={(d) => onStartDateChange(fmt(d as Date | null))}
        selectsStart
        startDate={start}
        endDate={end}
        locale={ko}
        placeholderText="시작일"
        dateFormat="yyyy-MM-dd"
        autoComplete="off"
        customInput={
          <CustomInput
            placeholder="시작일"
            value={startDate}
            onValueChange={onStartDateChange}
            $width={width}
          />
        }
        popperContainer={(p) => (
          <div style={{ zIndex: 9999 }}>{p.children}</div>
        )}
      />

      <Separator>~</Separator>

      {/* 종료일 */}
      <DatePicker
        selected={end}
        onChange={(d) => onEndDateChange(fmt(d as Date | null))}
        selectsEnd
        startDate={start}
        endDate={end}
        minDate={start || undefined}
        locale={ko}
        placeholderText="종료일"
        dateFormat="yyyy-MM-dd"
        autoComplete="off"
        customInput={
          <CustomInput
            placeholder="종료일"
            value={endDate}
            onValueChange={onEndDateChange}
            $width={width}
          />
        }
        popperContainer={(p) => (
          <div style={{ zIndex: 9999 }}>{p.children}</div>
        )}
      />
    </Wrapper>
  );
}

// 스타일
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const InputWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;
const InputField = styled.input<{ $width?: string }>`
  width: ${({ $width }) => $width || "150px"};
  padding: 8px 36px 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #111;
  background: #fff;
  &::placeholder {
    color: #9ca3af;
  }
  &:focus {
    outline: none;
    border-color: #111;
  }
`;
const CalendarIcon = styled(CalendarDays)`
  position: absolute;
  right: 10px;
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
`;
const Separator = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
`;
