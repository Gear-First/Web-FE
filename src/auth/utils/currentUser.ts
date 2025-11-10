import { parseJwt } from "../../utils/parseJwt";

type TokenPayload = {
  name?: string;
  email?: string;
  preferred_username?: string;
  sub?: string;
};

export type CurrentUserProfile = {
  name: string;
  email?: string;
};

export function readCurrentUserFromToken():
  | CurrentUserProfile
  | null {
  const token = sessionStorage.getItem("access_token");
  if (!token) return null;

  const payload = parseJwt<TokenPayload>(token);
  if (!payload) return null;

  const nameFromToken =
    typeof payload.name === "string" ? payload.name.trim() : "";
  const preferredUsername =
    typeof payload.preferred_username === "string"
      ? payload.preferred_username.trim()
      : "";
  const fallbackFromSub =
    typeof payload.sub === "string" && payload.sub.trim()
      ? `사용자 ${payload.sub.trim()}`
      : "";

  const rawName = nameFromToken || preferredUsername || fallbackFromSub || "";

  if (!rawName) return null;

  const email =
    typeof payload.email === "string" ? payload.email.trim() || undefined : undefined;

  return {
    name: rawName,
    email,
  };
}
