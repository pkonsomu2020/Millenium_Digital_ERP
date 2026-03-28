import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router";

export function HRAuthGuard() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("auth_hr") === "true";
    setAuthed(isAuth);
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <Navigate to="/login/hr" replace />;
  return <Outlet />;
}
