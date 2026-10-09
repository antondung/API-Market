import { useScreenActions } from "../features/screen-actions";
export default function Screen16() {
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
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Total Users")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                  }
                >
                  {"group"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("18,420")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-emerald-600 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text(" +14% this mo\n        ")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Total Providers")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                  }
                >
                  {"corporate_fare"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("1,245")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-emerald-600 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"add"}
                  </span>
                  {actions.text(" +8 new today\n        ")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Published APIs")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                  }
                >
                  {"api"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("482")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-on-surface-variant"
                  }
                >
                  <span className={"text-amber-600 font-medium mr-1"}>
                    {actions.text("12")}
                  </span>
                  {actions.text(" pending review\n        ")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Pending Verifications")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-amber-500/10 text-amber-600 material-symbols-outlined text-[20px]"
                  }
                >
                  {"verified"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("5")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-amber-600 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"priority_high"}
                  </span>
                  {actions.text(" Action required\n        ")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Pending API Reviews")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                  }
                >
                  {"rate_review"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("8")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-on-surface-variant"
                  }
                >
                  {actions.text("\n          Queue active\n        ")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Active Subscriptions")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                  }
                >
                  {"payments"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("8,920")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-emerald-600 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text(" Stable load\n        ")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Gateway Requests")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                  }
                >
                  {"dns"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("42.8M")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-emerald-600 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"check_circle"}
                  </span>
                  {actions.text(" 99.98% uptime\n        ")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-3"}>
                <span
                  className={
                    "text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Overall Error Rate")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "p-2 rounded-lg bg-emerald-500/10 text-emerald-600 material-symbols-outlined text-[20px]"
                  }
                >
                  {"pulse_alert"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1 font-code-md"
                  }
                >
                  {actions.text("0.42%")}
                </div>
                <div
                  className={
                    "flex items-center text-code-sm text-emerald-600 font-medium"
                  }
                >
                  {actions.text("\n          Optimal range\n        ")}
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4"
            }
          >
            <div className={"flex items-center gap-4"}>
              <div
                className={"w-3 h-3 rounded-full bg-emerald-500 animate-pulse"}
              ></div>
              <div>
                <div className={"text-body-md font-medium text-on-surface"}>
                  {actions.text(
                    "Global Uptime: 99.98% — All 4 Regional Gateways Operational",
                  )}
                </div>
                <div className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "US-East, US-West, EU-Central, AP-Southeast functioning at peak capacity.",
                  )}
                </div>
              </div>
            </div>
            <div className={"flex items-center gap-3"}>
              <span
                className={
                  "px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full text-code-sm font-medium flex items-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px] mr-1"}
                >
                  {"warning"}
                </span>
                {actions.text(" 1 Warning Resolved\n      ")}
              </span>
              <button
                data-action-text={"Infrastructure Status"}
                className={
                  "px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-body-sm font-medium hover:opacity-90 transition-all"
                }
                type="button"
                aria-label={actions.text("Infrastructure Status")}
              >
                {actions.text("\n        Infrastructure Status\n      ")}
              </button>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
            <div className={"lg:col-span-2 space-y-6"}>
              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-6"}>
                  <div>
                    <div
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Platform Request Activity")}
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Gateway load & traffic spikes over the past 7 days",
                      )}
                    </div>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <span
                      className={
                        "px-3 py-1 bg-surface-container text-on-surface text-code-sm rounded-lg font-code-md"
                      }
                    >
                      {actions.text("UTC")}
                    </span>
                    <select
                      className={
                        "bg-surface-container text-on-surface text-code-sm rounded-lg px-2 py-1 outline-none"
                      }
                      aria-label={actions.text("Input")}
                    >
                      <option value={"Last 7 Days"}>
                        {actions.text("Last 7 Days")}
                      </option>
                      <option value={"Last 30 Days"}>
                        {actions.text("Last 30 Days")}
                      </option>
                    </select>
                  </div>
                </div>

                <div
                  className={"w-full h-64 flex flex-col justify-end relative"}
                >
                  <div
                    className={
                      "absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20"
                    }
                  >
                    <div className={"w-full h-[1px] bg-outline-variant"}></div>
                    <div className={"w-full h-[1px] bg-outline-variant"}></div>
                    <div className={"w-full h-[1px] bg-outline-variant"}></div>
                    <div className={"w-full h-[1px] bg-outline-variant"}></div>
                  </div>
                  <svg
                    className={"w-full h-48 overflow-visible"}
                    fill={"none"}
                    viewBox={"0 0 700 200"}
                  >
                    <path
                      d={
                        "M0 150 C 100 120, 200 40, 300 80 C 400 120, 500 30, 600 60 L 700 20"
                      }
                      fill={"url(#chartGradient)"}
                      stroke={"#4338CA"}
                      strokeWidth={"3"}
                    ></path>
                    <defs>
                      <linearGradient
                        id={"chartGradient"}
                        x1={"0"}
                        x2={"0"}
                        y1={"0"}
                        y2={"1"}
                      >
                        <stop
                          offset={"0%"}
                          stopColor={"#4338CA"}
                          stopOpacity={"0.3"}
                        ></stop>
                        <stop
                          offset={"100%"}
                          stopColor={"#4338CA"}
                          stopOpacity={"0.0"}
                        ></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div
                    className={
                      "flex justify-between text-code-sm text-on-surface-variant pt-3 border-t border-surface-container"
                    }
                  >
                    <span>{actions.text("Mon")}</span>
                    <span>{actions.text("Tue")}</span>
                    <span>{actions.text("Wed")}</span>
                    <span>{actions.text("Thu")}</span>
                    <span>{actions.text("Fri")}</span>
                    <span>{actions.text("Sat")}</span>
                    <span>{actions.text("Sun")}</span>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <div>
                    <div
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Pending Review Queue")}
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("APIs submitted for publication approval")}
                    </div>
                  </div>
                  <span
                    className={
                      "px-2.5 py-1 bg-primary-container/10 text-primary text-code-sm rounded-full font-medium"
                    }
                  >
                    {actions.text("8 Queued")}
                  </span>
                </div>
                <div className={"overflow-x-auto"}>
                  <table className={"w-full text-left text-body-sm"}>
                    <thead>
                      <tr
                        className={
                          "text-on-surface-variant text-code-sm border-b border-surface-container"
                        }
                      >
                        <th className={"pb-3 font-medium"}>
                          {actions.text("API Name")}
                        </th>
                        <th className={"pb-3 font-medium"}>
                          {actions.text("Provider")}
                        </th>
                        <th className={"pb-3 font-medium"}>
                          {actions.text("Type")}
                        </th>
                        <th className={"pb-3 font-medium"}>
                          {actions.text("Submitted")}
                        </th>
                        <th className={"pb-3 font-medium text-right"}>
                          {actions.text("Actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={"divide-y divide-surface-container"}>
                      <tr
                        data-record="row-0"
                        hidden={
                          !actions.matches(
                            "Stellaris Pay v2 Fintech Corp REST 2 hrs ago Review Approve Reject",
                          )
                        }
                      >
                        <td className={"py-3 font-medium text-on-surface"}>
                          {actions.text("Stellaris Pay v2")}
                        </td>
                        <td className={"py-3 text-on-surface-variant"}>
                          {actions.text("Fintech Corp")}
                        </td>
                        <td className={"py-3"}>
                          <span
                            className={
                              "px-2 py-0.5 bg-surface-container text-on-surface text-code-sm rounded"
                            }
                          >
                            {actions.text("REST")}
                          </span>
                        </td>
                        <td
                          className={
                            "py-3 text-on-surface-variant font-code-md"
                          }
                        >
                          {actions.text("2 hrs ago")}
                        </td>
                        <td className={"py-3 text-right space-x-1"}>
                          <button
                            data-action-text={"Review"}
                            className={
                              "px-2 py-1 bg-primary-container text-on-primary-container rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Review")}
                          >
                            {actions.text("Review")}
                          </button>
                          <button
                            data-action-text={"Approve"}
                            className={
                              "px-2 py-1 bg-emerald-600 text-white rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Approve")}
                          >
                            {actions.text("Approve")}
                          </button>
                          <button
                            data-action-text={"Reject"}
                            className={
                              "px-2 py-1 bg-error-container text-on-error-container rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Reject")}
                          >
                            {actions.text("Reject")}
                          </button>
                        </td>
                      </tr>
                      <tr
                        data-record="row-1"
                        hidden={
                          !actions.matches(
                            "GeoSpatial Engine MapWorks LLC GraphQL 5 hrs ago Review Approve Reject",
                          )
                        }
                      >
                        <td className={"py-3 font-medium text-on-surface"}>
                          {actions.text("GeoSpatial Engine")}
                        </td>
                        <td className={"py-3 text-on-surface-variant"}>
                          {actions.text("MapWorks LLC")}
                        </td>
                        <td className={"py-3"}>
                          <span
                            className={
                              "px-2 py-0.5 bg-surface-container text-on-surface text-code-sm rounded"
                            }
                          >
                            {actions.text("GraphQL")}
                          </span>
                        </td>
                        <td
                          className={
                            "py-3 text-on-surface-variant font-code-md"
                          }
                        >
                          {actions.text("5 hrs ago")}
                        </td>
                        <td className={"py-3 text-right space-x-1"}>
                          <button
                            data-action-text={"Review"}
                            className={
                              "px-2 py-1 bg-primary-container text-on-primary-container rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Review")}
                          >
                            {actions.text("Review")}
                          </button>
                          <button
                            data-action-text={"Approve"}
                            className={
                              "px-2 py-1 bg-emerald-600 text-white rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Approve")}
                          >
                            {actions.text("Approve")}
                          </button>
                          <button
                            data-action-text={"Reject"}
                            className={
                              "px-2 py-1 bg-error-container text-on-error-container rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Reject")}
                          >
                            {actions.text("Reject")}
                          </button>
                        </td>
                      </tr>
                      <tr
                        data-record="row-2"
                        hidden={
                          !actions.matches(
                            "BioMetrics Auth SecureID Systems gRPC 1 day ago Review Approve Reject",
                          )
                        }
                      >
                        <td className={"py-3 font-medium text-on-surface"}>
                          {actions.text("BioMetrics Auth")}
                        </td>
                        <td className={"py-3 text-on-surface-variant"}>
                          {actions.text("SecureID Systems")}
                        </td>
                        <td className={"py-3"}>
                          <span
                            className={
                              "px-2 py-0.5 bg-surface-container text-on-surface text-code-sm rounded"
                            }
                          >
                            {actions.text("gRPC")}
                          </span>
                        </td>
                        <td
                          className={
                            "py-3 text-on-surface-variant font-code-md"
                          }
                        >
                          {actions.text("1 day ago")}
                        </td>
                        <td className={"py-3 text-right space-x-1"}>
                          <button
                            data-action-text={"Review"}
                            className={
                              "px-2 py-1 bg-primary-container text-on-primary-container rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Review")}
                          >
                            {actions.text("Review")}
                          </button>
                          <button
                            data-action-text={"Approve"}
                            className={
                              "px-2 py-1 bg-emerald-600 text-white rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Approve")}
                          >
                            {actions.text("Approve")}
                          </button>
                          <button
                            data-action-text={"Reject"}
                            className={
                              "px-2 py-1 bg-error-container text-on-error-container rounded text-code-sm hover:opacity-90"
                            }
                            type="button"
                            aria-label={actions.text("Reject")}
                          >
                            {actions.text("Reject")}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <div>
                    <div
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Reports & Moderation Flags")}
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Security flags, abuse reports, and DMCA notices",
                      )}
                    </div>
                  </div>
                  <span
                    className={
                      "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm rounded-full font-medium"
                    }
                  >
                    {actions.text("3 Active")}
                  </span>
                </div>
                <div className={"space-y-3"}>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-lg flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error text-[20px]"
                        }
                      >
                        {"report"}
                      </span>
                      <div>
                        <div
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text(
                            "Rate Limit Bypass Reported on /v1/ai-synth",
                          )}
                        </div>
                        <div className={"text-code-sm text-on-surface-variant"}>
                          {actions.text("Reported by security bot • 45m ago")}
                        </div>
                      </div>
                    </div>
                    <button
                      data-action-text={"Inspect"}
                      className={
                        "px-3 py-1 bg-surface-container text-on-surface rounded text-code-sm hover:bg-surface-container-high"
                      }
                      type="button"
                      aria-label={actions.text("Inspect")}
                    >
                      {actions.text("Inspect")}
                    </button>
                  </div>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-lg flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-amber-600 text-[20px]"
                        }
                      >
                        {"warning"}
                      </span>
                      <div>
                        <div
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text(
                            "DMCA Notice: Copyright infringement claim for /v1/media-stream",
                          )}
                        </div>
                        <div className={"text-code-sm text-on-surface-variant"}>
                          {actions.text("Submitted by Legal Ops • 3h ago")}
                        </div>
                      </div>
                    </div>
                    <button
                      data-action-text={"Inspect"}
                      className={
                        "px-3 py-1 bg-surface-container text-on-surface rounded text-code-sm hover:bg-surface-container-high"
                      }
                      type="button"
                      aria-label={actions.text("Inspect")}
                    >
                      {actions.text("Inspect")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={"space-y-6"}>
              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <div
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("System Health Feed")}
                  </div>
                  <span
                    className={"w-2 h-2 rounded-full bg-emerald-500"}
                  ></span>
                </div>
                <div className={"space-y-4 text-body-sm"}>
                  <div
                    className={
                      "flex items-start gap-3 pb-3 border-b border-surface-container"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 text-[18px] mt-0.5"
                      }
                    >
                      {"check_circle"}
                    </span>
                    <div>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("US-East Gateway Recovered")}
                      </div>
                      <div className={"text-on-surface-variant text-code-sm"}>
                        {actions.text(
                          "Latency normalized after route failover.",
                        )}
                      </div>
                      <div
                        className={"text-on-surface-variant text-code-sm mt-1"}
                      >
                        {actions.text("12 mins ago")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-start gap-3 pb-3 border-b border-surface-container"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-amber-600 text-[18px] mt-0.5"
                      }
                    >
                      {"warning"}
                    </span>
                    <div>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("High Memory Usage: Node #402")}
                      </div>
                      <div className={"text-on-surface-variant text-code-sm"}>
                        {actions.text("Auto-scaling triggered successfully.")}
                      </div>
                      <div
                        className={"text-on-surface-variant text-code-sm mt-1"}
                      >
                        {actions.text("45 mins ago")}
                      </div>
                    </div>
                  </div>
                  <div className={"flex items-start gap-3"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 text-[18px] mt-0.5"
                      }
                    >
                      {"check_circle"}
                    </span>
                    <div>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("Daily Backup Completed")}
                      </div>
                      <div className={"text-on-surface-variant text-code-sm"}>
                        {actions.text(
                          "Encrypted snapshot stored in cold tier.",
                        )}
                      </div>
                      <div
                        className={"text-on-surface-variant text-code-sm mt-1"}
                      >
                        {actions.text("3 hours ago")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm"
                }
              >
                <div
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-4"
                  }
                >
                  {actions.text("Audit Trail")}
                </div>
                <div className={"space-y-3 text-body-sm"}>
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("Admin Override: API #1049")}
                      </div>
                      <div className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("By Sarah Jenkins")}
                      </div>
                    </div>
                    <span
                      className={
                        "text-code-sm text-on-surface-variant font-code-md"
                      }
                    >
                      {actions.text("10m ago")}
                    </span>
                  </div>
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("Role Update: Provider Tier")}
                      </div>
                      <div className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("By Alex Rivera")}
                      </div>
                    </div>
                    <span
                      className={
                        "text-code-sm text-on-surface-variant font-code-md"
                      }
                    >
                      {actions.text("1h ago")}
                    </span>
                  </div>
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("Global Rate Limit Adjusted")}
                      </div>
                      <div className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("By System Bot")}
                      </div>
                    </div>
                    <span
                      className={
                        "text-code-sm text-on-surface-variant font-code-md"
                      }
                    >
                      {actions.text("4h ago")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm"
                }
              >
                <div
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-4"
                  }
                >
                  {actions.text("Quick Operations")}
                </div>
                <div className={"grid grid-cols-1 gap-2"}>
                  <button
                    data-action-text={
                      "campaign Broadcast Notification arrow_forward"
                    }
                    className={
                      "w-full text-left px-4 py-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-body-md font-medium text-on-surface flex items-center justify-between transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Broadcast Notification")}
                  >
                    <span className={"flex items-center"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined mr-3 text-[18px] text-primary"
                        }
                      >
                        {"campaign"}
                      </span>
                      {actions.text("Broadcast Notification")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-on-surface-variant"
                      }
                    >
                      {"arrow_forward"}
                    </span>
                  </button>
                  <button
                    data-action-text={
                      "bolt Emergency Rate Limit Override arrow_forward"
                    }
                    className={
                      "w-full text-left px-4 py-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-body-md font-medium text-on-surface flex items-center justify-between transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Emergency Rate Limit Override")}
                  >
                    <span className={"flex items-center"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined mr-3 text-[18px] text-primary"
                        }
                      >
                        {"bolt"}
                      </span>
                      {actions.text("Emergency Rate Limit Override")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-on-surface-variant"
                      }
                    >
                      {"arrow_forward"}
                    </span>
                  </button>
                  <button
                    data-action-text={
                      "verified_user KYC Fast-Track arrow_forward"
                    }
                    className={
                      "w-full text-left px-4 py-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-body-md font-medium text-on-surface flex items-center justify-between transition-all"
                    }
                    type="button"
                    aria-label={actions.text("KYC Fast-Track")}
                  >
                    <span className={"flex items-center"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined mr-3 text-[18px] text-primary"
                        }
                      >
                        {"verified_user"}
                      </span>
                      {actions.text("KYC Fast-Track")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-on-surface-variant"
                      }
                    >
                      {"arrow_forward"}
                    </span>
                  </button>
                  <button
                    data-action-text={
                      "power_settings_new System Maintenance Mode arrow_forward"
                    }
                    className={
                      "w-full text-left px-4 py-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-body-md font-medium text-on-surface flex items-center justify-between transition-all"
                    }
                    type="button"
                    aria-label={actions.text("System Maintenance Mode")}
                  >
                    <span className={"flex items-center"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined mr-3 text-[18px] text-error"
                        }
                      >
                        {"power_settings_new"}
                      </span>
                      {actions.text("System Maintenance Mode")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] text-on-surface-variant"
                      }
                    >
                      {"arrow_forward"}
                    </span>
                  </button>
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
