import type { ReactElement } from "react";
import {
  useOrgTypeGuard,
  type OrgType,
} from "../../auth/hooks/useOrgTypeGuard";

interface Props {
  required: OrgType;
  children: ReactElement;
}

export default function RequireOrgType({ required, children }: Props) {
  const { status } = useOrgTypeGuard(required);

  if (status === "checking" || status === "idle") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          color: "#4b5563",
          fontSize: 14,
        }}
      >
        권한을 확인하고 있습니다…
      </div>
    );
  }

  if (status === "authorized") {
    return children;
  }

  sessionStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = `https://gearfirst-fe.vercel.app/login`;
}
