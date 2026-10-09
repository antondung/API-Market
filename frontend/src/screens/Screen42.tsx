import { useScreenActions } from "../features/screen-actions";
export default function Screen42() {
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
          <div className={"max-w-7xl mx-auto w-full px-6 lg:px-12 py-10"}>
            <div
              className={
                "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-outline-variant/30"
              }
            >
              <div>
                <div
                  className={
                    "flex items-center gap-2 text-body-sm text-on-surface-variant mb-2"
                  }
                >
                  <span>{actions.text("Marketplace")}</span>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px]"}
                  >
                    {"chevron_right"}
                  </span>
                  <span className={"text-primary font-label-md"}>
                    {actions.text("All APIs")}
                  </span>
                </div>
                <h1
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("Explore High-Performance APIs")}
                </h1>
                <p className={"text-body-md text-on-surface-variant mt-1"}>
                  {actions.text(
                    "Discover, test, and integrate enterprise-grade APIs crafted by elite developers.",
                  )}
                </p>
              </div>

              <div className={"relative w-full md:w-96"}>
                <div
                  className={
                    "flex items-center bg-surface-container-low rounded-xl px-4 py-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[20px] mr-3"
                    }
                  >
                    {"search"}
                  </span>
                  <input
                    data-source-placeholder={"Search APIs, endpoints, tags..."}
                    className={
                      "w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                    }
                    id={"api-search"}
                    placeholder={actions.text(
                      "Search APIs, endpoints, tags...",
                    )}
                    type={"text"}
                  />
                  <span
                    className={
                      "text-code-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant"
                    }
                  >
                    {actions.text("⌘K")}
                  </span>
                </div>

                <div
                  id={"search-suggestions"}
                  className={
                    actions.visible("search-suggestions", false)
                      ? "absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-xl p-2 z-50"
                      : "absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-xl p-2 z-50 hidden"
                  }
                >
                  <div
                    className={
                      "px-3 py-1.5 text-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Quick Suggestions")}
                  </div>
                  <a
                    data-action-text={"bolt Neural LLM Inference v4 AI"}
                    className={
                      "flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-md text-on-surface"
                    }
                    href={"#"}
                  >
                    <span className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[16px] text-primary"
                        }
                      >
                        {"bolt"}
                      </span>
                      {actions.text(" Neural LLM Inference v4")}
                    </span>
                    <span className={"text-code-sm text-outline"}>
                      {actions.text("AI")}
                    </span>
                  </a>
                  <a
                    data-action-text={"payments Global FX Settlement Finance"}
                    className={
                      "flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-md text-on-surface"
                    }
                    href={"#"}
                  >
                    <span className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[16px] text-primary"
                        }
                      >
                        {"payments"}
                      </span>
                      {actions.text(" Global FX Settlement")}
                    </span>
                    <span className={"text-code-sm text-outline"}>
                      {actions.text("Finance")}
                    </span>
                  </a>
                  <a
                    data-action-text={"shield Zero-Trust Auth Guard Security"}
                    className={
                      "flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container-low text-body-md text-on-surface"
                    }
                    href={"#"}
                  >
                    <span className={"flex items-center gap-2"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[16px] text-primary"
                        }
                      >
                        {"shield"}
                      </span>
                      {actions.text(" Zero-Trust Auth Guard")}
                    </span>
                    <span className={"text-code-sm text-outline"}>
                      {actions.text("Security")}
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <div className={"flex flex-col lg:flex-row gap-8 items-start"}>
              <aside
                className={
                  "w-full lg:w-[240px] flex-shrink-0 bg-surface-container-low rounded-xl p-6 shadow-sm"
                }
              >
                <div className={"flex items-center justify-between mb-6"}>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface flex items-center gap-2"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"tune"}
                    </span>
                    {actions.text(" Filters\n          ")}
                  </h3>
                  <button
                    data-action-text={"Reset all"}
                    className={
                      "text-body-sm text-primary hover:underline font-label-md"
                    }
                    id={"reset-filters"}
                    type="button"
                    aria-label={actions.text("Reset all")}
                  >
                    {actions.text("Reset all")}
                  </button>
                </div>

                <div className={"mb-6"}>
                  <h4
                    className={
                      "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-3"
                    }
                  >
                    {actions.text("Category")}
                  </h4>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "flex items-center justify-between text-body-md text-on-surface cursor-pointer group"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <input
                          defaultChecked={true}
                          className={"rounded accent-primary w-4 h-4"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        {actions.text(" AI & Machine Learning")}
                      </span>
                      <span className={"text-code-sm text-outline"}>
                        {actions.text("128")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center justify-between text-body-md text-on-surface cursor-pointer group"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <input
                          defaultChecked={true}
                          className={"rounded accent-primary w-4 h-4"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        {actions.text(" Finance & Payments")}
                      </span>
                      <span className={"text-code-sm text-outline"}>
                        {actions.text("84")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center justify-between text-body-md text-on-surface cursor-pointer group"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <input
                          className={"rounded accent-primary w-4 h-4"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        {actions.text(" Real-Time Data")}
                      </span>
                      <span className={"text-code-sm text-outline"}>
                        {actions.text("62")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center justify-between text-body-md text-on-surface cursor-pointer group"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <input
                          className={"rounded accent-primary w-4 h-4"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        {actions.text(" Weather & Spatial")}
                      </span>
                      <span className={"text-code-sm text-outline"}>
                        {actions.text("45")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center justify-between text-body-md text-on-surface cursor-pointer group"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <input
                          className={"rounded accent-primary w-4 h-4"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        {actions.text(" Security & Identity")}
                      </span>
                      <span className={"text-code-sm text-outline"}>
                        {actions.text("39")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center justify-between text-body-md text-on-surface cursor-pointer group"
                      }
                    >
                      <span className={"flex items-center gap-2"}>
                        <input
                          className={"rounded accent-primary w-4 h-4"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        {actions.text(" Developer Tools")}
                      </span>
                      <span className={"text-code-sm text-outline"}>
                        {actions.text("91")}
                      </span>
                    </label>
                  </div>
                </div>

                <div className={"mb-6 pt-6 border-t border-outline-variant/30"}>
                  <h4
                    className={
                      "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-3"
                    }
                  >
                    {actions.text("Pricing Type")}
                  </h4>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "flex items-center gap-2 text-body-md text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        defaultChecked={true}
                        className={"rounded accent-primary w-4 h-4"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      {actions.text(" Free Tier Available\n            ")}
                    </label>
                    <label
                      className={
                        "flex items-center gap-2 text-body-md text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        defaultChecked={true}
                        className={"rounded accent-primary w-4 h-4"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      {actions.text(" Freemium\n            ")}
                    </label>
                    <label
                      className={
                        "flex items-center gap-2 text-body-md text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        className={"rounded accent-primary w-4 h-4"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      {actions.text(" Paid / Enterprise\n            ")}
                    </label>
                  </div>
                </div>

                <div className={"mb-6 pt-6 border-t border-outline-variant/30"}>
                  <h4
                    className={
                      "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-3"
                    }
                  >
                    {actions.text("Authentication")}
                  </h4>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "flex items-center gap-2 text-body-md text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        defaultChecked={true}
                        className={"rounded accent-primary w-4 h-4"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      {actions.text(" Bearer Token\n            ")}
                    </label>
                    <label
                      className={
                        "flex items-center gap-2 text-body-md text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        className={"rounded accent-primary w-4 h-4"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      {actions.text(" OAuth 2.0\n            ")}
                    </label>
                    <label
                      className={
                        "flex items-center gap-2 text-body-md text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        className={"rounded accent-primary w-4 h-4"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      {actions.text(" API Key\n            ")}
                    </label>
                  </div>
                </div>

                <div className={"pt-6 border-t border-outline-variant/30"}>
                  <h4
                    className={
                      "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-3"
                    }
                  >
                    {actions.text("Status")}
                  </h4>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "flex items-center gap-2 text-body-md text-on-surface cursor-pointer"
                      }
                    >
                      <input
                        defaultChecked={true}
                        className={"rounded accent-primary w-4 h-4"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                      {actions.text(" Verified Providers Only\n            ")}
                    </label>
                  </div>
                </div>
              </aside>

              <div className={"flex-1 w-full"}>
                <div
                  className={
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-surface-container-low p-4 rounded-xl shadow-sm"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <span
                      className={
                        "text-body-md text-on-surface font-headline-sm"
                      }
                    >
                      {actions.text("Showing ")}
                      <strong className={"text-primary"}>
                        {actions.text("248")}
                      </strong>
                      {actions.text(" APIs")}
                    </span>
                    <span
                      className={"w-1.5 h-1.5 rounded-full bg-outline"}
                    ></span>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Page 1 of 11")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end"
                    }
                  >
                    <div className={"flex items-center gap-2"}>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Sort by:")}
                      </span>
                      <select
                        className={
                          "bg-surface-container-lowest text-body-md text-on-surface px-3 py-1.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                        }
                        aria-label={actions.text("Input")}
                      >
                        <option value={"Most Popular"}>
                          {actions.text("Most Popular")}
                        </option>
                        <option value={"Highest Rated"}>
                          {actions.text("Highest Rated")}
                        </option>
                        <option value={"Lowest Latency"}>
                          {actions.text("Lowest Latency")}
                        </option>
                        <option value={"Newest Added"}>
                          {actions.text("Newest Added")}
                        </option>
                      </select>
                    </div>

                    <div
                      className={
                        "flex items-center bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/30"
                      }
                    >
                      <button
                        data-action-text={"grid_view"}
                        id={"grid-view-btn"}
                        title={actions.text("Grid View")}
                        type="button"
                        aria-label={actions.text("grid_view")}
                        className={
                          actions.visible("grid-view-btn", true)
                            ? "p-1.5 rounded bg-primary text-on-primary shadow-sm transition-all"
                            : "p-1.5 rounded bg-primary text-on-primary shadow-sm transition-all hidden"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"grid_view"}
                        </span>
                      </button>
                      <button
                        data-action-text={"view_list"}
                        id={"list-view-btn"}
                        title={actions.text("List View")}
                        type="button"
                        aria-label={actions.text("view_list")}
                        className={
                          actions.visible("list-view-btn", true)
                            ? "p-1.5 rounded text-on-surface-variant hover:text-on-surface transition-all"
                            : "p-1.5 rounded text-on-surface-variant hover:text-on-surface transition-all hidden"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"view_list"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={"grid grid-cols-1 md:grid-cols-2 gap-6"}
                  id={"api-container"}
                >
                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                    }
                  >
                    <div>
                      <div className={"flex items-start justify-between mb-4"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[24px]"
                              }
                            >
                              {"neurology"}
                            </span>
                          </div>
                          <div>
                            <div className={"flex items-center gap-2"}>
                              <h3
                                className={
                                  "text-headline-sm font-headline-sm text-on-surface"
                                }
                              >
                                {actions.text("Neural LLM Inference v4")}
                              </h3>
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-primary text-[18px]"
                                }
                                style={{ fontVariationSettings: "'FILL' 1" }}
                                title={actions.text("Verified Provider")}
                              >
                                {"verified"}
                              </span>
                            </div>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("by DeepMatrix AI")}
                            </span>
                          </div>
                        </div>
                        <label
                          className={
                            "flex items-center gap-1.5 text-body-sm text-on-surface-variant cursor-pointer"
                          }
                          title={actions.text("Compare")}
                        >
                          <input
                            className={
                              "rounded accent-primary w-4 h-4 compare-checkbox"
                            }
                            type={"checkbox"}
                            aria-label={actions.text("Input")}
                          />
                          <span className={"text-code-sm"}>
                            {actions.text("Compare")}
                          </span>
                        </label>
                      </div>
                      <p
                        className={
                          "text-body-md text-on-surface-variant mb-4 line-clamp-2"
                        }
                      >
                        {actions.text(
                          "Ultra-fast multimodal transformer inference engine with sub-50ms latency across 40+ global edge locations.",
                        )}
                      </p>
                      <div className={"flex flex-wrap items-center gap-2 mb-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("AI & ML")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Free Tier")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Bearer Token")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={
                        "pt-4 border-t border-outline-variant/30 flex items-center justify-between"
                      }
                    >
                      <div
                        className={
                          "flex items-center gap-2 text-code-sm text-on-surface-variant"
                        }
                      >
                        <span
                          className={"w-2 h-2 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.text(" 99.99% Uptime\n              ")}
                      </div>
                      <a
                        data-action-text={"View API arrow_forward"}
                        className={
                          "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors flex items-center gap-1"
                        }
                        href={"#"}
                      >
                        {actions.text("\n                View API ")}
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
                      "bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                    }
                  >
                    <div>
                      <div className={"flex items-start justify-between mb-4"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[24px]"
                              }
                            >
                              {"payments"}
                            </span>
                          </div>
                          <div>
                            <div className={"flex items-center gap-2"}>
                              <h3
                                className={
                                  "text-headline-sm font-headline-sm text-on-surface"
                                }
                              >
                                {actions.text("Global FX Settlement")}
                              </h3>
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-primary text-[18px]"
                                }
                                style={{ fontVariationSettings: "'FILL' 1" }}
                                title={actions.text("Verified Provider")}
                              >
                                {"verified"}
                              </span>
                            </div>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("by Apex Ledger")}
                            </span>
                          </div>
                        </div>
                        <label
                          className={
                            "flex items-center gap-1.5 text-body-sm text-on-surface-variant cursor-pointer"
                          }
                          title={actions.text("Compare")}
                        >
                          <input
                            className={
                              "rounded accent-primary w-4 h-4 compare-checkbox"
                            }
                            type={"checkbox"}
                            aria-label={actions.text("Input")}
                          />
                          <span className={"text-code-sm"}>
                            {actions.text("Compare")}
                          </span>
                        </label>
                      </div>
                      <p
                        className={
                          "text-body-md text-on-surface-variant mb-4 line-clamp-2"
                        }
                      >
                        {actions.text(
                          "Real-time multi-currency clearing and liquidity routing API with bank-grade cryptographic audit trails.",
                        )}
                      </p>
                      <div className={"flex flex-wrap items-center gap-2 mb-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Finance")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Freemium")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("OAuth 2.0")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={
                        "pt-4 border-t border-outline-variant/30 flex items-center justify-between"
                      }
                    >
                      <div
                        className={
                          "flex items-center gap-2 text-code-sm text-on-surface-variant"
                        }
                      >
                        <span
                          className={"w-2 h-2 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.text(" 100% Uptime\n              ")}
                      </div>
                      <a
                        data-action-text={"View API arrow_forward"}
                        className={
                          "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors flex items-center gap-1"
                        }
                        href={"#"}
                      >
                        {actions.text("\n                View API ")}
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
                      "bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                    }
                  >
                    <div>
                      <div className={"flex items-start justify-between mb-4"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-on-surface group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[24px]"
                              }
                            >
                              {"shield"}
                            </span>
                          </div>
                          <div>
                            <div className={"flex items-center gap-2"}>
                              <h3
                                className={
                                  "text-headline-sm font-headline-sm text-on-surface"
                                }
                              >
                                {actions.text("Zero-Trust Auth Guard")}
                              </h3>
                              <span
                                aria-hidden={true}
                                className={
                                  "material-symbols-outlined text-primary text-[18px]"
                                }
                                style={{ fontVariationSettings: "'FILL' 1" }}
                                title={actions.text("Verified Provider")}
                              >
                                {"verified"}
                              </span>
                            </div>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("by Securify Inc.")}
                            </span>
                          </div>
                        </div>
                        <label
                          className={
                            "flex items-center gap-1.5 text-body-sm text-on-surface-variant cursor-pointer"
                          }
                          title={actions.text("Compare")}
                        >
                          <input
                            className={
                              "rounded accent-primary w-4 h-4 compare-checkbox"
                            }
                            type={"checkbox"}
                            aria-label={actions.text("Input")}
                          />
                          <span className={"text-code-sm"}>
                            {actions.text("Compare")}
                          </span>
                        </label>
                      </div>
                      <p
                        className={
                          "text-body-md text-on-surface-variant mb-4 line-clamp-2"
                        }
                      >
                        {actions.text(
                          "Continuous behavioural biometric verification and automated threat mitigation for microservice architectures.",
                        )}
                      </p>
                      <div className={"flex flex-wrap items-center gap-2 mb-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Security")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Paid")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("API Key")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={
                        "pt-4 border-t border-outline-variant/30 flex items-center justify-between"
                      }
                    >
                      <div
                        className={
                          "flex items-center gap-2 text-code-sm text-on-surface-variant"
                        }
                      >
                        <span
                          className={"w-2 h-2 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.text(" 99.95% Uptime\n              ")}
                      </div>
                      <a
                        data-action-text={"View API arrow_forward"}
                        className={
                          "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors flex items-center gap-1"
                        }
                        href={"#"}
                      >
                        {actions.text("\n                View API ")}
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
                      "bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                    }
                  >
                    <div>
                      <div className={"flex items-start justify-between mb-4"}>
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[24px]"
                              }
                            >
                              {"cloud_sync"}
                            </span>
                          </div>
                          <div>
                            <div className={"flex items-center gap-2"}>
                              <h3
                                className={
                                  "text-headline-sm font-headline-sm text-on-surface"
                                }
                              >
                                {actions.text("HyperStream Weather API")}
                              </h3>
                              <span
                                className={
                                  "text-body-sm text-on-surface-variant"
                                }
                              >
                                {actions.text("by AtmosGrid")}
                              </span>
                            </div>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            ></span>
                          </div>
                        </div>
                        <label
                          className={
                            "flex items-center gap-1.5 text-body-sm text-on-surface-variant cursor-pointer"
                          }
                          title={actions.text("Compare")}
                        >
                          <input
                            className={
                              "rounded accent-primary w-4 h-4 compare-checkbox"
                            }
                            type={"checkbox"}
                            aria-label={actions.text("Input")}
                          />
                          <span className={"text-code-sm"}>
                            {actions.text("Compare")}
                          </span>
                        </label>
                      </div>
                      <p
                        className={
                          "text-body-md text-on-surface-variant mb-4 line-clamp-2"
                        }
                      >
                        {actions.text(
                          "Hyper-local meteorological telemetry with predictive storm tracking and solar flare impact indices.",
                        )}
                      </p>
                      <div className={"flex flex-wrap items-center gap-2 mb-6"}>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Weather")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("Free Tier")}
                        </span>
                        <span
                          className={
                            "px-2.5 py-1 rounded bg-surface-container text-on-surface text-code-sm font-code-sm"
                          }
                        >
                          {actions.text("API Key")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={
                        "pt-4 border-t border-outline-variant/30 flex items-center justify-between"
                      }
                    >
                      <div
                        className={
                          "flex items-center gap-2 text-code-sm text-on-surface-variant"
                        }
                      >
                        <span
                          className={"w-2 h-2 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.text(" 99.90% Uptime\n              ")}
                      </div>
                      <a
                        data-action-text={"View API arrow_forward"}
                        className={
                          "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors flex items-center gap-1"
                        }
                        href={"#"}
                      >
                        {actions.text("\n                View API ")}
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"arrow_forward"}
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "flex items-center justify-between mt-10 pt-6 border-t border-outline-variant/30"
                  }
                >
                  <button
                    data-action-text={"arrow_back Previous"}
                    className={
                      "px-4 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors text-body-md font-label-md flex items-center gap-1"
                    }
                    type="button"
                    aria-label={actions.text("Previous")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"arrow_back"}
                    </span>
                    {actions.text(" Previous\n          ")}
                  </button>
                  <div className={"hidden md:flex items-center gap-2"}>
                    <button
                      data-action-text={"1"}
                      className={
                        "w-10 h-10 rounded-lg bg-primary text-on-primary text-body-md font-label-md flex items-center justify-center"
                      }
                      type="button"
                      aria-label={actions.text("1")}
                    >
                      {actions.text("1")}
                    </button>
                    <button
                      data-action-text={"2"}
                      className={
                        "w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface text-body-md font-label-md flex items-center justify-center"
                      }
                      type="button"
                      aria-label={actions.text("2")}
                    >
                      {actions.text("2")}
                    </button>
                    <button
                      data-action-text={"3"}
                      className={
                        "w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface text-body-md font-label-md flex items-center justify-center"
                      }
                      type="button"
                      aria-label={actions.text("3")}
                    >
                      {actions.text("3")}
                    </button>
                    <span className={"text-on-surface-variant px-1"}>
                      {actions.text("...")}
                    </span>
                    <button
                      data-action-text={"11"}
                      className={
                        "w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface text-body-md font-label-md flex items-center justify-center"
                      }
                      type="button"
                      aria-label={actions.text("11")}
                    >
                      {actions.text("11")}
                    </button>
                  </div>
                  <button
                    data-action-text={"Next arrow_forward"}
                    className={
                      "px-4 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors text-body-md font-label-md flex items-center gap-1"
                    }
                    type="button"
                    aria-label={actions.text("Next")}
                  >
                    {actions.text("\n            Next ")}
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"arrow_forward"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            id={"compare-tray"}
            className={
              actions.visible("compare-tray", false)
                ? "fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-40 transition-all"
                : "fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-40 transition-all hidden"
            }
          >
            <div className={"flex items-center gap-3"}>
              <span
                className={
                  "w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-code-sm font-bold"
                }
                id={"compare-count"}
              >
                {actions.text("0")}
              </span>
              <span className={"text-body-md font-label-md"}>
                {actions.text("APIs Selected for Comparison")}
              </span>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"Compare Side-by-Side"}
                className={
                  "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors"
                }
                id={"compare-action-btn"}
                type="button"
                aria-label={actions.text("Compare Side-by-Side")}
              >
                {actions.text("Compare Side-by-Side")}
              </button>
              <button
                data-action-text={"Clear"}
                className={
                  "text-body-sm text-inverse-on-surface/70 hover:text-inverse-on-surface"
                }
                id={"clear-compare-btn"}
                type="button"
                aria-label={actions.text("Clear")}
              >
                {actions.text("Clear")}
              </button>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
