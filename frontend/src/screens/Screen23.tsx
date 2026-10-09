import { useScreenActions } from "../features/screen-actions";
export default function Screen23() {
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
              "bg-primary-fixed text-on-primary-fixed px-4 py-2 text-body-sm flex items-center justify-between rounded-xl mb-6 shadow-sm"
            }
          >
            <div className={"flex items-center gap-2"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px]"}
              >
                {"info"}
              </span>
              <span>
                <strong>{actions.text("Simulated Mockup Tool:")}</strong>
                {actions.text(
                  " OpenAPI import, validation, and documentation generation are running in preview mode.",
                )}
              </span>
            </div>
            <span
              className={"text-label-md uppercase tracking-wider opacity-80"}
            >
              {actions.text("API HUB Provider Workspace")}
            </span>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12"}>
            <div className={"lg:col-span-5 flex flex-col gap-6"}>
              <div
                className={
                  "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col gap-4"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <h2
                    className={
                      "font-headline-md text-headline-md text-on-surface flex items-center gap-2"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"upload_file"}
                    </span>
                    {actions.text("\n            OpenAPI Import\n          ")}
                  </h2>
                  <span
                    className={
                      "text-label-md px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-code-sm"
                    }
                  >
                    {actions.text("v3.1.0 / Swagger 2.0")}
                  </span>
                </div>

                <div
                  className={
                    "border-2 border-dashed border-outline-variant hover:border-primary transition-all rounded-xl p-6 flex flex-col items-center justify-center text-center bg-surface cursor-pointer group"
                  }
                >
                  <div
                    className={
                      "w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[24px]"
                      }
                    >
                      {"cloud_upload"}
                    </span>
                  </div>
                  <p
                    className={"font-body-md font-medium text-on-surface mb-1"}
                  >
                    {actions.text("Drag & drop your OpenAPI JSON or YAML file")}
                  </p>
                  <p className={"font-body-sm text-on-surface-variant mb-4"}>
                    {actions.text(
                      "Supports Swagger 2.0, OpenAPI 3.0, and 3.1 specs up to 25MB",
                    )}
                  </p>
                  <button
                    data-action-text={"Browse Files"}
                    className={
                      "bg-primary text-on-primary px-4 py-2 rounded-xl text-body-sm font-medium hover:opacity-90 transition-opacity"
                    }
                    type="button"
                    aria-label={actions.text("Browse Files")}
                  >
                    {actions.text("\n            Browse Files\n          ")}
                  </button>
                </div>

                <div className={"flex flex-col gap-2"}>
                  <label className={"font-label-md text-on-surface-variant"}>
                    {actions.text("Import from URL or Registry")}
                  </label>
                  <div className={"flex gap-2"}>
                    <input
                      data-source-placeholder={
                        "https://api.example.com/openapi.json"
                      }
                      className={
                        "flex-1 bg-surface border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary font-code-md"
                      }
                      placeholder={actions.text(
                        "https://api.example.com/openapi.json",
                      )}
                      type={"text"}
                      aria-label={actions.text(
                        "https://api.example.com/openapi.json",
                      )}
                    />
                    <button
                      data-action-text={"Fetch"}
                      className={
                        "bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-4 py-2 rounded-xl text-body-sm font-medium transition-colors"
                      }
                      type="button"
                      aria-label={actions.text("Fetch")}
                    >
                      {actions.text("\n              Fetch\n            ")}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-high rounded-xl p-3 flex items-center justify-between text-body-sm"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <div
                      className={
                        "w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"
                      }
                    ></div>
                    <span className={"font-medium text-on-surface"}>
                      {actions.text("Parsed successfully: ")}
                      <span className={"font-code-md"}>
                        {actions.text("payment-gateway-v2.yaml")}
                      </span>
                    </span>
                  </div>
                  <span className={"text-on-surface-variant text-label-md"}>
                    {actions.text("14 endpoints detected")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col gap-4"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <h3
                    className={
                      "font-headline-sm text-headline-sm text-on-surface flex items-center gap-2"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-amber-600"}
                    >
                      {"warning"}
                    </span>
                    {actions.text(
                      "\n            Validation Diagnostics\n          ",
                    )}
                  </h3>
                  <span
                    className={
                      "px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-md font-medium"
                    }
                  >
                    {actions.text("1 Warning, 0 Errors")}
                  </span>
                </div>
                <div className={"flex flex-col gap-2"}>
                  <div
                    className={
                      "bg-surface rounded-xl p-3 flex items-start gap-3"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-amber-600 text-[18px] mt-0.5"
                      }
                    >
                      {"info"}
                    </span>
                    <div className={"flex-1 min-w-0"}>
                      <div
                        className={"flex items-center justify-between mb-0.5"}
                      >
                        <span
                          className={"font-code-sm font-medium text-on-surface"}
                        >
                          {actions.text("/v1/charges/{id}")}
                        </span>
                        <span
                          className={"text-label-md text-on-surface-variant"}
                        >
                          {actions.text("Line 142")}
                        </span>
                      </div>
                      <p
                        className={
                          "font-body-sm text-on-surface-variant truncate"
                        }
                      >
                        {actions.text("Missing ")}
                        <code className={"font-code-sm text-primary"}>
                          {"responses.404"}
                        </code>
                        {actions.text(" description definition.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col gap-4 flex-1"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <h3
                    className={
                      "font-headline-sm text-headline-sm text-on-surface flex items-center gap-2"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"account_tree"}
                    </span>
                    {actions.text(
                      "\n            Detected Endpoints (14)\n          ",
                    )}
                  </h3>
                  <div
                    className={
                      "flex items-center gap-1 text-on-surface-variant text-label-md"
                    }
                  >
                    <span>{actions.text("Auth: Bearer JWT")}</span>
                  </div>
                </div>

                <div
                  className={
                    "flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-1"
                  }
                >
                  <div className={"flex flex-col gap-1"}>
                    <div
                      className={
                        "text-label-md uppercase text-on-surface-variant px-2 py-1 font-bold"
                      }
                    >
                      {actions.text("/v1/charges")}
                    </div>
                    <div
                      className={
                        "bg-surface hover:bg-surface-container-high transition-colors rounded-xl p-2.5 flex items-center justify-between cursor-pointer border border-primary/20"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-code-sm font-bold text-[10px]"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                        <span
                          className={
                            "font-code-md text-on-surface text-body-sm"
                          }
                        >
                          {actions.text("/v1/charges")}
                        </span>
                      </div>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-on-surface-variant text-[16px]"
                        }
                      >
                        {"chevron_right"}
                      </span>
                    </div>
                    <div
                      className={
                        "bg-surface hover:bg-surface-container-high transition-colors rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-code-sm font-bold text-[10px]"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                        <span
                          className={
                            "font-code-md text-on-surface text-body-sm"
                          }
                        >
                          {actions.text("/v1/charges")}
                        </span>
                      </div>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-on-surface-variant text-[16px]"
                        }
                      >
                        {"chevron_right"}
                      </span>
                    </div>
                    <div
                      className={
                        "bg-surface hover:bg-surface-container-high transition-colors rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-code-sm font-bold text-[10px]"
                          }
                        >
                          {actions.text("DEL")}
                        </span>
                        <span
                          className={
                            "font-code-md text-on-surface text-body-sm"
                          }
                        >
                          {actions.text("/v1/charges/{id}")}
                        </span>
                      </div>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-on-surface-variant text-[16px]"
                        }
                      >
                        {"chevron_right"}
                      </span>
                    </div>
                  </div>

                  <div className={"flex flex-col gap-1 mt-2"}>
                    <div
                      className={
                        "text-label-md uppercase text-on-surface-variant px-2 py-1 font-bold"
                      }
                    >
                      {actions.text("/v1/subscriptions")}
                    </div>
                    <div
                      className={
                        "bg-surface hover:bg-surface-container-high transition-colors rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-code-sm font-bold text-[10px]"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                        <span
                          className={
                            "font-code-md text-on-surface text-body-sm"
                          }
                        >
                          {actions.text("/v1/subscriptions")}
                        </span>
                      </div>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-on-surface-variant text-[16px]"
                        }
                      >
                        {"chevron_right"}
                      </span>
                    </div>
                    <div
                      className={
                        "bg-surface hover:bg-surface-container-high transition-colors rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-code-sm font-bold text-[10px]"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                        <span
                          className={
                            "font-code-md text-on-surface text-body-sm"
                          }
                        >
                          {actions.text("/v1/subscriptions")}
                        </span>
                      </div>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-on-surface-variant text-[16px]"
                        }
                      >
                        {"chevron_right"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={"lg:col-span-7 flex flex-col gap-6"}>
              <div
                className={
                  "bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col gap-6"
                }
              >
                <div
                  className={
                    "flex items-center justify-between flex-wrap gap-4"
                  }
                >
                  <div>
                    <div className={"flex items-center gap-2 mb-1"}>
                      <h2
                        className={
                          "font-headline-md text-headline-md text-on-surface"
                        }
                      >
                        {actions.text("Payment Gateway API")}
                      </h2>
                      <span
                        className={
                          "px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-md font-medium"
                        }
                      >
                        {actions.text("Standard Spec")}
                      </span>
                    </div>
                    <p className={"font-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Auto-generated developer documentation matching API HUB standard guidelines.",
                      )}
                    </p>
                  </div>
                  <div className={"flex items-center gap-3"}>
                    <button
                      data-action-text={"save Save Draft"}
                      className={
                        "px-4 py-2 rounded-xl border border-outline-variant text-on-surface text-body-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-2"
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
                      {actions.text("\n              Save Draft\n            ")}
                    </button>
                    <button
                      data-action-text={"rocket_launch Publish Documentation"}
                      className={
                        "px-4 py-2 rounded-xl bg-primary text-on-primary text-body-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                      }
                      type="button"
                      aria-label={actions.text("Publish Documentation")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"rocket_launch"}
                      </span>
                      {actions.text(
                        "\n              Publish Documentation\n            ",
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface rounded-xl p-6 border border-outline-variant/50 flex flex-col gap-6"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-outline-variant/30"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-code-md font-bold text-body-sm"
                        }
                      >
                        {actions.text("GET")}
                      </span>
                      <span
                        className={
                          "font-code-md text-on-surface text-headline-sm"
                        }
                      >
                        {actions.text("/v1/charges")}
                      </span>
                    </div>
                    <span
                      className={
                        "text-label-md px-2 py-1 bg-surface-container-high text-on-surface-variant rounded font-code-sm"
                      }
                    >
                      {actions.text("Bearer Token Required")}
                    </span>
                  </div>

                  <div className={"flex flex-col gap-2"}>
                    <h4
                      className={
                        "font-label-md uppercase tracking-wider text-on-surface-variant"
                      }
                    >
                      {actions.text("Description")}
                    </h4>
                    <p className={"font-body-md text-on-surface"}>
                      {actions.text(
                        "Retrieve a list of charges previously created. The charges are returned sorted by creation date, with the most recent charges appearing first.",
                      )}
                    </p>
                  </div>

                  <div className={"flex flex-col gap-3"}>
                    <h4
                      className={
                        "font-label-md uppercase tracking-wider text-on-surface-variant"
                      }
                    >
                      {actions.text("Query Parameters")}
                    </h4>
                    <div className={"grid grid-cols-1 gap-2"}>
                      <div
                        className={
                          "bg-surface-container-low rounded-lg p-3 flex items-center justify-between text-body-sm"
                        }
                      >
                        <div className={"flex items-center gap-2"}>
                          <span
                            className={"font-code-md font-bold text-primary"}
                          >
                            {actions.text("limit")}
                          </span>
                          <span className={"text-label-md text-rose-600"}>
                            {actions.text("optional")}
                          </span>
                        </div>
                        <span
                          className={"font-code-md text-on-surface-variant"}
                        >
                          {actions.text("integer (default: 10, max: 100)")}
                        </span>
                      </div>
                      <div
                        className={
                          "bg-surface-container-low rounded-lg p-3 flex items-center justify-between text-body-sm"
                        }
                      >
                        <div className={"flex items-center gap-2"}>
                          <span
                            className={"font-code-md font-bold text-primary"}
                          >
                            {actions.text("starting_after")}
                          </span>
                          <span className={"text-label-md text-rose-600"}>
                            {actions.text("optional")}
                          </span>
                        </div>
                        <span
                          className={"font-code-md text-on-surface-variant"}
                        >
                          {actions.text("string")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={"flex flex-col gap-3"}>
                    <div className={"flex items-center justify-between"}>
                      <h4
                        className={
                          "font-label-md uppercase tracking-wider text-on-surface-variant"
                        }
                      >
                        {actions.text("Response Schema (200 OK)")}
                      </h4>
                      <div className={"flex items-center gap-2"}>
                        <button
                          data-action-text={"JSON"}
                          className={
                            "text-label-md text-primary font-medium hover:underline"
                          }
                          type="button"
                          aria-label={actions.text("JSON")}
                        >
                          {actions.text("JSON")}
                        </button>
                        <span className={"text-outline-variant"}>
                          {actions.text("|")}
                        </span>
                        <button
                          data-action-text={"YAML"}
                          className={
                            "text-label-md text-on-surface-variant hover:underline"
                          }
                          type="button"
                          aria-label={actions.text("YAML")}
                        >
                          {actions.text("YAML")}
                        </button>
                      </div>
                    </div>

                    <div
                      className={
                        "bg-surface-container-highest rounded-xl p-4 font-code-md text-code-md text-on-surface overflow-x-auto relative"
                      }
                    >
                      <button
                        data-action-text={"content_copy Copy"}
                        className={
                          "absolute top-3 right-3 text-on-surface-variant hover:text-on-surface flex items-center gap-1 bg-surface px-2 py-1 rounded text-label-md"
                        }
                        type="button"
                        aria-label={actions.text("Copy")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"content_copy"}
                        </span>
                        {actions.text("\n                Copy\n              ")}
                      </button>
                      <pre className={"text-on-surface"}>
                        <code>
                          {
                            '{\n  "object": "list",\n  "data": [\n    {\n      "id": "ch_3Mxyz123456789",\n      "object": "charge",\n      "amount": 2000,\n      "currency": "usd",\n      "status": "succeeded",\n      "created": 1672531199\n    }\n  ],\n  "has_more": false\n}'
                          }
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div className={"flex flex-col gap-3 pt-2"}>
                    <h4
                      className={
                        "font-label-md uppercase tracking-wider text-on-surface-variant"
                      }
                    >
                      {actions.text("Try It Out Snippet Generator")}
                    </h4>
                    <div
                      className={
                        "flex items-center gap-2 border-b border-outline-variant/30 pb-2"
                      }
                    >
                      <button
                        data-action-text={"cURL"}
                        className={
                          "px-3 py-1 bg-primary-container text-on-primary-container rounded-lg text-label-md font-medium"
                        }
                        type="button"
                        aria-label={actions.text("cURL")}
                      >
                        {actions.text("cURL")}
                      </button>
                      <button
                        data-action-text={"Node.js"}
                        className={
                          "px-3 py-1 hover:bg-surface-container-high text-on-surface-variant rounded-lg text-label-md font-medium"
                        }
                        type="button"
                        aria-label={actions.text("Node.js")}
                      >
                        {actions.text("Node.js")}
                      </button>
                      <button
                        data-action-text={"Python"}
                        className={
                          "px-3 py-1 hover:bg-surface-container-high text-on-surface-variant rounded-lg text-label-md font-medium"
                        }
                        type="button"
                        aria-label={actions.text("Python")}
                      >
                        {actions.text("Python")}
                      </button>
                      <button
                        data-action-text={"Go"}
                        className={
                          "px-3 py-1 hover:bg-surface-container-high text-on-surface-variant rounded-lg text-label-md font-medium"
                        }
                        type="button"
                        aria-label={actions.text("Go")}
                      >
                        {actions.text("Go")}
                      </button>
                    </div>
                    <div
                      className={
                        "bg-surface-container-highest rounded-xl p-4 font-code-md text-code-md text-on-surface overflow-x-auto relative"
                      }
                    >
                      <pre className={"text-on-surface"}>
                        <code>
                          {
                            'curl -X GET "https://api.example.com/v1/charges?limit=10" \\\n     -H "Authorization: Bearer sk_test_51Nx..." \\\n     -H "Content-Type: application/json"'
                          }
                        </code>
                      </pre>
                    </div>
                  </div>
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
