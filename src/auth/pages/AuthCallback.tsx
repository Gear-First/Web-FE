import React, { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import type { TokenResponse } from "../types/auth";
import { syncUserProfileFromToken } from "../utils/userProfile";

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

function AuthCallback(): JSX.Element {
  const [message, setMessage] = useState<string>("로그인 중입니다...");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const returnedState = params.get("state");
        const savedState = sessionStorage.getItem("oauth_state");
        const verifier = sessionStorage.getItem("pkce_verifier");

        if (!returnedState || returnedState !== savedState) {
          setMessage("보안 오류: state 값이 일치하지 않습니다.");
          return;
        }
        if (!code || !verifier) {
          setMessage("인가 코드 또는 PKCE verifier가 없습니다.");
          return;
        }

        const basicAuth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

        const res = await fetch(`${AUTH_SERVER}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          setMessage(`로그인 실패: ${res.status} ${text}`);
          return;
        }

        const data = (await res.json()) as TokenResponse;

        if (!data.access_token) {
          setMessage("로그인 실패: access_token이 없습니다.");
          return;
        }

        // 액세스 토큰은 세션, 리프레시는 로컬
        sessionStorage.setItem("access_token", data.access_token);
        syncUserProfileFromToken(data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        setMessage("로그인 성공! 🎉");
        setTimeout(() => {
          navigate("/mrp", { replace: true });
        }, 800);
      } catch (e) {
        console.error(e);
        setMessage("로그인 처리 중 오류가 발생했습니다.");
      }
    })();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{message}</h2>
    </div>
  );
}

export default AuthCallback;
