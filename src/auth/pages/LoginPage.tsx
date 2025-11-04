import styled from "styled-components";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  randomState,
} from "../utils/pkce";
import Button from "../../components/common/Button";

const AUTH_BASE =
  (import.meta.env.VITE_AUTH_BASE as string) ?? "http://localhost:8084";
const CLIENT_ID =
  (import.meta.env.VITE_CLIENT_ID as string) ?? "gearfirst-client";
const REDIRECT_URI =
  (import.meta.env.VITE_REDIRECT_URI as string) ??
  "http://localhost:5173/auth/callback";
const SCOPE =
  (import.meta.env.VITE_SCOPE as string) ?? "openid email offline_access";

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

export default function LoginPage() {
  const handleLogin = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = randomState();

    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);

    const qs = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    }).toString();

    window.location.href = `${AUTH_BASE}/oauth2/authorize?${qs}`;
  };

  return (
    <>
      <Container>
        <Card>
          <Brand>GearFirst ERP</Brand>
          <Title>로그인</Title>
          <Caption>
            관리자 계정으로 로그인하여 ERP 대시보드에 접속하세요.
          </Caption>

          <Button
            type="submit"
            color="black"
            size="lg"
            fullWidth
            style={{ marginTop: 28 }}
            onClick={handleLogin}
          >
            로그인
          </Button>
        </Card>
      </Container>
    </>
  );
}
