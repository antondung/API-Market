import { useScreenActions } from "../features/screen-actions";
export default function Screen35() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full pb-16"}>
          <div
            className={
              "mb-space-lg bg-error-container text-on-error-container px-6 py-3 rounded-xl flex items-center justify-between shadow-sm"
            }
          >
            <div className={"flex items-center gap-3"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[20px] text-error"}
              >
                {"warning"}
              </span>
              <span className={"text-body-sm font-medium"}>
                {actions.text(
                  "Degraded latency detected in US-East-1 region for 3 endpoints (Auth-v2, Billing-v1, Webhooks).",
                )}
              </span>
            </div>
            <button
              data-action-text={"View Incident Report"}
              className={
                "text-body-sm font-semibold underline cursor-pointer hover:opacity-80"
              }
              type="button"
              aria-label={actions.text("View Incident Report")}
            >
              {actions.text("View Incident Report")}
            </button>
          </div>

          <div
            className={
              "flex flex-wrap items-center justify-between gap-4 mb-space-lg bg-surface-container-low p-4 rounded-xl"
            }
          >
            <div className={"flex items-center gap-3 flex-wrap"}>
              <div className={"flex bg-surface-container-high p-1 rounded-xl"}>
                <button
                  data-action-text={"Last 1h"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Last 1h")}
                >
                  {actions.text("Last 1h")}
                </button>
                <button
                  data-action-text={"24 hours"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium bg-primary text-on-primary shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("24 hours")}
                >
                  {actions.text("24 hours")}
                </button>
                <button
                  data-action-text={"7 days"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface transition-all"
                  }
                  type="button"
                  aria-label={actions.text("7 days")}
                >
                  {actions.text("7 days")}
                </button>
                <button
                  data-action-text={"30 days"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface transition-all"
                  }
                  type="button"
                  aria-label={actions.text("30 days")}
                >
                  {actions.text("30 days")}
                </button>
              </div>

              <div
                className={
                  "flex items-center bg-surface border border-outline-variant rounded-xl px-3 py-1.5 text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"dns"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface text-body-sm font-medium cursor-pointer pr-2"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"Environment: Production"}>
                    {actions.text("Environment: Production")}
                  </option>
                  <option value={"Environment: Staging"}>
                    {actions.text("Environment: Staging")}
                  </option>
                </select>
              </div>
            </div>
            <div className={"flex items-center gap-4"}>
              <div
                className={
                  "flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-outline-variant"
                }
              >
                <span
                  className={
                    "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                  }
                ></span>
                <span className={"text-body-sm font-medium text-on-surface"}>
                  {actions.text("Live (5s)")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant cursor-pointer text-[18px]"
                  }
                >
                  {"toggle_on"}
                </span>
              </div>
              <button
                data-action-text={"refresh Flush Edge Cache"}
                className={
                  "bg-primary text-on-primary px-4 py-2 rounded-xl text-body-sm font-medium hover:opacity-95 transition-all flex items-center gap-2 shadow-sm"
                }
                type="button"
                aria-label={actions.text("Flush Edge Cache")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"refresh"}
                </span>
                {actions.text("\n        Flush Edge Cache\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-space-xl"
            }
          >
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("Request Volume")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-primary"
                    }
                  >
                    {"drive_file_rename_outline"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("4.82B")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span
                  className={"text-emerald-600 font-medium flex items-center"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-0.5"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text("+12.4%")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("vs previous 24h")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("Success Rate")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-emerald-600"
                    }
                  >
                    {"check_circle"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("99.84%")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span
                  className={"text-emerald-600 font-medium flex items-center"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-0.5"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text("+0.02%")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("Optimal range")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("Error Rate")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-error"
                    }
                  >
                    {"error"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("0.16%")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span className={"text-error font-medium flex items-center"}>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-0.5"}
                  >
                    {"trending_down"}
                  </span>
                  {actions.text("-0.02%")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("Stable baseline")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("Avg Latency")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-primary"
                    }
                  >
                    {"timer"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("32ms")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span
                  className={"text-emerald-600 font-medium flex items-center"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-0.5"}
                  >
                    {"trending_down"}
                  </span>
                  {actions.text("-4ms")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("Global average")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("P95 Latency")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-amber-600"
                    }
                  >
                    {"bolt"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("78ms")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span
                  className={"text-amber-600 font-medium flex items-center"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-0.5"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text("+6ms")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("US-East Spike")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("Rate-Limited")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-primary"
                    }
                  >
                    {"block"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("142.5K")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span className={"text-on-surface-variant font-medium"}>
                  {actions.text("HTTP 429 Responses")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("24h total")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("Quota-Rejected")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-error"
                    }
                  >
                    {"data_usage"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("38.2K")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span className={"text-error font-medium"}>
                  {actions.text("Over Plan Limit")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("24h total")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "flex justify-between items-center text-on-surface-variant mb-2"
                  }
                >
                  <span
                    className={
                      "text-body-sm uppercase font-label-md tracking-wider"
                    }
                  >
                    {actions.text("API Health Status")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] text-emerald-600"
                    }
                  >
                    {"pulse_alert"}
                  </span>
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface text-emerald-600"
                  }
                >
                  {actions.text("Operational")}
                </div>
              </div>
              <div
                className={
                  "mt-4 flex items-center justify-between text-body-sm"
                }
              >
                <span className={"text-on-surface font-semibold"}>
                  {actions.text("1,428 / 1,432")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("APIs Healthy")}
                </span>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-space-xl"}>
            <div
              className={
                "lg:col-span-2 bg-inverse-surface text-inverse-on-surface p-6 rounded-xl shadow-md flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-inverse-on-surface"
                    }
                  >
                    {actions.text("Gateway Request Traffic")}
                  </h3>
                  <p className={"text-body-sm text-outline-variant"}>
                    {actions.text(
                      "Real-time throughput across global edge nodes (Requests / sec)",
                    )}
                  </p>
                </div>
                <div className={"flex items-center gap-2"}>
                  <span
                    className={
                      "text-xs bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full font-code-sm"
                    }
                  >
                    {actions.text("Peak: 68.4k req/s")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "h-64 w-full flex items-end gap-1 pt-6 pb-2 relative"
                }
              >
                <div
                  className={
                    "absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20"
                  }
                >
                  <div
                    className={"border-b border-outline-variant w-full"}
                  ></div>
                  <div
                    className={"border-b border-outline-variant w-full"}
                  ></div>
                  <div
                    className={"border-b border-outline-variant w-full"}
                  ></div>
                  <div
                    className={"border-b border-outline-variant w-full"}
                  ></div>
                </div>

                <div
                  className={
                    "flex-1 bg-primary/40 hover:bg-primary transition-all rounded-t h-[40%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/50 hover:bg-primary transition-all rounded-t h-[45%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/40 hover:bg-primary transition-all rounded-t h-[35%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/60 hover:bg-primary transition-all rounded-t h-[60%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/80 hover:bg-primary transition-all rounded-t h-[75%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary hover:bg-primary transition-all rounded-t h-[95%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/90 hover:bg-primary transition-all rounded-t h-[85%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/70 hover:bg-primary transition-all rounded-t h-[65%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/50 hover:bg-primary transition-all rounded-t h-[50%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/60 hover:bg-primary transition-all rounded-t h-[70%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/80 hover:bg-primary transition-all rounded-t h-[80%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary hover:bg-primary transition-all rounded-t h-[100%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/90 hover:bg-primary transition-all rounded-t h-[90%]"
                  }
                ></div>
                <div
                  className={
                    "flex-1 bg-primary/60 hover:bg-primary transition-all rounded-t h-[55%]"
                  }
                ></div>
              </div>
              <div
                className={
                  "flex justify-between text-xs text-outline-variant pt-2 border-t border-inverse-surface"
                }
              >
                <span>{actions.text("00:00 UTC")}</span>
                <span>{actions.text("06:00 UTC")}</span>
                <span>{actions.text("12:00 UTC")}</span>
                <span>{actions.text("18:00 UTC")}</span>
                <span>{actions.text("Now")}</span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Error Breakdown")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-6"}>
                  {actions.text("Distribution of non-2xx responses")}
                </p>
                <div className={"space-y-4"}>
                  <div>
                    <div
                      className={
                        "flex justify-between text-body-sm mb-1 font-medium"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <span
                          className={"w-3 h-3 rounded-full bg-amber-500"}
                        ></span>
                        {actions.text(" 4xx Client Errors")}
                      </span>
                      <span>{actions.text("74.2% (1.42M)")}</span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container-high h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div className={"bg-amber-500 h-full w-[74.2%]"}></div>
                    </div>
                  </div>
                  <div>
                    <div
                      className={
                        "flex justify-between text-body-sm mb-1 font-medium"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <span
                          className={"w-3 h-3 rounded-full bg-error"}
                        ></span>
                        {actions.text(" 5xx Server Errors")}
                      </span>
                      <span>{actions.text("21.8% (418K)")}</span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container-high h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div className={"bg-error h-full w-[21.8%]"}></div>
                    </div>
                  </div>
                  <div>
                    <div
                      className={
                        "flex justify-between text-body-sm mb-1 font-medium"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <span
                          className={"w-3 h-3 rounded-full bg-tertiary"}
                        ></span>
                        {actions.text(" Gateway Timeouts (504)")}
                      </span>
                      <span>{actions.text("4.0% (76K)")}</span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container-high h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div className={"bg-tertiary h-full w-[4%]"}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={
                  "mt-6 p-4 bg-surface-container-low rounded-xl flex items-center justify-between text-body-sm"
                }
              >
                <span className={"text-on-surface-variant"}>
                  {actions.text("Spike anomaly detected")}
                </span>
                <span className={"text-primary font-semibold cursor-pointer"}>
                  {actions.text("Inspect Traces")}
                </span>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-space-xl"}>
            <div
              className={"bg-surface-container-lowest p-6 rounded-xl shadow-sm"}
            >
              <div className={"flex items-center justify-between mb-4"}>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Active Alerts")}
                </h3>
                <span
                  className={
                    "bg-error-container text-on-error-container text-xs font-semibold px-2 py-0.5 rounded"
                  }
                >
                  {actions.text("3 Active")}
                </span>
              </div>
              <div className={"space-y-3"}>
                <div
                  className={
                    "p-3 bg-surface-container-low rounded-xl flex items-start gap-3"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-error text-[20px] mt-0.5"
                    }
                  >
                    {"error"}
                  </span>
                  <div className={"flex-1"}>
                    <div
                      className={"text-body-sm font-semibold text-on-surface"}
                    >
                      {actions.text("High Error Rate on /v2/payments")}
                    </div>
                    <div className={"text-body-xs text-on-surface-variant"}>
                      {actions.text("Exceeded 2.5% threshold for 15m")}
                    </div>
                  </div>
                  <span className={"text-xs text-outline font-code-sm"}>
                    {actions.text("2m ago")}
                  </span>
                </div>
                <div
                  className={
                    "p-3 bg-surface-container-low rounded-xl flex items-start gap-3"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-amber-600 text-[20px] mt-0.5"
                    }
                  >
                    {"warning"}
                  </span>
                  <div className={"flex-1"}>
                    <div
                      className={"text-body-sm font-semibold text-on-surface"}
                    >
                      {actions.text("Memory Utilization 88%")}
                    </div>
                    <div className={"text-body-xs text-on-surface-variant"}>
                      {actions.text("Edge Gateway Node eu-west-1c")}
                    </div>
                  </div>
                  <span className={"text-xs text-outline font-code-sm"}>
                    {actions.text("14m ago")}
                  </span>
                </div>
                <div
                  className={
                    "p-3 bg-surface-container-low rounded-xl flex items-start gap-3"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px] mt-0.5"
                    }
                  >
                    {"info"}
                  </span>
                  <div className={"flex-1"}>
                    <div
                      className={"text-body-sm font-semibold text-on-surface"}
                    >
                      {actions.text("Cert Renewal Warning")}
                    </div>
                    <div className={"text-body-xs text-on-surface-variant"}>
                      {actions.text("*.enterprise-api.io expires in 12 days")}
                    </div>
                  </div>
                  <span className={"text-xs text-outline font-code-sm"}>
                    {actions.text("1h ago")}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={"bg-surface-container-lowest p-6 rounded-xl shadow-sm"}
            >
              <div className={"flex items-center justify-between mb-4"}>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Provider Availability")}
                </h3>
                <span className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("Uptime (24h)")}
                </span>
              </div>
              <div className={"space-y-4"}>
                <div>
                  <div
                    className={
                      "flex justify-between text-body-sm mb-1 font-medium"
                    }
                  >
                    <span>{actions.text("Stripe Billing Provider")}</span>
                    <span className={"text-emerald-600 font-semibold"}>
                      {actions.text("99.99%")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-emerald-100 h-2 rounded-full overflow-hidden"
                    }
                  >
                    <div className={"bg-emerald-600 h-full w-[99.99%]"}></div>
                  </div>
                </div>
                <div>
                  <div
                    className={
                      "flex justify-between text-body-sm mb-1 font-medium"
                    }
                  >
                    <span>{actions.text("AWS Lambda Microservices")}</span>
                    <span className={"text-emerald-600 font-semibold"}>
                      {actions.text("99.91%")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-emerald-100 h-2 rounded-full overflow-hidden"
                    }
                  >
                    <div className={"bg-emerald-600 h-full w-[99.91%]"}></div>
                  </div>
                </div>
                <div>
                  <div
                    className={
                      "flex justify-between text-body-sm mb-1 font-medium"
                    }
                  >
                    <span>{actions.text("SendGrid Email Relay")}</span>
                    <span className={"text-amber-600 font-semibold"}>
                      {actions.text("98.40%")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-amber-100 h-2 rounded-full overflow-hidden"
                    }
                  >
                    <div className={"bg-amber-500 h-full w-[98.4%]"}></div>
                  </div>
                </div>
                <div>
                  <div
                    className={
                      "flex justify-between text-body-sm mb-1 font-medium"
                    }
                  >
                    <span>{actions.text("Snowflake Data Warehouse")}</span>
                    <span className={"text-emerald-600 font-semibold"}>
                      {actions.text("99.99%")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-emerald-100 h-2 rounded-full overflow-hidden"
                    }
                  >
                    <div className={"bg-emerald-600 h-full w-[99.99%]"}></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={"bg-surface-container-lowest p-6 rounded-xl shadow-sm"}
            >
              <div className={"flex items-center justify-between mb-4"}>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Violation Log")}
                </h3>
                <span
                  className={
                    "text-body-sm text-primary font-medium cursor-pointer"
                  }
                >
                  {actions.text("View All")}
                </span>
              </div>
              <div className={"space-y-3 font-code-sm"}>
                <div
                  className={
                    "p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between"
                  }
                >
                  <div>
                    <span className={"text-error font-semibold"}>
                      {actions.text("429")}
                    </span>
                    <span className={"text-on-surface"}>
                      {actions.text("/v1/search")}
                    </span>
                    <div className={"text-xs text-on-surface-variant"}>
                      {actions.text("Client ID: c_99281a (Tier: Free)")}
                    </div>
                  </div>
                  <span className={"text-xs text-outline"}>
                    {actions.text("Just now")}
                  </span>
                </div>
                <div
                  className={
                    "p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between"
                  }
                >
                  <div>
                    <span className={"text-error font-semibold"}>
                      {actions.text("429")}
                    </span>
                    <span className={"text-on-surface"}>
                      {actions.text("/v2/embeddings")}
                    </span>
                    <div className={"text-xs text-on-surface-variant"}>
                      {actions.text("Client ID: c_44190b (Tier: Dev)")}
                    </div>
                  </div>
                  <span className={"text-xs text-outline"}>
                    {actions.text("3m ago")}
                  </span>
                </div>
                <div
                  className={
                    "p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between"
                  }
                >
                  <div>
                    <span className={"text-amber-600 font-semibold"}>
                      {actions.text("QUOTA")}
                    </span>
                    <span className={"text-on-surface"}>
                      {actions.text("/v1/analytics")}
                    </span>
                    <div className={"text-xs text-on-surface-variant"}>
                      {actions.text("Client ID: c_11029x (Exhausted)")}
                    </div>
                  </div>
                  <span className={"text-xs text-outline"}>
                    {actions.text("7m ago")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"
            }
          >
            <div
              className={
                "p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              }
            >
              <div>
                <h3
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("API Endpoint Fleet Status")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Real-time telemetry and management controls for registered API gateways.",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-3"}>
                <div className={"relative"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]"
                    }
                  >
                    {"search"}
                  </span>
                  <input
                    data-source-placeholder={"Filter APIs or providers..."}
                    className={
                      "bg-surface border border-outline-variant rounded-xl pl-9 pr-4 py-2 text-body-sm outline-none text-on-surface w-64"
                    }
                    placeholder={actions.text("Filter APIs or providers...")}
                    type={"text"}
                    aria-label={actions.text("Filter APIs or providers...")}
                  />
                </div>
                <button
                  data-action-text={"filter_list Filter Status"}
                  className={
                    "bg-surface border border-outline-variant px-3 py-2 rounded-xl text-body-sm font-medium text-on-surface hover:bg-surface-container-low transition-all flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Filter Status")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"filter_list"}
                  </span>
                  {actions.text("\n          Filter Status\n        ")}
                </button>
              </div>
            </div>
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low text-on-surface-variant text-label-md font-label-md uppercase tracking-wider"
                    }
                  >
                    <th className={"py-3 px-6"}>{actions.text("API Name")}</th>
                    <th className={"py-3 px-6"}>{actions.text("Provider")}</th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Health Status")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Last Health Check")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Error Rate")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("P95 Latency")}
                    </th>
                    <th className={"py-3 px-6 text-right"}>
                      {actions.text("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "text-body-sm divide-y divide-surface-container-low text-on-surface"
                  }
                >
                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-all"
                    }
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "api Payments Gateway v2 Stripe Corp Healthy 12s ago 0.02% 42ms Inspect Re-check Isolate",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-6 font-medium flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"api"}
                      </span>
                      {actions.text(
                        "\n              Payments Gateway v2\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Stripe Corp")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full"
                        }
                      >
                        {actions.text("Healthy")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("12s ago")}
                    </td>
                    <td className={"py-4 px-6 text-emerald-600 font-medium"}>
                      {actions.text("0.02%")}
                    </td>
                    <td className={"py-4 px-6 font-code-sm"}>
                      {actions.text("42ms")}
                    </td>
                    <td className={"py-4 px-6 text-right space-x-2"}>
                      <button
                        data-action-text={"Inspect"}
                        className={"text-primary hover:underline font-medium"}
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openDrawer('Payments Gateway v2')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                      <button
                        data-action-text={"Re-check"}
                        className={
                          "text-on-surface-variant hover:text-on-surface"
                        }
                        type="button"
                        aria-label={actions.text("Re-check")}
                      >
                        {actions.text("Re-check")}
                      </button>
                      <button
                        data-action-text={"Isolate"}
                        className={"text-error hover:underline"}
                        type="button"
                        aria-label={actions.text("Isolate")}
                      >
                        {actions.text("Isolate")}
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-all"
                    }
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "api Authentication Hub Auth0 Enterprise Degraded 4s ago 1.45% 184ms Inspect Re-check Isolate",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-6 font-medium flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"api"}
                      </span>
                      {actions.text(
                        "\n              Authentication Hub\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Auth0 Enterprise")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full"
                        }
                      >
                        {actions.text("Degraded")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("4s ago")}
                    </td>
                    <td className={"py-4 px-6 text-amber-600 font-medium"}>
                      {actions.text("1.45%")}
                    </td>
                    <td className={"py-4 px-6 font-code-sm"}>
                      {actions.text("184ms")}
                    </td>
                    <td className={"py-4 px-6 text-right space-x-2"}>
                      <button
                        data-action-text={"Inspect"}
                        className={"text-primary hover:underline font-medium"}
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openDrawer('Authentication Hub')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                      <button
                        data-action-text={"Re-check"}
                        className={
                          "text-on-surface-variant hover:text-on-surface"
                        }
                        type="button"
                        aria-label={actions.text("Re-check")}
                      >
                        {actions.text("Re-check")}
                      </button>
                      <button
                        data-action-text={"Isolate"}
                        className={"text-error hover:underline"}
                        type="button"
                        aria-label={actions.text("Isolate")}
                      >
                        {actions.text("Isolate")}
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-all"
                    }
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "api LLM Ingestion Service OpenAI Infrastructure Healthy 28s ago 0.08% 95ms Inspect Re-check Isolate",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-6 font-medium flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"api"}
                      </span>
                      {actions.text(
                        "\n              LLM Ingestion Service\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("OpenAI Infrastructure")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full"
                        }
                      >
                        {actions.text("Healthy")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("28s ago")}
                    </td>
                    <td className={"py-4 px-6 text-emerald-600 font-medium"}>
                      {actions.text("0.08%")}
                    </td>
                    <td className={"py-4 px-6 font-code-sm"}>
                      {actions.text("95ms")}
                    </td>
                    <td className={"py-4 px-6 text-right space-x-2"}>
                      <button
                        data-action-text={"Inspect"}
                        className={"text-primary hover:underline font-medium"}
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openDrawer('LLM Ingestion Service')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                      <button
                        data-action-text={"Re-check"}
                        className={
                          "text-on-surface-variant hover:text-on-surface"
                        }
                        type="button"
                        aria-label={actions.text("Re-check")}
                      >
                        {actions.text("Re-check")}
                      </button>
                      <button
                        data-action-text={"Isolate"}
                        className={"text-error hover:underline"}
                        type="button"
                        aria-label={actions.text("Isolate")}
                      >
                        {actions.text("Isolate")}
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-all"
                    }
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "api Legacy Billing API Internal Legacy Down Just now 100% N/A Inspect Re-check Isolate",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-6 font-medium flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"api"}
                      </span>
                      {actions.text(
                        "\n              Legacy Billing API\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Internal Legacy")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "bg-error-container text-on-error-container text-xs font-semibold px-2.5 py-1 rounded-full"
                        }
                      >
                        {actions.text("Down")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("Just now")}
                    </td>
                    <td className={"py-4 px-6 text-error font-medium"}>
                      {actions.text("100%")}
                    </td>
                    <td className={"py-4 px-6 font-code-sm"}>
                      {actions.text("N/A")}
                    </td>
                    <td className={"py-4 px-6 text-right space-x-2"}>
                      <button
                        data-action-text={"Inspect"}
                        className={"text-primary hover:underline font-medium"}
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openDrawer('Legacy Billing API')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                      <button
                        data-action-text={"Re-check"}
                        className={
                          "text-on-surface-variant hover:text-on-surface"
                        }
                        type="button"
                        aria-label={actions.text("Re-check")}
                      >
                        {actions.text("Re-check")}
                      </button>
                      <button
                        data-action-text={"Isolate"}
                        className={"text-error hover:underline"}
                        type="button"
                        aria-label={actions.text("Isolate")}
                      >
                        {actions.text("Isolate")}
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-all"
                    }
                    data-record="row-4"
                    hidden={
                      !actions.matches(
                        "api Customer Data Store AWS DynamoDB Healthy 15s ago 0.01% 14ms Inspect Re-check Isolate",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-6 font-medium flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"api"}
                      </span>
                      {actions.text(
                        "\n              Customer Data Store\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("AWS DynamoDB")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full"
                        }
                      >
                        {actions.text("Healthy")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("15s ago")}
                    </td>
                    <td className={"py-4 px-6 text-emerald-600 font-medium"}>
                      {actions.text("0.01%")}
                    </td>
                    <td className={"py-4 px-6 font-code-sm"}>
                      {actions.text("14ms")}
                    </td>
                    <td className={"py-4 px-6 text-right space-x-2"}>
                      <button
                        data-action-text={"Inspect"}
                        className={"text-primary hover:underline font-medium"}
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openDrawer('Customer Data Store')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                      <button
                        data-action-text={"Re-check"}
                        className={
                          "text-on-surface-variant hover:text-on-surface"
                        }
                        type="button"
                        aria-label={actions.text("Re-check")}
                      >
                        {actions.text("Re-check")}
                      </button>
                      <button
                        data-action-text={"Isolate"}
                        className={"text-error hover:underline"}
                        type="button"
                        aria-label={actions.text("Isolate")}
                      >
                        {actions.text("Isolate")}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              className={
                "p-4 bg-surface-container-low flex items-center justify-between text-body-sm text-on-surface-variant"
              }
            >
              <span>{actions.text("Showing 5 of 1,432 registered APIs")}</span>
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"Previous"}
                  className={
                    "px-3 py-1 bg-surface rounded border border-outline-variant disabled:opacity-50"
                  }
                  disabled={true}
                  type="button"
                  aria-label={actions.text("Previous")}
                >
                  {actions.text("Previous")}
                </button>
                <span
                  className={
                    "px-3 py-1 bg-primary text-on-primary rounded font-medium"
                  }
                >
                  {actions.text("1")}
                </span>
                <button
                  data-action-text={"Next"}
                  className={
                    "px-3 py-1 bg-surface rounded border border-outline-variant hover:bg-surface-container-high transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Next")}
                >
                  {actions.text("Next")}
                </button>
              </div>
            </div>
          </div>

          <div
            className={
              "border-t border-outline-variant pt-6 flex flex-col sm:flex-row items-center justify-between text-body-sm text-on-surface-variant gap-4"
            }
          >
            <div className={"flex items-center gap-2"}>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-[18px] text-emerald-600"
                }
              >
                {"verified_user"}
              </span>
              <span>
                {actions.text(
                  "Sandbox telemetry metrics active • Read-only gateway operations view",
                )}
              </span>
            </div>
            <div className={"flex items-center gap-4"}>
              <a
                data-action-text={"Gateway Topology"}
                className={"hover:underline"}
                href={"#"}
              >
                {actions.text("Gateway Topology")}
              </a>
              <a
                data-action-text={"Global Edge Status"}
                className={"hover:underline"}
                href={"#"}
              >
                {actions.text("Global Edge Status")}
              </a>
              <a
                data-action-text={"API Hub Docs"}
                className={"hover:underline"}
                href={"#"}
              >
                {actions.text("API Hub Docs")}
              </a>
            </div>
          </div>

          <div
            id={"api-drawer"}
            className={
              actions.visible("api-drawer", true)
                ? "fixed inset-y-0 right-0 w-full max-w-xl bg-surface-container-lowest shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col"
                : "fixed inset-y-0 right-0 w-full max-w-xl bg-surface-container-lowest shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col hidden"
            }
          >
            <div
              className={
                "p-6 bg-primary text-on-primary flex items-center justify-between"
              }
            >
              <div className={"flex items-center gap-3"}>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"troubleshoot"}
                </span>
                <div>
                  <h3
                    id={"drawer-title"}
                    className={
                      actions.visible("drawer-title", true)
                        ? "text-headline-sm font-headline-sm"
                        : "text-headline-sm font-headline-sm hidden"
                    }
                  >
                    {actions.text("API Inspector")}
                  </h3>
                  <p className={"text-body-sm text-on-primary-container"}>
                    {actions.text("Gateway logs & real-time telemetry")}
                  </p>
                </div>
              </div>
              <button
                data-action-text={"close"}
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-on-primary cursor-pointer text-[24px]"
                }
                type="button"
                aria-label={actions.text("Close")}
                data-handler={"closeDrawer()"}
              >
                {"close"}
              </button>
            </div>
            <div className={"flex-1 overflow-y-auto p-6 space-y-6"}>
              <div>
                <h4
                  className={
                    "text-body-sm uppercase font-label-md text-on-surface-variant tracking-wider mb-2"
                  }
                >
                  {actions.text("Endpoint Metrics (Last 1h)")}
                </h4>
                <div className={"grid grid-cols-3 gap-3"}>
                  <div className={"bg-surface-container-low p-3 rounded-xl"}>
                    <span className={"text-body-xs text-on-surface-variant"}>
                      {actions.text("Throughput")}
                    </span>
                    <div
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("1,420 req/s")}
                    </div>
                  </div>
                  <div className={"bg-surface-container-low p-3 rounded-xl"}>
                    <span className={"text-body-xs text-on-surface-variant"}>
                      {actions.text("Avg Latency")}
                    </span>
                    <div
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("38ms")}
                    </div>
                  </div>
                  <div className={"bg-surface-container-low p-3 rounded-xl"}>
                    <span className={"text-body-xs text-on-surface-variant"}>
                      {actions.text("Error Rate")}
                    </span>
                    <div
                      className={"text-headline-sm font-headline-sm text-error"}
                    >
                      {actions.text("0.02%")}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4
                  className={
                    "text-body-sm uppercase font-label-md text-on-surface-variant tracking-wider mb-2"
                  }
                >
                  {actions.text("Redacted Operational Request Header")}
                </h4>
                <div
                  className={
                    "bg-inverse-surface text-inverse-on-surface p-4 rounded-xl font-code-sm overflow-x-auto"
                  }
                >
                  <pre>
                    <code>
                      {
                        "GET /v2/payments/charge HTTP/1.1\nHost: api.gateway.hub\nAuthorization: Bearer sk_live_************************\nX-Forwarded-For: 192.168.1.104\nX-RateLimit-Remaining: 4982\nUser-Agent: APIHub-Client/v4.2"
                      }
                    </code>
                  </pre>
                </div>
              </div>
              <div>
                <h4
                  className={
                    "text-body-sm uppercase font-label-md text-on-surface-variant tracking-wider mb-2"
                  }
                >
                  {actions.text("Recent Event History")}
                </h4>
                <div className={"space-y-2 text-body-sm"}>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
                    }
                  >
                    <span className={"text-on-surface"}>
                      {actions.text("Health probe checked (HTTP 200 OK)")}
                    </span>
                    <span className={"text-xs text-outline font-code-sm"}>
                      {actions.text("12s ago")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
                    }
                  >
                    <span className={"text-on-surface"}>
                      {actions.text("Edge node cache purged")}
                    </span>
                    <span className={"text-xs text-outline font-code-sm"}>
                      {actions.text("45m ago")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
                    }
                  >
                    <span className={"text-on-surface"}>
                      {actions.text("SSL Certificate auto-renewed")}
                    </span>
                    <span className={"text-xs text-outline font-code-sm"}>
                      {actions.text("3d ago")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={
                "p-4 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3"
              }
            >
              <button
                data-action-text={"Close"}
                className={
                  "px-4 py-2 bg-surface border border-outline-variant text-on-surface rounded-xl text-body-sm font-medium"
                }
                type="button"
                aria-label={actions.text("Close")}
                data-handler={"closeDrawer()"}
              >
                {actions.text("Close")}
              </button>
              <button
                data-action-text={"Force Re-check Endpoint"}
                className={
                  "px-4 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-medium"
                }
                type="button"
                aria-label={actions.text("Force Re-check Endpoint")}
              >
                {actions.text("Force Re-check Endpoint")}
              </button>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
