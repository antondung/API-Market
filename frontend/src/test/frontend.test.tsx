import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { StoreProvider } from "../features/store";
import { safeReturnTo, quotaPercent, validateSpec } from "../lib/demo";
import manifest from "../screens/manifest.json";
function mount(path: string, role = "consumer") {
  if (role !== "guest")
    localStorage.setItem(
      "api-hub-demo-session",
      JSON.stringify({
        name: "Test Developer",
        email: "test@example.test",
        role,
        expiresAt: Date.now() + 1800000,
      }),
    );
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  );
}
describe("Routing & security boundaries", () => {
  it("redirects unauthenticated visitors to login", async () => {
    mount("/app/keys", "guest");
    expect(
      await screen.findByRole("heading", { name: "Welcome back to API HUB" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "API Keys & Credentials" }),
    ).toBeNull();
  });
  it("rejects a different workspace role", async () => {
    mount("/admin/users", "consumer");
    await waitFor(() => expect(document.title).toBe("Access Denied · API Hub"));
    expect(
      screen.queryByRole("heading", { name: "User Management" }),
    ).toBeNull();
  });
  it("keeps an internal return path and rejects external URLs", () => {
    expect(safeReturnTo("/app/keys?create=1")).toBe("/app/keys?create=1");
    for (const path of [
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "/\nattack",
    ])
      expect(safeReturnTo(path)).toBe("/app/overview");
  });
});
describe("API contract & quota validation", () => {
  it("accepts a YAML contract and rejects malformed operation values", () => {
    expect(
      validateSpec(
        'openapi: 3.1.0\ninfo:\n  title: YAML Test\n  version: "1.0"\npaths:\n  /health:\n    get:\n      summary: Health check\n',
      ).ok,
    ).toBe(true);
    expect(
      validateSpec(
        JSON.stringify({
          openapi: "3.1.0",
          info: { title: "Test", version: "1" },
          paths: { "/test": { get: null } },
        }),
      ).ok,
    ).toBe(false);
  });
  it("counts actual HTTP operations and rejects invalid contracts", () => {
    expect(
      validateSpec(
        JSON.stringify({
          openapi: "3.1.0",
          info: { title: "Test", version: "1" },
          paths: { "/test": { get: {}, post: {}, summary: "Test" } },
        }),
      ),
    ).toEqual({ ok: true, endpoints: 2 });
    for (const spec of [
      "invalid",
      "null",
      "[]",
      '{"openapi":"99"}',
      JSON.stringify({
        openapi: "3.1.0",
        info: { title: "Test", version: "1" },
        paths: { test: { get: {} } },
      }),
    ])
      expect(validateSpec(spec).ok).toBe(false);
  });
  it("handles unlimited, zero and exceeded quota", () => {
    expect(quotaPercent(120, 100)).toBe(100);
    expect(quotaPercent(1, 0)).toBe(0);
    expect(quotaPercent(10, null)).toBeNull();
    expect(quotaPercent(-1, 100)).toBe(0);
  });
});
describe("Implemented demo interactions", () => {
  it("generates a secret once and never persists it", async () => {
    const user = userEvent.setup();
    mount("/app/keys");
    await user.click(
      await screen.findByRole("button", { name: "Generate New API Key" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Key name" }),
      "New integration",
    );
    await user.click(screen.getByRole("button", { name: "Create key" }));
    const secret = (
      screen.getByRole("textbox", {
        name: "New key secret",
      }) as HTMLTextAreaElement
    ).value;
    expect(secret.startsWith("demo_")).toBe(true);
    expect(localStorage.getItem("api-hub-demo-data-v1")).not.toContain(secret);
    await user.click(
      screen.getByRole("button", { name: "I have saved the key" }),
    );
    expect(
      screen.queryByRole("textbox", { name: "New key secret" }),
    ).toBeNull();
    expect(screen.getByText("New integration")).toBeTruthy();
  });
  it("persists budget preferences", async () => {
    const user = userEvent.setup();
    mount("/app/cost-guard");
    const input = screen.getByRole("spinbutton", {
      name: "Monthly spending limit (USD)",
    });
    await user.clear(input);
    await user.type(input, "350");
    await user.click(
      screen.getByRole("button", { name: "Save budget & alerts" }),
    );
    expect(
      JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!).budget,
    ).toBe(350);
  });
  it("rotates a key without changing its name or API", async () => {
    const user = userEvent.setup();
    mount("/app/keys");
    await user.click(screen.getByRole("button", { name: "Rotate" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    const stored = JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!);
    expect(stored.keys).toHaveLength(2);
    expect(stored.keys[0].name).toBe("Development key");
    expect(stored.keys[0].api).toBe("Neural LLM Inference v4");
    expect(stored.keys[1].status).toBe("Revoked");
  });
  it("does not create a subscription when sandbox payment fails", async () => {
    const user = userEvent.setup();
    mount("/checkout?api=global-fx");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sandbox payment result" }),
      "Failure",
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: "I accept the sandbox subscription terms.",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Confirm sandbox payment" }),
    );
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!).subscriptions,
    ).toHaveLength(1);
  });
  it("creates a subscription when sandbox payment succeeds", async () => {
    const user = userEvent.setup();
    mount("/checkout?api=global-fx");
    await user.click(
      screen.getByRole("checkbox", {
        name: "I accept the sandbox subscription terms.",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Confirm sandbox payment" }),
    );
    expect(
      await screen.findByRole("heading", { name: "My APIs & Subscriptions" }),
    ).toBeTruthy();
    const subscriptions = JSON.parse(
      localStorage.getItem("api-hub-demo-data-v1")!,
    ).subscriptions;
    expect(
      subscriptions.find(
        (s: { api: string; status: string }) =>
          s.api === "Global FX Settlement",
      )?.status,
    ).toBe("Active");
  });
  it("validates the API wizard and saves a draft", async () => {
    const user = userEvent.setup();
    mount("/provider/apis/new", "provider");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toBeTruthy();
    await user.type(
      screen.getByRole("textbox", { name: "API name" }),
      "Contract Test API",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Description" }),
      "A test contract with a health endpoint.",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Base URL (HTTPS)" }),
      "https://api.example.test",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("textbox", { name: "Specification" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    expect(
      await screen.findByRole("heading", { name: "My APIs Inventory" }),
    ).toBeTruthy();
    expect(
      JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!).drafts[0].name,
    ).toBe("Contract Test API");
  });
  it("filters marketplace into an explicit empty state", async () => {
    const user = userEvent.setup();
    mount("/marketplace");
    await user.type(
      screen.getByRole("textbox", { name: "Search APIs" }),
      "nonexistent-api-123",
    );
    expect(
      screen.getByRole("heading", { name: "No APIs match your filters" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("heading", { name: /Neural LLM/ })).toBeTruthy();
  });
});
describe("Every source screen is covered by a working route", () => {
  for (const entry of manifest)
    it(`${entry.role}: ${entry.path}`, async () => {
      mount(
        entry.path,
        ["consumer", "provider", "admin"].includes(entry.role)
          ? entry.role
          : "guest",
      );
      await waitFor(() =>
        expect(document.title).toBe(`${entry.title} · API Hub`),
      );
      await waitFor(() =>
        expect(screen.queryByText("Loading workspace…")).toBeNull(),
      );
      expect(
        document.querySelector("main")!.textContent!.length,
      ).toBeGreaterThan(80);
      expect(
        screen.queryByRole("heading", { name: "404 · Page not found" }),
      ).toBeNull();
    });
});
