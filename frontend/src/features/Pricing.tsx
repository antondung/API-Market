import { t, useLanguage, locale } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Panel } from "../components/ui";
import { useStore } from "./store";
export default function Pricing() {
  useLanguage();
  const { data } = useStore();
  const [annual, setAnnual] = useState(false);
  const current = data.subscriptions.find(
    (s) => s.api === data.apis[0].name && s.status === "Active",
  )?.plan;
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="hub-badge">
          {t("Flexible plans for every developer")}
        </span>
        <h1 className="hub-page-heading mt-5">
          {t("Simple pricing. Powerful APIs.")}
        </h1>
        <p className="hub-subtitle">
          {t("Choose a sandbox plan and scale your integrations.")}
        </p>
        <div
          className="inline-flex gap-2 p-2 bg-surface-container-low rounded"
          aria-label={t("Billing period")}
        >
          <button
            className={`hub-button ${!annual ? "primary" : ""}`}
            aria-pressed={!annual}
            onClick={() => setAnnual(false)}
          >
            {t("Monthly Billing")}
          </button>
          <button
            className={`hub-button ${annual ? "primary" : ""}`}
            aria-pressed={annual}
            onClick={() => setAnnual(true)}
          >
            {t("Annual \u00B7 Save 20%")}
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {["Free", "Developer", "Pro"].map((plan, i) => (
          <Panel key={plan}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl">{t(plan)}</h2>
              {current === plan ? (
                <span className="hub-badge">{t("Current plan")}</span>
              ) : i === 1 ? (
                <span className="hub-badge">{t("Most popular")}</span>
              ) : null}
            </div>
            <p className="text-sm text-on-surface-variant min-h-12">
              {t(
                [
                  "Explore and prototype your next integration.",
                  "Build reliable applications with room to grow.",
                  "Higher quotas for demanding workloads.",
                ][i],
              )}
            </p>
            <div className="text-4xl font-semibold my-6">
              {t("$")}
              {t(
                ([0, 29, 99][i] * (annual ? 0.8 : 1)).toFixed(
                  i && annual ? 2 : 0,
                ),
              )}
              <span className="text-sm font-normal text-on-surface-variant">
                {t(" / month")}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-6">
              {t(
                annual
                  ? "Billed annually in sandbox"
                  : "Billed monthly in sandbox",
              )}
            </p>
            <ul className="space-y-4 text-sm my-7">
              {[
                `${[1000, 10000, 100000][i].toLocaleString(locale())} demo requests / month`,
                `${[30, 60, 300][i]} requests / minute`,
                "API key management",
                "Interactive playground",
                "Usage analytics",
              ].map((v) => (
                <li key={v} className="flex gap-3">
                  <span className="text-primary">{t("\u2713")}</span>
                  {t(v)}
                </li>
              ))}
            </ul>
            <Link
              className={`hub-button w-full ${i === 1 ? "primary" : ""}`}
              to={
                current === plan
                  ? "/app/subscriptions"
                  : `/checkout?plan=${plan}&billing=${annual ? "Annual" : "Monthly"}`
              }
            >
              {t(
                current === plan
                  ? "Manage Subscription"
                  : i === 0
                    ? "Get Started Free"
                    : `Choose ${plan}`,
              )}
            </Link>
          </Panel>
        ))}
      </div>
      <div className="hub-panel mt-6">
        <h2 className="text-xl mb-4">{t("Sandbox billing")}</h2>
        <p className="text-sm text-on-surface-variant">
          {t(
            "Prices and quotas on this page are demo plan data. Checkout can simulate successful, failed and pending payments without collecting card information. Actual API offers and billing terms will come from the backend.",
          )}
        </p>
      </div>
    </div>
  );
}
