import { useScreenActions } from "../features/screen-actions";
export default function Screen17() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            }
          >
            <div>
              <h1
                className={
                  "font-headline-lg text-on-surface text-headline-lg mb-1"
                }
              >
                {actions.text("Audit Logs & Administrative Activity")}
              </h1>
              <p
                className={"font-body-md text-on-surface-variant text-body-md"}
              >
                {actions.text(
                  "Read-only system activity trail and compliance record for all administrative actions across API HUB.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3 flex-wrap"}>
              <button
                data-action-text={"schedule Timezone: UTC"}
                className={
                  "flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-on-surface px-4 py-2 rounded-xl text-body-sm font-medium transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Timezone: UTC")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"schedule"}
                </span>
                {actions.text("\n        Timezone: UTC\n      ")}
              </button>
              <button
                data-action-text={"webhook Configure SIEM Webhook"}
                className={
                  "flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-on-surface px-4 py-2 rounded-xl text-body-sm font-medium transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Configure SIEM Webhook")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"webhook"}
                </span>
                {actions.text("\n        Configure SIEM Webhook\n      ")}
              </button>
              <button
                data-action-text={"download Export Audit Trail (CSV)"}
                className={
                  "flex items-center gap-2 bg-primary-container text-on-primary-container hover:opacity-90 px-4 py-2 rounded-xl text-body-sm font-medium transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Export Audit Trail (CSV)")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text("\n        Export Audit Trail (CSV)\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            }
          >
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={
                    "text-on-surface-variant font-label-md uppercase tracking-wider"
                  }
                >
                  {actions.text("Total Events (24h)")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary bg-primary-fixed/30 p-2 rounded-xl text-[20px]"
                  }
                >
                  {"monitoring"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1"
                  }
                >
                  {actions.text("1,428")}
                </div>
                <div
                  className={
                    "text-body-sm text-emerald-600 flex items-center gap-1 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text(" +12% vs yesterday\n        ")}
                </div>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={
                    "text-on-surface-variant font-label-md uppercase tracking-wider"
                  }
                >
                  {actions.text("Critical Admin Actions")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-amber-600 bg-amber-50 p-2 rounded-xl text-[20px]"
                  }
                >
                  {"admin_panel_settings"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1"
                  }
                >
                  {actions.text("34")}
                </div>
                <div
                  className={
                    "inline-flex items-center px-2 py-0.5 rounded-full text-code-sm font-medium bg-amber-100 text-amber-800"
                  }
                >
                  {actions.text("\n          Requires review badge\n        ")}
                </div>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={
                    "text-on-surface-variant font-label-md uppercase tracking-wider"
                  }
                >
                  {actions.text("Failed / Blocked Actions")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-error bg-error-container/30 p-2 rounded-xl text-[20px]"
                  }
                >
                  {"shield_lock"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1"
                  }
                >
                  {actions.text("3")}
                </div>
                <div
                  className={
                    "text-body-sm text-on-surface-variant flex items-center gap-1"
                  }
                >
                  <span
                    className={"w-2 h-2 rounded-full bg-emerald-500"}
                  ></span>
                  {actions.text(" Zero security incidents\n        ")}
                </div>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={
                    "text-on-surface-variant font-label-md uppercase tracking-wider"
                  }
                >
                  {actions.text("Retention Period")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary bg-primary-fixed/30 p-2 rounded-xl text-[20px]"
                  }
                >
                  {"lock"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-1"
                  }
                >
                  {actions.text("365 Days")}
                </div>
                <div
                  className={
                    "text-body-sm text-primary font-medium flex items-center gap-1"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"verified"}
                  </span>
                  {actions.text(" Immutable Storage Active\n        ")}
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest p-4 rounded-2xl shadow-sm mb-6 flex flex-col gap-4"
            }
          >
            <div
              className={
                "flex flex-col lg:flex-row gap-3 items-center justify-between"
              }
            >
              <div className={"relative flex-1 w-full"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
                  }
                >
                  {"search"}
                </span>
                <input
                  data-source-placeholder={
                    "Search by Admin, Target ID, or Event Summary..."
                  }
                  className={
                    "w-full bg-surface-container-low pl-11 pr-4 py-2.5 rounded-xl text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all"
                  }
                  placeholder={actions.text(
                    "Search by Admin, Target ID, or Event Summary...",
                  )}
                  type={"text"}
                  aria-label={actions.text(
                    "Search by Admin, Target ID, or Event Summary...",
                  )}
                />
              </div>
              <div
                className={
                  "flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0"
                }
              >
                <select
                  className={
                    "bg-surface-container-low text-on-surface text-body-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"Last 7 Days"}>
                    {actions.text("Last 7 Days")}
                  </option>
                  <option value={"Last 24 Hours"}>
                    {actions.text("Last 24 Hours")}
                  </option>
                  <option value={"Last 30 Days"}>
                    {actions.text("Last 30 Days")}
                  </option>
                  <option value={"Custom Range"}>
                    {actions.text("Custom Range")}
                  </option>
                </select>
                <select
                  className={
                    "bg-surface-container-low text-on-surface text-body-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All Admins"}>
                    {actions.text("All Admins")}
                  </option>
                  <option value={"alex.admin@apihub.dev"}>
                    {actions.text("alex.admin@apihub.dev")}
                  </option>
                  <option value={"sarah.security@apihub.dev"}>
                    {actions.text("sarah.security@apihub.dev")}
                  </option>
                  <option value={"mike.mod@apihub.dev"}>
                    {actions.text("mike.mod@apihub.dev")}
                  </option>
                </select>
                <select
                  className={
                    "bg-surface-container-low text-on-surface text-body-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All Event Types"}>
                    {actions.text("All Event Types")}
                  </option>
                  <option value={"Provider Approval"}>
                    {actions.text("Provider Approval")}
                  </option>
                  <option value={"API Moderation"}>
                    {actions.text("API Moderation")}
                  </option>
                  <option value={"User Suspension"}>
                    {actions.text("User Suspension")}
                  </option>
                  <option value={"Config Change"}>
                    {actions.text("Config Change")}
                  </option>
                </select>
                <select
                  className={
                    "bg-surface-container-low text-on-surface text-body-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All Results"}>
                    {actions.text("All Results")}
                  </option>
                  <option value={"Success"}>{actions.text("Success")}</option>
                  <option value={"Warning"}>{actions.text("Warning")}</option>
                  <option value={"Failed"}>{actions.text("Failed")}</option>
                </select>
              </div>
            </div>
            <div
              className={
                "flex items-center justify-between pt-2 border-t border-surface-container"
              }
            >
              <div
                className={
                  "flex items-center gap-2 text-body-sm text-on-surface-variant"
                }
              >
                <span>{actions.text("Active Filters: None")}</span>
                <button
                  data-action-text={"Reset Filters"}
                  className={"text-primary font-medium hover:underline ml-2"}
                  type="button"
                  aria-label={actions.text("Reset Filters")}
                >
                  {actions.text("Reset Filters")}
                </button>
              </div>
              <button
                data-action-text={"tune Advanced Query Builder"}
                className={
                  "text-body-sm text-primary font-medium flex items-center gap-1 hover:underline"
                }
                type="button"
                aria-label={actions.text("Advanced Query Builder")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"tune"}
                </span>
                {actions.text("\n        Advanced Query Builder\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden mb-6"
            }
          >
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low text-on-surface-variant font-label-md uppercase tracking-wider text-code-sm"
                    }
                  >
                    <th className={"py-3.5 px-4"}>
                      {actions.text("Timestamp")}
                    </th>
                    <th className={"py-3.5 px-4"}>
                      {actions.text("Administrator")}
                    </th>
                    <th className={"py-3.5 px-4"}>
                      {actions.text("Action Type")}
                    </th>
                    <th className={"py-3.5 px-4"}>
                      {actions.text("Target Resource")}
                    </th>
                    <th className={"py-3.5 px-4"}>
                      {actions.text("Target ID")}
                    </th>
                    <th className={"py-3.5 px-4"}>{actions.text("Result")}</th>
                    <th className={"py-3.5 px-4"}>
                      {actions.text("Summary / Reason")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={"divide-y divide-surface-container text-body-sm"}
                >
                  <tr
                    data-action-text={
                      "2023-10-24 14:32:10 UTC alex.admin@apihub.dev Provider Approved Provider #PRV-8821 Success Verified DNS TXT and compliance docs for FinTech Corp."
                    }
                    className={
                      "hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                    }
                    data-handler={"openDrawer('AUD-77291')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "2023-10-24 14:32:10 UTC alex.admin@apihub.dev Provider Approved Provider #PRV-8821 Success Verified DNS TXT and compliance docs for FinTech Corp.",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-4 font-code-sm text-on-surface-variant whitespace-nowrap"
                      }
                    >
                      {actions.text("2023-10-24 14:32:10 UTC")}
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("alex.admin@apihub.dev")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface"}>
                      {actions.text("Provider Approved")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface-variant"}>
                      {actions.text("Provider")}
                    </td>
                    <td className={"py-4 px-4 font-code-sm text-primary"}>
                      {actions.text("#PRV-8821")}
                    </td>
                    <td className={"py-4 px-4 whitespace-nowrap"}>
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-code-sm font-medium bg-emerald-100 text-emerald-800"
                        }
                      >
                        {actions.text("Success")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant truncate max-w-xs"
                      }
                    >
                      {actions.text(
                        "Verified DNS TXT and compliance docs for FinTech Corp.",
                      )}
                    </td>
                  </tr>
                  <tr
                    data-action-text={
                      "2023-10-24 13:15:42 UTC sarah.security@apihub.dev User Suspended User #USR-4419 Success Policy violation: automated scraping and quota abuse."
                    }
                    className={
                      "hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                    }
                    data-handler={"openDrawer('AUD-77292')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "2023-10-24 13:15:42 UTC sarah.security@apihub.dev User Suspended User #USR-4419 Success Policy violation: automated scraping and quota abuse.",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-4 font-code-sm text-on-surface-variant whitespace-nowrap"
                      }
                    >
                      {actions.text("2023-10-24 13:15:42 UTC")}
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("sarah.security@apihub.dev")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface"}>
                      {actions.text("User Suspended")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface-variant"}>
                      {actions.text("User")}
                    </td>
                    <td className={"py-4 px-4 font-code-sm text-primary"}>
                      {actions.text("#USR-4419")}
                    </td>
                    <td className={"py-4 px-4 whitespace-nowrap"}>
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-code-sm font-medium bg-emerald-100 text-emerald-800"
                        }
                      >
                        {actions.text("Success")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant truncate max-w-xs"
                      }
                    >
                      {actions.text(
                        "Policy violation: automated scraping and quota abuse.",
                      )}
                    </td>
                  </tr>
                  <tr
                    data-action-text={
                      "2023-10-24 11:05:00 UTC mike.mod@apihub.dev API Moderation Decision API #API-9039 Warning Suspended due to unlawful data flagging (#REP-9039)."
                    }
                    className={
                      "hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                    }
                    data-handler={"openDrawer('AUD-77293')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "2023-10-24 11:05:00 UTC mike.mod@apihub.dev API Moderation Decision API #API-9039 Warning Suspended due to unlawful data flagging (#REP-9039).",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-4 font-code-sm text-on-surface-variant whitespace-nowrap"
                      }
                    >
                      {actions.text("2023-10-24 11:05:00 UTC")}
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("mike.mod@apihub.dev")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface"}>
                      {actions.text("API Moderation Decision")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface-variant"}>
                      {actions.text("API")}
                    </td>
                    <td className={"py-4 px-4 font-code-sm text-primary"}>
                      {actions.text("#API-9039")}
                    </td>
                    <td className={"py-4 px-4 whitespace-nowrap"}>
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-code-sm font-medium bg-amber-100 text-amber-800"
                        }
                      >
                        {actions.text("Warning")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant truncate max-w-xs"
                      }
                    >
                      {actions.text(
                        "Suspended due to unlawful data flagging (#REP-9039).",
                      )}
                    </td>
                  </tr>
                  <tr
                    data-action-text={
                      "2023-10-24 09:44:12 UTC system.auth@apihub.dev Config Change System #CFG-0021 Success Updated global rate-limiting threshold for Tier 2 plans."
                    }
                    className={
                      "hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                    }
                    data-handler={"openDrawer('AUD-77294')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "2023-10-24 09:44:12 UTC system.auth@apihub.dev Config Change System #CFG-0021 Success Updated global rate-limiting threshold for Tier 2 plans.",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-4 font-code-sm text-on-surface-variant whitespace-nowrap"
                      }
                    >
                      {actions.text("2023-10-24 09:44:12 UTC")}
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("system.auth@apihub.dev")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface"}>
                      {actions.text("Config Change")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface-variant"}>
                      {actions.text("System")}
                    </td>
                    <td className={"py-4 px-4 font-code-sm text-primary"}>
                      {actions.text("#CFG-0021")}
                    </td>
                    <td className={"py-4 px-4 whitespace-nowrap"}>
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-code-sm font-medium bg-emerald-100 text-emerald-800"
                        }
                      >
                        {actions.text("Success")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant truncate max-w-xs"
                      }
                    >
                      {actions.text(
                        "Updated global rate-limiting threshold for Tier 2 plans.",
                      )}
                    </td>
                  </tr>
                  <tr
                    data-action-text={
                      "2023-10-24 08:20:15 UTC unknown.actor@external Unauthorized Access Route #SEC-403 Failed Blocked unauthenticated attempt to access admin endpoint /api/v1/admin/purge."
                    }
                    className={
                      "hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                    }
                    data-handler={"openDrawer('AUD-77295')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-4"
                    hidden={
                      !actions.matches(
                        "2023-10-24 08:20:15 UTC unknown.actor@external Unauthorized Access Route #SEC-403 Failed Blocked unauthenticated attempt to access admin endpoint /api/v1/admin/purge.",
                      )
                    }
                  >
                    <td
                      className={
                        "py-4 px-4 font-code-sm text-on-surface-variant whitespace-nowrap"
                      }
                    >
                      {actions.text("2023-10-24 08:20:15 UTC")}
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("unknown.actor@external")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface"}>
                      {actions.text("Unauthorized Access")}
                    </td>
                    <td className={"py-4 px-4 text-on-surface-variant"}>
                      {actions.text("Route")}
                    </td>
                    <td className={"py-4 px-4 font-code-sm text-primary"}>
                      {actions.text("#SEC-403")}
                    </td>
                    <td className={"py-4 px-4 whitespace-nowrap"}>
                      <span
                        className={
                          "inline-flex items-center px-2 py-0.5 rounded-full text-code-sm font-medium bg-red-100 text-red-800"
                        }
                      >
                        {actions.text("Failed")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant truncate max-w-xs"
                      }
                    >
                      {actions.text(
                        "Blocked unauthenticated attempt to access admin endpoint /api/v1/admin/purge.",
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className={
                "flex items-center justify-between p-4 border-t border-surface-container"
              }
            >
              <div className={"text-body-sm text-on-surface-variant"}>
                {actions.text("\n        Showing ")}
                <span className={"font-medium text-on-surface"}>
                  {actions.text("1-5")}
                </span>
                {actions.text(" of ")}
                <span className={"font-medium text-on-surface"}>
                  {actions.text("1,428")}
                </span>
                {actions.text(" logs (page 1 of 28)\n      ")}
              </div>
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"Previous"}
                  className={
                    "px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant text-body-sm font-medium opacity-50 cursor-not-allowed"
                  }
                  type="button"
                  aria-label={actions.text("Previous")}
                >
                  {actions.text("Previous")}
                </button>
                <button
                  data-action-text={"Next"}
                  className={
                    "px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-body-sm font-medium transition-all"
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
            className={"bg-surface-container-lowest p-6 rounded-2xl shadow-sm"}
          >
            <div className={"flex items-center justify-between mb-4"}>
              <div>
                <h2
                  className={
                    "font-headline-sm text-on-surface text-headline-sm mb-1"
                  }
                >
                  {actions.text("Operational Alert Inbox")}
                </h2>
                <p className={"font-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Recent high-privilege operations and security alerts requiring administrative oversight.",
                  )}
                </p>
              </div>
              <span
                className={
                  "inline-flex items-center px-2.5 py-1 rounded-full text-code-sm font-medium bg-primary-fixed text-on-primary-fixed-variant"
                }
              >
                {actions.text("\n        2 Active Reviews\n      ")}
              </span>
            </div>
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
              <div
                className={
                  "bg-surface-container-low p-4 rounded-xl flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-2"}>
                    <span
                      className={
                        "text-code-sm font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full"
                      }
                    >
                      {actions.text("High Privilege")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("10 mins ago")}
                    </span>
                  </div>
                  <h3
                    className={
                      "font-headline-sm text-on-surface text-body-lg mb-1"
                    }
                  >
                    {actions.text("Mass API Key Revocation Initiated")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text(
                      "Admin user sarah.security@apihub.dev revoked 45 keys associated with compromised provider node #PRV-3312.",
                    )}
                  </p>
                </div>
                <div className={"flex items-center gap-2"}>
                  <button
                    data-action-text={"Review Log"}
                    className={
                      "bg-primary text-on-primary px-3 py-1.5 rounded-lg text-body-sm font-medium hover:opacity-90 transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Review Log")}
                  >
                    {actions.text("Review Log")}
                  </button>
                  <button
                    data-action-text={"Dismiss"}
                    className={
                      "bg-surface-container-lowest text-on-surface px-3 py-1.5 rounded-lg text-body-sm font-medium hover:bg-surface-container transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Dismiss")}
                  >
                    {actions.text("Dismiss")}
                  </button>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-low p-4 rounded-xl flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-2"}>
                    <span
                      className={
                        "text-code-sm font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded-full"
                      }
                    >
                      {actions.text("Security Incident")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("42 mins ago")}
                    </span>
                  </div>
                  <h3
                    className={
                      "font-headline-sm text-on-surface text-body-lg mb-1"
                    }
                  >
                    {actions.text("Repeated Auth Failures on Admin Gateway")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text(
                      "IP address 192.168.104.12 blocked after 15 consecutive failed attempts against administrative API route.",
                    )}
                  </p>
                </div>
                <div className={"flex items-center gap-2"}>
                  <button
                    data-action-text={"Inspect IP"}
                    className={
                      "bg-primary text-on-primary px-3 py-1.5 rounded-lg text-body-sm font-medium hover:opacity-90 transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Inspect IP")}
                  >
                    {actions.text("Inspect IP")}
                  </button>
                  <button
                    data-action-text={"Dismiss"}
                    className={
                      "bg-surface-container-lowest text-on-surface px-3 py-1.5 rounded-lg text-body-sm font-medium hover:bg-surface-container transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Dismiss")}
                  >
                    {actions.text("Dismiss")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            id={"auditDrawer"}
            className={
              actions.visible("auditDrawer", false)
                ? "fixed inset-0 z-50 overflow-hidden"
                : "fixed inset-0 z-50 overflow-hidden hidden"
            }
          >
            <div
              data-action-text={""}
              className={
                "absolute inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"
              }
              data-handler={"closeDrawer()"}
              role="button"
              tabIndex={0}
            ></div>
            <div className={"absolute inset-y-0 right-0 max-w-full flex pl-10"}>
              <div
                className={
                  "w-screen max-w-xl bg-surface-container-lowest shadow-2xl flex flex-col"
                }
              >
                <div
                  className={
                    "p-6 border-b border-surface-container flex items-center justify-between bg-surface-container-low"
                  }
                >
                  <div>
                    <span className={"text-code-sm font-medium text-primary"}>
                      {actions.text("Audit Event Detail")}
                    </span>
                    <h2
                      id={"drawerEventId"}
                      className={
                        actions.visible("drawerEventId", true)
                          ? "font-headline-md text-on-surface text-headline-md"
                          : "font-headline-md text-on-surface text-headline-md hidden"
                      }
                    >
                      {actions.text("#AUD-77291")}
                    </h2>
                  </div>
                  <button
                    data-action-text={"close"}
                    className={
                      "p-2 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Close")}
                    data-handler={"closeDrawer()"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[20px]"}
                    >
                      {"close"}
                    </span>
                  </button>
                </div>

                <div className={"flex-1 overflow-y-auto p-6 space-y-6"}>
                  <div
                    className={
                      "bg-primary-fixed/30 border border-primary/20 p-4 rounded-xl flex items-start gap-3"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px] mt-0.5"
                      }
                    >
                      {"lock"}
                    </span>
                    <p className={"text-body-sm text-on-primary-fixed-variant"}>
                      {actions.text(
                        "Audit records are cryptographically sealed and immutable. Modification or deletion is strictly prohibited.",
                      )}
                    </p>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3"
                      }
                    >
                      {actions.text("Event Metadata")}
                    </h3>
                    <div
                      className={
                        "bg-surface-container-low p-4 rounded-xl space-y-3 text-body-sm"
                      }
                    >
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Timestamp:")}
                        </span>
                        <span className={"font-code-sm text-on-surface"}>
                          {actions.text("2023-10-24 14:32:10 UTC")}
                        </span>
                      </div>
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Administrator Actor:")}
                        </span>
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("alex.admin@apihub.dev")}
                        </span>
                      </div>
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Source IP:")}
                        </span>
                        <span className={"font-code-sm text-on-surface"}>
                          {actions.text("192.168.xxx.xx")}
                        </span>
                      </div>
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Correlation ID:")}
                        </span>
                        <span className={"font-code-sm text-primary"}>
                          {actions.text("corr_99f81a7b")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3"
                      }
                    >
                      {actions.text("State Changes (JSON Diff)")}
                    </h3>
                    <div
                      className={
                        "bg-surface-container-low p-4 rounded-xl font-code-sm text-code-md space-y-2 overflow-x-auto"
                      }
                    >
                      <div className={"text-red-600"}>
                        {actions.text('- "status": "PENDING_REVIEW"')}
                      </div>
                      <div className={"text-emerald-600"}>
                        {actions.text('+ "status": "APPROVED"')}
                      </div>
                      <div className={"text-on-surface-variant"}>
                        {actions.text('+ "verified_dns": true')}
                      </div>
                      <div className={"text-on-surface-variant"}>
                        {actions.text(
                          '+ "compliance_checked_by": "alex.admin@apihub.dev"',
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3"
                      }
                    >
                      {actions.text("Administrator Notes / Reason")}
                    </h3>
                    <div
                      className={
                        "bg-surface-container-low p-4 rounded-xl text-body-sm text-on-surface"
                      }
                    >
                      {actions.text(
                        "\n              Verified DNS TXT and compliance docs for FinTech Corp. All corporate identifiers match state registry records.\n            ",
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3"
                      }
                    >
                      {actions.text("Related Resource")}
                    </h3>
                    <a
                      data-action-text={
                        "corporate_fare View Provider Profile #PRV-8821 arrow_forward"
                      }
                      className={
                        "flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-body-sm font-medium text-primary"
                      }
                      href={"#"}
                    >
                      <span className={"flex items-center gap-2"}>
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"corporate_fare"}
                        </span>
                        {actions.text(
                          "\n                View Provider Profile #PRV-8821\n              ",
                        )}
                      </span>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"arrow_forward"}
                      </span>
                    </a>
                  </div>
                </div>

                <div
                  className={
                    "p-4 border-t border-surface-container bg-surface-container-low flex justify-end gap-2"
                  }
                >
                  <button
                    data-action-text={"Close"}
                    className={
                      "bg-surface-container-lowest hover:bg-surface-container text-on-surface px-4 py-2 rounded-xl text-body-sm font-medium transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Close")}
                    data-handler={"closeDrawer()"}
                  >
                    {actions.text("Close")}
                  </button>
                  <button
                    data-action-text={"Download Event Proof"}
                    className={
                      "bg-primary text-on-primary hover:opacity-90 px-4 py-2 rounded-xl text-body-sm font-medium transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Download Event Proof")}
                  >
                    {actions.text("Download Event Proof")}
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
