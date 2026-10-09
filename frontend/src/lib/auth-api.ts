import { ApiError, request } from "./api-client";
import type { Role, Session } from "./types";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Consumer" | "Provider" | "Admin";
};
type Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};
type Saved = Tokens & { expiresAt: number };
const key = "api-market-auth";
let refreshing: Promise<Session> | null = null;
let generation = 0;

function saved(): Saved | null {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function session(value: Saved): Session {
  const role = value.user.role.toLowerCase();
  if (!["consumer", "provider", "admin"].includes(role))
    throw new ApiError(403, "Unsupported account role.");
  return {
    name: value.user.name,
    email: value.user.email,
    role: role as Role,
    expiresAt: value.expiresAt,
  };
}
function save(value: Tokens): Session {
  const next = { ...value, expiresAt: Date.now() + value.expiresIn * 1000 };
  const identity = session(next);
  // shortcut: tokens last only for this tab and are script-readable; use HttpOnly cookies when the backend supports them.
  sessionStorage.setItem(key, JSON.stringify(next));
  return identity;
}
export function clearAuth() {
  generation++;
  sessionStorage.removeItem(key);
}
export function hasAuth() {
  return Boolean(saved());
}
export async function signIn(
  email: string,
  password: string,
): Promise<Session> {
  const response = await request<{ data: Tokens }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  generation++;
  return save(response.data);
}
export async function registerAccount(
  name: string,
  email: string,
  password: string,
  role: Role,
) {
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role: role === "provider" ? "Provider" : "Consumer",
    }),
  });
}
export function refreshAuth(): Promise<Session> {
  if (refreshing) return refreshing;
  const previous = saved();
  if (!previous)
    return Promise.reject(new ApiError(401, "Authentication failed"));
  const version = generation;
  refreshing = request<{ data: Tokens }>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: previous.refreshToken }),
  })
    .then(({ data }) => {
      if (version !== generation)
        throw new ApiError(401, "Authentication failed");
      return save(data);
    })
    .catch((error) => {
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        version === generation
      )
        clearAuth();
      throw error;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}
export async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let value = saved();
  if (!value) throw new ApiError(401, "Authentication failed");
  if (value.expiresAt <= Date.now() + 1000) {
    await refreshAuth();
    value = saved()!;
  }
  const send = () =>
    request<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${saved()?.accessToken}`,
      },
    });
  try {
    return await send();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    await refreshAuth();
    try {
      return await send();
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401)
        clearAuth();
      throw retryError;
    }
  }
}
export async function restoreAuth(): Promise<Session> {
  const { data } = await authenticatedRequest<{ data: User }>("/api/auth/me");
  await authenticatedRequest(`/api/access/${data.role.toLowerCase()}`);
  const current = saved();
  if (!current) throw new ApiError(401, "Authentication failed");
  return save({
    ...current,
    user: data,
    expiresIn: Math.max(0, (current.expiresAt - Date.now()) / 1000),
  });
}
export async function signOut() {
  try {
    await authenticatedRequest("/api/auth/logout", { method: "POST" });
  } finally {
    clearAuth();
  }
}
export function authError(error: unknown): string {
  if (!(error instanceof ApiError))
    return "Cannot connect to the backend. Please try again.";
  const messages: Record<string, string> = {
    UNAUTHORIZED: "Incorrect credentials or expired session.",
    EMAIL_EXISTS: "This email is already registered.",
    RATE_LIMITED: "Too many attempts. Please wait a minute.",
    FORBIDDEN: "You do not have permission to access this workspace.",
    VALIDATION_ERROR:
      "Check your details. Registration passwords must contain 12 to 128 characters.",
  };
  return (
    messages[error.code] ||
    "The backend could not complete this request. Please try again."
  );
}
