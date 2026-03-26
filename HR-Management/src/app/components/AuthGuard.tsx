import { useEffect, useState } from "react";
import { Outlet } from "react-router";

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_URL || "http://localhost:5173";

export function AuthGuard() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Check for one-time auth token passed via URL param from admin app login
    const params = new URLSearchParams(window.location.search);
    const token = params.get("auth");

    if (token) {
      try {
        const user = JSON.parse(atob(token));
        if (user.role === "hr") {
          sessionStorage.setItem("auth_hr", "true");
          sessionStorage.setItem("auth_user", JSON.stringify(user));
          // Strip the param from the URL without reloading
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
    if (isAuth) {
      setAuthed(true);
      setChecked(true);
    } else {
      window.location.href = `${ADMIN_APP_URL}/login/hr`;
    }
  }, []);

  if (!checked) return null;
  if (!authed) return null;
  return <Outlet />;
}
