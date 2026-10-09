import { t, useLanguage } from "../i18n";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Panel } from "../components/ui";
import { useStore } from "./store";
import { registeredEndpoints } from "../lib/contracts";
export default function Documentation() {
  useLanguage();
  const { data, toast } = useStore();
  const [params] = useSearchParams();
  const api = data.apis.find((a) => a.id === params.get("api")) || data.apis[0];
  const draft = data.drafts.find((d) => d.id === api.id);
  const [section, setSection] = useState("Quickstart");
  const [language, setLanguage] = useState("cURL");
  const [version, setVersion] = useState(api.version);
  const [search, setSearch] = useState("");
  const contract = draft ? JSON.parse(draft.spec) : null;
  const endpoints = contract
    ? Object.entries(
        contract.paths as Record<
          string,
          Record<
            string,
            {
              summary?: string;
            }
          >
        >,
      ).flatMap(([path, methods]) =>
        Object.entries(methods)
          .filter(([m]) =>
            ["get", "post", "put", "patch", "delete"].includes(m),
          )
          .map(([method, value]) => ({
            path,
            method: method.toUpperCase(),
            summary: value.summary || "Endpoint",
          })),
      )
    : registeredEndpoints(data, api.id).map((e) => ({
        ...e,
        summary: "Sample API contract",
      }));
  const active = endpoints.find((e) => e.path === section) || endpoints[0];
  const operation =
    contract?.paths?.[active?.path]?.[active?.method?.toLowerCase()];
  const base = draft?.baseUrl || "https://gateway.example.test";
  const snippets: Record<string, string> = {
    cURL: `curl -X ${active.method} '${base}${active.path}' \\\n  -H 'Authorization: Bearer <YOUR_API_KEY>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"messages":[{"role":"user","content":"Hello"}]}'`,
    TypeScript: `const response = await fetch('${base}${active.path}', {\n  method: '${active.method}',\n  headers: { Authorization: 'Bearer <YOUR_API_KEY>', 'Content-Type': 'application/json' },\n${active.method === "GET" ? "" : '  body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),\n'} });\nif (!response.ok) throw new Error(\`Request failed: \${response.status}\`);\nconst result = await response.json();`,
    Python: `import requests\n\nresponse = requests.request('${active.method}', '${base}${active.path}',\n    headers={'Authorization': 'Bearer <YOUR_API_KEY>'},\n    json={'messages': [{'role': 'user', 'content': 'Hello'}]})\nresponse.raise_for_status()\nprint(response.json())`,
  };
  const nav = [
    "Quickstart",
    "Authentication",
    "Rate limits",
    "Errors",
    ...endpoints.map((e) => e.path),
  ];
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <p className="text-xs text-primary uppercase tracking-widest mb-3">
        {t("Developer documentation")}
      </p>
      <div className="flex justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="hub-page-heading">{api.name}</h1>
          <p className="text-sm text-on-surface-variant">
            {t("Reference documentation \u00B7 ")}
            {t(draft ? "Imported provider contract" : "Sample API contract")}
          </p>
        </div>
        <select
          className="border rounded p-3 bg-white self-start"
          aria-label={t("Documentation version")}
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        >
          <option value={api.version}>{api.version}</option>
        </select>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="hub-panel self-start">
          <input
            className="border rounded p-3 w-full text-sm mb-4"
            aria-label={t("Search documentation")}
            placeholder={t("Search docs\u2026")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <nav>
            {nav
              .filter((v) =>
                (v + " " + t(v)).toLowerCase().includes(search.toLowerCase()),
              )
              .map((v) => (
                <button
                  key={v}
                  className={`w-full text-left p-3 rounded text-sm mb-1 ${section === v ? "bg-primary text-white" : ""}`}
                  onClick={() => setSection(v)}
                >
                  {t(v)}
                </button>
              ))}
          </nav>
        </aside>
        <div>
          <Panel>
            <h2 className="text-2xl mb-6">
              {t(section.startsWith("/") ? active.summary : section)}
            </h2>
            {section === "Authentication" ? (
              <>
                <p className="text-sm mb-5">
                  {t(api.auth)}
                  {t(
                    " authentication. Create a scoped credential in your Consumer workspace and include it in the request header. Never expose a live credential in browser bundles.",
                  )}
                </p>
                <pre className="bg-surface-container-low p-5 text-xs">
                  Authorization: Bearer &lt;YOUR_API_KEY&gt;
                </pre>
                <Link className="hub-button mt-6" to="/app/keys">
                  {t("Manage API Keys")}
                </Link>
              </>
            ) : section === "Rate limits" ? (
              <>
                <p className="text-sm leading-7">
                  {t(
                    "Monthly request quotas and per-minute limits depend on the subscribed plan. A 429 response indicates rate limiting. Observe Retry-After and avoid retry storms.",
                  )}
                </p>
                <Link className="hub-button mt-5" to="/app/usage">
                  {t("View usage & quota")}
                </Link>
              </>
            ) : section === "Errors" ? (
              <div className="space-y-4">
                {[
                  ["400", "Invalid request payload"],
                  ["401", "Invalid or expired credential"],
                  ["403", "Insufficient access"],
                  ["429", "Rate limit exceeded"],
                  ["500", "Upstream service failure"],
                  ["504", "Gateway timeout"],
                ].map(([code, text]) => (
                  <div className="flex gap-6 border-b pb-4 text-sm" key={code}>
                    <code>{code}</code>
                    <span>{t(text)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant leading-7 mb-6">
                  {draft ? api.description : t(api.description)}
                  {t(
                    " Select an endpoint and use the integration snippets below. The playground simulates responses locally.",
                  )}
                </p>
                <div className="bg-surface-container-low p-4 rounded font-code-md text-sm">
                  {t(active.method)} {active.path}
                </div>
                {operation && (
                  <div className="my-6 space-y-4">
                    <h3 className="text-lg">
                      {t("Request and response schemas")}
                    </h3>
                    {(operation.parameters || []).map(
                      (p: {
                        name: string;
                        in: string;
                        required?: boolean;
                        description?: string;
                      }) => (
                        <div
                          className="text-sm border-b pb-3"
                          key={p.in + p.name}
                        >
                          <code>{p.name}</code> · {p.in} ·{" "}
                          {t(p.required ? "Required" : "Optional")}
                          <p>{p.description}</p>
                        </div>
                      ),
                    )}
                    {Object.entries({
                      requestBody: operation.requestBody,
                      responses: operation.responses,
                    })
                      .filter(([, v]) => v)
                      .map(([key, value]) => (
                        <details key={key}>
                          <summary className="cursor-pointer text-sm">
                            {t(
                              key === "requestBody"
                                ? "Request body"
                                : "Responses",
                            )}
                          </summary>
                          <pre className="bg-surface-container-low p-4 mt-3 rounded text-xs">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        </details>
                      ))}
                  </div>
                )}
                <div
                  className="flex gap-3 my-6 flex-wrap"
                  role="tablist"
                  aria-label={t("Snippet language")}
                >
                  {Object.keys(snippets).map((v) => (
                    <button
                      className={`hub-button ${v === language ? "primary" : ""}`}
                      key={v}
                      role="tab"
                      aria-selected={v === language}
                      onClick={() => setLanguage(v)}
                    >
                      {t(v)}
                    </button>
                  ))}
                </div>
                <pre className="bg-[#131b2e] text-white p-6 rounded text-xs leading-6">
                  {snippets[language]}
                </pre>
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(snippets[language]);
                        toast("Snippet copied.");
                      } catch {
                        toast("Select the snippet to copy it manually.");
                      }
                    }}
                  >
                    {t("Copy snippet")}
                  </Button>
                  <Link
                    className="hub-button primary"
                    to={`/apis/neural-llm/playground?api=${api.id}`}
                  >
                    {t("Test in Playground")}
                  </Link>
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
