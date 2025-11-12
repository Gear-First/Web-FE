import { clearUserProfile } from "../store/userStore";

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER;

export async function logout(): Promise<void> {
  const accessToken = sessionStorage.getItem("access_token");

  try {
    await fetch(`${AUTH_SERVER}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  } catch {
    // 서버 요청 실패해도 클라이언트 상태는 이미 정리됨
  } finally {
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    clearUserProfile();
    // window.location.href = `https://gearfirst-fe.vercel.app/login`;
    window.location.href = `http://localhost:5173/login`;
  }
}
