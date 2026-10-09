import { useScreenActions } from "../features/screen-actions";
export default function Screen13() {
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
              "bg-surface-container-low px-8 py-6 rounded-2xl shadow-sm mb-8 flex flex-col gap-6"
            }
          >
            <div className={"flex items-center justify-between"}>
              <div>
                <div className={"flex items-center gap-2 mb-1"}>
                  <span
                    className={
                      "px-2 py-0.5 bg-primary-container text-on-primary-container rounded text-label-md font-label-md uppercase tracking-wider"
                    }
                  >
                    {actions.text("Step 2 of 6")}
                  </span>
                  <span className={"text-body-sm text-outline font-code-md"}>
                    {actions.text("PROD-API-GEN-9041")}
                  </span>
                </div>
                <h1
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("OpenAPI Definition & Import")}
                </h1>
              </div>
              <div className={"flex items-center gap-3"}>
                <button
                  data-action-text={"save Save Draft"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-body-md font-medium hover:bg-surface-variant transition-all flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Save Draft")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"save"}
                  </span>
                  {actions.text("\n          Save Draft\n        ")}
                </button>
                <button
                  data-action-text={"Continue arrow_forward"}
                  className={
                    "px-5 py-2 rounded-xl bg-primary text-on-primary text-body-md font-medium hover:bg-primary/90 transition-all shadow-md flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Continue")}
                >
                  {actions.text("\n          Continue\n          ")}
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </button>
              </div>
            </div>

            <div className={"grid grid-cols-6 gap-3"}>
              <div className={"flex flex-col gap-2 cursor-pointer group"}>
                <div
                  className={
                    "flex items-center justify-between text-body-sm font-medium text-on-primary-fixed-variant"
                  }
                >
                  <span className={"flex items-center gap-1.5"}>
                    <span
                      className={
                        "w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px] font-bold"
                      }
                    >
                      {actions.text("✓")}
                    </span>
                    {actions.text(" Basic Info")}
                  </span>
                </div>
                <div className={"h-1.5 w-full bg-primary rounded-full"}></div>
              </div>
              <div className={"flex flex-col gap-2 cursor-pointer group"}>
                <div
                  className={
                    "flex items-center justify-between text-body-sm font-medium text-primary"
                  }
                >
                  <span className={"flex items-center gap-1.5"}>
                    <span
                      className={
                        "w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px] font-bold"
                      }
                    >
                      {actions.text("2")}
                    </span>
                    {actions.text(" OpenAPI Import")}
                  </span>
                </div>
                <div className={"h-1.5 w-full bg-primary rounded-full"}></div>
              </div>
              <div className={"flex flex-col gap-2 opacity-50"}>
                <div
                  className={
                    "flex items-center justify-between text-body-sm font-medium text-on-surface-variant"
                  }
                >
                  <span className={"flex items-center gap-1.5"}>
                    <span
                      className={
                        "w-5 h-5 rounded-full bg-outline-variant text-on-surface flex items-center justify-center text-[11px]"
                      }
                    >
                      {actions.text("3")}
                    </span>
                    {actions.text(" Endpoints")}
                  </span>
                </div>
                <div
                  className={"h-1.5 w-full bg-outline-variant rounded-full"}
                ></div>
              </div>
              <div className={"flex flex-col gap-2 opacity-50"}>
                <div
                  className={
                    "flex items-center justify-between text-body-sm font-medium text-on-surface-variant"
                  }
                >
                  <span className={"flex items-center gap-1.5"}>
                    <span
                      className={
                        "w-5 h-5 rounded-full bg-outline-variant text-on-surface flex items-center justify-center text-[11px]"
                      }
                    >
                      {actions.text("4")}
                    </span>
                    {actions.text(" Pricing")}
                  </span>
                </div>
                <div
                  className={"h-1.5 w-full bg-outline-variant rounded-full"}
                ></div>
              </div>
              <div className={"flex flex-col gap-2 opacity-50"}>
                <div
                  className={
                    "flex items-center justify-between text-body-sm font-medium text-on-surface-variant"
                  }
                >
                  <span className={"flex items-center gap-1.5"}>
                    <span
                      className={
                        "w-5 h-5 rounded-full bg-outline-variant text-on-surface flex items-center justify-center text-[11px]"
                      }
                    >
                      {actions.text("5")}
                    </span>
                    {actions.text(" Compliance")}
                  </span>
                </div>
                <div
                  className={"h-1.5 w-full bg-outline-variant rounded-full"}
                ></div>
              </div>
              <div className={"flex flex-col gap-2 opacity-50"}>
                <div
                  className={
                    "flex items-center justify-between text-body-sm font-medium text-on-surface-variant"
                  }
                >
                  <span className={"flex items-center gap-1.5"}>
                    <span
                      className={
                        "w-5 h-5 rounded-full bg-outline-variant text-on-surface flex items-center justify-center text-[11px]"
                      }
                    >
                      {actions.text("6")}
                    </span>
                    {actions.text(" Review")}
                  </span>
                </div>
                <div
                  className={"h-1.5 w-full bg-outline-variant rounded-full"}
                ></div>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-12 gap-8 mb-12"}>
            <div className={"col-span-7 flex flex-col gap-6"}>
              <div
                className={
                  "bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center border-2 border-dashed border-outline-variant relative group hover:border-primary transition-all cursor-pointer"
                }
              >
                <div
                  className={
                    "w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[32px]"}
                  >
                    {"cloud_upload"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Drag & Drop Swagger / OpenAPI v3.0 File")}
                </h3>
                <p
                  className={
                    "text-body-sm text-on-surface-variant mb-6 text-center max-w-md"
                  }
                >
                  {actions.text(
                    "Supports JSON, YAML, or URL import. Automatically parses paths, parameters, schemas, and security headers.",
                  )}
                </p>
                <div className={"flex items-center gap-3"}>
                  <button
                    data-action-text={"Browse Files"}
                    className={
                      "px-4 py-2 rounded-xl bg-primary text-on-primary text-body-sm font-medium hover:bg-primary/95 shadow-sm transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Browse Files")}
                  >
                    {actions.text("Browse Files")}
                  </button>
                  <button
                    data-action-text={"Import from URL"}
                    className={
                      "px-4 py-2 rounded-xl bg-surface-container-low text-on-surface text-body-sm font-medium hover:bg-surface-container-high transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Import from URL")}
                  >
                    {actions.text("Import from URL")}
                  </button>
                </div>
                <div
                  className={
                    "absolute top-4 right-4 flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full text-label-md font-label-md text-primary"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"verified"}
                  </span>
                  {actions.text(" OAS 3.0.2 Validated\n        ")}
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <div className={"flex items-center gap-3"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"data_object"}
                      </span>
                    </div>
                    <div>
                      <h4
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("payment_gateway_v2.yaml")}
                      </h4>
                      <p className={"text-body-sm text-outline font-code-md"}>
                        {actions.text("4.2 MB • 24 Endpoints detected")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      "px-3 py-1 bg-surface-container-high text-on-surface text-label-md font-label-md rounded-full flex items-center gap-1"
                    }
                  >
                    <span
                      className={
                        "w-2 h-2 rounded-full bg-primary animate-pulse"
                      }
                    ></span>
                    {actions.text(" Parsing Complete\n          ")}
                  </span>
                </div>

                <div className={"space-y-2"}>
                  <div className={"flex justify-between text-body-sm"}>
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Schema validation & component mapping")}
                    </span>
                    <span className={"font-code-md font-semibold text-primary"}>
                      {actions.text("100%")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-surface-container-low h-2 rounded-full overflow-hidden"
                    }
                  >
                    <div
                      className={"bg-primary h-full w-full rounded-full"}
                    ></div>
                  </div>
                </div>
                <div className={"grid grid-cols-3 gap-4 pt-2"}>
                  <div className={"bg-surface-container-low p-3 rounded-xl"}>
                    <div
                      className={
                        "text-label-md text-outline font-label-md uppercase"
                      }
                    >
                      {actions.text("Paths Parsed")}
                    </div>
                    <div
                      className={
                        "text-headline-md font-headline-md text-on-surface"
                      }
                    >
                      {actions.text("24")}
                    </div>
                  </div>
                  <div className={"bg-surface-container-low p-3 rounded-xl"}>
                    <div
                      className={
                        "text-label-md text-outline font-label-md uppercase"
                      }
                    >
                      {actions.text("Data Models")}
                    </div>
                    <div
                      className={
                        "text-headline-md font-headline-md text-on-surface"
                      }
                    >
                      {actions.text("12")}
                    </div>
                  </div>
                  <div className={"bg-surface-container-low p-3 rounded-xl"}>
                    <div
                      className={
                        "text-label-md text-outline font-label-md uppercase"
                      }
                    >
                      {actions.text("Security Schemes")}
                    </div>
                    <div
                      className={
                        "text-headline-md font-headline-md text-on-surface"
                      }
                    >
                      {actions.text("2")}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <div className={"flex items-center gap-2"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"code"}
                    </span>
                    <h4
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Manual Schema Fallback Override")}
                    </h4>
                  </div>
                  <label
                    className={
                      "relative inline-flex items-center cursor-pointer"
                    }
                  >
                    <input
                      className={"sr-only peer"}
                      type={"checkbox"}
                      defaultValue={""}
                      aria-label={actions.text("Input")}
                    />
                    <div
                      className={
                        "w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                      }
                    ></div>
                  </label>
                </div>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Need to tweak inline YAML directly? Toggle the raw code editor mode to fix syntax anomalies before proceeding.",
                  )}
                </p>
                <div
                  className={
                    "bg-surface-container text-on-surface font-code-md text-code-md p-4 rounded-xl overflow-x-auto max-h-48 border border-outline-variant/30"
                  }
                >
                  <pre>
                    <code>
                      {
                        "openapi: 3.0.2\ninfo:\n  title: Enterprise Payment Gateway API\n  version: 2.1.0\npaths:\n  /v2/charges:\n    post:\n      summary: Create a new charge transaction\n      responses:\n        '200':\n          description: Successful transaction response"
                      }
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            <div className={"col-span-5 flex flex-col gap-6"}>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                }
              >
                <div className={"flex items-center justify-between pb-2"}>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface flex items-center gap-2"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"visibility"}
                    </span>
                    {actions.text(
                      "\n            Live Schema Inspector\n          ",
                    )}
                  </h3>
                  <span
                    className={
                      "px-2.5 py-1 bg-surface-container-high text-on-surface rounded-lg text-label-md font-code-md"
                    }
                  >
                    {actions.text("v3.0 JSON")}
                  </span>
                </div>
                <div className={"space-y-3"}>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-primary text-on-primary font-code-md text-code-sm"
                        }
                      >
                        {actions.text("POST")}
                      </span>
                      <span
                        className={"font-code-md text-body-sm text-on-surface"}
                      >
                        {actions.text("/v2/charges")}
                      </span>
                    </div>
                    <span className={"text-label-md text-primary font-medium"}>
                      {actions.text("Valid")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-md text-code-sm"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                      <span
                        className={"font-code-md text-body-sm text-on-surface"}
                      >
                        {actions.text("/v2/charges/{id}")}
                      </span>
                    </div>
                    <span className={"text-label-md text-primary font-medium"}>
                      {actions.text("Valid")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-error-container text-on-error-container font-code-md text-code-sm"
                        }
                      >
                        {actions.text("DEL")}
                      </span>
                      <span
                        className={"font-code-md text-body-sm text-on-surface"}
                      >
                        {actions.text("/v2/refunds/{id}")}
                      </span>
                    </div>
                    <span
                      className={
                        "text-label-md text-error font-medium flex items-center gap-1"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[14px]"}
                      >
                        {"warning"}
                      </span>
                      {actions.text(" Missing Tag")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-3 bg-surface-container-low rounded-xl flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-md text-code-sm"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                      <span
                        className={"font-code-md text-body-sm text-on-surface"}
                      >
                        {actions.text("/v2/balance")}
                      </span>
                    </div>
                    <span className={"text-label-md text-primary font-medium"}>
                      {actions.text("Valid")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "p-4 bg-primary-fixed/30 rounded-xl flex items-start gap-3 mt-2"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[20px] mt-0.5"
                    }
                  >
                    {"lightbulb"}
                  </span>
                  <div className={"text-body-sm text-on-surface-variant"}>
                    <strong
                      className={"text-on-surface block mb-0.5 font-medium"}
                    >
                      {actions.text("Pro-tip for Providers")}
                    </strong>
                    {actions.text(
                      "\n            Ensure all paths include explicit response definitions for 400 and 429 status codes to automatically pass marketplace gateway compliance testing.\n          ",
                    )}
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                }
              >
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Underwriting Readiness")}
                </h3>
                <div className={"space-y-3"}>
                  <div
                    className={"flex items-center justify-between text-body-md"}
                  >
                    <span
                      className={
                        "text-on-surface-variant flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      {actions.text(
                        "\n              OpenAPI Specification Syntax\n            ",
                      )}
                    </span>
                    <span className={"text-primary font-medium"}>
                      {actions.text("Passed")}
                    </span>
                  </div>
                  <div
                    className={"flex items-center justify-between text-body-md"}
                  >
                    <span
                      className={
                        "text-on-surface-variant flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      {actions.text(
                        "\n              Security Scheme Definition\n            ",
                      )}
                    </span>
                    <span className={"text-primary font-medium"}>
                      {actions.text("OAuth2 / Bearer")}
                    </span>
                  </div>
                  <div
                    className={"flex items-center justify-between text-body-md"}
                  >
                    <span
                      className={
                        "text-on-surface-variant flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error text-[18px]"
                        }
                      >
                        {"error"}
                      </span>
                      {actions.text(
                        "\n              Rate Limiting Headers\n            ",
                      )}
                    </span>
                    <span className={"text-error font-medium"}>
                      {actions.text("Review Required")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "pt-4 border-t border-outline-variant/30 flex justify-between items-center"
                  }
                >
                  <button
                    data-action-text={"Back to Step 1"}
                    className={
                      "px-4 py-2 text-body-md font-medium text-on-surface-variant hover:text-on-surface"
                    }
                    type="button"
                    aria-label={actions.text("Back to Step 1")}
                  >
                    {actions.text("Back to Step 1")}
                  </button>
                  <button
                    data-action-text={"Save & Proceed to Step 3"}
                    className={
                      "px-6 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                    }
                    type="button"
                    aria-label={actions.text("Save & Proceed to Step 3")}
                  >
                    {actions.text("Save & Proceed to Step 3")}
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
