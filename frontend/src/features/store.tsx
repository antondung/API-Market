import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "../lib/types";
import {
  authError,
  clearAuth,
  hasAuth,
  refreshAuth,
  restoreAuth,
  signOut,
} from "../lib/auth-api";
import { Context } from "./context";
export { useStore } from "./context";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    if (!hasAuth()) {
      setReady(true);
      return;
    }
    restoreAuth()
      .then((value) => {
        if (active) setSession(value);
      })
      .catch((error) => {
        if (active) {
          clearAuth();
          setNotice(authError(error));
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => {
        refreshAuth()
          .then(setSession)
          .catch((error) => {
            clearAuth();
            setSession(null);
            setNotice(authError(error));
          });
      },
      Math.max(0, session.expiresAt - Date.now() - 60_000),
    );
    return () => clearTimeout(timer);
  }, [session]);
  const logout = () => {
    setReady(false);
    void signOut()
      .then(() => setNotice("Signed out."))
      .catch(() =>
        setNotice("Signed out locally. The backend could not be reached."),
      )
      .finally(() => {
        setSession(null);
        setReady(true);
      });
  };
  return (
    <Context.Provider
      value={{ session, ready, login: setSession, logout, notice }}
    >
      {children}
    </Context.Provider>
  );
}
