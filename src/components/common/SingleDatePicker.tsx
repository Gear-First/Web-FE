import { Input as BaseInput } from "../../components/common/ModalPageLayout";
import styled from "styled-components";
import { CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import { forwardRef } from "react";
import "react-datepicker/dist/react-datepicker.css";

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
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const maskYYYYMMDD = (digits: string) => {
  const v = digits.slice(0, 8);
  if (v.length <= 4) return v;
  if (v.length <= 6) return `${v.slice(0, 4)}-${v.slice(4)}`;
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
};
const isValidYMD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const StyledDateInput = styled(BaseInput)`
  padding-right: 36px; /* 달력 아이콘 자리만 확보 */
  width: 100%;
`;

// 아이콘과 래퍼
const InputWrap = styled.div`
  position: relative;
  width: 100%; /* 그리드 셀 가로 꽉 채움 */
  display: inline-flex;
  align-items: center;
`;

const CalendarIcon = styled(CalendarDays)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
`;

// 커스텀 인풋
type CustomInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onValueChange?: (v: string) => void;
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ onValueChange, onChange, onBlur, ...props }, ref) => (
    <InputWrap>
      <StyledDateInput
        ref={ref}
        {...props}
        inputMode="numeric"
        onChange={(e) => {
          const digits = onlyDigits(e.currentTarget.value);
          const masked = maskYYYYMMDD(digits);
          e.currentTarget.value = masked;
          onChange?.(e);
          if (isValidYMD(masked)) onValueChange?.(masked);
        }}
        onBlur={(e) => {
          // 필요하면 불완전 입력 처리
          onBlur?.(e);
        }}
      />
      <CalendarIcon aria-hidden />
    </InputWrap>
  )
);
CustomInput.displayName = "CustomInput";

// 단일 날짜 피커 컴포넌트 (외형 동일, 달력 기능만 추가)
export default function SingleDatePicker({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled = false,
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}) {
  const selected = toDate(value);
  const minDate = min ? toDate(min) ?? undefined : undefined;
  const maxDate = max ? toDate(max) ?? undefined : undefined;

  return (
    <DatePicker
      selected={selected}
      onChange={(d) => onChange(fmt(d as Date | null))}
      dateFormat="yyyy-MM-dd"
      placeholderText={placeholder}
      autoComplete="off"
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      customInput={
        <CustomInput
          placeholder={placeholder}
          value={value}
          onValueChange={onChange}
          readOnly={disabled}
        />
      }
      popperContainer={(p) => <div style={{ zIndex: 9999 }}>{p.children}</div>}
    />
  );
}
