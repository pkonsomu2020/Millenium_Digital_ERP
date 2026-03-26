import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { AuthGuard } from "./components/AuthGuard";
import { Home } from "./pages/Home";
import { StockManagement } from "./pages/StockManagement";
import { CategoryDetails } from "./pages/CategoryDetails";
import { DocumentVault } from "./pages/DocumentVault";
import { MinutesUpload } from "./pages/MinutesUpload";
import { LeaveRequests } from "./pages/LeaveRequests";
import { Meetings } from "./pages/Meetings";

export const router = createBrowserRouter([
  {
    Component: AuthGuard,
    children: [
      {
        path: "/",
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
]);
