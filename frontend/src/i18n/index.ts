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
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const templates = Object.entries(catalog)
  .filter(([key]) => /\{\{\d+\}\}/.test(key))
  .map(([key, value]) => {
    const slots: number[] = [];
    const pieces = key.split(/(\{\{\d+\}\})/);
    const source = pieces
      .map((part) => {
        if (/^\{\{\d+\}\}$/.test(part)) {
          slots.push(Number(part.slice(2, -2)));
          return "(.+?)";
        }
        return escape(part);
      })
      .join("");
    return {
      pattern: new RegExp("^" + source + "$"),
      value,
      slots,
      translateFirstSlot: [
        "Choose {{0}}",
        "Edit {{0}}",
        "Save {{0}}",
        "Search {{0}}…",
        "Selected {{0}}. Demo view updated.",
        "{{0}}: {{1}}. Saved in the local demo audit trail.",
      ].includes(key),
      specificity: key.replace(/\{\{\d+\}\}/g, "").length,
    };
  })
  .sort((a, b) => b.specificity - a.specificity);
export function t<T>(value: T): T {
  if (language === "en" || typeof value !== "string" || !value.trim())
    return value;
  const key = normalize(value);
  const label = key
    .replace(/^(?:[a-z]+(?:_[a-z]+)+\s+)+/, "")
    .replace(/(?:\s+[a-z]+(?:_[a-z]+)+)+$/, "");
  let translated = label !== key ? catalog[label] : catalog[key];
  if (!translated)
    for (const template of templates) {
      const match = key.match(template.pattern);
      if (match) {
        translated = template.value.replace(
          /\{\{(\d+)\}\}/g,
          (_, slot: string) =>
            template.translateFirstSlot && Number(slot) === 0
              ? t(match[template.slots.indexOf(Number(slot)) + 1] ?? "")
              : (match[template.slots.indexOf(Number(slot)) + 1] ?? ""),
        );
        break;
      }
    }
  if (!translated) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  return (leading + translated + trailing) as T;
}
export function setLanguage(next: Language) {
  language = next;
  try {
    localStorage.setItem(LANGUAGE_KEY, next);
  } catch {
    /* The language still works without browser storage. */
  }
  document.documentElement.lang = next;
  listeners.forEach((listener) => listener());
}
export function useLanguage() {
  const current = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
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

export function locale() {
  return language === "vi" ? "vi-VN" : "en-US";
}
