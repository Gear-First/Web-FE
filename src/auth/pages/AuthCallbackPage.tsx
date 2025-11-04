import { useEffect, useState } from "react";
import styled from "styled-components";
import { exchangeCodeForToken } from "../utils/token";

const Wrap = styled.div`
  height: 60vh;
  display: grid;
  place-items: center;
`;
const Msg = styled.h2`
  font-size: 18px;
  color: #1f2937;
`;

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("로그인 처리 중...");

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const returnedState = params.get("state");
      const savedState = sessionStorage.getItem("oauth_state");
      const verifier = sessionStorage.getItem("pkce_verifier");

      if (returnedState !== savedState) {
        setMessage("보안 오류: state 불일치");
        return;
      }
      if (!code || !verifier) {
        setMessage("인가코드/PKCE 누락");
        return;
      }

      try {
        await exchangeCodeForToken(code, verifier);
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("pkce_verifier");
        setMessage("로그인 성공! 이동합니다...");
        window.location.replace("/");
      } catch {
        setMessage("토큰 교환 실패");
      }
    })();
  }, []);

  return (
    <Wrap>
      <Msg>{message}</Msg>
    </Wrap>
  );
}
