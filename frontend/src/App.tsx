import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Shell from "./components/Shell";
import Auth from "./features/Auth";
import Profile from "./features/Account";
import { useStore } from "./features/store";
import { t, useLanguage } from "./i18n";
import type { Role } from "./lib/types";

const workspace: Record<
  Role,
  { path: string; title: string; description: string }
> = {
  consumer: {
    path: "/app/overview",
    title: "Consumer workspace",
    description:
      "Your account is ready. Marketplace and API access will appear here when the backend services are available.",
  },
  provider: {
    path: "/provider/overview",
    title: "Provider workspace",
    description:
      "Your provider account is ready. API publishing will appear here when the backend service is available.",
  },
  admin: {
    path: "/admin/overview",
    title: "Admin workspace",
    description:
      "Your administrator account is ready. Management tools will appear here when their backend services are available.",
  },
};

export function Protected({
  role,
  children,
}: {
  role?: Role;
  children: ReactNode;
}) {
  useLanguage();
  const { session, ready } = useStore();
  const location = useLocation();
  if (!ready)
    return (
      <p className="hub-panel" role="status">
        {t("Loading workspace…")}
      </p>
    );
  if (!session)
    return (
      <Navigate
        replace
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
      />
    );
  if (role && session.role !== role) return <Navigate replace to="/403" />;
  return children;
}

function Home() {
  const { session } = useStore();
  return (
    <section className="release-hero">
      <div>
        <span className="hub-badge">{t("API MARKETPLACE & MANAGEMENT")}</span>
        <h1>{t("Build and manage API integrations in one workspace.")}</h1>
        <p>
          {t(
            "Secure account access is now available for consumers, API providers and administrators.",
          )}
        </p>
        <div className="flex flex-wrap gap-3 mt-7">
          <Link
            className="hub-button primary"
            to={session ? workspace[session.role].path : "/register"}
          >
            {t(session ? "Open workspace" : "Create account")}
          </Link>
          {!session && (
            <Link className="hub-button" to="/login">
              {t("Sign in")}
            </Link>
          )}
        </div>
      </div>
      <div className="release-card">
        <h2>{t("Current release")}</h2>
        <ul>
          <li>{t("Consumer and Provider registration")}</li>
          <li>{t("Secure sign-in and session renewal")}</li>
          <li>{t("Role-protected workspaces")}</li>
          <li>{t("Vietnamese and English interface")}</li>
        </ul>
      </div>
    </section>
  );
}

function Workspace({ role }: { role: Role }) {
  const { session } = useStore();
  const content = workspace[role];
  return (
    <>
      <h1 className="hub-page-heading">{t(content.title)}</h1>
      <p className="hub-subtitle">{t(content.description)}</p>
      <div className="release-grid">
        <section className="hub-panel">
          <h2>{t("Account status")}</h2>
          <p className="status-ready">{t("Connected to backend")}</p>
          <dl className="identity-list">
            <div>
              <dt>{t("Name")}</dt>
              <dd>{session?.name}</dd>
            </div>
            <div>
              <dt>{t("Email")}</dt>
              <dd>{session?.email}</dd>
            </div>
            <div>
              <dt>{t("Role")}</dt>
              <dd>{t(session?.role)}</dd>
            </div>
          </dl>
        </section>
        <section className="hub-panel">
          <h2>{t("Available now")}</h2>
          <p>
            {t(
              "Authentication, session renewal, role checks and account information are connected to the backend.",
            )}
          </p>
          <Link className="hub-button" to="/account">
            {t("View account")}
          </Link>
        </section>
      </div>
    </>
  );
}

function Unavailable({ title }: { title: string }) {
  return (
    <div className="release-state">
      <span className="release-state-mark" aria-hidden="true">
        /
      </span>
      <h1>{t(title)}</h1>
      <p>
        {t("This service is not available in the current backend release.")}
      </p>
      <Link className="hub-button primary" to="/">
        {t("Back to home")}
      </Link>
    </div>
  );
}

const titles: Record<string, string> = {
  "/": "Home",
  "/login": "Login",
  "/register": "Register",
  "/account": "Account",
  "/marketplace": "Marketplace",
  "/pricing": "Pricing",
  "/403": "Access denied",
  "/app/overview": "Consumer workspace",
  "/provider/overview": "Provider workspace",
  "/admin/overview": "Admin workspace",
};
function PageTitle() {
  const { language } = useLanguage();
  const location = useLocation();
  useEffect(() => {
    document.title = `${t(titles[location.pathname] || "Page not found")} · API Hub`;
    window.scrollTo(0, 0);
  }, [location.pathname, language]);
  return null;
}

export default function App() {
  return (
    <Shell>
      <PageTitle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth register />} />
        <Route
          path="/marketplace"
          element={<Unavailable title="Marketplace" />}
        />
        <Route path="/pricing" element={<Unavailable title="Pricing" />} />
        <Route
          path="/account"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        {(Object.keys(workspace) as Role[]).map((role) => (
          <Route
            key={role}
            path={workspace[role].path}
            element={
              <Protected role={role}>
                <Workspace role={role} />
              </Protected>
            }
          />
        ))}
        <Route path="/403" element={<Unavailable title="Access denied" />} />
        <Route path="*" element={<Unavailable title="Page not found" />} />
      </Routes>
    </Shell>
  );
}
