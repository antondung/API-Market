import { useScreenActions } from "../features/screen-actions";
export default function Screen43() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full min-h-dvh pb-24"}>
          <div
            className={
              "sticky top-16 z-40 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/30 py-4 px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            }
          >
            <div className={"flex items-center gap-4"}>
              <div
                className={
                  "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {"compare_arrows"}
                </span>
              </div>
              <div>
                <div className={"flex items-center gap-2"}>
                  <h1
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("API Side-by-Side Comparison")}
                  </h1>
                  <span
                    className={
                      "px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-md font-label-md"
                    }
                  >
                    {actions.text("3 Active")}
                  </span>
                </div>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Comparing Neural LLM Inference v4, Global FX Settlement, and Zero-Trust Auth Guard",
                  )}
                </p>
              </div>
            </div>
            <div
              className={"flex items-center gap-3 w-full md:w-auto justify-end"}
            >
              <button
                data-action-text={"delete_sweep Clear All"}
                className={
                  "px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-body-md font-label-md transition-colors flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Clear All")}
                data-handler={"clearComparison()"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"delete_sweep"}
                </span>
                {actions.text("\n        Clear All\n      ")}
              </button>
              <button
                data-action-text={"share Share Matrix"}
                className={
                  "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Share Matrix")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"share"}
                </span>
                {actions.text("\n        Share Matrix\n      ")}
              </button>
            </div>
          </div>

          <div className={"max-w-7xl mx-auto w-full px-6 lg:px-12 mt-8"}>
            <div className={"flex items-center justify-between mb-8"}>
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"tune All Metrics"}
                  className={
                    "px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-body-sm font-label-md transition-colors flex items-center gap-1.5"
                  }
                  type="button"
                  aria-label={actions.text("All Metrics")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"tune"}
                  </span>
                  {actions.text("\n          All Metrics\n        ")}
                </button>
                <button
                  data-action-text={"Pricing Only"}
                  className={
                    "px-3 py-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant text-body-sm font-label-md transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Pricing Only")}
                >
                  {actions.text("\n          Pricing Only\n        ")}
                </button>
                <button
                  data-action-text={"Performance & SLAs"}
                  className={
                    "px-3 py-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant text-body-sm font-label-md transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Performance & SLAs")}
                >
                  {actions.text("\n          Performance & SLAs\n        ")}
                </button>
              </div>
              <div className={"flex items-center gap-2"}>
                <label
                  className={
                    "flex items-center gap-2 text-body-sm text-on-surface-variant cursor-pointer select-none"
                  }
                >
                  <input
                    defaultChecked={true}
                    className={"w-4 h-4 rounded text-primary accent-primary"}
                    id={"diffToggle"}
                    type={"checkbox"}
                  />
                  {actions.text("\n          Highlight differences\n        ")}
                </label>
              </div>
            </div>

            <div className={"grid grid-cols-1 md:grid-cols-4 gap-6"}>
              <div
                className={
                  "hidden md:flex flex-col gap-6 pt-2 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider"
                }
              >
                <div className={"h-28 flex items-center"}>
                  {actions.text("API Identity")}
                </div>
                <div className={"h-20 flex items-center"}>
                  {actions.text("Overview & Tags")}
                </div>
                <div className={"h-16 flex items-center"}>
                  {actions.text("Pricing Model")}
                </div>
                <div className={"h-16 flex items-center"}>
                  {actions.text("Monthly Quota")}
                </div>
                <div className={"h-16 flex items-center"}>
                  {actions.text("Rate Limits")}
                </div>
                <div className={"h-16 flex items-center"}>
                  {actions.text("Authentication")}
                </div>
                <div className={"h-36 flex items-center"}>
                  {actions.text("Supported Features")}
                </div>
                <div className={"h-20 flex items-center"}>
                  {actions.text("Verified Performance")}
                </div>
                <div className={"h-16 flex items-center"}>
                  {actions.text("Quick Actions")}
                </div>
              </div>

              <div
                className={
                  "flex flex-col gap-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm relative group"
                }
              >
                <div
                  className={
                    "absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-low p-1 rounded-lg"
                  }
                >
                  <button
                    data-action-text={"swap_horiz"}
                    className={
                      "p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-on-surface transition-colors"
                    }
                    title={actions.text("Replace API")}
                    type="button"
                    aria-label={actions.text("swap_horiz")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"swap_horiz"}
                    </span>
                  </button>
                  <button
                    data-action-text={"close"}
                    className={
                      "p-1 hover:bg-error-container rounded text-on-surface-variant hover:text-error transition-colors"
                    }
                    title={actions.text("Remove API")}
                    type="button"
                    aria-label={actions.text("Close")}
                    data-handler={"removeColumn(this)"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"close"}
                    </span>
                  </button>
                </div>

                <div className={"h-28 flex flex-col justify-center"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <div
                      className={
                        "w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-code-md text-headline-sm"
                      }
                    >
                      {actions.text("\n              AI\n            ")}
                    </div>
                    <div>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-label-md uppercase"
                        }
                      >
                        {actions.text("Core AI")}
                      </span>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface mt-0.5"
                        }
                      >
                        {actions.text("Neural LLM v4")}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className={"h-20 flex flex-col justify-center"}>
                  <p
                    className={
                      "text-body-sm text-on-surface-variant line-clamp-2"
                    }
                  >
                    {actions.text(
                      "Ultra-low latency transformer execution engine with custom fine-tuning support.",
                    )}
                  </p>
                  <div className={"flex flex-wrap gap-1 mt-1.5"}>
                    <span
                      className={
                        "px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-code-sm"
                      }
                    >
                      {actions.text("LLM")}
                    </span>
                    <span
                      className={
                        "px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-code-sm"
                      }
                    >
                      {actions.text("Inference")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Pricing")}
                  </span>
                  <div>
                    <span
                      className={
                        "px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-md font-label-md"
                      }
                    >
                      {actions.text("Paid Tier")}
                    </span>
                    <p
                      className={"text-code-sm text-on-surface-variant mt-0.5"}
                    >
                      {actions.text("$0.002 / 1k tokens")}
                    </p>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Quota")}
                  </span>
                  <span className={"font-code-md text-body-md text-on-surface"}>
                    {actions.text("100,000 req/mo")}
                  </span>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Rate Limits")}
                  </span>
                  <span className={"font-code-md text-body-md text-on-surface"}>
                    {actions.text("50 req/sec")}
                  </span>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Auth")}
                  </span>
                  <span
                    className={
                      "px-2 py-1 rounded bg-surface-container text-on-surface text-body-sm font-code-md"
                    }
                  >
                    {actions.text("Bearer Token")}
                  </span>
                </div>

                <div
                  className={
                    "h-36 flex flex-col justify-center border-t border-outline-variant/20 pt-4 gap-2"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Features")}
                  </span>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text(
                      "\n            Streaming SSE Support\n          ",
                    )}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text("\n            Function Calling\n          ")}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text(
                      "\n            Automatic Failover\n          ",
                    )}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface-variant"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-outline"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"cancel"}
                    </span>
                    {actions.text(
                      "\n            On-Premise Bridge\n          ",
                    )}
                  </div>
                </div>

                <div
                  className={
                    "h-20 flex flex-col justify-center border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant mb-1"
                    }
                  >
                    {actions.text("Performance")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Uptime")}
                    </span>
                    <span
                      className={
                        "font-code-md text-body-md text-emerald-600 font-bold"
                      }
                    >
                      {actions.text("99.99%")}
                    </span>
                  </div>
                  <div className={"flex items-center justify-between mt-1"}>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Latency")}
                    </span>
                    <span
                      className={"font-code-md text-body-md text-on-surface"}
                    >
                      {actions.text("sub-50ms")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4 gap-2"
                  }
                >
                  <a
                    data-action-text={"Playground"}
                    className={
                      "flex-1 py-2 text-center bg-primary text-on-primary rounded-lg text-body-sm font-label-md hover:bg-primary/90 transition-colors"
                    }
                    href={"#"}
                  >
                    {actions.text("Playground")}
                  </a>
                  <a
                    data-action-text={"description"}
                    className={
                      "p-2 border border-outline-variant/40 hover:bg-surface-container-high rounded-lg text-on-surface transition-colors"
                    }
                    href={"#"}
                    title={actions.text("View Docs")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"description"}
                    </span>
                  </a>
                </div>
              </div>

              <div
                className={
                  "flex flex-col gap-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm relative group"
                }
              >
                <div
                  className={
                    "absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-low p-1 rounded-lg"
                  }
                >
                  <button
                    data-action-text={"swap_horiz"}
                    className={
                      "p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-on-surface transition-colors"
                    }
                    title={actions.text("Replace API")}
                    type="button"
                    aria-label={actions.text("swap_horiz")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"swap_horiz"}
                    </span>
                  </button>
                  <button
                    data-action-text={"close"}
                    className={
                      "p-1 hover:bg-error-container rounded text-on-surface-variant hover:text-error transition-colors"
                    }
                    title={actions.text("Remove API")}
                    type="button"
                    aria-label={actions.text("Close")}
                    data-handler={"removeColumn(this)"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"close"}
                    </span>
                  </button>
                </div>

                <div className={"h-28 flex flex-col justify-center"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <div
                      className={
                        "w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-code-md text-headline-sm"
                      }
                    >
                      {actions.text("\n              FX\n            ")}
                    </div>
                    <div>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-label-md uppercase"
                        }
                      >
                        {actions.text("Fintech")}
                      </span>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface mt-0.5"
                        }
                      >
                        {actions.text("Global FX Settlement")}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className={"h-20 flex flex-col justify-center"}>
                  <p
                    className={
                      "text-body-sm text-on-surface-variant line-clamp-2"
                    }
                  >
                    {actions.text(
                      "Real-time multi-currency clearing and high-frequency exchange rate streaming.",
                    )}
                  </p>
                  <div className={"flex flex-wrap gap-1 mt-1.5"}>
                    <span
                      className={
                        "px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-code-sm"
                      }
                    >
                      {actions.text("Finance")}
                    </span>
                    <span
                      className={
                        "px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-code-sm"
                      }
                    >
                      {actions.text("FX")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Pricing")}
                  </span>
                  <div>
                    <span
                      className={
                        "px-2 py-1 rounded bg-surface-container-high text-on-surface text-label-md font-label-md"
                      }
                    >
                      {actions.text("Freemium")}
                    </span>
                    <p
                      className={"text-code-sm text-on-surface-variant mt-0.5"}
                    >
                      {actions.text("Free tier available")}
                    </p>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Quota")}
                  </span>
                  <span className={"font-code-md text-body-md text-on-surface"}>
                    {actions.text("50,000 req/mo")}
                  </span>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Rate Limits")}
                  </span>
                  <span className={"font-code-md text-body-md text-on-surface"}>
                    {actions.text("20 req/sec")}
                  </span>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Auth")}
                  </span>
                  <span
                    className={
                      "px-2 py-1 rounded bg-surface-container text-on-surface text-body-sm font-code-md"
                    }
                  >
                    {actions.text("OAuth 2.0")}
                  </span>
                </div>

                <div
                  className={
                    "h-36 flex flex-col justify-center border-t border-outline-variant/20 pt-4 gap-2"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Features")}
                  </span>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text(
                      "\n            Streaming SSE Support\n          ",
                    )}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface-variant"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-outline"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"cancel"}
                    </span>
                    {actions.text("\n            Function Calling\n          ")}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text(
                      "\n            Automatic Failover\n          ",
                    )}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text(
                      "\n            On-Premise Bridge\n          ",
                    )}
                  </div>
                </div>

                <div
                  className={
                    "h-20 flex flex-col justify-center border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant mb-1"
                    }
                  >
                    {actions.text("Performance")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Uptime")}
                    </span>
                    <span
                      className={
                        "font-code-md text-body-md text-emerald-600 font-bold"
                      }
                    >
                      {actions.text("100%")}
                    </span>
                  </div>
                  <div className={"flex items-center justify-between mt-1"}>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Latency")}
                    </span>
                    <span
                      className={"font-code-md text-body-md text-on-surface"}
                    >
                      {actions.text("real-time")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4 gap-2"
                  }
                >
                  <a
                    data-action-text={"Playground"}
                    className={
                      "flex-1 py-2 text-center bg-primary text-on-primary rounded-lg text-body-sm font-label-md hover:bg-primary/90 transition-colors"
                    }
                    href={"#"}
                  >
                    {actions.text("Playground")}
                  </a>
                  <a
                    data-action-text={"description"}
                    className={
                      "p-2 border border-outline-variant/40 hover:bg-surface-container-high rounded-lg text-on-surface transition-colors"
                    }
                    href={"#"}
                    title={actions.text("View Docs")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"description"}
                    </span>
                  </a>
                </div>
              </div>

              <div
                className={
                  "flex flex-col gap-6 bg-surface-container-lowest p-6 rounded-xl shadow-sm relative group"
                }
              >
                <div
                  className={
                    "absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-low p-1 rounded-lg"
                  }
                >
                  <button
                    data-action-text={"swap_horiz"}
                    className={
                      "p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-on-surface transition-colors"
                    }
                    title={actions.text("Replace API")}
                    type="button"
                    aria-label={actions.text("swap_horiz")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"swap_horiz"}
                    </span>
                  </button>
                  <button
                    data-action-text={"close"}
                    className={
                      "p-1 hover:bg-error-container rounded text-on-surface-variant hover:text-error transition-colors"
                    }
                    title={actions.text("Remove API")}
                    type="button"
                    aria-label={actions.text("Close")}
                    data-handler={"removeColumn(this)"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"close"}
                    </span>
                  </button>
                </div>

                <div className={"h-28 flex flex-col justify-center"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <div
                      className={
                        "w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-code-md text-headline-sm"
                      }
                    >
                      {actions.text("\n              ZT\n            ")}
                    </div>
                    <div>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-label-md uppercase"
                        }
                      >
                        {actions.text("Security")}
                      </span>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface mt-0.5"
                        }
                      >
                        {actions.text("Zero-Trust Auth")}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className={"h-20 flex flex-col justify-center"}>
                  <p
                    className={
                      "text-body-sm text-on-surface-variant line-clamp-2"
                    }
                  >
                    {actions.text(
                      "Edge-verified identity validation and granular scope enforcement.",
                    )}
                  </p>
                  <div className={"flex flex-wrap gap-1 mt-1.5"}>
                    <span
                      className={
                        "px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-code-sm"
                      }
                    >
                      {actions.text("Auth")}
                    </span>
                    <span
                      className={
                        "px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-code-sm"
                      }
                    >
                      {actions.text("Security")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Pricing")}
                  </span>
                  <div>
                    <span
                      className={
                        "px-2 py-1 rounded bg-primary-container text-on-primary-container text-label-md font-label-md"
                      }
                    >
                      {actions.text("Custom / Enterprise")}
                    </span>
                    <p
                      className={"text-code-sm text-on-surface-variant mt-0.5"}
                    >
                      {actions.text("Volume scaling")}
                    </p>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Quota")}
                  </span>
                  <span className={"font-code-md text-body-md text-on-surface"}>
                    {actions.text("Custom (Unlimited)")}
                  </span>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Rate Limits")}
                  </span>
                  <span
                    className={
                      "font-code-md text-body-md text-primary font-bold"
                    }
                  >
                    {actions.text("Unlimited")}
                  </span>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Auth")}
                  </span>
                  <span
                    className={
                      "px-2 py-1 rounded bg-surface-container text-on-surface text-body-sm font-code-md"
                    }
                  >
                    {actions.text("API Key / mTLS")}
                  </span>
                </div>

                <div
                  className={
                    "h-36 flex flex-col justify-center border-t border-outline-variant/20 pt-4 gap-2"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Features")}
                  </span>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface-variant"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-outline"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"cancel"}
                    </span>
                    {actions.text(
                      "\n            Streaming SSE Support\n          ",
                    )}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text("\n            Function Calling\n          ")}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text(
                      "\n            Automatic Failover\n          ",
                    )}
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-emerald-600"
                      }
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text(
                      "\n            On-Premise Bridge\n          ",
                    )}
                  </div>
                </div>

                <div
                  className={
                    "h-20 flex flex-col justify-center border-t border-outline-variant/20 pt-4"
                  }
                >
                  <span
                    className={
                      "md:hidden text-label-md font-label-md text-on-surface-variant mb-1"
                    }
                  >
                    {actions.text("Performance")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Uptime")}
                    </span>
                    <span
                      className={
                        "font-code-md text-body-md text-emerald-600 font-bold"
                      }
                    >
                      {actions.text("99.95%")}
                    </span>
                  </div>
                  <div className={"flex items-center justify-between mt-1"}>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Latency")}
                    </span>
                    <span
                      className={
                        "font-code-md text-body-md text-outline italic"
                      }
                    >
                      {actions.text("N/A (unmeasured)")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "h-16 flex items-center justify-between border-t border-outline-variant/20 pt-4 gap-2"
                  }
                >
                  <a
                    data-action-text={"Playground"}
                    className={
                      "flex-1 py-2 text-center bg-primary text-on-primary rounded-lg text-body-sm font-label-md hover:bg-primary/90 transition-colors"
                    }
                    href={"#"}
                  >
                    {actions.text("Playground")}
                  </a>
                  <a
                    data-action-text={"description"}
                    className={
                      "p-2 border border-outline-variant/40 hover:bg-surface-container-high rounded-lg text-on-surface transition-colors"
                    }
                    href={"#"}
                    title={actions.text("View Docs")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"description"}
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className={"mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"}>
              <div
                className={
                  "hidden md:flex flex-col justify-center items-center text-on-surface-variant font-label-md text-label-md uppercase tracking-wider"
                }
              >
                {actions.text("\n        Slot 4 Available\n      ")}
              </div>
              <div className={"md:col-span-3"}>
                <button
                  data-action-text={
                    "add Add API to Comparison Matrix Select from marketplace catalog to compare up to 4 APIs side-by-side"
                  }
                  className={
                    "w-full py-8 border-2 border-dashed border-outline-variant/40 hover:border-primary hover:bg-surface-container-low rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                  }
                  type="button"
                  aria-label={actions.text(
                    "Add API to Comparison Matrix Select from marketplace catalog to compare up to 4 APIs side-by-side",
                  )}
                  data-handler={"openAddApiModal()"}
                >
                  <div
                    className={
                      "w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-primary-container text-on-surface-variant group-hover:text-on-primary-container flex items-center justify-center transition-colors"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[24px]"}
                    >
                      {"add"}
                    </span>
                  </div>
                  <div className={"text-center"}>
                    <h4
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Add API to Comparison Matrix")}
                    </h4>
                    <p className={"text-body-sm text-on-surface-variant mt-1"}>
                      {actions.text(
                        "Select from marketplace catalog to compare up to 4 APIs side-by-side",
                      )}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
