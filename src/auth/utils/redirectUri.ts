const DEFAULT_LOCAL = "https://gearfirst-auth.duckdns.org/auth/callback";

function getOriginFallback(): string {
  if (typeof window === "undefined") return DEFAULT_LOCAL;
  return `${window.location.origin}/auth/callback`;
}

export function resolveRedirectUri(rawEnv?: string): string {
  const envValue = rawEnv?.trim();
  if (!envValue) return getOriginFallback();

  const candidates = envValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (candidates.length === 0) return getOriginFallback();

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const matched = candidates.find((uri) => uri.startsWith(origin));
    if (matched) return matched;
  }

  return candidates[0];
}
