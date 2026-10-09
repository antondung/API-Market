import { t, useLanguage, locale } from "../i18n";
import { useState } from "react";
import { Button, Field, Panel, Modal, Confirm } from "../components/ui";
import { useStore } from "./store";
import type { ManagedRecord } from "../lib/types";
export function Management({
  kind,
}: {
  kind: "endpoints" | "plans" | "users";
}) {
  useLanguage();
  const { data, update, toast, session } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [edit, setEdit] = useState<ManagedRecord | null>(null);
  const [remove, setRemove] = useState<ManagedRecord | null>(null);
  const titles = {
    endpoints: "Endpoints & Versions",
    plans: "Pricing Plan Management",
    users: "User Management",
  };
  const [error, setError] = useState("");
  const rows = data.managed.filter(
    (r) =>
      r.kind === kind &&
      (filter === "All" || r.status === filter) &&
      (r.name + r.detail + t(r.status))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const set = (key: keyof ManagedRecord, value: string | number) =>
    setEdit((r) => (r ? { ...r, [key]: value } : r));
  function save() {
    if (!edit) return;
    if (!edit.name.trim() || !edit.detail.trim()) {
      setError("Complete the name and details.");
      return;
    }
    if (
      kind === "endpoints" &&
      !/^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD) \/\S*$/.test(edit.name)
    ) {
      setError("Use an endpoint such as POST /v1/messages.");
      return;
    }
    if (kind === "users" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edit.detail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (
      !Number.isFinite(edit.value) ||
      !Number.isFinite(edit.quota) ||
      edit.value < 0 ||
      edit.quota < 0 ||
      (kind === "plans" &&
        (!Number.isFinite(edit.rate ?? 60) || (edit.rate ?? 60) < 1))
    ) {
      setError("Values must not be negative.");
      return;
    }
    if (
      kind === "endpoints" &&
      data.managed.some(
        (r) =>
          r.kind === kind &&
          r.id !== edit.id &&
          r.name === edit.name &&
          r.api === edit.api &&
          r.version === edit.version &&
          r.status !== "Archived",
      )
    ) {
      setError("This method and path already exist in the selected version.");
      return;
    }
    if (kind === "endpoints" && edit.schema) {
      try {
        const schema = JSON.parse(edit.schema);
        if (!schema || typeof schema !== "object" || Array.isArray(schema))
          throw new Error();
      } catch {
        setError("Request and response schemas must be a JSON object.");
        return;
      }
    }
    update((d) => ({
      ...d,
      managed: [edit, ...d.managed.filter((r) => r.id !== edit.id)],
      audit: [
        {
          id: crypto.randomUUID(),
          entity: edit.name,
          action: `Save ${kind}`,
          reason: "Local demo management",
          actor: session?.name || "Demo",
          at: new Date().toISOString(),
        },
        ...d.audit,
      ],
    }));
    setEdit(null);
    toast("Record saved.");
  }
  return (
    <>
      <div className="flex justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="hub-page-heading">{t(titles[kind])}</h1>
          <p className="hub-subtitle">
            {t("Manage ")}
            {t(
              kind === "endpoints"
                ? "API contracts and version metadata"
                : kind === "plans"
                  ? "pricing, quotas and plan availability"
                  : "demo user records and account status",
            )}
            {t(".")}
          </p>
        </div>
        <Button
          className="primary self-start"
          onClick={() => {
            setError("");
            setEdit({
              id: crypto.randomUUID(),
              kind,
              name: "",
              detail: "",
              status: "Active",
              value: 0,
              quota: kind === "plans" ? 1000 : 0,
              api: data.apis[0]?.name,
              version: "v1.0",
              auth: "API Key",
              schema: "{}",
              rate: 60,
              period: "Monthly",
              role: "consumer",
            });
          }}
        >
          {t("Add ")}
          {t(
            kind === "endpoints"
              ? "Endpoint"
              : kind === "plans"
                ? "Plan"
                : "User",
          )}
        </Button>
      </div>
      <Panel>
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            aria-label={t("Search management records")}
            className="border border-outline-variant p-3 rounded flex-1"
            placeholder={t(`Search ${kind}…`)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="border border-outline-variant p-3 rounded"
            aria-label={t("Status filter")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", "Active", "Suspended", "Archived"].map((v) => (
              <option key={v} value={v}>
                {t(v)}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low text-left">
                <th className="p-4">
                  {t(kind === "endpoints" ? "Method / path" : "Name")}
                </th>
                <th>{t("Details")}</th>
                {kind !== "users" && (
                  <th>
                    {t(
                      kind === "plans" ? "Price / quota" : "Rate limit / quota",
                    )}
                  </th>
                )}
                <th>{t("Status")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-outline-variant/20">
                  <td className="p-4 font-medium">{r.name}</td>
                  <td>{r.detail}</td>
                  {kind !== "users" && (
                    <td>
                      {t(kind === "plans" ? "$" : "")}
                      {t(r.value)}
                      {t(" / ")}
                      {t(r.quota.toLocaleString(locale()))}
                    </td>
                  )}
                  <td>
                    <span className="hub-badge">{t(r.status)}</span>
                    <p className="text-xs mt-2">
                      {kind === "users"
                        ? t(r.role || "consumer")
                        : kind === "endpoints"
                          ? `${r.version || "v1.0"} · ${t(r.auth || "API Key")}`
                          : `${r.rate ?? 60} ${t("requests / minute")}`}
                    </p>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setError("");
                          setEdit(r);
                        }}
                      >
                        {t("Edit")}
                      </Button>
                      <Button
                        disabled={r.status === "Archived"}
                        onClick={() => setRemove(r)}
                      >
                        {t("Archive")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <p className="text-center py-12">{t("No matching records.")}</p>
        )}
      </Panel>
      <Modal
        title={t(`Edit ${kind}`)}
        open={!!edit}
        onClose={() => setEdit(null)}
      >
        {edit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <Field
              label={t(
                kind === "endpoints" ? "Method / endpoint path" : "Name",
              )}
            >
              <input
                required
                value={edit.name}
                placeholder={t(kind === "endpoints" ? "POST /v1/messages" : "")}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field
              label={t(
                kind === "users" ? "Email address" : "Description / version",
              )}
            >
              <input
                required
                type={kind === "users" ? "email" : "text"}
                value={edit.detail}
                onChange={(e) => set("detail", e.target.value)}
              />
            </Field>
            {kind !== "users" && (
              <Field label={t("API")}>
                <select
                  value={edit.api || data.apis[0]?.name}
                  onChange={(e) => set("api", e.target.value)}
                >
                  {data.apis.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                  {data.drafts
                    .filter((d) => !data.apis.some((a) => a.name === d.name))
                    .map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            {kind === "endpoints" && (
              <>
                <Field label={t("Version")}>
                  <input
                    required
                    value={edit.version || "v1.0"}
                    onChange={(e) => set("version", e.target.value)}
                  />
                </Field>
                <Field label={t("Authentication")}>
                  <select
                    value={edit.auth || "API Key"}
                    onChange={(e) => set("auth", e.target.value)}
                  >
                    {["API Key", "Bearer Token", "OAuth 2.0", "None"].map(
                      (v) => (
                        <option key={v} value={v}>
                          {t(v)}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
                <Field label={t("Request and response schemas (JSON)")}>
                  <textarea
                    rows={5}
                    className="font-code-md"
                    value={edit.schema || "{}"}
                    onChange={(e) => set("schema", e.target.value)}
                  />
                </Field>
                <p className="text-sm my-3">
                  {t(
                    "Changes to published contracts require review before becoming public.",
                  )}
                </p>
              </>
            )}
            {kind === "plans" && (
              <>
                <Field label={t("Rate limit / minute")}>
                  <input
                    type="number"
                    required
                    min="1"
                    value={edit.rate ?? 60}
                    onChange={(e) => set("rate", Number(e.target.value))}
                  />
                </Field>
                <p className="text-sm my-4">
                  {t(
                    "Plan changes can affect active subscribers. Prices are sandbox metadata only.",
                  )}
                </p>
              </>
            )}
            {kind === "users" && (
              <Field label={t("Workspace role")}>
                <select
                  value={edit.role || "consumer"}
                  onChange={(e) => set("role", e.target.value)}
                >
                  {["consumer", "provider", "admin"].map((v) => (
                    <option key={v} value={v}>
                      {t(v)}
                    </option>
                  ))}
                </select>
                <small>
                  {t(
                    "Demo record only. This does not grant server permissions.",
                  )}
                </small>
              </Field>
            )}
            {kind !== "users" && (
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={t(
                    kind === "plans"
                      ? "Price / month (USD)"
                      : "Rate limit / minute",
                  )}
                >
                  <input
                    min="0"
                    type="number"
                    value={edit.value}
                    onChange={(e) => set("value", Number(e.target.value))}
                  />
                </Field>
                <Field label={t("Monthly quota")}>
                  <input
                    min="0"
                    type="number"
                    value={edit.quota}
                    onChange={(e) => set("quota", Number(e.target.value))}
                  />
                </Field>
              </div>
            )}
            <Field label={t("Status")}>
              <select
                value={edit.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {["Active", "Suspended", "Archived"].map((v) => (
                  <option key={v} value={v}>
                    {t(v)}
                  </option>
                ))}
              </select>
            </Field>
            {error && (
              <p className="inline-error" role="alert">
                {t(error)}
              </p>
            )}
            <Button className="primary" type="submit">
              {t("Save changes")}
            </Button>
          </form>
        )}
      </Modal>
      <Confirm
        title={t("Archive record?")}
        description={t(
          "Keep the record in history and mark it archived. You can restore it by editing its status.",
        )}
        open={!!remove}
        onClose={() => setRemove(null)}
        onConfirm={() => {
          update((d) => ({
            ...d,
            managed: d.managed.map((r) =>
              r.id === remove?.id ? { ...r, status: "Archived" } : r,
            ),
          }));
          setRemove(null);
          toast("Record archived.");
        }}
      />
    </>
  );
}
export function Compliance() {
  useLanguage();
  const { data, update, toast } = useStore();
  const [proof, setProof] = useState(data.records.complianceProof || "");
  const [terms, setTerms] = useState(data.records.complianceTerms === "yes");
  const [ownership, setOwnership] = useState(
    data.records.ownershipType || "Own-developed",
  );
  const [classification, setClassification] = useState(
    data.records.dataClassification || "No personal data",
  );
  const [categories, setCategories] = useState<string[]>(
    (data.records.dataCategories || "").split(",").filter(Boolean),
  );
  const [token] = useState(
    data.records.domainToken || `api-hub-domain-${crypto.randomUUID()}`,
  );
  return (
    <>
      <h1 className="hub-page-heading">{t("Compliance & Ownership")}</h1>
      <p className="hub-subtitle">
        {t("Record supporting documentation and data declarations.")}
      </p>
      <Panel>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update((d) => ({
              ...d,
              records: {
                ...d.records,
                complianceProof: proof,
                complianceTerms: terms ? "yes" : "no",
                ownershipType: ownership,
                dataClassification: classification,
                dataCategories: categories.join(","),
                domainToken: token,
                agreementVersion: "demo-v1",
                agreementAcceptedAt: new Date().toISOString(),
              },
            }));
            toast("Compliance declaration saved.");
          }}
        >
          <Field label={t("Distribution rights")}>
            <select
              value={ownership}
              onChange={(e) => setOwnership(e.target.value)}
            >
              {["Own-developed", "Authorized third-party distribution"].map(
                (v) => (
                  <option key={v} value={v}>
                    {t(v)}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label={t("Data classification")}>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            >
              {["No personal data", "Personal data", "Sensitive data"].map(
                (v) => (
                  <option key={v} value={v}>
                    {t(v)}
                  </option>
                ),
              )}
            </select>
          </Field>
          {classification !== "No personal data" && (
            <fieldset className="mb-5">
              <legend className="mb-3 text-sm">{t("Data categories")}</legend>
              <div className="flex flex-wrap gap-4">
                {[
                  "Contact",
                  "Identifiers",
                  "Location",
                  "Finance",
                  "Authentication",
                  "Health",
                  "Other",
                ].map((v) => (
                  <label key={v} className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={categories.includes(v)}
                      onChange={(e) =>
                        setCategories(
                          e.target.checked
                            ? [...categories, v]
                            : categories.filter((c) => c !== v),
                        )
                      }
                    />
                    {t(v)}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <Field label={t("Documentation / evidence reference")}>
            <input
              required
              type="url"
              placeholder={t("https://example.com/compliance")}
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            />
          </Field>
          <label className="flex gap-3 text-sm my-6">
            <input
              required
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            {t("I confirm ownership and accuracy of this declaration.")}
          </label>
          <details className="my-5 text-sm">
            <summary>{t("Provider agreement · demo-v1")}</summary>
            <p className="mt-3">
              {t(
                "You declare authorized distribution, accurate documentation and data classification. Sensitive data requires administrator review. These sample terms must be replaced by approved platform terms before release.",
              )}
            </p>
          </details>
          <Button className="primary" type="submit">
            {t("Save declaration")}
          </Button>
        </form>
        <p className="text-xs text-on-surface-variant mt-5">
          {t(
            "Saving a declaration is not a compliance certification. Review is handled by administrators.",
          )}
        </p>
      </Panel>
      <Panel>
        <h2 className="text-xl mb-4">{t("Domain control")}</h2>
        <p className="text-sm mb-4">
          {data.records.domain || t("No domain submitted")} ·{" "}
          {t(data.domainStatus)}
        </p>
        <p className="text-sm mb-4">
          {t(
            "Add this TXT value to _api-hub on the declared domain. Verification requires a backend DNS check.",
          )}
        </p>
        <code className="block break-all bg-surface-container-low p-4 rounded">
          {token}
        </code>
        <Button
          className="mt-4"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(token);
              toast("Verification token copied.");
            } catch {
              toast("Copy the verification token manually.");
            }
          }}
        >
          {t("Copy token")}
        </Button>
        <p className="text-sm mt-5">
          {t("Domain control is not proof of legal ownership.")}
        </p>
        <p className="text-sm mt-3">
          {t("Agreement accepted")}:{" "}
          {data.records.agreementAcceptedAt
            ? new Date(data.records.agreementAcceptedAt).toLocaleString(
                locale(),
              )
            : t("Not submitted")}
        </p>
      </Panel>
    </>
  );
}
