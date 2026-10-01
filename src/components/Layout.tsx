import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  FileBarChart,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  BookOpen,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  KeyRound,
} from "lucide-react";
import type { User as UserType, Page, UserRole } from "../types";

const NAV_ITEMS: {
  id: Page;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ["admin", "operator", "viewer"],
  },
  {
    id: "stock-register",
    label: "Stock Register",
    icon: <Package className="w-4 h-4" />,
    roles: ["admin", "operator", "viewer"],
  },
  {
    id: "stock-movement",
    label: "Stock Movement",
    icon: <ArrowLeftRight className="w-4 h-4" />,
    roles: ["admin", "operator", "viewer"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: <FileBarChart className="w-4 h-4" />,
    roles: ["admin"],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: <Users className="w-4 h-4" />,
    roles: ["admin"],
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    icon: <ClipboardList className="w-4 h-4" />,
    roles: ["admin"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    roles: ["admin"],
  },
];

interface LayoutProps {
  user: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  children: React.ReactNode;
  notifications?: number;
}

export default function Layout({
  user,
  currentPage,
  onNavigate,
  onLogout,
  onSearch,
  children,
  notifications = 3,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : user.role === "operator"
        ? "Data Operator"
        : "Viewer";
  const roleBg =
    user.role === "admin"
      ? "bg-red-100 text-red-700"
      : user.role === "operator"
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 bg-blue-950 text-white flex flex-col transition-all duration-200 ease-in-out`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-blue-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white leading-tight">
                Stock Pilot
              </p>
              <p className="text-[10px] text-blue-400">Management System</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  active
                    ? "bg-blue-700 text-white"
                    : "text-blue-200 hover:bg-blue-900 hover:text-white"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400 rounded-r" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-blue-900 p-3">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-blue-200 hover:bg-blue-900 hover:text-white rounded-lg transition`}
            title={!sidebarOpen ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          {/* College name */}
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800">Stock Pilot</p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md ml-auto md:ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch(searchQuery);
                  }
                }}
                placeholder="Search inventory..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800">
                  {user.name.split(" ").slice(0, 2).join(" ")}
                </p>
                <p className="text-[10px] text-slate-500">{roleLabel}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${roleBg}`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onNavigate("profile");
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <KeyRound className="w-4 h-4" /> Change Password
                </button>
                <div className="border-t border-slate-100 mt-1" />
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
