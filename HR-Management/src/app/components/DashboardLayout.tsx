import { Outlet, Link, useLocation } from "react-router";
import { Home, Package, FileText, Calendar, Users, Menu, X, LogOut, User, FileCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { resolveDashboardPageContext } from "../lib/pageContext";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/stock-management", label: "Stock Management", icon: Package },
  { path: "/document-vault", label: "Document Vault", icon: FileText },
  { path: "/minutes-upload", label: "Minutes Upload", icon: FileCheck },
  { path: "/leave-requests", label: "Leave Requests", icon: Users },
  { path: "/meetings", label: "Meetings", icon: Calendar },
];

export function DashboardLayout() {
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

  const { title: pageTitle, subtitle: pageSubtitle, hideTopbarOnMobile } = resolveDashboardPageContext(
    location.pathname
  );

  return (
    <div className="flex h-screen bg-white dark:bg-[#1F2937] overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#374151] text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-300 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-gray-600 flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img 
              src="/Millenium_logo_white-removebg-preview.png" 
              alt="Millennium HR Logo" 
              className="h-9 w-auto object-contain"
            />
            <div className="w-px h-7 bg-gray-500" />
            <img 
              src="/afosi_logo_white.png" 
              alt="AFOSI Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-gray-300 font-medium text-center uppercase tracking-wider">HR Management System</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#E76F51] text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-600">
          <p className="text-xs text-center text-gray-400">
            © 2026 Millennium Solutions Ltd
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#111827] w-full flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 bg-[#374151] text-white px-3 py-2.5 flex items-center gap-2 shadow-md">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-1 hover:bg-gray-700 rounded-lg transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 text-center px-1">
            <h1 className="text-sm font-bold truncate leading-tight">{pageTitle}</h1>
            {!hideTopbarOnMobile && (
              <p className="text-[10px] text-gray-300 truncate">{pageSubtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative h-9 w-9 rounded-full border-2 border-gray-400 hover:border-white overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
                  aria-label="Account menu"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=E76F51&color=fff`} alt={userName} />
                    <AvatarFallback className="bg-[#E76F51] text-white text-xs font-bold">{initials}</AvatarFallback>
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
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-700" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 focus:dark:bg-gray-700"
                  onClick={() => {
                    sessionStorage.removeItem("auth_hr");
                    sessionStorage.removeItem("auth_user");
                    window.location.href = `${import.meta.env.VITE_ADMIN_URL || ""}/`;
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden lg:block shrink-0 px-8 pt-6 pb-0">
          <div className="bg-[#374151] text-white rounded-xl p-6 shadow-lg flex flex-row items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold truncate">{pageTitle}</h1>
              <p className="text-sm text-gray-300 truncate mt-1">{pageSubtitle}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-xs text-gray-300">{currentDate}</p>
                <p className="text-2xl font-bold tabular-nums mt-1">{currentTime}</p>
              </div>
              <div className="w-px h-12 bg-gray-500" />
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative h-10 w-10 rounded-full border-2 border-gray-400 hover:border-white transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#E76F51]">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=E76F51&color=fff`} alt={userName} />
                        <AvatarFallback className="bg-[#E76F51] text-white font-bold">{initials}</AvatarFallback>
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
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:bg-gray-700" />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 focus:dark:bg-gray-700"
                      onClick={() => {
                        sessionStorage.removeItem("auth_hr");
                        sessionStorage.removeItem("auth_user");
                        window.location.href = `${import.meta.env.VITE_ADMIN_URL || ""}/`;
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
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