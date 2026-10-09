import { useScreenActions } from "../features/screen-actions";
export default function Screen31() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full"}>
          <div
            className={
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            }
          >
            <div>
              <h1 className={"font-headline-lg text-on-surface mb-1"}>
                {actions.text("Welcome to Provider Workspace")}
              </h1>
              <p className={"font-body-md text-on-surface-variant"}>
                {actions.text(
                  "Manage your published APIs, track monetization performance, and configure developer plans.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"analytics View Reports"}
                className={
                  "bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-4 py-2.5 rounded-xl font-label-md flex items-center gap-2 transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("View Reports")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"analytics"}
                </span>
                {actions.text("\n        View Reports\n      ")}
              </button>
              <button
                data-action-text={"add Publish New API"}
                className={
                  "bg-primary text-on-primary hover:bg-primary/90 px-4 py-2.5 rounded-xl font-label-md flex items-center gap-2 transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Publish New API")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"add"}
                </span>
                {actions.text("\n        Publish New API\n      ")}
              </button>
            </div>
          </div>
          <div
            className={
              "bg-surface-container-low rounded-2xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            }
          >
            <div className={"flex items-center gap-4"}>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"verified"}
                </span>
              </div>
              <div>
                <div className={"flex items-center gap-3 mb-1"}>
                  <h2 className={"font-headline-sm text-on-surface"}>
                    {actions.text("Provider Verified")}
                  </h2>
                  <span
                    className={
                      "bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-label-md"
                    }
                  >
                    {actions.text("Active Status")}
                  </span>
                </div>
                <p className={"font-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Full publishing rights enabled. Your APIs are fully indexed across all global regions.",
                  )}
                </p>
              </div>
            </div>
            <div
              className={
                "flex items-center gap-6 lg:border-l lg:border-outline-variant/30 lg:pl-6"
              }
            >
              <div>
                <div
                  className={
                    "font-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("Partner ID")}
                </div>
                <div className={"font-code-md text-on-surface font-semibold"}>
                  {actions.text("PRV-9082")}
                </div>
              </div>
              <div>
                <div
                  className={
                    "font-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("Published APIs")}
                </div>
                <div className={"font-code-md text-on-surface font-semibold"}>
                  {actions.text("4 Active")}
                </div>
              </div>
              <div>
                <div
                  className={
                    "font-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("Total Invocations")}
                </div>
                <div className={"font-code-md text-on-surface font-semibold"}>
                  {actions.text("1.2M req/mo")}
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            }
          >
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "font-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Monthly Revenue")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"payments"}
                  </span>
                </div>
                <div className={"font-headline-lg text-on-surface mb-1"}>
                  {actions.text("$14,892.40")}
                </div>
                <div
                  className={
                    "flex items-center gap-1 text-emerald-600 font-body-sm"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"trending_up"}
                  </span>
                  <span>{actions.text("+18.4% from last month")}</span>
                </div>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "font-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Active Subscribers")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"group"}
                  </span>
                </div>
                <div className={"font-headline-lg text-on-surface mb-1"}>
                  {actions.text("842")}
                </div>
                <div
                  className={
                    "flex items-center gap-1 text-emerald-600 font-body-sm"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"trending_up"}
                  </span>
                  <span>{actions.text("+42 new this week")}</span>
                </div>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "font-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Avg Latency")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"speed"}
                  </span>
                </div>
                <div className={"font-headline-lg text-on-surface mb-1"}>
                  {actions.text("42ms")}
                </div>
                <div
                  className={
                    "flex items-center gap-1 text-emerald-600 font-body-sm"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"check_circle"}
                  </span>
                  <span>{actions.text("99.99% uptime SLA")}</span>
                </div>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "font-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Error Rate")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"warning"}
                  </span>
                </div>
                <div className={"font-headline-lg text-on-surface mb-1"}>
                  {actions.text("0.02%")}
                </div>
                <div
                  className={
                    "flex items-center gap-1 text-on-surface-variant font-body-sm"
                  }
                >
                  <span>{actions.text("Within normal parameters")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-8"}>
            <div
              className={
                "lg:col-span-2 bg-surface-container-low rounded-2xl p-6 shadow-sm"
              }
            >
              <div className={"flex items-center justify-between mb-6"}>
                <div>
                  <h3 className={"font-headline-sm text-on-surface"}>
                    {actions.text("Monetization & Performance Trends")}
                  </h3>
                  <p className={"font-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Request volume vs revenue generated over the past 30 days",
                    )}
                  </p>
                </div>
                <div className={"flex items-center gap-2"}>
                  <button
                    data-action-text={"30D"}
                    className={
                      "bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("30D")}
                  >
                    {actions.text("30D")}
                  </button>
                  <button
                    data-action-text={"90D"}
                    className={
                      "text-on-surface-variant hover:bg-surface-container-high px-3 py-1.5 rounded-lg font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("90D")}
                  >
                    {actions.text("90D")}
                  </button>
                </div>
              </div>
              <div
                className={"h-72 w-full flex items-end gap-3 pt-8 pb-2 px-2"}
              >
                <div
                  className={
                    "flex-1 bg-primary/10 rounded-t-lg hover:bg-primary/20 transition-all relative group h-[60%]"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-2 py-1 rounded text-code-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("320k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/20 rounded-t-lg hover:bg-primary/30 transition-all relative group h-[75%]"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-2 py-1 rounded text-code-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("410k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/30 rounded-t-lg hover:bg-primary/40 transition-all relative group h-[50%]"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-2 py-1 rounded text-code-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("280k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/40 rounded-t-lg hover:bg-primary/50 transition-all relative group h-[85%]"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-2 py-1 rounded text-code-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("520k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/60 rounded-t-lg hover:bg-primary/70 transition-all relative group h-[95%]"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-2 py-1 rounded text-code-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("650k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/80 rounded-t-lg hover:bg-primary/90 transition-all relative group h-[90%]"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-2 py-1 rounded text-code-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("590k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary rounded-t-lg hover:bg-primary/90 transition-all relative group h-[100%]"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-on-surface px-2 py-1 rounded text-code-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("720k req")}
                  </div>
                </div>
              </div>
              <div
                className={
                  "flex justify-between border-t border-outline-variant/30 pt-3 text-on-surface-variant font-code-sm"
                }
              >
                <span>{actions.text("Week 1")}</span>
                <span>{actions.text("Week 2")}</span>
                <span>{actions.text("Week 3")}</span>
                <span>{actions.text("Week 4")}</span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div className={"flex items-center justify-between mb-6"}>
                  <h3 className={"font-headline-sm text-on-surface"}>
                    {actions.text("Top APIs")}
                  </h3>
                  <a
                    data-action-text={"View All"}
                    className={"font-label-md text-primary hover:underline"}
                    href={"#"}
                  >
                    {actions.text("View All")}
                  </a>
                </div>
                <div className={"space-y-4"}>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-container-high transition-all"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-headline-sm"
                        }
                      >
                        {actions.text("AI")}
                      </div>
                      <div>
                        <div
                          className={"font-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Neural NLP Engine")}
                        </div>
                        <div className={"font-body-sm text-on-surface-variant"}>
                          {actions.text("v2.4.1 • REST")}
                        </div>
                      </div>
                    </div>
                    <div className={"text-right"}>
                      <div
                        className={"font-code-md font-semibold text-on-surface"}
                      >
                        {actions.text("$8,420")}
                      </div>
                      <div className={"font-body-sm text-emerald-600"}>
                        {actions.text("640k req")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-container-high transition-all"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-headline-sm"
                        }
                      >
                        {actions.text("GEO")}
                      </div>
                      <div>
                        <div
                          className={"font-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Global Geocoding")}
                        </div>
                        <div className={"font-body-sm text-on-surface-variant"}>
                          {actions.text("v1.1.0 • GraphQL")}
                        </div>
                      </div>
                    </div>
                    <div className={"text-right"}>
                      <div
                        className={"font-code-md font-semibold text-on-surface"}
                      >
                        {actions.text("$4,150")}
                      </div>
                      <div className={"font-body-sm text-emerald-600"}>
                        {actions.text("380k req")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-container-high transition-all"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center font-headline-sm"
                        }
                      >
                        {actions.text("PAY")}
                      </div>
                      <div>
                        <div
                          className={"font-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Secure Ledger Connect")}
                        </div>
                        <div className={"font-body-sm text-on-surface-variant"}>
                          {actions.text("v3.0.2 • gRPC")}
                        </div>
                      </div>
                    </div>
                    <div className={"text-right"}>
                      <div
                        className={"font-code-md font-semibold text-on-surface"}
                      >
                        {actions.text("$2,322")}
                      </div>
                      <div className={"font-body-sm text-emerald-600"}>
                        {actions.text("180k req")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                data-action-text={"Configure Pricing Tiers"}
                className={
                  "w-full mt-6 bg-surface border border-outline-variant/40 hover:bg-surface-container-high text-on-surface py-2.5 rounded-xl font-label-md transition-all"
                }
                type="button"
                aria-label={actions.text("Configure Pricing Tiers")}
              >
                {actions.text("\n        Configure Pricing Tiers\n      ")}
              </button>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
