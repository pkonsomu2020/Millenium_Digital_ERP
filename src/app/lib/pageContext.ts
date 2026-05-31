/** Resolves dashboard topbar title/subtitle from the current route. */
export function resolveDashboardPageContext(pathname: string): {
  title: string;
  subtitle: string;
  /** Hide the large topbar card on phones/tablets (detail pages use their own header). */
  hideTopbarOnMobile: boolean;
} {
  const stockCategory = pathname.match(/stock-management\/([^/]+)$/);
  if (stockCategory) {
    const cat = decodeURIComponent(stockCategory[1]);
    return {
      title: cat,
      subtitle: "Stock Management Register",
      hideTopbarOnMobile: true,
    };
  }

  if (pathname === "/dashboard" || pathname === "/hr/dashboard" || pathname === "/") {
    return {
      title: pathname.startsWith("/hr") ? "Dashboard" : "Dashboard",
      subtitle: pathname.startsWith("/hr")
        ? "Welcome to Millennium HR Management System"
        : "Welcome to Millennium Digital Admin System",
      hideTopbarOnMobile: false,
    };
  }

  if (pathname.endsWith("/stock-management") || pathname === "/stock-management") {
    return { title: "Stock Management", subtitle: "Track and manage office inventory", hideTopbarOnMobile: false };
  }
  if (pathname.includes("document-vault")) {
    return { title: "Document Vault", subtitle: "Manage and secure your digital documents", hideTopbarOnMobile: false };
  }
  if (pathname.includes("minutes-upload")) {
    return { title: "Minutes Upload", subtitle: "Upload and manage meeting minutes", hideTopbarOnMobile: false };
  }
  if (pathname.includes("leave-requests")) {
    return { title: "Leave Requests", subtitle: "Manage employee leave and absences", hideTopbarOnMobile: false };
  }
  if (pathname.includes("meetings")) {
    return { title: "Meetings", subtitle: "Schedule and manage company meetings", hideTopbarOnMobile: false };
  }

  const isHr = pathname.startsWith("/hr") || pathname === "/stock-management";
  return {
    title: isHr ? "Millennium HR" : "Millennium DAS",
    subtitle: "System Panel",
    hideTopbarOnMobile: false,
  };
}
