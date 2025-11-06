import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { refreshAccessToken } from "../auth/api/refreshToken";

type AuthStatus = "checking" | "authorized" | "unauthorized";

export default function RequireAuth() {
  const location = useLocation();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      setStatus("authorized");
      return;
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      setStatus("unauthorized");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const newToken = await refreshAccessToken();
        if (cancelled) return;
        setStatus(newToken ? "authorized" : "unauthorized");
      } catch {
        if (!cancelled) setStatus("unauthorized");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontSize: "0.95rem",
          color: "#4b5563",
        }}
      >
        인증 정보를 확인하고 있습니다…
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || "/dashboard" }}
      />
    );
  }

  return <Outlet />;
}
