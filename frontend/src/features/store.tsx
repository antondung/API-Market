import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Session, DemoData } from "../lib/types";
import { initialData } from "../lib/demo";
import { Context } from "./context";
import { backendEnabled } from "../lib/api-client";
import {
  restoreAuth,
  refreshAuth,
  signOut,
  hasAuth,
  clearAuth,
  authError,
} from "../lib/auth-api";
export { useStore } from "./context";
function read<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) || "null") as T) || fallback;
  } catch {
    return fallback;
  }
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    backendEnabled ? null : read<Session | null>("api-hub-demo-session", null),
  );
  const [ready, setReady] = useState(!backendEnabled);
  const [data, setData] = useState<DemoData>(() => ({
    ...initialData,
    ...read<Partial<DemoData>>("api-hub-demo-data-v1", {}),
  }));
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!backendEnabled) return;
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
    localStorage.setItem("api-hub-demo-data-v1", JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => {
        if (backendEnabled) {
          refreshAuth()
            .then(setSession)
            .catch((error) => {
              clearAuth();
              setSession(null);
              setNotice(authError(error));
            });
          return;
        }
        const renewed = { ...session, expiresAt: Date.now() + 30 * 60 * 1000 };
        setSession(renewed);
        localStorage.setItem("api-hub-demo-session", JSON.stringify(renewed));
      },
      Math.max(0, session.expiresAt - Date.now() - 60000),
    );
    return () => clearTimeout(timer);
  }, [session]);
  const login = (value: Session) => {
    setSession(value);
    if (!backendEnabled)
      localStorage.setItem("api-hub-demo-session", JSON.stringify(value));
  };
  const logout = () => {
    if (backendEnabled) {
      setReady(false);
      void signOut()
        .then(() => setNotice("Signed out."))
        .catch(() =>
          setNotice(
            "Signed out locally. Server logout failed; the server session may still be active.",
          ),
        )
        .finally(() => {
          setSession(null);
          setReady(true);
        });
      return;
    }
    setSession(null);
    localStorage.removeItem("api-hub-demo-session");
    setNotice("Signed out. Demo session cleared.");
  };
  return (
    <Context.Provider
      value={{
        session,
        ready,
        login,
        logout,
        data,
        update: setData,
        toast: setNotice,
        notice,
      }}
    >
      {children}
    </Context.Provider>
  );
}
