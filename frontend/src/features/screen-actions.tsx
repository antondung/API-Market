import { t, useLanguage } from "../i18n";
import { useState } from "react";
import type { MouseEvent, ChangeEvent, KeyboardEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "./store";
import { Button, Field, Modal } from "../components/ui";
const links: Record<string, string> = {
  marketplace: "/marketplace",
  "explore-apis": "/marketplace",
  documentation: "/apis/neural-llm/docs",
  pricing: "/pricing",
  login: "/login",
  overview: "/app/overview",
  "my-apis": "/app/subscriptions",
  "api-keys": "/app/keys",
  "usage-and-quota": "/app/usage",
  "request-history": "/app/requests",
  "create-api": "/provider/apis/new",
  "pricing-plans": "/provider/plans",
  analytics: "/provider/analytics",
  verification: "/provider/verification",
  users: "/admin/users",
  providers: "/admin/providers",
  reports: "/admin/reports",
  "audit-log": "/admin/audit",
  provider: "/provider/overview",
  dashboard: "/app/overview",
};
export function useScreenActions() {
  useLanguage();
  const { data, update, toast, session, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialog, setDialog] = useState<{
    action: string;
    entity: string;
    record: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  function visible(id: string, original: boolean) {
    if (id in groups) return groups[id] === "show";
    const family = id.match(
      /^(stage|state|tab|content|panel|view|rcontent|rbody|detail|drawer-tab)[-_](.+)$/,
    );
    if (family && groups[family[1]]) return family[2] === groups[family[1]];
    return original;
  }
  function setGroup(name: string, value: string) {
    const prefix = name.includes("Stage")
      ? "stage"
      : name.includes("ReqTab")
        ? "rcontent"
        : name.includes("RespTab")
          ? "rbody"
          : name.includes("State")
            ? "state"
            : "tab";
    setGroups((g) => ({
      ...g,
      [prefix]: value,
      content: value,
      panel: value,
      view: value,
      detail: value,
    }));
  }
  function matches(text: string) {
    return (
      (
        text +
        " " +
        text
          .split(/\s+/)
          .map((part) => t(part))
          .join(" ")
      )
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || text.toLowerCase().includes(filter))
    );
  }
  function recordText(record: string, text: string) {
    return t(data.records[location.pathname + ":" + record] || text);
  }
  function text(value: string) {
    if (location.pathname === "/app/overview") {
      if (value === "3")
        return String(
          data.subscriptions.filter((s) => s.status === "Active").length,
        );
      if (value === "Welcome back, Alex")
        return t(`Welcome back, ${session?.name.split(" ")[0] || "Developer"}`);
      if (value === "/ $200 limit") return t(`/ $${data.budget} limit`);
      if (
        value ===
        "Here is a real-time overview of your API consumption and active endpoints."
      )
        return t(
          "Overview of your demo workspace. Traffic and billing charts show sample data.",
        );
    }
    return t(value);
  }
  function mutate(action: string, entity: string, record: string) {
    setReason("");
    setError("");
    setDialog({ action, entity, record });
  }
  function execute() {
    if (!dialog) return;
    if (
      /reject|suspend|remove|revoke|cancel/i.test(dialog.action) &&
      !reason.trim()
    ) {
      setError("Please give a reason for this action.");
      return;
    }
    const status = /approve/i.test(dialog.action)
      ? "Approved"
      : /reject/i.test(dialog.action)
        ? "Rejected"
        : /restore/i.test(dialog.action)
          ? "Active"
          : /suspend|block/i.test(dialog.action)
            ? "Suspended"
            : /remove|delete/i.test(dialog.action)
              ? "Removed"
              : /review/i.test(dialog.action)
                ? "Under Review"
                : /cancel/i.test(dialog.action)
                  ? "Cancelled"
                  : "Updated";
    update((d) => ({
      ...d,
      records: {
        ...d.records,
        [location.pathname + ":" + dialog.record]: status,
      },
      audit: [
        {
          id: crypto.randomUUID(),
          entity: dialog.entity,
          action: dialog.action,
          reason: reason || "Demo operation",
          actor: session?.name || "Demo user",
          at: new Date().toISOString(),
        },
        ...d.audit,
      ],
    }));
    toast(
      `${dialog.action}: ${dialog.entity}. Saved in the local demo audit trail.`,
    );
    setDialog(null);
  }
  async function click(event: MouseEvent<HTMLElement>) {
    const el = (event.target as HTMLElement).closest<HTMLElement>(
      "button,a,[data-handler],[role=button]",
    );
    if (!el) return;
    const handler = el.dataset.handler || "";
    const text = el.dataset.actionText || el.textContent?.trim() || "";
    const row = el.closest<HTMLElement>("[data-record]");
    const record = row?.dataset.record || "selection";
    const entity = row?.querySelector("td")?.textContent?.trim() || text;
    if (el instanceof HTMLAnchorElement) event.preventDefault();
    if (/Generate.*API Key|Manage API Keys/.test(text)) {
      navigate("/app/keys");
      return;
    }
    if (/View all APIs|View All APIs/.test(text)) {
      navigate(
        session?.role === "provider"
          ? "/provider/apis"
          : session?.role === "admin"
            ? "/admin/apis"
            : "/app/subscriptions",
      );
      return;
    }
    if (/Explore APIs/.test(text)) {
      navigate("/marketplace");
      return;
    }
    if (
      /^(Sign in|Sign In|Log in|Login|Create account|Create Account|Register)/.test(
        text,
      )
    ) {
      navigate(/Create|Register/.test(text) ? "/register" : "/login");
      return;
    }
    if (/Back to Dashboard|Go to Dashboard|Return to Dashboard/.test(text)) {
      navigate(
        session?.role === "admin"
          ? "/admin/overview"
          : session?.role === "provider"
            ? "/provider/overview"
            : "/app/overview",
      );
      return;
    }
    if (text === "Search") {
      navigate("/marketplace?q=" + encodeURIComponent(query));
      return;
    }
    if (/Manage Quota Alerts/.test(text)) {
      navigate("/app/cost-guard");
      return;
    }
    if (el.dataset.path) {
      navigate(links[el.dataset.path] || "/marketplace");
      return;
    }
    const call = handler.match(
      /(?:switch(?:Stage|Tab|State|SubState|ReqTab|RespTab|DetailTab|DrawerTab)|setMockState|setErrorState)\(([^)]*)\)/,
    );
    if (call) {
      const name = handler.slice(0, handler.indexOf("("));
      setGroup(name, call[1].replace(/['"\s]/g, ""));
      return;
    }
    if (/filter(?:Table|Queue|Method|States)/.test(handler)) {
      const value = handler.match(/\('([^']+)'\)/)?.[1] || "all";
      setFilter(value);
      return;
    }
    if (/close|Cancel|^Back$/.test(text) || /^close/.test(handler)) {
      setDialog(null);
      setGroups((g) => ({
        ...g,
        [handler.match(/\('([^']+)'\)/)?.[1] || "drawer"]: "hide",
      }));
      return;
    }
    if (/copy|content_copy/i.test(handler + " " + text)) {
      const value =
        el.closest("pre")?.textContent ||
        el.parentElement?.querySelector("code")?.textContent ||
        "https://gateway.example.test/v4/chat/completions";
      try {
        await navigator.clipboard.writeText(value);
        toast("Copied demo data. No secret credentials included.");
      } catch {
        mutate("Copy manually", value, record);
      }
      return;
    }
    if (
      /password|visibility/.test(handler) &&
      el.parentElement?.querySelector("input[type=password],input[type=text]")
    ) {
      const input = el.parentElement.querySelector<HTMLInputElement>("input");
      if (input) input.type = input.type === "password" ? "text" : "password";
      return;
    }
    if (/download|Export|Generate Report/.test(text)) {
      const body = JSON.stringify(
        { demo: true, screen: location.pathname, audit: data.audit },
        null,
        2,
      );
      const url = URL.createObjectURL(
        new Blob([body], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "api-hub-demo-export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast("Downloaded local demo export.");
      return;
    }
    if (
      /Try API|Test in Playground|New API Request|Replay|play_arrow|Try Now|Send Request/.test(
        text,
      ) ||
      /executePlayground|triggerSend/.test(handler)
    ) {
      navigate("/apis/neural-llm/playground");
      return;
    }
    if (/View API|Open API|View Docs|Documentation|code/.test(text)) {
      navigate("/apis/neural-llm/docs");
      return;
    }
    if (/Create New API|Publish New API|Create API/.test(text)) {
      navigate("/provider/apis/new");
      return;
    }
    if (/Browse Files/.test(text)) {
      mutate(
        "Import OpenAPI",
        "Select a JSON specification in the OpenAPI import workspace.",
        record,
      );
      return;
    }
    if (/Subscribe|Upgrade|Get Started|Checkout/.test(text)) {
      navigate("/checkout");
      return;
    }
    if (/Manage Keys/.test(text)) {
      navigate("/app/keys");
      return;
    }
    if (/View All Logs|View detailed logs/.test(text)) {
      navigate("/app/requests");
      return;
    }
    if (/Logout|simulateLogout/.test(handler + " " + text)) {
      logout();
      navigate("/login");
      return;
    }
    if (/reset/i.test(handler + " " + text)) {
      setQuery("");
      setFilter("all");
      setGroups({});
      toast("View reset.");
      return;
    }
    if (/nextStage|prevStage/.test(handler)) {
      const stage =
        Number(groups.stage || 1) + (handler.includes("prev") ? -1 : 1);
      setGroup("switchStage", String(Math.max(1, stage)));
      return;
    }
    if (/mark all as read/i.test(text)) {
      update((d) => ({ ...d, unread: 0 }));
      toast("All demo notifications marked as read.");
      return;
    }
    if (/setTheme/.test(handler)) {
      document.documentElement.classList.toggle(
        "dark",
        handler.includes("dark"),
      );
      toast("Theme preview changed.");
      return;
    }
    if (/Save|saveChanges|savePlan/.test(text + " " + handler)) {
      mutate("Save settings", entity, record);
      return;
    }
    if (
      /Approve|Reject|Suspend|Restore|Remove|Revoke|Publish|Submit|triggerAction|openActionModal|confirm|executeAction|block/.test(
        handler + " " + text,
      )
    ) {
      const action =
        handler.match(/(?:triggerAction|openActionModal)\('([^']+)'/)?.[1] ||
        text;
      mutate(action, entity, record);
      return;
    }
    if (
      /Inspect|Review|View|Edit|Configure|openDrawer|openUserDrawer|openEditor|openModal|open.*Modal|Provision|Add Endpoint|Invite/.test(
        handler + " " + text,
      )
    ) {
      mutate(
        /Edit|Configure|Provision|Add|Invite/.test(text)
          ? text
          : "Review details",
        row?.textContent?.trim() || handler.match(/\('([^']+)'/)?.[1] || text,
        record,
      );
      return;
    }
    if (el instanceof HTMLAnchorElement) {
      const label = text.toLowerCase();
      navigate(
        label.includes("profile")
          ? "/app/profile"
          : label.includes("provider")
            ? "/provider/overview"
            : label.includes("plan")
              ? "/pricing"
              : label.includes("dashboard")
                ? "/app/overview"
                : "/marketplace",
      );
      return;
    }
    if (handler.includes("scrollIntoView")) {
      document
        .getElementById("section-buttons")
        ?.scrollIntoView({ behavior: "auto" });
      return;
    }
    setGroups((g) => ({
      ...g,
      tab: text.toLowerCase(),
      state: text.toLowerCase(),
    }));
    toast(`Selected ${text.replace(/^[a-z_]+ /, "")}. Demo view updated.`);
  }
  function change(event: ChangeEvent<HTMLElement>) {
    const input = event.target as HTMLInputElement;
    if (
      input.type === "search" ||
      /search|filter/i.test(
        input.dataset.sourcePlaceholder || input.placeholder || "",
      )
    )
      setQuery(input.value);
  }
  function keydown(event: KeyboardEvent<HTMLElement>) {
    if (
      (event.key === "Enter" || event.key === " ") &&
      (event.target as HTMLElement).getAttribute("role") === "button"
    ) {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    toast("Demo form validated. Changes stay in this browser.");
  }
  const overlay = (
    <Modal
      title={t(dialog?.action || "Details")}
      open={!!dialog}
      onClose={() => setDialog(null)}
    >
      <p className="my-5 text-body-md break-words">{t(dialog?.entity)}</p>
      <p className="text-body-sm text-on-surface-variant">
        {t("Current local status: ")}
        {t(
          dialog
            ? data.records[location.pathname + ":" + dialog.record] ||
                "Unchanged"
            : "",
        )}
        {t(
          ". Important actions are added to the demo audit trail; they do not affect a live API.",
        )}
      </p>
      <Field label={t("Reason / notes")}>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />
      </Field>
      {error && (
        <p className="inline-error" role="alert">
          {t(error)}
        </p>
      )}
      <div className="flex justify-end gap-3 mt-5">
        <Button onClick={() => setDialog(null)}>{t("Cancel")}</Button>
        <Button className="primary" onClick={execute}>
          {t("Confirm local change")}
        </Button>
      </div>
    </Modal>
  );
  return {
    visible,
    matches,
    recordText,
    text,
    click,
    change,
    keydown,
    submit,
    overlay,
  };
}
