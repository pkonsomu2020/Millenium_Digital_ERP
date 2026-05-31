/** Resolves dashboard topbar title/subtitle from the current route. */
export function resolveDashboardPageContext(pathname: string): {
  title: string;
  subtitle: string;
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

  if (pathname === "/") {
    return {
      title: "Dashboard",
      subtitle: "Welcome to Millennium HR Management System",
      hideTopbarOnMobile: false,
    };
  }

  if (pathname === "/stock-management") {
    return { title: "Stock Management", subtitle: "Track and manage office inventory", hideTopbarOnMobile: false };
  }
  if (pathname.includes("document-vault")) {
    return { title: "Document Vault", subtitle: "Manage and secure your digital documents", hideTopbarOnMobile: false };
  }
  if (pathname.includes("minutes-upload")) {
    return { title: "Minutes Upload", subtitle: "View meeting minutes", hideTopbarOnMobile: false };
  }
  if (pathname.includes("leave-requests")) {
    return { title: "Leave Requests", subtitle: "Manage employee leave and absences", hideTopbarOnMobile: false };
  }
  if (pathname.includes("meetings")) {
    return { title: "Meetings", subtitle: "Schedule and manage company meetings", hideTopbarOnMobile: false };
  }

  return { title: "Millennium HR", subtitle: "System Panel", hideTopbarOnMobile: false };
}
