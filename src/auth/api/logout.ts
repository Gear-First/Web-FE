import { clearUserProfile } from "../store/userStore";

const AUTH_SERVER =
  import.meta.env.VITE_AUTH_SERVER ?? "http://34.120.215.23/auth";

export function logout(): void {
  // 서버 세션/쿠키가 있다면 동시에 무효화
  fetch(`${AUTH_SERVER}/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    // 서버 로그아웃 실패해도 클라이언트 토큰은 지움
  });

  sessionStorage.clear();
  localStorage.clear();
  clearUserProfile();

  window.location.href = "/";
}
