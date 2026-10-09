import { useState } from "react";
import { Button, Confirm, Field, Panel } from "../components/ui";
import { t, useLanguage } from "../i18n";
import { useStore } from "./store";

export default function Profile() {
  useLanguage();
  const { session, logout } = useStore();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <h1 className="hub-page-heading">{t("My account")}</h1>
      <p className="hub-subtitle">
        {t("Your identity is managed by the API Hub backend.")}
      </p>
      <Panel>
        <h2 className="text-xl mb-4">{t("Personal information")}</h2>
        <Field label="Display name">
          <input readOnly value={session?.name || ""} />
        </Field>
        <Field label="Email address">
          <input readOnly type="email" value={session?.email || ""} />
        </Field>
        <Field label="Workspace role">
          <input readOnly value={t(session?.role)} />
        </Field>
        <p className="text-sm text-on-surface-variant">
          {t(
            "Profile editing will be enabled when the backend provides an account update endpoint.",
          )}
        </p>
      </Panel>
      <Panel>
        <h2 className="text-xl">{t("Session & Security")}</h2>
        <p className="hub-subtitle mt-3">
          {t(
            "Your session is renewed securely through the backend. Signing out revokes the current session.",
          )}
        </p>
        <Button onClick={() => setConfirm(true)}>{t("Sign out")}</Button>
      </Panel>
      <Confirm
        title="Sign out?"
        description="End your current session on this device."
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={logout}
      />
    </>
  );
}
