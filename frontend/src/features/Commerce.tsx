import { t, useLanguage, locale } from "../i18n";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Confirm, Field, Modal } from "../components/ui";
import { useStore } from "./store";
import { planLimits } from "../lib/contracts";
export function Checkout() {
  useLanguage();
  const { data, update, session } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [api, setApi] = useState(
    data.apis.some((a) => a.id === params.get("api"))
      ? params.get("api")!
      : data.apis[0].id,
  );
  const [plan, setPlan] = useState(
    ["Free", "Developer", "Pro", "Provider Plan"].includes(
      params.get("plan") || "",
    )
      ? params.get("plan")!
      : "Developer",
  );
  const [billing, setBilling] = useState<"Monthly" | "Annual">(
    params.get("billing") === "Annual" ? "Annual" : "Monthly",
  );
  const [outcome, setOutcome] = useState("Success");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const selected = data.apis.find((a) => a.id === api)!;
  const providerPlan = data.drafts.find((d) => d.id === selected.id);
  const monthly = planLimits(data, selected.name, plan).price;
  const amount = billing === "Annual" ? monthly * 0.8 * 12 : monthly;
  async function pay() {
    if (busy || pending) return;
    setError("");
    if (selected.status !== "Published") {
      setError("This API is unavailable for subscription.");
      return;
    }
    if (!agreed) {
      setError("Accept the sandbox subscription terms to continue.");
      return;
    }
    if (
      data.subscriptions.some(
        (s) =>
          s.api === selected.name && s.status === "Active" && s.plan === plan,
      )
    ) {
      setError(
        "This API and plan are already active. Manage your existing subscription instead.",
      );
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    const subscriptionId = crypto.randomUUID();
    const at = new Date().toISOString();
    update((d) => ({
      ...d,
      transactions: [
        {
          id: crypto.randomUUID(),
          subscription: subscriptionId,
          api: selected.name,
          plan,
          amount,
          status: outcome,
          at,
        },
        ...d.transactions,
      ],
    }));
    if (outcome === "Failure") {
      setError(
        "Sandbox payment failed. No subscription was created. Choose another outcome to retry.",
      );
      return;
    }
    update((d) => ({
      ...d,
      subscriptions: [
        {
          id: subscriptionId,
          consumer: session?.email,
          api: selected.name,
          plan,
          billing,
          status: outcome === "Pending" ? "Pending" : "Active",
          createdAt: new Date().toISOString(),
        },
        ...d.subscriptions.filter((s) => s.api !== selected.name),
      ],
      unread: d.unread + 1,
      notifications: [
        {
          id: crypto.randomUUID(),
          title:
            outcome === "Pending"
              ? "Subscription activation pending"
              : "Sandbox subscription activated",
          role: "consumer",
          href: "/app/subscriptions",
          at,
          read: false,
        },
        ...d.notifications,
      ],
    }));
    if (outcome === "Pending") setPending(true);
    else navigate("/app/subscriptions?success=1");
  }
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <p className="text-xs uppercase tracking-widest text-primary mb-3">
        {t("Subscription checkout")}
      </p>
      <h1 className="hub-page-heading">
        {t("Start building with ")}
        {selected.name}
      </h1>
      <p className="hub-subtitle">
        {t(
          "Sandbox checkout. No real card, charge or payment processor is connected.",
        )}
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="hub-panel">
          <h2 className="text-xl mb-4">{t("Subscription details")}</h2>
          <Field label={t("API")}>
            <select
              value={api}
              onChange={(e) => {
                setApi(e.target.value);
                if (plan === "Provider Plan") setPlan("Developer");
              }}
            >
              {data.apis.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>{" "}
          </Field>
          <Field label={t("Billing period")}>
            <select
              value={billing}
              onChange={(e) =>
                setBilling(e.target.value as "Monthly" | "Annual")
              }
            >
              <option value={"Monthly"}>{t("Monthly")}</option>
              <option value={"Annual"}>{t("Annual")}</option>
            </select>
          </Field>
          <Field label={t("Plan")}>
            <select value={plan} onChange={(e) => setPlan(e.target.value)}>
              {[
                "Free",
                "Developer",
                "Pro",
                ...(providerPlan ? ["Provider Plan"] : []),
                ...data.managed
                  .filter(
                    (p) =>
                      p.kind === "plans" &&
                      p.api === selected.name &&
                      p.status === "Active" &&
                      !["Free", "Developer", "Pro"].includes(p.name),
                  )
                  .map((p) => p.name),
              ].map((p) => (
                <option key={p} value={p}>
                  {t(p)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Sandbox payment result")}>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              {["Success", "Failure", "Pending"].map((v) => (
                <option key={v} value={v}>
                  {t(v)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="hub-panel">
          <h2 className="text-xl">{t("Order summary")}</h2>
          <div className="text-4xl font-semibold my-6">
            {t("            $")}
            {t(amount.toFixed(2))}
            <small className="text-sm font-normal text-on-surface-variant">
              {t("               / ")}
              {t(billing === "Annual" ? "year" : "month")}
              {t(" \u00B7 demo")}
            </small>
          </div>
          <p className="text-sm text-on-surface-variant mb-6">
            {selected.name}
            <br />
            {t("Monthly API access, usage analytics and key management.")}
          </p>
          <p className="text-sm mb-5">
            {t("Monthly quota")}:{" "}
            {planLimits(data, selected.name, plan).quota.toLocaleString(
              locale(),
            )}{" "}
            · {t("Rate limit / minute")}:{" "}
            {planLimits(data, selected.name, plan).rate}
          </p>
          <label className="flex gap-3 text-sm my-5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            {t("I accept the sandbox subscription terms.")}
          </label>
          {error && (
            <p role="alert" className="inline-error">
              {t(error)}
            </p>
          )}
          {pending ? (
            <p role="status">
              {t("Payment pending. Track this subscription in ")}
              <Link className="text-primary underline" to="/app/subscriptions">
                {t("My APIs")}
              </Link>
              {t(".")}
            </p>
          ) : (
            <Button className="primary w-full" disabled={busy} onClick={pay}>
              {t(
                busy
                  ? "Processing…"
                  : plan === "Free"
                    ? "Activate free plan"
                    : "Confirm sandbox payment",
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
export function Subscriptions() {
  useLanguage();
  const { data, update, toast } = useStore();
  const [cancel, setCancel] = useState("");
  const [edit, setEdit] = useState("");
  const [plan, setPlan] = useState("Developer");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  return (
    <>
      <div className="flex justify-between flex-wrap gap-3 mb-7">
        <div>
          <h1 className="hub-page-heading">{t("My APIs & Subscriptions")}</h1>
          <p className="hub-subtitle">
            {t("Manage your active integrations, plans and renewal status.")}
          </p>
        </div>
        <Link to="/marketplace" className="hub-button primary self-start">
          {t("Explore APIs")}
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Field label={t("Search subscriptions")}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </Field>
        <Field label={t("Status filter")}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("All")}</option>
            {["Active", "Pending", "Expired", "Suspended", "Cancelled"].map(
              (v) => (
                <option key={v} value={v}>
                  {t(v)}
                </option>
              ),
            )}
          </select>
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {data.subscriptions
          .filter(
            (s) =>
              (!status || s.status === status) &&
              (s.api + " " + t(s.plan))
                .toLowerCase()
                .includes(search.toLowerCase()),
          )
          .map((s) => (
            <div className="hub-panel" key={s.id}>
              <div className="flex justify-between">
                <h2 className="text-xl">{t(s.api)}</h2>
                <span className="hub-badge">{t(s.status)}</span>
              </div>
              <p className="my-4 text-sm text-on-surface-variant">
                {t(s.plan)}
                {t(" plan \u00B7 Created ")}
                {t(new Date(s.createdAt).toLocaleDateString(locale()))}
              </p>
              <p className="text-sm mb-4">
                {t("Monthly quota")}:{" "}
                {planLimits(data, s.api, s.plan).quota.toLocaleString(locale())}{" "}
                · {t("Rate limit / minute")}:{" "}
                {planLimits(data, s.api, s.plan).rate}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="hub-button"
                  to={`/apis/neural-llm?api=${data.apis.find((a) => a.name === s.api)?.id || ""}`}
                >
                  {t("View API")}
                </Link>
                <Link
                  className="hub-button"
                  to={`/apis/neural-llm/playground?api=${data.apis.find((a) => a.name === s.api)?.id || ""}`}
                >
                  {t("Open Playground")}
                </Link>
                <Link className="hub-button" to="/app/usage">
                  {t("View Usage")}
                </Link>
                <Link className="hub-button" to="/app/keys">
                  {t("Manage Keys")}
                </Link>
                <Button
                  disabled={s.status === "Cancelled"}
                  onClick={() => {
                    setEdit(s.id);
                    setPlan(s.plan);
                  }}
                >
                  {t("Change plan")}
                </Button>
                <Button
                  disabled={s.status === "Cancelled"}
                  onClick={() => setCancel(s.id)}
                >
                  {t("Cancel")}
                </Button>
                {s.status === "Pending" && (
                  <Button
                    onClick={() => {
                      update((d) => ({
                        ...d,
                        transactions: d.transactions.map((v) =>
                          v.subscription === s.id && v.status === "Pending"
                            ? { ...v, status: "Success" }
                            : v,
                        ),
                        subscriptions: d.subscriptions.map((v) =>
                          v.id === s.id ? { ...v, status: "Active" } : v,
                        ),
                      }));
                      toast("Sandbox payment completed.");
                    }}
                  >
                    {t("Complete demo payment")}
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
      {!data.subscriptions.length && (
        <div className="hub-panel text-center py-12">
          {t("No subscriptions yet. Explore the marketplace to start.")}
        </div>
      )}
      <Confirm
        title={t("Cancel subscription?")}
        description={t(
          "Cancel immediately in the local demo. Your API keys remain in the key history.",
        )}
        open={!!cancel}
        onClose={() => setCancel("")}
        onConfirm={() => {
          update((d) => ({
            ...d,
            subscriptions: d.subscriptions.map((s) =>
              s.id === cancel ? { ...s, status: "Cancelled" } : s,
            ),
          }));
          setCancel("");
          toast("Subscription cancelled.");
        }}
      />
      <Modal title={t("Change plan")} open={!!edit} onClose={() => setEdit("")}>
        <Field label={t("New plan")}>
          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            {["Free", "Developer", "Pro"].map((v) => (
              <option key={v} value={v}>
                {t(v)}
              </option>
            ))}
          </select>
        </Field>
        <Button
          className="primary"
          onClick={() => {
            update((d) => ({
              ...d,
              subscriptions: d.subscriptions.map((s) =>
                s.id === edit ? { ...s, plan } : s,
              ),
            }));
            setEdit("");
            toast("Plan updated in sandbox.");
          }}
        >
          {t("Confirm plan change")}
        </Button>
      </Modal>
    </>
  );
}
