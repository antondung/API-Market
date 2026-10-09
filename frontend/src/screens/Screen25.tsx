import { useScreenActions } from "../features/screen-actions";
export default function Screen25() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full pb-16 space-y-space-xl"}>
          <div
            className={
              "flex flex-wrap items-center justify-between gap-4 bg-surface-container-low p-space-md rounded-xl"
            }
          >
            <div className={"flex flex-wrap items-center gap-3"}>
              <div
                className={
                  "flex items-center bg-surface border border-outline-variant/50 rounded-xl px-3 py-2 text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"api"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface text-body-sm font-medium cursor-pointer pr-4"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All APIs (Global)"}>
                    {actions.text("All APIs (Global)")}
                  </option>
                  <option value={"Neural LLM v4"}>
                    {actions.text("Neural LLM v4")}
                  </option>
                  <option value={"Payment Gateway API"}>
                    {actions.text("Payment Gateway API")}
                  </option>
                  <option value={"GeoRoute v2"}>
                    {actions.text("GeoRoute v2")}
                  </option>
                  <option value={"AuthGuard Service"}>
                    {actions.text("AuthGuard Service")}
                  </option>
                </select>
              </div>
              <div
                className={
                  "flex items-center bg-surface border border-outline-variant/50 rounded-xl px-3 py-2 text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"route"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface text-body-sm font-medium cursor-pointer pr-4"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All Endpoints"}>
                    {actions.text("All Endpoints")}
                  </option>
                  <option value={"/v1/charges"}>
                    {actions.text("/v1/charges")}
                  </option>
                  <option value={"/v1/completions"}>
                    {actions.text("/v1/completions")}
                  </option>
                  <option value={"/v1/tokens"}>
                    {actions.text("/v1/tokens")}
                  </option>
                </select>
              </div>
              <div
                className={
                  "flex items-center bg-surface border border-outline-variant/50 rounded-xl px-3 py-2 text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"calendar_today"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface text-body-sm font-medium cursor-pointer pr-4"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"Last 7 Days"}>
                    {actions.text("Last 7 Days")}
                  </option>
                  <option value={"Last 30 Days"}>
                    {actions.text("Last 30 Days")}
                  </option>
                  <option value={"Year-to-Date"}>
                    {actions.text("Year-to-Date")}
                  </option>
                  <option value={"Custom Range"}>
                    {actions.text("Custom Range")}
                  </option>
                </select>
              </div>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"download Export CSV"}
                className={
                  "flex items-center gap-2 bg-surface hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-body-sm font-medium transition-all border border-outline-variant/50 shadow-sm"
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
                {actions.text(" Export CSV\n      ")}
              </button>
              <button
                data-action-text={"description Generate Report"}
                className={
                  "flex items-center gap-2 bg-primary-container text-on-primary-container hover:opacity-90 px-4 py-2 rounded-xl text-body-sm font-medium transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Generate Report")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"description"}
                </span>
                {actions.text(" Generate Report\n      ")}
              </button>
            </div>
          </div>

          <div
            className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}
          >
            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Total Requests")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"bolt"}
                </span>
              </div>
              <div className={"my-4"}>
                <div
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("1,482,920")}
                </div>
                <div
                  className={
                    "text-body-sm text-emerald-600 font-medium flex items-center gap-1 mt-1"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text(" +12.4% vs last week\n        ")}
                </div>
              </div>
              <div
                className={
                  "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                }
              >
                <div className={"bg-primary h-full w-[85%]"}></div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Unique Consumers")}
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
              <div className={"my-4"}>
                <div
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("342")}
                </div>
                <div
                  className={
                    "text-body-sm text-on-surface-variant font-medium flex items-center gap-1 mt-1"
                  }
                >
                  {actions.text(
                    "\n          Active developers globally\n        ",
                  )}
                </div>
              </div>
              <div
                className={
                  "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                }
              >
                <div className={"bg-primary h-full w-[65%]"}></div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Success Rate")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-emerald-600 text-[20px]"
                  }
                >
                  {"verified"}
                </span>
              </div>
              <div className={"my-4"}>
                <div
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("99.42%")}
                </div>
                <div
                  className={
                    "text-body-sm text-emerald-600 font-medium flex items-center gap-1 mt-1"
                  }
                >
                  {actions.text("\n          Optimal performance\n        ")}
                </div>
              </div>
              <div
                className={
                  "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                }
              >
                <div className={"bg-emerald-500 h-full w-[99.4%]"}></div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Average Latency")}
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
              <div className={"my-4"}>
                <div
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("38ms")}
                </div>
                <div
                  className={
                    "text-body-sm text-emerald-600 font-medium flex items-center gap-1 mt-1"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_downward"}
                  </span>
                  {actions.text(" -4ms optimized\n        ")}
                </div>
              </div>
              <div
                className={
                  "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                }
              >
                <div className={"bg-primary h-full w-[35%]"}></div>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 sm:grid-cols-3 gap-4"}>
            <div
              className={
                "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div>
                <div
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Active Subscribers")}
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("89")}
                </div>
                <div className={"text-body-xs text-on-surface-variant mt-0.5"}>
                  {actions.text("Enterprise & Pro plans")}
                </div>
              </div>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-primary text-[32px] p-3 bg-surface-container rounded-xl"
                }
              >
                {"workspace_premium"}
              </span>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div>
                <div
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Error Rate")}
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("0.58%")}
                </div>
                <div className={"text-body-xs text-emerald-600 mt-0.5"}>
                  {actions.text("Within SLA tolerances")}
                </div>
              </div>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-emerald-600 text-[32px] p-3 bg-surface-container rounded-xl"
                }
              >
                {"check_circle"}
              </span>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div>
                <div
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("P95 Latency")}
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("112ms")}
                </div>
                <div className={"text-body-xs text-on-surface-variant mt-0.5"}>
                  {actions.text("95th percentile threshold")}
                </div>
              </div>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-primary text-[32px] p-3 bg-surface-container rounded-xl"
                }
              >
                {"query_stats"}
              </span>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
            <div
              className={
                "lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-6"}>
                <div>
                  <div
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Request Volume Over Time")}
                  </div>
                  <div className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("Daily request spikes, peak at 242k/day")}
                  </div>
                </div>
                <div className={"flex items-center gap-2"}>
                  <span
                    className={"inline-block w-3 h-3 rounded-full bg-primary"}
                  ></span>
                  <span className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("Requests")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "w-full h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 relative"
                }
              >
                <div
                  className={
                    "absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none opacity-20"
                  }
                >
                  <div
                    className={"w-full border-b border-outline-variant"}
                  ></div>
                  <div
                    className={"w-full border-b border-outline-variant"}
                  ></div>
                  <div
                    className={"w-full border-b border-outline-variant"}
                  ></div>
                  <div
                    className={"w-full border-b border-outline-variant"}
                  ></div>
                </div>

                <div
                  className={
                    "flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t h-[45%] relative group cursor-pointer"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("120k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/30 hover:bg-primary transition-all rounded-t h-[60%] relative group cursor-pointer"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("155k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/40 hover:bg-primary transition-all rounded-t h-[50%] relative group cursor-pointer"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("130k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/60 hover:bg-primary transition-all rounded-t h-[80%] relative group cursor-pointer"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("210k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/50 hover:bg-primary transition-all rounded-t h-[70%] relative group cursor-pointer"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("185k req")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary hover:bg-primary transition-all rounded-t h-[95%] relative group cursor-pointer"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("242k req (Peak)")}
                  </div>
                </div>
                <div
                  className={
                    "flex-1 bg-primary/70 hover:bg-primary transition-all rounded-t h-[75%] relative group cursor-pointer"
                  }
                >
                  <div
                    className={
                      "absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    }
                  >
                    {actions.text("190k req")}
                  </div>
                </div>
              </div>
              <div
                className={
                  "flex justify-between text-body-xs text-on-surface-variant pt-2 border-t border-outline-variant/30"
                }
              >
                <span>{actions.text("Mon")}</span>
                <span>{actions.text("Tue")}</span>
                <span>{actions.text("Wed")}</span>
                <span>{actions.text("Thu")}</span>
                <span>{actions.text("Fri")}</span>
                <span>{actions.text("Sat (Peak)")}</span>
                <span>{actions.text("Sun")}</span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Status Distribution")}
                </div>
                <div className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("Success vs error breakdown")}
                </div>
              </div>
              <div className={"flex flex-col items-center justify-center my-6"}>
                <div
                  className={
                    "relative w-36 h-36 rounded-full border-8 border-primary flex items-center justify-center"
                  }
                >
                  <div
                    className={
                      "absolute inset-0 rounded-full border-8 border-error border-t-transparent -rotate-45"
                    }
                  ></div>
                  <div className={"text-center"}>
                    <span
                      className={
                        "text-headline-md font-headline-md text-on-surface"
                      }
                    >
                      {actions.text("99.4%")}
                    </span>
                    <span
                      className={"block text-body-xs text-on-surface-variant"}
                    >
                      {actions.text("Success")}
                    </span>
                  </div>
                </div>
              </div>
              <div className={"space-y-2"}>
                <div
                  className={"flex items-center justify-between text-body-sm"}
                >
                  <span className={"flex items-center gap-2"}>
                    <span className={"w-3 h-3 rounded bg-primary"}></span>
                    {actions.text(" 200 OK Responses")}
                  </span>
                  <span className={"font-medium"}>
                    {actions.text("1,474,320")}
                  </span>
                </div>
                <div
                  className={"flex items-center justify-between text-body-sm"}
                >
                  <span className={"flex items-center gap-2"}>
                    <span className={"w-3 h-3 rounded bg-error"}></span>
                    {actions.text(" 4xx / 5xx Errors")}
                  </span>
                  <span className={"font-medium"}>{actions.text("8,600")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6"}>
            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <div>
                  <div
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Top Endpoints Performance")}
                  </div>
                  <div className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("High volume routing distribution")}
                  </div>
                </div>
                <a
                  data-action-text={"View all chevron_right"}
                  className={
                    "text-primary text-body-sm font-medium hover:underline flex items-center gap-1"
                  }
                  href={"#"}
                >
                  {actions.text("View all ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"chevron_right"}
                  </span>
                </a>
              </div>
              <div className={"overflow-x-auto"}>
                <table className={"w-full text-left border-collapse"}>
                  <thead>
                    <tr
                      className={
                        "border-b border-outline-variant/30 text-label-md text-on-surface-variant"
                      }
                    >
                      <th className={"py-3 font-medium"}>
                        {actions.text("Endpoint")}
                      </th>
                      <th className={"py-3 font-medium"}>
                        {actions.text("Method")}
                      </th>
                      <th className={"py-3 font-medium"}>
                        {actions.text("Requests")}
                      </th>
                      <th className={"py-3 font-medium"}>
                        {actions.text("Latency")}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={
                      "text-body-sm divide-y divide-outline-variant/20"
                    }
                  >
                    <tr
                      data-record="row-0"
                      hidden={
                        !actions.matches("/v1/completions POST 684,210 45ms")
                      }
                    >
                      <td className={"py-3 font-code-sm text-on-surface"}>
                        {actions.text("/v1/completions")}
                      </td>
                      <td className={"py-3"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-primary-container text-on-primary-container rounded text-body-xs font-bold"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                      </td>
                      <td className={"py-3"}>{actions.text("684,210")}</td>
                      <td className={"py-3 text-emerald-600 font-medium"}>
                        {actions.text("45ms")}
                      </td>
                    </tr>
                    <tr
                      data-record="row-1"
                      hidden={!actions.matches("/v1/charges POST 412,050 28ms")}
                    >
                      <td className={"py-3 font-code-sm text-on-surface"}>
                        {actions.text("/v1/charges")}
                      </td>
                      <td className={"py-3"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-body-xs font-bold"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                      </td>
                      <td className={"py-3"}>{actions.text("412,050")}</td>
                      <td className={"py-3 text-emerald-600 font-medium"}>
                        {actions.text("28ms")}
                      </td>
                    </tr>
                    <tr
                      data-record="row-2"
                      hidden={!actions.matches("/v1/tokens GET 254,100 19ms")}
                    >
                      <td className={"py-3 font-code-sm text-on-surface"}>
                        {actions.text("/v1/tokens")}
                      </td>
                      <td className={"py-3"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-surface-container-high text-on-surface rounded text-body-xs font-bold"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                      </td>
                      <td className={"py-3"}>{actions.text("254,100")}</td>
                      <td className={"py-3 text-emerald-600 font-medium"}>
                        {actions.text("19ms")}
                      </td>
                    </tr>
                    <tr
                      data-record="row-3"
                      hidden={!actions.matches("/v2/georoute GET 132,560 52ms")}
                    >
                      <td className={"py-3 font-code-sm text-on-surface"}>
                        {actions.text("/v2/georoute")}
                      </td>
                      <td className={"py-3"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-surface-container-high text-on-surface rounded text-body-xs font-bold"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                      </td>
                      <td className={"py-3"}>{actions.text("132,560")}</td>
                      <td className={"py-3 text-emerald-600 font-medium"}>
                        {actions.text("52ms")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <div>
                  <div
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Latency Percentiles (24h)")}
                  </div>
                  <div className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("P50, P90, P99 track metrics")}
                  </div>
                </div>
                <div className={"flex items-center gap-3 text-body-xs"}>
                  <span className={"flex items-center gap-1"}>
                    <span className={"w-2 h-2 rounded-full bg-primary"}></span>
                    {actions.text(" P50")}
                  </span>
                  <span className={"flex items-center gap-1"}>
                    <span
                      className={"w-2 h-2 rounded-full bg-secondary"}
                    ></span>
                    {actions.text(" P90")}
                  </span>
                  <span className={"flex items-center gap-1"}>
                    <span className={"w-2 h-2 rounded-full bg-outline"}></span>
                    {actions.text(" P99")}
                  </span>
                </div>
              </div>
              <div
                className={
                  "w-full h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 relative"
                }
              >
                <div
                  className={
                    "absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none opacity-20"
                  }
                >
                  <div
                    className={"w-full border-b border-outline-variant"}
                  ></div>
                  <div
                    className={"w-full border-b border-outline-variant"}
                  ></div>
                  <div
                    className={"w-full border-b border-outline-variant"}
                  ></div>
                </div>

                <div
                  className={
                    "flex-1 flex flex-col items-center gap-1 h-full justify-end"
                  }
                >
                  <div
                    className={"w-full bg-outline/40 rounded-t h-[30%]"}
                  ></div>
                  <div
                    className={"w-full bg-secondary rounded-t h-[45%]"}
                  ></div>
                  <div className={"w-full bg-primary rounded-t h-[25%]"}></div>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-1 h-full justify-end"
                  }
                >
                  <div
                    className={"w-full bg-outline/40 rounded-t h-[35%]"}
                  ></div>
                  <div
                    className={"w-full bg-secondary rounded-t h-[50%]"}
                  ></div>
                  <div className={"w-full bg-primary rounded-t h-[30%]"}></div>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-1 h-full justify-end"
                  }
                >
                  <div
                    className={"w-full bg-outline/40 rounded-t h-[28%]"}
                  ></div>
                  <div
                    className={"w-full bg-secondary rounded-t h-[40%]"}
                  ></div>
                  <div className={"w-full bg-primary rounded-t h-[22%]"}></div>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-1 h-full justify-end"
                  }
                >
                  <div
                    className={"w-full bg-outline/40 rounded-t h-[50%]"}
                  ></div>
                  <div
                    className={"w-full bg-secondary rounded-t h-[70%]"}
                  ></div>
                  <div className={"w-full bg-primary rounded-t h-[45%]"}></div>
                </div>
                <div
                  className={
                    "flex-1 flex flex-col items-center gap-1 h-full justify-end"
                  }
                >
                  <div
                    className={"w-full bg-outline/40 rounded-t h-[40%]"}
                  ></div>
                  <div
                    className={"w-full bg-secondary rounded-t h-[60%]"}
                  ></div>
                  <div className={"w-full bg-primary rounded-t h-[35%]"}></div>
                </div>
              </div>
              <div
                className={
                  "flex justify-between text-body-xs text-on-surface-variant pt-2 border-t border-outline-variant/30"
                }
              >
                <span>{actions.text("00:00")}</span>
                <span>{actions.text("06:00")}</span>
                <span>{actions.text("12:00")}</span>
                <span>{actions.text("18:00")}</span>
                <span>{actions.text("Now")}</span>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm"
            }
          >
            <div
              className={
                "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-outline-variant/30 gap-4"
              }
            >
              <div>
                <div
                  className={
                    "text-headline-sm font-headline-sm text-on-surface flex items-center gap-2"
                  }
                >
                  {actions.text(
                    "\n          System Uptime & Health \n          ",
                  )}
                  <span
                    className={
                      "px-2 py-0.5 bg-emerald-100 text-emerald-800 text-body-xs rounded-full font-medium"
                    }
                  >
                    {actions.text("99.98% Uptime")}
                  </span>
                </div>
                <div className={"text-body-sm text-on-surface-variant mt-1"}>
                  {actions.text(
                    "Last Health Check: 12 seconds ago (All Regions Operational)",
                  )}
                </div>
              </div>
              <div className={"flex items-center gap-3"}>
                <span className={"flex items-center gap-1.5 text-body-sm"}>
                  <span
                    className={"w-2.5 h-2.5 rounded-full bg-emerald-500"}
                  ></span>
                  {actions.text(" US-East")}
                </span>
                <span className={"flex items-center gap-1.5 text-body-sm"}>
                  <span
                    className={"w-2.5 h-2.5 rounded-full bg-emerald-500"}
                  ></span>
                  {actions.text(" US-West")}
                </span>
                <span className={"flex items-center gap-1.5 text-body-sm"}>
                  <span
                    className={"w-2.5 h-2.5 rounded-full bg-emerald-500"}
                  ></span>
                  {actions.text(" EU-Central")}
                </span>
                <span className={"flex items-center gap-1.5 text-body-sm"}>
                  <span
                    className={"w-2.5 h-2.5 rounded-full bg-emerald-500"}
                  ></span>
                  {actions.text(" AP-South")}
                </span>
              </div>
            </div>
            <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
              <div className={"lg:col-span-2 space-y-4"}>
                <div
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Endpoint Response Performance")}
                </div>
                <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                  <div
                    className={
                      "bg-surface-container-low p-4 rounded-xl flex items-center justify-between"
                    }
                  >
                    <div>
                      <div
                        className={"text-body-sm font-medium text-on-surface"}
                      >
                        {actions.text("Neural LLM v4")}
                      </div>
                      <div className={"text-body-xs text-emerald-600 mt-0.5"}>
                        {actions.text("Operational • 42ms avg")}
                      </div>
                    </div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 text-[20px]"
                      }
                    >
                      {"check_circle"}
                    </span>
                  </div>
                  <div
                    className={
                      "bg-surface-container-low p-4 rounded-xl flex items-center justify-between"
                    }
                  >
                    <div>
                      <div
                        className={"text-body-sm font-medium text-on-surface"}
                      >
                        {actions.text("Payment Gateway API")}
                      </div>
                      <div className={"text-body-xs text-emerald-600 mt-0.5"}>
                        {actions.text("Operational • 24ms avg")}
                      </div>
                    </div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 text-[20px]"
                      }
                    >
                      {"check_circle"}
                    </span>
                  </div>
                  <div
                    className={
                      "bg-surface-container-low p-4 rounded-xl flex items-center justify-between"
                    }
                  >
                    <div>
                      <div
                        className={"text-body-sm font-medium text-on-surface"}
                      >
                        {actions.text("GeoRoute v2")}
                      </div>
                      <div className={"text-body-xs text-emerald-600 mt-0.5"}>
                        {actions.text("Operational • 51ms avg")}
                      </div>
                    </div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 text-[20px]"
                      }
                    >
                      {"check_circle"}
                    </span>
                  </div>
                  <div
                    className={
                      "bg-surface-container-low p-4 rounded-xl flex items-center justify-between"
                    }
                  >
                    <div>
                      <div
                        className={"text-body-sm font-medium text-on-surface"}
                      >
                        {actions.text("AuthGuard Service")}
                      </div>
                      <div className={"text-body-xs text-emerald-600 mt-0.5"}>
                        {actions.text("Operational • 18ms avg")}
                      </div>
                    </div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 text-[20px]"
                      }
                    >
                      {"check_circle"}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-low p-4 rounded-xl flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={
                      "text-label-md text-on-surface-variant uppercase tracking-wider mb-2"
                    }
                  >
                    {actions.text("Recent Incidents")}
                  </div>
                  <div
                    className={"text-body-sm font-medium text-on-surface mb-1"}
                  >
                    {actions.text("No active incidents")}
                  </div>
                  <p className={"text-body-xs text-on-surface-variant"}>
                    {actions.text(
                      "Scheduled maintenance window in 4 days. All systems operating normally without degradation.",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-body-xs"
                  }
                >
                  <span className={"text-on-surface-variant"}>
                    {actions.text("Status Page")}
                  </span>
                  <a
                    data-action-text={"View history →"}
                    className={"text-primary font-medium hover:underline"}
                    href={"#"}
                  >
                    {actions.text("View history →")}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm"
            }
          >
            <div
              className={
                "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-outline-variant/30 gap-4"
              }
            >
              <div>
                <div
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Revenue & Monetization (Simulated Estimates)")}
                </div>
                <div className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Provider financial projections and active plan tiers",
                  )}
                </div>
              </div>
              <div
                className={
                  "bg-primary-container/20 text-primary px-3 py-1.5 rounded-xl text-body-sm font-medium"
                }
              >
                {actions.text("\n        Estimated Sandbox Revenue: ")}
                <strong className={"font-headline-sm"}>
                  {actions.text("$4,280.00")}
                </strong>
              </div>
            </div>
            <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"}>
              <div className={"bg-surface-container-low p-space-md rounded-xl"}>
                <div
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider mb-4"
                  }
                >
                  {actions.text("Plan Distribution")}
                </div>
                <div className={"space-y-3"}>
                  <div>
                    <div className={"flex justify-between text-body-sm mb-1"}>
                      <span>{actions.text("Free Sandbox (45%)")}</span>
                      <span className={"font-medium"}>
                        {actions.text("154 devs")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div className={"bg-primary/40 h-full w-[45%]"}></div>
                    </div>
                  </div>
                  <div>
                    <div className={"flex justify-between text-body-sm mb-1"}>
                      <span>{actions.text("Pro Developer (35%)")}</span>
                      <span className={"font-medium"}>
                        {actions.text("120 devs")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div className={"bg-primary/70 h-full w-[35%]"}></div>
                    </div>
                  </div>
                  <div>
                    <div className={"flex justify-between text-body-sm mb-1"}>
                      <span>{actions.text("Enterprise Custom (20%)")}</span>
                      <span className={"font-medium"}>
                        {actions.text("68 devs")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div className={"bg-primary h-full w-[20%]"}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={"lg:col-span-2 overflow-x-auto"}>
                <div
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider mb-3"
                  }
                >
                  {actions.text("Simulated Transactions Ledger")}
                </div>
                <table className={"w-full text-left border-collapse"}>
                  <thead>
                    <tr
                      className={
                        "border-b border-outline-variant/30 text-label-md text-on-surface-variant"
                      }
                    >
                      <th className={"py-2 font-medium"}>
                        {actions.text("Timestamp")}
                      </th>
                      <th className={"py-2 font-medium"}>
                        {actions.text("API Name")}
                      </th>
                      <th className={"py-2 font-medium"}>
                        {actions.text("Plan Tier")}
                      </th>
                      <th className={"py-2 font-medium text-right"}>
                        {actions.text("Credit Value")}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={
                      "text-body-sm divide-y divide-outline-variant/20"
                    }
                  >
                    <tr
                      data-record="row-0"
                      hidden={
                        !actions.matches(
                          "Today, 14:22 Neural LLM v4 Enterprise Custom +$124.50",
                        )
                      }
                    >
                      <td
                        className={"py-2 text-on-surface-variant font-code-sm"}
                      >
                        {actions.text("Today, 14:22")}
                      </td>
                      <td className={"py-2 font-medium"}>
                        {actions.text("Neural LLM v4")}
                      </td>
                      <td className={"py-2"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-primary-container/20 text-primary text-body-xs rounded font-medium"
                          }
                        >
                          {actions.text("Enterprise Custom")}
                        </span>
                      </td>
                      <td
                        className={
                          "py-2 text-right font-medium text-emerald-600"
                        }
                      >
                        {actions.text("+$124.50")}
                      </td>
                    </tr>
                    <tr
                      data-record="row-1"
                      hidden={
                        !actions.matches(
                          "Today, 12:05 Payment Gateway API Pro Developer +$49.00",
                        )
                      }
                    >
                      <td
                        className={"py-2 text-on-surface-variant font-code-sm"}
                      >
                        {actions.text("Today, 12:05")}
                      </td>
                      <td className={"py-2 font-medium"}>
                        {actions.text("Payment Gateway API")}
                      </td>
                      <td className={"py-2"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-secondary-container/50 text-secondary text-body-xs rounded font-medium"
                          }
                        >
                          {actions.text("Pro Developer")}
                        </span>
                      </td>
                      <td
                        className={
                          "py-2 text-right font-medium text-emerald-600"
                        }
                      >
                        {actions.text("+$49.00")}
                      </td>
                    </tr>
                    <tr
                      data-record="row-2"
                      hidden={
                        !actions.matches(
                          "Yesterday, 09:14 GeoRoute v2 Pro Developer +$29.00",
                        )
                      }
                    >
                      <td
                        className={"py-2 text-on-surface-variant font-code-sm"}
                      >
                        {actions.text("Yesterday, 09:14")}
                      </td>
                      <td className={"py-2 font-medium"}>
                        {actions.text("GeoRoute v2")}
                      </td>
                      <td className={"py-2"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-secondary-container/50 text-secondary text-body-xs rounded font-medium"
                          }
                        >
                          {actions.text("Pro Developer")}
                        </span>
                      </td>
                      <td
                        className={
                          "py-2 text-right font-medium text-emerald-600"
                        }
                      >
                        {actions.text("+$29.00")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
            <a
              data-action-text={
                "Request History Logs Inspect granular payloads, response headers, and error codes with pre-applied filters. arrow_forward"
              }
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:bg-surface-container-low transition-all flex items-center justify-between group"
              }
              href={"#"}
            >
              <div>
                <div
                  className={
                    "text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors"
                  }
                >
                  {actions.text("Request History Logs")}
                </div>
                <div className={"text-body-sm text-on-surface-variant mt-1"}>
                  {actions.text(
                    "Inspect granular payloads, response headers, and error codes with pre-applied filters.",
                  )}
                </div>
              </div>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all text-[24px]"
                }
              >
                {"arrow_forward"}
              </span>
            </a>
            <a
              data-action-text={
                "Subscriber Management Review active enterprise accounts, rate limits, and custom tier allocations. arrow_forward"
              }
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:bg-surface-container-low transition-all flex items-center justify-between group"
              }
              href={"#"}
            >
              <div>
                <div
                  className={
                    "text-headline-sm font-headline-sm text-on-surface group-hover:text-primary transition-colors"
                  }
                >
                  {actions.text("Subscriber Management")}
                </div>
                <div className={"text-body-sm text-on-surface-variant mt-1"}>
                  {actions.text(
                    "Review active enterprise accounts, rate limits, and custom tier allocations.",
                  )}
                </div>
              </div>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all text-[24px]"
                }
              >
                {"arrow_forward"}
              </span>
            </a>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
