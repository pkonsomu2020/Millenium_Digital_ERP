import { Navigate, Outlet } from "react-router";

export function AuthGuard() {
  const isAuth = sessionStorage.getItem("auth_admin") === "true";
  return isAuth ? <Outlet /> : <Navigate to="/login/admin" replace />;
}
