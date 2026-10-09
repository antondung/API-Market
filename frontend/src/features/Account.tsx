import { t, useLanguage } from "../i18n";
import { useState } from "react";
import { Button, Field, Panel, Confirm } from "../components/ui";
import { useStore } from "./store";
import { Link, useSearchParams } from "react-router-dom";
import { planLimits } from "../lib/contracts";
import { backendEnabled } from "../lib/api-client";
export function Profile() {
  useLanguage();
  const { session, login, toast, logout } = useStore();
  const [name, setName] = useState(session?.name || "");
  const [email, setEmail] = useState(session?.email || "");
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <h1 className="hub-page-heading">{t("My Profile & Account")}</h1>
      <p className="hub-subtitle">
        {t("Manage your identity and workspace preferences.")}
      </p>
      <Panel>
        <h2 className="text-xl mb-4">{t("Personal information")}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (session && !backendEnabled) {
              login({ ...session, name: name.trim(), email });
              toast("Profile saved.");
            }
          }}
        >
          <Field label={t("Display name")}>
            <input
              required
              readOnly={backendEnabled}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label={t("Email address")}>
            <input
              required
              type="email"
              readOnly={backendEnabled}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <p className="text-sm mb-6">
            {t("Workspace role: ")}
            <span className="hub-badge">{t(session?.role)}</span>
          </p>
          {backendEnabled && (
            <p className="mb-4">
              {t(
                "Profile changes require a backend endpoint that is not available yet.",
              )}
            </p>
          )}
          <Button type="submit" className="primary" disabled={backendEnabled}>
            {t("Save profile")}
          </Button>
          <Button
            type="button"
            className="ml-3"
            onClick={() => {
              setName(session?.name || "");
              setEmail(session?.email || "");
            }}
          >
            {t("Cancel")}
          </Button>
        </form>
      </Panel>
      <Panel>
        <h2 className="text-xl">{t("Session & Security")}</h2>
        <p className="hub-subtitle mt-3">
          {t(
            backendEnabled
              ? "Your session is managed by the backend. Password reset and account deletion are not available yet."
              : "Demo sessions renew locally. Passwords, refresh tokens and payment details are not stored. Real password reset and account deletion require backend endpoints.",
          )}
        </p>
        <Button onClick={() => setConfirm(true)}>
          {t("End current session")}
        </Button>
      </Panel>
      <Confirm
        title={t("Sign out?")}
        description={t(
          backendEnabled
            ? "End your current session."
            : "End your current demo session.",
        )}
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={logout}
      />
    </>
  );
}
export function CostGuard() {
  useLanguage();
  const { data, update, toast } = useStore();
  const [budget, setBudget] = useState(data.budget);
  const [thresholds, setThresholds] = useState(data.thresholds);
  const estimated = data.subscriptions
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => sum + planLimits(data, s.api, s.plan).price, 0);
  return (
    <>
      <h1 className="hub-page-heading">
        {t("API Cost Guard & Notifications")}
      </h1>
      <p className="hub-subtitle">
        {t("Set your spending budget and notification thresholds.")}
      </p>
      <Panel>
        <h2 className="text-xl mb-4">{t("Estimated sandbox spending")}</h2>
        <p className="text-3xl tabular-nums">
          ${estimated.toFixed(2)} / ${data.budget}
        </p>
        <progress
          className="w-full accent-primary my-4"
          aria-label={t("Budget utilization")}
          max={data.budget || 1}
          value={Math.min(estimated, data.budget)}
        />
        {data.subscriptions
          .filter((s) => s.status === "Active")
          .map((s) => (
            <p className="text-sm mt-2" key={s.id}>
              {s.api}: ${planLimits(data, s.api, s.plan).price.toFixed(2)}
            </p>
          ))}
        <p className="text-xs mt-4">
          {t(
            "Simulated monthly plan costs. No real billing or automatic blocking.",
          )}
        </p>
      </Panel>
      <div className="grid md:grid-cols-2 gap-6">
        <Panel>
          <h2 className="text-xl">{t("Monthly budget")}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update((d) => ({
                ...d,
                budget,
                thresholds: thresholds.sort((a, b) => a - b),
              }));
              toast("Cost guard preferences saved.");
            }}
          >
            <Field label={t("Monthly spending limit (USD)")}>
              <input
                type="number"
                min="1"
                required
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </Field>
            <p className="text-sm my-4">{t("Notify me at:")}</p>
            <div className="flex gap-5 mb-6">
              {[50, 80, 90, 100].map((v) => (
                <label key={v} className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={thresholds.includes(v)}
                    onChange={(e) =>
                      setThresholds(
                        e.target.checked
                          ? [...thresholds, v]
                          : thresholds.filter((t) => t !== v),
                      )
                    }
                  />
                  {t(v)}
                  {t("%")}
                </label>
              ))}
            </div>
            <Button className="primary" type="submit">
              {t("Save budget & alerts")}
            </Button>
          </form>
          <p className="text-xs text-on-surface-variant mt-5">
            {t(
              "The frontend saves preferences. Gateway blocking and actual spend calculations require backend enforcement.",
            )}
          </p>
        </Panel>
        <Panel>
          <div className="flex justify-between gap-3">
            <h2 className="text-xl">{t("Notification Center")}</h2>
            <Button
              onClick={() => {
                update((d) => ({ ...d, unread: 0 }));
                toast("Notifications marked read.");
              }}
            >
              {t("Mark all as read")}
            </Button>
          </div>
          <p className="my-8">
            {t(data.unread)}
            {t(" unread demo notifications")}
          </p>
          <Link className="hub-button mb-5" to="/notifications">
            {t("Open notification center")}
          </Link>
          <div className="bg-surface-container-low p-4 rounded text-sm">
            {t(
              "Usage reminder \u00B7 review your subscriptions and active keys.",
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
export function Reports({ admin = false }: { admin?: boolean }) {
  useLanguage();
  const { data, update, toast, session } = useStore();
  const [params] = useSearchParams();
  const [api, setApi] = useState(
    data.apis.find((a) => a.id === params.get("api"))?.name ||
      data.apis[0]?.name ||
      "",
  );
  const [evidence, setEvidence] = useState("");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<{
    id: string;
    api?: string;
    status: string;
  } | null>(null);
  const [reason, setReason] = useState("Availability");
  const [description, setDescription] = useState("");
  return (
    <>
      <h1 className="hub-page-heading">
        {t(admin ? "Reports & Moderation" : "My Reports")}
      </h1>
      <p className="hub-subtitle">
        {t("Track reported issues and their resolution.")}
      </p>
      {!admin && (
        <Panel>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update((d) => ({
                ...d,
                reports: [
                  {
                    id: crypto.randomUUID(),
                    reason,
                    description,
                    status: "Open",
                    api,
                    evidence,
                    at: new Date().toISOString(),
                  },
                  ...d.reports,
                ],
              }));
              setDescription("");
              toast("Report submitted to the local demo queue.");
            }}
          >
            <Field label={t("Reported API")}>
              <select value={api} onChange={(e) => setApi(e.target.value)}>
                {data.apis.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("Evidence URL (optional)")}>
              <input
                type="url"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </Field>
            <Field label={t("Issue category")}>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {[
                  "Availability",
                  "Billing",
                  "Security",
                  "Content",
                  "Ownership Violation",
                  "Privacy Concern",
                  "Illegal Data",
                  "Dangerous Behavior",
                  "Other",
                ].map((v) => (
                  <option key={v} value={v}>
                    {t(v)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("Describe the issue")}>
              <textarea
                required
                minLength={10}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Button type="submit" className="primary">
              {t("Submit report")}
            </Button>
          </form>
        </Panel>
      )}
      <Field label={t("Search reports")}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </Field>
      {data.reports
        .filter((r) =>
          (r.description + " " + r.api + " " + t(r.reason) + " " + t(r.status))
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .map((r) => (
          <Panel key={r.id}>
            <div className="flex justify-between">
              <h2>{t(r.reason)}</h2>
              <span className="hub-badge">{t(r.status)}</span>
            </div>
            <p className="my-4 text-sm">{r.description}</p>
            <p className="my-3 text-sm">
              {r.api} · {r.at ? new Date(r.at).toLocaleString() : ""}
            </p>
            {r.evidence && (
              <p className="break-all text-sm">
                {t("Evidence")}: {r.evidence}
              </p>
            )}
            {r.note && (
              <p className="text-sm mt-3">
                {t("Reviewer notes")}: {r.note}
              </p>
            )}
            {admin && (
              <div className="flex gap-3">
                {["Investigating", "Resolved", "Dismissed"].map((v) => (
                  <Button
                    key={v}
                    onClick={() => {
                      update((d) => ({
                        ...d,
                        reports: d.reports.map((t) =>
                          t.id === r.id ? { ...t, status: v } : t,
                        ),
                      }));
                      toast(`Report ${v.toLowerCase()}.`);
                    }}
                  >
                    {t(v)}
                  </Button>
                ))}
                {r.api && (
                  <>
                    <Button
                      onClick={() => {
                        setNote("");
                        setDecision({
                          id: r.id,
                          api: r.api,
                          status: "Suspended",
                        });
                      }}
                    >
                      {t("Suspend API")}
                    </Button>
                    <Button
                      onClick={() => {
                        setNote("");
                        setDecision({
                          id: r.id,
                          api: r.api,
                          status: "Published",
                        });
                      }}
                    >
                      {t("Restore API")}
                    </Button>
                  </>
                )}
              </div>
            )}
          </Panel>
        ))}
      {!data.reports.length && <Panel>{t("No reported issues yet.")}</Panel>}
      <Confirm
        title={t("Moderation decision")}
        description={t(
          "The API status changes in the marketplace. A reason and audit entry are required.",
        )}
        open={!!decision}
        disabled={!note.trim()}
        onClose={() => setDecision(null)}
        onConfirm={() => {
          if (!decision || !note.trim()) return;
          update((d) => ({
            ...d,
            apis: d.apis.map((a) =>
              a.name === decision.api ? { ...a, status: decision.status } : a,
            ),
            reports: d.reports.map((r) =>
              r.id === decision.id ? { ...r, status: "Resolved", note } : r,
            ),
            audit: [
              {
                id: crypto.randomUUID(),
                entity: decision.api || decision.id,
                action: decision.status,
                reason: note,
                actor: session?.name || "Admin",
                at: new Date().toISOString(),
              },
              ...d.audit,
            ],
          }));
          setDecision(null);
          toast("Moderation decision recorded.");
        }}
      >
        <Field label={t("Decision reason")}>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </Confirm>
    </>
  );
}
