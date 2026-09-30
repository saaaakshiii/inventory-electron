import { useState } from "react";
import type { User, Page } from "./types";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import StockRegister from "./components/StockRegister";
import StockDetail from "./components/StockDetail";
import StockMovement from "./components/StockMovement";
import Reports from "./components/Reports";
import UserManagement from "./components/UserManagement";
import AuditLogs from "./components/AuditLogs";
import Settings from "./components/Settings";
import Profile from "./components/Profile";

// Permission guard map
const PAGE_PERMISSIONS: Record<Page, ("admin" | "operator" | "viewer")[]> = {
  dashboard: ["admin", "operator", "viewer"],
  "stock-register": ["admin", "operator", "viewer"],
  "stock-movement": ["admin", "operator", "viewer"],
  reports: ["admin"],
  "user-management": ["admin"],
  "audit-logs": ["admin"],
  settings: ["admin"],
  "stock-detail": ["admin", "operator", "viewer"],
  profile: ["admin", "operator", "viewer"],
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedStockId, setSelectedStockId] = useState<string | undefined>();

  function handleLogin(u: User) {
    setUser(u);
    setPage("dashboard");
  }

  function handleLogout() {
    setUser(null);
    setPage("dashboard");
  }

  function navigateTo(p: Page, id?: string) {
    if (!user) return;
    const allowed = PAGE_PERMISSIONS[p];
    if (!allowed.includes(user.role)) return;
    setPage(p);
    if (id) setSelectedStockId(id);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  function renderPage() {
    if (!user) return null;
    // Enforce permissions
    const allowed = PAGE_PERMISSIONS[page];
    if (!allowed.includes(user.role)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-500 mt-2 text-sm">
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => setPage("dashboard")}
            className="mt-5 px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    switch (page) {
      case "dashboard":
        return (
          <Dashboard
            user={user}
            onNavigate={(p, id) => navigateTo(p as Page, id)}
          />
        );
      case "stock-register":
        return (
          <StockRegister
            user={user}
            onViewDetail={(id) => navigateTo("stock-detail", id)}
          />
        );
      case "stock-detail":
        return (
          <StockDetail
            stockId={selectedStockId || ""}
            role={user.role}
            onBack={() => setPage("stock-register")}
          />
        );
      case "stock-movement":
        return <StockMovement user={user}/>;
      case "reports":
        return <Reports user={user}/>;
      case "user-management":
        return <UserManagement />;
      case "audit-logs":
        return <AuditLogs />;
      case "settings":
        return <Settings />;
      case "profile":
        return <Profile user={user} />;
      default:
        return null;
    }
  }

  return (
    <Layout
      user={user}
      currentPage={page}
      onNavigate={(p) => navigateTo(p)}
      onLogout={handleLogout}
      notifications={3}
    >
      {renderPage()}
    </Layout>
  );
}
