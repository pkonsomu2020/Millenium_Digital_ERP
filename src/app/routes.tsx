import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { AuthGuard } from "./components/AuthGuard";
import { HRAuthGuard } from "./components/hr/HRAuthGuard";
import { HRDashboardLayout } from "./components/hr/HRDashboardLayout";
import { Landing } from "./pages/Landing";
import { AdminLogin } from "./pages/AdminLogin";
import { HRLogin } from "./pages/HRLogin";
import { Home } from "./pages/Home";
import { StockManagement } from "./pages/StockManagement";
import { CategoryDetails } from "./pages/CategoryDetails";
import { DocumentVault } from "./pages/DocumentVault";
import { MinutesUpload } from "./pages/MinutesUpload";
import { LeaveRequests } from "./pages/LeaveRequests";
import { Meetings } from "./pages/Meetings";
import { HRHome } from "./pages/hr/Home";
import { HRStockManagement } from "./pages/hr/StockManagement";
import { HRCategoryDetails } from "./pages/hr/CategoryDetails";
import { HRDocumentVault } from "./pages/hr/DocumentVault";
import { HRMinutesUpload } from "./pages/hr/MinutesUpload";
import { LeaveRequests as HRLeaveRequests } from "./pages/hr/LeaveRequests";
import { Meetings as HRMeetings } from "./pages/Meetings";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login/admin", Component: AdminLogin },
  { path: "/login/hr", Component: HRLogin },
  { path: "/login", Component: () => { window.location.replace("/login/admin"); return null; } },
  {
    Component: AuthGuard,
    children: [
      {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Home },
          { path: "stock-management", Component: StockManagement },
          { path: "stock-management/:category", Component: CategoryDetails },
          { path: "document-vault", Component: DocumentVault },
          { path: "minutes-upload", Component: MinutesUpload },
          { path: "leave-requests", Component: LeaveRequests },
          { path: "meetings", Component: Meetings },
        ],
      },
    ],
  },
  {
    Component: HRAuthGuard,
    children: [
      {
        path: "/hr/dashboard",
        Component: HRDashboardLayout,
        children: [
          { index: true, Component: HRHome },
          { path: "stock-management", Component: HRStockManagement },
          { path: "stock-management/:category", Component: HRCategoryDetails },
          { path: "document-vault", Component: HRDocumentVault },
          { path: "minutes-upload", Component: HRMinutesUpload },
          { path: "leave-requests", Component: HRLeaveRequests },
          { path: "meetings", Component: HRMeetings },
        ],
      },
    ],
  },
]);
