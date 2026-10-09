import { resetLanguageFromStorage } from "../i18n";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, configure } from "@testing-library/react";
configure({ asyncUtilTimeout: 5000 });
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("api-hub-language", "en");
  resetLanguageFromStorage();
  Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
});
afterEach(() => cleanup());
