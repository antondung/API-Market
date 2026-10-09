import { useScreenActions } from "../features/screen-actions";
export default function Screen12() {
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
              "mb-space-lg flex items-center justify-between rounded-xl bg-surface-container-high px-space-md py-space-sm shadow-sm transition-all hover:shadow-md"
            }
          >
            <div className={"flex items-center space-x-space-md"}>
              <div
                className={
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-error-container text-on-error-container"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {"warning"}
                </span>
              </div>
              <div>
                <div className={"text-body-md font-medium text-on-surface"}>
                  {actions.text(
                    "Quota warning: Neural LLM v4 is at 85% capacity",
                  )}
                </div>
                <div className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "You have consumed 425k of 500k requests for the current billing cycle.",
                  )}
                </div>
              </div>
            </div>
            <div className={"flex items-center space-x-space-sm"}>
              <a
                data-action-text={"Upgrade Plan"}
                className={
                  "rounded-xl bg-primary-container px-space-md py-space-sm text-body-sm font-medium text-on-primary-container transition-all hover:opacity-90"
                }
                href={"#"}
              >
                {actions.text("Upgrade Plan")}
              </a>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined cursor-pointer text-on-surface-variant hover:text-on-surface text-[20px]"
                }
              >
                {"close"}
              </span>
            </div>
          </div>

          <div
            className={
              "mb-space-lg flex flex-col justify-between gap-space-md md:flex-row md:items-center"
            }
          >
            <div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("Welcome back, Alex")}
              </h1>
              <p className={"text-body-md text-on-surface-variant"}>
                {actions.text(
                  "Here is a real-time overview of your API consumption and active endpoints.",
                )}
              </p>
            </div>
            <div
              className={
                "flex items-center space-x-space-sm rounded-xl bg-surface-container-low p-1 shadow-sm"
              }
            >
              <button
                data-action-text={"Last 7 Days"}
                className={
                  "rounded-lg bg-surface-container-lowest px-3 py-1.5 text-body-sm font-medium text-primary shadow-sm transition-all"
                }
                type="button"
                aria-label={actions.text("Last 7 Days")}
              >
                {actions.text("Last 7 Days")}
              </button>
              <button
                data-action-text={"Last 30 Days"}
                className={
                  "rounded-lg px-3 py-1.5 text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-all"
                }
                type="button"
                aria-label={actions.text("Last 30 Days")}
              >
                {actions.text("Last 30 Days")}
              </button>
              <button
                data-action-text={"This Month"}
                className={
                  "rounded-lg px-3 py-1.5 text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-all"
                }
                type="button"
                aria-label={actions.text("This Month")}
              >
                {actions.text("This Month")}
              </button>
            </div>
          </div>

          <div
            className={
              "grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4 mb-space-lg"
            }
          >
            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider"
                  }
                >
                  {actions.text("Active Subscriptions")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"api"}
                </span>
              </div>
              <div className={"flex items-baseline space-x-space-xs"}>
                <span
                  className={"text-headline-lg font-code-md text-on-surface"}
                >
                  {actions.text("3")}
                </span>
                <span className={"text-body-sm text-emerald-600 font-medium"}>
                  {actions.text("+1 this month")}
                </span>
              </div>
              <div
                className={"mt-space-sm text-code-sm text-on-surface-variant"}
              >
                {actions.text("All endpoints operational")}
              </div>
            </div>
            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider"
                  }
                >
                  {actions.text("Total Requests")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"trending_up"}
                </span>
              </div>
              <div className={"flex items-baseline space-x-space-xs"}>
                <span
                  className={"text-headline-lg font-code-md text-on-surface"}
                >
                  {actions.text("428,500")}
                </span>
                <span className={"text-body-sm text-emerald-600 font-medium"}>
                  {actions.text("+12.4%")}
                </span>
              </div>
              <div
                className={"mt-space-sm text-code-sm text-on-surface-variant"}
              >
                {actions.text("Avg 45ms latency")}
              </div>
            </div>
            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider"
                  }
                >
                  {actions.text("Success Rate")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"verified"}
                </span>
              </div>
              <div className={"flex items-baseline space-x-space-xs"}>
                <span
                  className={"text-headline-lg font-code-md text-on-surface"}
                >
                  {actions.text("99.8%")}
                </span>
                <span className={"text-body-sm text-emerald-600 font-medium"}>
                  {actions.text("+0.2%")}
                </span>
              </div>
              <div
                className={"mt-space-sm text-code-sm text-on-surface-variant"}
              >
                {actions.text("842 5xx errors intercepted")}
              </div>
            </div>
            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider"
                  }
                >
                  {actions.text("Current Month Spend")}
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
              <div className={"flex items-baseline space-x-space-xs"}>
                <span
                  className={"text-headline-lg font-code-md text-on-surface"}
                >
                  {actions.text("$149.00")}
                </span>
                <span className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("/ $200 limit")}
                </span>
              </div>
              <div
                className={"mt-space-sm text-code-sm text-on-surface-variant"}
              >
                {actions.text("Billing cycle resets in 6 days")}
              </div>
            </div>
          </div>

          <div
            className={
              "grid grid-cols-1 gap-space-lg lg:grid-cols-3 mb-space-lg"
            }
          >
            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-2 flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <div>
                  <h2
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Request Activity")}
                  </h2>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Hourly inbound API traffic across all registered tokens.",
                    )}
                  </p>
                </div>
                <div className={"flex items-center space-x-space-sm"}>
                  <span
                    className={
                      "flex items-center text-body-sm text-on-surface-variant"
                    }
                  >
                    <span
                      className={
                        "inline-block w-2.5 h-2.5 rounded-full bg-primary mr-1.5"
                      }
                    ></span>
                    {actions.text(" Requests\n          ")}
                  </span>
                </div>
              </div>

              <div className={"w-full h-64 relative flex items-end pt-4"}>
                <svg
                  className={"w-full h-full overflow-visible"}
                  preserveAspectRatio={"none"}
                  viewBox={"0 0 600 200"}
                >
                  <defs>
                    <linearGradient
                      id={"chart-grad"}
                      x1={"0"}
                      x2={"0"}
                      y1={"0"}
                      y2={"1"}
                    >
                      <stop
                        offset={"0%"}
                        stopColor={"#4338CA"}
                        stopOpacity={"0.2"}
                      ></stop>
                      <stop
                        offset={"100%"}
                        stopColor={"#4338CA"}
                        stopOpacity={"0.0"}
                      ></stop>
                    </linearGradient>
                  </defs>

                  <line
                    stroke={"#c7c4d7"}
                    strokeDasharray={"4 4"}
                    strokeOpacity={"0.5"}
                    x1={"0"}
                    x2={"600"}
                    y1={"0"}
                    y2={"0"}
                  ></line>
                  <line
                    stroke={"#c7c4d7"}
                    strokeDasharray={"4 4"}
                    strokeOpacity={"0.5"}
                    x1={"0"}
                    x2={"600"}
                    y1={"50"}
                    y2={"50"}
                  ></line>
                  <line
                    stroke={"#c7c4d7"}
                    strokeDasharray={"4 4"}
                    strokeOpacity={"0.5"}
                    x1={"0"}
                    x2={"600"}
                    y1={"100"}
                    y2={"100"}
                  ></line>
                  <line
                    stroke={"#c7c4d7"}
                    strokeDasharray={"4 4"}
                    strokeOpacity={"0.5"}
                    x1={"0"}
                    x2={"600"}
                    y1={"150"}
                    y2={"150"}
                  ></line>
                  <line
                    stroke={"#c7c4d7"}
                    strokeOpacity={"0.5"}
                    x1={"0"}
                    x2={"600"}
                    y1={"200"}
                    y2={"200"}
                  ></line>

                  <path
                    d={
                      "M 0 150 Q 75 120, 150 140 T 300 80 T 450 60 T 600 40 L 600 200 L 0 200 Z"
                    }
                    fill={"url(#chart-grad)"}
                  ></path>

                  <path
                    d={"M 0 150 Q 75 120, 150 140 T 300 80 T 450 60 T 600 40"}
                    fill={"none"}
                    stroke={"#4338CA"}
                    strokeLinecap={"round"}
                    strokeWidth={"2.5"}
                  ></path>

                  <circle
                    className={"fill-surface stroke-primary"}
                    cx={"150"}
                    cy={"140"}
                    r={"4"}
                    strokeWidth={"2"}
                  ></circle>
                  <circle
                    className={"fill-surface stroke-primary"}
                    cx={"300"}
                    cy={"80"}
                    r={"4"}
                    strokeWidth={"2"}
                  ></circle>
                  <circle
                    className={"fill-surface stroke-primary"}
                    cx={"450"}
                    cy={"60"}
                    r={"4"}
                    strokeWidth={"2"}
                  ></circle>
                  <circle
                    className={"fill-primary stroke-surface"}
                    cx={"600"}
                    cy={"40"}
                    r={"5"}
                    strokeWidth={"2"}
                  ></circle>
                </svg>
              </div>
              <div
                className={
                  "flex justify-between text-code-sm text-on-surface-variant mt-space-md border-t border-outline-variant/30 pt-space-sm"
                }
              >
                <span>{actions.text("00:00 UTC")}</span>
                <span>{actions.text("04:00 UTC")}</span>
                <span>{actions.text("08:00 UTC")}</span>
                <span>{actions.text("12:00 UTC")}</span>
                <span>{actions.text("16:00 UTC")}</span>
                <span>{actions.text("20:00 UTC")}</span>
                <span>{actions.text("Now")}</span>
              </div>
            </div>

            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <div
                  className={"flex items-center justify-between mb-space-md"}
                >
                  <h2
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Quota Usage")}
                  </h2>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[20px]"
                    }
                  >
                    {"donut_large"}
                  </span>
                </div>
                <p
                  className={"text-body-sm text-on-surface-variant mb-space-lg"}
                >
                  {actions.text(
                    "Monthly tier capacity across your primary team allocations.",
                  )}
                </p>
                <div className={"space-y-space-md"}>
                  <div>
                    <div
                      className={
                        "flex justify-between text-body-sm font-medium mb-1"
                      }
                    >
                      <span className={"text-on-surface"}>
                        {actions.text("Total Plan Quota")}
                      </span>
                      <span className={"font-code-md text-primary"}>
                        {actions.text("428.5k / 500k")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container-high h-3 rounded-full overflow-hidden"
                      }
                    >
                      <div
                        className={
                          "bg-primary h-full rounded-full transition-all duration-500"
                        }
                        style={{ width: "85.7%" }}
                      ></div>
                    </div>
                    <div
                      className={
                        "flex justify-between text-code-sm text-on-surface-variant mt-1"
                      }
                    >
                      <span>{actions.text("71.5k remaining")}</span>
                      <span>{actions.text("85.7% used")}</span>
                    </div>
                  </div>
                  <div
                    className={
                      "rounded-xl bg-surface-container-low p-space-md space-y-2"
                    }
                  >
                    <div
                      className={
                        "flex items-center justify-between text-body-sm"
                      }
                    >
                      <span className={"font-medium text-on-surface"}>
                        {actions.text("Neural LLM v4")}
                      </span>
                      <span className={"font-code-sm text-error font-semibold"}>
                        {actions.text("342k req")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between text-body-sm"
                      }
                    >
                      <span className={"font-medium text-on-surface"}>
                        {actions.text("Vision OCR v2")}
                      </span>
                      <span className={"font-code-sm text-on-surface-variant"}>
                        {actions.text("64.5k req")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between text-body-sm"
                      }
                    >
                      <span className={"font-medium text-on-surface"}>
                        {actions.text("Vector Embeddings v1")}
                      </span>
                      <span className={"font-code-sm text-on-surface-variant"}>
                        {actions.text("22k req")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"mt-space-lg pt-space-sm"}>
                <a
                  data-action-text={"Manage Quota Alerts arrow_forward"}
                  className={
                    "flex items-center justify-center w-full rounded-xl bg-surface-container-low px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-all"
                  }
                  href={"#"}
                >
                  {actions.text("\n          Manage Quota Alerts ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined ml-1.5 text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 gap-space-lg lg:grid-cols-3"}>
            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-2"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <div>
                  <h2
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Recently Used APIs")}
                  </h2>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Quick access to endpoints with recent request traffic.",
                    )}
                  </p>
                </div>
                <a
                  data-action-text={"View all APIs"}
                  className={
                    "text-body-sm font-medium text-primary hover:underline"
                  }
                  href={"#"}
                >
                  {actions.text("View all APIs")}
                </a>
              </div>
              <div className={"space-y-space-md"}>
                <div
                  className={
                    "flex items-center justify-between rounded-xl bg-surface-container-low p-space-md transition-all hover:bg-surface-container-high"
                  }
                >
                  <div className={"flex items-center space-x-space-md"}>
                    <div
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"smart_toy"}
                      </span>
                    </div>
                    <div>
                      <div className={"flex items-center space-x-2"}>
                        <span
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Neural LLM v4")}
                        </span>
                        <span
                          className={
                            "rounded bg-primary/10 px-1.5 py-0.5 text-code-sm font-semibold text-primary"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                      </div>
                      <div className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("https://api.hub.io/v4/chat/completions")}
                      </div>
                    </div>
                  </div>
                  <div className={"flex items-center space-x-space-md"}>
                    <div className={"text-right hidden sm:block"}>
                      <div
                        className={"text-code-sm font-medium text-on-surface"}
                      >
                        {actions.text("342k requests")}
                      </div>
                      <div className={"text-code-sm text-emerald-600"}>
                        {actions.text("99.9% uptime")}
                      </div>
                    </div>
                    <button
                      data-action-text={"play_arrow"}
                      className={
                        "rounded-lg bg-surface-container-lowest p-2 shadow-sm hover:bg-primary hover:text-on-primary transition-all"
                      }
                      type="button"
                      aria-label={actions.text("Try API")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"play_arrow"}
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "flex items-center justify-between rounded-xl bg-surface-container-low p-space-md transition-all hover:bg-surface-container-high"
                  }
                >
                  <div className={"flex items-center space-x-space-md"}>
                    <div
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"image_search"}
                      </span>
                    </div>
                    <div>
                      <div className={"flex items-center space-x-2"}>
                        <span
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Vision OCR v2")}
                        </span>
                        <span
                          className={
                            "rounded bg-secondary/10 px-1.5 py-0.5 text-code-sm font-semibold text-secondary"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                      </div>
                      <div className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("https://api.hub.io/v2/vision/extract")}
                      </div>
                    </div>
                  </div>
                  <div className={"flex items-center space-x-space-md"}>
                    <div className={"text-right hidden sm:block"}>
                      <div
                        className={"text-code-sm font-medium text-on-surface"}
                      >
                        {actions.text("64.5k requests")}
                      </div>
                      <div className={"text-code-sm text-emerald-600"}>
                        {actions.text("99.7% uptime")}
                      </div>
                    </div>
                    <button
                      data-action-text={"play_arrow"}
                      className={
                        "rounded-lg bg-surface-container-lowest p-2 shadow-sm hover:bg-primary hover:text-on-primary transition-all"
                      }
                      type="button"
                      aria-label={actions.text("Try API")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"play_arrow"}
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "flex items-center justify-between rounded-xl bg-surface-container-low p-space-md transition-all hover:bg-surface-container-high"
                  }
                >
                  <div className={"flex items-center space-x-space-md"}>
                    <div
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"data_object"}
                      </span>
                    </div>
                    <div>
                      <div className={"flex items-center space-x-2"}>
                        <span
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Vector Embeddings v1")}
                        </span>
                        <span
                          className={
                            "rounded bg-primary/10 px-1.5 py-0.5 text-code-sm font-semibold text-primary"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                      </div>
                      <div className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("https://api.hub.io/v1/embeddings")}
                      </div>
                    </div>
                  </div>
                  <div className={"flex items-center space-x-space-md"}>
                    <div className={"text-right hidden sm:block"}>
                      <div
                        className={"text-code-sm font-medium text-on-surface"}
                      >
                        {actions.text("22k requests")}
                      </div>
                      <div className={"text-code-sm text-emerald-600"}>
                        {actions.text("100% uptime")}
                      </div>
                    </div>
                    <button
                      data-action-text={"play_arrow"}
                      className={
                        "rounded-lg bg-surface-container-lowest p-2 shadow-sm hover:bg-primary hover:text-on-primary transition-all"
                      }
                      type="button"
                      aria-label={actions.text("Try API")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"play_arrow"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between"
              }
            >
              <div>
                <h2
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("Quick Actions")}
                </h2>
                <p
                  className={"text-body-sm text-on-surface-variant mb-space-lg"}
                >
                  {actions.text(
                    "Common developer operations and token management.",
                  )}
                </p>
                <div className={"space-y-space-md"}>
                  <a
                    data-action-text={"add_circle Explore APIs arrow_forward"}
                    className={
                      "flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-on-primary shadow-sm hover:opacity-95 transition-all"
                    }
                    href={"#"}
                  >
                    <div className={"flex items-center space-x-space-sm"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"add_circle"}
                      </span>
                      <span className={"text-body-md font-medium"}>
                        {actions.text("Explore APIs")}
                      </span>
                    </div>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"arrow_forward"}
                    </span>
                  </a>
                  <a
                    data-action-text={"key Generate New API Key chevron_right"}
                    className={
                      "flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-on-surface hover:bg-surface-container-high transition-all"
                    }
                    href={"#"}
                  >
                    <div className={"flex items-center space-x-space-sm"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[20px] text-primary"
                        }
                      >
                        {"key"}
                      </span>
                      <span className={"text-body-md font-medium"}>
                        {actions.text("Generate New API Key")}
                      </span>
                    </div>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"chevron_right"}
                    </span>
                  </a>
                  <a
                    data-action-text={"book Read Documentation open_in_new"}
                    className={
                      "flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-on-surface hover:bg-surface-container-high transition-all"
                    }
                    href={"#"}
                  >
                    <div className={"flex items-center space-x-space-sm"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[20px] text-primary"
                        }
                      >
                        {"book"}
                      </span>
                      <span className={"text-body-md font-medium"}>
                        {actions.text("Read Documentation")}
                      </span>
                    </div>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"open_in_new"}
                    </span>
                  </a>
                </div>
              </div>
              <div
                className={
                  "mt-space-lg rounded-xl bg-gradient-to-br from-primary/5 via-primary-container/10 to-transparent p-space-md"
                }
              >
                <div
                  className={
                    "flex items-center space-x-2 text-primary font-medium text-body-sm mb-1"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"bolt"}
                  </span>
                  <span>{actions.text("Pro Tier Enabled")}</span>
                </div>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "You have access to dedicated edge nodes and priority routing.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
