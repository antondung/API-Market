import { useScreenActions } from "../features/screen-actions";
export default function Screen44() {
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
          <div className={"max-w-[1440px] mx-auto w-full flex min-h-dvh"}>
            <aside
              className={
                "w-[260px] hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-6 py-8 bg-surface-container-low"
              }
            >
              <div className={"flex items-center justify-between mb-6"}>
                <div>
                  <span
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Neural LLM v4")}
                  </span>
                </div>
                <div className={"relative"}>
                  <button
                    data-action-text={"v4.2.0 expand_more"}
                    className={
                      "flex items-center gap-1 px-2 py-1 bg-surface-container-high rounded text-code-sm text-on-surface-variant hover:text-on-surface"
                    }
                    type="button"
                    aria-label={actions.text("v4.2.0")}
                  >
                    {actions.text("\n            v4.2.0\n            ")}
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[14px]"}
                    >
                      {"expand_more"}
                    </span>
                  </button>
                </div>
              </div>

              <div className={"relative mb-6"}>
                <span
                  className={
                    "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"search"}
                  </span>
                </span>
                <input
                  data-source-placeholder={"Search docs..."}
                  className={
                    "w-full pl-9 pr-8 py-1.5 bg-surface rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  }
                  placeholder={actions.text("Search docs...")}
                  type={"text"}
                  aria-label={actions.text("Search docs...")}
                />
                <div
                  className={
                    "absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none"
                  }
                >
                  <kbd
                    className={
                      "px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-code-sm"
                    }
                  >
                    {actions.text("⌘K")}
                  </kbd>
                </div>
              </div>

              <div className={"space-y-6 text-body-sm"}>
                <div>
                  <h4
                    className={
                      "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-2"
                    }
                  >
                    {actions.text("Getting Started")}
                  </h4>
                  <ul className={"space-y-1"}>
                    <li>
                      <a
                        data-action-text={"Overview"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        }
                        href={"#overview"}
                      >
                        {actions.text("Overview")}
                      </a>
                    </li>
                    <li>
                      <a
                        data-action-text={"Authentication"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        }
                        href={"#authentication"}
                      >
                        {actions.text("Authentication")}
                      </a>
                    </li>
                    <li>
                      <a
                        data-action-text={"Quick Start"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        }
                        href={"#quick-start"}
                      >
                        {actions.text("Quick Start")}
                      </a>
                    </li>
                    <li>
                      <a
                        data-action-text={"Errors"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        }
                        href={"#errors"}
                      >
                        {actions.text("Errors")}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4
                    className={
                      "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-2"
                    }
                  >
                    {actions.text("Core Endpoints")}
                  </h4>
                  <ul className={"space-y-1"}>
                    <li>
                      <a
                        data-action-text={"POST /v1/llm/inference"}
                        className={
                          "block px-2 py-1 rounded bg-primary-container text-on-primary-container font-bold flex items-center gap-2"
                        }
                        href={"#inference"}
                      >
                        <span
                          className={
                            "px-1 py-0.5 bg-primary text-on-primary text-[10px] rounded"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                        {actions.text(" /v1/llm/inference")}
                      </a>
                    </li>
                    <li>
                      <a
                        data-action-text={"GET /v1/models"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                        }
                        href={"#models"}
                      >
                        <span
                          className={
                            "px-1 py-0.5 bg-secondary text-on-secondary text-[10px] rounded"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                        {actions.text(" /v1/models")}
                      </a>
                    </li>
                    <li>
                      <a
                        data-action-text={"POST /v1/embeddings"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                        }
                        href={"#embeddings"}
                      >
                        <span
                          className={
                            "px-1 py-0.5 bg-primary text-on-primary text-[10px] rounded"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                        {actions.text(" /v1/embeddings")}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4
                    className={
                      "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-2"
                    }
                  >
                    {actions.text("Management")}
                  </h4>
                  <ul className={"space-y-1"}>
                    <li>
                      <a
                        data-action-text={"Rate Limits"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        }
                        href={"#rate-limits"}
                      >
                        {actions.text("Rate Limits")}
                      </a>
                    </li>
                    <li>
                      <a
                        data-action-text={"Webhooks"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        }
                        href={"#webhooks"}
                      >
                        {actions.text("Webhooks")}
                      </a>
                    </li>
                    <li>
                      <a
                        data-action-text={"Changelog"}
                        className={
                          "block px-2 py-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        }
                        href={"#changelog"}
                      >
                        {actions.text("Changelog")}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>

            <main
              className={
                "flex-1 max-w-[760px] mx-auto px-6 lg:px-12 py-8 min-w-0"
              }
            >
              <nav
                className={
                  "flex items-center gap-2 text-body-sm text-on-surface-variant mb-6"
                }
              >
                <a
                  data-action-text={"Marketplace"}
                  className={"hover:text-on-surface"}
                  href={"#"}
                >
                  {actions.text("Marketplace")}
                </a>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"chevron_right"}
                </span>
                <a
                  data-action-text={"Neural LLM v4"}
                  className={"hover:text-on-surface"}
                  href={"#"}
                >
                  {actions.text("Neural LLM v4")}
                </a>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"chevron_right"}
                </span>
                <span className={"text-on-surface font-bold"}>
                  {actions.text("Documentation")}
                </span>
              </nav>

              <div className={"mb-8"} id={"inference"}>
                <div className={"flex items-center gap-3 mb-3"}>
                  <span
                    className={
                      "px-2.5 py-1 bg-primary text-on-primary text-code-sm font-bold rounded-lg uppercase"
                    }
                  >
                    {actions.text("POST")}
                  </span>
                  <code
                    className={"text-headline-md font-code-md text-on-surface"}
                  >
                    {"/v1/llm/inference"}
                  </code>
                </div>
                <p className={"text-body-lg text-on-surface-variant"}>
                  {actions.text(
                    "\n          Generate high-performance text completions using custom fine-tuning hooks and low-latency transformer stacks.\n        ",
                  )}
                </p>
              </div>

              <div
                className={
                  "p-4 bg-surface-container-high rounded-xl mb-8 flex items-start gap-3"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px] mt-0.5"
                  }
                >
                  {"lock"}
                </span>
                <div>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-1"
                    }
                  >
                    {actions.text("Authentication Required")}
                  </h4>
                  <p className={"text-body-md text-on-surface-variant"}>
                    {actions.text(
                      "Requires Bearer Token in Authorization header. You can obtain your API key from the dashboard settings.",
                    )}
                  </p>
                </div>
              </div>

              <div className={"mb-10"}>
                <h3
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-4"
                  }
                >
                  {actions.text("Parameters")}
                </h3>

                <h4
                  className={
                    "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-3"
                  }
                >
                  {actions.text("Header Parameters")}
                </h4>
                <div
                  className={
                    "bg-surface-container-low rounded-xl p-4 space-y-4 mb-6"
                  }
                >
                  <div
                    className={
                      "flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-outline-variant/30 gap-2"
                    }
                  >
                    <div>
                      <code
                        className={
                          "text-code-md font-code-md text-primary font-bold"
                        }
                      >
                        {"Authorization"}
                      </code>
                      <span
                        className={
                          "ml-2 px-1.5 py-0.5 bg-error-container text-on-error-container text-code-sm rounded"
                        }
                      >
                        {actions.text("Required")}
                      </span>
                    </div>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("string")}
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant -mt-2"}>
                    {actions.text("Format: ")}
                    <code className={"text-code-sm"}>
                      {"Bearer nh_live_xxxxxxxxxxxxxxxx"}
                    </code>
                  </p>
                  <div
                    className={
                      "flex flex-col md:flex-row md:items-center justify-between pt-2 gap-2"
                    }
                  >
                    <div>
                      <code
                        className={
                          "text-code-md font-code-md text-primary font-bold"
                        }
                      >
                        {"Content-Type"}
                      </code>
                      <span
                        className={
                          "ml-2 px-1.5 py-0.5 bg-error-container text-on-error-container text-code-sm rounded"
                        }
                      >
                        {actions.text("Required")}
                      </span>
                    </div>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("string")}
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant -mt-2"}>
                    {actions.text("Must be set to ")}
                    <code className={"text-code-sm"}>{"application/json"}</code>
                    {actions.text(".")}
                  </p>
                </div>

                <h4
                  className={
                    "text-label-md font-label-md uppercase tracking-wider text-on-surface-variant mb-3"
                  }
                >
                  {actions.text("Body Parameters")}
                </h4>
                <div
                  className={
                    "bg-surface-container-low rounded-xl p-4 space-y-6"
                  }
                >
                  <div className={"pb-4 border-b border-outline-variant/30"}>
                    <div className={"flex items-center justify-between mb-1"}>
                      <code
                        className={
                          "text-code-md font-code-md text-primary font-bold"
                        }
                      >
                        {"model"}
                      </code>
                      <span
                        className={
                          "px-1.5 py-0.5 bg-error-container text-on-error-container text-code-sm rounded"
                        }
                      >
                        {actions.text("Required")}
                      </span>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant mb-1"}>
                      {actions.text("ID of the model to use. Use ")}
                      <code className={"text-code-sm"}>
                        {"neural-v4-turbo"}
                      </code>
                      {actions.text(" for standard low-latency processing.")}
                    </p>
                    <span className={"text-code-sm text-secondary"}>
                      {actions.text("Type: string")}
                    </span>
                  </div>
                  <div className={"pb-4 border-b border-outline-variant/30"}>
                    <div className={"flex items-center justify-between mb-1"}>
                      <code
                        className={
                          "text-code-md font-code-md text-primary font-bold"
                        }
                      >
                        {"prompt"}
                      </code>
                      <span
                        className={
                          "px-1.5 py-0.5 bg-error-container text-on-error-container text-code-sm rounded"
                        }
                      >
                        {actions.text("Required")}
                      </span>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant mb-1"}>
                      {actions.text(
                        "The prompt text to generate completions for, up to 8,192 tokens.",
                      )}
                    </p>
                    <span className={"text-code-sm text-secondary"}>
                      {actions.text("Type: string")}
                    </span>
                  </div>
                  <div className={"pb-4 border-b border-outline-variant/30"}>
                    <div className={"flex items-center justify-between mb-1"}>
                      <code
                        className={
                          "text-code-md font-code-md text-primary font-bold"
                        }
                      >
                        {"max_tokens"}
                      </code>
                      <span
                        className={
                          "px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant text-code-sm rounded"
                        }
                      >
                        {actions.text("Optional")}
                      </span>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant mb-1"}>
                      {actions.text(
                        "The maximum number of tokens to generate in the completion. Defaults to 256.",
                      )}
                    </p>
                    <span className={"text-code-sm text-secondary"}>
                      {actions.text("Type: integer")}
                    </span>
                  </div>
                  <div>
                    <div className={"flex items-center justify-between mb-1"}>
                      <code
                        className={
                          "text-code-md font-code-md text-primary font-bold"
                        }
                      >
                        {"temperature"}
                      </code>
                      <span
                        className={
                          "px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant text-code-sm rounded"
                        }
                      >
                        {actions.text("Optional")}
                      </span>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant mb-1"}>
                      {actions.text(
                        "Sampling temperature between 0.0 and 2.0. Higher values make output more random.",
                      )}
                    </p>
                    <span className={"text-code-sm text-secondary"}>
                      {actions.text("Type: number")}
                    </span>
                  </div>
                </div>
              </div>

              <div className={"mb-10"}>
                <h3
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-4"
                  }
                >
                  {actions.text("Request & Response Schemas")}
                </h3>
                <div className={"bg-surface-container-low rounded-xl p-4"}>
                  <p className={"text-body-md text-on-surface-variant mb-4"}>
                    {actions.text(
                      "JSON object payloads must match the strict OpenAPI 3.1 specification schema enforced at the gateway.",
                    )}
                  </p>
                  <div
                    className={
                      "flex items-center gap-4 text-code-sm text-secondary"
                    }
                  >
                    <div className={"flex items-center gap-1"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"data_object"}
                      </span>
                      {actions.text(" Object Properties")}
                    </div>
                    <div className={"flex items-center gap-1"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"check_circle"}
                      </span>
                      {actions.text(" Strict Validation")}
                    </div>
                  </div>
                </div>
              </div>

              <div className={"mb-10"}>
                <h3
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-4"
                  }
                >
                  {actions.text("Example Success Response")}
                </h3>
                <div
                  className={
                    "rounded-xl overflow-hidden bg-[#0B1220] text-surface p-4"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between pb-3 mb-3 border-b border-surface/10"
                    }
                  >
                    <span
                      className={
                        "px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-code-sm font-bold rounded"
                      }
                    >
                      {actions.text("200 OK")}
                    </span>
                    <span className={"text-code-sm text-surface-variant"}>
                      {actions.text("application/json")}
                    </span>
                  </div>
                  <pre
                    className={
                      "text-code-md font-code-md text-surface-bright overflow-x-auto"
                    }
                  >
                    <code>
                      {
                        '{\n  "id": "cmpl-8uV92k1xL9pQ",\n  "object": "text_completion",\n  "created": 1711902840,\n  "model": "neural-v4-turbo",\n  "choices": [\n    {\n      "text": "\\n\\nOptimized compute allocation is verified across all distributed GPU clusters.",\n      "index": 0,\n      "finish_reason": "stop"\n    }\n  ],\n  "usage": {\n    "prompt_tokens": 14,\n    "completion_tokens": 12,\n    "total_tokens": 26\n  }\n}'
                      }
                    </code>
                  </pre>
                </div>
              </div>

              <div className={"mb-12"}>
                <h3
                  className={
                    "text-headline-md font-headline-md text-on-surface mb-4"
                  }
                >
                  {actions.text("Error Codes")}
                </h3>
                <div className={"space-y-3"}>
                  <div
                    className={
                      "p-4 bg-surface-container-low rounded-xl flex items-start gap-4"
                    }
                  >
                    <span
                      className={
                        "px-2 py-0.5 bg-error-container text-on-error-container text-code-sm font-bold rounded mt-0.5"
                      }
                    >
                      {actions.text("400")}
                    </span>
                    <div>
                      <h4
                        className={
                          "text-headline-sm font-headline-sm text-on-surface mb-1"
                        }
                      >
                        {actions.text("Bad Request")}
                      </h4>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "The request payload is malformed or missing required parameters such as ",
                        )}
                        <code className={"text-code-sm"}>{"prompt"}</code>
                        {actions.text(".")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "p-4 bg-surface-container-low rounded-xl flex items-start gap-4"
                    }
                  >
                    <span
                      className={
                        "px-2 py-0.5 bg-error-container text-on-error-container text-code-sm font-bold rounded mt-0.5"
                      }
                    >
                      {actions.text("401")}
                    </span>
                    <div>
                      <h4
                        className={
                          "text-headline-sm font-headline-sm text-on-surface mb-1"
                        }
                      >
                        {actions.text("Unauthorized")}
                      </h4>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Missing or invalid API bearer token supplied in the Authorization header.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "p-4 bg-surface-container-low rounded-xl flex items-start gap-4"
                    }
                  >
                    <span
                      className={
                        "px-2 py-0.5 bg-error-container text-on-error-container text-code-sm font-bold rounded mt-0.5"
                      }
                    >
                      {actions.text("429")}
                    </span>
                    <div>
                      <h4
                        className={
                          "text-headline-sm font-headline-sm text-on-surface mb-1"
                        }
                      >
                        {actions.text("Rate Limit Exceeded")}
                      </h4>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "You have exceeded your current tier requests per minute (RPM) threshold.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "p-4 bg-surface-container-low rounded-xl flex items-start gap-4"
                    }
                  >
                    <span
                      className={
                        "px-2 py-0.5 bg-error-container text-on-error-container text-code-sm font-bold rounded mt-0.5"
                      }
                    >
                      {actions.text("500")}
                    </span>
                    <div>
                      <h4
                        className={
                          "text-headline-sm font-headline-sm text-on-surface mb-1"
                        }
                      >
                        {actions.text("Internal Error")}
                      </h4>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "An unexpected error occurred within the neural inference cluster. Please retry with backoff.",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <aside
              className={
                "w-[380px] hidden xl:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-[#0B1220] flex flex-col justify-between overflow-y-auto"
              }
            >
              <div>
                <div
                  className={
                    "flex items-center justify-between px-4 py-3 bg-[#111c33] border-b border-surface/10"
                  }
                >
                  <div className={"flex items-center gap-2"}>
                    <button
                      data-action-text={"cURL"}
                      className={
                        "px-2.5 py-1 bg-primary text-on-primary rounded text-code-sm font-bold"
                      }
                      type="button"
                      aria-label={actions.text("cURL")}
                    >
                      {actions.text("cURL")}
                    </button>
                    <button
                      data-action-text={"Node.js"}
                      className={
                        "px-2.5 py-1 text-surface-variant hover:text-surface rounded text-code-sm"
                      }
                      type="button"
                      aria-label={actions.text("Node.js")}
                    >
                      {actions.text("Node.js")}
                    </button>
                    <button
                      data-action-text={"Python"}
                      className={
                        "px-2.5 py-1 text-surface-variant hover:text-surface rounded text-code-sm"
                      }
                      type="button"
                      aria-label={actions.text("Python")}
                    >
                      {actions.text("Python")}
                    </button>
                  </div>
                  <button
                    data-action-text={"content_copy"}
                    className={
                      "p-1.5 text-surface-variant hover:text-surface rounded bg-surface/5 hover:bg-surface/10 transition-colors"
                    }
                    title={actions.text("Copy code")}
                    type="button"
                    aria-label={actions.text("Copy")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"content_copy"}
                    </span>
                  </button>
                </div>

                <div className={"p-4"}>
                  <div
                    className={
                      "text-[11px] uppercase tracking-wider text-surface-variant mb-2"
                    }
                  >
                    {actions.text("Request Snippet")}
                  </div>
                  <pre
                    className={
                      "text-code-sm font-code-md text-surface-bright overflow-x-auto leading-relaxed"
                    }
                  >
                    <code>
                      {
                        'curl -X POST https://api.apihub.com/v1/llm/inference \\\n  -H "Authorization: Bearer nh_live_9f8d..." \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "neural-v4-turbo",\n    "prompt": "Explain hyper-dimensional routing in transformer stacks.",\n    "max_tokens": 150,\n    "temperature": 0.7\n  }\''
                      }
                    </code>
                  </pre>
                </div>

                <div className={"p-4 border-t border-surface/10"}>
                  <div
                    className={
                      "text-[11px] uppercase tracking-wider text-surface-variant mb-2"
                    }
                  >
                    {actions.text("Response Preview")}
                  </div>
                  <pre
                    className={
                      "text-code-sm font-code-md text-emerald-400 overflow-x-auto leading-relaxed"
                    }
                  >
                    <code>
                      {
                        '{\n  "id": "cmpl-8uV92k1xL9pQ",\n  "status": "success",\n  "tokens_used": 26\n}'
                      }
                    </code>
                  </pre>
                </div>
              </div>

              <div className={"p-4 border-t border-surface/10 bg-[#111c33]"}>
                <a
                  data-action-text={"terminal Try in Playground"}
                  className={
                    "w-full py-3 bg-primary text-on-primary rounded-lg font-label-md text-body-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
                  }
                  href={"#playground"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"terminal"}
                  </span>
                  {actions.text("\n          Try in Playground\n        ")}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
