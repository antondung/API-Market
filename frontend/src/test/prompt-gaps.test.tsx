import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { StoreProvider } from "../features/store";
import { initialData } from "../lib/demo";
import { registeredEndpoints } from "../lib/contracts";
import { setLanguage } from "../i18n";

function mount(path: string, role = "consumer", data = initialData) {
  localStorage.setItem("api-hub-demo-data-v1", JSON.stringify(data));
  if (role !== "guest")
    localStorage.setItem(
      "api-hub-demo-session",
      JSON.stringify({
        name: "Test User",
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
describe("Prompt content gaps", () => {
  it("keeps provider names unchanged in Vietnamese filter chips", () => {
    setLanguage("vi");
    mount("/marketplace?provider=AtmosGrid", "guest");
    expect(
      screen.getByRole("button", { name: "Bỏ bộ lọc: AtmosGrid" }),
    ).toBeTruthy();
  });
  it("applies a filter from the mobile dialog and closes it", async () => {
    mount("/marketplace", "guest");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Provider filter" }),
      "AtmosGrid",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Show results" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("link", {
        name: "HyperStream Weather API",
      }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("link", { name: "Global FX Settlement" }),
    ).toBeNull();
  });
  it("requires matching registration passwords and acceptance", async () => {
    mount("/register", "guest");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Full name"), "New User");
    await user.type(screen.getByLabelText("Email address"), "new@example.test");
    await user.type(
      screen.getByLabelText("Password", { exact: true }),
      "password1",
    );
    await user.type(screen.getByLabelText("Confirm password"), "different1");
    await user.click(
      screen.getByRole("button", { name: "Create demo account" }),
    );
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Passwords do not match.",
    );
    await user.clear(screen.getByLabelText("Confirm password"));
    await user.type(screen.getByLabelText("Confirm password"), "password1");
    await user.click(
      screen.getByRole("button", { name: "Create demo account" }),
    );
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Accept the account terms to continue.",
    );
    expect(localStorage.getItem("api-hub-demo-session")).toBeNull();
  });
  it("restricts playground to registered operations and stores redacted metadata", async () => {
    mount("/apis/neural-llm/playground");
    fireEvent.change(screen.getByLabelText("Method"), {
      target: { value: "DELETE" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));
    expect(screen.getByRole("alert").textContent).toBe(
      "Choose a registered endpoint and its HTTP method.",
    );
    fireEvent.change(screen.getByLabelText("Method"), {
      target: { value: "POST" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!).requests,
      ).toHaveLength(1),
    );
    const r = JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!)
      .requests[0];
    expect(r.status).toBe(200);
    expect(r.actor).toBe("test@example.test");
    expect(r).not.toHaveProperty("body");
    expect(r).not.toHaveProperty("headers");
  });
  it("blocks trial exhaustion without inventing an allocation", () => {
    const api = initialData.apis[0];
    mount("/apis/neural-llm/playground", "consumer", {
      ...initialData,
      apis: initialData.apis.map((a) =>
        a.id === api.id ? { ...a, trialLimit: 0 } : a,
      ),
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Request" }));
    expect(screen.getByRole("alert").textContent).toBe(
      "Trial exhausted. View plans to continue.",
    );
  });
  it("does not expose try or checkout actions for suspended APIs", () => {
    mount("/apis/neural-llm", "guest", {
      ...initialData,
      apis: initialData.apis.map((a) => ({ ...a, status: "Suspended" })),
    });
    expect(screen.queryByRole("link", { name: "Try API" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Subscribe to API" })).toBeNull();
  });
  it("renders missing API instead of silently selecting another API", () => {
    mount("/apis/neural-llm?api=missing", "guest");
    expect(screen.getByRole("heading", { name: "API not found" })).toBeTruthy();
  });
  it("filters marketplace by confirmed verification and provider", () => {
    mount("/marketplace?provider=AtmosGrid&verified=yes", "guest", {
      ...initialData,
      apis: initialData.apis.map((a) => ({
        ...a,
        verified: a.id === "weather",
      })),
    });
    expect(
      screen.getByRole("heading", { name: "HyperStream Weather API" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Neural LLM Inference v4" }),
    ).toBeNull();
  });
  it("uses imported registered endpoints instead of a fixed chat endpoint", () => {
    const draft = {
      id: "health",
      name: "Health API",
      description: "Health data",
      category: "Developer Tools",
      baseUrl: "https://example.test",
      version: "v1",
      spec: JSON.stringify({
        paths: { "/health": { get: { summary: "Health" } } },
      }),
      price: 0,
      quota: 10,
      rate: 5,
      ownership: "Own",
      personalData: false,
      agreement: true,
      status: "Published",
    };
    expect(
      registeredEndpoints({ ...initialData, drafts: [draft] }, "health"),
    ).toEqual([{ path: "/health", method: "GET" }]);
  });
  it("records failed sandbox transactions without activating a subscription", async () => {
    mount("/checkout?api=weather");
    fireEvent.change(screen.getByLabelText("Sandbox payment result"), {
      target: { value: "Failure" },
    });
    fireEvent.click(
      screen.getByLabelText("I accept the sandbox subscription terms."),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm sandbox payment" }),
    );
    await screen.findByRole("alert");
    const data = JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!);
    expect(data.transactions[0].status).toBe("Failure");
    expect(data.subscriptions).toHaveLength(1);
  });
  it("computes request counts and does not invent monitoring values", () => {
    mount("/app/usage");
    expect(screen.getAllByText("Data not available").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        name: "Subscription quota and rate limits",
      }),
    ).toBeTruthy();
  });
  it("requires a reason before admin suspends an API", async () => {
    mount("/admin/apis", "admin");
    await userEvent
      .setup()
      .click(screen.getAllByRole("button", { name: "Suspend API" })[0]);
    expect(
      (screen.getByRole("button", { name: "Confirm" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.change(screen.getByLabelText("Decision reason"), {
      target: { value: "Availability incident" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!).apis[0]
          .status,
      ).toBe("Suspended"),
    );
    expect(
      JSON.parse(localStorage.getItem("api-hub-demo-data-v1")!).audit[0].reason,
    ).toBe("Availability incident");
  });
  it("renders new request history in Vietnamese", () => {
    setLanguage("vi");
    mount("/app/requests");
    expect(
      screen.getByRole("heading", { name: "Lịch sử yêu cầu" }),
    ).toBeTruthy();
    expect(screen.getByText("Không có request phù hợp.")).toBeTruthy();
  });
});
