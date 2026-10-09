import { useScreenActions } from "../features/screen-actions";
export default function Screen11() {
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
              "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
            }
          >
            <div>
              <div className={"flex items-center gap-3 mb-2"}>
                <span
                  className={
                    "inline-flex items-center px-2.5 py-1 rounded-full text-label-md font-label-md bg-primary-container text-on-primary-container"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-1"}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {"verified"}
                  </span>
                  {actions.text("\n          Verified Consumer\n        ")}
                </span>
                <span className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("Workspace ID: ")}
                  <strong className={"font-code-md text-on-surface"}>
                    {actions.text("ws_dev_8892a")}
                  </strong>
                </span>
              </div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("Welcome back, Alex")}
              </h1>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Here is the real-time overview of your API consumption, active credentials, and recent telemetry.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"add_box New API Request"}
                className={
                  "flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all rounded-xl text-body-md font-medium shadow-sm"
                }
                type="button"
                aria-label={actions.text("New API Request")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"add_box"}
                </span>
                {actions.text("\n        New API Request\n      ")}
              </button>
              <button
                data-action-text={"key Manage Keys"}
                className={
                  "flex items-center gap-2 px-4 py-2 bg-primary text-on-primary hover:opacity-95 transition-all rounded-xl text-body-md font-medium shadow-sm"
                }
                type="button"
                aria-label={actions.text("Manage Keys")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"key"}
                </span>
                {actions.text("\n        Manage Keys\n      ")}
              </button>
            </div>
          </div>
          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"}>
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group"
              }
            >
              <div
                className={
                  "absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"
                }
              ></div>
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Account Tier")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-primary"}
                  >
                    {"workspace_premium"}
                  </span>
                </div>
                <div className={"flex items-baseline gap-2"}>
                  <span
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Developer Free")}
                  </span>
                  <span className={"text-body-sm text-secondary font-medium"}>
                    {actions.text("Active")}
                  </span>
                </div>
                <p className={"text-body-sm text-on-surface-variant mt-2"}>
                  {actions.text(
                    "Up to 100,000 requests/mo with standard rate limiting.",
                  )}
                </p>
              </div>
              <div className={"mt-6 pt-4 flex items-center justify-between"}>
                <a
                  data-action-text={"Upgrade Plan arrow_forward"}
                  className={
                    "text-body-sm font-medium text-primary hover:underline flex items-center gap-1"
                  }
                  href={"#"}
                >
                  {actions.text("Upgrade Plan ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </a>
                <span className={"text-code-sm text-on-surface-variant"}>
                  {actions.text("ID: 9942-DEV")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group"
              }
            >
              <div
                className={
                  "absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"
                }
              ></div>
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Active Credentials")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-primary"}
                  >
                    {"vpn_key"}
                  </span>
                </div>
                <div className={"flex items-baseline gap-2"}>
                  <span
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("3 Keys")}
                  </span>
                  <span className={"text-body-sm text-emerald-600 font-medium"}>
                    {actions.text("All Healthy")}
                  </span>
                </div>
                <p className={"text-body-sm text-on-surface-variant mt-2"}>
                  {actions.text(
                    "Last rotated 14 days ago across production environments.",
                  )}
                </p>
              </div>
              <div className={"mt-6 pt-4 flex items-center justify-between"}>
                <a
                  data-action-text={"View All Keys arrow_forward"}
                  className={
                    "text-body-sm font-medium text-primary hover:underline flex items-center gap-1"
                  }
                  href={"#"}
                >
                  {actions.text("View All Keys ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </a>
                <span className={"text-code-sm text-on-surface-variant"}>
                  {actions.text("Secured")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group"
              }
            >
              <div
                className={
                  "absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"
                }
              ></div>
              <div>
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Monthly Quota")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-primary"}
                  >
                    {"pie_chart"}
                  </span>
                </div>
                <div className={"flex items-baseline justify-between"}>
                  <span
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("84% Left")}
                  </span>
                  <span className={"text-code-sm text-on-surface-variant"}>
                    {actions.text("84,200 / 100k")}
                  </span>
                </div>
                <div
                  className={
                    "w-full bg-surface-container-high h-2 rounded-full mt-3 overflow-hidden"
                  }
                >
                  <div
                    className={"bg-primary h-full rounded-full"}
                    style={{ width: "16%" }}
                  ></div>
                </div>
              </div>
              <div className={"mt-6 pt-4 flex items-center justify-between"}>
                <a
                  data-action-text={"View Usage Metrics arrow_forward"}
                  className={
                    "text-body-sm font-medium text-primary hover:underline flex items-center gap-1"
                  }
                  href={"#"}
                >
                  {actions.text("View Usage Metrics ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </a>
                <span className={"text-code-sm text-on-surface-variant"}>
                  {actions.text("Resets in 12d")}
                </span>
              </div>
            </div>
          </div>
          <div className={"mb-8"}>
            <div className={"flex items-center justify-between mb-4"}>
              <h2
                className={"text-headline-sm font-headline-sm text-on-surface"}
              >
                {actions.text("Quick Actions & Workspaces")}
              </h2>
              <span className={"text-body-sm text-on-surface-variant"}>
                {actions.text("Shortcuts to high-frequency tools")}
              </span>
            </div>
            <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
              <a
                data-action-text={
                  "explore Explore APIs Browse verified microservices, financial feeds, and AI endpoints. Browse Catalog arrow_forward"
                }
                className={
                  "group bg-surface-container-low hover:bg-surface-container-high transition-all p-6 rounded-2xl shadow-sm flex flex-col justify-between"
                }
                href={"#"}
              >
                <div>
                  <div
                    className={
                      "w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[24px]"}
                    >
                      {"explore"}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-1"
                    }
                  >
                    {actions.text("Explore APIs")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Browse verified microservices, financial feeds, and AI endpoints.",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "mt-6 flex items-center text-primary text-body-sm font-medium gap-1"
                  }
                >
                  {actions.text("\n          Browse Catalog ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </div>
              </a>
              <a
                data-action-text={
                  "terminal API Playground Test payloads, simulate headers, and inspect response latencies instantly. Launch Playground arrow_forward"
                }
                className={
                  "group bg-surface-container-low hover:bg-surface-container-high transition-all p-6 rounded-2xl shadow-sm flex flex-col justify-between"
                }
                href={"#"}
              >
                <div>
                  <div
                    className={
                      "w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[24px]"}
                    >
                      {"terminal"}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-1"
                    }
                  >
                    {actions.text("API Playground")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Test payloads, simulate headers, and inspect response latencies instantly.",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "mt-6 flex items-center text-primary text-body-sm font-medium gap-1"
                  }
                >
                  {actions.text("\n          Launch Playground ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </div>
              </a>
              <a
                data-action-text={
                  "key API Keys Vault Generate secret tokens, rotate credentials, and define scope permissions. Manage Keys arrow_forward"
                }
                className={
                  "group bg-surface-container-low hover:bg-surface-container-high transition-all p-6 rounded-2xl shadow-sm flex flex-col justify-between"
                }
                href={"#"}
              >
                <div>
                  <div
                    className={
                      "w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[24px]"}
                    >
                      {"key"}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-1"
                    }
                  >
                    {actions.text("API Keys Vault")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Generate secret tokens, rotate credentials, and define scope permissions.",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "mt-6 flex items-center text-primary text-body-sm font-medium gap-1"
                  }
                >
                  {actions.text("\n          Manage Keys ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </div>
              </a>
            </div>
          </div>
          <div className={"bg-surface-container-low rounded-2xl p-6 shadow-sm"}>
            <div
              className={
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
              }
            >
              <div>
                <h2
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Recent Activity & Request History")}
                </h2>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Live telemetry stream across your active consumer API subscriptions.",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"All Statuses"}
                  className={
                    "px-3 py-1.5 bg-surface-container-high text-on-surface rounded-xl text-body-sm font-medium hover:bg-surface-container-highest transition-all"
                  }
                  type="button"
                  aria-label={actions.text("All Statuses")}
                >
                  {actions.text("All Statuses")}
                </button>
                <button
                  data-action-text={"Export CSV"}
                  className={
                    "px-3 py-1.5 bg-transparent text-on-surface-variant rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Export CSV")}
                >
                  {actions.text("Export CSV")}
                </button>
              </div>
            </div>
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "border-b border-outline-variant/30 text-label-md font-label-md text-on-surface-variant"
                    }
                  >
                    <th className={"py-3 px-4"}>{actions.text("Endpoint")}</th>
                    <th className={"py-3 px-4"}>{actions.text("Method")}</th>
                    <th className={"py-3 px-4"}>{actions.text("Status")}</th>
                    <th className={"py-3 px-4"}>{actions.text("Latency")}</th>
                    <th className={"py-3 px-4 text-right"}>
                      {actions.text("Timestamp")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={"divide-y divide-outline-variant/10 text-body-sm"}
                >
                  <tr
                    className={
                      "hover:bg-surface-container-high/50 transition-colors"
                    }
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "/v1/finance/stocks/quote GET 200 OK 142ms 2 mins ago",
                      )
                    }
                  >
                    <td className={"py-3 px-4 font-code-md text-on-surface"}>
                      {actions.text("/v1/finance/stocks/quote")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-secondary-container text-on-secondary-container"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 text-emerald-600 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-600"}
                        ></span>
                        {actions.text(" 200 OK")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("142ms")}
                    </td>
                    <td
                      className={"py-3 px-4 text-right text-on-surface-variant"}
                    >
                      {actions.text("2 mins ago")}
                    </td>
                  </tr>
                  <tr
                    className={
                      "hover:bg-surface-container-high/50 transition-colors"
                    }
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "/v1/ai/embeddings/generate POST 201 Created 380ms 12 mins ago",
                      )
                    }
                  >
                    <td className={"py-3 px-4 font-code-md text-on-surface"}>
                      {actions.text("/v1/ai/embeddings/generate")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-primary-container text-on-primary-container"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 text-emerald-600 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-600"}
                        ></span>
                        {actions.text(" 201 Created")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("380ms")}
                    </td>
                    <td
                      className={"py-3 px-4 text-right text-on-surface-variant"}
                    >
                      {actions.text("12 mins ago")}
                    </td>
                  </tr>
                  <tr
                    className={
                      "hover:bg-surface-container-high/50 transition-colors"
                    }
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "/v2/weather/forecast/hourly GET 429 Too Many Requests 45ms 45 mins ago",
                      )
                    }
                  >
                    <td className={"py-3 px-4 font-code-md text-on-surface"}>
                      {actions.text("/v2/weather/forecast/hourly")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-secondary-container text-on-secondary-container"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 text-rose-600 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-rose-600"}
                        ></span>
                        {actions.text(" 429 Too Many Requests")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("45ms")}
                    </td>
                    <td
                      className={"py-3 px-4 text-right text-on-surface-variant"}
                    >
                      {actions.text("45 mins ago")}
                    </td>
                  </tr>
                  <tr
                    className={
                      "hover:bg-surface-container-high/50 transition-colors"
                    }
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "/v1/auth/token/exchange POST 200 OK 98ms 1 hour ago",
                      )
                    }
                  >
                    <td className={"py-3 px-4 font-code-md text-on-surface"}>
                      {actions.text("/v1/auth/token/exchange")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-primary-container text-on-primary-container"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 text-emerald-600 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-600"}
                        ></span>
                        {actions.text(" 200 OK")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("98ms")}
                    </td>
                    <td
                      className={"py-3 px-4 text-right text-on-surface-variant"}
                    >
                      {actions.text("1 hour ago")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              className={
                "mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between"
              }
            >
              <span className={"text-body-sm text-on-surface-variant"}>
                {actions.text("Showing latest 4 of 1,420 requests today")}
              </span>
              <a
                data-action-text={"View Full History arrow_forward"}
                className={
                  "text-body-sm font-medium text-primary hover:underline flex items-center gap-1"
                }
                href={"#"}
              >
                {actions.text("View Full History ")}
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"arrow_forward"}
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
