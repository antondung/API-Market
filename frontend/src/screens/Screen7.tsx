import { useScreenActions } from "../features/screen-actions";
export default function Screen7() {
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
          <div className={"grid grid-cols-4 gap-6 mb-8"}>
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div>
                <p
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("Total Pending Reviews")}
                </p>
                <h3
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("24")}
                </h3>
                <span
                  className={
                    "text-body-sm text-primary font-medium flex items-center mt-2"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text(" +4 from yesterday\n        ")}
                </span>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {"rate_review"}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div>
                <p
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("Approved Today")}
                </p>
                <h3
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("12")}
                </h3>
                <span
                  className={
                    "text-body-sm text-emerald-600 font-medium flex items-center mt-2"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"check_circle"}
                  </span>
                  {actions.text(" 98% SLA met\n        ")}
                </span>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {"verified"}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div>
                <p
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("Rejection Rate")}
                </p>
                <h3
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("4.2%")}
                </h3>
                <span
                  className={
                    "text-body-sm text-on-surface-variant font-medium flex items-center mt-2"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"remove"}
                  </span>
                  {actions.text(" Stable vs last week\n        ")}
                </span>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {"block"}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center justify-between"
              }
            >
              <div>
                <p
                  className={
                    "text-body-sm text-on-surface-variant font-medium uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("High-Risk Flags")}
                </p>
                <h3 className={"text-headline-lg font-headline-lg text-error"}>
                  {actions.text("3")}
                </h3>
                <span
                  className={
                    "text-body-sm text-error font-medium flex items-center mt-2"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px] mr-1"}
                  >
                    {"warning"}
                  </span>
                  {actions.text(" Requires manual audit\n        ")}
                </span>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {"security"}
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-high p-4 rounded-xl mb-8 flex items-center justify-between shadow-sm"
            }
          >
            <div className={"flex items-center space-x-3"}>
              <div
                className={
                  "w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"gpp_maybe"}
                </span>
              </div>
              <div>
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Marketplace Gate Active")}
                </h4>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "APIs remain hidden from public index until explicit admin approval is finalized and compliance checks clear.",
                  )}
                </p>
              </div>
            </div>
            <div className={"flex items-center space-x-2"}>
              <span
                className={
                  "px-3 py-1 bg-primary text-on-primary text-label-md rounded-full font-medium"
                }
              >
                {actions.text("Strict Mode")}
              </span>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl shadow-sm mb-8 overflow-hidden"
            }
          >
            <div
              className={
                "p-6 flex flex-wrap items-center justify-between gap-4"
              }
            >
              <div
                className={
                  "flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0"
                }
              >
                <button
                  data-action-text={"All (42)"}
                  className={
                    "px-4 py-2 rounded-xl bg-primary text-on-primary text-body-md font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("All (42)")}
                >
                  {actions.text("All (42)")}
                </button>
                <button
                  data-action-text={"Pending (24)"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-md font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Pending (24)")}
                >
                  {actions.text("Pending (24)")}
                </button>
                <button
                  data-action-text={"Under Review (8)"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-md font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Under Review (8)")}
                >
                  {actions.text("Under Review (8)")}
                </button>
                <button
                  data-action-text={"Changes Requested (4)"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-md font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Changes Requested (4)")}
                >
                  {actions.text("Changes Requested (4)")}
                </button>
                <button
                  data-action-text={"Approved (6)"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-md font-medium transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Approved (6)")}
                >
                  {actions.text("Approved (6)")}
                </button>
              </div>
              <div className={"flex items-center space-x-3"}>
                <div className={"relative"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]"
                    }
                  >
                    {"search"}
                  </span>
                  <input
                    data-source-placeholder={"Search API name or provider..."}
                    className={
                      "bg-surface-container-low pl-10 pr-4 py-2 rounded-xl text-body-md text-on-surface outline-none w-64 focus:ring-1 focus:ring-primary"
                    }
                    placeholder={actions.text("Search API name or provider...")}
                    type={"text"}
                    aria-label={actions.text("Search API name or provider...")}
                  />
                </div>
                <button
                  data-action-text={"filter_list"}
                  className={
                    "p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center"
                  }
                  type="button"
                  aria-label={actions.text("filter_list")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[20px]"}
                  >
                    {"filter_list"}
                  </span>
                </button>
              </div>
            </div>

            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider"
                    }
                  >
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("API Name")}
                    </th>
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("Provider")}
                    </th>
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("Category")}
                    </th>
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("Version")}
                    </th>
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("Submitted Date")}
                    </th>
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("Compliance")}
                    </th>
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("Review Status")}
                    </th>
                    <th className={"py-4 px-6 font-medium text-right"}>
                      {actions.text("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className={"divide-y divide-surface-container"}>
                  <tr
                    data-action-text={
                      "SP Stellaris Pay v2.1.0 Fintech Corp verified Financial v2.1.0 2 mins ago Verified Pending Review Inspect"
                    }
                    className={
                      "bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer"
                    }
                    data-handler={"toggleDrawer(true)"}
                    role="button"
                    tabIndex={0}
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "SP Stellaris Pay v2.1.0 Fintech Corp verified Financial v2.1.0 2 mins ago Verified Pending Review Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-3"}>
                        <div
                          className={
                            "w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-body-sm"
                          }
                        >
                          {actions.text("SP")}
                        </div>
                        <div>
                          <span
                            className={
                              "font-medium text-on-surface block text-body-md"
                            }
                          >
                            {actions.text("Stellaris Pay")}
                          </span>
                          <span
                            className={
                              "text-body-sm text-on-surface-variant font-code-sm"
                            }
                          >
                            {actions.text("v2.1.0")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-2"}>
                        <span className={"text-on-surface text-body-md"}>
                          {actions.text("Fintech Corp")}
                        </span>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[16px] text-primary"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title={actions.text("Verified Provider")}
                        >
                          {"verified"}
                        </span>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-label-md"
                        }
                      >
                        {actions.text("Financial")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-md text-on-surface font-code-sm"
                      }
                    >
                      {actions.text("v2.1.0")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2 mins ago")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-medium"
                        }
                      >
                        <span
                          className={
                            "w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"
                          }
                        ></span>
                        {actions.text(" Verified\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-label-md font-medium"
                        }
                      >
                        {actions.text(
                          "\n                Pending Review\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 bg-primary text-on-primary rounded-xl text-body-sm font-medium hover:bg-primary/90 transition-all"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low transition-colors cursor-pointer"
                    }
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "NX NeuralX AI Engine v4.0.2 Cortex Labs verified Machine Learning v4.0.2 1 hour ago Flagged Under Review Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-3"}>
                        <div
                          className={
                            "w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center font-bold text-body-sm"
                          }
                        >
                          {actions.text("NX")}
                        </div>
                        <div>
                          <span
                            className={
                              "font-medium text-on-surface block text-body-md"
                            }
                          >
                            {actions.text("NeuralX AI Engine")}
                          </span>
                          <span
                            className={
                              "text-body-sm text-on-surface-variant font-code-sm"
                            }
                          >
                            {actions.text("v4.0.2")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-2"}>
                        <span className={"text-on-surface text-body-md"}>
                          {actions.text("Cortex Labs")}
                        </span>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[16px] text-primary"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"verified"}
                        </span>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-label-md"
                        }
                      >
                        {actions.text("Machine Learning")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-md text-on-surface font-code-sm"
                      }
                    >
                      {actions.text("v4.0.2")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("1 hour ago")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-label-md font-medium"
                        }
                      >
                        <span
                          className={
                            "w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"
                          }
                        ></span>
                        {actions.text(" Flagged\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-label-md font-medium"
                        }
                      >
                        {actions.recordText(
                          "row-1",
                          "\n                Under Review\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 bg-surface-container text-on-surface rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low transition-colors cursor-pointer"
                    }
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "HL Helix Logistics API v1.5.0 Global Transit verified Supply Chain v1.5.0 3 hours ago Incomplete Changes Requested Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-3"}>
                        <div
                          className={
                            "w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center font-bold text-body-sm"
                          }
                        >
                          {actions.text("HL")}
                        </div>
                        <div>
                          <span
                            className={
                              "font-medium text-on-surface block text-body-md"
                            }
                          >
                            {actions.text("Helix Logistics API")}
                          </span>
                          <span
                            className={
                              "text-body-sm text-on-surface-variant font-code-sm"
                            }
                          >
                            {actions.text("v1.5.0")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-2"}>
                        <span className={"text-on-surface text-body-md"}>
                          {actions.text("Global Transit")}
                        </span>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[16px] text-outline"
                          }
                        >
                          {"verified"}
                        </span>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-label-md"
                        }
                      >
                        {actions.text("Supply Chain")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-md text-on-surface font-code-sm"
                      }
                    >
                      {actions.text("v1.5.0")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("3 hours ago")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-label-md font-medium"
                        }
                      >
                        <span
                          className={
                            "w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"
                          }
                        ></span>
                        {actions.text(" Incomplete\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-label-md font-medium"
                        }
                      >
                        {actions.text(
                          "\n                Changes Requested\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 bg-surface-container text-on-surface rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low transition-colors cursor-pointer"
                    }
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "CD CloudFlare DNS Sync v3.0.1 NetOps Inc verified Infrastructure v3.0.1 Yesterday Verified Approved Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-3"}>
                        <div
                          className={
                            "w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center font-bold text-body-sm"
                          }
                        >
                          {actions.text("CD")}
                        </div>
                        <div>
                          <span
                            className={
                              "font-medium text-on-surface block text-body-md"
                            }
                          >
                            {actions.text("CloudFlare DNS Sync")}
                          </span>
                          <span
                            className={
                              "text-body-sm text-on-surface-variant font-code-sm"
                            }
                          >
                            {actions.text("v3.0.1")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <div className={"flex items-center space-x-2"}>
                        <span className={"text-on-surface text-body-md"}>
                          {actions.text("NetOps Inc")}
                        </span>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[16px] text-primary"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"verified"}
                        </span>
                      </div>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-label-md"
                        }
                      >
                        {actions.text("Infrastructure")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-md text-on-surface font-code-sm"
                      }
                    >
                      {actions.text("v3.0.1")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("Yesterday")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-medium"
                        }
                      >
                        <span
                          className={
                            "w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"
                          }
                        ></span>
                        {actions.text(" Verified\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-medium"
                        }
                      >
                        {actions.recordText(
                          "row-3",
                          "\n                Approved\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 bg-surface-container text-on-surface rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className={
                "p-6 border-t border-surface-container flex items-center justify-between"
              }
            >
              <span className={"text-body-sm text-on-surface-variant"}>
                {actions.text("Showing 1 to 4 of 42 entries")}
              </span>
              <div className={"flex items-center space-x-2"}>
                <button
                  data-action-text={"Previous"}
                  className={
                    "px-3 py-1.5 bg-surface-container text-on-surface rounded-xl text-body-sm font-medium disabled:opacity-50"
                  }
                  type="button"
                  aria-label={actions.text("Previous")}
                >
                  {actions.text("Previous")}
                </button>
                <button
                  data-action-text={"1"}
                  className={
                    "px-3 py-1.5 bg-primary text-on-primary rounded-xl text-body-sm font-medium"
                  }
                  type="button"
                  aria-label={actions.text("1")}
                >
                  {actions.text("1")}
                </button>
                <button
                  data-action-text={"2"}
                  className={
                    "px-3 py-1.5 bg-surface-container text-on-surface rounded-xl text-body-sm font-medium"
                  }
                  type="button"
                  aria-label={actions.text("2")}
                >
                  {actions.text("2")}
                </button>
                <button
                  data-action-text={"3"}
                  className={
                    "px-3 py-1.5 bg-surface-container text-on-surface rounded-xl text-body-sm font-medium"
                  }
                  type="button"
                  aria-label={actions.text("3")}
                >
                  {actions.text("3")}
                </button>
                <button
                  data-action-text={"Next"}
                  className={
                    "px-3 py-1.5 bg-surface-container text-on-surface rounded-xl text-body-sm font-medium"
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
            id={"inspector-drawer"}
            className={
              actions.visible("inspector-drawer", true)
                ? "fixed inset-y-0 right-0 w-[640px] bg-surface-container-lowest shadow-2xl z-50 transform transition-transform duration-300 flex flex-col"
                : "fixed inset-y-0 right-0 w-[640px] bg-surface-container-lowest shadow-2xl z-50 transform transition-transform duration-300 flex flex-col hidden"
            }
          >
            <div
              className={
                "p-6 border-b border-surface-container flex items-center justify-between bg-surface-container-low"
              }
            >
              <div className={"flex items-center space-x-3"}>
                <div
                  className={
                    "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-body-lg"
                  }
                >
                  {actions.text("SP")}
                </div>
                <div>
                  <div className={"flex items-center space-x-2"}>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Stellaris Pay v2")}
                    </h3>
                    <span
                      className={
                        "px-2 py-0.5 rounded bg-surface-container text-on-surface text-code-sm"
                      }
                    >
                      {actions.text("v2.1.0")}
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Submitted by Fintech Corp • Enterprise Tier",
                    )}
                  </p>
                </div>
              </div>
              <button
                data-action-text={"close"}
                className={
                  "p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface"
                }
                type="button"
                aria-label={actions.text("Close")}
                data-handler={"toggleDrawer(false)"}
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
              <div className={"grid grid-cols-3 gap-4"}>
                <div className={"p-4 bg-surface-container-low rounded-xl"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant block mb-1"
                    }
                  >
                    {actions.text("Base URL")}
                  </span>
                  <span
                    className={
                      "text-code-sm text-on-surface font-code-sm truncate block"
                    }
                  >
                    {actions.text("https://api.stellarispay.com/v2")}
                  </span>
                </div>
                <div className={"p-4 bg-surface-container-low rounded-xl"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant block mb-1"
                    }
                  >
                    {actions.text("Endpoints Count")}
                  </span>
                  <span
                    className={"text-body-md font-medium text-on-surface block"}
                  >
                    {actions.text("14 Routes")}
                  </span>
                </div>
                <div className={"p-4 bg-surface-container-low rounded-xl"}>
                  <span
                    className={
                      "text-body-sm text-on-surface-variant block mb-1"
                    }
                  >
                    {actions.text("Data Classification")}
                  </span>
                  <span
                    className={"text-body-md font-medium text-primary block"}
                  >
                    {actions.text("PCI-DSS Level 1")}
                  </span>
                </div>
              </div>

              <div>
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("API Overview")}
                </h4>
                <p
                  className={
                    "text-body-md text-on-surface-variant leading-relaxed"
                  }
                >
                  {actions.text(
                    "\n          High-throughput global payment processing gateway supporting multi-currency routing, automated KYC verification webhooks, and institutional ledger sync. Designed for enterprise merchants requiring sub-50ms authorization latencies.\n        ",
                  )}
                </p>
              </div>

              <div
                className={"bg-surface-container-low p-5 rounded-xl space-y-4"}
              >
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface flex items-center justify-between"
                  }
                >
                  <span>{actions.text("Compliance & Verification")}</span>
                  <span
                    className={
                      "text-body-sm text-emerald-600 font-medium flex items-center"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px] mr-1"}
                    >
                      {"verified"}
                    </span>
                    {actions.text(" 4/4 Passed\n          ")}
                  </span>
                </h4>
                <div className={"space-y-3"}>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg"
                    }
                  >
                    <div className={"flex items-center space-x-3"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-emerald-600"}
                      >
                        {"check_circle"}
                      </span>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Ownership Declaration")}
                      </span>
                    </div>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Verified via DNS TXT")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg"
                    }
                  >
                    <div className={"flex items-center space-x-3"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-emerald-600"}
                      >
                        {"check_circle"}
                      </span>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Data Classification")}
                      </span>
                    </div>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Encrypted at rest")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg"
                    }
                  >
                    <div className={"flex items-center space-x-3"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-emerald-600"}
                      >
                        {"check_circle"}
                      </span>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Domain Verification")}
                      </span>
                    </div>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("stellarispay.com")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg"
                    }
                  >
                    <div className={"flex items-center space-x-3"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-emerald-600"}
                      >
                        {"check_circle"}
                      </span>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Provider Agreement")}
                      </span>
                    </div>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Signed v4.2 SLA")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className={"flex items-center justify-between mb-3"}>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("OpenAPI Spec Preview")}
                  </h4>
                  <div
                    className={
                      "flex space-x-2 bg-surface-container p-1 rounded-xl"
                    }
                  >
                    <button
                      data-action-text={"Endpoints"}
                      className={
                        "px-3 py-1 bg-surface-container-lowest text-on-surface text-label-md rounded-lg font-medium shadow-sm"
                      }
                      type="button"
                      aria-label={actions.text("Endpoints")}
                    >
                      {actions.text("Endpoints")}
                    </button>
                    <button
                      data-action-text={"JSON Schema"}
                      className={
                        "px-3 py-1 text-on-surface-variant text-label-md rounded-lg font-medium"
                      }
                      type="button"
                      aria-label={actions.text("JSON Schema")}
                    >
                      {actions.text("JSON Schema")}
                    </button>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-low p-4 rounded-xl font-code-sm text-on-surface-variant space-y-2"
                  }
                >
                  <div className={"flex items-center space-x-2"}>
                    <span
                      className={
                        "px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]"
                      }
                    >
                      {actions.text("POST")}
                    </span>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("/v2/charges/authorize")}
                    </span>
                  </div>
                  <div className={"flex items-center space-x-2"}>
                    <span
                      className={
                        "px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]"
                      }
                    >
                      {actions.text("GET")}
                    </span>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("/v2/ledger/transactions")}
                    </span>
                  </div>
                  <div className={"flex items-center space-x-2"}>
                    <span
                      className={
                        "px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]"
                      }
                    >
                      {actions.text("PUT")}
                    </span>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("/v2/merchants/settings")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-3"
                  }
                >
                  {actions.text("Audit Trail History")}
                </h4>
                <div
                  className={
                    "space-y-3 border-l-2 border-surface-container pl-4 ml-2"
                  }
                >
                  <div className={"relative"}>
                    <span
                      className={
                        "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary"
                      }
                    ></span>
                    <p className={"text-body-md text-on-surface font-medium"}>
                      {actions.text("Submitted for review by alex@fintech.com")}
                    </p>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Today at 10:42 AM")}
                    </span>
                  </div>
                  <div className={"relative"}>
                    <span
                      className={
                        "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-outline-variant"
                      }
                    ></span>
                    <p className={"text-body-md text-on-surface font-medium"}>
                      {actions.text(
                        "Automated compliance scan passed successfully",
                      )}
                    </p>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Today at 10:43 AM")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                "p-6 border-t border-surface-container bg-surface-container-low flex items-center justify-between"
              }
            >
              <div className={"flex items-center space-x-2"}>
                <button
                  data-action-text={"Request Correction"}
                  className={
                    "px-4 py-2 bg-surface-container text-on-surface rounded-xl text-body-md font-medium hover:bg-surface-container-high transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Request Correction")}
                >
                  {actions.text("Request Correction")}
                </button>
                <button
                  data-action-text={"Reject"}
                  className={
                    "px-4 py-2 bg-error-container text-on-error-container rounded-xl text-body-md font-medium hover:bg-error-container/80 transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Reject")}
                >
                  {actions.text("Reject")}
                </button>
              </div>
              <button
                data-action-text={"Approve Publication"}
                className={
                  "px-6 py-2 bg-primary text-on-primary rounded-xl text-body-md font-medium hover:bg-primary/90 transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Approve Publication")}
                data-handler={"toggleDrawer(false)"}
              >
                {actions.text("\n        Approve Publication\n      ")}
              </button>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
