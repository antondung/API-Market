import { parseSpec } from "./demo";
import type { DemoData } from "./types";
export function registeredEndpoints(data: DemoData, id: string) {
  const draft = data.drafts.find((d) => d.id === id);
  if (draft) {
    try {
      const spec = parseSpec(draft.spec);
      return Object.entries(spec.paths || {}).flatMap(([path, value]) =>
        Object.keys(value as object)
          .filter((method) =>
            [
              "get",
              "post",
              "put",
              "patch",
              "delete",
              "head",
              "options",
            ].includes(method),
          )
          .map((method) => ({ path, method: method.toUpperCase() })),
      );
    } catch {
      return [];
    }
  }
  return [
    {
      method: id === "neural-llm" ? "POST" : "GET",
      path:
        id === "neural-llm"
          ? "/v4/chat/completions"
          : id === "weather"
            ? "/v3/weather"
            : "/v1/data",
    },
  ];
}
export function planLimits(data: DemoData, api: string, plan: string) {
  const draft = data.drafts.find((d) => d.name === api);
  const custom = data.managed.find(
    (p) => p.kind === "plans" && p.name === plan && p.api === api,
  );
  if (custom)
    return {
      quota: custom.quota,
      rate: custom.rate ?? 60,
      price: custom.value,
    };
  if (plan === "Provider Plan" && draft)
    return { quota: draft.quota, rate: draft.rate, price: draft.price };
  return {
    quota: plan === "Pro" ? 100000 : plan === "Developer" ? 10000 : 1000,
    rate: plan === "Pro" ? 300 : plan === "Developer" ? 60 : 30,
    price: plan === "Pro" ? 99 : plan === "Developer" ? 29 : 0,
  };
}
