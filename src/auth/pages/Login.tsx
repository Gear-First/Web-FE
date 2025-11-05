import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "../utils/pkce";
import { type JSX } from "react";

/**
 * 필요시 .env에 다음 값을 넣어 타입 안정성 높일 수 있어요.
 * VITE_AUTH_SERVER=http://localhost:8084
 * VITE_CLIENT_ID=gearfirst-client
 * VITE_REDIRECT_URI=http://localhost:5173/auth/callback
 */
const AUTH_SERVER =
  import.meta.env.VITE_AUTH_SERVER ?? "http://34.120.215.23/auth";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "gearfirst-client";
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:5173/auth/callback";

function Login(): JSX.Element {
  const handleLogin = async (): Promise<void> => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    // 토큰 교환 시 사용
    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "openid email offline_access",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });

    window.location.href = `${AUTH_SERVER}/oauth2/authorize?${params}`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>GearFirst 로그인 테스트</h1>
      <button onClick={handleLogin}>로그인하기</button>
    </div>
  );
}

export default Login;
