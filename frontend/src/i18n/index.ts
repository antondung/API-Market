import { useSyncExternalStore } from "react";
import vietnamese from "./vi.json";
export type Language = "vi" | "en";
export const LANGUAGE_KEY = "api-hub-language";
const catalog: Record<string, string> = vietnamese;
const listeners = new Set<() => void>();
function storedLanguage(): Language {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "vi";
  } catch {
    return "vi";
  }
}
let language = storedLanguage();
export function t<T>(value: T): T {
  if (language === "en" || typeof value !== "string" || !value.trim())
    return value;
  return (catalog[value] || value) as T;
}
export function setLanguage(next: Language) {
  language = next;
  try {
    localStorage.setItem(LANGUAGE_KEY, next);
  } catch {
    /* Language still works without storage. */
  }
  document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}
export function useLanguage() {
  const current = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => language,
  );
  return {
    language: current,
    setLanguage,
    t,
    locale: current === "vi" ? "vi-VN" : "en-US",
  };
}
export function resetLanguageFromStorage() {
  setLanguage(storedLanguage());
}
if (typeof window !== "undefined") {
  document.documentElement.lang = language;
  window.addEventListener("storage", (event) => {
    if (event.key === LANGUAGE_KEY) resetLanguageFromStorage();
  });
}
