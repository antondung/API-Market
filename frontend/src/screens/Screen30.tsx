import { useScreenActions } from "../features/screen-actions";
export default function Screen30() {
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
              "px-space-xl pt-space-xl pb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md"
            }
          >
            <div>
              <div
                className={
                  "flex items-center gap-space-xs text-label-md text-outline mb-space-xs font-code-sm"
                }
              >
                <span>{actions.text("API HUB")}</span>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"chevron_right"}
                </span>
                <span>{actions.text("SUBSCRIBERS")}</span>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"chevron_right"}
                </span>
                <span className={"text-on-surface"}>
                  {actions.text("MANAGEMENT")}
                </span>
              </div>
              <h1
                className={
                  "text-headline-lg font-headline-lg text-on-surface tracking-tight"
                }
              >
                {actions.text("Subscriber Management")}
              </h1>
              <p className={"text-body-md text-secondary mt-space-xs"}>
                {actions.text(
                  "Monitor enterprise consumer plans, quota allocations, and active subscription lifecycle states.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-space-sm"}>
              <button
                data-action-text={"download Export CSV"}
                className={
                  "px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface font-label-md hover:bg-surface-container-highest transition-all flex items-center gap-space-xs"
                }
                type="button"
                aria-label={actions.text("Export CSV")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text("\n        Export CSV\n      ")}
              </button>
              <button
                data-action-text={"add Provision Subscriber"}
                className={
                  "px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-md hover:opacity-90 transition-all flex items-center gap-space-xs shadow-sm"
                }
                type="button"
                aria-label={actions.text("Provision Subscriber")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"add"}
                </span>
                {actions.text("\n        Provision Subscriber\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "px-space-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-space-xl"
            }
          >
            <div
              className={
                "p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden"
              }
            >
              <div
                className={
                  "absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 pointer-events-none"
                }
              ></div>
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "text-label-md font-label-md text-secondary uppercase tracking-wider"
                  }
                >
                  {actions.text("Total Active Subscribers")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"group"}
                  </span>
                </div>
              </div>
              <div>
                <div className={"flex items-baseline gap-space-sm"}>
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("1,428")}
                  </span>
                  <span
                    className={
                      "text-body-sm font-semibold text-emerald-600 flex items-center"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[14px]"}
                    >
                      {"trending_up"}
                    </span>
                    {actions.text("+12%")}
                  </span>
                </div>
                <p className={"text-body-sm text-outline mt-1"}>
                  {actions.text("Across 380 enterprise orgs")}
                </p>
              </div>
            </div>

            <div
              className={
                "p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden"
              }
            >
              <div
                className={
                  "absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 pointer-events-none"
                }
              ></div>
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "text-label-md font-label-md text-secondary uppercase tracking-wider"
                  }
                >
                  {actions.text("MRR (Simulated)")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"payments"}
                  </span>
                </div>
              </div>
              <div>
                <div className={"flex items-baseline gap-space-sm"}>
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("$24,850")}
                  </span>
                  <span className={"text-body-sm text-outline"}>
                    {actions.text("/mo")}
                  </span>
                </div>
                <p
                  className={
                    "text-body-sm text-emerald-600 mt-1 flex items-center gap-xs"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px]"}
                  >
                    {"verified"}
                  </span>
                  {actions.text(" Billing synced real-time\n        ")}
                </p>
              </div>
            </div>

            <div
              className={
                "p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden"
              }
            >
              <div
                className={
                  "absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 pointer-events-none"
                }
              ></div>
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "text-label-md font-label-md text-secondary uppercase tracking-wider"
                  }
                >
                  {actions.text("Quota Utilization Avg")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"speed"}
                  </span>
                </div>
              </div>
              <div>
                <div className={"flex items-baseline gap-space-sm"}>
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("68.4%")}
                  </span>
                  <span className={"text-body-sm font-semibold text-primary"}>
                    {actions.text("Healthy")}
                  </span>
                </div>
                <div
                  className={
                    "w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden"
                  }
                >
                  <div
                    className={"bg-primary h-full rounded-full"}
                    style={{ width: "68.4%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div
              className={
                "p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden"
              }
            >
              <div
                className={
                  "absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-amber-500/5 pointer-events-none"
                }
              ></div>
              <div className={"flex items-center justify-between mb-space-md"}>
                <span
                  className={
                    "text-label-md font-label-md text-secondary uppercase tracking-wider"
                  }
                >
                  {actions.text("Pending Reviews")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"pending_actions"}
                  </span>
                </div>
              </div>
              <div>
                <div className={"flex items-baseline gap-space-sm"}>
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("5")}
                  </span>
                  <span className={"text-body-sm font-semibold text-amber-600"}>
                    {actions.text("Action Req.")}
                  </span>
                </div>
                <p className={"text-body-sm text-outline mt-1"}>
                  {actions.text("Enterprise KYC & tier upgrades")}
                </p>
              </div>
            </div>
          </div>

          <div className={"px-space-xl mb-space-lg"}>
            <div
              className={
                "p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-wrap items-center justify-between gap-space-md"
              }
            >
              <div
                className={"flex flex-wrap items-center gap-space-sm flex-1"}
              >
                <div className={"relative flex-1 min-w-[280px]"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]"
                    }
                  >
                    {"search"}
                  </span>
                  <input
                    data-source-placeholder={
                      "Search consumer ID, email prefix, or org..."
                    }
                    className={
                      "w-full pl-10 pr-space-md py-2 bg-surface-container-low rounded-lg text-body-md text-on-surface placeholder:text-outline outline-none border border-transparent focus:border-primary transition-all font-code-sm"
                    }
                    placeholder={actions.text(
                      "Search consumer ID, email prefix, or org...",
                    )}
                    type={"text"}
                    aria-label={actions.text(
                      "Search consumer ID, email prefix, or org...",
                    )}
                  />
                </div>

                <div className={"relative"}>
                  <select
                    className={
                      "appearance-none bg-surface-container-low px-space-md py-2 pr-8 rounded-lg text-body-md text-on-surface outline-none cursor-pointer border border-transparent hover:border-outline-variant"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={""}>{actions.text("All APIs")}</option>
                    <option value={"neural-llm"}>
                      {actions.text("Neural LLM v4")}
                    </option>
                    <option value={"vector-search"}>
                      {actions.text("Vector Embeddings v2")}
                    </option>
                    <option value={"vision-ai"}>
                      {actions.text("Vision Inference v1")}
                    </option>
                  </select>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined absolute right-2 top-2.5 text-outline pointer-events-none text-[18px]"
                    }
                  >
                    {"expand_more"}
                  </span>
                </div>

                <div className={"relative"}>
                  <select
                    className={
                      "appearance-none bg-surface-container-low px-space-md py-2 pr-8 rounded-lg text-body-md text-on-surface outline-none cursor-pointer border border-transparent hover:border-outline-variant"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={""}>{actions.text("All Plan Tiers")}</option>
                    <option value={"enterprise"}>
                      {actions.text("Enterprise")}
                    </option>
                    <option value={"pro"}>{actions.text("Pro")}</option>
                    <option value={"starter"}>{actions.text("Starter")}</option>
                    <option value={"sandbox"}>
                      {actions.text("Free Sandbox")}
                    </option>
                  </select>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined absolute right-2 top-2.5 text-outline pointer-events-none text-[18px]"
                    }
                  >
                    {"expand_more"}
                  </span>
                </div>

                <div className={"relative"}>
                  <select
                    className={
                      "appearance-none bg-surface-container-low px-space-md py-2 pr-8 rounded-lg text-body-md text-on-surface outline-none cursor-pointer border border-transparent hover:border-outline-variant"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={""}>{actions.text("All Statuses")}</option>
                    <option value={"active"}>{actions.text("Active")}</option>
                    <option value={"suspended"}>
                      {actions.text("Suspended")}
                    </option>
                    <option value={"expired"}>{actions.text("Expired")}</option>
                    <option value={"review"}>
                      {actions.text("Review Required")}
                    </option>
                  </select>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined absolute right-2 top-2.5 text-outline pointer-events-none text-[18px]"
                    }
                  >
                    {"expand_more"}
                  </span>
                </div>
              </div>
              <div className={"flex items-center gap-space-sm"}>
                <button
                  data-action-text={"filter_list Advanced"}
                  className={
                    "px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md hover:bg-surface-container transition-all flex items-center gap-space-xs"
                  }
                  type="button"
                  aria-label={actions.text("Advanced")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"filter_list"}
                  </span>
                  {actions.text("\n          Advanced\n        ")}
                </button>
                <button
                  data-action-text={"refresh"}
                  className={
                    "px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md hover:bg-surface-container transition-all flex items-center gap-space-xs"
                  }
                  type="button"
                  aria-label={actions.text("Refresh")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"refresh"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className={"px-space-xl mb-space-xl"}>
            <div
              className={
                "rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden"
              }
            >
              <div className={"overflow-x-auto"}>
                <table className={"w-full text-left border-collapse"}>
                  <thead>
                    <tr
                      className={
                        "bg-surface-container-low text-secondary text-label-md uppercase tracking-wider"
                      }
                    >
                      <th className={"py-space-md px-space-lg font-semibold"}>
                        {actions.text("Consumer Identifier")}
                      </th>
                      <th className={"py-space-md px-lg font-semibold"}>
                        {actions.text("Subscribed API")}
                      </th>
                      <th className={"py-space-md px-space-lg font-semibold"}>
                        {actions.text("Plan Tier")}
                      </th>
                      <th className={"py-space-md px-space-lg font-semibold"}>
                        {actions.text("Status")}
                      </th>
                      <th className={"py-space-md px-space-lg font-semibold"}>
                        {actions.text("Validity")}
                      </th>
                      <th className={"py-space-md px-space-lg font-semibold"}>
                        {actions.text("Request Usage")}
                      </th>
                      <th
                        className={
                          "py-space-md px-space-lg font-semibold text-right"
                        }
                      >
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
                        "hover:bg-surface-container-low/50 transition-colors group"
                      }
                      data-record="row-0"
                      hidden={
                        !actions.matches(
                          "AC usr_982x...ac41 Acme Corp Labs Neural LLM v4 us-east-cluster Enterprise Active Oct 12, 2024 Renews in 18d 840k 1M req analytics visibility more_vert",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-sm"}>
                          <div
                            className={
                              "w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-code-sm font-semibold text-on-primary-fixed"
                            }
                          >
                            {actions.text("AC")}
                          </div>
                          <div>
                            <span
                              className={
                                "font-code-md font-semibold text-on-surface block"
                              }
                            >
                              {actions.text("usr_982x...ac41")}
                            </span>
                            <span className={"text-body-sm text-outline"}>
                              {actions.text("Acme Corp Labs")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"font-semibold"}>
                          {actions.text("Neural LLM v4")}
                        </span>
                        <span className={"block text-body-sm text-outline"}>
                          {actions.text("us-east-cluster")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md font-semibold"
                          }
                        >
                          {actions.text("Enterprise")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-md font-medium"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-0",
                            "\n                  Active\n                ",
                          )}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"text-body-sm text-secondary"}>
                          {actions.text("Oct 12, 2024")}
                        </span>
                        <span className={"block text-body-sm text-outline"}>
                          {actions.text("Renews in 18d")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"w-36"}>
                          <div
                            className={
                              "flex justify-between text-body-sm font-code-sm mb-1"
                            }
                          >
                            <span>{actions.text("840k")}</span>
                            <span className={"text-outline"}>
                              {actions.text("1M req")}
                            </span>
                          </div>
                          <div
                            className={
                              "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                            }
                          >
                            <div
                              className={"bg-primary h-full rounded-full"}
                              style={{ width: "84%" }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"analytics"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Usage")}
                            type="button"
                            aria-label={actions.text("analytics")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"analytics"}
                            </span>
                          </button>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Detail Drawer")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={"toggleDrawer('drawer-1')"}
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
                            data-action-text={"more_vert"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage")}
                            type="button"
                            aria-label={actions.text("More actions")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"more_vert"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low/50 transition-colors group"
                      }
                      data-record="row-1"
                      hidden={
                        !actions.matches(
                          "ST usr_441p...ff09 Starlight AI Vector Embeddings v2 eu-west-cluster Pro Active Nov 01, 2024 Renews in 38d 210k 500k req analytics visibility more_vert",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-sm"}>
                          <div
                            className={
                              "w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-code-sm font-semibold text-on-secondary-fixed"
                            }
                          >
                            {actions.text("ST")}
                          </div>
                          <div>
                            <span
                              className={
                                "font-code-md font-semibold text-on-surface block"
                              }
                            >
                              {actions.text("usr_441p...ff09")}
                            </span>
                            <span className={"text-body-sm text-outline"}>
                              {actions.text("Starlight AI")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"font-semibold"}>
                          {actions.text("Vector Embeddings v2")}
                        </span>
                        <span className={"block text-body-sm text-outline"}>
                          {actions.text("eu-west-cluster")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md font-semibold"
                          }
                        >
                          {actions.text("Pro")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-md font-medium"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-1",
                            "\n                  Active\n                ",
                          )}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"text-body-sm text-secondary"}>
                          {actions.text("Nov 01, 2024")}
                        </span>
                        <span className={"block text-body-sm text-outline"}>
                          {actions.text("Renews in 38d")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"w-36"}>
                          <div
                            className={
                              "flex justify-between text-body-sm font-code-sm mb-1"
                            }
                          >
                            <span>{actions.text("210k")}</span>
                            <span className={"text-outline"}>
                              {actions.text("500k req")}
                            </span>
                          </div>
                          <div
                            className={
                              "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                            }
                          >
                            <div
                              className={"bg-primary h-full rounded-full"}
                              style={{ width: "42%" }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"analytics"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Usage")}
                            type="button"
                            aria-label={actions.text("analytics")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"analytics"}
                            </span>
                          </button>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Detail Drawer")}
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
                            data-action-text={"more_vert"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage")}
                            type="button"
                            aria-label={actions.text("More actions")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"more_vert"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low/50 transition-colors group"
                      }
                      data-record="row-2"
                      hidden={
                        !actions.matches(
                          "NX usr_773z...bb22 Nexus Dynamics Neural LLM v4 us-west-cluster Enterprise Review Req. Pending KYC Verification 0 2M req analytics visibility more_vert",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-sm"}>
                          <div
                            className={
                              "w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-code-sm font-semibold text-amber-800"
                            }
                          >
                            {actions.text("NX")}
                          </div>
                          <div>
                            <span
                              className={
                                "font-code-md font-semibold text-on-surface block"
                              }
                            >
                              {actions.text("usr_773z...bb22")}
                            </span>
                            <span className={"text-body-sm text-outline"}>
                              {actions.text("Nexus Dynamics")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"font-semibold"}>
                          {actions.text("Neural LLM v4")}
                        </span>
                        <span className={"block text-body-sm text-outline"}>
                          {actions.text("us-west-cluster")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-label-md font-semibold"
                          }
                        >
                          {actions.text("Enterprise")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-label-md font-medium"
                          }
                        >
                          <span
                            className={"w-1.5 h-1.5 rounded-full bg-amber-600"}
                          ></span>
                          {actions.text(
                            "\n                  Review Req.\n                ",
                          )}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"text-body-sm text-secondary"}>
                          {actions.recordText("row-2", "Pending")}
                        </span>
                        <span className={"block text-body-sm text-outline"}>
                          {actions.text("KYC Verification")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"w-36"}>
                          <div
                            className={
                              "flex justify-between text-body-sm font-code-sm mb-1"
                            }
                          >
                            <span>{actions.text("0")}</span>
                            <span className={"text-outline"}>
                              {actions.text("2M req")}
                            </span>
                          </div>
                          <div
                            className={
                              "w-full bg-surface-container h-1.5 rounded-full overflow-hidden"
                            }
                          >
                            <div
                              className={"bg-amber-500 h-full rounded-full"}
                              style={{ width: "0%" }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"analytics"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Usage")}
                            type="button"
                            aria-label={actions.text("analytics")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"analytics"}
                            </span>
                          </button>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Detail Drawer")}
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
                            data-action-text={"more_vert"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage")}
                            type="button"
                            aria-label={actions.text("More actions")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"more_vert"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low/50 transition-colors group"
                      }
                      data-record="row-3"
                      hidden={
                        !actions.matches(
                          "QL usr_109k...ee88 QuantLogix Vision Inference v1 ap-southeast-1 Starter Suspended Sep 15, 2024 Rate limit abuse 100k 100k req analytics visibility more_vert",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-sm"}>
                          <div
                            className={
                              "w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-code-sm font-semibold text-rose-800"
                            }
                          >
                            {actions.text("QL")}
                          </div>
                          <div>
                            <span
                              className={
                                "font-code-md font-semibold text-on-surface block"
                              }
                            >
                              {actions.text("usr_109k...ee88")}
                            </span>
                            <span className={"text-body-sm text-outline"}>
                              {actions.text("QuantLogix")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"font-semibold"}>
                          {actions.text("Vision Inference v1")}
                        </span>
                        <span className={"block text-body-sm text-outline"}>
                          {actions.text("ap-southeast-1")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-md font-semibold"
                          }
                        >
                          {actions.text("Starter")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-label-md font-medium"
                          }
                        >
                          <span
                            className={"w-1.5 h-1.5 rounded-full bg-rose-600"}
                          ></span>
                          {actions.recordText(
                            "row-3",
                            "\n                  Suspended\n                ",
                          )}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span className={"text-body-sm text-secondary"}>
                          {actions.text("Sep 15, 2024")}
                        </span>
                        <span className={"block text-body-sm text-rose-600"}>
                          {actions.text("Rate limit abuse")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"w-36"}>
                          <div
                            className={
                              "flex justify-between text-body-sm font-code-sm mb-1"
                            }
                          >
                            <span>{actions.text("100k")}</span>
                            <span className={"text-outline"}>
                              {actions.text("100k req")}
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
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"analytics"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Usage")}
                            type="button"
                            aria-label={actions.text("analytics")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"analytics"}
                            </span>
                          </button>
                          <button
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Detail Drawer")}
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
                            data-action-text={"more_vert"}
                            className={
                              "p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-all"
                            }
                            title={actions.text("Manage")}
                            type="button"
                            aria-label={actions.text("More actions")}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"more_vert"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                className={
                  "p-space-md bg-surface-container-low flex items-center justify-between"
                }
              >
                <span className={"text-body-sm text-outline"}>
                  {actions.text("Showing 1-4 of 1,428 subscribers")}
                </span>
                <div className={"flex items-center gap-space-xs"}>
                  <button
                    data-action-text={"Previous"}
                    className={
                      "px-space-sm py-1 rounded-lg bg-surface-container-lowest text-secondary text-body-sm hover:bg-surface-container disabled:opacity-50"
                    }
                    disabled={true}
                    type="button"
                    aria-label={actions.text("Previous")}
                  >
                    {actions.text("Previous")}
                  </button>
                  <button
                    data-action-text={"1"}
                    className={
                      "px-3 py-1 rounded-lg bg-primary text-on-primary text-body-sm font-semibold"
                    }
                    type="button"
                    aria-label={actions.text("1")}
                  >
                    {actions.text("1")}
                  </button>
                  <button
                    data-action-text={"2"}
                    className={
                      "px-3 py-1 rounded-lg bg-surface-container-lowest text-secondary text-body-sm hover:bg-surface-container"
                    }
                    type="button"
                    aria-label={actions.text("2")}
                  >
                    {actions.text("2")}
                  </button>
                  <button
                    data-action-text={"3"}
                    className={
                      "px-3 py-1 rounded-lg bg-surface-container-lowest text-secondary text-body-sm hover:bg-surface-container"
                    }
                    type="button"
                    aria-label={actions.text("3")}
                  >
                    {actions.text("3")}
                  </button>
                  <span className={"text-secondary px-1"}>
                    {actions.text("...")}
                  </span>
                  <button
                    data-action-text={"357"}
                    className={
                      "px-3 py-1 rounded-lg bg-surface-container-lowest text-secondary text-body-sm hover:bg-surface-container"
                    }
                    type="button"
                    aria-label={actions.text("357")}
                  >
                    {actions.text("357")}
                  </button>
                  <button
                    data-action-text={"Next"}
                    className={
                      "px-space-sm py-1 rounded-lg bg-surface-container-lowest text-secondary text-body-sm hover:bg-surface-container"
                    }
                    type="button"
                    aria-label={actions.text("Next")}
                  >
                    {actions.text("Next")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={"px-space-xl mb-space-xl"}>
            <div
              className={
                "p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-primary/20 relative overflow-hidden"
              }
            >
              <div
                className={
                  "absolute top-0 right-0 bg-primary-fixed text-on-primary-fixed text-label-md px-space-md py-1 rounded-bl-xl font-code-sm"
                }
              >
                {actions.text(
                  "\n        Interactive Drawer Preview (usr_982x...ac41)\n      ",
                )}
              </div>
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-space-xl"}>
                <div className={"space-y-space-md"}>
                  <div className={"flex items-center gap-space-sm"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[22px]"}
                      >
                        {"business"}
                      </span>
                    </div>
                    <div>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Acme Corp Labs")}
                      </h3>
                      <span className={"font-code-sm text-outline"}>
                        {actions.text("usr_982x...ac41")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "p-space-md rounded-xl bg-surface-container-low space-y-space-sm"
                    }
                  >
                    <div className={"flex justify-between text-body-md"}>
                      <span className={"text-secondary"}>
                        {actions.text("Subscribed API")}
                      </span>
                      <span className={"font-semibold text-on-surface"}>
                        {actions.text("Neural LLM v4")}
                      </span>
                    </div>
                    <div className={"flex justify-between text-body-md"}>
                      <span className={"text-secondary"}>
                        {actions.text("Plan Tier")}
                      </span>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-sm font-semibold"
                        }
                      >
                        {actions.text("Enterprise")}
                      </span>
                    </div>
                    <div className={"flex justify-between text-body-md"}>
                      <span className={"text-secondary"}>
                        {actions.text("Rate Limit")}
                      </span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("50 req/s")}
                      </span>
                    </div>
                    <div className={"flex justify-between text-body-md"}>
                      <span className={"text-secondary"}>
                        {actions.text("Monthly Quota")}
                      </span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("1,000,000 req")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4
                      className={
                        "text-label-md uppercase font-label-md text-outline mb-space-sm"
                      }
                    >
                      {actions.text("Allowed Management Actions")}
                    </h4>
                    <div className={"grid grid-cols-2 gap-space-xs"}>
                      <button
                        data-action-text={"analytics Usage Logs"}
                        className={
                          "px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-medium hover:bg-surface-container transition-all flex items-center justify-center gap-xs"
                        }
                        type="button"
                        aria-label={actions.text("Usage Logs")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"analytics"}
                        </span>
                        {actions.text(" Usage Logs\n              ")}
                      </button>
                      <button
                        data-action-text={"api View API"}
                        className={
                          "px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-medium hover:bg-surface-container transition-all flex items-center justify-center gap-xs"
                        }
                        type="button"
                        aria-label={actions.text("View API")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"api"}
                        </span>
                        {actions.text(" View API\n              ")}
                      </button>
                      <button
                        data-action-text={"rate_review Review"}
                        className={
                          "px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm font-medium hover:bg-surface-container transition-all flex items-center justify-center gap-xs"
                        }
                        type="button"
                        aria-label={actions.text("Review")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"rate_review"}
                        </span>
                        {actions.text(" Review\n              ")}
                      </button>
                      <button
                        data-action-text={"block Suspend"}
                        className={
                          "px-space-sm py-2 rounded-lg bg-rose-50 text-rose-700 text-body-sm font-medium hover:bg-rose-100 transition-all flex items-center justify-center gap-xs"
                        }
                        type="button"
                        aria-label={actions.text("Suspend")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"block"}
                        </span>
                        {actions.text(" Suspend\n              ")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={"space-y-space-md"}>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Request Performance")}
                  </h4>
                  <div className={"grid grid-cols-2 gap-space-md"}>
                    <div
                      className={
                        "p-space-md rounded-xl bg-surface-container-low"
                      }
                    >
                      <span
                        className={"text-label-md text-secondary block mb-1"}
                      >
                        {actions.text("Avg Latency")}
                      </span>
                      <span
                        className={
                          "text-headline-md font-code-md text-on-surface"
                        }
                      >
                        {actions.text("38ms")}
                      </span>
                      <span
                        className={"text-body-sm text-emerald-600 block mt-1"}
                      >
                        {actions.text("-4ms vs last week")}
                      </span>
                    </div>
                    <div
                      className={
                        "p-space-md rounded-xl bg-surface-container-low"
                      }
                    >
                      <span
                        className={"text-label-md text-secondary block mb-1"}
                      >
                        {actions.text("Error Rate (5xx)")}
                      </span>
                      <span
                        className={
                          "text-headline-md font-code-md text-on-surface"
                        }
                      >
                        {actions.text("0.04%")}
                      </span>
                      <span
                        className={"text-body-sm text-emerald-600 block mt-1"}
                      >
                        {actions.text("Within SLA")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={"p-space-md rounded-xl bg-surface-container-low"}
                  >
                    <div
                      className={
                        "flex justify-between items-center mb-space-xs"
                      }
                    >
                      <span
                        className={
                          "text-label-md font-semibold text-secondary uppercase"
                        }
                      >
                        {actions.text("Quota Consumption")}
                      </span>
                      <span className={"font-code-sm text-primary"}>
                        {actions.text("84% Used")}
                      </span>
                    </div>
                    <div
                      className={
                        "w-full bg-surface-container h-2 rounded-full overflow-hidden mb-space-sm"
                      }
                    >
                      <div
                        className={"bg-primary h-full rounded-full"}
                        style={{ width: "84%" }}
                      ></div>
                    </div>
                    <div
                      className={
                        "flex justify-between text-body-sm text-outline"
                      }
                    >
                      <span>{actions.text("Reset in 12 days")}</span>
                      <span>{actions.text("160k req remaining")}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={"space-y-space-md flex flex-col justify-between"}
                >
                  <div>
                    <h4
                      className={
                        "text-headline-sm font-headline-sm text-on-surface mb-space-md"
                      }
                    >
                      {actions.text("Audit Trail & History")}
                    </h4>
                    <div
                      className={
                        "space-y-space-sm border-l-2 border-surface-container pl-space-md"
                      }
                    >
                      <div className={"relative"}>
                        <div
                          className={
                            "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary"
                          }
                        ></div>
                        <span
                          className={
                            "text-body-sm font-semibold text-on-surface block"
                          }
                        >
                          {actions.text("Plan Upgraded to Enterprise")}
                        </span>
                        <span
                          className={"text-label-md text-outline font-code-sm"}
                        >
                          {actions.text("Oct 12, 2024 • admin_usr_01")}
                        </span>
                      </div>
                      <div className={"relative"}>
                        <div
                          className={
                            "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-outline-variant"
                          }
                        ></div>
                        <span
                          className={
                            "text-body-sm font-semibold text-on-surface block"
                          }
                        >
                          {actions.text("Quota Warning Triggered (80%)")}
                        </span>
                        <span
                          className={"text-label-md text-outline font-code-sm"}
                        >
                          {actions.text("Sep 28, 2024 • System Monitor")}
                        </span>
                      </div>
                      <div className={"relative"}>
                        <div
                          className={
                            "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-outline-variant"
                          }
                        ></div>
                        <span
                          className={
                            "text-body-sm font-semibold text-on-surface block"
                          }
                        >
                          {actions.text("Subscription Created")}
                        </span>
                        <span
                          className={"text-label-md text-outline font-code-sm"}
                        >
                          {actions.text("Oct 12, 2023 • Onboarding API")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={"pt-space-md"}>
                    <button
                      data-action-text={"history View Full Audit Logs"}
                      className={
                        "w-full py-2.5 rounded-lg bg-surface-container text-on-surface text-body-md font-medium hover:bg-surface-container-high transition-all flex items-center justify-center gap-space-xs"
                      }
                      type="button"
                      aria-label={actions.text("View Full Audit Logs")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"history"}
                      </span>
                      {actions.text(
                        "\n              View Full Audit Logs\n            ",
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={"px-space-xl"}>
            <div
              className={
                "p-space-lg rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-space-md"
              }
            >
              <div
                className={
                  "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[22px]"}
                >
                  {"security"}
                </span>
              </div>
              <div>
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Compliance & Platform Security Notice")}
                </h4>
                <p className={"text-body-md text-secondary leading-relaxed"}>
                  {actions.text(
                    "\n          In compliance with API Hub Provider Data Governance policies, full consumer API keys, secret tokens, and raw request/response payloads are never exposed or stored in plaintext. All financial billing figures and revenue metrics displayed are simulated aggregates based on active enterprise tier parameters. For full compliance audit reports, contact your workspace security officer.\n        ",
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
