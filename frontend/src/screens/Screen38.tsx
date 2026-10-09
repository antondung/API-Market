import { useScreenActions } from "../features/screen-actions";
export default function Screen38() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            }
          >
            <div>
              <h1
                className={
                  "text-headline-lg font-headline-lg text-on-surface mb-1"
                }
              >
                {actions.text("API Usage, Quota & Rate Limits")}
              </h1>
              <p className={"text-body-md text-on-surface-variant"}>
                {actions.text(
                  "Real-time consumption analytics, quota tracking, and throttling event logs across your active subscriptions.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3 flex-wrap"}>
              <div
                className={
                  "bg-surface-container-low rounded-xl p-1 flex items-center gap-1"
                }
              >
                <button
                  data-action-text={"Last 7 Days"}
                  className={
                    "px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm font-medium shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Last 7 Days")}
                >
                  {actions.text("Last 7 Days")}
                </button>
                <button
                  data-action-text={"Last 30 Days"}
                  className={
                    "px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-body-sm font-medium"
                  }
                  type="button"
                  aria-label={actions.text("Last 30 Days")}
                >
                  {actions.text("Last 30 Days")}
                </button>
                <button
                  data-action-text={"Custom"}
                  className={
                    "px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-body-sm font-medium"
                  }
                  type="button"
                  aria-label={actions.text("Custom")}
                >
                  {actions.text("Custom")}
                </button>
              </div>
              <select
                className={
                  "bg-surface-container-low text-on-surface text-body-sm font-medium rounded-xl px-3 py-2 outline-none cursor-pointer"
                }
                aria-label={actions.text("Input")}
              >
                <option value={"All Subscribed APIs"}>
                  {actions.text("All Subscribed APIs")}
                </option>
                <option value={"Neural LLM v4"}>
                  {actions.text("Neural LLM v4")}
                </option>
                <option value={"Vision OCR v2"}>
                  {actions.text("Vision OCR v2")}
                </option>
                <option value={"Vector Embeddings v1"}>
                  {actions.text("Vector Embeddings v1")}
                </option>
              </select>
              <button
                data-action-text={"download Export CSV"}
                className={
                  "bg-primary-container text-on-primary-container px-4 py-2 rounded-xl text-body-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                }
                type="button"
                aria-label={actions.text("Export CSV")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text("\n        Export CSV\n      ")}
              </button>
            </div>
          </div>
          <div
            className={
              "bg-amber-500/10 text-amber-900 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-start justify-between gap-4"
            }
          >
            <div className={"flex items-start gap-3"}>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-amber-600 text-[22px] mt-0.5"
                }
              >
                {"warning"}
              </span>
              <div>
                <h4
                  className={"text-body-lg font-medium text-amber-950 mb-0.5"}
                >
                  {actions.text(
                    "Quota Warning: Neural LLM v4 is at 85% capacity",
                  )}
                </h4>
                <p className={"text-body-sm text-amber-900/80"}>
                  {actions.text(
                    "425k / 500k requests consumed. Upgrade plan or configure alerts to prevent service interruption.",
                  )}
                </p>
              </div>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"Upgrade Plan"}
                className={
                  "bg-amber-600 text-white px-4 py-1.5 rounded-lg text-body-sm font-medium hover:bg-amber-700 transition-colors"
                }
                type="button"
                aria-label={actions.text("Upgrade Plan")}
              >
                {actions.text("Upgrade Plan")}
              </button>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-amber-700 cursor-pointer text-[20px] hover:text-amber-950"
                }
              >
                {"close"}
              </span>
            </div>
          </div>
          <div
            className={
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            }
          >
            <div
              className={
                "bg-surface-container-low rounded-xl p-5 flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant mb-2"
                }
              >
                <span className={"text-body-sm font-medium"}>
                  {actions.text("Total Requests")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[20px] text-primary"
                  }
                >
                  {"data_thresholding"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <span
                  className={"text-headline-md font-code-md text-on-surface"}
                >
                  {actions.text("428,500")}
                </span>
                <span
                  className={
                    "text-label-md font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded"
                  }
                >
                  {actions.text("+12.4% vs last")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-xl p-5 flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant mb-2"
                }
              >
                <span className={"text-body-sm font-medium"}>
                  {actions.text("Successful Requests")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[20px] text-emerald-600"
                  }
                >
                  {"check_circle"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <span
                  className={"text-headline-md font-code-md text-on-surface"}
                >
                  {actions.text("427,658")}
                </span>
                <span
                  className={
                    "text-label-md font-medium text-on-surface-variant"
                  }
                >
                  {actions.text("99.8%")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-xl p-5 flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant mb-2"
                }
              >
                <span className={"text-body-sm font-medium"}>
                  {actions.text("Failed Requests")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[20px] text-rose-600"
                  }
                >
                  {"error"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <span
                  className={"text-headline-md font-code-md text-on-surface"}
                >
                  {actions.text("842")}
                </span>
                <span
                  className={
                    "text-label-md font-medium text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded"
                  }
                >
                  {actions.text("0.2% 5xx")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-xl p-5 flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant mb-2"
                }
              >
                <span className={"text-body-sm font-medium"}>
                  {actions.text("Success Rate")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[20px] text-primary"
                  }
                >
                  {"trending_up"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <span
                  className={"text-headline-md font-code-md text-on-surface"}
                >
                  {actions.text("99.8%")}
                </span>
                <span
                  className={
                    "text-label-md font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded"
                  }
                >
                  {actions.text("+0.2%")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-xl p-5 flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant mb-2"
                }
              >
                <span className={"text-body-sm font-medium"}>
                  {actions.text("Average Latency")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[20px] text-primary"
                  }
                >
                  {"speed"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <span
                  className={"text-headline-md font-code-md text-on-surface"}
                >
                  {actions.text("45ms")}
                </span>
                <span
                  className={
                    "text-label-md font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded"
                  }
                >
                  {actions.text("Optimal")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-xl p-5 flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant mb-2"
                }
              >
                <span className={"text-body-sm font-medium"}>
                  {actions.text("P95 Latency")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[20px] text-primary"
                  }
                >
                  {"timer"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <span
                  className={"text-headline-md font-code-md text-on-surface"}
                >
                  {actions.text("120ms")}
                </span>
                <span
                  className={
                    "text-label-md font-medium text-on-surface-variant"
                  }
                >
                  {actions.text("Stable")}
                </span>
              </div>
            </div>
          </div>
          <div className={"grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8"}>
            <div
              className={
                "lg:col-span-8 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-6"}>
                <div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Request Volume Over Time")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Hourly traffic aggregation and status code distribution",
                    )}
                  </p>
                </div>
                <div className={"flex items-center gap-2"}>
                  <button
                    data-action-text={"All"}
                    className={
                      "px-3 py-1 bg-surface-container-highest text-on-surface rounded-lg text-body-sm font-medium"
                    }
                    type="button"
                    aria-label={actions.text("All")}
                  >
                    {actions.text("All")}
                  </button>
                  <button
                    data-action-text={"Success"}
                    className={
                      "px-3 py-1 text-on-surface-variant hover:bg-surface-container-high rounded-lg text-body-sm font-medium"
                    }
                    type="button"
                    aria-label={actions.text("Success")}
                  >
                    {actions.text("Success")}
                  </button>
                  <button
                    data-action-text={"Errors"}
                    className={
                      "px-3 py-1 text-on-surface-variant hover:bg-surface-container-high rounded-lg text-body-sm font-medium"
                    }
                    type="button"
                    aria-label={actions.text("Errors")}
                  >
                    {actions.text("Errors")}
                  </button>
                </div>
              </div>
              <div
                className={
                  "h-64 w-full flex items-end gap-2 pt-8 pb-2 relative"
                }
              >
                <div
                  className={
                    "absolute inset-x-0 top-8 bottom-2 flex flex-col justify-between pointer-events-none opacity-20"
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
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary/80 rounded-t group-hover:bg-primary transition-colors"
                    }
                    style={{ height: "65%" }}
                  ></div>
                  <span className={"text-[10px] text-on-surface-variant"}>
                    {actions.text("00:00")}
                  </span>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary/80 rounded-t group-hover:bg-primary transition-colors"
                    }
                    style={{ height: "45%" }}
                  ></div>
                  <span className={"text-[10px] text-on-surface-variant"}>
                    {actions.text("03:00")}
                  </span>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary/80 rounded-t group-hover:bg-primary transition-colors"
                    }
                    style={{ height: "30%" }}
                  ></div>
                  <span className={"text-[10px] text-on-surface-variant"}>
                    {actions.text("06:00")}
                  </span>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary/80 rounded-t group-hover:bg-primary transition-colors"
                    }
                    style={{ height: "75%" }}
                  ></div>
                  <span className={"text-[10px] text-on-surface-variant"}>
                    {actions.text("09:00")}
                  </span>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary rounded-t group-hover:opacity-90 transition-opacity relative"
                    }
                    style={{ height: "95%" }}
                  >
                    <div
                      className={
                        "absolute -top-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      }
                    >
                      {actions.text("34.2k req")}
                    </div>
                  </div>
                  <span className={"text-[10px] text-on-surface font-medium"}>
                    {actions.text("12:00")}
                  </span>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary/80 rounded-t group-hover:bg-primary transition-colors"
                    }
                    style={{ height: "85%" }}
                  ></div>
                  <span className={"text-[10px] text-on-surface-variant"}>
                    {actions.text("15:00")}
                  </span>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary/80 rounded-t group-hover:bg-primary transition-colors"
                    }
                    style={{ height: "70%" }}
                  ></div>
                  <span className={"text-[10px] text-on-surface-variant"}>
                    {actions.text("18:00")}
                  </span>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10"
                  }
                >
                  <div
                    className={
                      "w-full bg-primary/80 rounded-t group-hover:bg-primary transition-colors"
                    }
                    style={{ height: "50%" }}
                  ></div>
                  <span className={"text-[10px] text-on-surface-variant"}>
                    {actions.text("21:00")}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={
                "lg:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between"
              }
            >
              <div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Usage Distribution")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-6"}>
                  {actions.text("Traffic share across subscribed models")}
                </p>
              </div>
              <div className={"flex items-center justify-center py-4"}>
                <div
                  className={
                    "relative w-40 h-40 rounded-full flex items-center justify-center bg-surface-container-highest"
                  }
                >
                  <div
                    className={
                      "absolute inset-2 rounded-full bg-surface-container-low flex flex-col items-center justify-center"
                    }
                  >
                    <span
                      className={
                        "text-headline-md font-code-md text-on-surface"
                      }
                    >
                      {actions.text("3 APIs")}
                    </span>
                    <span className={"text-label-md text-on-surface-variant"}>
                      {actions.text("Active")}
                    </span>
                  </div>
                </div>
              </div>
              <div className={"space-y-3 mt-4"}>
                <div
                  className={"flex items-center justify-between text-body-sm"}
                >
                  <div className={"flex items-center gap-2"}>
                    <div className={"w-3 h-3 rounded bg-primary"}></div>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("Neural LLM v4")}
                    </span>
                  </div>
                  <span className={"font-code-md text-on-surface-variant"}>
                    {actions.text("79% (338k)")}
                  </span>
                </div>
                <div
                  className={"flex items-center justify-between text-body-sm"}
                >
                  <div className={"flex items-center gap-2"}>
                    <div className={"w-3 h-3 rounded bg-secondary"}></div>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("Vision OCR v2")}
                    </span>
                  </div>
                  <span className={"font-code-md text-on-surface-variant"}>
                    {actions.text("15% (64k)")}
                  </span>
                </div>
                <div
                  className={"flex items-center justify-between text-body-sm"}
                >
                  <div className={"flex items-center gap-2"}>
                    <div className={"w-3 h-3 rounded bg-outline-variant"}></div>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("Vector Embeddings v1")}
                    </span>
                  </div>
                  <span className={"font-code-md text-on-surface-variant"}>
                    {actions.text("6% (26k)")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"}>
            <div
              className={
                "bg-surface-container-low rounded-xl p-6 flex flex-col justify-between"
              }
            >
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Quota Status")}
                  </h3>
                  <button
                    data-action-text={"settings Manage Alerts"}
                    className={
                      "text-primary text-body-sm font-medium hover:underline flex items-center gap-1"
                    }
                    type="button"
                    aria-label={actions.text("Manage Alerts")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"settings"}
                    </span>
                    {actions.text("\n            Manage Alerts\n          ")}
                  </button>
                </div>
                <div
                  className={"bg-surface-container-lowest rounded-xl p-4 mb-6"}
                >
                  <div className={"flex items-center justify-between mb-2"}>
                    <span
                      className={
                        "text-body-sm font-medium text-on-surface-variant"
                      }
                    >
                      {actions.text("Total Plan Quota")}
                    </span>
                    <span
                      className={"text-body-sm font-code-md text-on-surface"}
                    >
                      {actions.text("428.5k / 500k requests")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-surface-container h-2.5 rounded-full overflow-hidden mb-3"
                    }
                  >
                    <div
                      className={"bg-amber-500 h-full rounded-full"}
                      style={{ width: "85.7%" }}
                    ></div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between text-label-md text-on-surface-variant"
                    }
                  >
                    <span>{actions.text("71.5k requests remaining")}</span>
                    <span>{actions.text("Period ends in 6 days")}</span>
                  </div>
                </div>
                <div className={"space-y-4"}>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between text-body-sm mb-1"
                      }
                    >
                      <span className={"text-on-surface font-medium"}>
                        {actions.text("Neural LLM v4")}
                      </span>
                      <span className={"text-on-surface-variant font-code-md"}>
                        {actions.text("425k / 500k (85%)")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                      }
                    >
                      <div
                        className={"bg-amber-500 h-full rounded-full"}
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between text-body-sm mb-1"
                      }
                    >
                      <span className={"text-on-surface font-medium"}>
                        {actions.text("Vision OCR v2")}
                      </span>
                      <span className={"text-on-surface-variant font-code-md"}>
                        {actions.text("64k / 100k (64%)")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                      }
                    >
                      <div
                        className={"bg-primary h-full rounded-full"}
                        style={{ width: "64%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between text-body-sm mb-1"
                      }
                    >
                      <span className={"text-on-surface font-medium"}>
                        {actions.text("Vector Embeddings v1")}
                      </span>
                      <span className={"text-on-surface-variant font-code-md"}>
                        {actions.text("26k / 50k (52%)")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                      }
                    >
                      <div
                        className={"bg-primary h-full rounded-full"}
                        style={{ width: "52%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-xl p-6 flex flex-col justify-between"
              }
            >
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Rate Limits & Throttling")}
                  </h3>
                  <span
                    className={
                      "bg-primary-container/10 text-primary px-2.5 py-1 rounded-lg text-label-md font-medium"
                    }
                  >
                    {actions.text("Pro Tier Active")}
                  </span>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest rounded-xl p-4 mb-6 flex items-center justify-between"
                  }
                >
                  <div>
                    <span
                      className={
                        "text-body-sm text-on-surface-variant block mb-1"
                      }
                    >
                      {actions.text("Current Limits")}
                    </span>
                    <span
                      className={"text-body-lg font-code-md text-on-surface"}
                    >
                      {actions.text("50 req/sec ")}
                      <span
                        className={
                          "text-on-surface-variant text-body-sm font-normal"
                        }
                      >
                        {actions.text("| 3,000 req/min burst")}
                      </span>
                    </span>
                  </div>
                  <button
                    data-action-text={"Configure"}
                    className={
                      "bg-surface-container text-on-surface px-3 py-1.5 rounded-lg text-body-sm font-medium hover:bg-surface-container-highest transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("Configure")}
                  >
                    {actions.text("Configure")}
                  </button>
                </div>
                <h4
                  className={
                    "text-body-sm font-medium text-on-surface-variant mb-3"
                  }
                >
                  {actions.text("Recent Throttling Events (429 Intercepts)")}
                </h4>
                <div className={"space-y-2"}>
                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-3 flex items-center justify-between text-body-sm"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={"w-2 h-2 rounded-full bg-amber-500"}
                      ></span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("POST /v4/chat/completions")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-4"}>
                      <span className={"text-on-surface-variant text-code-sm"}>
                        {actions.text("14:22:01 UTC")}
                      </span>
                      <span
                        className={
                          "bg-amber-500/10 text-amber-800 text-label-md px-2 py-0.5 rounded"
                        }
                      >
                        {actions.text("Mitigated")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-3 flex items-center justify-between text-body-sm"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={"w-2 h-2 rounded-full bg-amber-500"}
                      ></span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("POST /v4/chat/completions")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-4"}>
                      <span className={"text-on-surface-variant text-code-sm"}>
                        {actions.text("11:05:42 UTC")}
                      </span>
                      <span
                        className={
                          "bg-amber-500/10 text-amber-800 text-label-md px-2 py-0.5 rounded"
                        }
                      >
                        {actions.text("Mitigated")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-3 flex items-center justify-between text-body-sm"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={"w-2 h-2 rounded-full bg-rose-500"}
                      ></span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("POST /v2/ocr/scan")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-4"}>
                      <span className={"text-on-surface-variant text-code-sm"}>
                        {actions.text("09:18:15 UTC")}
                      </span>
                      <span
                        className={
                          "bg-rose-500/10 text-rose-800 text-label-md px-2 py-0.5 rounded"
                        }
                      >
                        {actions.text("Dropped")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={"bg-surface-container-low rounded-xl p-6"}>
            <div className={"flex items-center justify-between mb-6"}>
              <div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Detailed API Request History")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Real-time log stream and endpoint telemetry preview",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-3"}>
                <input
                  data-source-placeholder={"Filter logs..."}
                  className={
                    "bg-surface-container-lowest text-on-surface text-body-sm rounded-xl px-3 py-1.5 outline-none w-64"
                  }
                  placeholder={actions.text("Filter logs...")}
                  type={"text"}
                  aria-label={actions.text("Filter logs...")}
                />
                <button
                  data-action-text={"View All Logs"}
                  className={
                    "bg-surface-container text-on-surface px-3 py-1.5 rounded-xl text-body-sm font-medium hover:bg-surface-container-highest transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("View All Logs")}
                >
                  {actions.text("View All Logs")}
                </button>
              </div>
            </div>
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left text-body-sm"}>
                <thead>
                  <tr
                    className={
                      "text-on-surface-variant border-b border-outline-variant/30"
                    }
                  >
                    <th className={"pb-3 font-medium"}>
                      {actions.text("Endpoint")}
                    </th>
                    <th className={"pb-3 font-medium"}>
                      {actions.text("Method")}
                    </th>
                    <th className={"pb-3 font-medium"}>
                      {actions.text("Status")}
                    </th>
                    <th className={"pb-3 font-medium"}>
                      {actions.text("Latency")}
                    </th>
                    <th className={"pb-3 font-medium"}>
                      {actions.text("Timestamp")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "divide-y divide-outline-variant/10 text-on-surface font-code-md"
                  }
                >
                  <tr
                    className={
                      "hover:bg-surface-container/50 transition-colors"
                    }
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "/api/v4/neural/generate POST 200 OK 38ms 2025-05-12 14:32:05",
                      )
                    }
                  >
                    <td className={"py-3"}>
                      {actions.text("/api/v4/neural/generate")}
                    </td>
                    <td>
                      <span
                        className={
                          "bg-primary/10 text-primary text-label-md px-2 py-0.5 rounded font-sans"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={"text-emerald-600 font-sans font-medium"}
                      >
                        {actions.text("200 OK")}
                      </span>
                    </td>
                    <td>{actions.text("38ms")}</td>
                    <td className={"text-on-surface-variant"}>
                      {actions.text("2025-05-12 14:32:05")}
                    </td>
                  </tr>
                  <tr
                    className={
                      "hover:bg-surface-container/50 transition-colors"
                    }
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "/api/v2/vision/ocr POST 200 OK 94ms 2025-05-12 14:31:50",
                      )
                    }
                  >
                    <td className={"py-3"}>
                      {actions.text("/api/v2/vision/ocr")}
                    </td>
                    <td>
                      <span
                        className={
                          "bg-primary/10 text-primary text-label-md px-2 py-0.5 rounded font-sans"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={"text-emerald-600 font-sans font-medium"}
                      >
                        {actions.text("200 OK")}
                      </span>
                    </td>
                    <td>{actions.text("94ms")}</td>
                    <td className={"text-on-surface-variant"}>
                      {actions.text("2025-05-12 14:31:50")}
                    </td>
                  </tr>
                  <tr
                    className={
                      "hover:bg-surface-container/50 transition-colors"
                    }
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "/api/v4/neural/generate POST 429 Too Many 12ms 2025-05-12 14:22:01",
                      )
                    }
                  >
                    <td className={"py-3"}>
                      {actions.text("/api/v4/neural/generate")}
                    </td>
                    <td>
                      <span
                        className={
                          "bg-primary/10 text-primary text-label-md px-2 py-0.5 rounded font-sans"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td>
                      <span className={"text-rose-600 font-sans font-medium"}>
                        {actions.text("429 Too Many")}
                      </span>
                    </td>
                    <td>{actions.text("12ms")}</td>
                    <td className={"text-on-surface-variant"}>
                      {actions.text("2025-05-12 14:22:01")}
                    </td>
                  </tr>
                  <tr
                    className={
                      "hover:bg-surface-container/50 transition-colors"
                    }
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "/api/v1/embeddings/vectorize POST 200 OK 24ms 2025-05-12 14:20:15",
                      )
                    }
                  >
                    <td className={"py-3"}>
                      {actions.text("/api/v1/embeddings/vectorize")}
                    </td>
                    <td>
                      <span
                        className={
                          "bg-primary/10 text-primary text-label-md px-2 py-0.5 rounded font-sans"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={"text-emerald-600 font-sans font-medium"}
                      >
                        {actions.text("200 OK")}
                      </span>
                    </td>
                    <td>{actions.text("24ms")}</td>
                    <td className={"text-on-surface-variant"}>
                      {actions.text("2025-05-12 14:20:15")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
