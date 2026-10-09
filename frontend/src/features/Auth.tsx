import { t, useLanguage } from "../i18n";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "./store";
import { safeReturnTo } from "../lib/demo";
import type { Role } from "../lib/types";
import { Button, Field } from "../components/ui";
import { backendEnabled } from "../lib/api-client";
import {
  registerAccount,
  signIn,
  restoreAuth,
  clearAuth,
  authError,
} from "../lib/auth-api";
export default function Auth({ register = false }: { register?: boolean }) {
  useLanguage();

  const { login } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("consumer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [terms, setTerms] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (register && password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (register && !terms) {
      setError("Accept the account terms to continue.");
      return;
    }
    if (
      backendEnabled
        ? (register && password.length < 12) || password.length > 128
        : password.length < 8
    ) {
      setError(
        backendEnabled
          ? "Registration passwords must contain 12 to 128 characters."
          : "Use at least 8 characters for the demo password.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    if (backendEnabled) {
      try {
        if (register) {
          await registerAccount(name.trim(), email.trim(), password, role);
          setSuccess("Account created. Sign in to continue.");
          setPassword("");
          setConfirmation("");
          return;
        }
        await signIn(email.trim(), password);
        const identity = await restoreAuth();
        login(identity);
        const fallback =
          identity.role === "admin"
            ? "/admin/overview"
            : identity.role === "provider"
              ? "/provider/overview"
              : "/app/overview";
        const returnTo = safeReturnTo(params.get("returnTo"), fallback);
        const targetRole = returnTo.startsWith("/admin/")
          ? "admin"
          : returnTo.startsWith("/provider/")
            ? "provider"
            : returnTo.startsWith("/app/")
              ? "consumer"
              : identity.role;
        navigate(targetRole === identity.role ? returnTo : fallback);
      } catch (error) {
        clearAuth();
        setError(authError(error));
      } finally {
        setBusy(false);
      }
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
    login({
      name: name || email.split("@")[0],
      email,
      role,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });
    navigate(
      safeReturnTo(
        params.get("returnTo"),
        role === "admin"
          ? "/admin/overview"
          : role === "provider"
            ? "/provider/overview"
            : "/app/overview",
      ),
    );
  }
  function demoLogin(value: Role) {
    login({
      name: "Alex Developer",
      email: `${value}@demo.apihub.test`,
      role: value,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });
    navigate(
      safeReturnTo(
        params.get("returnTo"),
        value === "admin"
          ? "/admin/overview"
          : value === "provider"
            ? "/provider/overview"
            : "/app/overview",
      ),
    );
  }
  return (
    <div className="auth-layout">
      <section className="auth-art">
        <span className="hub-badge">{t("DEVELOPER-FIRST INFRASTRUCTURE")}</span>
        <h1 className="mt-6">
          {t("Build with clarity.")}
          <br />
          <span className="text-primary">{t("Scale with confidence.")}</span>
        </h1>
        <p>
          {t("One workspace to discover APIs, test integrations")}
          <br />
          {t("and keep your usage under control.")}
        </p>
        <div className="terminal">
          <span className="text-emerald-400">{t("$")}</span>{" "}
          {t(" apihub connect")}
          <br />
          <span className="text-slate-400">
            {t("// Discover → Test → Integrate → Monitor")}
          </span>
          <br />
          {t("Workspace ready. Let’s build.")}
        </div>
      </section>
      <section className="auth-form">
        <h2 className="text-headline-md font-headline-md">
          {t(
            register
              ? "Create your API HUB account"
              : "Welcome back to API HUB",
          )}
        </h2>
        <p className="text-on-surface-variant text-body-md mt-2">
          {t(
            register
              ? "Choose your workspace and get started."
              : "Sign in to continue to your workspace.",
          )}
        </p>
        <form onSubmit={submit}>
          {register && (
            <Field label={t("Full name")}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                maxLength={backendEnabled ? 100 : undefined}
              />
            </Field>
          )}
          <Field label={t("Email address")}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={t("you@company.com")}
            />
          </Field>
          <Field label={t("Password")}>
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={register ? "new-password" : "current-password"}
                maxLength={backendEnabled ? 128 : undefined}
              />
              <Button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={t(show ? "Hide password" : "Show password")}
              >
                {t(show ? "Hide" : "Show")}
              </Button>
            </div>
          </Field>
          {(register || !backendEnabled) && (
            <Field label={t(register ? "I want to…" : "Demo workspace role")}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="consumer">{t("Consume APIs")}</option>
                <option value="provider">{t("Provide APIs")}</option>
                {!register && (
                  <option value="admin">{t("Admin · demo only")}</option>
                )}
              </select>
            </Field>
          )}
          {register && (
            <>
              <Field label={t("Confirm password")}>
                <input
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </Field>
              <label className="flex gap-3 text-sm my-5">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                {t("I accept the account terms and privacy notice.")}
              </label>
            </>
          )}
          {error && (
            <p role="alert" className="inline-error">
              {t(error)}
            </p>
          )}
          {success && (
            <p role="status" className="my-4">
              {t(success)}{" "}
              <Link to="/login" className="text-primary">
                {t("Sign in")}
              </Link>
            </p>
          )}
          <Button type="submit" className="primary w-full" disabled={busy}>
            {t(
              busy
                ? "Signing in…"
                : register
                  ? backendEnabled
                    ? "Create account"
                    : "Create demo account"
                  : "Sign in to workspace",
            )}
          </Button>
        </form>
        {!backendEnabled && (
          <p className="text-body-sm text-on-surface-variant mt-4">
            {t(
              "Demo mode: passwords are never sent or stored. Role selection here is only for previewing the frontend.",
            )}
          </p>
        )}
        <p className="text-body-md mt-5">
          {t(register ? "Already have an account?" : "New to API HUB?")}
          {t(" ")}
          <Link className="text-primary" to={register ? "/login" : "/register"}>
            {t(register ? "Sign in" : "Create account")}
          </Link>
        </p>
        {!backendEnabled && (
          <div className="border-t border-outline-variant/30 mt-6 pt-5">
            <p className="text-body-sm text-on-surface-variant mb-3">
              {t("Explore without entering credentials")}
            </p>
            <div className="flex flex-wrap gap-2">
              {(["consumer", "provider", "admin"] as const).map((r) => (
                <Button key={r} onClick={() => demoLogin(r)}>
                  {t(r)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
