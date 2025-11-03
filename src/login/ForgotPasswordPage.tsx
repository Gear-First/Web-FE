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
  margin: 0 0 24px;
  color: #6d7588;
  font-size: 0.95rem;
  line-height: 1.5;
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

const Helper = styled.p`
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: #6b7280;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 28px;
  font-size: 0.85rem;
  color: #6b7280;
`;

const LinkButton = styled.button`
  border: none;
  background: none;
  color: black;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 새로고침 방지
    // TODO: 실제 비밀번호 재설정 메일 요청 API 연결
    // 예) await post('/auth/password-reset', { email })
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <Container>
      <Card>
        <Brand>GearFirst ERP</Brand>

        <form onSubmit={onSubmit}>
          <Title>비밀번호 찾기</Title>
          <Caption>
            가입하신 이메일 주소를 입력하세요. 비밀번호 재설정 링크를
            보내드립니다.
          </Caption>

          <Field>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gearfirst.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Helper>
              사내 계정(예: <strong>example@gearfirst.com</strong>)을
              입력하세요.
            </Helper>
          </Field>

          {sent && (
            <div
              role="status"
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                color: "#14532d",
                padding: "12px 14px",
                borderRadius: 12,
                fontSize: "0.9rem",
                marginTop: 6,
              }}
            >
              재설정 링크를 <strong>{email}</strong> 로 보냈습니다. 메일함을
              확인해주세요.
            </div>
          )}

          <Footer>
            <LinkButton type="button" onClick={() => navigate("/login")}>
              로그인 화면으로 돌아가기
            </LinkButton>
          </Footer>

          <Button
            type="submit"
            color="black"
            size="lg"
            fullWidth
            style={{ marginTop: 28 }}
          >
            재설정 링크 보내기
          </Button>
        </form>
      </Card>
    </Container>
  );
}
