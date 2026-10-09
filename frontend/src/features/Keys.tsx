import { t, useLanguage, locale } from "../i18n";
import { useState } from "react";
import { useStore } from "./store";
import { Button, Field, Modal, Confirm } from "../components/ui";
export default function Keys() {
  useLanguage();
  const { data, update, toast } = useStore();
  const eligible = data.apis.filter(
    (a) =>
      a.status === "Published" &&
      data.subscriptions.some((s) => s.api === a.name && s.status === "Active"),
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [api, setApi] = useState(eligible[0]?.name || "");
  const [secret, setSecret] = useState("");
  const [action, setAction] = useState<{
    id: string;
    kind: "Rotate" | "Revoke";
  } | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [apiFilter, setApiFilter] = useState("");
  function create(oldId?: string) {
    const old = data.keys.find((k) => k.id === oldId);
    const id = crypto.randomUUID();
    const value = "demo_" + crypto.randomUUID().replaceAll("-", "");
    setSecret(value);
    update((d) => ({
      ...d,
      keys: [
        {
          id,
          name: old?.name || name || "Development key",
          api: old?.api || api,
          prefix: `demo_••••_${value.slice(-4)}`,
          status: "Active",
          createdAt: new Date().toISOString(),
          lastUsed: null,
        },
        ...d.keys.map((k) =>
          k.id === oldId ? { ...k, status: "Revoked" as const } : k,
        ),
      ],
    }));
    setOpen(true);
    setAction(null);
  }
  function close() {
    setOpen(false);
    setSecret("");
    setName("");
  }
  function confirm() {
    if (!action) return;
    if (action.kind === "Rotate") {
      const key = data.keys.find((k) => k.id === action.id);
      setApi(key?.api || api);
      setName(key?.name || name);
      create(action.id);
    } else {
      update((d) => ({
        ...d,
        keys: d.keys.map((k) =>
          k.id === action.id ? { ...k, status: "Revoked" } : k,
        ),
      }));
      toast("Key revoked in local demo.");
      setAction(null);
    }
  }
  return (
    <>
      <div className="flex justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="hub-page-heading">{t("API Keys & Credentials")}</h1>
          <p className="text-on-surface-variant text-sm">
            {t("Manage your key lifecycle. Full secrets are shown once.")}
          </p>
        </div>{" "}
        <Button
          className="primary"
          disabled={!eligible.length}
          onClick={() => setOpen(true)}
        >
          {t("          Generate New API Key")}
        </Button>
      </div>
      {!eligible.length && (
        <p className="inline-error">
          {t("Activate an API subscription before generating a key.")}
        </p>
      )}
      <div className="hub-panel">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("API filter")}>
            <select
              value={apiFilter}
              onChange={(e) => setApiFilter(e.target.value)}
            >
              <option value="">{t("All APIs")}</option>
              {Array.from(new Set(data.keys.map((k) => k.api))).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Status filter")}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">{t("All")}</option>
              {["Active", "Revoked"].map((v) => (
                <option key={v} value={v}>
                  {t(v)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <input
          className="border border-outline-variant rounded p-3 mb-5 w-full"
          aria-label={t("Search keys")}
          placeholder={t("Search API keys\u2026")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-surface-container-low">
                <th className="p-4">{t("Key name / API")}</th>
                <th>{t("Masked prefix")}</th>
                <th>{t("Status")}</th>
                <th>{t("Last used")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.keys
                .filter(
                  (k) =>
                    (!status || k.status === status) &&
                    (!apiFilter || k.api === apiFilter),
                )
                .filter((k) =>
                  (k.name + k.api).toLowerCase().includes(query.toLowerCase()),
                )
                .map((k) => (
                  <tr key={k.id} className="border-b border-outline-variant/20">
                    <td className="p-4">
                      <b>{k.name}</b>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {t(k.api)}
                      </p>
                    </td>
                    <td className="font-code-md">{k.prefix}</td>
                    <td>
                      <span className="hub-badge">{t(k.status)}</span>
                    </td>
                    <td>
                      {k.lastUsed
                        ? new Date(k.lastUsed).toLocaleString(locale())
                        : t("Never used")}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          disabled={k.status === "Revoked"}
                          onClick={() =>
                            setAction({ id: k.id, kind: "Rotate" })
                          }
                        >
                          {t("Rotate")}
                        </Button>
                        <Button
                          disabled={k.status === "Revoked"}
                          onClick={() =>
                            setAction({ id: k.id, kind: "Revoke" })
                          }
                        >
                          {t("Revoke")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!data.keys.length && (
          <p className="py-12 text-center">
            {t("No keys yet. Generate a key to start integrating.")}
          </p>
        )}
      </div>
      <Modal
        title={t(secret ? "Copy your new key now" : "Generate API key")}
        open={open}
        onClose={close}
      >
        {secret ? (
          <>
            <p className="text-sm text-on-surface-variant my-6">
              {t(
                "This secret cannot be viewed again after closing. Demo keys do not authenticate live requests.",
              )}
            </p>
            <textarea
              className="border rounded w-full p-3 font-code-md"
              aria-label={t("New key secret")}
              readOnly
              value={secret}
            />
            <Button
              className="primary mt-4"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(secret);
                  toast("Key copied.");
                } catch {
                  toast(
                    "Clipboard unavailable. Select and copy the key manually.",
                  );
                }
              }}
            >
              {t("Copy key")}
            </Button>
            <Button className="ml-3" onClick={close}>
              {t("I have saved the key")}
            </Button>
          </>
        ) : (
          <>
            <Field label={t("Key name")}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Production integration")}
              />
            </Field>
            <Field label={t("API / subscription")}>
              <select value={api} onChange={(e) => setApi(e.target.value)}>
                {eligible.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Button className="primary" onClick={() => create()}>
              {t("Create key")}
            </Button>
          </>
        )}
      </Modal>
      <Confirm
        title={t(`${action?.kind} API key?`)}
        description={t(
          action?.kind === "Rotate"
            ? "This demo rotates immediately and revokes the old key. Update integrations with the new key."
            : "Requests using this key will stop working. The record remains in the history.",
        )}
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
      />
    </>
  );
}
