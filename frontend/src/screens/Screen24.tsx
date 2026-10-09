import { useScreenActions } from "../features/screen-actions";
export default function Screen24() {
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
          <section
            className={
              "w-full pt-12 pb-16 px-6 lg:px-12 bg-surface relative overflow-hidden"
            }
          >
            <div
              className={
                "absolute top-0 right-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"
              }
            ></div>
            <div
              className={
                "max-w-7xl mx-auto flex flex-col items-center text-center relative z-10"
              }
            >
              <div
                className={
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container mb-4"
                }
              >
                <span
                  className={"w-2 h-2 rounded-full bg-primary inline-block"}
                ></span>
                <span
                  className={
                    "text-label-md font-label-md text-primary uppercase tracking-wider"
                  }
                >
                  {actions.text("Transparent Developer Pricing")}
                </span>
              </div>
              <h1
                className={
                  "text-headline-lg font-headline-lg text-on-surface mb-4 max-w-2xl"
                }
              >
                {actions.text(
                  "\n        Scale your applications with predictable API economics\n      ",
                )}
              </h1>
              <p
                className={"text-body-lg text-on-surface-variant max-w-xl mb-8"}
              >
                {actions.text(
                  "\n        From personal side-projects to high-throughput enterprise infrastructure. Choose a tier designed for your velocity.\n      ",
                )}
              </p>

              <div
                className={
                  "inline-flex items-center p-1 bg-surface-container rounded-lg"
                }
              >
                <button
                  data-action-text={"Monthly Billing"}
                  className={
                    "px-4 py-2 rounded-md bg-surface text-on-surface text-body-md font-label-md shadow-sm transition-all"
                  }
                  id={"monthly-btn"}
                  type="button"
                  aria-label={actions.text("Monthly Billing")}
                >
                  {actions.text("Monthly Billing")}
                </button>
                <button
                  data-action-text={"Annual Save 20%"}
                  className={
                    "px-4 py-2 rounded-md text-on-surface-variant text-body-md font-label-md hover:text-on-surface transition-all"
                  }
                  id={"annual-btn"}
                  type="button"
                  aria-label={actions.text("Annual Save 20%")}
                >
                  {actions.text("Annual ")}
                  <span className={"text-xs text-primary font-bold ml-1"}>
                    {actions.text("Save 20%")}
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className={"w-full px-6 lg:px-12 max-w-7xl mx-auto mb-16"}>
            <div
              className={
                "w-full bg-surface-container-low rounded-xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              }
            >
              <div className={"flex items-start gap-4"}>
                <div
                  className={
                    "w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center shrink-0"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[24px]"
                    }
                  >
                    {"info"}
                  </span>
                </div>
                <div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-1"
                    }
                  >
                    {actions.text("Understanding Quota vs Rate Limit")}
                  </h3>
                  <p
                    className={"text-body-md text-on-surface-variant max-w-3xl"}
                  >
                    <strong className={"text-on-surface"}>
                      {actions.text("Quota")}
                    </strong>
                    {actions.text(
                      " refers to your total allocated API requests per monthly billing cycle. ",
                    )}
                    <strong className={"text-on-surface"}>
                      {actions.text("Rate Limit")}
                    </strong>
                    {actions.text(
                      " determines your maximum burst velocity (requests per second) to protect against traffic spikes and ensure fair availability.\n          ",
                    )}
                  </p>
                </div>
              </div>
              <a
                data-action-text={"Read Docs"}
                className={
                  "px-4 py-2 bg-surface text-on-surface rounded-lg text-body-md font-label-md hover:bg-surface-container transition-colors shrink-0 shadow-sm"
                }
                href={"#"}
              >
                {actions.text("\n        Read Docs\n      ")}
              </a>
            </div>
          </section>

          <section className={"w-full px-6 lg:px-12 max-w-7xl mx-auto mb-20"}>
            <div
              className={"grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"}
            >
              <div
                className={
                  "bg-surface-container-low rounded-xl p-8 flex flex-col justify-between shadow-sm transition-all hover:shadow-md"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant"
                      }
                    >
                      {actions.text("Starter")}
                    </span>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-surface text-on-surface text-code-sm font-code-sm"
                      }
                    >
                      {actions.text("Free Tier")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-lg font-headline-lg text-on-surface mb-2"
                    }
                  >
                    {actions.text("$0 ")}
                    <span
                      className={
                        "text-body-md text-on-surface-variant font-normal"
                      }
                    >
                      {actions.text("/ month")}
                    </span>
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-6"}>
                    {actions.text(
                      "Perfect for prototyping, evaluating endpoints, and hobbyist developers.",
                    )}
                  </p>
                  <div className={"space-y-4 mb-8"}>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        <strong>{actions.text("50k")}</strong>
                        {actions.text(" requests / month")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        <strong>{actions.text("10 req/sec")}</strong>
                        {actions.text(" rate limit")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        {actions.text("Standard documentation & guides")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        {actions.text("Community forum access")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  data-action-text={"Get Started Free"}
                  className={
                    "w-full py-3 bg-surface text-on-surface rounded-lg text-body-md font-label-md hover:bg-surface-container transition-colors shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Get Started Free")}
                >
                  {actions.text("\n          Get Started Free\n        ")}
                </button>
              </div>

              <div
                className={
                  "bg-primary-container/5 rounded-xl p-8 flex flex-col justify-between shadow-md relative ring-2 ring-primary"
                }
              >
                <div
                  className={
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-on-primary text-label-md font-label-md rounded-full shadow-sm"
                  }
                >
                  {actions.text("\n          Current Plan\n        ")}
                </div>
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "text-label-md font-label-md uppercase tracking-wider text-primary"
                      }
                    >
                      {actions.text("Developer")}
                    </span>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-primary/10 text-primary text-code-sm font-code-sm"
                      }
                    >
                      {actions.text("Most Popular")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-lg font-headline-lg text-on-surface mb-2"
                    }
                  >
                    <span className={"price-val"}>{actions.text("$49")}</span>
                    <span
                      className={
                        "text-body-md text-on-surface-variant font-normal"
                      }
                    >
                      {actions.text("/ month")}
                    </span>
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-6"}>
                    {actions.text(
                      "Designed for production-ready apps and growing teams needing reliable scale.",
                    )}
                  </p>
                  <div className={"space-y-4 mb-8"}>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        <strong>{actions.text("500k")}</strong>
                        {actions.text(" requests / month")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        <strong>{actions.text("50 req/sec")}</strong>
                        {actions.text(" rate limit")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        {actions.text("Priority developer support")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        {actions.text("Custom Webhook integrations")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        {actions.text("Team workspace (up to 5 seats)")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  data-action-text={"Manage Subscription"}
                  className={
                    "w-full py-3 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Manage Subscription")}
                >
                  {actions.text("\n          Manage Subscription\n        ")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-low rounded-xl p-8 flex flex-col justify-between shadow-sm transition-all hover:shadow-md"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant"
                      }
                    >
                      {actions.text("Enterprise Scale")}
                    </span>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-surface text-on-surface text-code-sm font-code-sm"
                      }
                    >
                      {actions.text("High Performance")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-lg font-headline-lg text-on-surface mb-2"
                    }
                  >
                    <span className={"price-val"}>{actions.text("$199")}</span>
                    <span
                      className={
                        "text-body-md text-on-surface-variant font-normal"
                      }
                    >
                      {actions.text("/ month")}
                    </span>
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-6"}>
                    {actions.text(
                      "Engineered for high-volume commercial services requiring SLA guarantees.",
                    )}
                  </p>
                  <div className={"space-y-4 mb-8"}>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        <strong>{actions.text("5M")}</strong>
                        {actions.text(" requests / month")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        <strong>{actions.text("250 req/sec")}</strong>
                        {actions.text(" rate limit")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        <strong>{actions.text("99.99% SLA")}</strong>
                        {actions.text(" uptime guarantee")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        {actions.text("Advanced custom telemetry")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span className={"text-body-md text-on-surface"}>
                        {actions.text("Dedicated account manager")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  data-action-text={"Upgrade to Pro"}
                  className={
                    "w-full py-3 bg-surface text-on-surface rounded-lg text-body-md font-label-md hover:bg-surface-container transition-colors shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Upgrade to Pro")}
                >
                  {actions.text("\n          Upgrade to Pro\n        ")}
                </button>
              </div>
            </div>
          </section>

          <section className={"w-full px-6 lg:px-12 max-w-7xl mx-auto mb-20"}>
            <div className={"text-center mb-10"}>
              <h2
                className={
                  "text-headline-md font-headline-md text-on-surface mb-2"
                }
              >
                {actions.text("Compare Plan Capabilities")}
              </h2>
              <p className={"text-body-md text-on-surface-variant"}>
                {actions.text(
                  "A detailed breakdown of every feature included across API HUB tiers.",
                )}
              </p>
            </div>
            <div
              className={
                "bg-surface-container-low rounded-xl overflow-hidden shadow-sm"
              }
            >
              <div
                className={
                  "grid grid-cols-4 p-4 lg:p-6 bg-surface-container font-headline-sm text-on-surface text-body-md"
                }
              >
                <div>{actions.text("Feature Capability")}</div>
                <div className={"text-center"}>{actions.text("Free")}</div>
                <div className={"text-center text-primary font-bold"}>
                  {actions.text("Basic")}
                </div>
                <div className={"text-center"}>{actions.text("Pro")}</div>
              </div>

              <div
                className={
                  "grid grid-cols-4 p-4 lg:p-6 items-center hover:bg-surface-container/5 transition-colors"
                }
              >
                <div className={"text-body-md text-on-surface font-medium"}>
                  {actions.text("Authentication Support (OAuth2 / JWT)")}
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"check"}
                  </span>
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"check"}
                  </span>
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"check"}
                  </span>
                </div>
              </div>

              <div
                className={
                  "grid grid-cols-4 p-4 lg:p-6 items-center hover:bg-surface-container/5 transition-colors"
                }
              >
                <div className={"text-body-md text-on-surface font-medium"}>
                  {actions.text("Custom Webhooks & Event Streams")}
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-outline text-[20px]"
                    }
                  >
                    {"remove"}
                  </span>
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"check"}
                  </span>
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"check"}
                  </span>
                </div>
              </div>

              <div
                className={
                  "grid grid-cols-4 p-4 lg:p-6 items-center hover:bg-surface-container/5 transition-colors"
                }
              >
                <div className={"text-body-md text-on-surface font-medium"}>
                  {actions.text("SLA Uptime Guarantee")}
                </div>
                <div
                  className={"text-center text-body-sm text-on-surface-variant"}
                >
                  {actions.text("Best Effort")}
                </div>
                <div className={"text-center text-body-sm text-on-surface"}>
                  {actions.text("99.9%")}
                </div>
                <div
                  className={"text-center text-body-sm text-primary font-bold"}
                >
                  {actions.text("99.99%")}
                </div>
              </div>

              <div
                className={
                  "grid grid-cols-4 p-4 lg:p-6 items-center hover:bg-surface-container/5 transition-colors"
                }
              >
                <div className={"text-body-md text-on-surface font-medium"}>
                  {actions.text("Dedicated Static IPs")}
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-outline text-[20px]"
                    }
                  >
                    {"remove"}
                  </span>
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-outline text-[20px]"
                    }
                  >
                    {"remove"}
                  </span>
                </div>
                <div className={"text-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"check"}
                  </span>
                </div>
              </div>

              <div
                className={
                  "grid grid-cols-4 p-4 lg:p-6 items-center hover:bg-surface-container/5 transition-colors"
                }
              >
                <div className={"text-body-md text-on-surface font-medium"}>
                  {actions.text("Audit Logs & Security Compliance")}
                </div>
                <div
                  className={"text-center text-body-sm text-on-surface-variant"}
                >
                  {actions.text("24 Hours")}
                </div>
                <div className={"text-center text-body-sm text-on-surface"}>
                  {actions.text("30 Days")}
                </div>
                <div
                  className={"text-center text-body-sm text-primary font-bold"}
                >
                  {actions.text("1 Year")}
                </div>
              </div>
            </div>
          </section>

          <section className={"w-full px-6 lg:px-12 max-w-4xl mx-auto mb-20"}>
            <div className={"text-center mb-10"}>
              <h2
                className={
                  "text-headline-md font-headline-md text-on-surface mb-2"
                }
              >
                {actions.text("Frequently Asked Questions")}
              </h2>
              <p className={"text-body-md text-on-surface-variant"}>
                {actions.text(
                  "Got questions about billing, quotas, or upgrades? We have answers.",
                )}
              </p>
            </div>
            <div className={"space-y-4"}>
              <div
                className={"bg-surface-container-low rounded-xl p-6 shadow-sm"}
              >
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text(
                    "How are API requests counted toward my monthly quota?",
                  )}
                </h4>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "Every successful HTTP response (2xx, 3xx) and client error (4xx) counts as a single request unit. Server errors (5xx) originating from API HUB infrastructure are never billed to your quota.",
                  )}
                </p>
              </div>
              <div
                className={"bg-surface-container-low rounded-xl p-6 shadow-sm"}
              >
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text(
                    "What happens if I exceed my monthly request quota?",
                  )}
                </h4>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "Requests exceeding your tier limit will return a 429 Too Many Requests status code. You can enable automatic overage protection in your dashboard settings to seamlessly scale without interruption at $0.0002 per extra request.",
                  )}
                </p>
              </div>
              <div
                className={"bg-surface-container-low rounded-xl p-6 shadow-sm"}
              >
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text(
                    "Can I upgrade or downgrade my plan at any time?",
                  )}
                </h4>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "Yes. Upgrades take effect immediately with prorated billing for the remainder of the cycle. Downgrades apply at the start of your next billing period.",
                  )}
                </p>
              </div>
              <div
                className={"bg-surface-container-low rounded-xl p-6 shadow-sm"}
              >
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text(
                    "Are test tokens available for sandbox environments?",
                  )}
                </h4>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "All developer accounts receive unrestricted access to our mock sandbox environment with isolated test keys completely free of charge.",
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className={"w-full px-6 lg:px-12 max-w-7xl mx-auto mb-20"}>
            <div
              className={
                "bg-primary text-on-primary rounded-xl p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl"
              }
            >
              <div
                className={
                  "absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none"
                }
              ></div>
              <div className={"relative z-10 max-w-xl"}>
                <h2 className={"text-headline-lg font-headline-lg mb-3"}>
                  {actions.text("Ready to integrate high-velocity APIs?")}
                </h2>
                <p className={"text-body-lg text-on-primary-container"}>
                  {actions.text(
                    "Join over 15,000 engineering teams building the future with API HUB.",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-4 relative z-10 shrink-0"}>
                <a
                  data-action-text={"View Documentation"}
                  className={
                    "px-6 py-3 bg-surface text-on-surface rounded-lg text-body-md font-label-md hover:bg-surface-container transition-colors shadow-sm"
                  }
                  href={"#"}
                >
                  {actions.text("\n          View Documentation\n        ")}
                </a>
                <a
                  data-action-text={"Get Started Now"}
                  className={
                    "px-6 py-3 bg-on-primary-container text-on-primary-fixed font-bold rounded-lg text-body-md font-label-md hover:bg-primary-fixed transition-colors shadow-sm"
                  }
                  href={"#"}
                >
                  {actions.text("\n          Get Started Now\n        ")}
                </a>
              </div>
            </div>
          </section>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
