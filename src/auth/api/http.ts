import { getAccessToken, refreshAccessToken } from "../utils/token";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) ?? "http://localhost:8080";

/** 기본 fetch 래퍼: Authorization 자동첨부 + 401 시 리프레시 재시도 */
export async function http(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const url = toUrl(input);
  const token = getAccessToken();

  let res = await fetch(url, withAuth(init, token));
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res;
    res = await fetch(url, withAuth(init, newToken));
  }
  return res;
}

function toUrl(input: string | URL | Request): string | URL | Request {
  if (typeof input === "string") {
    if (/^https?:\/\//i.test(input)) return input;
    return `${API_BASE}${input}`;
  }
  return input;
}

function withAuth(
  init: RequestInit | undefined,
  token: string | null
): RequestInit {
  const headers = new Headers(init?.headers ?? {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

/** JSON 편의 함수 */
export async function httpJson<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const res = await http(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
