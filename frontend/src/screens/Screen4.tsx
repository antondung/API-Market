import { useScreenActions } from "../features/screen-actions";
export default function Screen4() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div
          className={
            "flex flex-col w-full min-h-dvh bg-surface p-space-xl pb-32"
          }
        >
          <div
            className={
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl"
            }
          >
            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "font-label-md text-outline uppercase tracking-wider"
                  }
                >
                  {actions.text("Total Active Reports")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary bg-primary-fixed p-space-sm rounded-lg text-[20px]"
                  }
                >
                  {"flag"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <h3 className={"font-headline-lg text-on-surface"}>
                  {actions.text("18")}
                </h3>
                <span
                  className={
                    "text-body-sm text-error font-medium flex items-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-1"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text("+12% today")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "font-label-md text-outline uppercase tracking-wider"
                  }
                >
                  {actions.text("High Priority Flags")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-error bg-error-container p-space-sm rounded-lg text-[20px]"
                  }
                >
                  {"warning"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <h3 className={"font-headline-lg text-on-surface"}>
                  {actions.text("4")}
                </h3>
                <span
                  className={
                    "text-body-sm text-error font-medium flex items-center"
                  }
                >
                  {actions.text("Requires Action")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "font-label-md text-outline uppercase tracking-wider"
                  }
                >
                  {actions.text("Under Investigation")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-secondary bg-secondary-container p-space-sm rounded-lg text-[20px]"
                  }
                >
                  {"search"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <h3 className={"font-headline-lg text-on-surface"}>
                  {actions.text("6")}
                </h3>
                <span
                  className={
                    "text-body-sm text-secondary font-medium flex items-center"
                  }
                >
                  {actions.text("Avg time 4.2h")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "font-label-md text-outline uppercase tracking-wider"
                  }
                >
                  {actions.text("Resolved This Week")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-tertiary bg-tertiary-fixed p-space-sm rounded-lg text-[20px]"
                  }
                >
                  {"task_alt"}
                </span>
              </div>
              <div className={"flex items-baseline justify-between"}>
                <h3 className={"font-headline-lg text-on-surface"}>
                  {actions.text("42")}
                </h3>
                <span
                  className={
                    "text-body-sm text-success font-medium flex items-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px] mr-1"}
                  >
                    {"check"}
                  </span>
                  {actions.text("98% SLA met")}
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col"
            }
          >
            <div
              className={
                "p-space-lg flex flex-col gap-space-md border-b border-outline-variant/30"
              }
            >
              <div
                className={
                  "flex flex-col md:flex-row md:items-center justify-between gap-space-md"
                }
              >
                <div>
                  <h2 className={"font-headline-md text-on-surface"}>
                    {actions.text("Moderation Queue")}
                  </h2>
                  <p className={"font-body-sm text-outline mt-space-xs"}>
                    {actions.text(
                      "Review and manage reported APIs, compliance flags, and security violations.",
                    )}
                  </p>
                </div>
                <div className={"flex items-center gap-space-sm"}>
                  <button
                    data-action-text={"filter_list Filter"}
                    className={
                      "bg-surface-container px-space-md py-space-sm rounded-xl font-label-md text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Filter")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"filter_list"}
                    </span>
                    {actions.text(" Filter\n          ")}
                  </button>
                  <button
                    data-action-text={"download Export CSV"}
                    className={
                      "bg-primary-container text-on-primary-container px-space-md py-space-sm rounded-xl font-label-md hover:opacity-90 transition-opacity flex items-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Export CSV")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"download"}
                    </span>
                    {actions.text(" Export CSV\n          ")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "flex items-center gap-space-xs overflow-x-auto pb-space-xs"
                }
              >
                <button
                  data-action-text={"All (18)"}
                  className={
                    "category-btn active px-space-md py-space-sm rounded-xl font-label-md bg-primary text-on-primary whitespace-nowrap transition-all"
                  }
                  type="button"
                  aria-label={actions.text("All (18)")}
                  data-handler={"filterTable('all')"}
                >
                  {actions.text("All (18)")}
                </button>
                <button
                  data-action-text={"API Not Working (3)"}
                  className={
                    "category-btn px-space-md py-space-sm rounded-xl font-label-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap transition-all"
                  }
                  type="button"
                  aria-label={actions.text("API Not Working (3)")}
                  data-handler={"filterTable('not-working')"}
                >
                  {actions.text("API Not Working (3)")}
                </button>
                <button
                  data-action-text={"Misleading Info (4)"}
                  className={
                    "category-btn px-space-md py-space-sm rounded-xl font-label-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Misleading Info (4)")}
                  data-handler={"filterTable('misleading')"}
                >
                  {actions.text("Misleading Info (4)")}
                </button>
                <button
                  data-action-text={"Ownership Violation (2)"}
                  className={
                    "category-btn px-space-md py-space-sm rounded-xl font-label-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Ownership Violation (2)")}
                  data-handler={"filterTable('ownership')"}
                >
                  {actions.text("Ownership Violation (2)")}
                </button>
                <button
                  data-action-text={"Privacy Concern (3)"}
                  className={
                    "category-btn px-space-md py-space-sm rounded-xl font-label-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Privacy Concern (3)")}
                  data-handler={"filterTable('privacy')"}
                >
                  {actions.text("Privacy Concern (3)")}
                </button>
                <button
                  data-action-text={"Unlawful Data (2)"}
                  className={
                    "category-btn px-space-md py-space-sm rounded-xl font-label-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Unlawful Data (2)")}
                  data-handler={"filterTable('unlawful')"}
                >
                  {actions.text("Unlawful Data (2)")}
                </button>
                <button
                  data-action-text={"Dangerous API (4)"}
                  className={
                    "category-btn px-space-md py-space-sm rounded-xl font-label-md bg-surface-container text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Dangerous API (4)")}
                  data-handler={"filterTable('dangerous')"}
                >
                  {actions.text("Dangerous API (4)")}
                </button>
              </div>
            </div>

            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low text-outline font-label-md border-b border-outline-variant/20"
                    }
                  >
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Report ID")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("API Name")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Provider")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Reporter")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Reason")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Submission Date")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Priority")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Review Status")}
                    </th>
                    <th className={"p-space-md font-medium"}>
                      {actions.text("Assigned Reviewer")}
                    </th>
                    <th className={"p-space-md font-medium text-right"}>
                      {actions.text("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "divide-y divide-outline-variant/10 text-body-sm font-body-md text-on-surface"
                  }
                >
                  <tr
                    data-action-text={
                      "#REP-9042 Stripe Payment Gateway V2 FinTech Corp dev_guru99 Dangerous API Oct 24, 2023 error High Under Investigation JD Alex M. visibility"
                    }
                    className={
                      "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    }
                    data-handler={"openDrawer('REP-9042')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "#REP-9042 Stripe Payment Gateway V2 FinTech Corp dev_guru99 Dangerous API Oct 24, 2023 error High Under Investigation JD Alex M. visibility",
                      )
                    }
                  >
                    <td className={"p-space-md font-code-sm text-primary"}>
                      {actions.text("#REP-9042")}
                    </td>
                    <td className={"p-space-md font-medium"}>
                      {actions.text("Stripe Payment Gateway V2")}
                    </td>
                    <td className={"p-space-md text-secondary"}>
                      {actions.text("FinTech Corp")}
                    </td>
                    <td className={"p-space-md"}>
                      {actions.text("dev_guru99")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-error-container text-on-error-container px-2 py-0.5 rounded text-[11px] font-medium"
                        }
                      >
                        {actions.text("Dangerous API")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline"}>
                      {actions.text("Oct 24, 2023")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={"text-error font-bold flex items-center"}
                      >
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[14px] mr-1"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"error"}
                        </span>
                        {actions.text("High")}
                      </span>
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-[11px] font-medium"
                        }
                      >
                        {actions.text("Under Investigation")}
                      </span>
                    </td>
                    <td className={"p-space-md flex items-center gap-space-xs"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold"
                        }
                      >
                        {actions.text("JD")}
                      </div>
                      {actions.text(" Alex M.")}
                    </td>
                    <td className={"p-space-md text-right"}>
                      <button
                        data-action-text={"visibility"}
                        className={
                          "p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("View")}
                        data-handler={
                          "event.stopPropagation(); openDrawer('REP-9042');"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"visibility"}
                        </span>
                      </button>
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "#REP-9041 GeoLocation Tracking Pro Mapify Inc privacy_advocate Privacy Concern Oct 24, 2023 Medium New Report Unassigned visibility"
                    }
                    className={
                      "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    }
                    data-handler={"openDrawer('REP-9041')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "#REP-9041 GeoLocation Tracking Pro Mapify Inc privacy_advocate Privacy Concern Oct 24, 2023 Medium New Report Unassigned visibility",
                      )
                    }
                  >
                    <td className={"p-space-md font-code-sm text-primary"}>
                      {actions.text("#REP-9041")}
                    </td>
                    <td className={"p-space-md font-medium"}>
                      {actions.text("GeoLocation Tracking Pro")}
                    </td>
                    <td className={"p-space-md text-secondary"}>
                      {actions.text("Mapify Inc")}
                    </td>
                    <td className={"p-space-md"}>
                      {actions.text("privacy_advocate")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[11px] font-medium"
                        }
                      >
                        {actions.text("Privacy Concern")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline"}>
                      {actions.text("Oct 24, 2023")}
                    </td>
                    <td className={"p-space-md"}>
                      <span className={"text-secondary font-semibold"}>
                        {actions.text("Medium")}
                      </span>
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-surface-container-highest text-primary px-2 py-1 rounded-full text-[11px] font-medium"
                        }
                      >
                        {actions.text("New Report")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline italic"}>
                      {actions.text("Unassigned")}
                    </td>
                    <td className={"p-space-md text-right"}>
                      <button
                        data-action-text={"visibility"}
                        className={
                          "p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("View")}
                        data-handler={
                          "event.stopPropagation(); openDrawer('REP-9041');"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"visibility"}
                        </span>
                      </button>
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "#REP-9040 AI Image Generator Ultra DeepPixel Labs sarah_art Ownership Violation Oct 23, 2023 error High Under Investigation SK Sarah K. visibility"
                    }
                    className={
                      "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    }
                    data-handler={"openDrawer('REP-9040')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "#REP-9040 AI Image Generator Ultra DeepPixel Labs sarah_art Ownership Violation Oct 23, 2023 error High Under Investigation SK Sarah K. visibility",
                      )
                    }
                  >
                    <td className={"p-space-md font-code-sm text-primary"}>
                      {actions.text("#REP-9040")}
                    </td>
                    <td className={"p-space-md font-medium"}>
                      {actions.text("AI Image Generator Ultra")}
                    </td>
                    <td className={"p-space-md text-secondary"}>
                      {actions.text("DeepPixel Labs")}
                    </td>
                    <td className={"p-space-md"}>
                      {actions.text("sarah_art")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[11px] font-medium"
                        }
                      >
                        {actions.text("Ownership Violation")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline"}>
                      {actions.text("Oct 23, 2023")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={"text-error font-bold flex items-center"}
                      >
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[14px] mr-1"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"error"}
                        </span>
                        {actions.text("High")}
                      </span>
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-[11px] font-medium"
                        }
                      >
                        {actions.text("Under Investigation")}
                      </span>
                    </td>
                    <td className={"p-space-md flex items-center gap-space-xs"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold"
                        }
                      >
                        {actions.text("SK")}
                      </div>
                      {actions.text(" Sarah K.")}
                    </td>
                    <td className={"p-space-md text-right"}>
                      <button
                        data-action-text={"visibility"}
                        className={
                          "p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("View")}
                        data-handler={
                          "event.stopPropagation(); openDrawer('REP-9040');"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"visibility"}
                        </span>
                      </button>
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "#REP-9039 Crypto Swap Exchange BlockChain Ltd token_hunter Unlawful Data Oct 23, 2023 error High Escalated MK Mike K. visibility"
                    }
                    className={
                      "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    }
                    data-handler={"openDrawer('REP-9039')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "#REP-9039 Crypto Swap Exchange BlockChain Ltd token_hunter Unlawful Data Oct 23, 2023 error High Escalated MK Mike K. visibility",
                      )
                    }
                  >
                    <td className={"p-space-md font-code-sm text-primary"}>
                      {actions.text("#REP-9039")}
                    </td>
                    <td className={"p-space-md font-medium"}>
                      {actions.text("Crypto Swap Exchange")}
                    </td>
                    <td className={"p-space-md text-secondary"}>
                      {actions.text("BlockChain Ltd")}
                    </td>
                    <td className={"p-space-md"}>
                      {actions.text("token_hunter")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-error-container text-on-error-container px-2 py-0.5 rounded text-[11px] font-medium"
                        }
                      >
                        {actions.text("Unlawful Data")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline"}>
                      {actions.text("Oct 23, 2023")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={"text-error font-bold flex items-center"}
                      >
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[14px] mr-1"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"error"}
                        </span>
                        {actions.text("High")}
                      </span>
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded-full text-[11px] font-medium"
                        }
                      >
                        {actions.text("Escalated")}
                      </span>
                    </td>
                    <td className={"p-space-md flex items-center gap-space-xs"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold"
                        }
                      >
                        {actions.text("MK")}
                      </div>
                      {actions.text(" Mike K.")}
                    </td>
                    <td className={"p-space-md text-right"}>
                      <button
                        data-action-text={"visibility"}
                        className={
                          "p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("View")}
                        data-handler={
                          "event.stopPropagation(); openDrawer('REP-9039');"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"visibility"}
                        </span>
                      </button>
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "#REP-9038 Weather Forecast Direct Climate Systems app_builder_21 API Not Working Oct 22, 2023 Low New Report Unassigned visibility"
                    }
                    className={
                      "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    }
                    data-handler={"openDrawer('REP-9038')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-4"
                    hidden={
                      !actions.matches(
                        "#REP-9038 Weather Forecast Direct Climate Systems app_builder_21 API Not Working Oct 22, 2023 Low New Report Unassigned visibility",
                      )
                    }
                  >
                    <td className={"p-space-md font-code-sm text-primary"}>
                      {actions.text("#REP-9038")}
                    </td>
                    <td className={"p-space-md font-medium"}>
                      {actions.text("Weather Forecast Direct")}
                    </td>
                    <td className={"p-space-md text-secondary"}>
                      {actions.text("Climate Systems")}
                    </td>
                    <td className={"p-space-md"}>
                      {actions.text("app_builder_21")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[11px] font-medium"
                        }
                      >
                        {actions.text("API Not Working")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline"}>
                      {actions.text("Oct 22, 2023")}
                    </td>
                    <td className={"p-space-md"}>
                      <span className={"text-outline"}>
                        {actions.text("Low")}
                      </span>
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-surface-container-highest text-primary px-2 py-1 rounded-full text-[11px] font-medium"
                        }
                      >
                        {actions.text("New Report")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline italic"}>
                      {actions.text("Unassigned")}
                    </td>
                    <td className={"p-space-md text-right"}>
                      <button
                        data-action-text={"visibility"}
                        className={
                          "p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("View")}
                        data-handler={
                          "event.stopPropagation(); openDrawer('REP-9038');"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"visibility"}
                        </span>
                      </button>
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "#REP-9037 Social Media Scraper API DataExtract Co security_lead Dangerous API Oct 21, 2023 error High Under Investigation JD Alex M. visibility"
                    }
                    className={
                      "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    }
                    data-handler={"openDrawer('REP-9037')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-5"
                    hidden={
                      !actions.matches(
                        "#REP-9037 Social Media Scraper API DataExtract Co security_lead Dangerous API Oct 21, 2023 error High Under Investigation JD Alex M. visibility",
                      )
                    }
                  >
                    <td className={"p-space-md font-code-sm text-primary"}>
                      {actions.text("#REP-9037")}
                    </td>
                    <td className={"p-space-md font-medium"}>
                      {actions.text("Social Media Scraper API")}
                    </td>
                    <td className={"p-space-md text-secondary"}>
                      {actions.text("DataExtract Co")}
                    </td>
                    <td className={"p-space-md"}>
                      {actions.text("security_lead")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-error-container text-on-error-container px-2 py-0.5 rounded text-[11px] font-medium"
                        }
                      >
                        {actions.text("Dangerous API")}
                      </span>
                    </td>
                    <td className={"p-space-md text-outline"}>
                      {actions.text("Oct 21, 2023")}
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={"text-error font-bold flex items-center"}
                      >
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[14px] mr-1"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"error"}
                        </span>
                        {actions.text("High")}
                      </span>
                    </td>
                    <td className={"p-space-md"}>
                      <span
                        className={
                          "bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-[11px] font-medium"
                        }
                      >
                        {actions.text("Under Investigation")}
                      </span>
                    </td>
                    <td className={"p-space-md flex items-center gap-space-xs"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold"
                        }
                      >
                        {actions.text("JD")}
                      </div>
                      {actions.text(" Alex M.")}
                    </td>
                    <td className={"p-space-md text-right"}>
                      <button
                        data-action-text={"visibility"}
                        className={
                          "p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("View")}
                        data-handler={
                          "event.stopPropagation(); openDrawer('REP-9037');"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"visibility"}
                        </span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className={
                "p-space-lg flex items-center justify-between border-t border-outline-variant/30"
              }
            >
              <span className={"font-body-sm text-outline"}>
                {actions.text("Showing 1-6 of 18 reports")}
              </span>
              <div className={"flex items-center gap-space-xs"}>
                <button
                  data-action-text={"Previous"}
                  className={
                    "px-space-md py-space-sm bg-surface-container text-outline rounded-xl font-label-md cursor-not-allowed"
                  }
                  type="button"
                  aria-label={actions.text("Previous")}
                >
                  {actions.text("Previous")}
                </button>
                <button
                  data-action-text={"1"}
                  className={
                    "px-space-md py-space-sm bg-primary text-on-primary rounded-xl font-label-md"
                  }
                  type="button"
                  aria-label={actions.text("1")}
                >
                  {actions.text("1")}
                </button>
                <button
                  data-action-text={"2"}
                  className={
                    "px-space-md py-space-sm bg-surface-container text-on-surface rounded-xl font-label-md hover:bg-surface-container-high"
                  }
                  type="button"
                  aria-label={actions.text("2")}
                >
                  {actions.text("2")}
                </button>
                <button
                  data-action-text={"3"}
                  className={
                    "px-space-md py-space-sm bg-surface-container text-on-surface rounded-xl font-label-md hover:bg-surface-container-high"
                  }
                  type="button"
                  aria-label={actions.text("3")}
                >
                  {actions.text("3")}
                </button>
                <button
                  data-action-text={"Next"}
                  className={
                    "px-space-md py-space-sm bg-surface-container text-on-surface rounded-xl font-label-md hover:bg-surface-container-high"
                  }
                  type="button"
                  aria-label={actions.text("Next")}
                >
                  {actions.text("Next")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"reportDrawer"}
            className={
              actions.visible("reportDrawer", false)
                ? "fixed inset-0 z-50 overflow-hidden"
                : "fixed inset-0 z-50 overflow-hidden hidden"
            }
          >
            <div
              data-action-text={""}
              className={
                "absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
              }
              data-handler={"closeDrawer()"}
              role="button"
              tabIndex={0}
            ></div>

            <div
              id={"drawerPanel"}
              className={
                actions.visible("drawerPanel", true)
                  ? "absolute inset-y-0 right-0 max-w-2xl w-full bg-surface-container-lowest shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-full"
                  : "absolute inset-y-0 right-0 max-w-2xl w-full bg-surface-container-lowest shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-full hidden"
              }
            >
              <div
                className={
                  "p-space-lg bg-surface-container-low flex items-center justify-between border-b border-outline-variant/30"
                }
              >
                <div className={"flex items-center gap-space-md"}>
                  <span
                    className={
                      "font-code-sm text-primary font-bold bg-primary-fixed px-space-sm py-1 rounded"
                    }
                  >
                    {actions.text("#REP-9042")}
                  </span>
                  <div>
                    <h3 className={"font-headline-sm text-on-surface"}>
                      {actions.text("Stripe Payment Gateway V2")}
                    </h3>
                    <p className={"font-body-sm text-outline"}>
                      {actions.text("Reported by ")}
                      <span className={"text-on-surface font-medium"}>
                        {actions.text("dev_guru99")}
                      </span>
                      {actions.text(" on Oct 24, 2023")}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"close"}
                  className={
                    "p-space-sm hover:bg-surface-container rounded-xl text-outline hover:text-on-surface transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeDrawer()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>

              <div
                className={"flex-1 overflow-y-auto p-space-xl space-y-space-xl"}
              >
                <div
                  className={
                    "bg-surface-container-low p-space-lg rounded-xl space-y-space-md"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={
                        "font-label-md text-outline uppercase tracking-wider"
                      }
                    >
                      {actions.text("Reason for Report")}
                    </span>
                    <span
                      className={
                        "bg-error-container text-on-error-container px-space-sm py-0.5 rounded font-label-md"
                      }
                    >
                      {actions.text("Dangerous API / Exploit")}
                    </span>
                  </div>
                  <p className={"font-body-md text-on-surface"}>
                    {actions.text(
                      '\n            "This endpoint accepts arbitrary SQL payloads in the header authentication field without sanitization, allowing potential unauthenticated remote code execution on the gateway server."\n          ',
                    )}
                  </p>
                  <div
                    className={
                      "flex items-center gap-space-md pt-space-sm border-t border-outline-variant/20"
                    }
                  >
                    <span className={"font-body-sm text-outline"}>
                      {actions.text("Severity: ")}
                      <strong className={"text-error"}>
                        {actions.text("High")}
                      </strong>
                    </span>
                    <span className={"font-body-sm text-outline"}>
                      {actions.text("Evidence Attached: ")}
                      <strong className={"text-on-surface"}>
                        {actions.text("3 payload logs (.json)")}
                      </strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h4
                    className={
                      "font-headline-sm text-on-surface mb-space-md flex items-center gap-space-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"api"}
                    </span>
                    {actions.text(" Target API Profile\n          ")}
                  </h4>
                  <div
                    className={
                      "bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg grid grid-cols-2 gap-space-md"
                    }
                  >
                    <div>
                      <span className={"font-label-md text-outline block"}>
                        {actions.text("Provider")}
                      </span>
                      <span
                        className={"font-body-md font-medium text-on-surface"}
                      >
                        {actions.text("FinTech Corp (ID: prov_88291)")}
                      </span>
                    </div>
                    <div>
                      <span className={"font-label-md text-outline block"}>
                        {actions.text("Current Status")}
                      </span>
                      <span
                        className={
                          "inline-flex items-center gap-1 font-medium text-secondary"
                        }
                      >
                        <span
                          className={"w-2 h-2 rounded-full bg-secondary"}
                        ></span>
                        {actions.text(" Active / Investigating")}
                      </span>
                    </div>
                    <div>
                      <span className={"font-label-md text-outline block"}>
                        {actions.text("Total Requests / 24h")}
                      </span>
                      <span
                        className={"font-body-md font-medium text-on-surface"}
                      >
                        {actions.text("1,429,204")}
                      </span>
                    </div>
                    <div>
                      <span className={"font-label-md text-outline block"}>
                        {actions.text("Error Rate")}
                      </span>
                      <span className={"font-body-md font-medium text-error"}>
                        {actions.text("4.2% (Spike detected)")}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4
                    className={
                      "font-headline-sm text-on-surface mb-space-md flex items-center gap-space-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"monitoring"}
                    </span>
                    {actions.text(" Telemetry & Evidence\n          ")}
                  </h4>
                  <div
                    className={
                      "bg-surface-container-low p-space-lg rounded-xl space-y-space-md font-code-sm text-outline"
                    }
                  >
                    <div
                      className={
                        "flex justify-between items-center bg-surface-container-lowest p-space-sm rounded-lg"
                      }
                    >
                      <span className={"text-on-surface truncate"}>
                        {actions.text("payload_dump_auth_header_exploit.json")}
                      </span>
                      <button
                        data-action-text={"download Download"}
                        className={
                          "text-primary hover:underline font-label-md flex items-center gap-1"
                        }
                        type="button"
                        aria-label={actions.text("Download")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"download"}
                        </span>
                        {actions.text(" Download\n              ")}
                      </button>
                    </div>
                    <div
                      className={
                        "flex justify-between items-center bg-surface-container-lowest p-space-sm rounded-lg"
                      }
                    >
                      <span className={"text-on-surface truncate"}>
                        {actions.text("gateway_latency_spike_oct24.csv")}
                      </span>
                      <button
                        data-action-text={"download Download"}
                        className={
                          "text-primary hover:underline font-label-md flex items-center gap-1"
                        }
                        type="button"
                        aria-label={actions.text("Download")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"download"}
                        </span>
                        {actions.text(" Download\n              ")}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4
                    className={
                      "font-headline-sm text-on-surface mb-space-md flex items-center gap-space-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"history"}
                    </span>
                    {actions.text(" Case Timeline & History\n          ")}
                  </h4>
                  <div
                    className={
                      "space-y-space-md border-l-2 border-outline-variant/30 ml-2 pl-space-md"
                    }
                  >
                    <div className={"relative"}>
                      <div
                        className={
                          "absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface"
                        }
                      ></div>
                      <p className={"font-label-md text-outline"}>
                        {actions.text("Oct 24, 2023 - 14:22 UTC")}
                      </p>
                      <p className={"font-body-md text-on-surface font-medium"}>
                        {actions.text(
                          "Assigned to Alex M. under High Priority queue.",
                        )}
                      </p>
                    </div>
                    <div className={"relative"}>
                      <div
                        className={
                          "absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-outline ring-4 ring-surface"
                        }
                      ></div>
                      <p className={"font-label-md text-outline"}>
                        {actions.text("Oct 24, 2023 - 12:05 UTC")}
                      </p>
                      <p className={"font-body-md text-on-surface font-medium"}>
                        {actions.text(
                          "Report submitted by dev_guru99 with automated payload logs.",
                        )}
                      </p>
                    </div>
                    <div className={"relative"}>
                      <div
                        className={
                          "absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-outline ring-4 ring-surface"
                        }
                      ></div>
                      <p className={"font-label-md text-outline"}>
                        {actions.text("Oct 12, 2023 - 09:15 UTC")}
                      </p>
                      <p className={"font-body-md text-on-surface font-medium"}>
                        {actions.text(
                          "Previous minor report (#REP-8812) resolved without action.",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={"pt-space-md border-t border-outline-variant/30"}
                >
                  <h4
                    className={"font-headline-sm text-on-surface mb-space-md"}
                  >
                    {actions.text("Moderation Actions")}
                  </h4>
                  <div
                    className={"grid grid-cols-2 md:grid-cols-3 gap-space-sm"}
                  >
                    <button
                      data-action-text={"pending Mark Under Review"}
                      className={
                        "p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl font-label-md text-on-surface text-center transition-all flex flex-col items-center gap-space-xs"
                      }
                      type="button"
                      aria-label={actions.text("Mark Under Review")}
                      data-handler={"triggerAction('Mark Under Review')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-secondary"}
                      >
                        {"pending"}
                      </span>
                      {actions.text(
                        "\n              Mark Under Review\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={"help Request Info"}
                      className={
                        "p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl font-label-md text-on-surface text-center transition-all flex flex-col items-center gap-space-xs"
                      }
                      type="button"
                      aria-label={actions.text("Request Info")}
                      data-handler={"triggerAction('Request Information')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-primary"}
                      >
                        {"help"}
                      </span>
                      {actions.text(
                        "\n              Request Info\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={"task_alt Resolve No Action"}
                      className={
                        "p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl font-label-md text-on-surface text-center transition-all flex flex-col items-center gap-space-xs"
                      }
                      type="button"
                      aria-label={actions.text("Resolve No Action")}
                      data-handler={"triggerAction('Resolve Without Action')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-tertiary"}
                      >
                        {"task_alt"}
                      </span>
                      {actions.text(
                        "\n              Resolve No Action\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={"pause_circle Suspend API"}
                      className={
                        "p-space-md bg-error-container/40 hover:bg-error-container text-error rounded-xl font-label-md text-center transition-all flex flex-col items-center gap-space-xs"
                      }
                      type="button"
                      aria-label={actions.text("Suspend API")}
                      data-handler={"triggerAction('Suspend API')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined"}
                      >
                        {"pause_circle"}
                      </span>
                      {actions.text(
                        "\n              Suspend API\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={"settings_backup_restore Restore API"}
                      className={
                        "p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl font-label-md text-on-surface text-center transition-all flex flex-col items-center gap-space-xs"
                      }
                      type="button"
                      aria-label={actions.text("Restore API")}
                      data-handler={"triggerAction('Restore API')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-secondary"}
                      >
                        {"settings_backup_restore"}
                      </span>
                      {actions.text(
                        "\n              Restore API\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={"delete_forever Remove API"}
                      className={
                        "p-space-md bg-error text-on-error rounded-xl font-label-md text-center transition-all flex flex-col items-center gap-space-xs shadow-sm"
                      }
                      type="button"
                      aria-label={actions.text("Remove API")}
                      data-handler={"triggerAction('Remove API')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined"}
                      >
                        {"delete_forever"}
                      </span>
                      {actions.text("\n              Remove API\n            ")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id={"confirmModal"}
            className={
              actions.visible("confirmModal", false)
                ? "fixed inset-0 z-50 flex items-center justify-center"
                : "fixed inset-0 z-50 flex items-center justify-center hidden"
            }
          >
            <div
              data-action-text={""}
              className={
                "absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
              }
              data-handler={"closeConfirmModal()"}
              role="button"
              tabIndex={0}
            ></div>
            <div
              className={
                "bg-surface-container-lowest p-space-xl rounded-xl shadow-2xl max-w-md w-full relative z-10 space-y-space-lg"
              }
            >
              <div className={"flex items-center gap-space-md"}>
                <div
                  className={
                    "w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center"
                  }
                  id={"confirmIconContainer"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[24px]"}
                  >
                    {"warning"}
                  </span>
                </div>
                <div>
                  <h3
                    className={"font-headline-sm text-on-surface"}
                    id={"confirmTitle"}
                  >
                    {actions.text("Confirm Action")}
                  </h3>
                  <p className={"font-body-sm text-outline"} id={"confirmDesc"}>
                    {actions.text(
                      "Are you sure you want to execute this moderation action?",
                    )}
                  </p>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-low p-space-md rounded-xl font-code-sm text-on-surface"
                }
              >
                <span className={"text-outline block mb-1"}>
                  {actions.text("Audit Trail Entry Preview:")}
                </span>
                <span
                  id={"auditPreviewText"}
                  className={
                    actions.visible("auditPreviewText", true) ? "" : " hidden"
                  }
                >
                  {actions.text(
                    "[ADMIN_ACTION] Suspend Stripe Payment Gateway V2 - Reason: Security Exploit",
                  )}
                </span>
              </div>
              <div className={"flex items-center justify-end gap-space-sm"}>
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-space-md py-space-sm bg-surface-container text-on-surface rounded-xl font-label-md"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeConfirmModal()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Confirm & Log"}
                  className={
                    "px-space-md py-space-sm bg-primary text-on-primary rounded-xl font-label-md"
                  }
                  type="button"
                  aria-label={actions.text("Confirm & Log")}
                  data-handler={"executeAction()"}
                >
                  {actions.text("Confirm & Log")}
                </button>
              </div>
            </div>
          </div>

          <div
            className={
              "fixed bottom-space-xl right-space-xl z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-xl shadow-xl transform translate-y-24 opacity-0 transition-all duration-300 flex items-center gap-space-md"
            }
            id={"toast"}
          >
            <span
              aria-hidden={true}
              className={"material-symbols-outlined text-primary-fixed"}
            >
              {"check_circle"}
            </span>
            <span className={"font-body-md"} id={"toastText"}>
              {actions.text("Action executed successfully. Audit logged.")}
            </span>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
