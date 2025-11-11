import type { ReactElement, ReactNode } from "react";
import {
  useOrgTypeGuard,
  type OrgType,
} from "../../auth/hooks/useOrgTypeGuard";

interface Props {
  required: OrgType;
  children: ReactElement;
}

export default function RequireOrgType({ required, children }: Props) {
  const { status, error } = useOrgTypeGuard(required);

  if (status === "checking" || status === "idle") {
    return (
      <Splash>
        <p>권한을 확인하고 있습니다…</p>
      </Splash>
    );
  }

  if (status === "authorized") {
    return children;
  }

  if (status === "forbidden") {
    return (
      <Splash>
        <h2>접근 권한이 없습니다</h2>
        <p>요청한 페이지는 {required} 권한 사용자만 이용할 수 있어요.</p>
        <div>
          <ActionButton
            onClick={() =>
              (window.location.href = `https://gearfirst-fe.vercel.app/login`)
            }
          >
            대시보드로 이동
          </ActionButton>
        </div>
      </Splash>
    );
  }

  if (status === "error") {
    return (
      <Splash>
        <h2>권한 확인 실패</h2>
        <p>{error ?? "권한을 확인하는 중 오류가 발생했습니다."}</p>
        <div>
          <ActionButton onClick={() => window.location.reload()}>
            다시 시도
          </ActionButton>
        </div>
      </Splash>
    );
  }

  sessionStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = `https://gearfirst-fe.vercel.app/login`;

  return null;
}

const Splash = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      minHeight: "50vh",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      alignItems: "center",
      justifyContent: "center",
      color: "#4b5563",
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

const ActionButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    onClick={onClick}
    style={{
      marginTop: 8,
      padding: "8px 18px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: "#111827",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);
