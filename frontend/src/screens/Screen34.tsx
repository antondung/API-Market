import { useScreenActions } from "../features/screen-actions";
export default function Screen34() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg"
            }
          >
            <div>
              <div className={"flex items-center gap-2 mb-1"}>
                <span
                  className={
                    "text-xs font-label-md uppercase tracking-wider text-outline"
                  }
                >
                  {actions.text("Audit & Logs")}
                </span>
                <span
                  className={
                    "text-xs font-code-md text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                  }
                >
                  {actions.text("Live Stream")}
                </span>
              </div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("Request History")}
              </h1>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Audit and debugging logs across all active API subscriptions in real time.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <div
                className={
                  "flex items-center bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"calendar_today"}
                </span>
                <span className={"text-on-surface font-medium"}>
                  {actions.text("Last 24 Hours")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant ml-2 text-[18px]"
                  }
                >
                  {"arrow_drop_down"}
                </span>
              </div>
              <button
                data-action-text={"download Export JSON/CSV"}
                className={
                  "flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-body-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Export JSON/CSV")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text("\n        Export JSON/CSV\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-low rounded-2xl p-space-md mb-space-lg shadow-sm"
            }
          >
            <div className={"grid grid-cols-1 md:grid-cols-5 gap-3"}>
              <div className={"relative md:col-span-2"}>
                <span
                  aria-hidden={true}
                  className={
                    "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none material-symbols-outlined text-on-surface-variant text-[18px]"
                  }
                >
                  {"search"}
                </span>
                <input
                  data-source-placeholder={
                    "Search by Request ID, endpoint, or IP..."
                  }
                  className={
                    "w-full bg-surface border border-outline-variant rounded-xl pl-9 pr-4 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
                  }
                  placeholder={actions.text(
                    "Search by Request ID, endpoint, or IP...",
                  )}
                  type={"text"}
                  aria-label={actions.text(
                    "Search by Request ID, endpoint, or IP...",
                  )}
                />
              </div>
              <div>
                <select
                  className={
                    "w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All APIs"}>{actions.text("All APIs")}</option>
                  <option value={"Neural LLM v4"}>
                    {actions.text("Neural LLM v4")}
                  </option>
                  <option value={"Global Geocoding"}>
                    {actions.text("Global Geocoding")}
                  </option>
                  <option value={"SecureVault"}>
                    {actions.text("SecureVault")}
                  </option>
                </select>
              </div>
              <div>
                <select
                  className={
                    "w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All HTTP Methods"}>
                    {actions.text("All HTTP Methods")}
                  </option>
                  <option value={"GET"}>{actions.text("GET")}</option>
                  <option value={"POST"}>{actions.text("POST")}</option>
                  <option value={"PUT"}>{actions.text("PUT")}</option>
                  <option value={"DELETE"}>{actions.text("DELETE")}</option>
                </select>
              </div>
              <div>
                <select
                  className={
                    "w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All Status Codes"}>
                    {actions.text("All Status Codes")}
                  </option>
                  <option value={"200 OK"}>{actions.text("200 OK")}</option>
                  <option value={"201 Created"}>
                    {actions.text("201 Created")}
                  </option>
                  <option value={"400 Bad Request"}>
                    {actions.text("400 Bad Request")}
                  </option>
                  <option value={"429 Rate Limited"}>
                    {actions.text("429 Rate Limited")}
                  </option>
                  <option value={"500 Internal Error"}>
                    {actions.text("500 Internal Error")}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden mb-space-lg"
            }
          >
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low/50 text-body-sm font-label-md text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30"
                    }
                  >
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Timestamp")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("API & Version")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Endpoint path")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Method")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Status")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Latency")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Error Category")}
                    </th>
                    <th className={"py-3 px-4 font-medium"}>
                      {actions.text("Request ID")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={"divide-y divide-outline-variant/20 text-body-sm"}
                >
                  <tr
                    data-action-text={
                      "14:32:01.042 Neural LLM v4 /v4/chat/completions POST 429 Rate Limited 14ms RateLimited req_98fbc12a"
                    }
                    className={
                      "hover:bg-surface-container-low/60 cursor-pointer transition-colors group"
                    }
                    data-handler={"openDrawer('req_98fbc12a')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "14:32:01.042 Neural LLM v4 /v4/chat/completions POST 429 Rate Limited 14ms RateLimited req_98fbc12a",
                      )
                    }
                  >
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("14:32:01.042")}
                    </td>
                    <td className={"py-3 px-4 font-medium text-on-surface"}>
                      {actions.text("Neural LLM v4")}
                    </td>
                    <td className={"py-3 px-4 font-code-sm text-on-surface"}>
                      {actions.text("/v4/chat/completions")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-indigo-50 text-indigo-700"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-amber-50 text-amber-700"
                        }
                      >
                        {actions.text("429 Rate Limited")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("14ms")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"
                        }
                      >
                        {actions.text("RateLimited")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant group-hover:text-primary transition-colors"
                      }
                    >
                      {actions.text("req_98fbc12a")}
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "14:31:58.810 Global Geocoding /v1/geocode/reverse GET 200 OK 124ms — req_87e2fa90"
                    }
                    className={
                      "hover:bg-surface-container-low/60 cursor-pointer transition-colors group"
                    }
                    data-handler={"openDrawer('req_87e2fa90')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "14:31:58.810 Global Geocoding /v1/geocode/reverse GET 200 OK 124ms \u2014 req_87e2fa90",
                      )
                    }
                  >
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("14:31:58.810")}
                    </td>
                    <td className={"py-3 px-4 font-medium text-on-surface"}>
                      {actions.text("Global Geocoding")}
                    </td>
                    <td className={"py-3 px-4 font-code-sm text-on-surface"}>
                      {actions.text("/v1/geocode/reverse")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-emerald-50 text-emerald-700"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-emerald-50 text-emerald-700"
                        }
                      >
                        {actions.text("200 OK")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("124ms")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span className={"text-xs text-on-surface-variant/60"}>
                        {actions.text("—")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant group-hover:text-primary transition-colors"
                      }
                    >
                      {actions.text("req_87e2fa90")}
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "14:29:12.441 SecureVault /v2/secrets/rotate PUT 500 Internal Error 842ms UpstreamTimeout req_33a109bc"
                    }
                    className={
                      "hover:bg-surface-container-low/60 cursor-pointer transition-colors group"
                    }
                    data-handler={"openDrawer('req_33a109bc')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "14:29:12.441 SecureVault /v2/secrets/rotate PUT 500 Internal Error 842ms UpstreamTimeout req_33a109bc",
                      )
                    }
                  >
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("14:29:12.441")}
                    </td>
                    <td className={"py-3 px-4 font-medium text-on-surface"}>
                      {actions.text("SecureVault")}
                    </td>
                    <td className={"py-3 px-4 font-code-sm text-on-surface"}>
                      {actions.text("/v2/secrets/rotate")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-purple-50 text-purple-700"
                        }
                      >
                        {actions.text("PUT")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-red-50 text-red-700"
                        }
                      >
                        {actions.text("500 Internal Error")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("842ms")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium"
                        }
                      >
                        {actions.text("UpstreamTimeout")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant group-hover:text-primary transition-colors"
                      }
                    >
                      {actions.text("req_33a109bc")}
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "14:25:04.110 Neural LLM v4 /v4/embeddings POST 201 Created 312ms — req_11bc8821"
                    }
                    className={
                      "hover:bg-surface-container-low/60 cursor-pointer transition-colors group"
                    }
                    data-handler={"openDrawer('req_11bc8821')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "14:25:04.110 Neural LLM v4 /v4/embeddings POST 201 Created 312ms \u2014 req_11bc8821",
                      )
                    }
                  >
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("14:25:04.110")}
                    </td>
                    <td className={"py-3 px-4 font-medium text-on-surface"}>
                      {actions.text("Neural LLM v4")}
                    </td>
                    <td className={"py-3 px-4 font-code-sm text-on-surface"}>
                      {actions.text("/v4/embeddings")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-indigo-50 text-indigo-700"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-emerald-50 text-emerald-700"
                        }
                      >
                        {actions.text("201 Created")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("312ms")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span className={"text-xs text-on-surface-variant/60"}>
                        {actions.text("—")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant group-hover:text-primary transition-colors"
                      }
                    >
                      {actions.text("req_11bc8821")}
                    </td>
                  </tr>

                  <tr
                    data-action-text={
                      "14:18:55.902 Global Geocoding /v1/geocode/search GET 400 Bad Request 45ms ValidationError req_55aa4477"
                    }
                    className={
                      "hover:bg-surface-container-low/60 cursor-pointer transition-colors group"
                    }
                    data-handler={"openDrawer('req_55aa4477')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-4"
                    hidden={
                      !actions.matches(
                        "14:18:55.902 Global Geocoding /v1/geocode/search GET 400 Bad Request 45ms ValidationError req_55aa4477",
                      )
                    }
                  >
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("14:18:55.902")}
                    </td>
                    <td className={"py-3 px-4 font-medium text-on-surface"}>
                      {actions.text("Global Geocoding")}
                    </td>
                    <td className={"py-3 px-4 font-code-sm text-on-surface"}>
                      {actions.text("/v1/geocode/search")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-emerald-50 text-emerald-700"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-red-50 text-red-700"
                        }
                      >
                        {actions.text("400 Bad Request")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("45ms")}
                    </td>
                    <td className={"py-3 px-4"}>
                      <span
                        className={
                          "text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium"
                        }
                      >
                        {actions.text("ValidationError")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-3 px-4 font-code-sm text-on-surface-variant group-hover:text-primary transition-colors"
                      }
                    >
                      {actions.text("req_55aa4477")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className={
                "flex items-center justify-between px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant/20 text-body-sm text-on-surface-variant"
              }
            >
              <div>
                {actions.text("Showing ")}
                <span className={"font-medium text-on-surface"}>
                  {actions.text("1-25")}
                </span>
                {actions.text(" of ")}
                <span className={"font-medium text-on-surface"}>
                  {actions.text("1,428")}
                </span>
                {actions.text(" requests")}
              </div>
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"Previous"}
                  className={
                    "px-3 py-1 rounded-lg border border-outline-variant bg-surface text-on-surface-variant opacity-50 cursor-not-allowed"
                  }
                  type="button"
                  aria-label={actions.text("Previous")}
                >
                  {actions.text("Previous")}
                </button>
                <button
                  data-action-text={"1"}
                  className={
                    "px-3 py-1 rounded-lg border border-outline-variant bg-primary text-on-primary"
                  }
                  type="button"
                  aria-label={actions.text("1")}
                >
                  {actions.text("1")}
                </button>
                <button
                  data-action-text={"2"}
                  className={
                    "px-3 py-1 rounded-lg border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("2")}
                >
                  {actions.text("2")}
                </button>
                <button
                  data-action-text={"3"}
                  className={
                    "px-3 py-1 rounded-lg border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("3")}
                >
                  {actions.text("3")}
                </button>
                <span className={"px-1"}>{actions.text("...")}</span>
                <button
                  data-action-text={"58"}
                  className={
                    "px-3 py-1 rounded-lg border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("58")}
                >
                  {actions.text("58")}
                </button>
                <button
                  data-action-text={"Next"}
                  className={
                    "px-3 py-1 rounded-lg border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high transition-colors"
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
            id={"request-drawer"}
            className={
              actions.visible("request-drawer", false)
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
                    "px-6 py-4 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20"
                  }
                >
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded text-code-sm font-medium bg-amber-50 text-amber-700"
                        }
                      >
                        {actions.text("429 Rate Limited")}
                      </span>
                      <span
                        className={
                          "font-code-sm text-on-surface-variant text-xs"
                        }
                      >
                        {actions.text("req_98fbc12a")}
                      </span>
                    </div>
                    <h2
                      className={
                        "text-headline-sm font-headline-sm text-on-surface mt-1"
                      }
                    >
                      {actions.text("Neural LLM v4 /v4/chat/completions")}
                    </h2>
                  </div>
                  <button
                    data-action-text={"close"}
                    className={
                      "p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
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

                <div className={"flex-1 overflow-y-auto p-6 space-y-space-lg"}>
                  <div
                    className={
                      "bg-amber-50 border border-amber-200/60 rounded-xl p-4 text-amber-900"
                    }
                  >
                    <div className={"flex items-start gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-amber-600 mt-0.5"
                        }
                      >
                        {"info"}
                      </span>
                      <div>
                        <h4
                          className={"text-body-md font-medium text-amber-900"}
                        >
                          {actions.text("Rate Limit Exceeded (429)")}
                        </h4>
                        <p className={"text-body-sm text-amber-800 mt-0.5"}>
                          {actions.text(
                            "Token bucket capacity reached for Tier Developer Pro. Wait 14s before next retry.",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-xs font-label-md uppercase tracking-wider text-outline mb-3"
                      }
                    >
                      {actions.text("Overview")}
                    </h3>
                    <div
                      className={
                        "grid grid-cols-2 gap-3 bg-surface-container-low/50 p-4 rounded-xl text-body-sm"
                      }
                    >
                      <div>
                        <span
                          className={"text-on-surface-variant block text-xs"}
                        >
                          {actions.text("Timestamp")}
                        </span>
                        <span className={"font-code-sm text-on-surface"}>
                          {actions.text("2024-10-24 14:32:01.042 UTC")}
                        </span>
                      </div>
                      <div>
                        <span
                          className={"text-on-surface-variant block text-xs"}
                        >
                          {actions.text("Latency")}
                        </span>
                        <span className={"font-code-sm text-on-surface"}>
                          {actions.text("14ms")}
                        </span>
                      </div>
                      <div>
                        <span
                          className={"text-on-surface-variant block text-xs"}
                        >
                          {actions.text("Client IP")}
                        </span>
                        <span className={"font-code-sm text-on-surface"}>
                          {actions.text("192.168.1.104")}
                        </span>
                      </div>
                      <div>
                        <span
                          className={"text-on-surface-variant block text-xs"}
                        >
                          {actions.text("User-Agent")}
                        </span>
                        <span
                          className={
                            "font-code-sm text-on-surface truncate block"
                          }
                        >
                          {actions.text("APIConsumer-SDK/2.4.1")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-xs font-label-md uppercase tracking-wider text-outline mb-3"
                      }
                    >
                      {actions.text("Quota Impact")}
                    </h3>
                    <div
                      className={"bg-surface-container-low/50 p-4 rounded-xl"}
                    >
                      <div className={"flex justify-between text-body-sm mb-2"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Consumed: ")}
                          <strong className={"text-on-surface"}>
                            {actions.text("0 requests")}
                          </strong>
                          {actions.text(" (Blocked)")}
                        </span>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Remaining: ")}
                          <strong className={"text-primary"}>
                            {actions.text("47,200 / 50,000")}
                          </strong>
                        </span>
                      </div>
                      <div
                        className={
                          "w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden"
                        }
                      >
                        <div className={"bg-primary h-full w-[94%]"}></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-xs font-label-md uppercase tracking-wider text-outline mb-3"
                      }
                    >
                      {actions.text("Request Headers")}
                    </h3>
                    <div
                      className={
                        "bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 font-code-sm text-code-sm space-y-1"
                      }
                    >
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Host:")}
                        </span>
                        <span className={"text-on-surface"}>
                          {actions.text("api.hub.internal")}
                        </span>
                      </div>
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Authorization:")}
                        </span>
                        <span className={"text-primary font-medium"}>
                          {actions.text("Bearer sk_live_••••••••3f9a")}
                        </span>
                      </div>
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Content-Type:")}
                        </span>
                        <span className={"text-on-surface"}>
                          {actions.text("application/json")}
                        </span>
                      </div>
                      <div className={"flex justify-between"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("X-Request-Source:")}
                        </span>
                        <span className={"text-on-surface"}>
                          {actions.text("CLI-Runner")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={
                        "text-xs font-label-md uppercase tracking-wider text-outline mb-3"
                      }
                    >
                      {actions.text("Payload Preview (Sanitized)")}
                    </h3>
                    <div
                      className={
                        "bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 font-code-sm text-code-sm overflow-x-auto text-on-surface"
                      }
                    >
                      <pre className={"text-xs leading-relaxed"}>
                        {
                          '{\n  "model": "neural-llm-v4-standard",\n  "messages": [\n    {\n      "role": "system",\n      "content": "You are a helpful coding assistant."\n    },\n    {\n      "role": "user",\n      "content": "Refactor this token bucket logic..."\n    }\n  ],\n  "temperature": 0.7,\n  "max_tokens": 150\n}'
                        }
                      </pre>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end gap-3"
                  }
                >
                  <button
                    data-action-text={"Close"}
                    className={
                      "px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-sm font-medium hover:bg-surface-container-high transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("Close")}
                    data-handler={"closeDrawer()"}
                  >
                    {actions.text("Close")}
                  </button>
                  <button
                    data-action-text={"Replay Request"}
                    className={
                      "px-4 py-2 rounded-xl bg-primary text-on-primary text-body-sm font-medium hover:bg-primary/90 transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("Replay Request")}
                  >
                    {actions.text("Replay Request")}
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
