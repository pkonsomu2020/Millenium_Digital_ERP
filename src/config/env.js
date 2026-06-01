/**
 * Environment URLs for the unified admin app (Admin + HR on one deployment).
 *
 * Production:
 *   Admin login  → https://admin.millenium.co.ke/login/admin
 *   HR login     → https://admin.millenium.co.ke/login/hr
 *   HR dashboard → https://admin.millenium.co.ke/hr/dashboard
 */
const PRODUCTION_APP_ORIGIN = "https://admin.millenium.co.ke";
const PRODUCTION_API = "https://millenium-digital-erp-ufio.onrender.com/api";

function isMilleniumHostedSite() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "millenium.co.ke" || host.endsWith(".millenium.co.ke");
}

/** Strip trailing slashes from an origin/base URL. */
function normalizeOrigin(url) {
  return url.replace(/\/+$/, "");
}

export function getAppOrigin() {
  if (typeof window !== "undefined" && !import.meta.env.PROD) {
    return normalizeOrigin(window.location.origin);
  }
  const fromEnv = import.meta.env.VITE_HR_URL?.trim();
  if (isMilleniumHostedSite()) {
    if (!fromEnv || /localhost|127\.0\.0\.1/i.test(fromEnv)) {
      return PRODUCTION_APP_ORIGIN;
    }
    return normalizeOrigin(fromEnv);
  }
  return normalizeOrigin(fromEnv || "http://localhost:5173");
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

/** @deprecated use getAppOrigin — HR and Admin share admin.millenium.co.ke */
export function getHrAppUrl() {
  return getAppOrigin();
}

export function getAdminLoginUrl() {
  return `${getAppOrigin()}/login/admin`;
}

export function getHrLoginUrl() {
  return `${getAppOrigin()}/login/hr`;
}

export function getHrDashboardUrl(path = "") {
  const base = `${getAppOrigin()}/hr/dashboard`;
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
