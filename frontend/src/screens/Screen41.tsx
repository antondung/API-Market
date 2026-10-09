import { useScreenActions } from "../features/screen-actions";
export default function Screen41() {
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
              "flex flex-wrap items-center justify-between gap-4 mb-8 bg-surface-container-low p-4 rounded-xl shadow-sm"
            }
          >
            <div className={"flex items-center gap-3"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-primary text-[20px]"}
              >
                {"science"}
              </span>
              <h2
                className={
                  "font-headline-sm text-on-surface text-headline-sm m-0"
                }
              >
                {actions.text("API Hub Visual QA & State Showcase")}
              </h2>
            </div>

            <div className={"flex flex-wrap items-center gap-4"}>
              <div
                className={
                  "flex items-center bg-surface-container-high rounded-xl p-1"
                }
              >
                <button
                  data-action-text={"light_mode Light"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium bg-surface text-on-surface shadow-xs transition-all flex items-center gap-1.5"
                  }
                  id={"theme-light"}
                  type="button"
                  aria-label={actions.text("Light")}
                  data-handler={"setTheme('light')"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"light_mode"}
                  </span>
                  {actions.text(" Light\n        ")}
                </button>
                <button
                  data-action-text={"dark_mode Dark"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1.5"
                  }
                  id={"theme-dark"}
                  type="button"
                  aria-label={actions.text("Dark")}
                  data-handler={"setTheme('dark')"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"dark_mode"}
                  </span>
                  {actions.text(" Dark\n        ")}
                </button>
              </div>

              <div
                className={
                  "hidden md:flex items-center bg-surface-container-high rounded-xl p-1 gap-1"
                }
              >
                <button
                  data-action-text={"1440px"}
                  className={
                    "px-2.5 py-1.5 rounded-lg text-body-sm font-medium bg-surface text-on-surface shadow-xs transition-all"
                  }
                  type="button"
                  aria-label={actions.text("1440px")}
                  data-handler={"setViewport('100%')"}
                >
                  {actions.text("1440px")}
                </button>
                <button
                  data-action-text={"768px"}
                  className={
                    "px-2.5 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-all"
                  }
                  type="button"
                  aria-label={actions.text("768px")}
                  data-handler={"setViewport('768px')"}
                >
                  {actions.text("768px")}
                </button>
                <button
                  data-action-text={"390px"}
                  className={
                    "px-2.5 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-on-surface transition-all"
                  }
                  type="button"
                  aria-label={actions.text("390px")}
                  data-handler={"setViewport('390px')"}
                >
                  {actions.text("390px")}
                </button>
              </div>
            </div>
          </div>

          <div className={"flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar"}>
            <button
              data-action-text={"All States"}
              className={
                "state-filter-btn px-4 py-2 rounded-xl text-body-sm font-medium bg-primary text-on-primary transition-all whitespace-nowrap shadow-xs"
              }
              data-filter={"all"}
              type="button"
              aria-label={actions.text("All States")}
              data-handler={"filterStates('all')"}
            >
              {actions.text("All States")}
            </button>
            <button
              data-action-text={"Loading Skeletons"}
              className={
                "state-filter-btn px-4 py-2 rounded-xl text-body-sm font-medium bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap"
              }
              data-filter={"skeleton"}
              type="button"
              aria-label={actions.text("Loading Skeletons")}
              data-handler={"filterStates('skeleton')"}
            >
              {actions.text("Loading Skeletons")}
            </button>
            <button
              data-action-text={"Empty States"}
              className={
                "state-filter-btn px-4 py-2 rounded-xl text-body-sm font-medium bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap"
              }
              data-filter={"empty"}
              type="button"
              aria-label={actions.text("Empty States")}
              data-handler={"filterStates('empty')"}
            >
              {actions.text("Empty States")}
            </button>
            <button
              data-action-text={"Errors (403/404/429/500)"}
              className={
                "state-filter-btn px-4 py-2 rounded-xl text-body-sm font-medium bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap"
              }
              data-filter={"error"}
              type="button"
              aria-label={actions.text("Errors (403/404/429/500)")}
              data-handler={"filterStates('error')"}
            >
              {actions.text("Errors (403/404/429/500)")}
            </button>
            <button
              data-action-text={"Quota & Trial"}
              className={
                "state-filter-btn px-4 py-2 rounded-xl text-body-sm font-medium bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap"
              }
              data-filter={"quota"}
              type="button"
              aria-label={actions.text("Quota & Trial")}
              data-handler={"filterStates('quota')"}
            >
              {actions.text("Quota & Trial")}
            </button>
            <button
              data-action-text={"Moderation / Review"}
              className={
                "state-filter-btn px-4 py-2 rounded-xl text-body-sm font-medium bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap"
              }
              data-filter={"moderation"}
              type="button"
              aria-label={actions.text("Moderation / Review")}
              data-handler={"filterStates('moderation')"}
            >
              {actions.text("Moderation / Review")}
            </button>
          </div>

          <div
            id={"viewport-frame"}
            className={
              actions.visible("viewport-frame", true)
                ? "w-full transition-all duration-300 mx-auto"
                : "w-full transition-all duration-300 mx-auto hidden"
            }
          >
            <div className={"mb-12"}>
              <div className={"flex items-center justify-between mb-4"}>
                <h3
                  className={
                    "font-headline-md text-on-surface text-headline-md"
                  }
                >
                  {actions.text("Color Token Verification Matrix")}
                </h3>
                <span className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("Semantic UI Surface & Accent Tokens")}
                </span>
              </div>
              <div
                className={
                  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
                }
              >
                <div
                  className={
                    "bg-surface-container-low p-4 rounded-xl shadow-xs flex flex-col justify-between h-24"
                  }
                >
                  <span className={"text-body-sm font-medium text-on-surface"}>
                    {actions.text("Primary Seed")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={"w-6 h-6 rounded-full bg-primary inline-block"}
                    ></span>
                    <code className={"text-code-sm text-on-surface-variant"}>
                      {"#4338CA"}
                    </code>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-low p-4 rounded-xl shadow-xs flex flex-col justify-between h-24"
                  }
                >
                  <span className={"text-body-sm font-medium text-on-surface"}>
                    {actions.text("Surface Canvas")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={
                        "w-6 h-6 rounded-full bg-surface inline-block border border-outline-variant"
                      }
                    ></span>
                    <code className={"text-code-sm text-on-surface-variant"}>
                      {"#faf8ff"}
                    </code>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-low p-4 rounded-xl shadow-xs flex flex-col justify-between h-24"
                  }
                >
                  <span className={"text-body-sm font-medium text-on-surface"}>
                    {actions.text("Container High")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={
                        "w-6 h-6 rounded-full bg-surface-container-high inline-block"
                      }
                    ></span>
                    <code className={"text-code-sm text-on-surface-variant"}>
                      {"#e2e7ff"}
                    </code>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-low p-4 rounded-xl shadow-xs flex flex-col justify-between h-24"
                  }
                >
                  <span className={"text-body-sm font-medium text-on-surface"}>
                    {actions.text("Error Container")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={
                        "w-6 h-6 rounded-full bg-error-container inline-block"
                      }
                    ></span>
                    <code className={"text-code-sm text-on-surface-variant"}>
                      {"#ffdad6"}
                    </code>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-low p-4 rounded-xl shadow-xs flex flex-col justify-between h-24"
                  }
                >
                  <span className={"text-body-sm font-medium text-on-surface"}>
                    {actions.text("Secondary Text")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={
                        "w-6 h-6 rounded-full bg-secondary inline-block"
                      }
                    ></span>
                    <code className={"text-code-sm text-on-surface-variant"}>
                      {"#505f76"}
                    </code>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-low p-4 rounded-xl shadow-xs flex flex-col justify-between h-24"
                  }
                >
                  <span className={"text-body-sm font-medium text-on-surface"}>
                    {actions.text("Outline Variant")}
                  </span>
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={
                        "w-6 h-6 rounded-full bg-outline-variant inline-block"
                      }
                    ></span>
                    <code className={"text-code-sm text-on-surface-variant"}>
                      {"#c7c4d7"}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
              <div
                className={
                  "qa-card bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
                data-state-category={"skeleton"}
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-md font-medium"
                      }
                    >
                      {actions.text("State: Skeleton Loading")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-on-surface-variant text-[20px]"
                      }
                    >
                      {"hourglass_top"}
                    </span>
                  </div>
                  <div className={"space-y-3 animate-pulse my-4"}>
                    <div
                      className={
                        "h-6 bg-surface-container-high rounded-md w-3/4"
                      }
                    ></div>
                    <div
                      className={
                        "h-4 bg-surface-container-high rounded-md w-full"
                      }
                    ></div>
                    <div
                      className={
                        "h-4 bg-surface-container-high rounded-md w-5/6"
                      }
                    ></div>
                    <div className={"grid grid-cols-3 gap-2 pt-2"}>
                      <div
                        className={"h-10 bg-surface-container-high rounded-md"}
                      ></div>
                      <div
                        className={"h-10 bg-surface-container-high rounded-md"}
                      ></div>
                      <div
                        className={"h-10 bg-surface-container-high rounded-md"}
                      ></div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "pt-4 flex items-center justify-between text-body-sm text-on-surface-variant"
                  }
                >
                  <span>
                    {actions.text("Shimmer pulse verification active")}
                  </span>
                  <button
                    data-action-text={"Simulate Reload"}
                    className={"text-primary font-medium hover:underline"}
                    type="button"
                    aria-label={actions.text("Simulate Reload")}
                  >
                    {actions.text("Simulate Reload")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "qa-card bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
                data-state-category={"empty"}
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-label-md font-medium"
                      }
                    >
                      {actions.text("State: Empty / No APIs")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-on-surface-variant text-[20px]"
                      }
                    >
                      {"api"}
                    </span>
                  </div>
                  <div
                    className={
                      "flex flex-col items-center justify-center text-center py-8 px-4"
                    }
                  >
                    <div
                      className={
                        "w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[24px]"
                        }
                      >
                        {"extension_off"}
                      </span>
                    </div>
                    <h4 className={"font-headline-sm text-on-surface mb-1"}>
                      {actions.text("No API Endpoints Registered")}
                    </h4>
                    <p
                      className={
                        "text-body-sm text-on-surface-variant max-w-xs mb-4"
                      }
                    >
                      {actions.text(
                        "Get started by creating your first custom REST or GraphQL gateway endpoint.",
                      )}
                    </p>
                    <button
                      data-action-text={"add Create New API"}
                      className={
                        "px-4 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-medium shadow-xs hover:opacity-90 transition-all flex items-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text("Create New API")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"add"}
                      </span>
                      {actions.text(" Create New API\n            ")}
                    </button>
                  </div>
                </div>
                <div
                  className={
                    "pt-2 flex items-center justify-between text-body-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Primary CTA validation passed")}</span>
                  <span className={"text-success font-medium"}>
                    {actions.text("Ready")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "qa-card bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
                data-state-category={"quota error"}
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-label-md font-medium"
                      }
                    >
                      {actions.text("State: HTTP 429 Rate Limited")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-error text-[20px]"
                      }
                    >
                      {"warning"}
                    </span>
                  </div>
                  <div
                    className={
                      "bg-error-container/40 p-4 rounded-xl border border-error/20 mb-4"
                    }
                  >
                    <div className={"flex items-center gap-3 mb-2"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-error"}
                      >
                        {"bolt"}
                      </span>
                      <div>
                        <h5
                          className={
                            "font-headline-sm text-on-surface text-body-lg"
                          }
                        >
                          {actions.text("Rate Limit Exceeded")}
                        </h5>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "You have exhausted your 10,000 req/hr tier allowance.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        "mt-3 flex items-center justify-between bg-surface p-2.5 rounded-lg text-body-sm"
                      }
                    >
                      <span className={"text-on-surface-variant"}>
                        {actions.text("Retry cooldown timer:")}
                      </span>
                      <span className={"font-code-md text-error font-medium"}>
                        {actions.text("04:59 remaining")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={"flex items-center justify-between pt-2"}>
                  <span className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("Auto-retry scheduled")}
                  </span>
                  <button
                    data-action-text={"Upgrade Plan"}
                    className={
                      "px-3 py-1.5 bg-surface text-on-surface rounded-lg text-body-sm font-medium border border-outline-variant hover:bg-surface-container-high"
                    }
                    type="button"
                    aria-label={actions.text("Upgrade Plan")}
                  >
                    {actions.text("Upgrade Plan")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "qa-card bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
                data-state-category={"error"}
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-label-md font-medium"
                      }
                    >
                      {actions.text("State: HTTP 403 Forbidden")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-error text-[20px]"
                      }
                    >
                      {"lock_person"}
                    </span>
                  </div>
                  <div
                    className={
                      "bg-surface p-4 rounded-xl border border-outline-variant mb-4"
                    }
                  >
                    <div className={"flex items-start gap-3"}>
                      <div
                        className={
                          "w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-error text-[20px]"
                          }
                        >
                          {"gpp_bad"}
                        </span>
                      </div>
                      <div>
                        <h5
                          className={
                            "font-headline-sm text-on-surface text-body-lg mb-1"
                          }
                        >
                          {actions.text("Insufficient Scope Access")}
                        </h5>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mb-3"
                          }
                        >
                          {actions.text("Your API token lacks ")}
                          <code
                            className={
                              "bg-surface-container-high px-1.5 py-0.5 rounded text-code-sm"
                            }
                          >
                            {"admin:write"}
                          </code>
                          {actions.text(
                            " permissions required for this gateway.",
                          )}
                        </p>
                        <div className={"flex gap-2"}>
                          <span
                            className={
                              "px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-code-sm"
                            }
                          >
                            {actions.text("GET /v2/keys")}
                          </span>
                          <span
                            className={
                              "px-2 py-0.5 rounded bg-error-container text-on-error-container text-code-sm"
                            }
                          >
                            {actions.text("403 Forbidden")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"flex items-center justify-between pt-2"}>
                  <span className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("Security audit flag logged")}
                  </span>
                  <button
                    data-action-text={"Request Scope Access"}
                    className={
                      "text-primary font-medium hover:underline text-body-sm"
                    }
                    type="button"
                    aria-label={actions.text("Request Scope Access")}
                  >
                    {actions.text("Request Scope Access")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "qa-card bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
                data-state-category={"moderation"}
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-md font-medium"
                      }
                    >
                      {actions.text("State: Moderation Pending")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-secondary text-[20px]"
                      }
                    >
                      {"pending_actions"}
                    </span>
                  </div>
                  <div className={"space-y-3 mb-4"}>
                    <div
                      className={
                        "flex items-center justify-between p-3 bg-surface rounded-xl"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center"
                          }
                        >
                          <span
                            aria-hidden={true}
                            className={
                              "material-symbols-outlined text-secondary text-[18px]"
                            }
                          >
                            {"verified_user"}
                          </span>
                        </div>
                        <div>
                          <h6
                            className={
                              "font-headline-sm text-on-surface text-body-md"
                            }
                          >
                            {actions.text("Stripe Billing Proxy API")}
                          </h6>
                          <p className={"text-body-sm text-on-surface-variant"}>
                            {actions.text(
                              "Submitted 2 hours ago by @enterprise-team",
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full bg-surface-container-highest text-primary text-label-md font-medium"
                        }
                      >
                        {actions.text("Under Review")}
                      </span>
                    </div>
                    <div
                      className={"text-body-sm text-on-surface-variant px-1"}
                    >
                      {actions.text(
                        "\n              Automated security scan passed. Manual compliance review by trust & safety team in progress (Estimated 4h).\n            ",
                      )}
                    </div>
                  </div>
                </div>
                <div className={"flex items-center justify-between pt-2"}>
                  <span className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("Queue position #4")}
                  </span>
                  <button
                    data-action-text={"Expedite Review"}
                    className={
                      "px-3 py-1.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium"
                    }
                    type="button"
                    aria-label={actions.text("Expedite Review")}
                  >
                    {actions.text("Expedite Review")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "qa-card bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
                data-state-category={"all"}
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-label-md font-medium"
                      }
                    >
                      {actions.text("Component: Responsive Table")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-on-surface-variant text-[20px]"
                      }
                    >
                      {"table_chart"}
                    </span>
                  </div>
                  <div
                    className={
                      "overflow-x-auto rounded-lg border border-outline-variant bg-surface mb-4"
                    }
                  >
                    <table className={"w-full text-left text-body-sm"}>
                      <thead
                        className={
                          "bg-surface-container-low text-on-surface-variant border-b border-outline-variant"
                        }
                      >
                        <tr>
                          <th className={"p-2.5 font-medium"}>
                            {actions.text("Endpoint")}
                          </th>
                          <th className={"p-2.5 font-medium"}>
                            {actions.text("Method")}
                          </th>
                          <th className={"p-2.5 font-medium"}>
                            {actions.text("Status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className={"divide-y divide-outline-variant/30"}>
                        <tr
                          data-record="row-0"
                          hidden={!actions.matches("/api/v1/users GET 200 OK")}
                        >
                          <td className={"p-2.5 font-code-sm text-on-surface"}>
                            {actions.text("/api/v1/users")}
                          </td>
                          <td className={"p-2.5"}>
                            <span
                              className={
                                "px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container text-code-sm"
                              }
                            >
                              {actions.text("GET")}
                            </span>
                          </td>
                          <td className={"p-2.5 text-success"}>
                            {actions.text("200 OK")}
                          </td>
                        </tr>
                        <tr
                          data-record="row-1"
                          hidden={
                            !actions.matches(
                              "/api/v1/webhooks POST 201 Created",
                            )
                          }
                        >
                          <td className={"p-2.5 font-code-sm text-on-surface"}>
                            {actions.text("/api/v1/webhooks")}
                          </td>
                          <td className={"p-2.5"}>
                            <span
                              className={
                                "px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container text-code-sm"
                              }
                            >
                              {actions.text("POST")}
                            </span>
                          </td>
                          <td className={"p-2.5 text-warning"}>
                            {actions.text("201 Created")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={"flex items-center justify-between pt-2"}>
                  <span className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("Mobile drawer collapse verified")}
                  </span>
                  <span className={"text-success font-medium"}>
                    {actions.text("Passed")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
