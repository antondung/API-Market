import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Field } from "../components/ui";
import { t, useLanguage } from "../i18n";
import {
  authError,
  clearAuth,
  registerAccount,
  restoreAuth,
  safeReturnTo,
  signIn,
} from "../lib/auth-api";
import type { Role } from "../lib/types";
import { useStore } from "./store";

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
    if ((register && password.length < 12) || password.length > 128) {
      setError("Registration passwords must contain 12 to 128 characters.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
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
    } catch (reason) {
      clearAuth();
      setError(authError(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-art">
        <span className="hub-badge">{t("SECURE API WORKSPACE")}</span>
        <h1 className="mt-6">
          {t("Build with clarity.")}
          <br />
          <span className="text-primary">{t("Scale with confidence.")}</span>
        </h1>
        <p>{t("One account for discovering, publishing and managing APIs.")}</p>
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
            <Field label="Full name">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                autoComplete="name"
              />
            </Field>
          )}
          <Field label="Email address">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder={t("you@company.com")}
            />
          </Field>
          <Field label="Password">
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                maxLength={128}
                autoComplete={register ? "new-password" : "current-password"}
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
          {register && (
            <>
              <Field label="I want to…">
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                >
                  <option value="consumer">{t("Consume APIs")}</option>
                  <option value="provider">{t("Provide APIs")}</option>
                </select>
              </Field>
              <Field label="Confirm password">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  maxLength={128}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </Field>
              <label className="flex gap-3 text-sm my-5">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(event) => setTerms(event.target.checked)}
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
                ? "Please wait…"
                : register
                  ? "Create account"
                  : "Sign in to workspace",
            )}
          </Button>
        </form>
        <p className="text-body-md mt-5">
          {t(register ? "Already have an account?" : "New to API HUB?")}{" "}
          <Link className="text-primary" to={register ? "/login" : "/register"}>
            {t(register ? "Sign in" : "Create account")}
          </Link>
        </p>
      </section>
    </div>
  );
}
