import React from "react";
import { beforeEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionMonitoringPage } from "./SubscriptionMonitoringPage";
import { GatewayOperationsPage } from "./GatewayOperationsPage";
import * as api from "../../services/operationsApi";
vi.mock("../../i18n", () => ({ useLanguage: () => ({ t: (s: string) => s }) }));
vi.mock("../../services/authApi", () => ({
  formatBackendErrorMessage: (e: unknown) =>
    e instanceof Error ? e.message : "Error",
}));
const sub: api.SubscriptionRow = {
  id: "7",
  consumerId: "3",
  apiId: "1",
  apiName: "Real Weather",
  planName: "Free",
  status: "Active",
  quotaUsed: "2",
  quotaLimit: "100",
  priceAmount: "0.00",
  currency: "USD",
  periodEnd: "2026-12-01T00:00:00Z",
};
beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(api, "subscriptions").mockResolvedValue({
    items: [sub],
    total: 1,
    page: 1,
    pageSize: 20,
  });
  vi.spyOn(api, "payments").mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
  });
});
it("loads real ledgers, requires an audit reason, suspends and reloads state", async () => {
  const suspend = vi.spyOn(api, "suspend").mockResolvedValue({});
  render(<SubscriptionMonitoringPage />);
  await screen.findByText("Real Weather (1)");
  const button = screen.getByRole("button", {
    name: "Suspend",
  }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText("Admin reason"), {
    target: { value: "Abuse confirmed" },
  });
  fireEvent.click(button);
  await waitFor(() =>
    expect(suspend).toHaveBeenCalledWith("7", "Abuse confirmed"),
  );
  await waitFor(() => expect(api.subscriptions).toHaveBeenCalledTimes(2));
});
it("offers Mo khoa only for a suspended subscription and posts the reason", async () => {
  vi.mocked(api.subscriptions).mockResolvedValue({
    items: [{ ...sub, status: "Suspended" }],
    total: 1,
    page: 1,
    pageSize: 20,
  });
  const restore = vi.spyOn(api, "restore").mockResolvedValue({});
  render(<SubscriptionMonitoringPage />);
  const button = (await screen.findByRole("button", {
    name: "Mở khóa",
  })) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText("Admin reason"), {
    target: { value: "Da ra soat" },
  });
  fireEvent.click(button);
  await waitFor(() =>
    expect(restore).toHaveBeenCalledWith("7", "Da ra soat"),
  );
});
it("loads key metadata and revokes through the Admin backend", async () => {
  vi.spyOn(api, "keys").mockResolvedValue([
    { id: "9", isActive: true, revokedAt: null, lastUsedAt: null },
  ]);
  const revoke = vi.spyOn(api, "revoke").mockResolvedValue({});
  render(<SubscriptionMonitoringPage />);
  fireEvent.click(await screen.findByRole("button", { name: "API Keys" }));
  fireEvent.change(screen.getByLabelText("Admin reason"), {
    target: { value: "Compromised key" },
  });
  fireEvent.click(await screen.findByRole("button", { name: "Revoke" }));
  await waitFor(() =>
    expect(revoke).toHaveBeenCalledWith("9", "Compromised key"),
  );
});
it("surfaces fetch errors and does not claim an empty ledger succeeded", async () => {
  vi.mocked(api.subscriptions).mockRejectedValue(
    new Error("Backend unavailable"),
  );
  render(<SubscriptionMonitoringPage />);
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Backend unavailable",
  );
  expect(screen.queryByText("No subscriptions found")).toBeNull();
});
it("filters subscription and payment status on the API query", async () => {
  render(<SubscriptionMonitoringPage />);
  await screen.findByText("Real Weather (1)");
  fireEvent.change(screen.getByLabelText("Subscription status"), {
    target: { value: "Suspended" },
  });
  await waitFor(() =>
    expect(api.subscriptions).toHaveBeenLastCalledWith(
      expect.stringContaining("status=Suspended"),
      expect.any(AbortSignal),
    ),
  );
});
it("reports actual degraded Gateway/worker status and clears stale healthy data after refresh failure", async () => {
  const load = vi.spyOn(api, "operations").mockResolvedValue({
    checkedAt: new Date().toISOString(),
    controlPlane: "online",
    postgres: "online",
    redis: "unavailable",
    gateway: "degraded",
    worker: { status: "unknown" },
  });
  render(<GatewayOperationsPage />);
  expect(await screen.findByText("degraded")).toBeDefined();
  expect(screen.getByText("unknown")).toBeDefined();
  load.mockRejectedValue(new Error("Offline"));
  fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("degraded")).toBeNull();
});
