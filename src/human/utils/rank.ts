type RankVariant = "success" | "info";

const LEADER_KEYWORDS = new Set(["LEADER", "팀장"]);

export function getRankMeta(rank?: string): {
  label: string;
  variant: RankVariant;
} {
  const raw = (rank ?? "").trim();
  const normalized = raw.toUpperCase();
  if (LEADER_KEYWORDS.has(normalized) || LEADER_KEYWORDS.has(raw)) {
    return { label: "팀장", variant: "success" };
  }
  return { label: "사원", variant: "info" };
}
