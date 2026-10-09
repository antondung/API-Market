import { useState } from "react";
import { Link } from "react-router-dom";
import { t, useLanguage, locale } from "../i18n";
import { Button, Field, Panel, Modal, Confirm } from "../components/ui";
import { useStore } from "./store";
import { planLimits } from "../lib/contracts";
import type { RequestRecord, Subscription } from "../lib/types";

export function RequestHistory() {
  useLanguage();
  const { data, session } = useStore();
  const [search, setSearch] = useState("");
  const [api, setApi] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RequestRecord | null>(null);
  const rows = data.requests
    .filter(
      (r) =>
        (!session ||
          session.role !== "consumer" ||
          r.actor === session.email) &&
        (!api || r.api === api) &&
        (!method || r.method === method) &&
        (!date || r.at.slice(0, 10) >= date) &&
        (!status ||
          (status === "success" ? r.status < 400 : r.status >= 400)) &&
        `${r.api} ${r.path} ${r.id} ${r.status}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <h1 className="hub-page-heading">{t("Request History")}</h1>
      <p className="hub-subtitle">
        {t(
          "Local sandbox requests. Credentials and payloads are never recorded.",
        )}
      </p>
      <Panel>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Field label={t("Search records")}>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label={t("API")}>
            <select
              value={api}
              onChange={(e) => {
                setApi(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("All APIs")}</option>
              {data.apis.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Method")}>
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("All")}</option>
              {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map(
                (m) => (
                  <option key={m}>{m}</option>
                ),
              )}
            </select>
          </Field>
          <Field label={t("Result")}>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("All")}</option>
              <option value="success">{t("Success")}</option>
              <option value="error">{t("Error")}</option>
            </select>
          </Field>
          <Field label={t("From date")}>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {[
                  "Timestamp",
                  "API",
                  "Method / path",
                  "Status",
                  "Duration",
                  "Actions",
                ].map((v) => (
                  <th className="p-3 text-left" key={v}>
                    {t(v)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice((page - 1) * 10, page * 10).map((r) => (
                <tr className="border-t border-outline-variant/20" key={r.id}>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(r.at).toLocaleString(locale())}
                  </td>
                  <td>{r.api}</td>
                  <td>
                    <code>
                      {r.method} {r.path}
                    </code>
                  </td>
                  <td>{r.status}</td>
                  <td className="tabular-nums">{r.duration} ms</td>
                  <td>
                    <Button onClick={() => setSelected(r)}>
                      {t("View details")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="py-10 text-center">
            <p>{t("No matching requests.")}</p>
            <Link className="hub-button mt-4" to="/apis/neural-llm/playground">
              {t("Open Playground")}
            </Link>
          </div>
        )}
        <div className="flex gap-3 justify-end mt-5">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            {t("Previous")}
          </Button>
          <span className="self-center">{page}</span>
          <Button
            disabled={page * 10 >= rows.length}
            onClick={() => setPage(page + 1)}
          >
            {t("Next")}
          </Button>
        </div>
      </Panel>
      <Modal
        title={t("Request details")}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <dl className="space-y-4 mt-6 text-sm">
            <div>
              {t("Request identifier")}:{" "}
              <code className="break-all">{selected.id}</code>
            </div>
            <div>
              {selected.method} {selected.path}
            </div>
            <div>
              {t("Status")}: {selected.status} · {selected.duration} ms
            </div>
            <div>
              {t("Access context")}: {t(selected.context)}
            </div>
            <div>
              {t(
                "Authorization, cookies, keys and request bodies are omitted.",
              )}
            </div>
            <Link
              className="hub-button"
              to={
                session?.role === "provider"
                  ? "/provider/analytics"
                  : session?.role === "admin"
                    ? "/admin/monitoring"
                    : "/app/usage"
              }
            >
              {t("Usage & Quota")}
            </Link>
          </dl>
        )}
      </Modal>
    </>
  );
}

export function Analytics({
  kind = "consumer",
  overview = false,
}: {
  kind?: string;
  overview?: boolean;
}) {
  useLanguage();
  const { data, session } = useStore();
  const [api, setApi] = useState("");
  const [days, setDays] = useState(30);
  const cutoff = Date.now() - days * 86400000;
  const rows = data.requests.filter(
    (r) =>
      (!api || r.api === api) &&
      new Date(r.at).getTime() >= cutoff &&
      (kind !== "consumer" || r.actor === session?.email),
  );
  const success = rows.filter((r) => r.status < 400).length;
  const sorted = rows.map((r) => r.duration).sort((a, b) => a - b);
  const metrics: [string, string][] = [
    ["Total requests", String(rows.length)],
    [
      "Success rate",
      rows.length
        ? `${((success / rows.length) * 100).toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
        : t("Data not available"),
    ],
    [
      "Average latency",
      rows.length
        ? `${Math.round(sorted.reduce((a, b) => a + b, 0) / rows.length)} ms`
        : t("Data not available"),
    ],
    [
      "P95 latency",
      sorted.length
        ? `${sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)]} ms`
        : t("Data not available"),
    ],
  ];
  const title = overview
    ? kind === "admin"
      ? "Admin Dashboard"
      : kind === "provider"
        ? "Provider Dashboard"
        : "Consumer Dashboard"
    : kind === "admin"
      ? "Gateway & System Monitoring"
      : kind === "provider"
        ? "Provider Analytics & Health"
        : "Usage & Quota";
  return (
    <>
      <h1 className="hub-page-heading">{t(title)}</h1>
      <p className="hub-subtitle">
        {t(
          "Computed from local sandbox activity. Live monitoring is not connected.",
        )}
      </p>
      <Panel>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("API")}>
            <select value={api} onChange={(e) => setApi(e.target.value)}>
              <option value="">{t("All APIs")}</option>
              {data.apis.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Date range")}>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {[7, 30, 90].map((d) => (
                <option key={d} value={d}>
                  {d} {t("days")}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Panel>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {metrics.map(([label, value]) => (
          <Panel key={label}>
            <p className="text-sm text-on-surface-variant">{t(label)}</p>
            <p className="text-2xl tabular-nums mt-4">{value}</p>
          </Panel>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel>
          <h2 className="text-xl mb-5">{t("Request volume by API")}</h2>
          {data.apis
            .filter((a) => !api || a.name === api)
            .map((a) => {
              const count = rows.filter((r) => r.api === a.name).length;
              return (
                <div key={a.id} className="mb-5">
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{a.name}</span>
                    <span>
                      {count} {t("requests")}
                    </span>
                  </div>
                  <progress
                    aria-label={a.name}
                    className="w-full accent-primary mt-2"
                    value={count}
                    max={Math.max(rows.length, 1)}
                  />
                </div>
              );
            })}
          <Link
            className="hub-button"
            to={
              kind === "consumer"
                ? "/app/requests"
                : kind === "provider"
                  ? "/provider/requests"
                  : "/admin/requests"
            }
          >
            {t("Request History")}
          </Link>
        </Panel>
        <Panel>
          <h2 className="text-xl mb-5">{t("Error distribution")}</h2>
          {[401, 403, 429, 500, 504].map((code) => (
            <div
              className="flex justify-between border-b border-outline-variant/20 py-3 text-sm"
              key={code}
            >
              <span>HTTP {code}</span>
              <span>{rows.filter((r) => r.status === code).length}</span>
            </div>
          ))}
          <p className="text-sm mt-5">
            {t("Live uptime, worker status and incidents: data not available.")}
          </p>
        </Panel>
      </div>
      {kind === "consumer" && (
        <Panel>
          <h2 className="text-xl mb-5">
            {t("Subscription quota and rate limits")}
          </h2>
          {data.subscriptions
            .filter((s) => s.status === "Active")
            .map((s) => {
              const limit = planLimits(data, s.api, s.plan);
              const used = data.requests.filter(
                (r) =>
                  r.api === s.api &&
                  r.context === "Subscription" &&
                  r.actor === session?.email &&
                  r.at.slice(0, 7) === new Date().toISOString().slice(0, 7),
              ).length;
              return (
                <div key={s.id} className="mb-6">
                  <div className="flex justify-between gap-3">
                    <strong>{s.api}</strong>
                    <span>{t(s.plan)}</span>
                  </div>
                  <progress
                    aria-label={s.api}
                    className="w-full accent-primary my-3"
                    value={Math.min(used, limit.quota)}
                    max={Math.max(limit.quota, 1)}
                  />
                  <p className="text-sm tabular-nums">
                    {used} / {limit.quota.toLocaleString(locale())}{" "}
                    {t("requests per month")} ·{" "}
                    {Math.max(0, limit.quota - used)} {t("remaining")}
                  </p>
                  <p className="text-sm mt-2">
                    {t("Rate limit")}: {limit.rate} {t("requests / minute")} ·{" "}
                    {t("Reset date")}:{" "}
                    {new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      1,
                    ).toLocaleDateString(locale())}
                  </p>
                </div>
              );
            })}
          {!data.subscriptions.some((s) => s.status === "Active") && (
            <Link className="hub-button" to="/marketplace">
              {t("Explore APIs")}
            </Link>
          )}
        </Panel>
      )}
      {overview && kind === "consumer" && (
        <Link className="hub-button primary mb-6" to="/app/keys?create=1">
          {t("Create New Key")}
        </Link>
      )}
      {overview && (
        <Panel>
          <h2 className="text-xl mb-4">{t("Workspace summary")}</h2>
          <div className="flex flex-wrap gap-3">
            {(kind === "admin"
              ? [
                  ["/admin/providers", "Provider verification"],
                  ["/admin/reviews", "API Reviews"],
                  ["/admin/reports", "Reports & Moderation"],
                ]
              : kind === "provider"
                ? [
                    ["/provider/apis", "My APIs"],
                    ["/provider/verification", "Verification"],
                    ["/provider/subscribers", "Subscribers"],
                  ]
                : [
                    ["/app/subscriptions", "My Subscriptions"],
                    ["/app/keys", "API Keys"],
                    ["/marketplace", "Explore APIs"],
                  ]
            ).map(([href, label]) => (
              <Link key={href} className="hub-button" to={href}>
                {t(label)}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm">
            {t("Published APIs")}:{" "}
            {data.apis.filter((a) => a.status === "Published").length} ·{" "}
            {t("Active Subscriptions")}:{" "}
            {data.subscriptions.filter((s) => s.status === "Active").length}
          </p>
        </Panel>
      )}
    </>
  );
}

export function SubscriberControls() {
  useLanguage();
  const { data, update, session, toast } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const rows = data.subscriptions.filter(
    (s) =>
      (!status || s.status === status) &&
      `${s.api} ${s.plan} ${s.consumer || "Demo Consumer"}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <h1 className="hub-page-heading">{t("Subscriber Management")}</h1>
      <p className="hub-subtitle">
        {t(
          "Review local subscriptions and suspend or restore sandbox access with a recorded reason.",
        )}
      </p>
      <Panel>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t("Search records")}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          <Field label={t("Status filter")}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">{t("All")}</option>
              {["Active", "Pending", "Expired", "Suspended", "Cancelled"].map(
                (s) => (
                  <option key={s} value={s}>
                    {t(s)}
                  </option>
                ),
              )}
            </select>
          </Field>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Consumer", "API", "Plan", "Status", "Actions"].map((v) => (
                  <th className="p-3 text-left" key={v}>
                    {t(v)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr className="border-t" key={s.id}>
                  <td className="p-3">{s.consumer || t("Demo Consumer")}</td>
                  <td>{s.api}</td>
                  <td>{t(s.plan)}</td>
                  <td>{t(s.status)}</td>
                  <td>
                    <Button
                      onClick={() => {
                        setSelected(s);
                        setReason("");
                      }}
                    >
                      {t("View details")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <p className="py-8">{t("No matching records.")}</p>}
      </Panel>
      <Modal
        title={t("Subscription details")}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <p className="my-5">
              {selected.api} · {t(selected.plan)} · {t(selected.status)}
            </p>
            <p className="text-sm">
              {t("Monthly quota")}:{" "}
              {planLimits(data, selected.api, selected.plan).quota} ·{" "}
              {t("Rate limit / minute")}:{" "}
              {planLimits(data, selected.api, selected.plan).rate}
            </p>
            <p className="my-4 text-sm">
              {t("Created")}:{" "}
              {new Date(selected.createdAt).toLocaleString(locale())}
            </p>
            <Field label={t("Decision reason")}>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
            <Button
              disabled={
                !reason.trim() ||
                !["Active", "Suspended"].includes(selected.status)
              }
              onClick={() => setConfirm(true)}
            >
              {t(
                selected.status === "Suspended"
                  ? "Restore access"
                  : "Suspend access",
              )}
            </Button>
          </>
        )}
      </Modal>
      <Confirm
        title={t("Change subscription access?")}
        description={t(
          "This affects sandbox requests and creates an audit entry. Existing keys remain masked in history.",
        )}
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          if (!selected || !reason.trim()) return;
          const next = selected.status === "Suspended" ? "Active" : "Suspended";
          update((d) => ({
            ...d,
            subscriptions: d.subscriptions.map((s) =>
              s.id === selected.id ? { ...s, status: next } : s,
            ),
            audit: [
              {
                id: crypto.randomUUID(),
                entity: selected.api,
                action: next,
                reason,
                actor: session?.name || "Demo",
                at: new Date().toISOString(),
              },
              ...d.audit,
            ],
          }));
          setConfirm(false);
          setSelected(null);
          toast("Subscription access updated.");
        }}
      />
    </>
  );
}

export function Transactions() {
  useLanguage();
  const { data } = useStore();
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string>("");
  const rows = data.transactions.filter((r) => !status || r.status === status);
  const detail = data.transactions.find((r) => r.id === selected);
  return (
    <>
      <h1 className="hub-page-heading">
        {t("Sandbox Transaction Monitoring")}
      </h1>
      <p className="hub-subtitle">
        {t("TEST TRANSACTIONS — No real money, settlement or payouts.")}
      </p>
      <Panel>
        <Field label={t("Status filter")}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("All")}</option>
            {["Success", "Failure", "Pending"].map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </Field>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {[
                  "Transaction ID",
                  "API",
                  "Plan",
                  "Simulated amount",
                  "Status",
                  "Timestamp",
                  "Actions",
                ].map((v) => (
                  <th className="p-3 text-left" key={v}>
                    {t(v)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    <code>{r.id.slice(0, 12)}</code>
                  </td>
                  <td>{r.api}</td>
                  <td>{t(r.plan)}</td>
                  <td>${r.amount.toFixed(2)}</td>
                  <td>{t(r.status)}</td>
                  <td>{new Date(r.at).toLocaleString(locale())}</td>
                  <td>
                    <Button onClick={() => setSelected(r.id)}>
                      {t("View details")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <p className="py-8">{t("No sandbox transactions yet.")}</p>
        )}
      </Panel>
      <Modal
        title={t("Transaction details")}
        open={!!detail}
        onClose={() => setSelected("")}
      >
        {detail && (
          <div className="space-y-4 mt-5 text-sm">
            <code className="break-all">{detail.id}</code>
            <p>
              {detail.api} · {t(detail.plan)} · {t(detail.status)}
            </p>
            <p>
              {t("Activation status")}:{" "}
              {t(
                data.subscriptions.find((s) => s.id === detail.subscription)
                  ?.status || "Not activated",
              )}
            </p>
            <p>{t("No payment card information was collected.")}</p>
          </div>
        )}
      </Modal>
    </>
  );
}

export function Notifications() {
  useLanguage();
  const { data, update, session } = useStore();
  const [unread, setUnread] = useState(false);
  const rows = data.notifications.filter(
    (n) => n.role === session?.role && (!unread || !n.read),
  );
  return (
    <>
      <h1 className="hub-page-heading">{t("Notification Center")}</h1>
      <p className="hub-subtitle">
        {t("Notifications from your local workspace activity.")}
      </p>
      <Panel>
        <div className="flex gap-3 mb-5">
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={unread}
              onChange={(e) => setUnread(e.target.checked)}
            />
            {t("Unread only")}
          </label>
          <Button
            onClick={() =>
              update((d) => ({
                ...d,
                unread: 0,
                notifications: d.notifications.map((n) =>
                  n.role === session?.role ? { ...n, read: true } : n,
                ),
              }))
            }
          >
            {t("Mark all as read")}
          </Button>
        </div>
        {rows.map((n) => (
          <article key={n.id} className="border-t py-5">
            <div className="flex justify-between gap-3">
              <strong>{t(n.title)}</strong>
              <span className="hub-badge">{t(n.read ? "Read" : "Unread")}</span>
            </div>
            <p className="text-xs my-3">
              {new Date(n.at).toLocaleString(locale())}
            </p>
            <Link
              className="hub-button"
              to={n.href}
              onClick={() =>
                update((d) => ({
                  ...d,
                  notifications: d.notifications.map((v) =>
                    v.id === n.id ? { ...v, read: true } : v,
                  ),
                  unread: Math.max(0, d.unread - (n.read ? 0 : 1)),
                }))
              }
            >
              {t("View details")}
            </Link>
          </article>
        ))}
        {!rows.length && (
          <p className="py-8">{t("No notifications to display.")}</p>
        )}
      </Panel>
    </>
  );
}
