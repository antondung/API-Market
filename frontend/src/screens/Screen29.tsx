import { useScreenActions } from "../features/screen-actions";
export default function Screen29() {
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
              "flex flex-col md:flex-row items-start md:items-center justify-between pb-8 gap-4 border-b border-outline-variant/30"
            }
          >
            <div>
              <div className={"flex items-center gap-3"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[32px]"
                  }
                >
                  {"payments"}
                </span>
                <h1
                  className={
                    "font-headline-lg text-headline-lg text-on-surface"
                  }
                >
                  {actions.text("Pricing Plan Management")}
                </h1>
              </div>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Configure monetization tiers, rate limits, and quota allocations for your published APIs.",
                )}
              </p>
            </div>
            <button
              data-action-text={"add Create New Pricing Plan"}
              className={
                "flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md text-body-md shadow-sm hover:opacity-95 transition-all"
              }
              type="button"
              aria-label={actions.text("Create New Pricing Plan")}
              data-handler={"openCreatePlanModal()"}
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px]"}
              >
                {"add"}
              </span>
              <span>{actions.text("Create New Pricing Plan")}</span>
            </button>
          </div>

          <div
            className={
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8"
            }
          >
            <div
              className={
                "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Active Plans")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"layers"}
                </span>
              </div>
              <div className={"mt-4 flex items-baseline justify-between"}>
                <span
                  className={
                    "text-headline-md text-on-surface font-headline-md"
                  }
                >
                  {actions.text("6")}
                </span>
                <span
                  className={
                    "text-body-sm text-on-primary-fixed-variant bg-primary-fixed px-2 py-0.5 rounded-full font-medium"
                  }
                >
                  {actions.text("Live on Store")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Total Subscribers")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"group"}
                </span>
              </div>
              <div className={"mt-4 flex items-baseline justify-between"}>
                <span
                  className={
                    "text-headline-md text-on-surface font-headline-md"
                  }
                >
                  {actions.text("1,428")}
                </span>
                <span
                  className={
                    "text-body-sm text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium"
                  }
                >
                  {actions.text("+12.4% this mo")}
                </span>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Simulated Monthly Rev")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"monitoring"}
                </span>
              </div>
              <div className={"mt-4 flex items-baseline justify-between"}>
                <span
                  className={
                    "text-headline-md text-on-surface font-headline-md"
                  }
                >
                  {actions.text("$24,850")}
                </span>
                <span
                  className={
                    "text-code-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded"
                  }
                >
                  {actions.text("Sandbox Only")}
                </span>
              </div>
              <div
                className={
                  "text-[10px] text-on-surface-variant/80 mt-2 flex items-center gap-1"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[12px]"}
                >
                  {"info"}
                </span>
                {actions.text(
                  "\n        Simulated earnings (no real money transfers)\n      ",
                )}
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col justify-between"
              }
            >
              <div
                className={
                  "flex items-center justify-between text-on-surface-variant"
                }
              >
                <span className={"text-label-md uppercase tracking-wider"}>
                  {actions.text("Average ARPU")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"trending_up"}
                </span>
              </div>
              <div className={"mt-4 flex items-baseline justify-between"}>
                <span
                  className={
                    "text-headline-md text-on-surface font-headline-md"
                  }
                >
                  {actions.text("$17.40")}
                </span>
                <span className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("Per active dev")}
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-secondary-fixed/40 rounded-xl p-4 mb-8 flex items-start gap-3 border border-secondary-fixed-dim"
            }
          >
            <span
              aria-hidden={true}
              className={
                "material-symbols-outlined text-on-secondary-fixed-variant text-[22px] shrink-0 mt-0.5"
              }
            >
              {"warning"}
            </span>
            <div className={"text-body-sm text-on-secondary-fixed"}>
              <span className={"font-medium"}>
                {actions.text("Sandbox Environment Active:")}
              </span>
              {actions.text(
                " All pricing plans, quotas, and tier configurations operate in a simulated billing environment. Real payment integrations are bypassed. Modifying active plans instantly updates consumer preview states.\n    ",
              )}
            </div>
          </div>

          <div className={"flex flex-col lg:flex-row items-stretch gap-8"}>
            <div className={"flex-1 flex flex-col gap-6"}>
              <div
                className={
                  "flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low p-4 rounded-xl"
                }
              >
                <div className={"flex items-center gap-3 w-full sm:w-auto"}>
                  <div className={"relative flex-1 sm:w-72"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]"
                      }
                    >
                      {"search"}
                    </span>
                    <input
                      data-source-placeholder={"Search pricing plans..."}
                      className={
                        "w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-9 pr-4 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
                      }
                      placeholder={actions.text("Search pricing plans...")}
                      type={"text"}
                      aria-label={actions.text("Search pricing plans...")}
                    />
                  </div>
                  <select
                    className={
                      "bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface outline-none cursor-pointer"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"All Tiers"}>
                      {actions.text("All Tiers")}
                    </option>
                    <option value={"Free Sandbox"}>
                      {actions.text("Free Sandbox")}
                    </option>
                    <option value={"Usage-Based"}>
                      {actions.text("Usage-Based")}
                    </option>
                    <option value={"Flat Tier"}>
                      {actions.text("Flat Tier")}
                    </option>
                    <option value={"Enterprise"}>
                      {actions.text("Enterprise")}
                    </option>
                  </select>
                </div>
                <div
                  className={
                    "flex items-center gap-2 w-full sm:w-auto justify-end"
                  }
                >
                  <button
                    data-action-text={"visibility Consumer Storefront Preview"}
                    id={"previewToggleBtn"}
                    type="button"
                    aria-label={actions.text("Consumer Storefront Preview")}
                    data-handler={"toggleStorefrontPreview()"}
                    className={
                      actions.visible("previewToggleBtn", true)
                        ? "flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all"
                        : "flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all hidden"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"visibility"}
                    </span>
                    <span
                      id={"previewToggleText"}
                      className={
                        actions.visible("previewToggleText", true)
                          ? ""
                          : " hidden"
                      }
                    >
                      {actions.text("Consumer Storefront Preview")}
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-low rounded-xl shadow-sm overflow-hidden"
                }
              >
                <div className={"overflow-x-auto"}>
                  <table className={"w-full text-left border-collapse"}>
                    <thead>
                      <tr
                        className={
                          "bg-surface-container border-b border-outline-variant/30 text-on-surface-variant text-label-md uppercase tracking-wider"
                        }
                      >
                        <th className={"py-3 px-4 font-medium"}>
                          {actions.text("Plan Name")}
                        </th>
                        <th className={"py-3 px-4 font-medium"}>
                          {actions.text("Type")}
                        </th>
                        <th className={"py-3 px-4 font-medium"}>
                          {actions.text("Illustrative Price")}
                        </th>
                        <th className={"py-3 px-4 font-medium"}>
                          {actions.text("Quota & Period")}
                        </th>
                        <th className={"py-3 px-4 font-medium"}>
                          {actions.text("Rate Limit")}
                        </th>
                        <th className={"py-3 px-4 font-medium"}>
                          {actions.text("Subscribers")}
                        </th>
                        <th className={"py-3 px-4 font-medium"}>
                          {actions.text("Status")}
                        </th>
                        <th className={"py-3 px-4 text-right font-medium"}>
                          {actions.text("Actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={
                        "divide-y divide-outline-variant/20 text-body-sm text-on-surface"
                      }
                    >
                      <tr
                        data-action-text={
                          "Hobby Dev v1-sandbox Free Sandbox $0 / mo 10,000 req / mo 5 req/sec 842 Active edit group block"
                        }
                        className={
                          "hover:bg-surface-container/50 transition-colors cursor-pointer"
                        }
                        data-handler={"selectPlan('Hobby Dev')"}
                        role="button"
                        tabIndex={0}
                        data-record="row-0"
                        hidden={
                          !actions.matches(
                            "Hobby Dev v1-sandbox Free Sandbox $0 / mo 10,000 req / mo 5 req/sec 842 Active edit group block",
                          )
                        }
                      >
                        <td className={"py-4 px-4"}>
                          <div className={"font-medium text-on-surface"}>
                            {actions.text("Hobby Dev")}
                          </div>
                          <div
                            className={
                              "text-[11px] text-on-surface-variant font-code-md"
                            }
                          >
                            {actions.text("v1-sandbox")}
                          </div>
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center px-2 py-0.5 rounded text-label-md bg-secondary-container text-on-secondary-container"
                            }
                          >
                            {actions.text("Free Sandbox")}
                          </span>
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("$0 / mo")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("10,000 req / mo")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("5 req/sec")}
                        </td>
                        <td className={"py-4 px-4 font-medium"}>
                          {actions.text("842")}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-label-md"
                            }
                          >
                            <span
                              className={
                                "w-1.5 h-1.5 rounded-full bg-emerald-600"
                              }
                            ></span>
                            {actions.recordText(
                              "row-0",
                              " Active\n                  ",
                            )}
                          </span>
                        </td>
                        <td className={"py-4 px-4 text-right"}>
                          <div
                            data-action-text={"edit group block"}
                            className={"flex items-center justify-end gap-1"}
                            data-handler={"event.stopPropagation()"}
                            role="button"
                            tabIndex={0}
                          >
                            <button
                              data-action-text={"edit"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface"
                              }
                              title={actions.text("Edit Plan")}
                              type="button"
                              aria-label={actions.text("edit")}
                              data-handler={"selectPlan('Hobby Dev')"}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"edit"}
                              </span>
                            </button>
                            <button
                              data-action-text={"group"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface"
                              }
                              title={actions.text("View Subscribers")}
                              type="button"
                              aria-label={actions.text("group")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"group"}
                              </span>
                            </button>
                            <button
                              data-action-text={"block"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error"
                              }
                              title={actions.text("Deactivate")}
                              type="button"
                              aria-label={actions.text("block")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"block"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr
                        data-action-text={
                          "Growth Scale v2-usage Usage-Based $49 / mo + $0.001/req 500,000 req / mo 50 req/sec 456 Active edit group block"
                        }
                        className={
                          "hover:bg-surface-container/50 transition-colors bg-surface-container/20 cursor-pointer"
                        }
                        data-handler={"selectPlan('Growth Scale')"}
                        role="button"
                        tabIndex={0}
                        data-record="row-1"
                        hidden={
                          !actions.matches(
                            "Growth Scale v2-usage Usage-Based $49 / mo + $0.001/req 500,000 req / mo 50 req/sec 456 Active edit group block",
                          )
                        }
                      >
                        <td className={"py-4 px-4"}>
                          <div className={"font-medium text-on-surface"}>
                            {actions.text("Growth Scale")}
                          </div>
                          <div
                            className={
                              "text-[11px] text-on-surface-variant font-code-md"
                            }
                          >
                            {actions.text("v2-usage")}
                          </div>
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center px-2 py-0.5 rounded text-label-md bg-primary-fixed text-on-primary-fixed-variant"
                            }
                          >
                            {actions.text("Usage-Based")}
                          </span>
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("$49 / mo + $0.001/req")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("500,000 req / mo")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("50 req/sec")}
                        </td>
                        <td className={"py-4 px-4 font-medium"}>
                          {actions.text("456")}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-label-md"
                            }
                          >
                            <span
                              className={
                                "w-1.5 h-1.5 rounded-full bg-emerald-600"
                              }
                            ></span>
                            {actions.recordText(
                              "row-1",
                              " Active\n                  ",
                            )}
                          </span>
                        </td>
                        <td className={"py-4 px-4 text-right"}>
                          <div
                            data-action-text={"edit group block"}
                            className={"flex items-center justify-end gap-1"}
                            data-handler={"event.stopPropagation()"}
                            role="button"
                            tabIndex={0}
                          >
                            <button
                              data-action-text={"edit"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface"
                              }
                              title={actions.text("Edit Plan")}
                              type="button"
                              aria-label={actions.text("edit")}
                              data-handler={"selectPlan('Growth Scale')"}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"edit"}
                              </span>
                            </button>
                            <button
                              data-action-text={"group"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface"
                              }
                              title={actions.text("View Subscribers")}
                              type="button"
                              aria-label={actions.text("group")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"group"}
                              </span>
                            </button>
                            <button
                              data-action-text={"block"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error"
                              }
                              title={actions.text("Deactivate")}
                              type="button"
                              aria-label={actions.text("block")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"block"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr
                        data-action-text={
                          "Enterprise Ultra v1-custom Custom Enterprise $499 / mo Unlimited / Fair Use 500 req/sec 130 Active edit group block"
                        }
                        className={
                          "hover:bg-surface-container/50 transition-colors cursor-pointer"
                        }
                        data-handler={"selectPlan('Enterprise Ultra')"}
                        role="button"
                        tabIndex={0}
                        data-record="row-2"
                        hidden={
                          !actions.matches(
                            "Enterprise Ultra v1-custom Custom Enterprise $499 / mo Unlimited / Fair Use 500 req/sec 130 Active edit group block",
                          )
                        }
                      >
                        <td className={"py-4 px-4"}>
                          <div className={"font-medium text-on-surface"}>
                            {actions.text("Enterprise Ultra")}
                          </div>
                          <div
                            className={
                              "text-[11px] text-on-surface-variant font-code-md"
                            }
                          >
                            {actions.text("v1-custom")}
                          </div>
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center px-2 py-0.5 rounded text-label-md bg-tertiary-fixed text-on-tertiary-fixed"
                            }
                          >
                            {actions.text("Custom Enterprise")}
                          </span>
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("$499 / mo")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("Unlimited / Fair Use")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("500 req/sec")}
                        </td>
                        <td className={"py-4 px-4 font-medium"}>
                          {actions.text("130")}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-label-md"
                            }
                          >
                            <span
                              className={
                                "w-1.5 h-1.5 rounded-full bg-emerald-600"
                              }
                            ></span>
                            {actions.recordText(
                              "row-2",
                              " Active\n                  ",
                            )}
                          </span>
                        </td>
                        <td className={"py-4 px-4 text-right"}>
                          <div
                            data-action-text={"edit group block"}
                            className={"flex items-center justify-end gap-1"}
                            data-handler={"event.stopPropagation()"}
                            role="button"
                            tabIndex={0}
                          >
                            <button
                              data-action-text={"edit"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface"
                              }
                              title={actions.text("Edit Plan")}
                              type="button"
                              aria-label={actions.text("edit")}
                              data-handler={"selectPlan('Enterprise Ultra')"}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"edit"}
                              </span>
                            </button>
                            <button
                              data-action-text={"group"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface"
                              }
                              title={actions.text("View Subscribers")}
                              type="button"
                              aria-label={actions.text("group")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"group"}
                              </span>
                            </button>
                            <button
                              data-action-text={"block"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error"
                              }
                              title={actions.text("Deactivate")}
                              type="button"
                              aria-label={actions.text("block")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"block"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      <tr
                        className={
                          "hover:bg-surface-container/50 transition-colors opacity-60 cursor-pointer"
                        }
                        data-record="row-3"
                        hidden={
                          !actions.matches(
                            "Legacy v1 Basic v1-deprecated Flat Tier $19 / mo 50,000 req / mo 10 req/sec 0 Archived group delete",
                          )
                        }
                      >
                        <td className={"py-4 px-4"}>
                          <div className={"font-medium text-on-surface"}>
                            {actions.text("Legacy v1 Basic")}
                          </div>
                          <div
                            className={
                              "text-[11px] text-on-surface-variant font-code-md"
                            }
                          >
                            {actions.text("v1-deprecated")}
                          </div>
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center px-2 py-0.5 rounded text-label-md bg-surface-variant text-on-surface-variant"
                            }
                          >
                            {actions.text("Flat Tier")}
                          </span>
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("$19 / mo")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("50,000 req / mo")}
                        </td>
                        <td className={"py-4 px-4 font-code-md"}>
                          {actions.text("10 req/sec")}
                        </td>
                        <td className={"py-4 px-4 font-medium"}>
                          {actions.text("0")}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span
                            className={
                              "inline-flex items-center gap-1 text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full text-label-md"
                            }
                          >
                            <span
                              className={"w-1.5 h-1.5 rounded-full bg-outline"}
                            ></span>
                            {actions.text(" Archived\n                  ")}
                          </span>
                        </td>
                        <td className={"py-4 px-4 text-right"}>
                          <div
                            className={"flex items-center justify-end gap-1"}
                          >
                            <button
                              data-action-text={"group"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface"
                              }
                              title={actions.text("View Subscribers")}
                              type="button"
                              aria-label={actions.text("group")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"group"}
                              </span>
                            </button>
                            <button
                              data-action-text={"delete"}
                              className={
                                "p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error"
                              }
                              title={actions.text("Delete")}
                              type="button"
                              aria-label={actions.text("Delete")}
                            >
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-[18px]"
                                }
                              >
                                {"delete"}
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
                    "p-4 bg-surface-container/30 border-t border-outline-variant/20 flex items-center justify-between text-body-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Showing 4 of 4 pricing plans")}</span>
                  <div className={"flex items-center gap-2"}>
                    <button
                      data-action-text={"Previous"}
                      className={
                        "px-3 py-1 rounded border border-outline-variant opacity-50 cursor-not-allowed"
                      }
                      disabled={true}
                      type="button"
                      aria-label={actions.text("Previous")}
                    >
                      {actions.text("Previous")}
                    </button>
                    <button
                      data-action-text={"Next"}
                      className={
                        "px-3 py-1 rounded border border-outline-variant opacity-50 cursor-not-allowed"
                      }
                      disabled={true}
                      type="button"
                      aria-label={actions.text("Next")}
                    >
                      {actions.text("Next")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                "w-full lg:w-[420px] bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col gap-6"
              }
              id={"planEditorContainer"}
            >
              <div
                className={
                  "flex items-center justify-between pb-4 border-b border-outline-variant/30"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md text-primary uppercase font-medium"
                    }
                  >
                    {actions.text("Configuration Console")}
                  </span>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mt-0.5"
                    }
                    id={"editorTitle"}
                  >
                    {actions.text("Edit: Growth Scale")}
                  </h3>
                </div>
                <span
                  data-action-text={"close"}
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant cursor-pointer text-[20px]"
                  }
                  data-handler={"resetEditor()"}
                  role="button"
                  tabIndex={0}
                >
                  {"close"}
                </span>
              </div>

              <div
                className={
                  "bg-error-container text-on-error-container p-3.5 rounded-xl text-body-sm flex items-start gap-2.5"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[18px] shrink-0 mt-0.5"
                  }
                >
                  {"error"}
                </span>
                <div className={"leading-relaxed"}>
                  <span className={"font-medium"}>
                    {actions.text("Warning:")}
                  </span>
                  {actions.text(
                    " Changes to quota or pricing affect active subscribers. Billing is simulated for preview.\n        ",
                  )}
                </div>
              </div>

              <div className={"flex flex-col gap-4"}>
                <div>
                  <label
                    className={
                      "block text-label-md font-medium text-on-surface mb-1.5"
                    }
                  >
                    {actions.text("Plan Name")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    id={"inputPlanName"}
                    type={"text"}
                    defaultValue={"Growth Scale"}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md font-medium text-on-surface mb-1.5"
                    }
                  >
                    {actions.text("Plan Description")}
                  </label>
                  <textarea
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    rows={2}
                    aria-label={actions.text("Input")}
                    defaultValue={
                      "Ideal for scaling production applications with generous usage thresholds and standard SLAs."
                    }
                  ></textarea>
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md font-medium text-on-surface mb-1.5"
                    }
                  >
                    {actions.text("Tier Type")}
                  </label>
                  <select
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"Usage-Based (Base + Overages)"}>
                      {actions.text("Usage-Based (Base + Overages)")}
                    </option>
                    <option value={"Free Sandbox"}>
                      {actions.text("Free Sandbox")}
                    </option>
                    <option value={"Flat Tier (Monthly)"}>
                      {actions.text("Flat Tier (Monthly)")}
                    </option>
                    <option value={"Custom Enterprise"}>
                      {actions.text("Custom Enterprise")}
                    </option>
                  </select>
                </div>
                <div className={"grid grid-cols-2 gap-3"}>
                  <div>
                    <label
                      className={
                        "block text-label-md font-medium text-on-surface mb-1.5"
                      }
                    >
                      {actions.text("Base Price ($/mo)")}
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md font-code-md text-on-surface focus:outline-none focus:border-primary"
                      }
                      type={"text"}
                      defaultValue={"49.00"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div>
                    <label
                      className={
                        "block text-label-md font-medium text-on-surface mb-1.5"
                      }
                    >
                      {actions.text("Overage Rate ($/req)")}
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md font-code-md text-on-surface focus:outline-none focus:border-primary"
                      }
                      type={"text"}
                      defaultValue={"0.001"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                </div>
                <div className={"grid grid-cols-2 gap-3"}>
                  <div>
                    <label
                      className={
                        "block text-label-md font-medium text-on-surface mb-1.5"
                      }
                    >
                      {actions.text("Request Quota")}
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md font-code-md text-on-surface focus:outline-none focus:border-primary"
                      }
                      type={"text"}
                      defaultValue={"500000"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div>
                    <label
                      className={
                        "block text-label-md font-medium text-on-surface mb-1.5"
                      }
                    >
                      {actions.text("Billing Period")}
                    </label>
                    <select
                      className={
                        "w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                      }
                      aria-label={actions.text("Input")}
                    >
                      <option value={"Monthly"}>
                        {actions.text("Monthly")}
                      </option>
                      <option value={"Annual (-20%)"}>
                        {actions.text("Annual (-20%)")}
                      </option>
                      <option value={"Pay-as-you-go"}>
                        {actions.text("Pay-as-you-go")}
                      </option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md font-medium text-on-surface mb-1.5"
                    }
                  >
                    {actions.text("Rate Limit Configuration")}
                  </label>
                  <div className={"flex items-center gap-2"}>
                    <input
                      className={
                        "w-24 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md font-code-md text-on-surface focus:outline-none focus:border-primary"
                      }
                      type={"number"}
                      defaultValue={"50"}
                      aria-label={actions.text("Input")}
                    />
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("requests per")}
                    </span>
                    <select
                      className={
                        "flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                      }
                      aria-label={actions.text("Input")}
                    >
                      <option value={"Second"}>{actions.text("Second")}</option>
                      <option value={"Minute"}>{actions.text("Minute")}</option>
                      <option value={"Hour"}>{actions.text("Hour")}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md font-medium text-on-surface mb-1.5"
                    }
                  >
                    {actions.text("Feature Limits & SLA Guarantees")}
                  </label>
                  <div
                    className={
                      "space-y-2 bg-surface-container/40 p-3 rounded-xl border border-outline-variant/20"
                    }
                  >
                    <label
                      className={
                        "flex items-center gap-2 text-body-sm text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        defaultChecked={true}
                        className={
                          "rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                        }
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      <span>{actions.text("99.95% Uptime SLA Guarantee")}</span>
                    </label>
                    <label
                      className={
                        "flex items-center gap-2 text-body-sm text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        defaultChecked={true}
                        className={
                          "rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                        }
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      <span>
                        {actions.text(
                          "Priority Developer Support (24h response)",
                        )}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center gap-2 text-body-sm text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        className={
                          "rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                        }
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      <span>
                        {actions.text("Dedicated VPC / IP Whitelisting")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div
                className={
                  "flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-auto"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-4 py-2 rounded-xl text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"resetEditor()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Save Changes"}
                  className={
                    "px-5 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-medium hover:opacity-95 shadow-sm transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Save Changes")}
                  data-handler={"savePlanChanges()"}
                >
                  {actions.text("Save Changes")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"storefrontPreviewSection"}
            className={
              actions.visible("storefrontPreviewSection", false)
                ? "mt-12 bg-surface-container-low rounded-2xl p-8 shadow-sm border border-outline-variant/40"
                : "mt-12 bg-surface-container-low rounded-2xl p-8 shadow-sm border border-outline-variant/40 hidden"
            }
          >
            <div
              className={
                "flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30"
              }
            >
              <div>
                <span
                  className={
                    "text-label-md uppercase tracking-wider text-primary font-medium"
                  }
                >
                  {actions.text("Marketplace Render View")}
                </span>
                <h2
                  className={
                    "text-headline-md text-on-surface font-headline-md mt-1"
                  }
                >
                  {actions.text("Public Consumer Pricing Preview")}
                </h2>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "This is exactly how API consumers view your published tiers on the public API Hub catalog.",
                  )}
                </p>
              </div>
              <button
                data-action-text={"arrow_back Return to Management Console"}
                className={
                  "flex items-center gap-1.5 text-body-sm text-primary font-medium hover:underline"
                }
                type="button"
                aria-label={actions.text("Return to Management Console")}
                data-handler={"toggleStorefrontPreview()"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"arrow_back"}
                </span>
                <span>{actions.text("Return to Management Console")}</span>
              </button>
            </div>

            <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Hobby Dev")}
                    </span>
                    <span
                      className={
                        "text-label-md bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full"
                      }
                    >
                      {actions.text("Free")}
                    </span>
                  </div>
                  <div
                    className={
                      "text-headline-lg font-headline-lg text-on-surface mb-2"
                    }
                  >
                    {actions.text("$0 ")}
                    <span
                      className={
                        "text-body-sm text-on-surface-variant font-normal"
                      }
                    >
                      {actions.text("/ month")}
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant mb-6"}>
                    {actions.text(
                      "Perfect for testing integrations and prototyping small applications.",
                    )}
                  </p>
                  <ul className={"space-y-3 mb-8 text-body-sm text-on-surface"}>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("10,000 requests / month")}</span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("5 requests / second limit")}</span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("Community support forum")}</span>
                    </li>
                  </ul>
                </div>
                <button
                  data-action-text={"Subscribe (Sandbox)"}
                  className={
                    "w-full bg-surface-container-high text-on-surface py-2.5 rounded-xl font-medium text-body-sm hover:bg-surface-variant transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Subscribe (Sandbox)")}
                >
                  {actions.text("Subscribe (Sandbox)")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-xl border-2 border-primary flex flex-col justify-between relative"
                }
              >
                <div
                  className={
                    "absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[11px] uppercase tracking-wider px-3 py-0.5 rounded-full font-medium"
                  }
                >
                  {actions.text("Most Popular")}
                </div>
                <div>
                  <div
                    className={"flex items-center justify-between mb-4 mt-2"}
                  >
                    <span
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Growth Scale")}
                    </span>
                    <span
                      className={
                        "text-label-md bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-1 rounded-full"
                      }
                    >
                      {actions.text("Usage-Based")}
                    </span>
                  </div>
                  <div
                    className={
                      "text-headline-lg font-headline-lg text-on-surface mb-2"
                    }
                  >
                    {actions.text("$49 ")}
                    <span
                      className={
                        "text-body-sm text-on-surface-variant font-normal"
                      }
                    >
                      {actions.text("/ month + overages")}
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant mb-6"}>
                    {actions.text(
                      "Ideal for scaling production applications with generous usage thresholds.",
                    )}
                  </p>
                  <ul className={"space-y-3 mb-8 text-body-sm text-on-surface"}>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("500,000 requests included")}</span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("50 requests / second limit")}</span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("99.95% Uptime SLA Guarantee")}</span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("Priority Developer Support")}</span>
                    </li>
                  </ul>
                </div>
                <button
                  data-action-text={"Subscribe (Sandbox)"}
                  className={
                    "w-full bg-primary text-on-primary py-2.5 rounded-xl font-medium text-body-sm hover:opacity-95 shadow-sm transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Subscribe (Sandbox)")}
                >
                  {actions.text("Subscribe (Sandbox)")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Enterprise Ultra")}
                    </span>
                    <span
                      className={
                        "text-label-md bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-1 rounded-full"
                      }
                    >
                      {actions.text("Custom")}
                    </span>
                  </div>
                  <div
                    className={
                      "text-headline-lg font-headline-lg text-on-surface mb-2"
                    }
                  >
                    {actions.text("$499 ")}
                    <span
                      className={
                        "text-body-sm text-on-surface-variant font-normal"
                      }
                    >
                      {actions.text("/ month")}
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant mb-6"}>
                    {actions.text(
                      "Uncompromising scale, highest rate limits, and dedicated infrastructure.",
                    )}
                  </p>
                  <ul className={"space-y-3 mb-8 text-body-sm text-on-surface"}>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("Unlimited / Fair Use quota")}</span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>{actions.text("500 requests / second limit")}</span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>
                        {actions.text("Dedicated VPC & IP Whitelisting")}
                      </span>
                    </li>
                    <li className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span>
                        {actions.text("24/7 Dedicated Account Manager")}
                      </span>
                    </li>
                  </ul>
                </div>
                <button
                  data-action-text={"Contact Sales (Sandbox)"}
                  className={
                    "w-full bg-surface-container-high text-on-surface py-2.5 rounded-xl font-medium text-body-sm hover:bg-surface-variant transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Contact Sales (Sandbox)")}
                >
                  {actions.text("Contact Sales (Sandbox)")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"createPlanModal"}
            className={
              actions.visible("createPlanModal", false)
                ? "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center"
                : "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg shadow-xl border border-outline-variant/30 m-4"
              }
            >
              <div
                className={
                  "flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/30"
                }
              >
                <h3
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Create New Pricing Plan")}
                </h3>
                <span
                  data-action-text={"close"}
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant cursor-pointer text-[20px]"
                  }
                  data-handler={"closeCreatePlanModal()"}
                  role="button"
                  tabIndex={0}
                >
                  {"close"}
                </span>
              </div>
              <div className={"space-y-4"}>
                <div>
                  <label
                    className={
                      "block text-label-md font-medium text-on-surface mb-1"
                    }
                  >
                    {actions.text("New Plan Name")}
                  </label>
                  <input
                    data-source-placeholder={"e.g. Startup Booster"}
                    className={
                      "w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    placeholder={actions.text("e.g. Startup Booster")}
                    type={"text"}
                    aria-label={actions.text("e.g. Startup Booster")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md font-medium text-on-surface mb-1"
                    }
                  >
                    {actions.text("Tier Structure")}
                  </label>
                  <select
                    className={
                      "w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"Usage-Based (Base + Overages)"}>
                      {actions.text("Usage-Based (Base + Overages)")}
                    </option>
                    <option value={"Free Sandbox Tier"}>
                      {actions.text("Free Sandbox Tier")}
                    </option>
                    <option value={"Flat Monthly Tier"}>
                      {actions.text("Flat Monthly Tier")}
                    </option>
                    <option value={"Custom Enterprise Tier"}>
                      {actions.text("Custom Enterprise Tier")}
                    </option>
                  </select>
                </div>
                <div className={"grid grid-cols-2 gap-3"}>
                  <div>
                    <label
                      className={
                        "block text-label-md font-medium text-on-surface mb-1"
                      }
                    >
                      {actions.text("Monthly Price ($)")}
                    </label>
                    <input
                      data-source-placeholder={"29.00"}
                      className={
                        "w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2 text-body-md font-code-md text-on-surface focus:outline-none focus:border-primary"
                      }
                      placeholder={actions.text("29.00")}
                      type={"text"}
                      aria-label={actions.text("29.00")}
                    />
                  </div>
                  <div>
                    <label
                      className={
                        "block text-label-md font-medium text-on-surface mb-1"
                      }
                    >
                      {actions.text("Request Quota")}
                    </label>
                    <input
                      data-source-placeholder={"100000"}
                      className={
                        "w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2 text-body-md font-code-md text-on-surface focus:outline-none focus:border-primary"
                      }
                      placeholder={actions.text("100000")}
                      type={"text"}
                      aria-label={actions.text("100000")}
                    />
                  </div>
                </div>
                <div
                  className={
                    "bg-primary-fixed/30 p-3.5 rounded-xl text-body-sm text-on-primary-fixed-variant flex items-start gap-2"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[18px] shrink-0 mt-0.5"
                    }
                  >
                    {"info"}
                  </span>
                  <span>
                    {actions.text(
                      "Newly created plans start in Draft status. You can publish them to the API Hub marketplace anytime.",
                    )}
                  </span>
                </div>
              </div>
              <div
                className={
                  "flex items-center justify-end gap-3 mt-6 pt-3 border-t border-outline-variant/30"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-4 py-2 rounded-xl text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeCreatePlanModal()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Create Plan as Draft"}
                  className={
                    "px-5 py-2 bg-primary text-on-primary rounded-xl text-body-sm font-medium hover:opacity-95 shadow-sm transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Create Plan as Draft")}
                  data-handler={"closeCreatePlanModal()"}
                >
                  {actions.text("Create Plan as Draft")}
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
