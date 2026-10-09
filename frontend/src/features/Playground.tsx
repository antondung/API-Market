import { t, useLanguage } from "../i18n";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Field } from "../components/ui";
import { useStore } from "./store";
import { registeredEndpoints, planLimits } from "../lib/contracts";
export default function Playground() {
  useLanguage();
  const { data, session, update, toast } = useStore();
  const [params] = useSearchParams();
  const api = data.apis.find((a) => a.id === params.get("api")) || data.apis[0];
  const [tab, setTab] = useState("Body");
  const [body, setBody] = useState(
    '{\n  "model": "neural-v4",\n  "messages": [{"role":"user","content":"Hello, API Hub!"}]\n}',
  );
  const endpoints = registeredEndpoints(data, api.id);
  const [method, setMethod] = useState(endpoints[0]?.method || "GET");
  const [endpoint, setEndpoint] = useState(endpoints[0]?.path || "/");
  const [access, setAccess] = useState("Trial");
  const [responseTab, setResponseTab] = useState("JSON");
  const subscription = data.subscriptions.find(
    (s) => s.api === api.name && s.status === "Active",
  );
  const trialUsed = data.requests.filter(
    (r) =>
      r.api === api.name &&
      r.context === "Trial" &&
      r.actor === (session?.email || "Guest"),
  ).length;
  const [headers, setHeaders] = useState('{"Content-Type":"application/json"}');
  const [query, setQuery] = useState("{}");
  const [key, setKey] = useState("");
  const [scenario, setScenario] = useState("200");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function send() {
    if (busy) return;
    setError("");
    if (api.status !== "Published") {
      setError("This API is unavailable for testing.");
      return;
    }
    if (!endpoints.some((e) => e.path === endpoint && e.method === method)) {
      setError("Choose a registered endpoint and its HTTP method.");
      return;
    }
    if (access === "Subscription" && !subscription) {
      setError("An active subscription is required for this access context.");
      return;
    }
    if (
      access === "Trial" &&
      api.trialLimit !== undefined &&
      trialUsed >= api.trialLimit
    ) {
      setError("Trial exhausted. View plans to continue.");
      return;
    }
    if (access === "Subscription" && subscription) {
      const limits = planLimits(data, api.name, subscription.plan);
      const requests = data.requests.filter(
        (r) =>
          r.api === api.name &&
          r.actor === session?.email &&
          r.context === "Subscription",
      );
      if (
        requests.filter(
          (r) => r.at.slice(0, 7) === new Date().toISOString().slice(0, 7),
        ).length >= limits.quota
      ) {
        setError("Monthly quota exhausted. View plans to continue.");
        return;
      }
      if (
        requests.filter((r) => Date.now() - new Date(r.at).getTime() < 60000)
          .length >= limits.rate
      ) {
        setError("Rate limit reached. Retry after one minute.");
        return;
      }
    }
    try {
      JSON.parse(body);
      JSON.parse(headers);
      JSON.parse(query);
    } catch {
      setError("Body, headers and query parameters must contain valid JSON.");
      return;
    }
    if (!endpoint.startsWith("/")) {
      setError("Endpoint must start with /.");
      return;
    }
    setBusy(true);
    setResult("");
    timer.current = setTimeout(() => {
      const status = Number(scenario);
      const response =
        status === 200
          ? {
              demo: true,
              id: crypto.randomUUID(),
              api: api.name,
              choices: [
                {
                  message: {
                    role: "assistant",
                    content:
                      "Hello! This is a simulated response from your API Hub playground.",
                  },
                },
              ],
              usage: { total_tokens: 42 },
            }
          : {
              demo: true,
              status,
              error:
                status === 401
                  ? "Invalid or missing API key"
                  : status === 403
                    ? "Insufficient access"
                    : status === 429
                      ? "Rate limit exceeded"
                      : status === 504
                        ? "Gateway timeout"
                        : "Service unavailable",
            };
      setResult(JSON.stringify(response, null, 2));
      setBusy(false);
      update((d) => ({
        ...d,
        requests: [
          {
            id: crypto.randomUUID(),
            api: api.name,
            method,
            path: endpoint,
            status,
            duration: 700,
            at: new Date().toISOString(),
            actor: session?.email || "Guest",
            context: access,
          },
          ...d.requests,
        ],
        keys: d.keys.map((k) =>
          k.id === key ? { ...k, lastUsed: new Date().toISOString() } : k,
        ),
        notifications:
          status >= 400
            ? [
                {
                  id: crypto.randomUUID(),
                  title: "Sandbox request failed",
                  role: session?.role || "consumer",
                  href:
                    session?.role === "provider"
                      ? "/provider/requests"
                      : session?.role === "admin"
                        ? "/admin/requests"
                        : "/app/requests",
                  at: new Date().toISOString(),
                  read: false,
                },
                ...d.notifications,
              ]
            : d.notifications,
        unread: status >= 400 ? d.unread + 1 : d.unread,
        audit: [
          {
            id: crypto.randomUUID(),
            entity: api.name,
            action: `${method} ${endpoint} · ${status}`,
            reason: "Playground demo request",
            actor: session?.name || "Guest",
            at: new Date().toISOString(),
          },
          ...d.audit,
        ],
      }));
    }, 700);
  }
  const curl = `curl -X ${method} 'https://gateway.example.test${endpoint}' \\\n  -H 'Authorization: Bearer <YOUR_API_KEY>' \\\n  -H 'Content-Type: application/json' \\\n  -d '${body.replaceAll("'", "'\\''")}'`;
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="flex justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest mb-2">
            {t("Interactive sandbox")}
          </p>
          <h1 className="hub-page-heading">
            {api.name}
            {t(" Playground")}
          </h1>
          <p className="hub-subtitle">
            {t(
              "Build a request and inspect responses without calling a live endpoint.",
            )}
          </p>
        </div>
        <Link className="hub-button" to={`/apis/neural-llm/docs?api=${api.id}`}>
          {t("Documentation")}
        </Link>
      </div>
      <div className="hub-panel">
        <Field label={t("Access context")}>
          <select value={access} onChange={(e) => setAccess(e.target.value)}>
            <option value="Trial">{t("Trial")}</option>
            <option value="Subscription" disabled={!subscription}>
              {t("Subscription")}
            </option>
          </select>
        </Field>
        <p className="text-sm">
          {api.trialLimit === undefined
            ? t(
                "Trial allocation is not configured. Requests use the local sandbox only.",
              )
            : `${trialUsed} / ${api.trialLimit} ${t("trial requests used")}`}
        </p>
        <Link className="hub-button mt-4" to={`/checkout?api=${api.id}`}>
          {t("View Plans")}
        </Link>
      </div>
      <div className="playground-grid grid grid-cols-2 gap-6">
        <div className="hub-panel">
          <h2 className="text-xl">{t("Request Builder")}</h2>
          <div className="flex gap-3">
            <Field label={t("Method")}>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((v) => (
                  <option key={v} value={v}>
                    {t(v)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex-1">
              <Field label={t("Endpoint")}>
                <select
                  value={endpoint}
                  onChange={(e) => {
                    setEndpoint(e.target.value);
                    setMethod(
                      endpoints.find((v) => v.path === e.target.value)
                        ?.method || "GET",
                    );
                  }}
                >
                  {Array.from(new Set(endpoints.map((e) => e.path))).map(
                    (path) => (
                      <option key={path} value={path}>
                        {path}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            </div>
          </div>
          <div
            className="flex flex-wrap gap-2 border-b pb-3"
            role="tablist"
            aria-label={t("Request editor")}
          >
            {["Body", "Headers", "Parameters", "Auth"].map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={v === tab}
                className={`hub-button ${v === tab ? "primary" : ""}`}
                onClick={() => setTab(v)}
              >
                {t(v)}
              </button>
            ))}
          </div>
          <div role="tabpanel">
            {tab === "Auth" ? (
              <Field label={t("API credential")}>
                <select value={key} onChange={(e) => setKey(e.target.value)}>
                  <option value="">{t("Guest sandbox credential")}</option>
                  {data.keys
                    .filter((k) => k.status === "Active" && k.api === api.name)
                    .map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                        {t(" \u00B7 ")}
                        {k.prefix}
                      </option>
                    ))}
                </select>
              </Field>
            ) : (
              <Field label={t(`${tab} (JSON)`)}>
                <textarea
                  className="font-code-md"
                  rows={10}
                  value={
                    tab === "Body" ? body : tab === "Headers" ? headers : query
                  }
                  onChange={(e) =>
                    (tab === "Body"
                      ? setBody
                      : tab === "Headers"
                        ? setHeaders
                        : setQuery)(e.target.value)
                  }
                />
              </Field>
            )}
          </div>
          <Field label={t("Demo response scenario")}>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            >
              {["200", "401", "403", "429", "500", "504"].map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                  {t(" \u00B7 ")}
                  {t(
                    s === "200"
                      ? "Success"
                      : s === "401"
                        ? "Unauthorized"
                        : s === "403"
                          ? "Forbidden"
                          : s === "429"
                            ? "Rate limited"
                            : s === "504"
                              ? "Timeout"
                              : "Server error",
                  )}
                </option>
              ))}
            </select>
          </Field>
          {error && (
            <p role="alert" className="inline-error">
              {t(error)}
            </p>
          )}
          <Button className="primary" disabled={busy} onClick={send}>
            {t(busy ? "Sending demo request…" : "Send Request")}
          </Button>
          {busy && (
            <Button
              className="ml-3"
              onClick={() => {
                if (timer.current) clearTimeout(timer.current);
                setBusy(false);
                toast("Request cancelled.");
              }}
            >
              {t("Cancel")}
            </Button>
          )}
        </div>
        <div>
          <div className="hub-panel">
            <div className="flex justify-between mb-5">
              <h2 className="text-xl">{t("Response")}</h2>
              {result && (
                <span className="hub-badge">
                  {t(scenario)}
                  {t(" \u00B7 demo")}
                </span>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              {["JSON", "Text", "Headers"].map((v) => (
                <Button
                  key={v}
                  aria-pressed={v === responseTab}
                  onClick={() => setResponseTab(v)}
                >
                  {t(v)}
                </Button>
              ))}
            </div>
            <pre
              className="bg-surface-container-low rounded p-5 text-xs min-h-64"
              aria-live="polite"
            >
              {busy
                ? t("Waiting for simulated response…")
                : result
                  ? responseTab === "Headers"
                    ? "content-type: application/json\nx-api-hub-demo: true"
                    : result
                  : t(
                      "Send a request to inspect the response body, status and error state.",
                    )}
            </pre>
            <Button
              className="mt-4"
              disabled={!result}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result);
                  toast("Response copied.");
                } catch {
                  toast("Copy manually from the response panel.");
                }
              }}
            >
              {t("Copy response")}
            </Button>
            <Button
              className="mt-4 ml-3"
              disabled={!result}
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob([result], { type: "application/json" }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "sandbox-response.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              {t("Download response")}
            </Button>
            {result && (
              <p className="text-xs mt-4">
                {t("Simulated duration")}: 700 ms · {t("Response size")}:{" "}
                {new TextEncoder().encode(result).length} bytes
              </p>
            )}
          </div>
          <div className="hub-panel">
            <h2 className="text-lg mb-4">
              {t("Integration snippet \u00B7 cURL")}
            </h2>
            <pre className="text-xs bg-[#131b2e] text-white rounded p-5">
              {curl}
            </pre>
            <p className="text-xs text-on-surface-variant mt-3">
              {t("Credential values are excluded from snippets and storage.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
