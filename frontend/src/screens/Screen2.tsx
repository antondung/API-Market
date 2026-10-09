import { useScreenActions } from "../features/screen-actions";
export default function Screen2() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-space-xl"
            }
          >
            <div>
              <div className={"flex items-center gap-3 mb-space-xs"}>
                <span
                  className={
                    "px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-md uppercase tracking-wider font-label-md"
                  }
                >
                  {actions.text("Clearance: L4 Root")}
                </span>
                <span
                  className={
                    "text-on-surface-variant text-body-sm flex items-center gap-1 font-code-md"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[16px] text-primary"
                    }
                  >
                    {"verified_user"}
                  </span>
                  {actions.text(" SEC-CORE-9984\n        ")}
                </span>
              </div>
              <h1
                className={
                  "text-headline-lg font-headline-lg text-on-surface tracking-tight"
                }
              >
                {actions.text("Admin Console & Global Governance")}
              </h1>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Real-time oversight of platform infrastructure, tenant security, and provider verification queues.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"download Export Telemetry"}
                className={
                  "px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-body-sm font-medium transition-all flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Export Telemetry")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text(" Export Telemetry\n      ")}
              </button>
              <button
                data-action-text={"shield_lock Lockdown Mode"}
                className={
                  "px-4 py-2 bg-primary-container hover:opacity-90 text-on-primary-container rounded-xl text-body-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                }
                type="button"
                aria-label={actions.text("Lockdown Mode")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"shield_lock"}
                </span>
                {actions.text(" Lockdown Mode\n      ")}
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
                "bg-surface-container-low rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md"
              }
            >
              <div
                className={
                  "absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"group"}
                </span>
              </div>
              <span
                className={
                  "text-label-md text-on-surface-variant uppercase tracking-wider block mb-1"
                }
              >
                {actions.text("Active Users")}
              </span>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("14,280")}
                </span>
                <span
                  className={
                    "text-code-sm text-emerald-600 flex items-center font-medium"
                  }
                >
                  {actions.text("+12.4%")}
                </span>
              </div>
              <div
                className={
                  "w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden"
                }
              >
                <div
                  className={"bg-primary h-full rounded-full"}
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md"
              }
            >
              <div
                className={
                  "absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"corporate_fare"}
                </span>
              </div>
              <span
                className={
                  "text-label-md text-on-surface-variant uppercase tracking-wider block mb-1"
                }
              >
                {actions.text("Active Providers")}
              </span>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("342")}
                </span>
                <span
                  className={
                    "text-code-sm text-emerald-600 flex items-center font-medium"
                  }
                >
                  {actions.text("+4 new")}
                </span>
              </div>
              <div
                className={
                  "w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden"
                }
              >
                <div
                  className={"bg-primary h-full rounded-full"}
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md"
              }
            >
              <div
                className={
                  "absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-amber-600"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"pending_actions"}
                </span>
              </div>
              <span
                className={
                  "text-label-md text-on-surface-variant uppercase tracking-wider block mb-1"
                }
              >
                {actions.text("Pending Verifications")}
              </span>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("8")}
                </span>
                <span
                  className={
                    "text-code-sm text-amber-600 flex items-center font-medium"
                  }
                >
                  {actions.text("Requires action")}
                </span>
              </div>
              <div
                className={
                  "w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden"
                }
              >
                <div
                  className={"bg-amber-500 h-full rounded-full"}
                  style={{ width: "35%" }}
                ></div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md"
              }
            >
              <div
                className={
                  "absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-emerald-600"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"monitor_heart"}
                </span>
              </div>
              <span
                className={
                  "text-label-md text-on-surface-variant uppercase tracking-wider block mb-1"
                }
              >
                {actions.text("System Health")}
              </span>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("99.99%")}
                </span>
                <span
                  className={
                    "text-code-sm text-emerald-600 flex items-center font-medium"
                  }
                >
                  {actions.text("Optimal")}
                </span>
              </div>
              <div
                className={
                  "w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden"
                }
              >
                <div
                  className={"bg-emerald-500 h-full rounded-full"}
                  style={{ width: "99%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
            <div
              className={
                "lg:col-span-2 bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col"
              }
            >
              <div className={"flex items-center justify-between mb-6"}>
                <div>
                  <h2
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Pending Provider Verifications")}
                  </h2>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Review enterprise organization requests for Tier-2 API publishing access.",
                    )}
                  </p>
                </div>
                <span
                  className={
                    "px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-code-sm font-medium"
                  }
                >
                  {actions.text("8 Queue")}
                </span>
              </div>
              <div className={"space-y-3 flex-1"}>
                <div
                  className={
                    "bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-surface-container"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold"
                      }
                    >
                      {actions.text("\n              NX\n            ")}
                    </div>
                    <div>
                      <h4
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Nexus Dynamics Corp")}
                      </h4>
                      <p className={"text-code-sm text-on-surface-variant"}>
                        {actions.text(
                          "Submitted 2 hours ago • API Domain: financial.nexus.io",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <button
                      data-action-text={"Inspect"}
                      className={
                        "px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-body-sm font-medium"
                      }
                      type="button"
                      aria-label={actions.text("Inspect")}
                    >
                      {actions.text("Inspect")}
                    </button>
                    <button
                      data-action-text={"Approve"}
                      className={
                        "px-3 py-1.5 bg-primary-container hover:opacity-90 text-on-primary-container rounded-lg text-body-sm font-medium"
                      }
                      type="button"
                      aria-label={actions.text("Approve")}
                    >
                      {actions.text("Approve")}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-surface-container"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold"
                      }
                    >
                      {actions.text("\n              QL\n            ")}
                    </div>
                    <div>
                      <h4
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Quantis Labs")}
                      </h4>
                      <p className={"text-code-sm text-on-surface-variant"}>
                        {actions.text(
                          "Submitted 5 hours ago • API Domain: ai-models.quantis.net",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <button
                      data-action-text={"Inspect"}
                      className={
                        "px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-body-sm font-medium"
                      }
                      type="button"
                      aria-label={actions.text("Inspect")}
                    >
                      {actions.text("Inspect")}
                    </button>
                    <button
                      data-action-text={"Approve"}
                      className={
                        "px-3 py-1.5 bg-primary-container hover:opacity-90 text-on-primary-container rounded-lg text-body-sm font-medium"
                      }
                      type="button"
                      aria-label={actions.text("Approve")}
                    >
                      {actions.text("Approve")}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-surface-container"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold"
                      }
                    >
                      {actions.text("\n              HV\n            ")}
                    </div>
                    <div>
                      <h4
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("HyperVigil AI")}
                      </h4>
                      <p className={"text-code-sm text-on-surface-variant"}>
                        {actions.text(
                          "Submitted 1 day ago • API Domain: edge.hypervigil.org",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <button
                      data-action-text={"Inspect"}
                      className={
                        "px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-body-sm font-medium"
                      }
                      type="button"
                      aria-label={actions.text("Inspect")}
                    >
                      {actions.text("Inspect")}
                    </button>
                    <button
                      data-action-text={"Approve"}
                      className={
                        "px-3 py-1.5 bg-primary-container hover:opacity-90 text-on-primary-container rounded-lg text-body-sm font-medium"
                      }
                      type="button"
                      aria-label={actions.text("Approve")}
                    >
                      {actions.text("Approve")}
                    </button>
                  </div>
                </div>
              </div>
              <div
                className={
                  "mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-body-sm text-on-surface-variant"
                }
              >
                <span>{actions.text("Showing 3 of 8 pending requests")}</span>
                <a
                  data-action-text={
                    "View full verification queue arrow_forward"
                  }
                  className={
                    "text-primary font-medium hover:underline flex items-center gap-1"
                  }
                  href={"#"}
                >
                  {actions.text("View full verification queue ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </a>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col"
              }
            >
              <div className={"flex items-center justify-between mb-6"}>
                <div>
                  <h2
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Security Audit Logs")}
                  </h2>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("Recent administrative & token events.")}
                  </p>
                </div>
                <span
                  className={
                    "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                  }
                ></span>
              </div>
              <div className={"space-y-3 flex-1 font-code-md"}>
                <div
                  className={
                    "bg-surface-container-lowest p-3 rounded-xl text-body-sm flex flex-col gap-1"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between text-on-surface-variant text-code-sm"
                    }
                  >
                    <span className={"text-primary font-medium"}>
                      {actions.text("AUTH_TOKEN_ROTATION")}
                    </span>
                    <span>{actions.text("10:42:12 UTC")}</span>
                  </div>
                  <p className={"text-on-surface text-code-sm truncate"}>
                    {actions.text(
                      "Root admin key rotated for cluster US-EAST-1",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-3 rounded-xl text-body-sm flex flex-col gap-1"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between text-on-surface-variant text-code-sm"
                    }
                  >
                    <span className={"text-amber-600 font-medium"}>
                      {actions.text("RATE_LIMIT_BREACH")}
                    </span>
                    <span>{actions.text("09:15.04 UTC")}</span>
                  </div>
                  <p className={"text-on-surface text-code-sm truncate"}>
                    {actions.text(
                      "Tenant #8841 exceeded 50,000 req/min threshold",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-3 rounded-xl text-body-sm flex flex-col gap-1"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between text-on-surface-variant text-code-sm"
                    }
                  >
                    <span className={"text-primary font-medium"}>
                      {actions.text("POLICY_UPDATE")}
                    </span>
                    <span>{actions.text("08:00.22 UTC")}</span>
                  </div>
                  <p className={"text-on-surface text-code-sm truncate"}>
                    {actions.text(
                      "Updated global CORS policy for *.hub-internal.net",
                    )}
                  </p>
                </div>
              </div>
              <div className={"mt-4 pt-4 border-t border-outline-variant/20"}>
                <a
                  data-action-text={"receipt_long View Complete Audit Trail"}
                  className={
                    "w-full py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-body-sm font-medium transition-all flex items-center justify-center gap-2"
                  }
                  href={"#"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"receipt_long"}
                  </span>
                  {actions.text(" View Complete Audit Trail\n        ")}
                </a>
              </div>
            </div>
          </div>

          <div
            className={
              "mt-space-xl bg-surface-container-low rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
            }
          >
            <div className={"flex items-center gap-4"}>
              <div
                className={
                  "w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"hub"}
                </span>
              </div>
              <div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("API HUB Global Mesh Active")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "All 14 edge nodes synchronizing telemetry cleanly. Zero packet drop.",
                  )}
                </p>
              </div>
            </div>
            <div className={"flex items-center gap-3"}>
              <span className={"text-code-sm text-on-surface-variant"}>
                {actions.text("Cluster: us-west-2a")}
              </span>
              <button
                data-action-text={"Manage Nodes"}
                className={
                  "px-4 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-medium hover:opacity-90 transition-all"
                }
                type="button"
                aria-label={actions.text("Manage Nodes")}
              >
                {actions.text("Manage Nodes")}
              </button>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
