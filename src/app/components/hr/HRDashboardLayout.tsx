import { Outlet, Link, useLocation } from "react-router";
import { Home, Package, FileText, Calendar, Users, Menu, X, LogOut, User, FileCheck } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const navItems = [
  { path: "/hr/dashboard", label: "Home", icon: Home },
  { path: "/hr/dashboard/stock-management", label: "Stock Management", icon: Package },
  { path: "/hr/dashboard/document-vault", label: "Document Vault", icon: FileText },
  { path: "/hr/dashboard/minutes-upload", label: "Minutes Upload", icon: FileCheck },
  { path: "/hr/dashboard/leave-requests", label: "Leave Requests", icon: Users },
  { path: "/hr/dashboard/meetings", label: "Meetings", icon: Calendar },
];

export function HRDashboardLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const user = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
  const userName = user.name || "HR User";
  const userEmail = user.email || "";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageContext = (path: string) => {
    if (path === "/hr/dashboard") return { title: "Dashboard", subtitle: "Welcome to Millennium HR Management System" };
    if (path.includes("stock-management")) return { title: "Stock Management", subtitle: "Track and manage office inventory" };
    if (path.includes("document-vault")) return { title: "Document Vault", subtitle: "Manage and secure your digital documents" };
    if (path.includes("minutes-upload")) return { title: "Minutes Upload", subtitle: "View meeting minutes" };
    if (path.includes("leave-requests")) return { title: "Leave Requests", subtitle: "Manage employee leave and absences" };
    if (path.includes("meetings")) return { title: "Meetings", subtitle: "Schedule and manage company meetings" };
    return { title: "Millennium HR", subtitle: "System Panel" };
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageContext(location.pathname);

  return (
    <div className="flex h-screen bg-white dark:bg-[#1F2937] overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#374151] text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={closeSidebar} className="lg:hidden absolute top-4 right-4 p-2 text-gray-300 hover:text-white" aria-label="Close menu">
          <X className="w-6 h-6" />
        </button>
        <div className="p-6 border-b border-gray-600 flex flex-col items-center">
          <img src="/Millenium_logo_white-removebg-preview.png" alt="Millennium HR Logo" className="w-48 h-auto object-contain mb-2" />
          <p className="text-xs text-gray-300 font-medium text-center uppercase tracking-wider">HR Management System</p>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.path === "/hr/dashboard"
                ? location.pathname === "/hr/dashboard"
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-[#D1131B] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-600">
          <p className="text-xs text-center text-gray-400">© 2026 Millennium Solutions Ltd</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#111827] w-full flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 bg-[#374151] text-white p-4 flex items-center justify-between shadow-md">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Millennium HR</h1>
          <div className="w-10" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8 pb-0 shrink-0">
          <div className="bg-[#374151] text-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{pageTitle}</h1>
              <p className="text-sm sm:text-base text-gray-300">{pageSubtitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto lg:flex-shrink-0">
              <div className="text-left order-2 sm:order-1">
                <p className="text-xs sm:text-sm text-gray-300">{currentDate}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{currentTime}</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-500 order-2"></div>
              <div className="flex items-center gap-3 order-1 sm:order-3 self-end sm:self-auto">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative h-10 w-10 rounded-full border-2 border-gray-400 hover:border-white transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#D1131B]">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=D1131B&color=fff`} alt={userName} />
                        <AvatarFallback className="bg-[#D1131B] text-white font-bold">{initials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 dark:bg-gray-800 dark:border-gray-700">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none dark:text-white">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem className="cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200">
                      <User className="mr-2 h-4 w-4" /><span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 focus:dark:bg-gray-700"
                      onClick={() => {
                        sessionStorage.removeItem("auth_hr");
                        sessionStorage.removeItem("auth_user");
                        window.location.href = "/";
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
