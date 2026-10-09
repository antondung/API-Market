import { useScreenActions } from "../features/screen-actions";
export default function Screen0() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            }
          >
            <div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("API Cost Guard & Notification Center")}
              </h1>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Monitor real-time consumption spending, configure automated budget thresholds, and manage security & quota alerts.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <div
                className={
                  "bg-surface-container-low border border-outline-variant rounded-xl px-3 py-1.5 flex items-center gap-2"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[18px] text-on-surface-variant"
                  }
                >
                  {"calendar_today"}
                </span>
                <select
                  className={
                    "bg-transparent text-body-sm text-on-surface font-medium outline-none cursor-pointer"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"Current Billing Cycle"}>
                    {actions.text("Current Billing Cycle")}
                  </option>
                  <option value={"Last 30 Days"}>
                    {actions.text("Last 30 Days")}
                  </option>
                  <option value={"Custom Range"}>
                    {actions.text("Custom Range")}
                  </option>
                </select>
              </div>
              <button
                data-action-text={"settings Configure Budget Limits"}
                className={
                  "bg-primary hover:bg-primary/90 text-on-primary text-body-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Configure Budget Limits")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"settings"}
                </span>
                {actions.text("\n        Configure Budget Limits\n      ")}
              </button>
              <button
                data-action-text={"download Export Report"}
                className={
                  "bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-body-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Export Report")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text("\n        Export Report\n      ")}
              </button>
            </div>
          </div>

          <div
            id={"simulated-banner"}
            className={
              actions.visible("simulated-banner", false)
                ? "bg-error-container text-on-error-container p-4 rounded-xl mb-6 flex items-center justify-between shadow-sm"
                : "bg-error-container text-on-error-container p-4 rounded-xl mb-6 flex items-center justify-between shadow-sm hidden"
            }
          >
            <div className={"flex items-center gap-3"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[24px]"}
              >
                {"warning"}
              </span>
              <div>
                <h3 className={"text-headline-sm font-headline-sm"}>
                  {actions.text("Budget Cap Approaching / Reached")}
                </h3>
                <p className={"text-body-sm"}>
                  {actions.text(
                    "Your simulated usage is currently at 68.3% of your $1,200 monthly cap. Soft alerts are active.",
                  )}
                </p>
              </div>
            </div>
            <button
              data-action-text={"close"}
              aria-hidden={true}
              className={
                "material-symbols-outlined text-[20px] cursor-pointer opacity-70 hover:opacity-100"
              }
              type="button"
              aria-label={actions.text("Close")}
              data-handler={
                "document.getElementById('simulated-banner').classList.add('hidden')"
              }
            >
              {"close"}
            </button>
          </div>

          <div className={"flex border-b border-outline-variant mb-6 gap-8"}>
            <button
              data-action-text={"shield API Cost Guard"}
              id={"tab-btn-cost-guard"}
              type="button"
              aria-label={actions.text("API Cost Guard")}
              data-handler={"switchTab('cost-guard')"}
              className={
                actions.visible("tab-btn-cost-guard", true)
                  ? "pb-3 text-body-md font-medium text-primary border-b-2 border-primary transition-all flex items-center gap-2 cursor-pointer"
                  : "pb-3 text-body-md font-medium text-primary border-b-2 border-primary transition-all flex items-center gap-2 cursor-pointer hidden"
              }
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px]"}
              >
                {"shield"}
              </span>
              {actions.text("\n      API Cost Guard\n    ")}
            </button>
            <button
              data-action-text={"notifications Notification Center 3"}
              id={"tab-btn-notifications"}
              type="button"
              aria-label={actions.text("Notification Center 3")}
              data-handler={"switchTab('notifications')"}
              className={
                actions.visible("tab-btn-notifications", true)
                  ? "pb-3 text-body-md font-medium text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-2 cursor-pointer"
                  : "pb-3 text-body-md font-medium text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-2 cursor-pointer hidden"
              }
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px]"}
              >
                {"notifications"}
              </span>
              {actions.text("\n      Notification Center\n      ")}
              <span
                className={
                  "bg-primary text-on-primary text-label-md px-1.5 py-0.5 rounded-full"
                }
              >
                {actions.text("3")}
              </span>
            </button>
          </div>

          <div
            id={"tab-cost-guard"}
            className={
              actions.visible("tab-cost-guard", true)
                ? "space-y-6"
                : "space-y-6 hidden"
            }
          >
            <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/50 relative overflow-hidden"
                }
              >
                <div
                  className={
                    "absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl"
                  }
                ></div>
                <div className={"flex justify-between items-start mb-4"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Current Estimated Spending")}
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
                <div
                  className={"text-headline-lg font-code-md text-on-surface"}
                >
                  {actions.text("$840.00")}
                </div>
                <p
                  className={
                    "text-body-sm text-on-surface-variant mt-2 flex items-center gap-1"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-success text-[16px]"
                    }
                  >
                    {"trending_up"}
                  </span>
                  {actions.text(" +12% from last billing cycle\n        ")}
                </p>
              </div>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/50 relative overflow-hidden"
                }
              >
                <div
                  className={
                    "absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl"
                  }
                ></div>
                <div className={"flex justify-between items-start mb-4"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Monthly Budget Cap")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"account_balance_wallet"}
                  </span>
                </div>
                <div
                  className={"text-headline-lg font-code-md text-on-surface"}
                >
                  {actions.text("$1,200.00")}
                </div>
                <div
                  className={
                    "mt-3 flex items-center justify-between text-body-sm"
                  }
                >
                  <span className={"text-on-surface-variant"}>
                    {actions.text("68.3% Used")}
                  </span>
                  <span className={"font-code-md text-primary font-medium"}>
                    {actions.text("$360.00 remaining")}
                  </span>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/50 relative overflow-hidden"
                }
              >
                <div
                  className={
                    "absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl"
                  }
                ></div>
                <div className={"flex justify-between items-start mb-4"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Projected End-of-Month Spend")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"analytics"}
                  </span>
                </div>
                <div
                  className={"text-headline-lg font-code-md text-on-surface"}
                >
                  {actions.text("$1,110.00")}
                </div>
                <p
                  className={
                    "text-body-sm text-on-surface-variant mt-2 flex items-center gap-1"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[16px] text-primary"
                    }
                  >
                    {"check_circle"}
                  </span>
                  {actions.text(" Within safe budget limit\n        ")}
                </p>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/50"
              }
            >
              <div className={"flex justify-between items-center mb-4"}>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Budget Utilization & Threshold Markers")}
                </h3>
                <span
                  className={
                    "text-body-sm font-code-md text-on-surface-variant"
                  }
                >
                  {actions.text("$840 / $1,200")}
                </span>
              </div>
              <div
                className={
                  "relative w-full bg-surface-container h-4 rounded-full overflow-hidden mb-6"
                }
              >
                <div
                  className={
                    "bg-primary h-full rounded-full transition-all duration-500"
                  }
                  style={{ width: "68.3%" }}
                ></div>

                <div
                  className={
                    "absolute top-0 bottom-0 left-[50%] w-0.5 bg-outline z-10"
                  }
                  title={actions.text("50% Threshold")}
                ></div>
                <div
                  className={
                    "absolute top-0 bottom-0 left-[80%] w-0.5 bg-outline z-10"
                  }
                  title={actions.text("80% Threshold")}
                ></div>
                <div
                  className={
                    "absolute top-0 bottom-0 left-[100%] w-0.5 bg-error z-10"
                  }
                  title={actions.text("100% Hard Cap")}
                ></div>
              </div>
              <div
                className={
                  "flex justify-between text-body-sm text-on-surface-variant px-1"
                }
              >
                <span>{actions.text("$0")}</span>
                <span
                  className={"ml-[-10%]"}
                  style={{ position: "relative", left: "16%" }}
                >
                  {actions.text("50% ($600)")}
                </span>
                <span
                  className={"ml-[-10%]"}
                  style={{ position: "relative", left: "11%" }}
                >
                  {actions.text("80% ($960)")}
                </span>
                <span>{actions.text("100% ($1,200)")}</span>
              </div>
            </div>

            <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
              <div
                className={
                  "lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/50 flex flex-col justify-between"
                }
              >
                <div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-4"
                    }
                  >
                    {actions.text("Cost Breakdown by API")}
                  </h3>
                  <div className={"space-y-4"}>
                    <div>
                      <div className={"flex justify-between text-body-md mb-1"}>
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("Neural LLM v4")}
                        </span>
                        <span
                          className={"font-code-md text-on-surface-variant"}
                        >
                          {actions.text("$480.00 ")}
                          <span
                            className={"text-xs text-on-surface-variant/70"}
                          >
                            {actions.text("(57% • 342k req)")}
                          </span>
                        </span>
                      </div>
                      <div
                        className={
                          "w-full bg-surface-container h-2 rounded-full overflow-hidden"
                        }
                      >
                        <div
                          className={"bg-primary h-full rounded-full"}
                          style={{ width: "57%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className={"flex justify-between text-body-md mb-1"}>
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("Global Geocoding Plus")}
                        </span>
                        <span
                          className={"font-code-md text-on-surface-variant"}
                        >
                          {actions.text("$220.00 ")}
                          <span
                            className={"text-xs text-on-surface-variant/70"}
                          >
                            {actions.text("(26% • 1.2M req)")}
                          </span>
                        </span>
                      </div>
                      <div
                        className={
                          "w-full bg-surface-container h-2 rounded-full overflow-hidden"
                        }
                      >
                        <div
                          className={"bg-secondary h-full rounded-full"}
                          style={{ width: "26%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className={"flex justify-between text-body-md mb-1"}>
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("SecureVault Tokenizer")}
                        </span>
                        <span
                          className={"font-code-md text-on-surface-variant"}
                        >
                          {actions.text("$140.00 ")}
                          <span
                            className={"text-xs text-on-surface-variant/70"}
                          >
                            {actions.text("(17% • 49.9k req)")}
                          </span>
                        </span>
                      </div>
                      <div
                        className={
                          "w-full bg-surface-container h-2 rounded-full overflow-hidden"
                        }
                      >
                        <div
                          className={"bg-tertiary h-full rounded-full"}
                          style={{ width: "17%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-body-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Metrics updated 4 mins ago")}</span>
                  <button
                    data-action-text={"View detailed logs arrow_forward"}
                    className={
                      "text-primary font-medium hover:underline flex items-center gap-1"
                    }
                    type="button"
                    aria-label={actions.text("View detailed logs")}
                  >
                    {actions.text("View detailed logs ")}
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"arrow_forward"}
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/50 flex flex-col justify-between"
                }
              >
                <div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-4"
                    }
                  >
                    {actions.text("Budget Settings")}
                  </h3>
                  <div className={"space-y-4"}>
                    <div>
                      <label
                        className={
                          "block text-body-sm text-on-surface-variant mb-1 font-medium"
                        }
                      >
                        {actions.text("Monthly Hard Cap ($)")}
                      </label>
                      <input
                        className={
                          "w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-body-md font-code-md text-on-surface outline-none focus:border-primary"
                        }
                        type={"text"}
                        defaultValue={"1200.00"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                    <div>
                      <label
                        className={
                          "block text-body-sm text-on-surface-variant mb-2 font-medium"
                        }
                      >
                        {actions.text("Warning Thresholds")}
                      </label>
                      <div className={"flex gap-4"}>
                        <label
                          className={
                            "flex items-center gap-2 text-body-sm cursor-pointer"
                          }
                        >
                          <input
                            defaultChecked={true}
                            className={
                              "rounded border-outline-variant text-primary"
                            }
                            type={"checkbox"}
                            aria-label={actions.text("Input")}
                          />
                          {actions.text(" 50%")}
                        </label>
                        <label
                          className={
                            "flex items-center gap-2 text-body-sm cursor-pointer"
                          }
                        >
                          <input
                            defaultChecked={true}
                            className={
                              "rounded border-outline-variant text-primary"
                            }
                            type={"checkbox"}
                            aria-label={actions.text("Input")}
                          />
                          {actions.text(" 80%")}
                        </label>
                        <label
                          className={
                            "flex items-center gap-2 text-body-sm cursor-pointer"
                          }
                        >
                          <input
                            defaultChecked={true}
                            className={
                              "rounded border-outline-variant text-primary"
                            }
                            type={"checkbox"}
                            aria-label={actions.text("Input")}
                          />
                          {actions.text(" 100%")}
                        </label>
                      </div>
                    </div>
                    <div>
                      <label
                        className={
                          "block text-body-sm text-on-surface-variant mb-1 font-medium"
                        }
                      >
                        {actions.text("Protective Action")}
                      </label>
                      <select
                        className={
                          "w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface outline-none cursor-pointer"
                        }
                        aria-label={actions.text("Input")}
                      >
                        <option value={"Alert & Pause non-critical requests"}>
                          {actions.text("Alert & Pause non-critical requests")}
                        </option>
                        <option value={"Alert only (Soft Limit)"}>
                          {actions.text("Alert only (Soft Limit)")}
                        </option>
                        <option value={"Auto-upgrade to Enterprise Tier"}>
                          {actions.text("Auto-upgrade to Enterprise Tier")}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  data-action-text={"Save Guard Settings"}
                  className={
                    "mt-6 w-full bg-primary hover:bg-primary/90 text-on-primary py-2 rounded-xl text-body-sm font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Save Guard Settings")}
                >
                  {actions.text("Save Guard Settings")}
                </button>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/50"
              }
            >
              <h3
                className={
                  "text-headline-sm font-headline-sm text-on-surface mb-4"
                }
              >
                {actions.text("Alert & Threshold History Log")}
              </h3>
              <div className={"space-y-3"}>
                <div
                  className={
                    "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"notifications_active"}
                    </span>
                    <div>
                      <p className={"text-body-md font-medium text-on-surface"}>
                        {actions.text("80% budget threshold reached")}
                      </p>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text(
                          "Consumption hit $960.00 across active API keys.",
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      "text-body-sm font-code-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Oct 14, 2024 - 14:32 UTC")}
                  </span>
                </div>
                <div
                  className={
                    "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-secondary text-[20px]"
                      }
                    >
                      {"notifications"}
                    </span>
                    <div>
                      <p className={"text-body-md font-medium text-on-surface"}>
                        {actions.text("50% budget threshold reached")}
                      </p>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text(
                          "Consumption hit $600.00 across active API keys.",
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      "text-body-sm font-code-md text-on-surface-variant"
                    }
                  >
                    {actions.text("Oct 05, 2024 - 09:15 UTC")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            id={"tab-notifications"}
            className={
              actions.visible("tab-notifications", false)
                ? "space-y-6"
                : "space-y-6 hidden"
            }
          >
            <div
              className={
                "flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/50"
              }
            >
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"All (6)"}
                  className={
                    "bg-primary text-on-primary text-body-sm font-medium px-3 py-1.5 rounded-xl transition-all"
                  }
                  type="button"
                  aria-label={actions.text("All (6)")}
                >
                  {actions.text("All (6)")}
                </button>
                <button
                  data-action-text={"Unread (3)"}
                  className={
                    "bg-surface hover:bg-surface-container text-on-surface-variant text-body-sm font-medium px-3 py-1.5 rounded-xl transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Unread (3)")}
                >
                  {actions.text("Unread (3)")}
                </button>
                <button
                  data-action-text={"Quota"}
                  className={
                    "bg-surface hover:bg-surface-container text-on-surface-variant text-body-sm font-medium px-3 py-1.5 rounded-xl transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Quota")}
                >
                  {actions.text("Quota")}
                </button>
                <button
                  data-action-text={"Security"}
                  className={
                    "bg-surface hover:bg-surface-container text-on-surface-variant text-body-sm font-medium px-3 py-1.5 rounded-xl transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Security")}
                >
                  {actions.text("Security")}
                </button>
                <button
                  data-action-text={"Billing"}
                  className={
                    "bg-surface hover:bg-surface-container text-on-surface-variant text-body-sm font-medium px-3 py-1.5 rounded-xl transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Billing")}
                >
                  {actions.text("Billing")}
                </button>
              </div>
              <div className={"flex items-center gap-3"}>
                <button
                  data-action-text={"Mark all as read"}
                  className={
                    "text-body-sm text-primary font-medium hover:underline"
                  }
                  type="button"
                  aria-label={actions.text("Mark all as read")}
                >
                  {actions.text("Mark all as read")}
                </button>
                <button
                  data-action-text={"tune Preferences"}
                  className={
                    "text-body-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
                  }
                  type="button"
                  aria-label={actions.text("Preferences")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"tune"}
                  </span>
                  {actions.text(" Preferences")}
                </button>
              </div>
            </div>

            <div className={"space-y-3"}>
              <div
                className={
                  "bg-surface-container-lowest p-4 rounded-xl shadow-sm border-l-4 border-l-error border border-outline-variant/50 flex items-start justify-between gap-4"
                }
              >
                <div className={"flex items-start gap-3"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-error text-[22px] mt-0.5"
                    }
                  >
                    {"error"}
                  </span>
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "bg-error-container text-on-error-container text-label-md px-2 py-0.5 rounded font-medium"
                        }
                      >
                        {actions.text("Unread • High")}
                      </span>
                      <span
                        className={
                          "text-body-sm font-code-md text-on-surface-variant"
                        }
                      >
                        {actions.text("10 mins ago")}
                      </span>
                    </div>
                    <p
                      className={
                        "text-body-md font-medium text-on-surface mt-1"
                      }
                    >
                      {actions.text(
                        "Quota warning: Neural LLM v4 is at 85% capacity (425k / 500k req).",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"Upgrade Plan"}
                  className={
                    "bg-primary text-on-primary text-body-sm font-medium px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-all whitespace-nowrap"
                  }
                  type="button"
                  aria-label={actions.text("Upgrade Plan")}
                >
                  {actions.text("Upgrade Plan")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-4 rounded-xl shadow-sm border-l-4 border-l-primary border border-outline-variant/50 flex items-start justify-between gap-4"
                }
              >
                <div className={"flex items-start gap-3"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[22px] mt-0.5"
                    }
                  >
                    {"warning"}
                  </span>
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "bg-primary-fixed text-on-primary-fixed text-label-md px-2 py-0.5 rounded font-medium"
                        }
                      >
                        {actions.text("Unread • Medium")}
                      </span>
                      <span
                        className={
                          "text-body-sm font-code-md text-on-surface-variant"
                        }
                      >
                        {actions.text("1 hour ago")}
                      </span>
                    </div>
                    <p
                      className={
                        "text-body-md font-medium text-on-surface mt-1"
                      }
                    >
                      {actions.text(
                        "Rate limit reached: SecureVault Tokenizer throttled 14 requests in last hour.",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"View Metrics"}
                  className={
                    "bg-surface-container-high text-on-surface text-body-sm font-medium px-3 py-1.5 rounded-xl hover:bg-surface-container-highest transition-all whitespace-nowrap"
                  }
                  type="button"
                  aria-label={actions.text("View Metrics")}
                >
                  {actions.text("View Metrics")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-4 rounded-xl shadow-sm border-l-4 border-l-secondary border border-outline-variant/50 flex items-start justify-between gap-4"
                }
              >
                <div className={"flex items-start gap-3"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-secondary text-[22px] mt-0.5"
                    }
                  >
                    {"info"}
                  </span>
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "bg-secondary-container text-on-secondary-container text-label-md px-2 py-0.5 rounded font-medium"
                        }
                      >
                        {actions.text("Unread • Low")}
                      </span>
                      <span
                        className={
                          "text-body-sm font-code-md text-on-surface-variant"
                        }
                      >
                        {actions.text("3 hours ago")}
                      </span>
                    </div>
                    <p
                      className={
                        "text-body-md font-medium text-on-surface mt-1"
                      }
                    >
                      {actions.text(
                        "Subscription expiring soon: SecureVault Tokenizer renews tomorrow.",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"Manage Subscription"}
                  className={
                    "bg-surface-container-high text-on-surface text-body-sm font-medium px-3 py-1.5 rounded-xl hover:bg-surface-container-highest transition-all whitespace-nowrap"
                  }
                  type="button"
                  aria-label={actions.text("Manage Subscription")}
                >
                  {actions.text("Manage Subscription")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/30 flex items-start justify-between gap-4"
                }
              >
                <div className={"flex items-start gap-3"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[22px] mt-0.5"
                    }
                  >
                    {"key"}
                  </span>
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "text-body-sm font-code-md text-on-surface-variant"
                        }
                      >
                        {actions.text("Oct 12, 2024")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface mt-1"}>
                      {actions.text(
                        "API Key rotated successfully: Production Master Key (",
                      )}
                      <code
                        className={
                          "font-code-sm bg-surface-container px-1 py-0.5 rounded"
                        }
                      >
                        {"sk_live_9f82...x41a"}
                      </code>
                      {actions.text(").")}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/30 flex items-start justify-between gap-4"
                }
              >
                <div className={"flex items-start gap-3"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[22px] mt-0.5"
                    }
                  >
                    {"check_circle"}
                  </span>
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "text-body-sm font-code-md text-on-surface-variant"
                        }
                      >
                        {actions.text("Oct 08, 2024")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface mt-1"}>
                      {actions.text(
                        "API unavailable incident resolved: Global Geocoding Plus restored 99.9% uptime.",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/30 flex items-start justify-between gap-4"
                }
              >
                <div className={"flex items-start gap-3"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[22px] mt-0.5"
                    }
                  >
                    {"rate_review"}
                  </span>
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "text-body-sm font-code-md text-on-surface-variant"
                        }
                      >
                        {actions.text("Oct 03, 2024")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface mt-1"}>
                      {actions.text(
                        "New Provider Review posted for Neural LLM v4 by @dev_lead.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "mt-12 pt-6 border-t border-outline-variant/40 text-center text-body-sm text-on-surface-variant"
            }
          >
            <p>
              {actions.text(
                "Simulated Payments & Usage Notice: All billing figures and cost calculations are simulated for developer testing and cost guard evaluation.",
              )}
            </p>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
