import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { t, useLanguage } from "../i18n";
import { useStore } from "../features/store";
import type { Role } from "../lib/types";

const workspace: Record<Role, string> = {
  consumer: "/app/overview",
  provider: "/provider/overview",
  admin: "/admin/overview",
};
export default function Shell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();
  const { session, logout, notice } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const inWorkspace = /^\/(app|provider|admin|account)(\/|$)/.test(
    location.pathname,
  );
  return (
    <>
      <a className="skip-link" href="#app-content">
        {t("Skip to content")}
      </a>
      <header className="hub-topbar">
        <Link to="/" className="hub-brand">
          API HUB <span className="brand-mark">/</span>
        </Link>
        {!inWorkspace && (
          <nav className="public-links" aria-label={t("Primary navigation")}>
            <NavLink to="/marketplace">{t("Marketplace")}</NavLink>
            <NavLink to="/pricing">{t("Pricing")}</NavLink>
          </nav>
        )}
        <div className="flex items-center gap-3">
          <label className="language-select">
            <span>{t("Language")}</span>
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
          {session ? (
            <>
              <Link
                className="avatar"
                aria-label={t("My account")}
                to="/account"
              >
                {session.name.slice(0, 2).toUpperCase()}
              </Link>
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
              <Link className="login-link" to="/login">
                {t("Sign in")}
              </Link>
              <Link className="hub-button primary" to="/register">
                {t("Create account")}
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
      {open && !inWorkspace && (
        <nav className="mobile-public-nav">
          <Link to="/marketplace" onClick={() => setOpen(false)}>
            {t("Marketplace")}
          </Link>
          <Link to="/pricing" onClick={() => setOpen(false)}>
            {t("Pricing")}
          </Link>
        </nav>
      )}
      {inWorkspace && session && (
        <aside className={`hub-sidebar ${open ? "open" : ""}`}>
          <div className="workspace-heading">{t("Workspace")}</div>
          <nav>
            <NavLink
              to={workspace[session.role]}
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={18} />
              {t("Overview")}
            </NavLink>
            <NavLink to="/account" onClick={() => setOpen(false)}>
              <UserRound size={18} />
              {t("My account")}
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <span>{session.name}</span>
            <small>{session.email}</small>
          </div>
        </aside>
      )}
      {notice && (
        <div className="toast" role="status">
          {t(notice)}
        </div>
      )}
      <main
        id="app-content"
        className={inWorkspace ? "workspace-main" : "public-main"}
      >
        {children}
      </main>
      {!inWorkspace && (
        <footer className="hub-footer">
          <div>
            <Link to="/" className="hub-brand">
              API HUB
            </Link>
            <p>{t("A secure workspace for API consumers and providers.")}</p>
          </div>
          <div>
            <strong>{t("Platform")}</strong>
            <Link to="/marketplace">{t("Marketplace")}</Link>
            <Link to="/pricing">{t("Pricing")}</Link>
          </div>
          <small>© 2026 API HUB</small>
        </footer>
      )}
    </>
  );
}
