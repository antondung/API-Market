import { t, useLanguage } from "../i18n";
import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Search,
  KeyRound,
  ChartNoAxesCombined,
  FileText,
  Shield,
  Users,
  Layers,
  Code2,
} from "lucide-react";
import manifest from "../screens/manifest.json";
import { useStore } from "../features/store";
import type { Role } from "../lib/types";
import { backendEnabled } from "../lib/api-client";
const menus: Record<Role, [string, string][]> = {
  consumer: [
    ["/app/overview", "Overview"],
    ["/marketplace", "Explore APIs"],
    ["/app/subscriptions", "My Subscriptions"],
    ["/app/keys", "API Keys"],
    ["/app/usage", "Usage & Quota"],
    ["/app/requests", "Request History"],
    ["/app/analytics", "Analytics"],
    ["/app/cost-guard", "Cost Guard & Alerts"],
    ["/app/reports", "My Reports"],
    ["/app/profile", "Profile"],
    ["/app/settings", "Settings"],
  ],
  provider: [
    ["/provider/overview", "Overview"],
    ["/provider/apis", "My APIs"],
    ["/provider/apis/new", "Create API"],
    ["/provider/import", "OpenAPI Import"],
    ["/provider/endpoints", "Endpoints & Versions"],
    ["/provider/plans", "Pricing Plans"],
    ["/provider/subscribers", "Subscribers"],
    ["/provider/analytics", "Analytics & Health"],
    ["/provider/requests", "Request History"],
    ["/provider/revenue", "Revenue · Sandbox"],
    ["/provider/verification", "Verification"],
    ["/provider/compliance", "Compliance"],
    ["/provider/review", "Publishing Workflow"],
  ],
  admin: [
    ["/admin/overview", "Overview"],
    ["/admin/users", "Users"],
    ["/admin/providers", "Providers"],
    ["/admin/reviews", "API Reviews"],
    ["/admin/apis", "API Management"],
    ["/admin/subscriptions", "Subscriptions"],
    ["/admin/payments", "Sandbox Payments"],
    ["/admin/reports", "Reports & Moderation"],
    ["/admin/monitoring", "Monitoring"],
    ["/admin/requests", "Request History"],
    ["/admin/audit", "Audit Logs"],
  ],
};
const symbols = [
  LayoutDashboard,
  Search,
  Layers,
  KeyRound,
  ChartNoAxesCombined,
  FileText,
  Shield,
  Users,
  Code2,
];
export default function Shell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();
  const { session, logout, notice, data } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState(false);
  const role = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/provider")
      ? "provider"
      : session?.role || "consumer";
  const workspace = /^\/(app|provider|admin|account|notifications)(\/|$)/.test(
    location.pathname,
  );
  const title =
    manifest.find((m) => m.path === location.pathname)?.title || "API HUB";
  return (
    <>
      <a className="skip-link" href="#app-content">
        {t("Skip to content")}
      </a>
      <header className="hub-topbar">
        <Link to="/" className="hub-brand">
          {t("API HUB ")}
          <span className="brand-mark">{t("/")}</span>
        </Link>
        {!workspace && (
          <nav className="public-links">
            <NavLink to="/marketplace">{t("Explore APIs")}</NavLink>
            <NavLink to="/apis/neural-llm/docs">{t("Documentation")}</NavLink>
            <NavLink to="/pricing">{t("Pricing")}</NavLink>
            <NavLink to="/provider/overview">{t("Become a Provider")}</NavLink>
          </nav>
        )}
        {workspace && (
          <span className="text-on-surface-variant hidden md:block">
            {t(title)}
          </span>
        )}
        <div className="flex items-center gap-3">
          <label className="language-switch">
            <span className="sr-only">{t("Language")}</span>
            <select
              aria-label={t("Language")}
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as "vi" | "en")
              }
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>
          <button className="screen-index" onClick={() => setCatalog(!catalog)}>
            {t("All screens")}
          </button>
          {session ? (
            <>
              <Link
                to="/notifications"
                className="icon-button"
                aria-label={t(
                  `Notifications: ${data.notifications.filter((n) => n.role === session.role && !n.read).length} unread`,
                )}
              >
                <Bell size={19} />
              </Link>
              <button
                className="avatar"
                aria-label={t("My account")}
                onClick={() => navigate("/account")}
              >
                {session.name.slice(0, 2).toUpperCase()}
              </button>
              <button
                className="icon-button"
                aria-label={t("Sign out")}
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                {t("Login")}
              </Link>
              <Link to="/login" className="hub-button primary">
                {t("Dashboard ")}
                <ArrowRight size={16} />
              </Link>
            </>
          )}
          <button
            className="icon-button mobile-menu"
            aria-label={t(open ? "Close navigation" : "Open navigation")}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {catalog && (
        <div className="screen-catalog">
          <div className="flex justify-between mb-4">
            <strong>{t("Project screens \u00B7 Stitch design source")}</strong>
            <button
              onClick={() => setCatalog(false)}
              aria-label={t("Close screen catalog")}
            >
              <X size={18} />
            </button>
          </div>
          <div className="catalog-links">
            {manifest.map((m) => (
              <Link key={m.path} to={m.path} onClick={() => setCatalog(false)}>
                <small>{t(m.role)}</small>
                {t(m.title)}
              </Link>
            ))}
            <Link to="/login">{t("Login")}</Link>
            <Link to="/register">{t("Register")}</Link>
          </div>
        </div>
      )}
      {open && !workspace && (
        <nav className="mobile-public-nav">
          {["/marketplace", "/pricing", "/login", "/register"].map((path) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}>
              {t(
                (
                  {
                    "/marketplace": "Marketplace",
                    "/pricing": "Pricing",
                    "/login": "Login",
                    "/register": "Register",
                  } as Record<string, string>
                )[path],
              )}
            </Link>
          ))}
        </nav>
      )}
      {workspace && (
        <>
          <div
            className={open ? "sidebar-backdrop" : "hidden"}
            onClick={() => setOpen(false)}
          />
          <aside className={`hub-sidebar ${open ? "is-open" : ""}`}>
            <div className="workspace-heading">
              {t(
                role === "consumer"
                  ? "Consumer workspace"
                  : role === "provider"
                    ? "Provider workspace"
                    : "Admin workspace",
              )}
            </div>
            <nav>
              {menus[role].map(([path, label], i) => {
                const Icon = symbols[i % symbols.length];
                return (
                  <NavLink
                    key={path}
                    to={path}
                    end
                    aria-label={t(label)}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{t(label)}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="sidebar-footer">
              <Link to="/marketplace">
                <Search size={17} />
                {t("Explore Marketplace")}
              </Link>
              <span>
                {session?.name || t("Developer")}
                <small>{session?.email}</small>
              </span>
            </div>
          </aside>
        </>
      )}
      <main
        id="app-content"
        className={workspace ? "workspace-main" : "public-main"}
      >
        {backendEnabled ? (
          <div role="status" className="demo-banner">
            {t(
              "Authentication uses the backend. Marketplace, payments, API keys and reports still use demo data because their backend endpoints are not available.",
            )}
          </div>
        ) : (
          <div className="demo-banner">
            {t("DEMO DATA ")}
            <span>
              {t(
                "Local frontend workspace. No live requests, verification or real payments.",
              )}
            </span>
            <Link to="/login">{t("Change demo role")}</Link>
          </div>
        )}
        {children}
      </main>
      {!workspace && (
        <footer className="hub-footer">
          <div>
            <Link to="/" className="hub-brand">
              {t("API HUB")}
            </Link>
            <p>
              {t("The developer platform for discovering, testing")}
              <br />
              {t("and managing APIs.")}
            </p>
          </div>
          <div>
            <Link to="/marketplace">{t("Explore APIs")}</Link>
            <Link to="/pricing">{t("Pricing")}</Link>
            <Link to="/apis/neural-llm/docs">{t("Documentation")}</Link>
          </div>
          <div>
            <Link to="/provider/overview">{t("Provider workspace")}</Link>
            <Link to="/design/component_library_design_system_showcase">
              {t("Design system")}
            </Link>
            <Link to="/account">{t("Account")}</Link>
          </div>
          <small>{t("\u00A9 2026 API HUB \u00B7 Demo environment")}</small>
        </footer>
      )}
      {notice && (
        <div className="hub-toast" role="status">
          {t(notice)}
        </div>
      )}
    </>
  );
}
