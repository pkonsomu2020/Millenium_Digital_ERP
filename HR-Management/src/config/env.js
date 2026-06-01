/**
 * Standalone HR-Management app (optional separate deploy).
 * Production HR portal for your setup: https://admin.millenium.co.ke/login/hr
 */
const PRODUCTION_ADMIN_ORIGIN = "https://admin.millenium.co.ke";
const PRODUCTION_API = "https://millenium-digital-erp-ufio.onrender.com/api";

function isMilleniumHostedSite() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "millenium.co.ke" || host.endsWith(".millenium.co.ke");
}

export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();

  if (isMilleniumHostedSite()) {
    if (!fromEnv || /localhost|127\.0\.0\.1/i.test(fromEnv)) {
      return PRODUCTION_API;
    }
    return fromEnv.replace(/\/$/, "");
  }

  return fromEnv || "http://localhost:3000/api";
}

export function getApiOrigin() {
  return getApiBaseUrl().replace(/\/api\/?$/, "");
}

/** Main app host — HR login lives at /login/hr on this domain. */
export function getAdminAppUrl() {
  const fromEnv = import.meta.env.VITE_ADMIN_URL?.trim();
  if (isMilleniumHostedSite()) {
    return fromEnv?.replace(/\/$/, "") || PRODUCTION_ADMIN_ORIGIN;
  }
  return fromEnv?.replace(/\/$/, "") || "http://localhost:5173";
}

export function getHrLoginUrl() {
  return `${getAdminAppUrl()}/login/hr`;
}
