import { useEffect, useState } from "react";
import { fetchWithAuth } from "../api/fetchWithAuth";
import type { ApiResponse } from "../../api";
import { USER_BASE_PATH } from "../../api";

export type OrgType = "BRANCH" | "HQ" | "WAREHOUSE" | string;

type Status = "idle" | "checking" | "authorized" | "forbidden" | "error";

type Result = {
  status: Status;
  orgType?: OrgType;
  error?: string;
};

const DEFAULT_ENDPOINT = `${USER_BASE_PATH}/me`;
const ME_ENDPOINT =
  import.meta.env.VITE_USER_ME_ENDPOINT ?? DEFAULT_ENDPOINT;

export function useOrgTypeGuard(required?: OrgType): Result {
  const [result, setResult] = useState<Result>({ status: "idle" });

  useEffect(() => {
    if (!required) {
      setResult({ status: "authorized" });
      return;
    }
    let cancelled = false;

    async function load() {
      setResult({ status: "checking" });
      try {
        const res = await fetchWithAuth(ME_ENDPOINT, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          throw new Error(`권한 확인 실패 (${res.status})`);
        }
        const json = (await res.json()) as ApiResponse<string>;
        if (cancelled) return;
        if (!json.success) {
          throw new Error(json.message || "권한 확인 실패");
        }
        const orgType = json.data as OrgType | undefined;
        if (orgType === required) {
          setResult({ status: "authorized", orgType });
        } else {
          setResult({ status: "forbidden", orgType });
        }
      } catch (err) {
        if (cancelled) return;
        setResult({
          status: "error",
          error: err instanceof Error ? err.message : "권한 확인 중 오류",
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [required]);

  return result;
}
