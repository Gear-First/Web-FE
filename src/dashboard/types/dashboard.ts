export type MenuSummary = {
  key: string;
  title: string;
  route: string;
  primary: { value: string; label: string };
  secondary?: string;
  status?: "ok" | "warning" | "muted";
  loading?: boolean;
  error?: string;
};
