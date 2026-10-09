import { useScreenActions } from "../features/screen-actions";
export default function Screen21() {
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
              "flex items-center justify-between mb-8 bg-surface-container-low p-4 rounded-xl"
            }
          >
            <div className={"flex items-center gap-3"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-primary text-[20px]"}
              >
                {"tune"}
              </span>
              <span className={"text-body-sm font-medium text-on-surface"}>
                {actions.text("Workspace State Simulator:")}
              </span>
            </div>
            <div className={"flex items-center gap-2"}>
              <button
                data-action-text={"Active Subscriptions"}
                className={
                  "px-3 py-1.5 rounded-xl text-body-sm font-medium bg-primary text-on-primary transition-all"
                }
                id={"btn-default"}
                type="button"
                aria-label={actions.text("Active Subscriptions")}
                data-handler={"switchState('default')"}
              >
                {actions.text("Active Subscriptions")}
              </button>
              <button
                data-action-text={"Empty State"}
                className={
                  "px-3 py-1.5 rounded-xl text-body-sm font-medium bg-surface-container hover:bg-surface-container-high text-on-surface transition-all"
                }
                id={"btn-empty"}
                type="button"
                aria-label={actions.text("Empty State")}
                data-handler={"switchState('empty')"}
              >
                {actions.text("Empty State")}
              </button>
              <button
                data-action-text={"Expired / Cancelled"}
                className={
                  "px-3 py-1.5 rounded-xl text-body-sm font-medium bg-surface-container hover:bg-surface-container-high text-on-surface transition-all"
                }
                id={"btn-expired"}
                type="button"
                aria-label={actions.text("Expired / Cancelled")}
                data-handler={"switchState('expired')"}
              >
                {actions.text("Expired / Cancelled")}
              </button>
            </div>
          </div>

          <div
            id={"state-default"}
            className={
              actions.visible("state-default", true)
                ? "flex flex-col w-full space-y-8"
                : "flex flex-col w-full space-y-8 hidden"
            }
          >
            <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Total Active Subscriptions")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "p-2 rounded-xl bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                    }
                  >
                    {"api"}
                  </span>
                </div>
                <div className={"flex items-baseline gap-3"}>
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("12")}
                  </span>
                  <span
                    className={
                      "text-body-sm text-emerald-600 font-medium flex items-center"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px] mr-0.5"}
                    >
                      {"trending_up"}
                    </span>
                    {actions.text("+2 this month")}
                  </span>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Monthly Spend")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "p-2 rounded-xl bg-secondary-container text-on-secondary-container material-symbols-outlined text-[20px]"
                    }
                  >
                    {"payments"}
                  </span>
                </div>
                <div className={"flex items-baseline gap-3"}>
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("$840.00")}
                  </span>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Next invoice Oct 1")}
                  </span>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Quota Utilization")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "p-2 rounded-xl bg-primary-container/10 text-primary material-symbols-outlined text-[20px]"
                    }
                  >
                    {"speed"}
                  </span>
                </div>
                <div className={"flex flex-col gap-2"}>
                  <div className={"flex justify-between items-baseline"}>
                    <span
                      className={
                        "text-headline-lg font-headline-lg text-on-surface"
                      }
                    >
                      {actions.text("64.2%")}
                    </span>
                    <span
                      className={
                        "text-body-sm text-on-surface-variant font-medium"
                      }
                    >
                      {actions.text("1.61M / 2.5M req")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-surface-container h-2 rounded-full overflow-hidden"
                    }
                  >
                    <div
                      className={"bg-primary h-full rounded-full"}
                      style={{ width: "64.2%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                "flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest p-4 rounded-xl shadow-sm"
              }
            >
              <div className={"relative w-full md:w-96 flex items-center"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]"
                  }
                >
                  {"search"}
                </span>
                <input
                  data-source-placeholder={"Search by API name or provider..."}
                  className={
                    "w-full bg-surface-container-low pl-10 pr-4 py-2 rounded-xl text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all"
                  }
                  placeholder={actions.text(
                    "Search by API name or provider...",
                  )}
                  type={"text"}
                  aria-label={actions.text("Search by API name or provider...")}
                />
              </div>
              <div
                className={
                  "flex items-center gap-3 w-full md:w-auto justify-end"
                }
              >
                <div
                  className={
                    "flex items-center bg-surface-container-low px-3 py-2 rounded-xl text-body-sm"
                  }
                >
                  <span className={"text-on-surface-variant mr-2"}>
                    {actions.text("Status:")}
                  </span>
                  <select
                    className={
                      "bg-transparent outline-none font-medium text-on-surface cursor-pointer"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"All Statuses"}>
                      {actions.text("All Statuses")}
                    </option>
                    <option value={"Active"}>{actions.text("Active")}</option>
                    <option value={"Expired"}>{actions.text("Expired")}</option>
                    <option value={"Suspended"}>
                      {actions.text("Suspended")}
                    </option>
                    <option value={"Pending Activation"}>
                      {actions.text("Pending Activation")}
                    </option>
                  </select>
                </div>
                <div
                  className={
                    "flex items-center bg-surface-container-low px-3 py-2 rounded-xl text-body-sm"
                  }
                >
                  <span className={"text-on-surface-variant mr-2"}>
                    {actions.text("Sort:")}
                  </span>
                  <select
                    className={
                      "bg-transparent outline-none font-medium text-on-surface cursor-pointer"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"Renewal Date"}>
                      {actions.text("Renewal Date")}
                    </option>
                    <option value={"Usage"}>{actions.text("Usage")}</option>
                    <option value={"Name"}>{actions.text("Name")}</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"
              }
            >
              <div className={"overflow-x-auto"}>
                <table className={"w-full text-left border-collapse"}>
                  <thead>
                    <tr
                      className={
                        "bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider"
                      }
                    >
                      <th className={"py-4 px-6 font-medium"}>
                        {actions.text("API Name & Provider")}
                      </th>
                      <th className={"py-4 px-6 font-medium"}>
                        {actions.text("Current Plan")}
                      </th>
                      <th className={"py-4 px-6 font-medium"}>
                        {actions.text("Status")}
                      </th>
                      <th className={"py-4 px-6 font-medium"}>
                        {actions.text("Quota Usage")}
                      </th>
                      <th className={"py-4 px-6 font-medium"}>
                        {actions.text("Renewal / Expiration")}
                      </th>
                      <th className={"py-4 px-6 font-medium"}>
                        {actions.text("Last Used")}
                      </th>
                      <th className={"py-4 px-6 font-medium text-right"}>
                        {actions.text("Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={
                      "divide-y divide-surface-container text-body-md text-on-surface"
                    }
                  >
                    <tr
                      data-action-text={
                        "NL Neural LLM v4 DeepCore AI Developer Pro Active 340k / 500k 68% Oct 15, 2024 2 mins ago visibility code settings"
                      }
                      className={
                        "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                      }
                      data-handler={"openDrawer('Neural LLM v4')"}
                      role="button"
                      tabIndex={0}
                      data-record="row-0"
                      hidden={
                        !actions.matches(
                          "NL Neural LLM v4 DeepCore AI Developer Pro Active 340k / 500k 68% Oct 15, 2024 2 mins ago visibility code settings",
                        )
                      }
                    >
                      <td className={"py-4 px-6"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm"
                            }
                          >
                            {actions.text("NL")}
                          </div>
                          <div>
                            <div className={"font-medium text-on-surface"}>
                              {actions.text("Neural LLM v4")}
                            </div>
                            <div
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("DeepCore AI")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-xl bg-secondary-container text-on-secondary-container text-label-md font-medium"
                          }
                        >
                          {actions.text("Developer Pro")}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-medium flex items-center w-max gap-1"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-0",
                            " Active\n                ",
                          )}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <div className={"flex flex-col gap-1 w-36"}>
                          <div className={"flex justify-between text-body-sm"}>
                            <span className={"font-code-sm"}>
                              {actions.text("340k / 500k")}
                            </span>
                            <span className={"text-on-surface-variant"}>
                              {actions.text("68%")}
                            </span>
                          </div>
                          <div
                            className={
                              "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                            }
                          >
                            <div
                              className={"bg-primary h-full rounded-full"}
                              style={{ width: "68%" }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-4 px-6 font-code-sm text-on-surface-variant"
                        }
                      >
                        {actions.text("Oct 15, 2024")}
                      </td>
                      <td
                        className={
                          "py-4 px-6 text-on-surface-variant text-body-sm"
                        }
                      >
                        {actions.text("2 mins ago")}
                      </td>
                      <td
                        data-action-text={"visibility code settings"}
                        className={"py-4 px-6 text-right"}
                        data-handler={"event.stopPropagation()"}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={"flex items-center justify-end gap-2"}>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={"openDrawer('Neural LLM v4')"}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"code"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Playground")}
                            type="button"
                            aria-label={actions.text("code")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"code"}
                            </span>
                          </button>
                          <button
                            data-action-text={"settings"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage Subscription")}
                            type="button"
                            aria-label={actions.text("settings")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"settings"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      data-action-text={
                        "GG Global Geocoding Plus MapStack Inc Enterprise Active 1.2M / 2.0M 60% Nov 01, 2024 14 mins ago visibility code settings"
                      }
                      className={
                        "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                      }
                      data-handler={"openDrawer('Global Geocoding Plus')"}
                      role="button"
                      tabIndex={0}
                      data-record="row-1"
                      hidden={
                        !actions.matches(
                          "GG Global Geocoding Plus MapStack Inc Enterprise Active 1.2M / 2.0M 60% Nov 01, 2024 14 mins ago visibility code settings",
                        )
                      }
                    >
                      <td className={"py-4 px-6"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-headline-sm"
                            }
                          >
                            {actions.text("GG")}
                          </div>
                          <div>
                            <div className={"font-medium text-on-surface"}>
                              {actions.text("Global Geocoding Plus")}
                            </div>
                            <div
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("MapStack Inc")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-xl bg-surface-container text-on-surface text-label-md font-medium"
                          }
                        >
                          {actions.text("Enterprise")}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-medium flex items-center w-max gap-1"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-1",
                            " Active\n                ",
                          )}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <div className={"flex flex-col gap-1 w-36"}>
                          <div className={"flex justify-between text-body-sm"}>
                            <span className={"font-code-sm"}>
                              {actions.text("1.2M / 2.0M")}
                            </span>
                            <span className={"text-on-surface-variant"}>
                              {actions.text("60%")}
                            </span>
                          </div>
                          <div
                            className={
                              "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                            }
                          >
                            <div
                              className={"bg-primary h-full rounded-full"}
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-4 px-6 font-code-sm text-on-surface-variant"
                        }
                      >
                        {actions.text("Nov 01, 2024")}
                      </td>
                      <td
                        className={
                          "py-4 px-6 text-on-surface-variant text-body-sm"
                        }
                      >
                        {actions.text("14 mins ago")}
                      </td>
                      <td
                        data-action-text={"visibility code settings"}
                        className={"py-4 px-6 text-right"}
                        data-handler={"event.stopPropagation()"}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={"flex items-center justify-end gap-2"}>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"code"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Playground")}
                            type="button"
                            aria-label={actions.text("code")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"code"}
                            </span>
                          </button>
                          <button
                            data-action-text={"settings"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage Subscription")}
                            type="button"
                            aria-label={actions.text("settings")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"settings"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                      }
                      data-record="row-2"
                      hidden={
                        !actions.matches(
                          "ST SecureVault Tokenizer CryptoSafe Starter Expiring 49.9k / 50k 99% Tomorrow 3 hours ago visibility code settings",
                        )
                      }
                    >
                      <td className={"py-4 px-6"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center font-headline-sm"
                            }
                          >
                            {actions.text("ST")}
                          </div>
                          <div>
                            <div className={"font-medium text-on-surface"}>
                              {actions.text("SecureVault Tokenizer")}
                            </div>
                            <div
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("CryptoSafe")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-xl bg-surface-container text-on-surface text-label-md font-medium"
                          }
                        >
                          {actions.text("Starter")}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-label-md font-medium flex items-center w-max gap-1"
                          }
                        >
                          <span
                            className={"w-1.5 h-1.5 rounded-full bg-amber-600"}
                          ></span>
                          {actions.text(" Expiring\n                ")}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <div className={"flex flex-col gap-1 w-36"}>
                          <div className={"flex justify-between text-body-sm"}>
                            <span className={"font-code-sm"}>
                              {actions.text("49.9k / 50k")}
                            </span>
                            <span className={"text-amber-600 font-medium"}>
                              {actions.text("99%")}
                            </span>
                          </div>
                          <div
                            className={
                              "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                            }
                          >
                            <div
                              className={"bg-amber-500 h-full rounded-full"}
                              style={{ width: "99%" }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-4 px-6 font-code-sm text-amber-600 font-medium"
                        }
                      >
                        {actions.text("Tomorrow")}
                      </td>
                      <td
                        className={
                          "py-4 px-6 text-on-surface-variant text-body-sm"
                        }
                      >
                        {actions.text("3 hours ago")}
                      </td>
                      <td
                        data-action-text={"visibility code settings"}
                        className={"py-4 px-6 text-right"}
                        data-handler={"event.stopPropagation()"}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={"flex items-center justify-end gap-2"}>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"code"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Playground")}
                            type="button"
                            aria-label={actions.text("code")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"code"}
                            </span>
                          </button>
                          <button
                            data-action-text={"settings"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage Subscription")}
                            type="button"
                            aria-label={actions.text("settings")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"settings"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                      }
                      data-record="row-3"
                      hidden={
                        !actions.matches(
                          "FX Realtime FX Rates CurrencyFeed Developer Pro Suspended 100k / 100k Limit Reached Sep 30, 2024 2 days ago visibility code settings",
                        )
                      }
                    >
                      <td className={"py-4 px-6"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center font-headline-sm"
                            }
                          >
                            {actions.text("FX")}
                          </div>
                          <div>
                            <div className={"font-medium text-on-surface"}>
                              {actions.text("Realtime FX Rates")}
                            </div>
                            <div
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("CurrencyFeed")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-xl bg-secondary-container text-on-secondary-container text-label-md font-medium"
                          }
                        >
                          {actions.text("Developer Pro")}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-label-md font-medium flex items-center w-max gap-1"
                          }
                        >
                          <span
                            className={"w-1.5 h-1.5 rounded-full bg-rose-600"}
                          ></span>
                          {actions.recordText(
                            "row-3",
                            " Suspended\n                ",
                          )}
                        </span>
                      </td>
                      <td className={"py-4 px-6"}>
                        <div className={"flex flex-col gap-1 w-36"}>
                          <div className={"flex justify-between text-body-sm"}>
                            <span className={"font-code-sm"}>
                              {actions.text("100k / 100k")}
                            </span>
                            <span className={"text-rose-600 font-medium"}>
                              {actions.text("Limit Reached")}
                            </span>
                          </div>
                          <div
                            className={
                              "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                            }
                          >
                            <div
                              className={"bg-rose-500 h-full rounded-full"}
                              style={{ width: "100%" }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-4 px-6 font-code-sm text-on-surface-variant"
                        }
                      >
                        {actions.text("Sep 30, 2024")}
                      </td>
                      <td
                        className={
                          "py-4 px-6 text-on-surface-variant text-body-sm"
                        }
                      >
                        {actions.text("2 days ago")}
                      </td>
                      <td
                        data-action-text={"visibility code settings"}
                        className={"py-4 px-6 text-right"}
                        data-handler={"event.stopPropagation()"}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={"flex items-center justify-end gap-2"}>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"code"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Playground")}
                            type="button"
                            aria-label={actions.text("code")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"code"}
                            </span>
                          </button>
                          <button
                            data-action-text={"settings"}
                            className={
                              "p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage Subscription")}
                            type="button"
                            aria-label={actions.text("settings")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"settings"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div
            id={"state-empty"}
            className={
              actions.visible("state-empty", false)
                ? "flex flex-col items-center justify-center py-20 px-4 bg-surface-container-lowest rounded-xl shadow-sm text-center"
                : "flex flex-col items-center justify-center py-20 px-4 bg-surface-container-lowest rounded-xl shadow-sm text-center hidden"
            }
          >
            <div
              className={
                "w-16 h-16 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center mb-6"
              }
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[32px]"}
              >
                {"api"}
              </span>
            </div>
            <h3
              className={
                "text-headline-md font-headline-md text-on-surface mb-2"
              }
            >
              {actions.text("No Active Subscriptions")}
            </h3>
            <p className={"text-body-md text-on-surface-variant max-w-md mb-8"}>
              {actions.text(
                "You haven't subscribed to any APIs yet. Explore our extensive marketplace to integrate cutting-edge capabilities into your application.",
              )}
            </p>
            <button
              data-action-text={"explore Explore Marketplace"}
              className={
                "px-6 py-3 rounded-xl bg-primary text-on-primary font-medium hover:opacity-95 transition-all shadow-sm flex items-center gap-2"
              }
              type="button"
              aria-label={actions.text("Explore Marketplace")}
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[20px]"}
              >
                {"explore"}
              </span>
              {actions.text(" Explore Marketplace\n    ")}
            </button>
          </div>

          <div
            id={"state-expired"}
            className={
              actions.visible("state-expired", false)
                ? "flex flex-col w-full space-y-6"
                : "flex flex-col w-full space-y-6 hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div className={"flex items-center gap-4"}>
                <div
                  className={
                    "w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[24px]"}
                  >
                    {"block"}
                  </span>
                </div>
                <div>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Vision Image Processor (v2.1)")}
                  </h4>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Provider: PixelCraft Labs • Cancelled on Aug 12, 2024",
                    )}
                  </p>
                </div>
              </div>
              <div className={"flex items-center gap-3"}>
                <span
                  className={
                    "px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-label-md font-medium"
                  }
                >
                  {actions.text("Cancelled")}
                </span>
                <button
                  data-action-text={"Resubscribe"}
                  className={
                    "px-4 py-2 rounded-xl bg-primary text-on-primary text-body-sm font-medium hover:opacity-95 transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Resubscribe")}
                >
                  {actions.text("Resubscribe")}
                </button>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div className={"flex items-center gap-4"}>
                <div
                  className={
                    "w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[24px]"}
                  >
                    {"timer_off"}
                  </span>
                </div>
                <div>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Legacy Sentiment Analyzer")}
                  </h4>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Provider: TextMetrics • Expired on Jul 01, 2024",
                    )}
                  </p>
                </div>
              </div>
              <div className={"flex items-center gap-3"}>
                <span
                  className={
                    "px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-md font-medium"
                  }
                >
                  {actions.text("Expired")}
                </span>
                <button
                  data-action-text={"View Archive"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("View Archive")}
                >
                  {actions.text("View Archive")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"api-drawer"}
            className={
              actions.visible("api-drawer", false)
                ? "fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex justify-end transition-opacity"
                : "fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex justify-end transition-opacity hidden"
            }
          >
            <div
              id={"drawer-panel"}
              className={
                actions.visible("drawer-panel", true)
                  ? "w-full max-w-xl bg-surface h-full shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300"
                  : "w-full max-w-xl bg-surface h-full shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 hidden"
              }
            >
              <div
                className={
                  "p-6 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between"
                }
              >
                <div className={"flex items-center gap-3"}>
                  <div
                    className={
                      "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm"
                    }
                  >
                    {actions.text("NL")}
                  </div>
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Neural LLM v4")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("DeepCore AI • Developer Pro Plan")}
                    </p>
                  </div>
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
                <div className={"grid grid-cols-2 gap-4"}>
                  <div
                    className={
                      "bg-surface-container-lowest p-4 rounded-xl shadow-sm"
                    }
                  >
                    <span
                      className={
                        "text-body-sm text-on-surface-variant block mb-1"
                      }
                    >
                      {actions.text("Status")}
                    </span>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-medium inline-flex items-center gap-1"
                      }
                    >
                      <span
                        className={"w-1.5 h-1.5 rounded-full bg-emerald-600"}
                      ></span>
                      {actions.text(" Active\n            ")}
                    </span>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest p-4 rounded-xl shadow-sm"
                    }
                  >
                    <span
                      className={
                        "text-body-sm text-on-surface-variant block mb-1"
                      }
                    >
                      {actions.text("Rate Limit")}
                    </span>
                    <span
                      className={
                        "text-body-md font-medium text-on-surface font-code-sm"
                      }
                    >
                      {actions.text("50 req / sec")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-3"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={"text-body-sm font-medium text-on-surface"}
                    >
                      {actions.text("Active API Key")}
                    </span>
                    <span
                      className={"text-label-md text-emerald-600 font-medium"}
                    >
                      {actions.text("Secured & Rotated")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 bg-surface-container-low p-2.5 rounded-xl"
                    }
                  >
                    <input
                      className={
                        "bg-transparent font-code-sm text-on-surface flex-1 outline-none"
                      }
                      id={"api-key-input"}
                      readOnly={true}
                      type={"password"}
                      defaultValue={"ak_live_998374a88fbc71203948"}
                    />
                    <button
                      data-action-text={"visibility"}
                      className={
                        "p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant"
                      }
                      title={actions.text("Show/Hide")}
                      type="button"
                      aria-label={actions.text("View")}
                      data-handler={"toggleKeyVisibility()"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                        id={"eye-icon"}
                      >
                        {"visibility"}
                      </span>
                    </button>
                    <button
                      data-action-text={"content_copy Copy"}
                      className={
                        "px-3 py-1.5 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:opacity-95 transition-all flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("Copy")}
                      data-handler={"copyApiKey()"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"content_copy"}
                      </span>
                      {actions.text(" Copy\n            ")}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-4"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={"text-body-sm font-medium text-on-surface"}
                    >
                      {actions.text("Current Billing Period Quota")}
                    </span>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Renews Oct 15")}
                    </span>
                  </div>
                  <div className={"flex flex-col gap-2"}>
                    <div
                      className={
                        "flex justify-between items-baseline text-body-sm"
                      }
                    >
                      <span
                        className={"font-code-sm font-medium text-on-surface"}
                      >
                        {actions.text("340,120 used")}
                      </span>
                      <span className={"text-on-surface-variant"}>
                        {actions.text("500,000 limit (68%)")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div
                        className={"bg-primary h-full rounded-full"}
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                  </div>
                  <div
                    className={
                      "pt-2 flex items-center justify-between border-t border-surface-container"
                    }
                  >
                    <a
                      data-action-text={"bar_chart View detailed analytics"}
                      className={
                        "text-primary text-body-sm font-medium hover:underline flex items-center gap-1"
                      }
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"bar_chart"}
                      </span>
                      {actions.text(" View detailed analytics\n            ")}
                    </a>
                    <a
                      data-action-text={"history Request history"}
                      className={
                        "text-primary text-body-sm font-medium hover:underline flex items-center gap-1"
                      }
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"history"}
                      </span>
                      {actions.text(" Request history\n            ")}
                    </a>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-3"
                  }
                >
                  <span
                    className={"text-body-sm font-medium text-on-surface block"}
                  >
                    {actions.text("Resources")}
                  </span>
                  <div className={"grid grid-cols-2 gap-3"}>
                    <a
                      data-action-text={"menu_book Docs Endpoints & Guides"}
                      className={
                        "p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-3"
                      }
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[20px]"
                        }
                      >
                        {"menu_book"}
                      </span>
                      <div>
                        <div
                          className={"text-body-sm font-medium text-on-surface"}
                        >
                          {actions.text("Docs")}
                        </div>
                        <div className={"text-body-xs text-on-surface-variant"}>
                          {actions.text("Endpoints & Guides")}
                        </div>
                      </div>
                    </a>
                    <a
                      data-action-text={"terminal Playground Test in browser"}
                      className={
                        "p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-3"
                      }
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[20px]"
                        }
                      >
                        {"terminal"}
                      </span>
                      <div>
                        <div
                          className={"text-body-sm font-medium text-on-surface"}
                        >
                          {actions.text("Playground")}
                        </div>
                        <div className={"text-body-xs text-on-surface-variant"}>
                          {actions.text("Test in browser")}
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-3"
                  }
                >
                  <span
                    className={"text-body-sm font-medium text-on-surface block"}
                  >
                    {actions.text("Subscription Management")}
                  </span>
                  <div className={"flex flex-col gap-2"}>
                    <button
                      data-action-text={
                        "upgrade Change Plan (Upgrade/Downgrade)"
                      }
                      className={
                        "w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-all flex items-center justify-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text(
                        "Change Plan (Upgrade/Downgrade)",
                      )}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"upgrade"}
                      </span>
                      {actions.text(
                        " Change Plan (Upgrade/Downgrade)\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={"cancel Cancel Subscription"}
                      className={
                        "w-full py-2.5 px-4 rounded-xl bg-error-container/20 hover:bg-error-container/30 text-error text-body-sm font-medium transition-all flex items-center justify-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text("Cancel Subscription")}
                      data-handler={"openCancelModal()"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"cancel"}
                      </span>
                      {actions.text(" Cancel Subscription\n            ")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id={"cancel-modal"}
            className={
              actions.visible("cancel-modal", false)
                ? "fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4"
                : "fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4 hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4"
              }
            >
              <div
                className={
                  "w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"warning"}
                </span>
              </div>
              <h3
                className={"text-headline-sm font-headline-sm text-on-surface"}
              >
                {actions.text("Cancel Neural LLM v4 Subscription?")}
              </h3>
              <p className={"text-body-md text-on-surface-variant"}>
                {actions.text(
                  "Warning: You will immediately lose access to all endpoints, active API keys will be revoked, and any unused quota will be forfeited at the end of the current billing cycle.",
                )}
              </p>
              <div className={"flex items-center justify-end gap-3 pt-2"}>
                <button
                  data-action-text={"Keep Subscription"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Keep Subscription")}
                  data-handler={"closeCancelModal()"}
                >
                  {actions.text("Keep Subscription")}
                </button>
                <button
                  data-action-text={"Yes, Cancel Subscription"}
                  className={
                    "px-4 py-2 rounded-xl bg-error text-on-error text-body-sm font-medium hover:opacity-95 transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Yes, Cancel Subscription")}
                  data-handler={"confirmCancellation()"}
                >
                  {actions.text("Yes, Cancel Subscription")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
