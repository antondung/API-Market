import { t, useLanguage } from "./i18n";
import { lazy, Suspense, useEffect } from "react";
import type { ComponentType, ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import manifest from "./screens/manifest.json";
import Shell from "./components/Shell";
import { useStore } from "./features/store";
import type { Role } from "./lib/types";
import Auth from "./features/Auth";
import Documentation from "./features/Documentation";
import Marketplace from "./features/Marketplace";
import Keys from "./features/Keys";
import Playground from "./features/Playground";
import Pricing from "./features/Pricing";
import { Checkout, Subscriptions } from "./features/Commerce";
import { Profile, CostGuard, Reports } from "./features/Account";
import {
  ApiWizard,
  OpenApiImport,
  Verification,
  ProviderInventory,
  ProviderApproval,
} from "./features/Provider";
import { Management, Compliance } from "./features/Management";
import { Operations, Detail, Compare } from "./features/Operations";
import {
  Analytics,
  RequestHistory,
  SubscriberControls,
  Transactions,
  Notifications,
} from "./features/Insights";
const modules = import.meta.glob<{
  default: ComponentType;
}>("./screens/Screen*.tsx");
const screens = Object.fromEntries(
  manifest.map((m) => [m.path, lazy(modules[`./screens/${m.file}.tsx`])]),
);
const overrides: Record<string, ReactNode> = {
  "/pricing": <Pricing />,
  "/apis/neural-llm/docs": <Documentation />,
  "/provider/endpoints": <Management kind="endpoints" />,
  "/provider/plans": <Management kind="plans" />,
  "/admin/users": <Management kind="users" />,
  "/provider/compliance": <Compliance />,
  "/marketplace": <Marketplace />,
  "/app/keys": <Keys />,
  "/apis/neural-llm": <Detail />,
  "/compare": <Compare />,
  "/apis/neural-llm/playground": <Playground />,
  "/checkout": <Checkout />,
  "/app/subscriptions": <Subscriptions />,
  "/app/cost-guard": <CostGuard />,
  "/app/profile": <Profile />,
  "/app/settings": <Profile />,
  "/provider/apis/new": <ApiWizard />,
  "/provider/import": <OpenApiImport />,
  "/provider/verification": <Verification />,
  "/provider/apis": <ProviderInventory />,
  "/provider/review": <ProviderInventory review />,
  "/admin/reviews": <ProviderInventory admin />,
  "/admin/providers": <ProviderApproval />,
  "/admin/reports": <Reports admin />,
  "/admin/audit": <Operations kind="audit" />,
  "/app/requests": <RequestHistory />,
  "/app/overview": <Analytics overview />,
  "/app/usage": <Analytics />,
  "/app/analytics": <Analytics />,
  "/provider/overview": <Analytics kind="provider" overview />,
  "/provider/workspace": <Analytics kind="provider" overview />,
  "/provider/analytics": <Analytics kind="provider" />,
  "/provider/subscribers": <SubscriberControls />,
  "/admin/overview": <Analytics kind="admin" overview />,
  "/admin/console": <Analytics kind="admin" overview />,
  "/admin/monitoring": <Analytics kind="admin" />,
  "/admin/payments": <Transactions />,
};
export function Protected({
  role,
  children,
}: {
  role: string;
  children: ReactNode;
}) {
  useLanguage();

  const { session, ready } = useStore();
  const location = useLocation();
  if (role === "public" || role === "design") return children;
  if (!ready) return <p role="status">{t("Loading workspace…")}</p>;
  if (!session)
    return (
      <Navigate
        replace
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
      />
    );
  if (session.role !== role) return <Navigate replace to="/403" />;
  return children;
}
const routeTitles: Record<string, string> = {
  "/login": "Login",
  "/register": "Register",
  "/account": "Account",
  "/notifications": "Notifications",
  "/app/reports": "My Reports",
  "/provider/revenue": "Revenue & Payouts",
  "/admin/apis": "API Management",
  "/admin/subscriptions": "Subscription Management",
  "/admin/requests": "Request History",
  "/provider/requests": "Request History",
};
function PageTitle() {
  const { language } = useLanguage();

  const location = useLocation();
  useEffect(() => {
    document.title = `${t(routeTitles[location.pathname] || manifest.find((m) => m.path === location.pathname)?.title || "Workspace")} · API Hub`;
    window.scrollTo(0, 0);
  }, [location.pathname, language]);
  return null;
}
export default function App() {
  useLanguage();

  const { session } = useStore();
  return (
    <Shell>
      <PageTitle />
      <Suspense
        fallback={
          <div className="hub-panel m-6" role="status">
            {t("Loading workspace…")}
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth register />} />
          <Route
            path="/account"
            element={
              <Protected role={session?.role || "consumer"}>
                <Profile />
              </Protected>
            }
          />
          <Route
            path="/notifications"
            element={
              <Protected role={session?.role || "consumer"}>
                <Notifications />
              </Protected>
            }
          />
          {manifest.map((m) => {
            const Screen = screens[m.path];
            return (
              <Route
                key={m.path}
                path={m.path}
                element={
                  <Protected role={m.role}>
                    {overrides[m.path] || <Screen />}
                  </Protected>
                }
              />
            );
          })}
          <Route
            path="/app/reports"
            element={
              <Protected role="consumer">
                <Reports />
              </Protected>
            }
          />
          {(["admin", "provider"] as const).map((role) => (
            <Route
              key={role}
              path={`/${role}/requests`}
              element={
                <Protected role={role}>
                  <RequestHistory />
                </Protected>
              }
            />
          ))}
          {(
            [
              ["/provider/revenue", "provider", "revenue"],
              ["/admin/apis", "admin", "apis"],
              ["/admin/subscriptions", "admin", "subscriptions"],
            ] as [string, Role, string][]
          ).map(([path, role, kind]) => (
            <Route
              key={path}
              path={path}
              element={
                <Protected role={role}>
                  {kind === "revenue" ? (
                    <Transactions />
                  ) : kind === "subscriptions" ? (
                    <SubscriberControls />
                  ) : (
                    <Operations kind={kind} />
                  )}
                </Protected>
              }
            />
          ))}
          <Route
            path="*"
            element={
              <div className="max-w-4xl mx-auto p-12">
                <h1 className="hub-page-heading">
                  {t("404 · Page not found")}
                </h1>
                <p className="hub-subtitle">
                  {t("This URL does not match an API Hub screen.")}
                </p>
                <Link className="hub-button primary" to="/marketplace">
                  {t("Explore APIs")}
                </Link>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Shell>
  );
}
