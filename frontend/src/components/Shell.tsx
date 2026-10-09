import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  BadgeDollarSign,
  Boxes,
  ChartNoAxesCombined,
  CirclePlus,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  GitBranch,
  History,
  KeyRound,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  ScrollText,
  Send,
  ServerCog,
  ShieldCheck,
  Store,
  Upload,
  UserRound,
  Users,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { t, useLanguage } from "../i18n";
import { useStore } from "../features/store";
import { pagesFor, workspacePath } from "../lib/navigation";
import type { IconName } from "../lib/navigation";

const icons: Record<IconName, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  marketplace: Store,
  subscriptions: Library,
  keys: KeyRound,
  usage: ChartNoAxesCombined,
  history: History,
  guard: ShieldCheck,
  apis: Boxes,
  create: CirclePlus,
  endpoints: GitBranch,
  import: Upload,
  plans: BadgeDollarSign,
  review: Send,
  subscribers: UsersRound,
  analytics: Activity,
  revenue: WalletCards,
  verification: BadgeCheck,
  compliance: FileCheck2,
  users: Users,
  reports: ClipboardCheck,
  payments: CreditCard,
  monitoring: ServerCog,
  audit: ScrollText,
};
export default function Shell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage();
  const { session, logout, notice } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const inWorkspace = /^\/(app|provider|admin|account|checkout)(\/|$)/.test(
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
          <nav aria-label={t("Workspace navigation")}>
            {[...new Set(pagesFor(session.role).map((page) => page.group))].map(
              (group) => (
                <section className="sidebar-section" key={group}>
                  <div className="workspace-heading">{t(group)}</div>
                  {pagesFor(session.role)
                    .filter((page) => page.group === group)
                    .map((page) => {
                      const Icon = icons[page.icon];
                      return (
                        <NavLink
                          to={page.path}
                          onClick={() => setOpen(false)}
                          key={page.path}
                        >
                          <Icon size={18} aria-hidden="true" />
                          {t(page.title)}
                        </NavLink>
                      );
                    })}
                </section>
              ),
            )}
            <div className="workspace-heading">{t("Account")}</div>
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
