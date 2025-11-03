import { useState, useMemo } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import type { BranchType, CreateUserDTO, UserRole } from "../HumanTypes";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  width: 560px;
  max-width: 95%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.05rem;
`;

const Body = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Footer = styled.div`
  padding: 14px 20px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #111827;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  &:focus {
    outline: none;
    border-color: #111;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  &:focus {
    outline: none;
    border-color: #111;
  }
`;

const Error = styled.div`
  grid-column: 1 / -1;
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.9rem;
`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateUserDTO) => Promise<void> | void;
  regions?: string[];
};

const DEFAULT_REGIONS = [
  "서울",
  "부산",
  "경기",
  "인천",
  "대전",
  "대구",
  "광주",
  "울산",
  "세종",
];

export default function UserRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  regions = DEFAULT_REGIONS,
}: Props) {
  const [form, setForm] = useState<CreateUserDTO>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "EMPLOYEE",
    region: regions[0] ?? "서울",
    branch: "본사",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
  const isValidPhone = (v: string) =>
    /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, ""));

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!isValidEmail(form.email)) return false;
    if (!isValidPhone(form.phone)) return false;
    if (form.password.trim().length < 8) return false;
    return true;
  }, [form]);

  if (!isOpen) return null;

  const update = <K extends keyof CreateUserDTO>(
    key: K,
    value: CreateUserDTO[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError(
        "입력값을 확인해주세요. (이메일/연락처 형식, 비밀번호 8자 이상)"
      );
      return;
    }
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("등록 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <span>회원가입</span>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </Header>

        <form onSubmit={handleSubmit}>
          <Body>
            <Field>
              이름
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="홍길동"
                required
              />
            </Field>

            <Field>
              이메일
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="user@gearfirst.com"
                required
              />
            </Field>

            <Field>
              폰번호
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="010-1234-5678"
                required
              />
            </Field>

            <Field>
              비밀번호
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="8자 이상"
                required
              />
            </Field>

            <Field>
              회원직급
              <Select
                value={form.role}
                onChange={(e) => update("role", e.target.value as UserRole)}
              >
                <option value="EMPLOYEE">사원 (EMPLOYEE)</option>
                <option value="LEADER">팀장 (LEADER)</option>
              </Select>
            </Field>

            <Field>
              지역
              <Select
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>

            <Field style={{ gridColumn: "1 / -1" }}>
              지점
              <Select
                value={form.branch}
                onChange={(e) => update("branch", e.target.value as BranchType)}
              >
                <option value="본사">본사</option>
                <option value="대리점">대리점</option>
                <option value="창고">창고</option>
              </Select>
            </Field>

            {error && <Error>{error}</Error>}
          </Body>

          <Footer>
            <Button type="button" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" color="black" disabled={!canSubmit || busy}>
              {busy ? "등록 중…" : "등록"}
            </Button>
          </Footer>
        </form>
      </Modal>
    </Overlay>
  );
}
