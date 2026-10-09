import { t, useLanguage, locale } from "../i18n";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Panel, Modal, Field, Confirm } from "../components/ui";
import { useStore } from "./store";
import { registeredEndpoints, planLimits } from "../lib/contracts";
export function Operations({ kind }: { kind: string }) {
  useLanguage();
  const { data, toast, update, session } = useStore();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(
    null,
  );
  const [action, setAction] = useState<{ id: string; status: string } | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const titles: Record<string, string> = {
    audit: "Audit Logs & Administrative Activity",
    requests: "Request History",
    revenue: "Revenue & Payouts",
    apis: "API Catalog Administration",
    subscriptions: "Subscription Management",
  };
  const source =
    kind === "audit"
      ? data.audit
      : kind === "requests"
        ? data.audit.filter((a) => a.reason === "Playground demo request")
        : kind === "subscriptions" || kind === "revenue"
          ? data.subscriptions
          : data.apis;
  const rows = source.map((row) =>
    Object.fromEntries(Object.entries(row).filter(([key]) => key !== "id")),
  );
  const filtered = rows.filter((row) =>
    (
      JSON.stringify(row) +
      " " +
      Object.values(row)
        .map((value) => t(String(value)))
        .join(" ")
    )
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const keys = Object.keys(rows[0] || {});
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(filtered, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-demo.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Demo records exported.");
  }
  return (
    <>
      <div className="flex justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="hub-page-heading">{t(titles[kind])}</h1>
          <p className="hub-subtitle">
            {t("Live local demo records \u00B7 ")}
            {t(source.length)}
            {t(" entries")}
          </p>
        </div>
        <Button
          className="self-start"
          disabled={!rows.length}
          onClick={download}
        >
          {t("Export records")}
        </Button>
      </div>
      {kind === "revenue" && (
        <Panel>
          <h2 className="text-xl">{t("Payout summary")}</h2>
          <p className="text-sm mt-4">
            {t(
              "No real payment ledger is connected. Subscription plans below are sandbox records; actual revenue, fees and payouts require billing data from the backend.",
            )}
          </p>
        </Panel>
      )}
      <Panel>
        <input
          aria-label={t("Search records")}
          className="border border-outline-variant p-3 rounded w-full mb-5"
          placeholder={t("Search records\u2026")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low text-left">
                {keys.map((k) => (
                  <th className="p-3 capitalize" key={k}>
                    {t(k)}
                  </th>
                ))}
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * 10, page * 10).map((row, i) => (
                <tr key={i} className="border-b">
                  {keys.map((k) => (
                    <td className="p-3 max-w-72 break-words" key={k}>
                      {[
                        "status",
                        "category",
                        "pricing",
                        "auth",
                        "plan",
                        "billing",
                        "action",
                      ].includes(k)
                        ? t(String(row[k]))
                        : k === "at" || k === "createdAt"
                          ? new Date(String(row[k])).toLocaleString(locale())
                          : String(row[k])}
                    </td>
                  ))}
                  <td className="p-3">
                    <Button onClick={() => setSelected(row)}>
                      {t("View details")}
                    </Button>
                    {kind === "apis" && session?.role === "admin" && (
                      <Button
                        className="mt-2"
                        onClick={() => {
                          setReason("");
                          setAction({
                            id: data.apis.find((a) => a.name === row.name)!.id,
                            status:
                              row.status === "Published"
                                ? "Suspended"
                                : "Published",
                          });
                        }}
                      >
                        {t(
                          row.status === "Published"
                            ? "Suspend API"
                            : "Restore API",
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <p className="text-center py-10 text-on-surface-variant">
            {t("No matching records.")}
          </p>
        )}
        <div className="flex justify-between mt-6 text-sm">
          <span>
            {t(filtered.length)}
            {t(" records \u00B7 page ")}
            {t(page)}
          </span>
          <div className="flex gap-2">
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              {t("Previous")}
            </Button>
            <Button
              disabled={page * 10 >= filtered.length}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("Next")}
            </Button>
          </div>
        </div>
      </Panel>
      <Modal
        title={t("Record details")}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        <dl className="space-y-4 mt-5 text-sm">
          {selected &&
            Object.entries(selected).map(([k, v]) => (
              <div key={k}>
                <dt className="text-on-surface-variant">{t(k)}</dt>
                <dd className="break-all">
                  {["status", "action", "plan", "auth", "pricing"].includes(k)
                    ? t(String(v))
                    : String(v)}
                </dd>
              </div>
            ))}
        </dl>
      </Modal>
      <Confirm
        title={t("Change API availability?")}
        description={t(
          "This changes public discovery and sandbox access. A reason is required and recorded in the audit log.",
        )}
        open={!!action}
        disabled={!reason.trim()}
        onClose={() => setAction(null)}
        onConfirm={() => {
          if (!action || !reason.trim()) return;
          update((d) => ({
            ...d,
            apis: d.apis.map((a) =>
              a.id === action.id ? { ...a, status: action.status } : a,
            ),
            audit: [
              {
                id: crypto.randomUUID(),
                entity: action.id,
                action: action.status,
                reason,
                actor: session?.name || "Admin",
                at: new Date().toISOString(),
              },
              ...d.audit,
            ],
          }));
          setAction(null);
          toast("API availability updated.");
        }}
      >
        <Field label={t("Decision reason")}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
      </Confirm>
    </>
  );
}
export function Detail() {
  useLanguage();
  const { data } = useStore();
  const [params] = useSearchParams();
  const api = params.has("api")
    ? data.apis.find((a) => a.id === params.get("api"))
    : data.apis[0];
  const [tab, setTab] = useState("Overview");
  if (!api)
    return (
      <div className="max-w-7xl mx-auto p-10">
        <h1 className="hub-page-heading">{t("API not found")}</h1>
        <Link className="hub-button" to="/marketplace">
          {t("Explore APIs")}
        </Link>
      </div>
    );
  const draft = data.drafts.find((d) => d.id === api.id);
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <p className="text-xs text-on-surface-variant mb-7">
        <Link to="/marketplace">{t("Marketplace")}</Link>
        {t(" / ")}
        {t(api.category)}
        {t(" / ")}
        {api.name}
      </p>
      <div className="flex justify-between flex-wrap gap-6 mb-8">
        <div>
          <span className="hub-badge">{t(api.category)}</span>
          <h1 className="hub-page-heading mt-4">{api.name}</h1>
          <p className="text-sm text-on-surface-variant">
            {t("By ")}
            {api.provider}
            {t(" \u00B7 ")}
            {api.version}
            {t(" \u00B7 ")}
            {t(api.status)}
          </p>
          <p className="max-w-2xl mt-6 text-on-surface-variant">
            {draft ? api.description : t(api.description)}
          </p>
        </div>
        <div className="flex gap-3 items-start">
          {api.status === "Published" ? (
            <Link
              className="hub-button"
              to={`/apis/neural-llm/playground?api=${api.id}`}
            >
              {t("Try API")}
            </Link>
          ) : (
            <span className="hub-badge">
              {t("This API is unavailable for testing.")}
            </span>
          )}
          {api.status === "Published" && (
            <Link className="hub-button primary" to={`/checkout?api=${api.id}`}>
              {t("Subscribe to API")}
            </Link>
          )}
        </div>
      </div>
      <div
        className="flex flex-wrap gap-3 border-b mb-6 pb-4"
        role="tablist"
        aria-label={t("API product sections")}
      >
        {["Overview", "Endpoints", "Pricing", "Compliance"].map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={tab === v}
            className={`hub-button ${tab === v ? "primary" : ""}`}
            onClick={() => setTab(v)}
          >
            {t(v)}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <Panel>
          <div role="tabpanel">
            {tab === "Overview" ? (
              <>
                <h2 className="text-2xl mb-5">
                  {t("Built for your next integration")}
                </h2>
                <p className="text-on-surface-variant leading-7">
                  {draft ? api.description : t(api.description)}
                  {t(
                    " Explore the request contract, test sandbox responses, and select a subscription that fits your workload.",
                  )}
                </p>
                <div className="grid sm:grid-cols-3 gap-4 my-8">
                  {[
                    "Measured health unavailable in local demo.",
                    "REST / JSON",
                    "Sandbox available",
                  ].map((v) => (
                    <div
                      className="bg-surface-container-low rounded p-5 text-sm"
                      key={v}
                    >
                      {t(v)}
                    </div>
                  ))}
                </div>
                <Link
                  className="hub-button"
                  to={`/apis/neural-llm/docs?api=${api.id}`}
                >
                  {t("Read Documentation")}
                </Link>
              </>
            ) : tab === "Endpoints" ? (
              <>
                <h2 className="text-xl mb-5">{t("Endpoint explorer")}</h2>
                <div className="bg-surface-container-low p-5 rounded font-code-md text-sm">
                  {registeredEndpoints(data, api.id).map((e) => (
                    <p key={e.method + e.path}>
                      {e.method} {e.path}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-on-surface-variant my-5">
                  {t(
                    "The source contract contains a sample chat completion endpoint. Provider contracts are imported in the OpenAPI workspace.",
                  )}
                </p>
                {api.status === "Published" && (
                  <Link
                    className="hub-button primary"
                    to={`/apis/neural-llm/playground?api=${api.id}`}
                  >
                    {t("Open Playground")}
                  </Link>
                )}
              </>
            ) : tab === "Pricing" ? (
              <>
                <h2 className="text-xl mb-5">{t("Plans & pricing")}</h2>{" "}
                {draft && (
                  <div className="hub-panel">
                    <h3 className="text-xl">{t("Provider Plan")}</h3>
                    <p className="text-2xl my-4">
                      {t("$")}
                      {t(draft.price)}
                      {t(" / month")}
                    </p>
                    <p className="text-sm mb-5">
                      {t(draft.quota.toLocaleString(locale()))}
                      {t(" requests \u00B7 ")}
                      {t(draft.rate)}
                      {t(" requests / minute")}
                    </p>
                    <Link
                      className="hub-button primary"
                      to={`/checkout?api=${api.id}&plan=Provider%20Plan`}
                    >
                      {t("Select provider plan")}
                    </Link>
                  </div>
                )}
                <div className="grid sm:grid-cols-3 gap-4">
                  {["Free", "Developer", "Pro"].map((p, i) => (
                    <div
                      key={p}
                      className="bg-surface-container-low p-5 rounded"
                    >
                      <h3>{t(p)}</h3>
                      <p className="text-2xl my-4">
                        {t("$")}
                        {t([0, 29, 99][i])}
                      </p>
                      <p className="text-xs mb-5">
                        {t([1000, 10000, 100000][i].toLocaleString(locale()))}
                        {t(" demo requests / month")}
                      </p>
                      <Link
                        className="hub-button primary"
                        to={`/checkout?api=${api.id}&plan=${p}`}
                      >
                        {t("Select plan")}
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl mb-5">{t("Trust & compliance")}</h2>
                <p className="text-sm leading-7">
                  {t(
                    "Provider ownership and API review gates are part of the publishing workflow. Compliance badges in the supplied designs represent sample content; verify live certifications with the provider before using personal data.",
                  )}
                </p>
                <Link
                  className="hub-button mt-5"
                  to={`/app/reports?api=${api.id}`}
                >
                  {t("Report an issue")}
                </Link>
              </>
            )}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-lg mb-5">{t("API specifications")}</h2>
          <dl className="text-sm space-y-5">
            <div>
              <dt className="text-on-surface-variant">{t("Authentication")}</dt>
              <dd className="mt-1">{t(api.auth)}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">{t("Pricing model")}</dt>
              <dd className="mt-1">{t(api.pricing)}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">{t("Version")}</dt>
              <dd className="mt-1 font-code-md">{api.version}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">
                {t("Base URL \u00B7 demo")}
              </dt>
              <dd className="mt-1 text-xs break-all">
                {draft?.baseUrl || "https://gateway.example.test"}
              </dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
export function Compare() {
  useLanguage();
  const { data } = useStore();
  const [params] = useSearchParams();
  const [ids, setIds] = useState<string[]>(
    params
      .get("ids")
      ?.split(",")
      .filter((id) => data.apis.some((a) => a.id === id))
      .slice(0, 4) || data.apis.slice(0, 3).map((a) => a.id),
  );
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <h1 className="hub-page-heading">{t("Compare APIs")}</h1>
      <p className="hub-subtitle">
        {t(
          "Select up to four APIs and compare their integration requirements.",
        )}
      </p>
      <div className="flex flex-wrap gap-4 mb-8">
        {data.apis.map((a) => (
          <label key={a.id} className="hub-button">
            <input
              type="checkbox"
              checked={ids.includes(a.id)}
              disabled={!ids.includes(a.id) && ids.length >= 4}
              onChange={(e) =>
                setIds(
                  e.target.checked
                    ? [...ids, a.id]
                    : ids.filter((id) => id !== a.id),
                )
              }
            />
            {a.name}
          </label>
        ))}
      </div>
      <div className="comparison">
        {data.apis
          .filter((a) => ids.includes(a.id))
          .map((a) => (
            <Panel key={a.id}>
              <span className="hub-badge">{t(a.category)}</span>
              <h2 className="text-xl mt-4">{a.name}</h2>
              <p className="text-sm text-on-surface-variant my-5">
                {data.drafts.some((d) => d.id === a.id)
                  ? a.description
                  : t(a.description)}
              </p>
              <dl className="text-sm space-y-4">
                <div>
                  {t("Provider: ")}
                  {a.provider}
                </div>
                <div>
                  {t("Authentication: ")}
                  {t(a.auth)}
                </div>
                <div>
                  {t("Pricing: ")}
                  {t(a.pricing)}
                </div>
                <div>
                  {t("Version: ")}
                  {a.version}
                </div>
                <div>
                  {t("Monthly quota")}:{" "}
                  {planLimits(data, a.name, "Free").quota.toLocaleString(
                    locale(),
                  )}{" "}
                  · {t("demo")}
                </div>
                <div>
                  {t("Rate limit / minute")}:{" "}
                  {planLimits(data, a.name, "Free").rate} · {t("demo")}
                </div>
                <div>
                  {t("Measured performance")}: {t("Data not available")}
                </div>
              </dl>
              <Link
                className="hub-button primary mt-7"
                to={`/apis/neural-llm?api=${a.id}`}
              >
                {t("View API")}
              </Link>
              {a.status === "Published" && (
                <Link
                  className="hub-button mt-3"
                  to={`/apis/neural-llm/playground?api=${a.id}`}
                >
                  {t("Try API")}
                </Link>
              )}
            </Panel>
          ))}
      </div>
      {!ids.length && (
        <Panel>{t("Select an API above to start comparing.")}</Panel>
      )}
    </div>
  );
}
