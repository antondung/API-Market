import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
vi.hoisted(() => vi.stubEnv("VITE_API_BASE_URL", "http://127.0.0.1:3000"));
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Auth from "../features/Auth";
import { StoreProvider } from "../features/store";
import { request, ApiError } from "../lib/api-client";
import {
  clearAuth,
  signIn,
  refreshAuth,
  restoreAuth,
  authenticatedRequest,
  signOut,
} from "../lib/auth-api";

const user = {
  id: "1",
  name: "Frontend QA",
  email: "qa@example.test",
  role: "Provider",
};
const tokens = {
  user,
  accessToken: "access-1",
  refreshToken: "refresh-1",
  expiresIn: 900,
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  clearAuth();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  clearAuth();
  vi.unstubAllGlobals();
});

describe("Backend auth contract", () => {
  it("uses Bearer tokens, omits cookies and stores no password in localStorage", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: tokens }))
      .mockResolvedValueOnce(json({ data: user }))
      .mockResolvedValueOnce(json({ data: { role: "Provider" } }));
    const identity = await signIn(user.email, "test-password-123");
    expect(identity.role).toBe("provider");
    expect(await restoreAuth()).toMatchObject({
      email: user.email,
      role: "provider",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://127.0.0.1:3000/api/auth/login",
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      credentials: "omit",
      headers: { Authorization: "Bearer access-1" },
    });
    expect(fetchMock.mock.calls[2][0]).toContain("/api/access/provider");
    expect(localStorage.getItem("api-hub-demo-session")).toBeNull();
    expect(sessionStorage.getItem("api-market-auth")).not.toContain(
      "test-password-123",
    );
  });
  it("rotates once for concurrent refresh calls", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: tokens }))
      .mockResolvedValueOnce(
        json({
          data: {
            ...tokens,
            accessToken: "access-2",
            refreshToken: "refresh-2",
          },
        }),
      );
    await signIn(user.email, "password");
    await Promise.all([refreshAuth(), refreshAuth()]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      refreshToken: "refresh-1",
    });
    expect(sessionStorage.getItem("api-market-auth")).toContain("refresh-2");
  });
  it("refreshes on a 401 and retries once with the new access token", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: tokens }))
      .mockResolvedValueOnce(
        json(
          { error: { code: "UNAUTHORIZED", message: "Authentication failed" } },
          401,
        ),
      )
      .mockResolvedValueOnce(
        json({ data: { ...tokens, accessToken: "access-2" } }),
      )
      .mockResolvedValueOnce(json({ data: user }));
    await signIn(user.email, "password");
    expect(await authenticatedRequest("/api/auth/me")).toEqual({ data: user });
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe(
      "Bearer access-2",
    );
  });
  it("does not retry a forbidden role as an expired token", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: tokens }))
      .mockResolvedValueOnce(
        json(
          { error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
          403,
        ),
      );
    await signIn(user.email, "password");
    await expect(
      authenticatedRequest("/api/access/admin"),
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("clears rejected refresh sessions", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: tokens }))
      .mockResolvedValueOnce(json({ error: { code: "UNAUTHORIZED" } }, 401));
    await signIn(user.email, "password");
    await expect(refreshAuth()).rejects.toBeInstanceOf(ApiError);
    expect(sessionStorage.getItem("api-market-auth")).toBeNull();
  });
  it("does not restore a session from a late refresh after sign-out", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: tokens }));
    await signIn(user.email, "password");
    let resolve!: (value: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    const pending = refreshAuth();
    clearAuth();
    resolve(json({ data: tokens }));
    await expect(pending).rejects.toMatchObject({ status: 401 });
    expect(sessionStorage.getItem("api-market-auth")).toBeNull();
  });
  it("calls logout and clears tokens even when the server is offline", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: tokens }))
      .mockRejectedValueOnce(new TypeError("offline"));
    await signIn(user.email, "password");
    await expect(signOut()).rejects.toThrow("offline");
    expect(fetchMock.mock.calls[1][0]).toContain("/api/auth/logout");
    expect(sessionStorage.getItem("api-market-auth")).toBeNull();
  });
  it("handles a 204 response and backend error envelopes", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        json(
          {
            error: {
              code: "EMAIL_EXISTS",
              message: "Email already registered",
            },
          },
          409,
        ),
      );
    expect(
      await request("/api/auth/logout", { method: "POST" }),
    ).toBeUndefined();
    await expect(request("/api/auth/register")).rejects.toMatchObject({
      status: 409,
      code: "EMAIL_EXISTS",
      message: "Email already registered",
    });
  });
});
describe("Backend auth UI", () => {
  function mount(register = false) {
    return render(
      <MemoryRouter>
        <StoreProvider>
          <Auth register={register} />
        </StoreProvider>
      </MemoryRouter>,
    );
  }
  it("hides demo role switching and demo login in backend mode", () => {
    mount();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(
      screen.queryByText("Explore without entering credentials"),
    ).toBeNull();
  });
  it("registers a Provider without creating a local session", async () => {
    const events = userEvent.setup();
    mount(true);
    fetchMock.mockResolvedValueOnce(json({ data: user }, 201));
    await events.type(
      screen.getByRole("textbox", { name: "Full name" }),
      user.name,
    );
    await events.type(
      screen.getByRole("textbox", { name: "Email address" }),
      user.email,
    );
    await events.type(
      screen.getByLabelText("Password", { exact: true }),
      "test-password-123",
    );
    await events.type(
      screen.getByLabelText("Confirm password"),
      "test-password-123",
    );
    await events.selectOptions(screen.getByRole("combobox"), "provider");
    await events.click(screen.getByRole("checkbox"));
    await events.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      await screen.findByText("Account created. Sign in to continue."),
    ).toBeTruthy();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      role: "Provider",
      name: user.name,
    });
    expect(sessionStorage.getItem("api-market-auth")).toBeNull();
  });
  it("shows backend duplicate-email errors", async () => {
    const events = userEvent.setup();
    mount(true);
    fetchMock.mockResolvedValueOnce(
      json({ error: { code: "EMAIL_EXISTS" } }, 409),
    );
    await events.type(
      screen.getByRole("textbox", { name: "Full name" }),
      user.name,
    );
    await events.type(
      screen.getByRole("textbox", { name: "Email address" }),
      user.email,
    );
    await events.type(
      screen.getByLabelText("Password", { exact: true }),
      "test-password-123",
    );
    await events.type(
      screen.getByLabelText("Confirm password"),
      "test-password-123",
    );
    await events.click(screen.getByRole("checkbox"));
    await events.click(screen.getByRole("button", { name: "Create account" }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      "This email is already registered.",
    );
  });
});
