import type { DemoData } from "./types";
import { parse as parseYaml } from "yaml";
export const initialData: DemoData = {
  requests: [],
  transactions: [],
  notifications: [],
  managed: [
    {
      id: "endpoint-1",
      kind: "endpoints",
      name: "POST /v4/chat/completions",
      detail: "Chat completion · v4.2",
      status: "Active",
      value: 60,
      quota: 10000,
    },
    {
      id: "plan-free",
      kind: "plans",
      name: "Free",
      detail: "Sandbox API access",
      status: "Active",
      value: 0,
      quota: 1000,
    },
    {
      id: "plan-pro",
      kind: "plans",
      name: "Developer",
      detail: "Production integration",
      status: "Active",
      value: 29,
      quota: 10000,
    },
    {
      id: "user-1",
      kind: "users",
      name: "Alex Developer",
      detail: "consumer@demo.apihub.test",
      status: "Active",
      value: 0,
      quota: 0,
    },
  ],
  apis: [
    {
      id: "neural-llm",
      name: "Neural LLM Inference v4",
      provider: "DeepMatrix AI",
      category: "AI & Machine Learning",
      pricing: "Free",
      auth: "Bearer Token",
      description:
        "Ultra-fast multimodal transformer inference engine with a consistent developer interface.",
      status: "Published",
      version: "v4.2.0",
    },
    {
      id: "global-fx",
      name: "Global FX Settlement",
      provider: "Apex Ledger",
      category: "Finance & Payments",
      pricing: "Freemium",
      auth: "OAuth 2.0",
      description:
        "Multi-currency clearing and liquidity routing for financial applications.",
      status: "Published",
      version: "v2.0",
    },
    {
      id: "auth-guard",
      name: "Zero-Trust Auth Guard",
      provider: "Securify Inc.",
      category: "Security & Identity",
      pricing: "Paid",
      auth: "API Key",
      description:
        "Continuous verification and automated threat mitigation for service architectures.",
      status: "Published",
      version: "v1.0",
    },
    {
      id: "weather",
      name: "HyperStream Weather API",
      provider: "AtmosGrid",
      category: "Weather & Spatial",
      pricing: "Free",
      auth: "API Key",
      description:
        "Hyper-local weather telemetry, storm tracking and forecasting.",
      status: "Published",
      version: "v3.1",
    },
    {
      id: "stream",
      name: "Realtime Event Stream",
      provider: "Stream Labs",
      category: "Real-Time Data",
      pricing: "Freemium",
      auth: "API Key",
      description: "Structured event streaming for responsive applications.",
      status: "Published",
      version: "v1.0",
    },
    {
      id: "devtools",
      name: "Build Pipeline API",
      provider: "Build Labs",
      category: "Developer Tools",
      pricing: "Free",
      auth: "Bearer Token",
      description: "Build artifacts, jobs and release metadata in one API.",
      status: "Published",
      version: "v1.0",
    },
  ],
  keys: [
    {
      id: "demo-key-1",
      name: "Development key",
      api: "Neural LLM Inference v4",
      prefix: "demo_••••_4a2b",
      status: "Active",
      createdAt: "2026-10-01",
      lastUsed: null,
    },
  ],
  subscriptions: [
    {
      id: "sub-1",
      api: "Neural LLM Inference v4",
      plan: "Free",
      status: "Active",
      createdAt: "2026-10-01",
    },
  ],
  drafts: [],
  audit: [],
  records: {},
  budget: 200,
  thresholds: [50, 80, 100],
  providerStatus: "Pending",
  domainStatus: "Unverified",
  reports: [],
  unread: 3,
};
export function safeReturnTo(
  value: string | null,
  fallback = "/app/overview",
): string {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\u0000-\u001f]/.test(value)
    ? value
    : fallback;
}
export function quotaPercent(
  used: number,
  limit: number | null,
): number | null {
  return limit === null
    ? null
    : limit <= 0
      ? 0
      : Math.min(100, Math.max(0, (used / limit) * 100));
}
export function parseSpec(text: string) {
  if (text.length > 2 * 1024 * 1024)
    throw new Error("Specification must be smaller than 2 MB.");
  return /^[\s]*[\[{]/.test(text)
    ? JSON.parse(text)
    : parseYaml(text, { maxAliasCount: 50, logLevel: "error" });
}
export function validateSpec(text: string): {
  ok: boolean;
  endpoints: number;
  error?: string;
} {
  try {
    const value = parseSpec(text);
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      (!/^3\.\d+\.\d+$/.test(value.openapi || "") && value.swagger !== "2.0")
    )
      return {
        ok: false,
        endpoints: 0,
        error: "Use an OpenAPI 3.x or Swagger 2.0 specification.",
      };
    if (
      typeof value.info?.title !== "string" ||
      !value.info.title.trim() ||
      typeof value.info?.version !== "string" ||
      !value.info.version.trim()
    )
      return {
        ok: false,
        endpoints: 0,
        error: "API title and version are required in info.",
      };
    if (
      !value.paths ||
      typeof value.paths !== "object" ||
      Array.isArray(value.paths) ||
      !Object.keys(value.paths).length ||
      Object.keys(value.paths).some((p) => !p.startsWith("/"))
    )
      return {
        ok: false,
        endpoints: 0,
        error:
          "The specification must include registered paths starting with /.",
      };
    const methods = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
      "trace",
    ];
    if (
      Object.values(value.paths).some(
        (item) =>
          !item ||
          typeof item !== "object" ||
          Array.isArray(item) ||
          Object.entries(item).some(
            ([method, operation]) =>
              methods.includes(method) &&
              (!operation ||
                typeof operation !== "object" ||
                Array.isArray(operation)),
          ),
      )
    )
      return {
        ok: false,
        endpoints: 0,
        error: "Path items and HTTP operations must be objects.",
      };
    const endpoints = Object.values(
      value.paths as Record<string, unknown>,
    ).reduce<number>(
      (count, item) =>
        count +
        (item && typeof item === "object"
          ? Object.keys(item).filter((m) =>
              [
                "get",
                "post",
                "put",
                "patch",
                "delete",
                "options",
                "head",
                "trace",
              ].includes(m),
            ).length
          : 0),
      0,
    );
    if (!endpoints)
      return {
        ok: false,
        endpoints: 0,
        error: "Register at least one HTTP operation in paths.",
      };
    return { ok: true, endpoints };
  } catch {
    return {
      ok: false,
      endpoints: 0,
      error:
        "Invalid JSON or YAML. Check the specification syntax and file size.",
    };
  }
}
