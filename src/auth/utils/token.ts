export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const AUTH_BASE =
  (import.meta.env.VITE_AUTH_BASE as string) ?? "http://localhost:8084";
const CLIENT_ID =
  (import.meta.env.VITE_CLIENT_ID as string) ?? "gearfirst-client";
const REDIRECT_URI =
  (import.meta.env.VITE_REDIRECT_URI as string) ??
  "http://localhost:5173/auth/callback";

export const getAccessToken = () => sessionStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export function saveTokens(tr: Partial<TokenResponse>) {
  if (tr.access_token) sessionStorage.setItem(ACCESS_KEY, tr.access_token);
  if (tr.refresh_token) localStorage.setItem(REFRESH_KEY, tr.refresh_token);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function exchangeCodeForToken(
  code: string,
  verifier: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch(`${AUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`token_exchange_failed: ${res.status}`);
  const data = (await res.json()) as TokenResponse;
  saveTokens(data);
  return data;
}

let refreshing: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: refresh,
  });

  refreshing = (async () => {
    const res = await fetch(`${AUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      clearTokens();
      refreshing = null;
      return null;
    }
    const data = (await res.json()) as TokenResponse;
    saveTokens(data);
    refreshing = null;
    return data.access_token ?? null;
  })();

  return refreshing;
}
