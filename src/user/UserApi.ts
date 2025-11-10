import { AUTH_ENDPOINTS, USER_BASE_PATH } from "../api";
import { fetchWithAuth } from "../auth/api/fetchWithAuth";
import type { UserInfo } from "./UserTypes";

export async function getUser(userId: number): Promise<UserInfo | null> {
  const res = await fetchWithAuth(`${USER_BASE_PATH}/getUser?userId=${userId}`);
  if (!res.ok) {
    console.error("사용자 조회 실패");
    return null;
  }
  const data = await res.json();
  return data.data ?? null;
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<boolean> {
  const res = await fetchWithAuth(`${AUTH_ENDPOINTS.CHANGE_PASSWORD}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });
  const data = await res.json();
  if (data.success) {
    alert("비밀번호가 변경되었습니다.");
    return true;
  } else {
    alert(`${data.message || "변경 실패"}`);
    return false;
  }
}
