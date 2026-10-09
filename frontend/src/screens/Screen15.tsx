import { useScreenActions } from "../features/screen-actions";
export default function Screen15() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full pb-24"}>
          <div
            className={
              "px-space-xl pt-space-xl pb-space-lg flex flex-col gap-space-lg"
            }
          >
            <div
              className={
                "flex flex-col md:flex-row md:items-center justify-between gap-space-md"
              }
            >
              <div>
                <h1 className={"font-headline-lg text-on-surface"}>
                  {actions.text("Endpoint Management")}
                </h1>
                <p className={"font-body-md text-outline mt-space-xs"}>
                  {actions.text(
                    "Configure routing rules, JSON schemas, authentication guards, and auto-generated documentation for v2.4.",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-space-md"}>
                <button
                  data-action-text={"add Add Endpoint"}
                  className={
                    "bg-primary hover:bg-primary-container text-on-primary font-headline-sm px-space-lg py-space-md rounded-xl flex items-center gap-space-sm shadow-md transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Add Endpoint")}
                  data-handler={
                    "document.getElementById('add-endpoint-modal').classList.remove('hidden')"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[20px]"}
                  >
                    {"add"}
                  </span>
                  {actions.text("\n          Add Endpoint\n        ")}
                </button>
              </div>
            </div>

            <div
              className={
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg"
              }
            >
              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <span
                    className={
                      "font-label-md text-outline uppercase tracking-wider"
                    }
                  >
                    {actions.text("Total Endpoints")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"api"}
                  </span>
                </div>
                <div className={"mt-space-md flex items-baseline gap-space-sm"}>
                  <span className={"font-headline-lg text-on-surface"}>
                    {actions.text("148")}
                  </span>
                  <span
                    className={"font-body-sm text-emerald-600 font-semibold"}
                  >
                    {actions.text("+12 this week")}
                  </span>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <span
                    className={
                      "font-label-md text-outline uppercase tracking-wider"
                    }
                  >
                    {actions.text("Validation Health")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-amber-600 text-[20px]"
                    }
                  >
                    {"warning"}
                  </span>
                </div>
                <div className={"mt-space-md flex items-baseline gap-space-sm"}>
                  <span className={"font-headline-lg text-on-surface"}>
                    {actions.text("98.2%")}
                  </span>
                  <span className={"font-body-sm text-amber-600 font-semibold"}>
                    {actions.text("3 warnings")}
                  </span>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <span
                    className={
                      "font-label-md text-outline uppercase tracking-wider"
                    }
                  >
                    {actions.text("Avg Latency")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px]"
                    }
                  >
                    {"speed"}
                  </span>
                </div>
                <div className={"mt-space-md flex items-baseline gap-space-sm"}>
                  <span className={"font-headline-lg text-on-surface"}>
                    {actions.text("42ms")}
                  </span>
                  <span
                    className={"font-body-sm text-emerald-600 font-semibold"}
                  >
                    {actions.text("-4ms optimized")}
                  </span>
                </div>
              </div>
              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <span
                    className={
                      "font-label-md text-outline uppercase tracking-wider"
                    }
                  >
                    {actions.text("Active Version")}
                  </span>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-secondary text-[20px]"
                    }
                  >
                    {"alt_route"}
                  </span>
                </div>
                <div className={"mt-space-md flex items-baseline gap-space-sm"}>
                  <span className={"font-headline-lg text-on-surface"}>
                    {actions.text("v2.4.0")}
                  </span>
                  <span className={"font-body-sm text-outline"}>
                    {actions.text("Production")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "px-space-xl pb-space-md flex flex-wrap items-center justify-between gap-space-md"
            }
          >
            <div className={"flex flex-wrap items-center gap-space-md flex-1"}>
              <div className={"relative flex-1 min-w-[280px]"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]"
                  }
                >
                  {"search"}
                </span>
                <input
                  data-source-placeholder={"Filter by route path or summary..."}
                  className={
                    "w-full bg-surface-container-lowest pl-10 pr-space-md py-2 rounded-xl text-body-md text-on-surface placeholder:text-outline shadow-sm outline-none focus:ring-1 focus:ring-primary"
                  }
                  id={"endpoint-search"}
                  placeholder={actions.text(
                    "Filter by route path or summary...",
                  )}
                  type={"text"}
                />
              </div>

              <div
                className={
                  "flex items-center gap-space-xs bg-surface-container-lowest p-1 rounded-xl shadow-sm"
                }
              >
                <button
                  data-action-text={"ALL"}
                  className={
                    "px-space-md py-1 rounded-lg text-body-sm font-semibold bg-primary text-on-primary transition-all method-btn"
                  }
                  data-method={"ALL"}
                  type="button"
                  aria-label={actions.text("ALL")}
                  data-handler={"filterMethod('ALL')"}
                >
                  {actions.text("ALL")}
                </button>
                <button
                  data-action-text={"GET"}
                  className={
                    "px-space-md py-1 rounded-lg text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all method-btn"
                  }
                  data-method={"GET"}
                  type="button"
                  aria-label={actions.text("GET")}
                  data-handler={"filterMethod('GET')"}
                >
                  {actions.text("GET")}
                </button>
                <button
                  data-action-text={"POST"}
                  className={
                    "px-space-md py-1 rounded-lg text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all method-btn"
                  }
                  data-method={"POST"}
                  type="button"
                  aria-label={actions.text("POST")}
                  data-handler={"filterMethod('POST')"}
                >
                  {actions.text("POST")}
                </button>
                <button
                  data-action-text={"PUT"}
                  className={
                    "px-space-md py-1 rounded-lg text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all method-btn"
                  }
                  data-method={"PUT"}
                  type="button"
                  aria-label={actions.text("PUT")}
                  data-handler={"filterMethod('PUT')"}
                >
                  {actions.text("PUT")}
                </button>
                <button
                  data-action-text={"DELETE"}
                  className={
                    "px-space-md py-1 rounded-lg text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all method-btn"
                  }
                  data-method={"DELETE"}
                  type="button"
                  aria-label={actions.text("DELETE")}
                  data-handler={"filterMethod('DELETE')"}
                >
                  {actions.text("DELETE")}
                </button>
              </div>
            </div>

            <div className={"flex items-center gap-space-md"}>
              <select
                className={
                  "bg-surface-container-lowest px-space-md py-2 rounded-xl text-body-md text-on-surface shadow-sm outline-none font-semibold cursor-pointer"
                }
                aria-label={actions.text("Input")}
              >
                <option value={"Version: v2.4.0 (Latest)"}>
                  {actions.text("Version: v2.4.0 (Latest)")}
                </option>
                <option value={"Version: v2.3.1 (LTS)"}>
                  {actions.text("Version: v2.3.1 (LTS)")}
                </option>
                <option value={"Version: v1.9.4 (Legacy)"}>
                  {actions.text("Version: v1.9.4 (Legacy)")}
                </option>
              </select>
            </div>
          </div>

          <div className={"px-space-xl"}>
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
                        "bg-surface-container-low text-outline font-label-md uppercase tracking-wider"
                      }
                    >
                      <th className={"py-space-md px-space-lg"}>
                        {actions.text("HTTP Method")}
                      </th>
                      <th className={"py-space-md px-space-lg"}>
                        {actions.text("Path")}
                      </th>
                      <th className={"py-space-md px-space-lg"}>
                        {actions.text("Summary")}
                      </th>
                      <th className={"py-space-md px-space-lg"}>
                        {actions.text("Version")}
                      </th>
                      <th className={"py-space-md px-space-lg"}>
                        {actions.text("Auth Type")}
                      </th>
                      <th className={"py-space-md px-space-lg"}>
                        {actions.text("Status")}
                      </th>
                      <th className={"py-space-md px-space-lg text-right"}>
                        {actions.text("Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    id={"endpoint-table-body"}
                    className={
                      actions.visible("endpoint-table-body", true)
                        ? "divide-y divide-surface-container font-body-md text-on-surface"
                        : "divide-y divide-surface-container font-body-md text-on-surface hidden"
                    }
                  >
                    <tr
                      className={
                        "hover:bg-surface-container-low transition-colors group"
                      }
                      data-record="row-0"
                      hidden={
                        !actions.matches(
                          "GET /api/v2/users/{id} Retrieve user profile details by UUID v2.4.0 OAuth2 Bearer Valid edit visibility rate_review",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-space-sm py-0.5 rounded text-code-sm font-code-md font-semibold bg-emerald-100 text-emerald-800"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg font-code-md text-code-md text-primary font-semibold"
                        }
                      >
                        {actions.text("/api/v2/users/{id}")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("Retrieve user profile details by UUID")}
                      </td>
                      <td className={"py-space-md px-space-lg text-outline"}>
                        {actions.text("v2.4.0")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-surface-container text-on-surface-variant font-semibold"
                          }
                        >
                          {actions.text("OAuth2 Bearer")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div
                          className={
                            "flex items-center gap-space-xs text-emerald-600"
                          }
                        >
                          <span
                            className={"w-2 h-2 rounded-full bg-emerald-500"}
                          ></span>
                          <span className={"font-label-md font-semibold"}>
                            {actions.text("Valid")}
                          </span>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-sm"
                          }
                        >
                          <button
                            data-action-text={"edit"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Edit Endpoint")}
                            type="button"
                            aria-label={actions.text("edit")}
                            data-handler={
                              "openEditor('/api/v2/users/{id}', 'GET')"
                            }
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
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Preview Docs")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openPreview('/api/v2/users/{id}', 'GET')"
                            }
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
                            data-action-text={"rate_review"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-amber-600 hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Submit for Review")}
                            type="button"
                            aria-label={actions.text("rate_review")}
                            data-handler={"triggerReview('/api/v2/users/{id}')"}
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"rate_review"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low transition-colors group"
                      }
                      data-record="row-1"
                      hidden={
                        !actions.matches(
                          "POST /api/v2/transactions/charge Execute idempotent payment gateway charge v2.4.0 API Key + HMAC Review Needed edit visibility rate_review",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-space-sm py-0.5 rounded text-code-sm font-code-md font-semibold bg-indigo-100 text-indigo-800"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg font-code-md text-code-md text-primary font-semibold"
                        }
                      >
                        {actions.text("/api/v2/transactions/charge")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text(
                          "Execute idempotent payment gateway charge",
                        )}
                      </td>
                      <td className={"py-space-md px-space-lg text-outline"}>
                        {actions.text("v2.4.0")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-surface-container text-on-surface-variant font-semibold"
                          }
                        >
                          {actions.text("API Key + HMAC")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div
                          className={
                            "flex items-center gap-space-xs text-amber-600"
                          }
                          title={actions.text(
                            "Breaking change warning detected in payload schema",
                          )}
                        >
                          <span
                            className={
                              "w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                            }
                          ></span>
                          <span className={"font-label-md font-semibold"}>
                            {actions.text("Review Needed")}
                          </span>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-sm"
                          }
                        >
                          <button
                            data-action-text={"edit"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Edit Endpoint")}
                            type="button"
                            aria-label={actions.text("edit")}
                            data-handler={
                              "openEditor('/api/v2/transactions/charge', 'POST')"
                            }
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
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Preview Docs")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openPreview('/api/v2/transactions/charge', 'POST')"
                            }
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
                            data-action-text={"rate_review"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-amber-600 hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Submit for Review")}
                            type="button"
                            aria-label={actions.text("rate_review")}
                            data-handler={
                              "triggerReview('/api/v2/transactions/charge')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"rate_review"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low transition-colors group"
                      }
                      data-record="row-2"
                      hidden={
                        !actions.matches(
                          "PUT /api/v2/settings/tenant Update multi-tenant isolated configuration v2.4.0 OAuth2 Bearer Valid edit visibility rate_review",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-space-sm py-0.5 rounded text-code-sm font-code-md font-semibold bg-amber-100 text-amber-800"
                          }
                        >
                          {actions.text("PUT")}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg font-code-md text-code-md text-primary font-semibold"
                        }
                      >
                        {actions.text("/api/v2/settings/tenant")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text(
                          "Update multi-tenant isolated configuration",
                        )}
                      </td>
                      <td className={"py-space-md px-space-lg text-outline"}>
                        {actions.text("v2.4.0")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-surface-container text-on-surface-variant font-semibold"
                          }
                        >
                          {actions.text("OAuth2 Bearer")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div
                          className={
                            "flex items-center gap-space-xs text-emerald-600"
                          }
                        >
                          <span
                            className={"w-2 h-2 rounded-full bg-emerald-500"}
                          ></span>
                          <span className={"font-label-md font-semibold"}>
                            {actions.text("Valid")}
                          </span>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-sm"
                          }
                        >
                          <button
                            data-action-text={"edit"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Edit Endpoint")}
                            type="button"
                            aria-label={actions.text("edit")}
                            data-handler={
                              "openEditor('/api/v2/settings/tenant', 'PUT')"
                            }
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
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Preview Docs")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openPreview('/api/v2/settings/tenant', 'PUT')"
                            }
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
                            data-action-text={"rate_review"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-amber-600 hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Submit for Review")}
                            type="button"
                            aria-label={actions.text("rate_review")}
                            data-handler={
                              "triggerReview('/api/v2/settings/tenant')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"rate_review"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "hover:bg-surface-container-low transition-colors group"
                      }
                      data-record="row-3"
                      hidden={
                        !actions.matches(
                          "DELETE /api/v2/webhooks/{id} Purge registered webhook subscription endpoint v2.3.1 JWT Signature Conflict Error edit visibility rate_review",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-space-sm py-0.5 rounded text-code-sm font-code-md font-semibold bg-rose-100 text-rose-800"
                          }
                        >
                          {actions.text("DELETE")}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg font-code-md text-code-md text-primary font-semibold"
                        }
                      >
                        {actions.text("/api/v2/webhooks/{id}")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text(
                          "Purge registered webhook subscription endpoint",
                        )}
                      </td>
                      <td className={"py-space-md px-space-lg text-outline"}>
                        {actions.text("v2.3.1")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-surface-container text-on-surface-variant font-semibold"
                          }
                        >
                          {actions.text("JWT Signature")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <div
                          className={
                            "flex items-center gap-space-xs text-rose-600"
                          }
                          title={actions.text(
                            "Duplicate route conflict with v2.4 namespace",
                          )}
                        >
                          <span
                            className={"w-2 h-2 rounded-full bg-rose-500"}
                          ></span>
                          <span className={"font-label-md font-semibold"}>
                            {actions.text("Conflict Error")}
                          </span>
                        </div>
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-sm"
                          }
                        >
                          <button
                            data-action-text={"edit"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Edit Endpoint")}
                            type="button"
                            aria-label={actions.text("edit")}
                            data-handler={
                              "openEditor('/api/v2/webhooks/{id}', 'DELETE')"
                            }
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
                            data-action-text={"visibility"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Preview Docs")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openPreview('/api/v2/webhooks/{id}', 'DELETE')"
                            }
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
                            data-action-text={"rate_review"}
                            className={
                              "p-1.5 rounded-lg text-outline hover:text-amber-600 hover:bg-surface-container transition-all cursor-pointer"
                            }
                            title={actions.text("Submit for Review")}
                            type="button"
                            aria-label={actions.text("rate_review")}
                            data-handler={
                              "triggerReview('/api/v2/webhooks/{id}')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"rate_review"}
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
                  "px-space-lg py-space-md bg-surface-container-low flex items-center justify-between"
                }
              >
                <span className={"font-body-sm text-outline"}>
                  {actions.text("Showing 4 of 148 registered endpoints")}
                </span>
                <div className={"flex items-center gap-space-sm"}>
                  <button
                    data-action-text={"Previous"}
                    className={
                      "px-space-md py-1 rounded bg-surface-container-lowest text-on-surface font-body-sm shadow-sm disabled:opacity-50"
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
                      "px-space-md py-1 rounded bg-primary text-on-primary font-body-sm shadow-sm"
                    }
                    type="button"
                    aria-label={actions.text("1")}
                  >
                    {actions.text("1")}
                  </button>
                  <button
                    data-action-text={"2"}
                    className={
                      "px-space-md py-1 rounded bg-surface-container-lowest text-on-surface font-body-sm shadow-sm hover:bg-surface-container"
                    }
                    type="button"
                    aria-label={actions.text("2")}
                  >
                    {actions.text("2")}
                  </button>
                  <button
                    data-action-text={"3"}
                    className={
                      "px-space-md py-1 rounded bg-surface-container-lowest text-on-surface font-body-sm shadow-sm hover:bg-surface-container"
                    }
                    type="button"
                    aria-label={actions.text("3")}
                  >
                    {actions.text("3")}
                  </button>
                  <button
                    data-action-text={"Next"}
                    className={
                      "px-space-md py-1 rounded bg-surface-container-lowest text-on-surface font-body-sm shadow-sm hover:bg-surface-container"
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

          <div className={"px-space-xl mt-space-lg"}>
            <div
              className={
                "bg-amber-50 border border-amber-200/60 p-space-lg rounded-xl flex items-start gap-space-md shadow-sm"
              }
            >
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined text-amber-600 text-[24px]"
                }
              >
                {"warning"}
              </span>
              <div className={"flex-1"}>
                <h3 className={"font-headline-sm text-amber-900"}>
                  {actions.text("Breaking Change Detected in 2 Endpoints")}
                </h3>
                <p className={"font-body-md text-amber-700 mt-1"}>
                  {actions.text("Property ")}
                  <code
                    className={
                      "font-code-md bg-amber-100 px-1 py-0.5 rounded text-amber-900"
                    }
                  >
                    {"user_id"}
                  </code>
                  {actions.text(" was renamed to ")}
                  <code
                    className={
                      "font-code-md bg-amber-100 px-1 py-0.5 rounded text-amber-900"
                    }
                  >
                    {"account_uuid"}
                  </code>
                  {actions.text(" in ")}
                  <code className={"font-code-md"}>
                    {"POST /api/v2/transactions/charge"}
                  </code>
                  {actions.text(
                    " without a version increment. Re-review is required before releasing to production gateway.",
                  )}
                </p>
              </div>
              <button
                data-action-text={"Dispatch Re-Review"}
                className={
                  "bg-amber-600 hover:bg-amber-700 text-white font-headline-sm px-space-md py-2 rounded-lg text-body-sm transition-all shadow-sm cursor-pointer whitespace-nowrap"
                }
                type="button"
                aria-label={actions.text("Dispatch Re-Review")}
                data-handler={
                  "alert('Re-review workflow dispatched to Governance Team.')"
                }
              >
                {actions.text("\n        Dispatch Re-Review\n      ")}
              </button>
            </div>
          </div>

          <div
            id={"endpoint-editor-drawer"}
            className={
              actions.visible("endpoint-editor-drawer", false)
                ? "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex justify-end transition-all"
                : "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex justify-end transition-all hidden"
            }
          >
            <div
              className={
                "w-full max-w-3xl bg-surface h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
              }
            >
              <div
                className={
                  "px-space-xl py-space-lg bg-surface-container-lowest flex items-center justify-between border-b border-surface-container"
                }
              >
                <div className={"flex items-center gap-space-md"}>
                  <div
                    className={
                      "w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[20px]"}
                    >
                      {"tune"}
                    </span>
                  </div>
                  <div>
                    <h2
                      className={"font-headline-md text-on-surface"}
                      id={"editor-title"}
                    >
                      {actions.text("Configure Endpoint")}
                    </h2>
                    <p
                      className={"font-body-sm text-outline"}
                      id={"editor-subtitle"}
                    >
                      {actions.text(
                        "Modify routing parameters, input schemas and response codes",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"close"}
                  className={
                    "p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeEditor()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[20px]"}
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
                    "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md"
                  }
                >
                  <h3
                    className={
                      "font-headline-sm text-on-surface flex items-center gap-space-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[18px]"
                      }
                    >
                      {"route"}
                    </span>
                    {actions.text(
                      "\n            Route Routing & Method\n          ",
                    )}
                  </h3>
                  <div
                    className={"grid grid-cols-1 md:grid-cols-4 gap-space-md"}
                  >
                    <div>
                      <label
                        className={
                          "block font-label-md text-outline uppercase mb-1"
                        }
                      >
                        {actions.text("HTTP Method")}
                      </label>
                      <select
                        className={
                          "w-full bg-surface-container px-space-md py-2 rounded-xl text-body-md font-semibold font-code-md text-on-surface outline-none"
                        }
                        id={"edit-method"}
                      >
                        <option value={"GET"}>{actions.text("GET")}</option>
                        <option value={"POST"}>{actions.text("POST")}</option>
                        <option value={"PUT"}>{actions.text("PUT")}</option>
                        <option value={"DELETE"}>
                          {actions.text("DELETE")}
                        </option>
                        <option value={"PATCH"}>{actions.text("PATCH")}</option>
                      </select>
                    </div>
                    <div className={"md:col-span-3"}>
                      <label
                        className={
                          "block font-label-md text-outline uppercase mb-1"
                        }
                      >
                        {actions.text("Route Path")}
                      </label>
                      <input
                        className={
                          "w-full bg-surface-container px-space-md py-2 rounded-xl font-code-md text-code-md text-on-surface outline-none focus:ring-1 focus:ring-primary"
                        }
                        id={"edit-path"}
                        type={"text"}
                        defaultValue={"/api/v2/users/{id}"}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={
                        "block font-label-md text-outline uppercase mb-1"
                      }
                    >
                      {actions.text("Operation Summary")}
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container px-space-md py-2 rounded-xl text-body-md text-on-surface outline-none"
                      }
                      id={"edit-summary"}
                      type={"text"}
                      defaultValue={"Retrieve user profile details by UUID"}
                    />
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <h3
                      className={
                        "font-headline-sm text-on-surface flex items-center gap-space-sm"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"code"}
                      </span>
                      {actions.text(
                        "\n              Parameters & Query Validators\n            ",
                      )}
                    </h3>
                    <button
                      data-action-text={"add Add Param"}
                      className={
                        "text-primary hover:text-primary-container font-headline-sm text-body-sm flex items-center gap-1 cursor-pointer"
                      }
                      type="button"
                      aria-label={actions.text("Add Param")}
                      data-handler={"addParameterRow()"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"add"}
                      </span>
                      {actions.text(" Add Param\n            ")}
                    </button>
                  </div>
                  <div className={"space-y-space-sm"} id={"parameters-list"}>
                    <div
                      className={
                        "flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-lg"
                      }
                    >
                      <input
                        data-source-placeholder={"Name"}
                        className={
                          "flex-1 bg-surface-container-lowest px-3 py-1.5 rounded font-code-md text-code-md text-on-surface"
                        }
                        placeholder={actions.text("Name")}
                        type={"text"}
                        defaultValue={"id"}
                        aria-label={actions.text("Name")}
                      />
                      <select
                        className={
                          "w-28 bg-surface-container-lowest px-2 py-1.5 rounded font-code-md text-code-md text-on-surface"
                        }
                        aria-label={actions.text("Input")}
                      >
                        <option value={"path"}>{actions.text("path")}</option>
                        <option value={"query"}>{actions.text("query")}</option>
                        <option value={"header"}>
                          {actions.text("header")}
                        </option>
                      </select>
                      <select
                        className={
                          "w-28 bg-surface-container-lowest px-2 py-1.5 rounded font-code-md text-code-md text-on-surface"
                        }
                        aria-label={actions.text("Input")}
                      >
                        <option value={"string"}>
                          {actions.text("string")}
                        </option>
                        <option value={"integer"}>
                          {actions.text("integer")}
                        </option>
                        <option value={"boolean"}>
                          {actions.text("boolean")}
                        </option>
                      </select>
                      <label
                        className={
                          "flex items-center gap-1 text-body-sm text-outline"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"rounded text-primary"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        {actions.text(" Required")}
                      </label>
                      <button
                        data-action-text={"delete"}
                        className={"text-outline hover:text-error"}
                        type="button"
                        aria-label={actions.text("Delete")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"delete"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md"
                  }
                >
                  <h3
                    className={
                      "font-headline-sm text-on-surface flex items-center gap-space-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[18px]"
                      }
                    >
                      {"data_object"}
                    </span>
                    {actions.text(
                      "\n            Request Body Schema (JSON)\n          ",
                    )}
                  </h3>
                  <div
                    className={
                      "bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl font-code-md text-code-md overflow-x-auto"
                    }
                  >
                    <pre>
                      <code>
                        {
                          '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "properties": {\n    "account_uuid": {\n      "type": "string",\n      "format": "uuid"\n    },\n    "amount": {\n      "type": "number",\n      "minimum": 0.01\n    }\n  },\n  "required": ["account_uuid", "amount"]\n}'
                        }
                      </code>
                    </pre>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md"
                  }
                >
                  <h3
                    className={
                      "font-headline-sm text-on-surface flex items-center gap-space-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[18px]"
                      }
                    >
                      {"checklist"}
                    </span>
                    {actions.text(
                      "\n            Response Codes & Mime-Types\n          ",
                    )}
                  </h3>
                  <div className={"space-y-space-sm"}>
                    <div
                      className={
                        "flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg"
                      }
                    >
                      <div className={"flex items-center gap-space-md"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded font-code-md font-semibold bg-emerald-100 text-emerald-800"
                          }
                        >
                          {actions.text("200 OK")}
                        </span>
                        <span
                          className={"font-body-md text-on-surface-variant"}
                        >
                          {actions.text(
                            "Successful resource retrieval payload",
                          )}
                        </span>
                      </div>
                      <span
                        className={"font-code-md text-outline text-code-sm"}
                      >
                        {actions.text("application/json")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg"
                      }
                    >
                      <div className={"flex items-center gap-space-md"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded font-code-md font-semibold bg-rose-100 text-rose-800"
                          }
                        >
                          {actions.text("404 Not Found")}
                        </span>
                        <span
                          className={"font-body-md text-on-surface-variant"}
                        >
                          {actions.text("Target entity does not exist")}
                        </span>
                      </div>
                      <span
                        className={"font-code-md text-outline text-code-sm"}
                      >
                        {actions.text("application/json")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "px-space-xl py-space-lg bg-surface-container-lowest border-t border-surface-container flex items-center justify-between"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-space-lg py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-headline-sm text-body-sm transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeEditor()"}
                >
                  {actions.text("\n          Cancel\n        ")}
                </button>
                <div className={"flex items-center gap-space-md"}>
                  <button
                    data-action-text={"Preview Docs"}
                    className={
                      "px-space-lg py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-body-sm transition-all shadow-sm cursor-pointer"
                    }
                    type="button"
                    aria-label={actions.text("Preview Docs")}
                    data-handler={"saveAndPreview()"}
                  >
                    {actions.text("\n            Preview Docs\n          ")}
                  </button>
                  <button
                    data-action-text={"Save Changes"}
                    className={
                      "px-space-lg py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-sm transition-all shadow-md cursor-pointer"
                    }
                    type="button"
                    aria-label={actions.text("Save Changes")}
                    data-handler={"saveChanges()"}
                  >
                    {actions.text("\n            Save Changes\n          ")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            id={"add-endpoint-modal"}
            className={
              actions.visible("add-endpoint-modal", false)
                ? "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center"
                : "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl p-space-xl space-y-space-lg animate-in fade-in zoom-in-95 duration-150"
              }
            >
              <div className={"flex items-center justify-between"}>
                <h3 className={"font-headline-md text-on-surface"}>
                  {actions.text("Register New API Endpoint")}
                </h3>
                <button
                  data-action-text={"close"}
                  className={"text-outline hover:text-on-surface"}
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={
                    "document.getElementById('add-endpoint-modal').classList.add('hidden')"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>
              <div className={"space-y-space-md"}>
                <div>
                  <label
                    className={
                      "block font-label-md text-outline uppercase mb-1"
                    }
                  >
                    {actions.text("HTTP Method & Path")}
                  </label>
                  <div className={"flex gap-space-sm"}>
                    <select
                      className={
                        "bg-surface-container px-3 py-2 rounded-xl font-code-md font-semibold text-on-surface outline-none"
                      }
                      aria-label={actions.text("Input")}
                    >
                      <option value={"GET"}>{actions.text("GET")}</option>
                      <option value={"POST"}>{actions.text("POST")}</option>
                      <option value={"PUT"}>{actions.text("PUT")}</option>
                      <option value={"DELETE"}>{actions.text("DELETE")}</option>
                    </select>
                    <input
                      data-source-placeholder={"/api/v2/resource/{id}"}
                      className={
                        "flex-1 bg-surface-container px-space-md py-2 rounded-xl font-code-md text-code-md text-on-surface outline-none"
                      }
                      placeholder={actions.text("/api/v2/resource/{id}")}
                      type={"text"}
                      aria-label={actions.text("/api/v2/resource/{id}")}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={
                      "block font-label-md text-outline uppercase mb-1"
                    }
                  >
                    {actions.text("Summary & Description")}
                  </label>
                  <input
                    data-source-placeholder={
                      "Short description of the operation..."
                    }
                    className={
                      "w-full bg-surface-container px-space-md py-2 rounded-xl text-body-md text-on-surface outline-none mb-space-sm"
                    }
                    placeholder={actions.text(
                      "Short description of the operation...",
                    )}
                    type={"text"}
                    aria-label={actions.text(
                      "Short description of the operation...",
                    )}
                  />
                  <textarea
                    data-source-placeholder={
                      "Detailed Markdown documentation..."
                    }
                    className={
                      "w-full bg-surface-container px-space-md py-2 rounded-xl text-body-md text-on-surface outline-none resize-none"
                    }
                    placeholder={actions.text(
                      "Detailed Markdown documentation...",
                    )}
                    rows={3}
                    aria-label={actions.text(
                      "Detailed Markdown documentation...",
                    )}
                    defaultValue={""}
                  ></textarea>
                </div>
                <div>
                  <label
                    className={
                      "block font-label-md text-outline uppercase mb-1"
                    }
                  >
                    {actions.text("Authentication Guard")}
                  </label>
                  <select
                    className={
                      "w-full bg-surface-container px-space-md py-2 rounded-xl text-body-md text-on-surface outline-none"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"OAuth2 Bearer Token (Recommended)"}>
                      {actions.text("OAuth2 Bearer Token (Recommended)")}
                    </option>
                    <option value={"API Key + HMAC Signature"}>
                      {actions.text("API Key + HMAC Signature")}
                    </option>
                    <option value={"JSON Web Token (JWT)"}>
                      {actions.text("JSON Web Token (JWT)")}
                    </option>
                    <option value={"Public / Unauthenticated"}>
                      {actions.text("Public / Unauthenticated")}
                    </option>
                  </select>
                </div>
              </div>
              <div
                className={
                  "flex items-center justify-end gap-space-md pt-space-md"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-space-lg py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-headline-sm text-body-sm"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={
                    "document.getElementById('add-endpoint-modal').classList.add('hidden')"
                  }
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Create Endpoint"}
                  className={
                    "px-space-lg py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-sm shadow-md"
                  }
                  type="button"
                  aria-label={actions.text("Create Endpoint")}
                  data-handler={"createNewEndpoint()"}
                >
                  {actions.text("Create Endpoint")}
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
