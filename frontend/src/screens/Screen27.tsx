import { useScreenActions } from "../features/screen-actions";
export default function Screen27() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg"
            }
          >
            <div>
              <div className={"flex items-center gap-2 mb-1"}>
                <span
                  className={
                    "px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md uppercase tracking-wider"
                  }
                >
                  {actions.text("Production Workspace")}
                </span>
                <span className={"text-on-surface-variant font-body-sm"}>
                  {actions.text("• Last sync: Just now")}
                </span>
              </div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("Welcome back, Developer")}
              </h1>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"download Export Metrics"}
                className={
                  "flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-md hover:bg-surface-container-high transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Export Metrics")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text("\n        Export Metrics\n      ")}
              </button>
              <button
                data-action-text={"add Create New API"}
                className={
                  "flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Create New API")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"add"}
                </span>
                {actions.text("\n        Create New API\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-space-lg"
            }
          >
            <div
              className={
                "flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
              }
            >
              <div className={"flex items-center justify-between mb-2"}>
                <span className={"text-on-surface-variant font-body-sm"}>
                  {actions.text("Total APIs")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-1.5 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-[18px]"
                  }
                >
                  {"api"}
                </span>
              </div>
              <div
                className={
                  "text-headline-md font-headline-md text-on-surface mb-1"
                }
              >
                {actions.text("14")}
              </div>
              <div
                className={
                  "flex items-center gap-1 text-emerald-600 font-label-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"trending_up"}
                </span>
                <span>{actions.text("+2 this month")}</span>
              </div>
            </div>

            <div
              className={
                "flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
              }
            >
              <div className={"flex items-center justify-between mb-2"}>
                <span className={"text-on-surface-variant font-body-sm"}>
                  {actions.text("Published")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-1.5 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-[18px]"
                  }
                >
                  {"public"}
                </span>
              </div>
              <div
                className={
                  "text-headline-md font-headline-md text-on-surface mb-1"
                }
              >
                {actions.text("9")}
              </div>
              <div className={"text-on-surface-variant font-body-sm"}>
                {actions.text("5 in staging")}
              </div>
            </div>

            <div
              className={
                "flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
              }
            >
              <div className={"flex items-center justify-between mb-2"}>
                <span className={"text-on-surface-variant font-body-sm"}>
                  {actions.text("Subscribers")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-1.5 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-[18px]"
                  }
                >
                  {"group"}
                </span>
              </div>
              <div
                className={
                  "text-headline-md font-headline-md text-on-surface mb-1"
                }
              >
                {actions.text("1,420")}
              </div>
              <div
                className={
                  "flex items-center gap-1 text-emerald-600 font-label-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"trending_up"}
                </span>
                <span>{actions.text("+12.4%")}</span>
              </div>
            </div>

            <div
              className={
                "flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
              }
            >
              <div className={"flex items-center justify-between mb-2"}>
                <span className={"text-on-surface-variant font-body-sm"}>
                  {actions.text("Total Requests")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-1.5 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-[18px]"
                  }
                >
                  {"bolt"}
                </span>
              </div>
              <div
                className={
                  "text-headline-md font-headline-md text-on-surface mb-1"
                }
              >
                {actions.text("12.4M")}
              </div>
              <div
                className={
                  "flex items-center gap-1 text-emerald-600 font-label-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"trending_up"}
                </span>
                <span>{actions.text("+8.1% vs last wk")}</span>
              </div>
            </div>

            <div
              className={
                "flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
              }
            >
              <div className={"flex items-center justify-between mb-2"}>
                <span className={"text-on-surface-variant font-body-sm"}>
                  {actions.text("Error Rate")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-1.5 rounded-lg bg-surface-container-low text-emerald-600 material-symbols-outlined text-[18px]"
                  }
                >
                  {"check_circle"}
                </span>
              </div>
              <div
                className={
                  "text-headline-md font-headline-md text-on-surface mb-1"
                }
              >
                {actions.text("0.04%")}
              </div>
              <div className={"text-on-surface-variant font-body-sm"}>
                {actions.text("Optimal performance")}
              </div>
            </div>

            <div
              className={
                "flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
              }
            >
              <div className={"flex items-center justify-between mb-2"}>
                <span className={"text-on-surface-variant font-body-sm"}>
                  {actions.text("Sandbox Rev")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-1.5 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-[18px]"
                  }
                >
                  {"payments"}
                </span>
              </div>
              <div
                className={
                  "text-headline-md font-headline-md text-on-surface mb-1"
                }
              >
                {actions.text("$8,420")}
              </div>
              <div
                className={
                  "flex items-center gap-1 text-emerald-600 font-label-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"trending_up"}
                </span>
                <span>{actions.text("+15.3%")}</span>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-space-lg"}>
            <div className={"lg:col-span-2 space-y-6"}>
              <div
                className={
                  "p-6 rounded-xl bg-surface-container-lowest shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-6"}>
                  <div>
                    <h2
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("API Request Volume")}
                    </h2>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Real-time telemetry across all published endpoints",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 bg-surface-container-low p-1 rounded-xl"
                    }
                  >
                    <button
                      data-action-text={"24H"}
                      className={
                        "px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-md shadow-sm"
                      }
                      type="button"
                      aria-label={actions.text("24H")}
                    >
                      {actions.text("24H")}
                    </button>
                    <button
                      data-action-text={"7D"}
                      className={
                        "px-3 py-1 rounded-lg text-on-surface-variant font-label-md hover:text-on-surface"
                      }
                      type="button"
                      aria-label={actions.text("7D")}
                    >
                      {actions.text("7D")}
                    </button>
                    <button
                      data-action-text={"30D"}
                      className={
                        "px-3 py-1 rounded-lg text-on-surface-variant font-label-md hover:text-on-surface"
                      }
                      type="button"
                      aria-label={actions.text("30D")}
                    >
                      {actions.text("30D")}
                    </button>
                  </div>
                </div>

                <div
                  className={"w-full h-64 relative flex flex-col justify-end"}
                >
                  <div
                    className={
                      "absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20"
                    }
                  >
                    <div className={"w-full border-b border-outline"}></div>
                    <div className={"w-full border-b border-outline"}></div>
                    <div className={"w-full border-b border-outline"}></div>
                    <div className={"w-full border-b border-outline"}></div>
                  </div>
                  <svg
                    className={"w-full h-48 overflow-visible"}
                    fill={"none"}
                    viewBox={"0 0 800 200"}
                    xmlns={"http://www.w3.org/2000/svg"}
                  >
                    <defs>
                      <linearGradient
                        id={"chart-gradient"}
                        x1={"0"}
                        x2={"0"}
                        y1={"0"}
                        y2={"1"}
                      >
                        <stop
                          offset={"0%"}
                          stopColor={"#2a14b4"}
                          stopOpacity={"0.25"}
                        ></stop>
                        <stop
                          offset={"100%"}
                          stopColor={"#2a14b4"}
                          stopOpacity={"0.0"}
                        ></stop>
                      </linearGradient>
                    </defs>
                    <path
                      d={
                        "M0 150 C 100 130, 200 160, 300 90 C 400 20, 500 110, 600 60 C 700 10, 750 40, 800 20 L 800 200 L 0 200 Z"
                      }
                      fill={"url(#chart-gradient)"}
                    ></path>
                    <path
                      d={
                        "M0 150 C 100 130, 200 160, 300 90 C 400 20, 500 110, 600 60 C 700 10, 750 40, 800 20"
                      }
                      stroke={"#2a14b4"}
                      strokeLinecap={"round"}
                      strokeWidth={"3"}
                    ></path>
                  </svg>
                  <div
                    className={
                      "flex justify-between text-body-sm text-on-surface-variant mt-4"
                    }
                  >
                    <span>{actions.text("00:00")}</span>
                    <span>{actions.text("04:00")}</span>
                    <span>{actions.text("08:00")}</span>
                    <span>{actions.text("12:00")}</span>
                    <span>{actions.text("16:00")}</span>
                    <span>{actions.text("20:00")}</span>
                    <span>{actions.text("Now")}</span>
                  </div>
                </div>
              </div>

              <div
                className={
                  "p-6 rounded-xl bg-surface-container-lowest shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <div>
                    <h2
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Health Monitoring Summary")}
                    </h2>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "All endpoints operational • 99.98% uptime SLA",
                      )}
                    </p>
                  </div>
                  <span
                    className={
                      "px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-md flex items-center gap-1.5"
                    }
                  >
                    <span
                      className={
                        "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                      }
                    ></span>
                    {actions.text("\n            Systems Nominal\n          ")}
                  </span>
                </div>
                <div className={"space-y-3"}>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-sm font-bold"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("/v1/neural-llm/v5/complete")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-6"}>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Latency: 142ms")}
                      </span>
                      <span
                        className={"text-body-sm text-emerald-600 font-medium"}
                      >
                        {actions.text("99.99%")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-sm font-bold"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("/v2/embeddings/batch-vector")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-6"}>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Latency: 84ms")}
                      </span>
                      <span
                        className={"text-body-sm text-emerald-600 font-medium"}
                      >
                        {actions.text("100%")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-sm font-bold"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("/v1/vision/object-detect")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-6"}>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Latency: 215ms")}
                      </span>
                      <span
                        className={"text-body-sm text-emerald-600 font-medium"}
                      >
                        {actions.text("99.95%")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={"space-y-6"}>
              <div
                className={
                  "p-6 rounded-xl bg-surface-container-lowest shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <h2
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Alerts & Verification")}
                  </h2>
                  <span
                    className={
                      "w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md"
                    }
                  >
                    {actions.text("2")}
                  </span>
                </div>
                <div className={"space-y-4"}>
                  <div
                    className={
                      "p-4 rounded-xl bg-surface-container-low border-l-4 border-primary"
                    }
                  >
                    <div
                      className={"flex items-start justify-between gap-2 mb-1"}
                    >
                      <span
                        className={"font-medium text-on-surface text-body-md"}
                      >
                        {actions.text("API Verification Approved")}
                      </span>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("10m ago")}
                      </span>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant mb-3"}>
                      {actions.text(
                        "Neural LLM v5 has passed compliance checks and is now live in the global catalog.",
                      )}
                    </p>
                    <button
                      data-action-text={"View API Docs arrow_forward"}
                      className={
                        "text-primary font-label-md hover:underline flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("View API Docs")}
                    >
                      {actions.text("\n              View API Docs ")}
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[14px]"}
                      >
                        {"arrow_forward"}
                      </span>
                    </button>
                  </div>
                  <div
                    className={
                      "p-4 rounded-xl bg-surface-container-low border-l-4 border-amber-500"
                    }
                  >
                    <div
                      className={"flex items-start justify-between gap-2 mb-1"}
                    >
                      <span
                        className={"font-medium text-on-surface text-body-md"}
                      >
                        {actions.text("Rate Limit Warning")}
                      </span>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("2h ago")}
                      </span>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant mb-3"}>
                      {actions.text("Endpoint ")}
                      <code
                        className={
                          "font-code-sm bg-surface px-1 py-0.5 rounded"
                        }
                      >
                        {"/v1/vision"}
                      </code>
                      {actions.text(" is nearing 80% tier capacity.")}
                    </p>
                    <button
                      data-action-text={"Manage Quotas arrow_forward"}
                      className={
                        "text-primary font-label-md hover:underline flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("Manage Quotas")}
                    >
                      {actions.text("\n              Manage Quotas ")}
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[14px]"}
                      >
                        {"arrow_forward"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={
                  "p-6 rounded-xl bg-surface-container-lowest shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <h2
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Subscription Feed")}
                  </h2>
                  <button
                    data-action-text={"View All"}
                    className={"text-primary font-label-md hover:underline"}
                    type="button"
                    aria-label={actions.text("View All")}
                  >
                    {actions.text("View All")}
                  </button>
                </div>
                <div className={"space-y-4"}>
                  <div
                    className={
                      "flex items-start gap-3 pb-3 border-b border-surface-container-high last:border-0 last:pb-0"
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-headline-sm text-[12px] shrink-0"
                      }
                    >
                      {actions.text("\n              AC\n            ")}
                    </div>
                    <div className={"flex-1 min-w-0"}>
                      <div className={"flex items-center justify-between"}>
                        <span
                          className={"font-medium text-on-surface truncate"}
                        >
                          {actions.text("Acme Corp")}
                        </span>
                        <span
                          className={"text-body-sm text-on-surface-variant"}
                        >
                          {actions.text("Just now")}
                        </span>
                      </div>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant truncate"
                        }
                      >
                        {actions.text("Subscribed to Enterprise Tier")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-start gap-3 pb-3 border-b border-surface-container-high last:border-0 last:pb-0"
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-headline-sm text-[12px] shrink-0"
                      }
                    >
                      {actions.text("\n              TF\n            ")}
                    </div>
                    <div className={"flex-1 min-w-0"}>
                      <div className={"flex items-center justify-between"}>
                        <span
                          className={"font-medium text-on-surface truncate"}
                        >
                          {actions.text("TechFlow AI")}
                        </span>
                        <span
                          className={"text-body-sm text-on-surface-variant"}
                        >
                          {actions.text("45m ago")}
                        </span>
                      </div>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant truncate"
                        }
                      >
                        {actions.text("Upgraded to Pro Plan ($299/mo)")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-start gap-3 pb-3 border-b border-surface-container-high last:border-0 last:pb-0"
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-headline-sm text-[12px] shrink-0"
                      }
                    >
                      {actions.text("\n              JD\n            ")}
                    </div>
                    <div className={"flex-1 min-w-0"}>
                      <div className={"flex items-center justify-between"}>
                        <span
                          className={"font-medium text-on-surface truncate"}
                        >
                          {actions.text("John Doe (Dev)")}
                        </span>
                        <span
                          className={"text-body-sm text-on-surface-variant"}
                        >
                          {actions.text("3h ago")}
                        </span>
                      </div>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant truncate"
                        }
                      >
                        {actions.text("Created Sandbox API Key")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "p-6 rounded-xl bg-surface-container-lowest shadow-sm mb-space-lg"
            }
          >
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
                  {actions.text("Top Performing Endpoints")}
                </h2>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "API traffic breakdown by volume and response latency",
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
                    data-source-placeholder={"Filter APIs..."}
                    className={
                      "pl-9 pr-4 py-2 bg-surface-container-low rounded-xl text-body-sm text-on-surface outline-none w-full sm:w-64"
                    }
                    placeholder={actions.text("Filter APIs...")}
                    type={"text"}
                    aria-label={actions.text("Filter APIs...")}
                  />
                </div>
              </div>
            </div>
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "border-b border-surface-container-high text-on-surface-variant font-label-md"
                    }
                  >
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Endpoint Name")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Method")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Requests (24h)")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Avg Latency")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Success Rate")}
                    </th>
                    <th className={"py-3 px-4 font-medium text-right"}>
                      {actions.text("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "divide-y divide-surface-container-low text-body-md text-on-surface"
                  }
                >
                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-all"
                    }
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "Neural LLM Completion POST 4,210,500 142ms 99.99% more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-4 font-medium"}>
                      {actions.text("Neural LLM Completion")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-sm font-bold"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-code-md"}>
                      {actions.text("4,210,500")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("142ms")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span className={"text-emerald-600 font-medium"}>
                        {actions.text("99.99%")}
                      </span>
                    </td>
                    <td className={"py-4 px-4 text-right"}>
                      <button
                        data-action-text={"more_vert"}
                        className={
                          "p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all"
                        }
                        type="button"
                        aria-label={actions.text("More actions")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[20px]"}
                        >
                          {"more_vert"}
                        </span>
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
                        "Vector Embedding Batch GET 3,150,200 84ms 100% more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-4 font-medium"}>
                      {actions.text("Vector Embedding Batch")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-sm font-bold"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-code-md"}>
                      {actions.text("3,150,200")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("84ms")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span className={"text-emerald-600 font-medium"}>
                        {actions.text("100%")}
                      </span>
                    </td>
                    <td className={"py-4 px-4 text-right"}>
                      <button
                        data-action-text={"more_vert"}
                        className={
                          "p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all"
                        }
                        type="button"
                        aria-label={actions.text("More actions")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[20px]"}
                        >
                          {"more_vert"}
                        </span>
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
                        "Vision Object Detection POST 1,840,100 215ms 99.95% more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-4 font-medium"}>
                      {actions.text("Vision Object Detection")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-sm font-bold"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-code-md"}>
                      {actions.text("1,840,100")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("215ms")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span className={"text-emerald-600 font-medium"}>
                        {actions.text("99.95%")}
                      </span>
                    </td>
                    <td className={"py-4 px-4 text-right"}>
                      <button
                        data-action-text={"more_vert"}
                        className={
                          "p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all"
                        }
                        type="button"
                        aria-label={actions.text("More actions")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[20px]"}
                        >
                          {"more_vert"}
                        </span>
                      </button>
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
