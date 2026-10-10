import { useSyncExternalStore } from 'react';
import vietnameseRaw from './vi.json';
import overridesRaw from './vi-overrides.json';
import customRaw from './vi-custom.json';

export type Language = 'vi' | 'en';
export const LANGUAGE_KEY = 'api_hub_language';

// Merge dictionaries: Base vi.json -> vi-overrides.json -> vi-custom.json
const baseCatalog: Record<string, string> = {
  ...vietnameseRaw,
  ...overridesRaw,
  ...customRaw,
};

const listeners = new Set<() => void>();

function storedLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    // Default to Vietnamese per user request
    return saved === 'en' ? 'en' : 'vi';
  } catch {
    return 'vi';
  }
}

let currentLanguage = storedLanguage();

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * Universal translate function
 */
export function t(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return '';
  if (currentLanguage === 'en') return value;

  const key = normalize(value);
  if (baseCatalog[key]) {
    return baseCatalog[key];
  }

  // Exact match without normalization
  if (baseCatalog[value]) {
    return baseCatalog[value];
  }

  return value;
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/**
 * Change active language and persist in localStorage
 */
export function setLanguage(next: Language): void {
  if (currentLanguage === next) return;
  currentLanguage = next;
  try {
    localStorage.setItem(LANGUAGE_KEY, next);
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
  listeners.forEach(cb => cb());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('languagechange', { detail: next }));
  }
}

/**
 * React hook to subscribe to language changes
 */
export function useLanguage() {
  const language = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => currentLanguage
  );

  return {
    language,
    setLanguage,
    t,
    isVietnamese: language === 'vi',
    locale: language === 'vi' ? 'vi-VN' : 'en-US'
  };
}

if (typeof window !== 'undefined') {
  document.documentElement.lang = currentLanguage;
  window.addEventListener('storage', (e) => {
    if (e.key === LANGUAGE_KEY) {
      const next = storedLanguage();
      setLanguage(next);
    }
  });
}
