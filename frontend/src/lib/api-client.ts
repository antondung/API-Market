export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "",
  ) {
    super(message);
  }
}
export const backendEnabled = Boolean(
  import.meta.env.VITE_API_BASE_URL?.trim(),
);
export async function request<T>(
  path: string,
  options: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base)
    throw new ApiError(
      0,
      "Backend URL is not configured. The application is using demo data.",
    );
  const response = await fetch(
    `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    {
      ...options,
      signal,
      credentials: "omit",
      headers: { "Content-Type": "application/json", ...options.headers },
    },
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      payload?.error?.message || `Request failed (${response.status}).`,
      payload?.error?.code || "",
    );
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}
