import { useState } from "react";
import styled from "styled-components";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7fb 0%, #e9ecf5 45%, #dfe4f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Pretendard", "Segoe UI", sans-serif;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 32px;
  box-shadow: 0 32px 60px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(15, 23, 42, 0.08);
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1.3rem;
  color: #0f172a;
  margin-bottom: 32px;

  &:before {
    content: "⚙️";
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: #f1f4fb;
  }
`;

const Title = styled.h1`
  font-size: 1.6rem;
  margin: 0 0 8px;
  color: #111827;
`;

const Caption = styled.p`
  margin: 0 0 32px;
  color: #6d7588;
  font-size: 0.95rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  font-size: 0.95rem;
  color: #111827;
  background: #ffffff;
  transition: border 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #9ba3b5;
  }

  &:focus {
    outline: none;
    border-color: black;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
  font-size: 0.85rem;
  color: #6b7280;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
`;

const LinkButton = styled.button`
  border: none;
  background: none;
  color: black;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
`;

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const navigate = useNavigate();

  const onChange = (key: "username" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onToggleRemember = () => {
    setForm((prev) => ({ ...prev, remember: !prev.remember }));
  };

  const onSubmit = () => {
    // TODO: 실제 인증 로직 연결
    console.log(form);
    navigate("/");
  };

  return (
    <Container>
      <Card>
        <Brand>GearFirst ERP</Brand>
        <form onSubmit={onSubmit}>
          <Title>로그인</Title>
          <Caption>
            관리자 계정으로 로그인하여 ERP 대시보드에 접속하세요.
          </Caption>

          <Field>
            <Label htmlFor="username">아이디</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="example@gearfirst.com"
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              required
            />
          </Field>

          <Footer>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={form.remember}
                onChange={onToggleRemember}
              />
              로그인 상태 유지
            </CheckboxLabel>
            <LinkButton
              type="button"
              onClick={() => navigate("/forgot-password")}
            >
              비밀번호 찾기
            </LinkButton>
          </Footer>

          <Button
            type="submit"
            color="black"
            size="lg"
            fullWidth
            style={{ marginTop: 28 }}
          >
            로그인
          </Button>
        </form>
      </Card>
    </Container>
  );
}
