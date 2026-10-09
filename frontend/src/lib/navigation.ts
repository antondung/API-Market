import type { Role } from "./types";

export type IconName =
  | "overview"
  | "marketplace"
  | "subscriptions"
  | "keys"
  | "usage"
  | "history"
  | "guard"
  | "apis"
  | "create"
  | "endpoints"
  | "import"
  | "plans"
  | "review"
  | "subscribers"
  | "analytics"
  | "revenue"
  | "verification"
  | "compliance"
  | "users"
  | "reports"
  | "payments"
  | "monitoring"
  | "audit";

export interface ProductPage {
  path: string;
  title: string;
  icon: IconName;
  roles: Role[];
  group: "Consumer tools" | "Provider tools" | "Administration";
}

export const workspacePath: Record<Role, string> = {
  consumer: "/app/overview",
  provider: "/provider/overview",
  admin: "/admin/overview",
};

const consumerPages: ProductPage[] = [
  {
    path: "/app/overview",
    title: "Overview",
    icon: "overview",
    roles: ["consumer"],
    group: "Consumer tools",
  },
  {
    path: "/app/subscriptions",
    title: "My subscriptions",
    icon: "subscriptions",
    roles: ["consumer", "provider"],
    group: "Consumer tools",
  },
  {
    path: "/app/keys",
    title: "API keys",
    icon: "keys",
    roles: ["consumer", "provider"],
    group: "Consumer tools",
  },
  {
    path: "/app/usage",
    title: "Usage & quota",
    icon: "usage",
    roles: ["consumer", "provider"],
    group: "Consumer tools",
  },
  {
    path: "/app/requests",
    title: "Request history",
    icon: "history",
    roles: ["consumer", "provider"],
    group: "Consumer tools",
  },
  {
    path: "/app/cost-guard",
    title: "Cost guard & alerts",
    icon: "guard",
    roles: ["consumer", "provider"],
    group: "Consumer tools",
  },
];

const providerPages: ProductPage[] = [
  {
    path: "/provider/overview",
    title: "Provider dashboard",
    icon: "overview",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/apis",
    title: "My APIs",
    icon: "apis",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/apis/new",
    title: "Create API",
    icon: "create",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/endpoints",
    title: "Endpoints & versions",
    icon: "endpoints",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/import",
    title: "OpenAPI import",
    icon: "import",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/plans",
    title: "Pricing plans",
    icon: "plans",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/review",
    title: "Publishing workflow",
    icon: "review",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/subscribers",
    title: "Subscribers",
    icon: "subscribers",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/requests",
    title: "Provider request history",
    icon: "history",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/analytics",
    title: "Analytics & API health",
    icon: "analytics",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/revenue",
    title: "Revenue & payouts",
    icon: "revenue",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/verification",
    title: "Provider verification",
    icon: "verification",
    roles: ["provider"],
    group: "Provider tools",
  },
  {
    path: "/provider/compliance",
    title: "Compliance",
    icon: "compliance",
    roles: ["provider"],
    group: "Provider tools",
  },
];

const adminPages: ProductPage[] = [
  {
    path: "/admin/overview",
    title: "Admin dashboard",
    icon: "overview",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/users",
    title: "User management",
    icon: "users",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/providers",
    title: "Provider approvals",
    icon: "verification",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/reviews",
    title: "API review",
    icon: "review",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/apis",
    title: "API management",
    icon: "apis",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/reports",
    title: "Reports & moderation",
    icon: "reports",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/subscriptions",
    title: "Subscription management",
    icon: "subscriptions",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/payments",
    title: "Sandbox payments",
    icon: "payments",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/requests",
    title: "Platform request history",
    icon: "history",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/monitoring",
    title: "Gateway monitoring",
    icon: "monitoring",
    roles: ["admin"],
    group: "Administration",
  },
  {
    path: "/admin/audit",
    title: "Audit logs",
    icon: "audit",
    roles: ["admin"],
    group: "Administration",
  },
];

export const productPages = [...consumerPages, ...providerPages, ...adminPages];

export function pagesFor(role: Role) {
  if (role === "admin") return adminPages;
  if (role === "provider") return [...providerPages, ...consumerPages.slice(1)];
  return consumerPages;
}
