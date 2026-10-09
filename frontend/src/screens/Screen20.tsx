import { useScreenActions } from "../features/screen-actions";
export default function Screen20() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            }
          >
            <div>
              <div className={"flex items-center gap-2 mb-1"}>
                <span
                  className={
                    "text-label-md font-label-md uppercase tracking-wider text-outline"
                  }
                >
                  {actions.text("Inventory & Endpoints")}
                </span>
                <span className={"text-outline"}>{actions.text("•")}</span>
                <span
                  className={
                    "text-label-md font-label-md text-primary font-medium"
                  }
                >
                  {actions.text("14 Active Services")}
                </span>
              </div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("My APIs & Endpoints")}
              </h1>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"download Export Specs"}
                className={
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-all text-body-md font-medium shadow-sm"
                }
                type="button"
                aria-label={actions.text("Export Specs")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text("\n        Export Specs\n      ")}
              </button>
              <button
                data-action-text={"add Create New API"}
                className={
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all text-body-md font-medium shadow-sm"
                }
                type="button"
                aria-label={actions.text("Create New API")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"add"}
                </span>
                {actions.text("\n        Create New API\n      ")}
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
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Total Published")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"public"}
                  </span>
                </div>
              </div>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("8")}
                </span>
                <span className={"text-code-sm text-emerald-600 font-medium"}>
                  {actions.text("+2 this month")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Under Review")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"hourglass_top"}
                  </span>
                </div>
              </div>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("3")}
                </span>
                <span className={"text-code-sm text-on-surface-variant"}>
                  {actions.text("Avg. 4h review")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Drafts & Staging")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"edit_note"}
                  </span>
                </div>
              </div>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("2")}
                </span>
                <span className={"text-code-sm text-on-surface-variant"}>
                  {actions.text("Unpublished")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-4"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Action Required")}
                </span>
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"error"}
                  </span>
                </div>
              </div>
              <div className={"flex items-baseline gap-2"}>
                <span
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("1")}
                </span>
                <span className={"text-code-sm text-rose-600 font-medium"}>
                  {actions.text("Rejected version")}
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest p-4 rounded-xl shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between"
            }
          >
            <div className={"relative w-full lg:w-96"}>
              <span
                aria-hidden={true}
                className={
                  "material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]"
                }
              >
                {"search"}
              </span>
              <input
                data-source-placeholder={
                  "Search API name, keyword, or endpoint..."
                }
                className={
                  "w-full bg-surface-container-low pl-10 pr-4 py-2 rounded-xl text-body-md outline-none text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary transition-all"
                }
                placeholder={actions.text(
                  "Search API name, keyword, or endpoint...",
                )}
                type={"text"}
                aria-label={actions.text(
                  "Search API name, keyword, or endpoint...",
                )}
              />
            </div>
            <div
              className={"flex flex-wrap items-center gap-3 w-full lg:w-auto"}
            >
              <select
                className={
                  "bg-surface-container-low px-3 py-2 rounded-xl text-body-md font-medium text-on-surface outline-none cursor-pointer"
                }
                aria-label={actions.text("Input")}
              >
                <option value={""}>{actions.text("All Categories")}</option>
                <option value={"ai"}>{actions.text("AI / ML")}</option>
                <option value={"geo"}>{actions.text("Geolocation")}</option>
                <option value={"sec"}>{actions.text("Security")}</option>
              </select>

              <select
                className={
                  "bg-surface-container-low px-3 py-2 rounded-xl text-body-md font-medium text-on-surface outline-none cursor-pointer"
                }
                aria-label={actions.text("Input")}
              >
                <option value={""}>{actions.text("All Statuses")}</option>
                <option value={"published"}>{actions.text("Published")}</option>
                <option value={"review"}>{actions.text("Under Review")}</option>
                <option value={"draft"}>{actions.text("Draft")}</option>
                <option value={"rejected"}>{actions.text("Rejected")}</option>
                <option value={"suspended"}>{actions.text("Suspended")}</option>
              </select>

              <select
                className={
                  "bg-surface-container-low px-3 py-2 rounded-xl text-body-md font-medium text-on-surface outline-none cursor-pointer"
                }
                aria-label={actions.text("Input")}
              >
                <option value={""}>{actions.text("All Pricing Models")}</option>
                <option value={"usage"}>{actions.text("Usage-based")}</option>
                <option value={"flat"}>{actions.text("Flat Tier")}</option>
                <option value={"free"}>{actions.text("Free")}</option>
              </select>
              <button
                data-action-text={"tune"}
                className={
                  "p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-all"
                }
                type="button"
                aria-label={actions.text("tune")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"tune"}
                </span>
              </button>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-12"
            }
          >
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low text-on-surface-variant text-label-md font-label-md uppercase tracking-wider"
                    }
                  >
                    <th className={"py-4 px-6 font-medium"}>
                      {actions.text("API Name & Description")}
                    </th>
                    <th className={"py-4 px-4 font-medium"}>
                      {actions.text("Version")}
                    </th>
                    <th className={"py-4 px-4 font-medium"}>
                      {actions.text("Category")}
                    </th>
                    <th className={"py-4 px-4 font-medium"}>
                      {actions.text("Pricing")}
                    </th>
                    <th className={"py-4 px-4 font-medium"}>
                      {actions.text("Status")}
                    </th>
                    <th className={"py-4 px-4 font-medium"}>
                      {actions.text("Subscribers")}
                    </th>
                    <th className={"py-4 px-4 font-medium"}>
                      {actions.text("Last Updated")}
                    </th>
                    <th className={"py-4 px-6 font-medium text-right"}>
                      {actions.text("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "divide-y divide-surface-container-low text-body-md"
                  }
                >
                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-colors"
                    }
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "NeuralVision OCR v4 verified High-speed multimodal optical character recognition for complex layouts. v4.2.1 AI/ML Usage-based Published 1,428 2 hours ago monitoring dns description more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div
                        className={
                          "font-medium text-on-surface flex items-center gap-2"
                        }
                      >
                        {actions.text(
                          "\n                NeuralVision OCR v4\n                ",
                        )}
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[16px] text-primary"
                          }
                        >
                          {"verified"}
                        </span>
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant truncate max-w-xs"
                        }
                      >
                        {actions.text(
                          "High-speed multimodal optical character recognition for complex layouts.",
                        )}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("v4.2.1")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-indigo-50 text-indigo-700 font-medium"
                        }
                      >
                        {actions.text("AI/ML")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Usage-based")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md bg-emerald-50 text-emerald-700 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.recordText(
                          "row-0",
                          "\n                Published\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("1,428")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2 hours ago")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-1"}>
                        <button
                          data-action-text={"monitoring"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          title={actions.text("View Analytics")}
                          type="button"
                          aria-label={actions.text("monitoring")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"monitoring"}
                          </span>
                        </button>
                        <button
                          data-action-text={"dns"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          title={actions.text("Manage Endpoints")}
                          type="button"
                          aria-label={actions.text("dns")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"dns"}
                          </span>
                        </button>
                        <button
                          data-action-text={"description"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          title={actions.text("View Docs")}
                          type="button"
                          aria-label={actions.text("description")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"description"}
                          </span>
                        </button>
                        <div className={"relative group"}>
                          <button
                            data-action-text={"more_vert"}
                            className={
                              "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                            }
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
                      </div>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-colors"
                    }
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "GeoRoute Matrix API Real-time traffic-aware distance matrix and routing calculations. v2.0.0-rc1 Geolocation Flat Tier Under Review 0 Yesterday visibility dns more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("GeoRoute Matrix API")}
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant truncate max-w-xs"
                        }
                      >
                        {actions.text(
                          "Real-time traffic-aware distance matrix and routing calculations.",
                        )}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("v2.0.0-rc1")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-blue-50 text-blue-700 font-medium"
                        }
                      >
                        {actions.text("Geolocation")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Flat Tier")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md bg-amber-50 text-amber-700 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-amber-500"}
                        ></span>
                        {actions.recordText(
                          "row-1",
                          "\n                Under Review\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("0")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("Yesterday")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-1"}>
                        <button
                          data-action-text={"visibility"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          title={actions.text("View API")}
                          type="button"
                          aria-label={actions.text("View")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"visibility"}
                          </span>
                        </button>
                        <button
                          data-action-text={"dns"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          title={actions.text("Manage Endpoints")}
                          type="button"
                          aria-label={actions.text("dns")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"dns"}
                          </span>
                        </button>
                        <button
                          data-action-text={"more_vert"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          type="button"
                          aria-label={actions.text("More actions")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"more_vert"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-colors"
                    }
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "SecureAuth Vault Shield Zero-trust token verification and biometric challenge webhooks. v1.0.0-dev Security Free Draft \u2014 3 days ago edit Edit Submit more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("SecureAuth Vault Shield")}
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant truncate max-w-xs"
                        }
                      >
                        {actions.text(
                          "Zero-trust token verification and biometric challenge webhooks.",
                        )}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("v1.0.0-dev")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-purple-50 text-purple-700 font-medium"
                        }
                      >
                        {actions.text("Security")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Free")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md bg-slate-100 text-slate-700 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-slate-400"}
                        ></span>
                        {actions.recordText(
                          "row-2",
                          "\n                Draft\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("—")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("3 days ago")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-1"}>
                        <button
                          data-action-text={"edit Edit"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-primary font-medium flex items-center gap-1 text-body-sm"
                          }
                          title={actions.text("Edit Draft")}
                          type="button"
                          aria-label={actions.text("Edit")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"edit"}
                          </span>
                          {actions.text(
                            "\n                  Edit\n                ",
                          )}
                        </button>
                        <button
                          data-action-text={"Submit"}
                          className={
                            "px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium text-body-sm"
                          }
                          title={actions.text("Submit for Review")}
                          type="button"
                          aria-label={actions.text("Submit")}
                        >
                          {actions.text(
                            "\n                  Submit\n                ",
                          )}
                        </button>
                        <button
                          data-action-text={"more_vert"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          type="button"
                          aria-label={actions.text("More actions")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"more_vert"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-colors bg-rose-50/20"
                    }
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "DeepAudio Voice Synth info Feedback: Missing rate limit description & terms of use compliance. v1.1.0 AI/ML Usage-based Rejected 0 5 days ago refresh Revise & Resubmit more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("DeepAudio Voice Synth")}
                      </div>
                      <div
                        className={
                          "text-body-sm text-rose-600 font-medium flex items-center gap-1 mt-0.5"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"info"}
                        </span>
                        {actions.text(
                          "\n                Feedback: Missing rate limit description & terms of use compliance.\n              ",
                        )}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("v1.1.0")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-indigo-50 text-indigo-700 font-medium"
                        }
                      >
                        {actions.text("AI/ML")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Usage-based")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md bg-rose-50 text-rose-700 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-rose-500"}
                        ></span>
                        {actions.recordText(
                          "row-3",
                          "\n                Rejected\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("0")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("5 days ago")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-1"}>
                        <button
                          data-action-text={"refresh Revise & Resubmit"}
                          className={
                            "px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-all font-medium text-body-sm flex items-center gap-1"
                          }
                          title={actions.text("Edit Draft")}
                          type="button"
                          aria-label={actions.text("Revise & Resubmit")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[16px]"}
                          >
                            {"refresh"}
                          </span>
                          {actions.text(
                            "\n                  Revise & Resubmit\n                ",
                          )}
                        </button>
                        <button
                          data-action-text={"more_vert"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          type="button"
                          aria-label={actions.text("More actions")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"more_vert"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/50 transition-colors opacity-75"
                    }
                    data-record="row-4"
                    hidden={
                      !actions.matches(
                        "Legacy GeoIP Resolver Deprecated IP geolocation database lookup service. v0.9-beta Geolocation Free Suspended 12 2 months ago visibility support more_vert",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium text-on-surface"}>
                        {actions.text("Legacy GeoIP Resolver")}
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant truncate max-w-xs"
                        }
                      >
                        {actions.text(
                          "Deprecated IP geolocation database lookup service.",
                        )}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-4 font-code-md text-on-surface-variant"
                      }
                    >
                      {actions.text("v0.9-beta")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-blue-50 text-blue-700 font-medium"
                        }
                      >
                        {actions.text("Geolocation")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Free")}
                    </td>
                    <td className={"py-4 px-4"}>
                      <span
                        className={
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md bg-amber-50 text-amber-800 font-medium"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-amber-600"}
                        ></span>
                        {actions.recordText(
                          "row-4",
                          "\n                Suspended\n              ",
                        )}
                      </span>
                    </td>
                    <td className={"py-4 px-4 font-medium text-on-surface"}>
                      {actions.text("12")}
                    </td>
                    <td
                      className={
                        "py-4 px-4 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2 months ago")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-1"}>
                        <button
                          data-action-text={"visibility"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          title={actions.text("View API")}
                          type="button"
                          aria-label={actions.text("View")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"visibility"}
                          </span>
                        </button>
                        <button
                          data-action-text={"support"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          title={actions.text("Appeal Suspension")}
                          type="button"
                          aria-label={actions.text("support")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"support"}
                          </span>
                        </button>
                        <button
                          data-action-text={"more_vert"}
                          className={
                            "p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all"
                          }
                          type="button"
                          aria-label={actions.text("More actions")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
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
                "p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 text-body-sm text-on-surface-variant"
              }
            >
              <div>
                {actions.text("Showing ")}
                <span className={"font-medium text-on-surface"}>
                  {actions.text("1-5")}
                </span>
                {actions.text(" of ")}
                <span className={"font-medium text-on-surface"}>
                  {actions.text("14")}
                </span>
                {actions.text(" APIs")}
              </div>
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"Previous"}
                  className={
                    "px-3 py-1.5 rounded-lg bg-surface-container text-outline cursor-not-allowed"
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
                    "px-3 py-1.5 rounded-lg bg-primary text-on-primary font-medium"
                  }
                  type="button"
                  aria-label={actions.text("1")}
                >
                  {actions.text("1")}
                </button>
                <button
                  data-action-text={"2"}
                  className={
                    "px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                  }
                  type="button"
                  aria-label={actions.text("2")}
                >
                  {actions.text("2")}
                </button>
                <button
                  data-action-text={"3"}
                  className={
                    "px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                  }
                  type="button"
                  aria-label={actions.text("3")}
                >
                  {actions.text("3")}
                </button>
                <button
                  data-action-text={"Next"}
                  className={
                    "px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
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
      </section>
      {actions.overlay}
    </>
  );
}
