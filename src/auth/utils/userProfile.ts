import {
  clearUserProfile,
  setUserProfile,
  type UserProfile,
} from "../store/userStore";

type FallbackProfile = Partial<UserProfile>;

export function syncUserProfileFromToken(
  token: string | null,
  fallback?: FallbackProfile
): void {
  if (!token) {
    if (fallback?.name) {
      setUserProfile({
        name: fallback.name,
        email: fallback.email,
      });
    } else {
      clearUserProfile();
    }
    return;
  }

  try {
    const payload = parseJwt(token);
    const name =
      stringValue(payload?.name) ??
      stringValue(payload?.preferred_username) ??
      stringValue(payload?.username) ??
      stringValue(payload?.sub) ??
      fallback?.name;

    const email =
      stringValue(payload?.email) ??
      stringValue(payload?.preferred_username) ??
      stringValue(payload?.username) ??
      fallback?.email;

    if (name) {
      setUserProfile({ name, email: email ?? undefined });
      return;
    }
    if (fallback?.name) {
      setUserProfile({
        name: fallback.name,
        email: fallback.email,
      });
    }
  } catch {
    if (fallback?.name) {
      setUserProfile({
        name: fallback.name,
        email: fallback.email,
      });
    }
  }
}

function parseJwt(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1];
  try {
    const json = decodeBase64Url(payload);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  if (
    typeof window !== "undefined" &&
    typeof window.atob === "function"
  ) {
    return window.atob(padded);
  }

  return "";
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}
