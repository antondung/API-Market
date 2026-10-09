import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Shell from "./components/Shell";
import Auth from "./features/Auth";
import Profile from "./features/Account";
import { useStore } from "./features/store";
import { t, useLanguage } from "./i18n";
import { pagesFor, productPages, workspacePath } from "./lib/navigation";
import type { Role } from "./lib/types";

const workspace: Record<Role, { title: string; description: string }> = {
  consumer: {
    title: "Consumer workspace",
    description: "Discover APIs and manage your subscriptions, keys and usage.",
  },
  provider: {
    title: "Provider workspace",
    description:
      "Publish APIs and manage plans, subscribers and service health.",
  },
  admin: {
    title: "Admin workspace",
    description:
      "Review and operate users, providers, APIs and platform activity.",
  },
};

export function Protected({
  roles,
  children,
}: {
  roles?: Role[];
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
  if (roles && !roles.includes(session.role))
    return <Navigate replace to="/403" />;
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
            to={session ? workspacePath[session.role] : "/register"}
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
      <div className="release-grid workspace-summary">
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
      <section
        className="workspace-section"
        aria-labelledby="workspace-features"
      >
        <div className="section-heading">
          <div>
            <h2 id="workspace-features">{t("Workspace features")}</h2>
            <p>{t("Open a feature to view its current empty state.")}</p>
          </div>
          <Link className="hub-button" to="/marketplace">
            {t("Explore APIs")}
          </Link>
        </div>
        <div className="feature-grid">
          {pagesFor(role)
            .filter((page) => page.path !== workspacePath[role])
            .map((page) => (
              <Link className="feature-card" to={page.path} key={page.path}>
                <span className="feature-card-mark" aria-hidden="true">
                  /
                </span>
                <strong>{t(page.title)}</strong>
                <small>{t("Waiting for backend integration")}</small>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}

function EmptyFeature({ title, backTo }: { title: string; backTo?: string }) {
  const { session } = useStore();
  const destination = backTo || (session ? workspacePath[session.role] : "/");
  return (
    <section className="feature-page">
      <header>
        <span className="hub-badge">{t("FEATURE WORKSPACE")}</span>
        <h1 className="hub-page-heading">{t(title)}</h1>
        <p className="hub-subtitle">
          {t(
            "This feature is ready for real data when its backend endpoint is connected.",
          )}
        </p>
      </header>
      <div className="empty-state" role="status">
        <span className="empty-state-mark" aria-hidden="true">
          /
        </span>
        <h2>{t("No data yet")}</h2>
        <p>
          {t(
            "There are no records to display. Sample data has been removed from this release.",
          )}
        </p>
        <Link className="hub-button primary" to={destination}>
          {t(session ? "Back to overview" : "Back to home")}
        </Link>
      </div>
    </section>
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
  "/compare": "Compare APIs",
  "/checkout": "Checkout",
  "/403": "Access denied",
  "/app/overview": "Consumer workspace",
  "/provider/overview": "Provider workspace",
  "/admin/overview": "Admin workspace",
};
for (const page of productPages) titles[page.path] = page.title;
function PageTitle() {
  const { language } = useLanguage();
  const location = useLocation();
  useEffect(() => {
    const title =
      titles[location.pathname] ||
      (location.pathname.endsWith("/docs")
        ? "API documentation"
        : location.pathname.endsWith("/playground")
          ? "API playground"
          : /^\/apis\/[^/]+$/.test(location.pathname)
            ? "API details"
            : "Page not found");
    document.title = `${t(title)} · API Hub`;
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
          element={<EmptyFeature title="Marketplace" />}
        />
        <Route path="/pricing" element={<EmptyFeature title="Pricing" />} />
        <Route
          path="/compare"
          element={<EmptyFeature title="Compare APIs" />}
        />
        <Route
          path="/apis/:apiId"
          element={<EmptyFeature title="API details" />}
        />
        <Route
          path="/apis/:apiId/docs"
          element={<EmptyFeature title="API documentation" />}
        />
        <Route
          path="/apis/:apiId/playground"
          element={<EmptyFeature title="API playground" />}
        />
        <Route
          path="/checkout"
          element={
            <Protected roles={["consumer", "provider"]}>
              <EmptyFeature title="Checkout" />
            </Protected>
          }
        />
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
            path={workspacePath[role]}
            element={
              <Protected roles={[role]}>
                <Workspace role={role} />
              </Protected>
            }
          />
        ))}
        {productPages
          .filter((page) => page.path !== workspacePath[page.roles[0]])
          .map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={
                <Protected roles={page.roles}>
                  <EmptyFeature title={page.title} />
                </Protected>
              }
            />
          ))}
        <Route
          path="/app/profile"
          element={<Navigate replace to="/account" />}
        />
        <Route
          path="/app/settings"
          element={<Navigate replace to="/account" />}
        />
        <Route
          path="/provider/workspace"
          element={<Navigate replace to="/provider/overview" />}
        />
        <Route
          path="/admin/console"
          element={<Navigate replace to="/admin/overview" />}
        />
        <Route path="/403" element={<Unavailable title="Access denied" />} />
        <Route path="*" element={<Unavailable title="Page not found" />} />
      </Routes>
    </Shell>
  );
}
