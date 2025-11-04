import { Navigate, Outlet, useLocation } from "react-router-dom";

const ACCESS_KEY = "access_token";

export default function RequireAuth() {
  const token = sessionStorage.getItem(ACCESS_KEY);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Outlet />;
}
