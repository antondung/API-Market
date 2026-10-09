import { useScreenActions } from "../features/screen-actions";
export default function Screen9() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-xl"
            }
          >
            <div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("API Keys & Credentials")}
              </h1>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Manage and rotate cryptographic keys securely across your active subscriptions.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"add Generate New API Key"}
                className={
                  "bg-primary hover:bg-primary/90 text-on-primary px-space-md py-2.5 rounded-xl text-body-md font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                }
                type="button"
                aria-label={actions.text("Generate New API Key")}
                data-handler={"openModal('generate-modal')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"add"}
                </span>
                {actions.text("\n        Generate New API Key\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl p-space-md mb-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            }
          >
            <div className={"flex items-center gap-3 flex-1"}>
              <div className={"relative flex-1 max-w-md"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
                  }
                >
                  {"search"}
                </span>
                <input
                  data-source-placeholder={
                    "Search by key name or prefix (e.g. sk_live_...)"
                  }
                  className={
                    "w-full bg-surface-container-low pl-10 pr-4 py-2 rounded-xl text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all"
                  }
                  placeholder={actions.text(
                    "Search by key name or prefix (e.g. sk_live_...)",
                  )}
                  type={"text"}
                  aria-label={actions.text(
                    "Search by key name or prefix (e.g. sk_live_...)",
                  )}
                />
              </div>
              <div
                className={
                  "hidden sm:flex items-center bg-surface-container-low p-1 rounded-xl"
                }
              >
                <button
                  data-action-text={"All"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium bg-surface-container-lowest text-on-surface shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("All")}
                >
                  {actions.text("All")}
                </button>
                <button
                  data-action-text={"Active"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-on-surface"
                  }
                  type="button"
                  aria-label={actions.text("Active")}
                >
                  {actions.text("Active")}
                </button>
                <button
                  data-action-text={"Expired"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-on-surface"
                  }
                  type="button"
                  aria-label={actions.text("Expired")}
                >
                  {actions.text("Expired")}
                </button>
                <button
                  data-action-text={"Revoked"}
                  className={
                    "px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:text-on-surface"
                  }
                  type="button"
                  aria-label={actions.text("Revoked")}
                >
                  {actions.text("Revoked")}
                </button>
              </div>
            </div>
            <div className={"flex items-center gap-3"}>
              <select
                className={
                  "bg-surface-container-low text-on-surface text-body-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
                }
                aria-label={actions.text("Input")}
              >
                <option value={"All Environments"}>
                  {actions.text("All Environments")}
                </option>
                <option value={"Production"}>
                  {actions.text("Production")}
                </option>
                <option value={"Sandbox"}>{actions.text("Sandbox")}</option>
              </select>
              <button
                data-action-text={"filter_list More Filters"}
                className={
                  "flex items-center gap-2 bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-2 rounded-xl text-body-sm font-medium transition-all cursor-pointer"
                }
                type="button"
                aria-label={actions.text("More Filters")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"filter_list"}
                </span>
                {actions.text("\n        More Filters\n      ")}
              </button>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"
            }
          >
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low/50 text-on-surface-variant text-label-md uppercase tracking-wider"
                    }
                  >
                    <th className={"py-3 px-6"}>
                      {actions.text("API & Key Name")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Prefix / Identifier")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Subscription")}
                    </th>
                    <th className={"py-3 px-6"}>{actions.text("Created")}</th>
                    <th className={"py-3 px-6"}>{actions.text("Last Used")}</th>
                    <th className={"py-3 px-6"}>{actions.text("Status")}</th>
                    <th className={"py-3 px-6 text-right"}>
                      {actions.text("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "divide-y divide-outline-variant/10 text-body-md text-on-surface"
                  }
                >
                  <tr
                    className={
                      "hover:bg-surface-container-low/30 transition-colors"
                    }
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "Neural LLM v4 Production Master Key demo_key_hidden...x41a Enterprise Tier Oct 12, 2024 2 mins ago Active content_copy sync block",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium"}>
                        {actions.text("Neural LLM v4")}
                      </div>
                      <div className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Production Master Key")}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-md text-on-surface-variant bg-surface-container-low/40 px-2 py-1 rounded w-fit"
                      }
                    >
                      {actions.text(
                        "\n              demo_key_hidden...x41a\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md bg-secondary-fixed text-on-secondary-fixed"
                        }
                      >
                        {actions.text("Enterprise Tier")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Oct 12, 2024")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("2 mins ago")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md font-medium bg-emerald-500/10 text-emerald-700"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.recordText("row-0", " Active\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-2"}>
                        <button
                          data-action-text={"content_copy"}
                          className={
                            "p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          }
                          title={actions.text("Copy Prefix")}
                          type="button"
                          aria-label={actions.text("Copy")}
                          data-handler={
                            "copyToClipboard('demo_key_hidden3a7b4c91d8e2f3a4b5c6d7e8f9a0x41a')"
                          }
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"content_copy"}
                          </span>
                        </button>
                        <button
                          data-action-text={"sync"}
                          className={
                            "p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          }
                          title={actions.text("Rotate Key")}
                          type="button"
                          aria-label={actions.text("sync")}
                          data-handler={"openModal('rotate-modal')"}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"sync"}
                          </span>
                        </button>
                        <button
                          data-action-text={"block"}
                          className={
                            "p-1.5 hover:bg-error-container/40 rounded-lg text-error transition-colors cursor-pointer"
                          }
                          title={actions.text("Revoke Key")}
                          type="button"
                          aria-label={actions.text("block")}
                          data-handler={"openModal('revoke-modal')"}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"block"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/30 transition-colors"
                    }
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "VectorDB Analytics Sandbox Testing Key demo_key_hidden...99bc Developer Tier Nov 01, 2024 3 hours ago Active content_copy sync block",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium"}>
                        {actions.text("VectorDB Analytics")}
                      </div>
                      <div className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Sandbox Testing Key")}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-md text-on-surface-variant bg-surface-container-low/40 px-2 py-1 rounded w-fit"
                      }
                    >
                      {actions.text(
                        "\n              demo_key_hidden...99bc\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md bg-surface-container text-on-surface-variant"
                        }
                      >
                        {actions.text("Developer Tier")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Nov 01, 2024")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("3 hours ago")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md font-medium bg-emerald-500/10 text-emerald-700"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.recordText("row-1", " Active\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-2"}>
                        <button
                          data-action-text={"content_copy"}
                          className={
                            "p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          }
                          title={actions.text("Copy Prefix")}
                          type="button"
                          aria-label={actions.text("Copy")}
                          data-handler={
                            "copyToClipboard('demo_key_hidden...99bc')"
                          }
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"content_copy"}
                          </span>
                        </button>
                        <button
                          data-action-text={"sync"}
                          className={
                            "p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          }
                          title={actions.text("Rotate Key")}
                          type="button"
                          aria-label={actions.text("sync")}
                          data-handler={"openModal('rotate-modal')"}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"sync"}
                          </span>
                        </button>
                        <button
                          data-action-text={"block"}
                          className={
                            "p-1.5 hover:bg-error-container/40 rounded-lg text-error transition-colors cursor-pointer"
                          }
                          title={actions.text("Revoke Key")}
                          type="button"
                          aria-label={actions.text("block")}
                          data-handler={"openModal('revoke-modal')"}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"block"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/30 transition-colors"
                    }
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "CodeGen Model v2 CI/CD Pipeline Integration demo_key_hidden...8b2d Enterprise Tier Sep 15, 2024 1 day ago Rotating content_copy sync block",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium"}>
                        {actions.text("CodeGen Model v2")}
                      </div>
                      <div className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("CI/CD Pipeline Integration")}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-md text-on-surface-variant bg-surface-container-low/40 px-2 py-1 rounded w-fit"
                      }
                    >
                      {actions.text(
                        "\n              demo_key_hidden...8b2d\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md bg-secondary-fixed text-on-secondary-fixed"
                        }
                      >
                        {actions.text("Enterprise Tier")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Sep 15, 2024")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("1 day ago")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md font-medium bg-amber-500/10 text-amber-700"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-amber-500"}
                        ></span>
                        {actions.text(" Rotating\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-2"}>
                        <button
                          data-action-text={"content_copy"}
                          className={
                            "p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          }
                          title={actions.text("Copy Prefix")}
                          type="button"
                          aria-label={actions.text("Copy")}
                          data-handler={
                            "copyToClipboard('demo_key_hidden...8b2d')"
                          }
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"content_copy"}
                          </span>
                        </button>
                        <button
                          data-action-text={"sync"}
                          className={
                            "p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          }
                          title={actions.text("Rotate Key")}
                          type="button"
                          aria-label={actions.text("sync")}
                          data-handler={"openModal('rotate-modal')"}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"sync"}
                          </span>
                        </button>
                        <button
                          data-action-text={"block"}
                          className={
                            "p-1.5 hover:bg-error-container/40 rounded-lg text-error transition-colors cursor-pointer"
                          }
                          title={actions.text("Revoke Key")}
                          type="button"
                          aria-label={actions.text("block")}
                          data-handler={"openModal('revoke-modal')"}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"block"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr
                    className={
                      "hover:bg-surface-container-low/30 transition-colors opacity-60"
                    }
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "Vision AI OCR Legacy Microservice demo_key_hidden...001a Pro Tier Aug 10, 2024 45 days ago Revoked content_copy sync block",
                      )
                    }
                  >
                    <td className={"py-4 px-6"}>
                      <div className={"font-medium line-through"}>
                        {actions.text("Vision AI OCR")}
                      </div>
                      <div className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Legacy Microservice")}
                      </div>
                    </td>
                    <td
                      className={
                        "py-4 px-6 font-code-md text-on-surface-variant bg-surface-container-low/40 px-2 py-1 rounded w-fit"
                      }
                    >
                      {actions.text(
                        "\n              demo_key_hidden...001a\n            ",
                      )}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md bg-surface-container text-on-surface-variant"
                        }
                      >
                        {actions.text("Pro Tier")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("Aug 10, 2024")}
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-on-surface-variant text-body-sm"
                      }
                    >
                      {actions.text("45 days ago")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md font-medium bg-error-container/50 text-on-error-container"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-error"}
                        ></span>
                        {actions.text(" Revoked\n              ")}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-2"}>
                        <button
                          data-action-text={"content_copy"}
                          className={
                            "p-1.5 opacity-40 cursor-not-allowed rounded-lg text-on-surface-variant"
                          }
                          disabled={true}
                          title={actions.text("Revoked")}
                          type="button"
                          aria-label={actions.text("Copy")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"content_copy"}
                          </span>
                        </button>
                        <button
                          data-action-text={"sync"}
                          className={
                            "p-1.5 opacity-40 cursor-not-allowed rounded-lg text-on-surface-variant"
                          }
                          disabled={true}
                          type="button"
                          aria-label={actions.text("sync")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"sync"}
                          </span>
                        </button>
                        <button
                          data-action-text={"block"}
                          className={
                            "p-1.5 opacity-40 cursor-not-allowed rounded-lg text-on-surface-variant"
                          }
                          disabled={true}
                          type="button"
                          aria-label={actions.text("block")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"block"}
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
                "px-6 py-4 bg-surface-container-low/30 flex items-center justify-between text-body-sm text-on-surface-variant"
              }
            >
              <span>{actions.text("Showing 4 of 12 active keys")}</span>
              <div className={"flex items-center gap-2"}>
                <button
                  data-action-text={"Previous"}
                  className={
                    "px-3 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Previous")}
                >
                  {actions.text("Previous")}
                </button>
                <button
                  data-action-text={"1"}
                  className={
                    "px-3 py-1 rounded-lg bg-primary text-on-primary font-medium"
                  }
                  type="button"
                  aria-label={actions.text("1")}
                >
                  {actions.text("1")}
                </button>
                <button
                  data-action-text={"2"}
                  className={
                    "px-3 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("2")}
                >
                  {actions.text("2")}
                </button>
                <button
                  data-action-text={"Next"}
                  className={
                    "px-3 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
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
            className={
              "bg-surface-container-low rounded-xl p-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
            }
          >
            <div className={"flex items-start gap-4"}>
              <div
                className={
                  "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-0.5"
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
                    "text-headline-sm text-on-surface font-headline-sm"
                  }
                >
                  {actions.text("Cryptographic Security Notice")}
                </h4>
                <p
                  className={
                    "text-body-md text-on-surface-variant mt-1 max-w-3xl"
                  }
                >
                  {actions.text(
                    "\n          Never display full API keys in public repositories, client-side applications, or application logs. Masked key prefixes are displayed for auditing purposes. Rotate compromised keys immediately via the rotation workflow.\n        ",
                  )}
                </p>
              </div>
            </div>
            <a
              data-action-text={"Read Best Practices arrow_forward"}
              className={
                "text-primary hover:underline text-body-md font-medium shrink-0 flex items-center gap-1"
              }
              href={"#"}
            >
              {actions.text("\n      Read Best Practices ")}
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[16px]"}
              >
                {"arrow_forward"}
              </span>
            </a>
          </div>

          <div
            id={"generate-modal"}
            className={
              actions.visible("generate-modal", false)
                ? "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
                : "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl animate-in fade-in zoom-in duration-200"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <h3
                  className={
                    "text-headline-md text-on-surface font-headline-md"
                  }
                >
                  {actions.text("Generate New API Key")}
                </h3>
                <button
                  data-action-text={"close"}
                  className={
                    "text-on-surface-variant hover:text-on-surface cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeModal('generate-modal')"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>
              <div className={"space-y-4"}>
                <div>
                  <label
                    className={
                      "block text-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                    }
                  >
                    {actions.text("1. Select Subscription / API")}
                  </label>
                  <select
                    className={
                      "w-full bg-surface-container-low text-on-surface text-body-md px-3 py-2.5 rounded-xl outline-none border border-outline-variant/30"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"Neural LLM v4 (Enterprise Tier)"}>
                      {actions.text("Neural LLM v4 (Enterprise Tier)")}
                    </option>
                    <option value={"VectorDB Analytics (Developer Tier)"}>
                      {actions.text("VectorDB Analytics (Developer Tier)")}
                    </option>
                    <option value={"CodeGen Model v2 (Enterprise Tier)"}>
                      {actions.text("CodeGen Model v2 (Enterprise Tier)")}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                    }
                  >
                    {actions.text("2. Key Name / Description")}
                  </label>
                  <input
                    data-source-placeholder={"e.g. Staging Backend Server #2"}
                    className={
                      "w-full bg-surface-container-low text-on-surface text-body-md px-3 py-2.5 rounded-xl outline-none border border-outline-variant/30"
                    }
                    placeholder={actions.text("e.g. Staging Backend Server #2")}
                    type={"text"}
                    aria-label={actions.text("e.g. Staging Backend Server #2")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                    }
                  >
                    {actions.text("3. Environment")}
                  </label>
                  <div className={"grid grid-cols-2 gap-3"}>
                    <label
                      className={
                        "flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-primary cursor-pointer"
                      }
                    >
                      <input
                        defaultChecked={true}
                        className={"text-primary"}
                        name={"env"}
                        type={"radio"}
                        aria-label={actions.text("env")}
                      />
                      <span
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Production")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 cursor-pointer"
                      }
                    >
                      <input
                        className={"text-primary"}
                        name={"env"}
                        type={"radio"}
                        aria-label={actions.text("env")}
                      />
                      <span
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Sandbox")}
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label
                    className={
                      "block text-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                    }
                  >
                    {actions.text("4. Expiration (Optional)")}
                  </label>
                  <select
                    className={
                      "w-full bg-surface-container-low text-on-surface text-body-md px-3 py-2.5 rounded-xl outline-none border border-outline-variant/30"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"Never Expire"}>
                      {actions.text("Never Expire")}
                    </option>
                    <option value={"30 Days"}>{actions.text("30 Days")}</option>
                    <option value={"90 Days"}>{actions.text("90 Days")}</option>
                    <option value={"1 Year"}>{actions.text("1 Year")}</option>
                  </select>
                </div>
              </div>
              <div
                className={
                  "flex items-center justify-end gap-3 mt-space-xl pt-4 border-t border-outline-variant/10"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-4 py-2 rounded-xl text-body-md text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeModal('generate-modal')"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Generate Key"}
                  className={
                    "bg-primary hover:bg-primary/90 text-on-primary px-5 py-2 rounded-xl text-body-md font-medium transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Generate Key")}
                  data-handler={"switchToRevealModal()"}
                >
                  {actions.text("Generate Key")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"reveal-modal"}
            className={
              actions.visible("reveal-modal", false)
                ? "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
                : "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl animate-in fade-in zoom-in duration-200"
              }
            >
              <div className={"flex items-center justify-between mb-space-md"}>
                <div className={"flex items-center gap-2 text-primary"}>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"vpn_key"}
                  </span>
                  <h3
                    className={
                      "text-headline-md text-on-surface font-headline-md"
                    }
                  >
                    {actions.text("Save Your API Key")}
                  </h3>
                </div>
                <button
                  data-action-text={"close"}
                  className={
                    "text-on-surface-variant hover:text-on-surface cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeModal('reveal-modal')"}
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
                className={
                  "bg-amber-500/10 text-amber-900 p-4 rounded-xl text-body-sm mb-4 flex items-start gap-3"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5"
                  }
                >
                  {"warning"}
                </span>
                <p>
                  <strong>
                    {actions.text("This key will only be shown once.")}
                  </strong>
                  {actions.text(
                    " If you lose it, you must generate a new one. The full secret cannot be retrieved from the dashboard again.",
                  )}
                </p>
              </div>
              <div className={"mb-4"}>
                <label
                  className={
                    "block text-label-md text-on-surface-variant uppercase tracking-wider mb-1"
                  }
                >
                  {actions.text("Your Secret Key")}
                </label>
                <div
                  className={
                    "flex items-center gap-2 bg-surface-container-low p-3 rounded-xl border border-outline-variant/30"
                  }
                >
                  <input
                    className={
                      "w-full bg-transparent font-code-md text-on-surface outline-none select-all"
                    }
                    id={"full-key-input"}
                    readOnly={true}
                    type={"text"}
                    defaultValue={
                      "demo_key_hidden3a7b4c91d8e2f3a4b5c6d7e8f9a0x41a"
                    }
                  />
                  <button
                    data-action-text={"content_copy Copy"}
                    className={
                      "bg-primary hover:bg-primary/90 text-on-primary px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                    }
                    type="button"
                    aria-label={actions.text("Copy")}
                    data-handler={"copyFullKey()"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"content_copy"}
                    </span>
                    {actions.text(" Copy\n          ")}
                  </button>
                </div>
              </div>
              <div className={"flex items-center gap-3 pt-2"}>
                <input
                  className={"w-4 h-4 rounded text-primary cursor-pointer"}
                  id={"confirm-saved"}
                  type={"checkbox"}
                />
                <label
                  className={
                    "text-body-sm text-on-surface cursor-pointer font-medium"
                  }
                  htmlFor={"confirm-saved"}
                >
                  {actions.text(
                    "I have safely stored this key in a secure location (e.g., vault or env variable).",
                  )}
                </label>
              </div>
              <div
                className={
                  "flex items-center justify-end gap-3 mt-space-xl pt-4 border-t border-outline-variant/10"
                }
              >
                <button
                  data-action-text={"Done & Close"}
                  className={
                    "bg-primary hover:bg-primary/90 text-on-primary px-5 py-2 rounded-xl text-body-md font-medium transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Done & Close")}
                  data-handler={"closeModal('reveal-modal')"}
                >
                  {actions.text("Done & Close")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"rotate-modal"}
            className={
              actions.visible("rotate-modal", false)
                ? "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
                : "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-xl animate-in fade-in zoom-in duration-200"
              }
            >
              <div
                className={"flex items-center gap-3 mb-space-md text-primary"}
              >
                <div
                  className={
                    "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"sync"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-md text-on-surface font-headline-md"
                  }
                >
                  {actions.text("Rotate API Key?")}
                </h3>
              </div>
              <p className={"text-body-md text-on-surface-variant mb-6"}>
                {actions.text(
                  "\n        Rotating this key will generate a new secret immediately. The current key will remain valid in a ",
                )}
                <span className={"text-on-surface font-medium"}>
                  {actions.text("Rotating")}
                </span>
                {actions.text(
                  " state for 24 hours to allow seamless token updates across your application deployments.\n      ",
                )}
              </p>
              <div
                className={
                  "flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/10"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-4 py-2 rounded-xl text-body-md text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeModal('rotate-modal')"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Confirm Rotation"}
                  className={
                    "bg-primary hover:bg-primary/90 text-on-primary px-5 py-2 rounded-xl text-body-md font-medium transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Confirm Rotation")}
                  data-handler={
                    "closeModal('rotate-modal'); openModal('reveal-modal');"
                  }
                >
                  {actions.text("Confirm Rotation")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"revoke-modal"}
            className={
              actions.visible("revoke-modal", false)
                ? "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
                : "fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-xl animate-in fade-in zoom-in duration-200"
              }
            >
              <div className={"flex items-center gap-3 mb-space-md text-error"}>
                <div
                  className={
                    "w-10 h-10 rounded-full bg-error-container flex items-center justify-center"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"block"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-md text-on-surface font-headline-md"
                  }
                >
                  {actions.text("Revoke API Key")}
                </h3>
              </div>
              <p className={"text-body-md text-on-surface-variant mb-6"}>
                {actions.text(
                  "\n        Are you absolutely sure you want to revoke ",
                )}
                <span className={"text-on-surface font-code-md"}>
                  {actions.text("demo_key_hidden...x41a")}
                </span>
                {actions.text("? This action is ")}
                <strong className={"text-error"}>
                  {actions.text("immediate and irreversible")}
                </strong>
                {actions.text(
                  ", and any downstream services relying on this key will experience service interruption.\n      ",
                )}
              </p>
              <div
                className={
                  "flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/10"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-4 py-2 rounded-xl text-body-md text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeModal('revoke-modal')"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Yes, Revoke Key"}
                  className={
                    "bg-error hover:bg-error/90 text-on-error px-5 py-2 rounded-xl text-body-md font-medium transition-all cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Yes, Revoke Key")}
                  data-handler={"closeModal('revoke-modal')"}
                >
                  {actions.text("Yes, Revoke Key")}
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
