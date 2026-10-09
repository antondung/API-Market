import { t, useLanguage, locale } from "../i18n";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Brain,
  Search,
  Grid2X2,
  List,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useStore } from "./store";
import { Button, Modal } from "../components/ui";
export default function Marketplace() {
  useLanguage();
  const { data } = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const category = params.get("category") || "";
  const pricing = params.get("pricing") || "";
  const auth = params.get("auth") || "";
  const provider = params.get("provider") || "";
  const verified = params.get("verified") === "yes";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [view, setView] = useState("grid");
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sort, setSort] = useState("popular");
  const apis = data.apis
    .filter(
      (a) =>
        a.status === "Published" &&
        `${a.name} ${a.provider} ${a.description} ${data.drafts.some((d) => d.id === a.id) ? a.description : t(a.description)} ${t(a.category)} ${t(a.pricing)}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (!category || category === a.category) &&
        (!pricing || pricing === a.pricing) &&
        (!auth || auth === a.auth) &&
        (!provider || provider === a.provider) &&
        (!verified || a.verified === true),
    )
    .sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name, locale()) : 0,
    );
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (key !== "page") next.delete("page");
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  }
  const filters = (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-lg flex gap-2 items-center">
          <SlidersHorizontal size={18} />
          {t("Filters")}
        </h2>
        <button className="text-primary text-xs" onClick={() => setParams({})}>
          {t("Reset all")}
        </button>
      </div>
      <h3>{t("Category")}</h3>
      {Array.from(new Set(data.apis.map((a) => a.category))).map((c) => (
        <label key={c}>
          <input
            type="radio"
            name="category"
            checked={category === c}
            onChange={() => filter("category", category === c ? "" : c)}
          />
          {t(c)}
        </label>
      ))}
      <h3>{t("Pricing type")}</h3>
      {["Free", "Freemium", "Paid"].map((p) => (
        <label key={p}>
          <input
            type="radio"
            name="pricing"
            checked={pricing === p}
            onChange={() => filter("pricing", pricing === p ? "" : p)}
          />
          {t(p === "Free" ? "Free Tier Available" : p)}
        </label>
      ))}
      <h3>{t("Authentication")}</h3>
      {["Bearer Token", "OAuth 2.0", "API Key"].map((a) => (
        <label key={a}>
          <input
            type="radio"
            name="auth"
            checked={auth === a}
            onChange={() => filter("auth", auth === a ? "" : a)}
          />
          {t(a)}
        </label>
      ))}
      <h3>{t("Provider")}</h3>
      <select
        aria-label={t("Provider filter")}
        className="w-full border rounded p-3"
        value={provider}
        onChange={(e) => filter("provider", e.target.value)}
      >
        <option value="">{t("All providers")}</option>
        {Array.from(new Set(data.apis.map((a) => a.provider))).map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      <label className="mt-5">
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => filter("verified", e.target.checked ? "yes" : "")}
        />
        {t("Verified providers only")}
      </label>
    </>
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
      <div className="text-body-sm text-on-surface-variant mb-4">
        {t("Marketplace ")}
        <span className="mx-3">{t("\u203A")}</span>
        <span className="text-primary">{t("All APIs")}</span>
      </div>
      <div className="flex flex-wrap justify-between gap-6 items-end border-b border-outline-variant/20 pb-8">
        <div>
          <h1 className="hub-page-heading">
            {t("Explore High-Performance APIs")}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {t("Discover, test and integrate developer APIs in one place.")}
          </p>
        </div>
        <label className="market-search">
          <Search size={19} />
          <input
            aria-label={t("Search APIs")}
            placeholder={t("Search APIs, endpoints, tags\u2026")}
            value={query}
            onChange={(e) => filter("q", e.target.value)}
          />
        </label>
      </div>
      <Button
        className="market-mobile-filter-button mt-5"
        onClick={() => setFiltersOpen(true)}
      >
        {t("Filters")}
      </Button>
      <Modal
        title={t("Filters")}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        <div className="market-filters">{filters}</div>
        <Button className="primary mt-4" onClick={() => setFiltersOpen(false)}>
          {t("Show results")}
        </Button>
      </Modal>
      <div className="market-layout">
        <aside className="market-filters market-desktop-filters">
          {filters}
        </aside>
        <section>
          <div className="market-toolbar">
            <span>
              {t("Showing ")}
              <b className="text-primary">{t(apis.length)}</b>
              {t(" APIs \u00B7 demo catalog")}
            </span>
            <div className="flex gap-3 items-center">
              <label className="sr-only" htmlFor="sort">
                {t("Sort by")}
              </label>
              <select
                id="sort"
                className="bg-white p-2 rounded"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="popular">{t("Recommended")}</option>
                <option value="name">{t("Name A\u2013Z")}</option>
              </select>
              <button
                className="icon-button"
                onClick={() => setView("grid")}
                aria-label={t("Grid view")}
                aria-pressed={view === "grid"}
              >
                <Grid2X2 size={18} />
              </button>
              <button
                className="icon-button"
                onClick={() => setView("list")}
                aria-label={t("List view")}
                aria-pressed={view === "list"}
              >
                <List size={18} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["category", "pricing", "auth", "provider", "verified"]
              .filter((k) => params.get(k))
              .map((k) => (
                <Button
                  key={k}
                  onClick={() => filter(k, "")}
                  aria-label={`${t("Remove filter")}: ${k === "provider" ? params.get(k) : t(params.get(k) || "")}`}
                >
                  {k === "verified"
                    ? t("Verified providers only")
                    : k === "provider"
                      ? params.get(k)
                      : t(params.get(k) || "")}{" "}
                  ×
                </Button>
              ))}
          </div>
          <div className={`market-grid ${view === "list" ? "list-view" : ""}`}>
            {apis
              .slice(
                (Math.min(page, Math.max(1, Math.ceil(apis.length / 6))) - 1) *
                  6,
                Math.min(page, Math.max(1, Math.ceil(apis.length / 6))) * 6,
              )
              .map((a) => (
                <article key={a.id} className="market-card">
                  <div className="flex items-start gap-4">
                    <div className="market-avatar">
                      <Brain />
                    </div>
                    <div className="flex-1">
                      <h2>
                        <Link to={`/apis/neural-llm?api=${a.id}`}>
                          {a.name}
                        </Link>{" "}
                        {a.verified && (
                          <ShieldCheck
                            className="inline text-primary"
                            size={17}
                            aria-hidden="true"
                          />
                        )}
                      </h2>
                      <span className="text-xs text-on-surface-variant">
                        {t("by ")}
                        {a.provider}
                        {a.verified && (
                          <span className="hub-badge ml-2">
                            {t("Verified provider")}
                          </span>
                        )}
                      </span>
                    </div>
                    <label className="text-xs flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={compare.includes(a.id)}
                        onChange={(e) =>
                          setCompare((c) =>
                            e.target.checked
                              ? c.length < 4
                                ? [...c, a.id]
                                : c
                              : c.filter((x) => x !== a.id),
                          )
                        }
                      />
                      {t("Compare")}
                    </label>
                  </div>
                  <p>
                    {data.drafts.some((d) => d.id === a.id)
                      ? a.description
                      : t(a.description)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="hub-badge">{t(a.category)}</span>
                    <span className="hub-badge">{t(a.pricing)}</span>
                    <span className="hub-badge">{t(a.auth)}</span>
                  </div>
                  <div className="border-t border-outline-variant/20 pt-5 mt-6 flex justify-between items-center gap-3">
                    <span className="text-xs text-on-surface-variant">
                      {t("Monitoring: demo data only")}
                    </span>
                    <Link
                      className="hub-button primary"
                      to={`/apis/neural-llm?api=${a.id}`}
                    >
                      {t("View API ")}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
          </div>
          {!apis.length && (
            <div className="hub-panel text-center py-16">
              <h2 className="text-headline-sm">
                {t("No APIs match your filters")}
              </h2>
              <p className="text-body-md text-on-surface-variant my-4">
                {t("Try another keyword or reset the filters.")}
              </p>
              <Button onClick={() => setParams({})}>
                {t("Clear filters")}
              </Button>
            </div>
          )}
          <div className="flex justify-between mt-8 border-t border-outline-variant/20 pt-6 text-sm">
            <span>
              {t(apis.length)}
              {t("results")}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={page === 1}
                onClick={() => filter("page", String(page - 1))}
              >
                {t("Previous")}
              </Button>
              <Button
                disabled={page * 6 >= apis.length}
                onClick={() => filter("page", String(page + 1))}
              >
                {t("Next")}
              </Button>
            </div>
          </div>
        </section>
      </div>
      {compare.length > 0 && (
        <div className="workflow-state flex justify-between items-center gap-3">
          <span>
            {t(compare.length)}
            {t(" APIs selected (up to 4)")}
          </span>
          <div className="flex gap-2">
            <Button onClick={() => setCompare([])}>{t("Clear")}</Button>
            <Button className="primary" onClick={() => setShowCompare(true)}>
              {t("Compare side-by-side")}
            </Button>
            <Link
              className="hub-button"
              to={`/compare?ids=${compare.join(",")}`}
            >
              {t("Full comparison")}
            </Link>
          </div>
        </div>
      )}
      <Modal
        title={t("API Comparison")}
        open={showCompare}
        onClose={() => setShowCompare(false)}
      >
        <div className="space-y-4 mt-6">
          {data.apis
            .filter((a) => compare.includes(a.id))
            .map((a) => (
              <div key={a.id} className="hub-panel">
                <strong>{a.name}</strong>
                <p className="text-sm mt-3">
                  {t(a.pricing)}
                  {t(" \u00B7 ")}
                  {t(a.auth)}
                  {t(" \u00B7 ")}
                  {a.version}
                </p>
                <p className="text-xs mt-2 text-on-surface-variant">
                  {t("Measured health unavailable in local demo.")}
                </p>
                <Button
                  className="mt-3"
                  onClick={() => {
                    setShowCompare(false);
                    navigate(`/apis/neural-llm?api=${a.id}`);
                  }}
                >
                  {t("View API")}
                </Button>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  );
}
