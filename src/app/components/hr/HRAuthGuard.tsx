import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router";

export function HRAuthGuard() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Check for one-time auth token passed via URL param after HR login
    const params = new URLSearchParams(window.location.search);
    const token = params.get("auth");

    if (token) {
      try {
        const user = JSON.parse(atob(token));
        if (user.role === "hr") {
          sessionStorage.setItem("auth_hr", "true");
          sessionStorage.setItem("auth_user", JSON.stringify(user));
          window.history.replaceState({}, "", window.location.pathname);
          setAuthed(true);
          setChecked(true);
          return;
        }
      } catch {
        // invalid token, fall through
      }
    }

    const isAuth = sessionStorage.getItem("auth_hr") === "true";
    setAuthed(isAuth);
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <Navigate to="/login/hr" replace />;
  return <Outlet />;
}
