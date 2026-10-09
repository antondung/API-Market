import { t, useLanguage, locale } from "../i18n";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Field, Panel, Confirm } from "../components/ui";
import { useStore } from "./store";
import { validateSpec, parseSpec } from "../lib/demo";
import type { Draft } from "../lib/types";
const sampleSpec = JSON.stringify(
  {
    openapi: "3.0.3",
    info: { title: "My Developer API", version: "1.0.0" },
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: { "200": { description: "Healthy" } },
        },
      },
    },
  },
  null,
  2,
);
const blank: Draft = {
  id: "",
  name: "",
  description: "",
  category: "AI & Machine Learning",
  baseUrl: "",
  version: "1.0.0",
  spec: sampleSpec,
  price: 0,
  quota: 1000,
  rate: 60,
  ownership: "",
  personalData: false,
  agreement: false,
  status: "Draft",
};
const steps = [
  "Basic information",
  "Endpoints & OpenAPI",
  "Authentication",
  "Pricing & quota",
  "Compliance",
  "Review & submit",
];
export function ApiWizard() {
  useLanguage();
  const { data, update, toast } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const existing = data.drafts.find((d) => d.id === params.get("edit"));
  const [draft, setDraft] = useState<Draft>(
    existing || { ...blank, id: crypto.randomUUID() },
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState(
    existing && validateSpec(existing.spec).ok
      ? parseSpec(existing.spec).components?.securitySchemes?.apiHubAuth
          ?.type === "http"
        ? "Bearer Token"
        : parseSpec(existing.spec).security?.length === 0
          ? "None"
          : "API Key"
      : "API Key",
  );
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  function valid() {
    if (step === 0) {
      try {
        const url = new URL(draft.baseUrl);
        if (url.protocol !== "https:" || url.username || url.password)
          throw new Error();
      } catch {
        setError("Enter a valid HTTPS base URL without embedded credentials.");
        return false;
      }
      if (!draft.name.trim() || draft.description.length < 10) {
        setError(
          "Enter an API name and a description of at least 10 characters.",
        );
        return false;
      }
    }
    if (step === 1) {
      const check = validateSpec(draft.spec);
      if (!check.ok) {
        setError(check.error || "Invalid specification");
        return false;
      }
    }
    if (step === 2) {
      const contract = parseSpec(draft.spec);
      set(
        "spec",
        JSON.stringify(
          {
            ...contract,
            security: auth === "None" ? [] : [{ apiHubAuth: [] }],
            components: {
              ...contract.components,
              securitySchemes:
                auth === "None"
                  ? {}
                  : {
                      apiHubAuth:
                        auth === "API Key"
                          ? { type: "apiKey", in: "header", name: "X-API-Key" }
                          : { type: "http", scheme: "bearer" },
                    },
            },
          },
          null,
          2,
        ),
      );
    }
    if (step === 3 && (draft.price < 0 || draft.quota < 1 || draft.rate < 1)) {
      setError("Price cannot be negative. Quota and rate must be positive.");
      return false;
    }
    if (step === 4 && (!draft.ownership.trim() || !draft.agreement)) {
      setError("Add proof of ownership and accept the compliance declaration.");
      return false;
    }
    setError("");
    return true;
  }
  function save(submit = false) {
    const check = validateSpec(draft.spec);
    const spec = check.ok
      ? JSON.stringify(
          {
            ...parseSpec(draft.spec),
            info: {
              ...parseSpec(draft.spec).info,
              title: draft.name || "Untitled API",
              version: draft.version,
            },
          },
          null,
          2,
        )
      : draft.spec;
    const value = {
      ...draft,
      spec,
      status: submit ? "Pending Review" : "Draft",
    };
    update((d) => ({
      ...d,
      drafts: [value, ...d.drafts.filter((v) => v.id !== draft.id)],
    }));
    toast(
      submit
        ? "API submitted to the local admin review queue."
        : "API draft saved.",
    );
    navigate("/provider/apis");
  }
  return (
    <>
      <p className="text-xs uppercase tracking-widest text-primary mb-3">
        {t("Provider workspace / ")}
        {t(existing ? "Edit API" : "Create API")}
      </p>
      <h1 className="hub-page-heading">
        {t(existing ? "Edit your API" : "Publish your next API")}
      </h1>
      <p className="hub-subtitle">
        {t("Define the contract, pricing and compliance requirements.")}
      </p>
      <div className="wizard-layout grid grid-cols-[240px_1fr] gap-6">
        <aside className="wizard-menu">
          {steps.map((s, i) => (
            <button
              key={s}
              className={`w-full text-left p-4 rounded mb-2 text-sm ${i === step ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant"}`}
              disabled={i > step}
              onClick={() => {
                setStep(i);
                setError("");
              }}
            >
              {t(i + 1)}
              {t(". ")}
              {t(s)}
            </button>
          ))}
        </aside>
        <Panel>
          <h2 className="text-2xl mb-6">{t(steps[step])}</h2>
          {step === 0 && (
            <>
              <Field label={t("API name")}>
                <input
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </Field>
              <Field label={t("Description")}>
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label={t("Category")}>
                <select
                  value={draft.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {[
                    "AI & Machine Learning",
                    "Finance",
                    "Security",
                    "Weather",
                    "Messaging",
                    "Developer Tools",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {t(v)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("Base URL (HTTPS)")}>
                <input
                  type="url"
                  placeholder={t("https://api.example.com")}
                  value={draft.baseUrl}
                  onChange={(e) => set("baseUrl", e.target.value)}
                />
              </Field>
              <Field label={t("Version")}>
                <input
                  value={draft.version}
                  onChange={(e) => set("version", e.target.value)}
                />
              </Field>
            </>
          )}
          {step === 1 && (
            <SpecEditor value={draft.spec} onChange={(v) => set("spec", v)} />
          )}
          {step === 2 && (
            <>
              <Field label={t("Authentication scheme")}>
                <select value={auth} onChange={(e) => setAuth(e.target.value)}>
                  {["API Key", "Bearer Token", "None"].map((v) => (
                    <option key={v} value={v}>
                      {t(v)}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="text-sm text-on-surface-variant">
                {t(
                  "Authentication metadata is included in the saved specification. Secret upstream credentials are configured through the backend.",
                )}
              </p>
            </>
          )}
          {step === 3 && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={t("Monthly price (USD)")}>
                <input
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                />
              </Field>
              <Field label={t("Monthly request quota")}>
                <input
                  type="number"
                  min="1"
                  value={draft.quota}
                  onChange={(e) => set("quota", Number(e.target.value))}
                />
              </Field>
              <Field label={t("Requests / minute")}>
                <input
                  type="number"
                  min="1"
                  value={draft.rate}
                  onChange={(e) => set("rate", Number(e.target.value))}
                />
              </Field>
            </div>
          )}
          {step === 4 && (
            <>
              <Field label={t("Ownership evidence / domain reference")}>
                <input
                  placeholder={t(
                    "Domain or documentation demonstrating API ownership",
                  )}
                  value={draft.ownership}
                  onChange={(e) => set("ownership", e.target.value)}
                />
              </Field>
              <label className="flex gap-3 my-5 text-sm">
                <input
                  type="checkbox"
                  checked={draft.personalData}
                  onChange={(e) => set("personalData", e.target.checked)}
                />
                {t("API processes personal data")}
              </label>
              <label className="flex gap-3 my-5 text-sm">
                <input
                  type="checkbox"
                  checked={draft.agreement}
                  onChange={(e) => set("agreement", e.target.checked)}
                />
                {t(
                  "I confirm API ownership and declare its data processing practices.",
                )}
              </label>
            </>
          )}
          {step === 5 && (
            <>
              <div className="bg-surface-container-low rounded p-5 mb-6">
                <h3 className="text-xl">{draft.name}</h3>
                <p className="my-3 text-sm">{draft.description}</p>
                <p className="font-code-md text-xs break-all">
                  {draft.baseUrl}
                  {t(" \u00B7 ")}
                  {draft.version}
                </p>
                <p className="text-sm mt-4">
                  {t("$")}
                  {t(draft.price)}
                  {t(" / month \u00B7 ")}
                  {t(draft.quota.toLocaleString(locale()))}
                  {t(" requests \u00B7 ")}
                  {t(draft.rate)}
                  {t(" requests/minute")}
                </p>
              </div>
              <p className="text-sm mb-5">
                {t("Provider status: ")}
                <span className="hub-badge">{t(data.providerStatus)}</span>
                {t(
                  ". Approval by an administrator is required before publication.",
                )}
              </p>
            </>
          )}
          {error && (
            <p className="inline-error" role="alert">
              {t(error)}
            </p>
          )}
          <div className="flex justify-between gap-3 flex-wrap mt-8 border-t pt-6">
            <Button onClick={() => save()}>{t("Save draft")}</Button>
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  onClick={() => {
                    setStep((s) => s - 1);
                    setError("");
                  }}
                >
                  {t("Back")}
                </Button>
              )}
              {step < 5 ? (
                <Button
                  className="primary"
                  onClick={() => {
                    if (valid()) setStep((s) => s + 1);
                  }}
                >
                  {t("Continue")}
                </Button>
              ) : (
                <Button
                  className="primary"
                  disabled={data.providerStatus !== "Verified"}
                  onClick={() => save(true)}
                >
                  {t("Submit for review")}
                </Button>
              )}
            </div>
          </div>
          {step === 5 && data.providerStatus !== "Verified" && (
            <p className="text-sm text-error mt-4">
              {t("Complete ")}
              <Link className="underline" to="/provider/verification">
                {t("provider verification")}
              </Link>
              {t(" before submitting.")}
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
function SpecEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  useLanguage();
  const [error, setError] = useState("");
  const check = validateSpec(value);
  return (
    <>
      <Field label={t("Upload OpenAPI JSON or YAML")}>
        <input
          type="file"
          accept=".json,.yaml,.yml,application/json,application/yaml,text/yaml"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
              setError("Specification must be smaller than 2 MB.");
              return;
            }
            try {
              onChange(await file.text());
              setError("");
            } catch {
              setError("Unable to read the selected file.");
            }
          }}
        />
      </Field>
      <Field label={t("Specification")}>
        <textarea
          className="font-code-md"
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
      <p
        className={`text-sm ${check.ok ? "text-primary" : "text-error"}`}
        role="status"
      >
        {t(
          check.ok
            ? "Valid specification · endpoint contract ready"
            : check.error,
        )}
      </p>
      {error && (
        <p role="alert" className="inline-error">
          {t(error)}
        </p>
      )}
    </>
  );
}
export function OpenApiImport() {
  useLanguage();
  const { toast, update } = useStore();
  const navigate = useNavigate();
  const [spec, setSpec] = useState(sampleSpec);
  const check = validateSpec(spec);
  const parsed = check.ok ? parseSpec(spec) : null;
  return (
    <>
      <h1 className="hub-page-heading">
        {t("OpenAPI Import & Documentation")}
      </h1>
      <p className="hub-subtitle">
        {t("Validate a JSON contract and preview the generated endpoints.")}
      </p>
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel>
          <SpecEditor value={spec} onChange={setSpec} />
          <Button
            className="primary mt-6"
            disabled={!check.ok}
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(parseSpec(spec), null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "openapi.json";
              a.click();
              URL.revokeObjectURL(url);
              toast("Validated contract exported.");
            }}
          >
            {t("            Export validated contract")}
          </Button>
          <Button
            className="mt-6 ml-3"
            disabled={!check.ok}
            onClick={() => {
              const id = crypto.randomUUID();
              const draft = {
                ...blank,
                id,
                name: parsed.info.title,
                version: parsed.info.version,
                spec: JSON.stringify(parsed, null, 2),
              };
              update((d) => ({ ...d, drafts: [draft, ...d.drafts] }));
              toast("Imported contract saved as a new API draft.");
              navigate(`/provider/apis/new?edit=${id}`);
            }}
          >
            {t("Create draft from specification")}
          </Button>
        </Panel>
        <Panel>
          <h2 className="text-xl mb-5">{t("Documentation preview")}</h2>
          {parsed ? (
            <>
              <h3 className="text-lg mb-5">
                {parsed.info?.title}{" "}
                <span className="hub-badge">{parsed.info?.version}</span>
              </h3>
              {Object.entries(
                parsed.paths as Record<
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
                  .filter(([method]) =>
                    [
                      "get",
                      "post",
                      "put",
                      "patch",
                      "delete",
                      "options",
                      "head",
                    ].includes(method),
                  )
                  .map(([method, item]) => (
                    <div key={method + path} className="border-b py-4">
                      <b className="text-primary text-xs mr-4">
                        {t(method.toUpperCase())}
                      </b>
                      <code className="text-sm">{path}</code>
                      <p className="text-sm mt-3">
                        {item.summary || t("Endpoint")}
                      </p>
                    </div>
                  )),
              )}
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">
              {t("Fix specification errors to preview your documentation.")}
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
export function Verification() {
  useLanguage();
  const { data, update, toast } = useStore();
  const [company, setCompany] = useState(data.records.organization || "");
  const [domain, setDomain] = useState(data.records.domain || "");
  const [providerType, setProviderType] = useState(
    data.records.providerType || "Organization",
  );
  const [contact, setContact] = useState(data.records.providerContact || "");
  const [phone, setPhone] = useState(data.records.providerPhone || "");
  const [error, setError] = useState("");
  return (
    <>
      <h1 className="hub-page-heading">
        {t("Provider Onboarding & Verification")}
      </h1>
      <p className="hub-subtitle">
        {t("Establish ownership before publishing your API.")}
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <Panel>
          <h2 className="text-xl">{t("Organization details")}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
                setError(
                  "Enter a domain such as example.com, without https://.",
                );
                return;
              }
              update((d) => ({
                ...d,
                providerStatus: "Pending Review",
                domainStatus: "Pending Verification",
                records: {
                  ...d.records,
                  organization: company,
                  domain,
                  providerType,
                  providerContact: contact,
                  providerPhone: phone,
                  verificationSubmittedAt: new Date().toISOString(),
                },
              }));
              setError("");
              toast("Verification submitted to local admin queue.");
            }}
          >
            <Field label={t("Provider type")}>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
              >
                {["Individual", "Organization"].map((v) => (
                  <option key={v} value={v}>
                    {t(v)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("Organization name")}>
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Field>
            <Field label={t("Contact email")}>
              <input
                type="email"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </Field>
            <Field label={t("Phone (optional)")}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label={t("Owned domain")}>
              <input
                required
                placeholder={t("example.com")}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </Field>
            {error && (
              <p className="inline-error" role="alert">
                {t(error)}
              </p>
            )}
            <Button type="submit" className="primary">
              {t("Submit verification")}
            </Button>
          </form>
        </Panel>
        <Panel>
          <h2 className="text-xl mb-6">{t("Verification status")}</h2>
          <p className="text-sm mb-4">
            {t("Organization: ")}
            {t(data.records.organization || "Not submitted")}
          </p>
          <p className="text-sm mb-4">
            {t("Domain: ")}
            {t(data.records.domain || "Not submitted")}
            {t(" \u00B7 ")}
            {t(data.domainStatus)}
          </p>
          <span className="hub-badge">{t(data.providerStatus)}</span>
          {data.records.providerReviewReason && (
            <p className="text-sm mt-5">
              {t("Admin feedback")}: {data.records.providerReviewReason}
            </p>
          )}
          <p className="text-sm text-on-surface-variant mt-6">
            {t(
              "Switch to the Admin demo workspace to approve or reject the submitted verification. DNS and document verification require backend services.",
            )}
          </p>
        </Panel>
      </div>
    </>
  );
}
export function ProviderInventory({
  review = false,
  admin = false,
}: {
  review?: boolean;
  admin?: boolean;
}) {
  useLanguage();
  const { data, update, toast, session } = useStore();
  const [action, setAction] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  function apply() {
    if (!action) return;
    if (
      ["Rejected", "Suspended", "Removed"].includes(action.status) &&
      !reason.trim()
    ) {
      toast("Add a decision reason first.");
      return;
    }
    const item = data.drafts.find((d) => d.id === action.id)!;
    update((d) => ({
      ...d,
      drafts: d.drafts.map((t) =>
        t.id === action.id ? { ...t, status: action.status } : t,
      ),
      apis:
        action.status === "Published" && !d.apis.some((a) => a.id === item.id)
          ? [
              ...d.apis,
              {
                id: item.id,
                name: item.name,
                provider: d.records.organization || "Demo Provider",
                category: item.category,
                pricing: item.price === 0 ? "Free" : "Paid",
                auth:
                  JSON.parse(item.spec).security?.length === 0
                    ? "None"
                    : JSON.parse(item.spec).components?.securitySchemes
                          ?.apiHubAuth?.type === "http"
                      ? "Bearer Token"
                      : "API Key",
                description: item.description,
                status: "Published",
                verified: d.providerStatus === "Verified",
                version: item.version,
              },
            ]
          : d.apis.map((a) =>
              a.id === item.id ? { ...a, status: action.status } : a,
            ),
      audit: [
        {
          id: crypto.randomUUID(),
          entity: item.name,
          action: action.status,
          reason: reason || "Publishing workflow demo",
          actor: session?.name || "Demo",
          at: new Date().toISOString(),
        },
        ...d.audit,
      ],
    }));
    toast(`API ${action.status.toLowerCase()}.`);
    setAction(null);
  }
  return (
    <>
      <div className="flex justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="hub-page-heading">
            {t(
              admin
                ? "API Review & Publishing"
                : review
                  ? "Publishing Workflow"
                  : "My APIs Inventory",
            )}
          </h1>
          <p className="hub-subtitle">
            {t("Draft \u2192 Pending Review \u2192 Approved \u2192 Published")}
          </p>
        </div>
        {!admin && (
          <Link
            className="hub-button primary self-start"
            to="/provider/apis/new"
          >
            {t("Create New API")}
          </Link>
        )}
      </div>
      <Panel>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("Search APIs")}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          <Field label={t("Status filter")}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t("All")}</option>
              {[
                "Draft",
                "Pending Review",
                "Under Review",
                "Approved",
                "Published",
                "Rejected",
                "Suspended",
                "Removed",
              ].map((v) => (
                <option key={v} value={v}>
                  {t(v)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Panel>
      {data.drafts
        .filter(
          (d) =>
            (!statusFilter || d.status === statusFilter) &&
            (d.name + " " + d.category + " " + d.version)
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .map((d) => (
          <Panel key={d.id}>
            <div className="flex justify-between gap-4">
              <h2 className="text-xl">{d.name || t("Untitled API")}</h2>
              <span className="hub-badge">{t(d.status)}</span>
            </div>
            <p className="text-sm my-4">
              {d.description || t("No description yet.")}
            </p>
            <code className="text-xs break-all">
              {d.baseUrl} · {d.version}
            </code>
            <details className="my-4 text-sm">
              <summary>{t("Review checklist and history")}</summary>
              <p className="mt-3">
                {t("Provider verification")}: {t(data.providerStatus)} ·{" "}
                {t("Ownership")}: {d.ownership || t("Not submitted")} ·{" "}
                {t("Agreement")}: {t(d.agreement ? "Accepted" : "Missing")}
              </p>
              <p className="mt-3">
                {t("Monthly quota")}: {d.quota} · {t("Rate limit / minute")}:{" "}
                {d.rate}
              </p>
              {data.audit
                .filter((a) => a.entity === d.name)
                .map((a) => (
                  <p key={a.id} className="mt-3">
                    {new Date(a.at).toLocaleString(locale())} · {t(a.action)} ·{" "}
                    {a.reason}
                  </p>
                ))}
            </details>
            <div className="flex flex-wrap gap-3 mt-5">
              {!admin && d.status !== "Published" && (
                <Link
                  className="hub-button"
                  to={`/provider/apis/new?edit=${d.id}`}
                >
                  {t("Edit draft")}
                </Link>
              )}
              {!admin && d.status === "Approved" && (
                <Button
                  className="primary"
                  onClick={() => setAction({ id: d.id, status: "Published" })}
                >
                  {t("Publish API")}
                </Button>
              )}
              {admin &&
                ["Pending Review", "Under Review"].includes(d.status) && (
                  <>
                    <Button
                      className="primary"
                      onClick={() =>
                        setAction({ id: d.id, status: "Approved" })
                      }
                    >
                      {t("Approve API")}
                    </Button>
                    <Button
                      onClick={() =>
                        setAction({ id: d.id, status: "Rejected" })
                      }
                    >
                      {t("Reject API")}
                    </Button>
                  </>
                )}
              {admin && d.status === "Published" && (
                <Button
                  onClick={() => setAction({ id: d.id, status: "Suspended" })}
                >
                  {t("Suspend API")}
                </Button>
              )}
              {admin && d.status === "Suspended" && (
                <>
                  <Button
                    onClick={() => setAction({ id: d.id, status: "Published" })}
                  >
                    {t("Restore API")}
                  </Button>
                  <Button
                    onClick={() => setAction({ id: d.id, status: "Removed" })}
                  >
                    {t("Remove API")}
                  </Button>
                </>
              )}
              {d.status === "Published" && (
                <Link
                  className="hub-button"
                  to={`/apis/neural-llm?api=${d.id}`}
                >
                  {t("View on Marketplace")}
                </Link>
              )}
            </div>
          </Panel>
        ))}
      {!data.drafts.length && (
        <Panel>
          <p className="py-6 text-center">
            {t(
              "No API drafts yet. Create an API in the Provider workspace to start this workflow.",
            )}
          </p>
        </Panel>
      )}
      <Confirm
        title={t(`${action?.status} API?`)}
        description={t(
          "This changes the API's status in the shared local demo and records the decision in the audit trail.",
        )}
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={apply}
        disabled={
          !!action &&
          ["Rejected", "Suspended", "Removed"].includes(action.status) &&
          !reason.trim()
        }
      >
        {action &&
          ["Rejected", "Suspended", "Removed"].includes(action.status) && (
            <div>
              <Field label={t("Decision reason")}>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
            </div>
          )}
      </Confirm>
    </>
  );
}
export function ProviderApproval() {
  useLanguage();
  const { data, update, toast, session } = useStore();
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState("");
  function act(status: string) {
    if (
      ["Rejected", "Suspended", "Needs Information"].includes(status) &&
      !reason.trim()
    ) {
      toast("Add a rejection reason first.");
      return;
    }
    update((d) => ({
      ...d,
      providerStatus: status,
      records: {
        ...d.records,
        providerReviewReason: reason,
        providerReviewedAt: new Date().toISOString(),
      },
      domainStatus: status === "Verified" ? "Verified" : "Unverified",
      audit: [
        {
          id: crypto.randomUUID(),
          entity: d.records.organization || "Demo Provider",
          action: status,
          reason: reason || "Verified in demo",
          actor: session?.name || "Admin",
          at: new Date().toISOString(),
        },
        ...d.audit,
      ],
    }));
    toast(`Provider ${status.toLowerCase()}.`);
  }
  return (
    <>
      <h1 className="hub-page-heading">
        {t("Provider Verification Approval")}
      </h1>
      <p className="hub-subtitle">
        {t("Review organization identity and domain ownership.")}
      </p>
      <Panel>
        <h2 className="text-xl">
          {t(data.records.organization || "Demo Provider")}
        </h2>
        <p className="text-sm my-4">
          {t(data.records.domain || "No verification request submitted")}
        </p>
        <span className="hub-badge">{t(data.providerStatus)}</span>
        <p className="text-sm my-4">
          {t(data.records.providerType || "Organization")} ·{" "}
          {data.records.providerContact} · {data.records.providerPhone}
        </p>
        <Field label={t("Review notes / rejection reason")}>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <div className="flex gap-3">
          <Button
            className="primary"
            disabled={!data.records.domain}
            onClick={() => act("Verified")}
          >
            {t("Approve Provider")}
          </Button>
          <Button
            disabled={!data.records.domain}
            onClick={() => act("Rejected")}
          >
            {t("Reject")}
          </Button>
          <Button
            disabled={!data.records.domain || !reason.trim()}
            onClick={() => act("Needs Information")}
          >
            {t("Request More Information")}
          </Button>
          {data.providerStatus === "Verified" && (
            <Button onClick={() => setDecision("Suspended")}>
              {t("Suspend Provider")}
            </Button>
          )}
          {data.providerStatus === "Suspended" && (
            <Button onClick={() => setDecision("Verified")}>
              {t("Restore Provider")}
            </Button>
          )}
        </div>
      </Panel>
      <Confirm
        title={t("Change provider access?")}
        description={t(
          "Record a review reason. Verification and publishing remain subject to administrator review.",
        )}
        open={!!decision}
        disabled={!reason.trim()}
        onClose={() => setDecision("")}
        onConfirm={() => {
          act(decision);
          setDecision("");
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
