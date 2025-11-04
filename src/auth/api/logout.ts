import { clearTokens } from "../utils/token";
const AUTH_BASE =
  (import.meta.env.VITE_AUTH_BASE as string) ?? "http://localhost:8084";

export async function logout() {
  try {
    await fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    // 네트워크 오류나 서버 응답 실패 시 무시 (로그만 남김)
    console.warn("Logout request failed:", error);
  } finally {
    // 로컬 토큰 정리 후 로그인 화면으로 이동
    clearTokens();
    window.location.replace("/login");
  }
}
