import { refreshAccessToken } from "./refreshToken";

type FetchArg = string | URL | Request;

export async function fetchWithAuth(
  url: FetchArg,
  options: RequestInit = {}
): Promise<Response> {
  const token = sessionStorage.getItem("access_token");

  const first = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 401 → 리프레시 시도
  if (first.status !== 401) return first;

  const newToken = await refreshAccessToken();
  if (!newToken) return first;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${newToken}`,
    },
  });
}
