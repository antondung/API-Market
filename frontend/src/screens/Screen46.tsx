import { useScreenActions } from "../features/screen-actions";
export default function Screen46() {
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
          <div className={"w-full max-w-7xl mx-auto px-6 lg:px-12 py-8"}>
            <nav
              className={
                "flex items-center gap-2 text-body-sm text-on-surface-variant mb-6"
              }
            >
              <a
                data-action-text={"Marketplace"}
                className={"hover:text-on-surface transition-colors"}
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
                data-action-text={"AI & Machine Learning"}
                className={"hover:text-on-surface transition-colors"}
                href={"#"}
              >
                {actions.text("AI & Machine Learning")}
              </a>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[14px]"}
              >
                {"chevron_right"}
              </span>
              <span className={"text-on-surface font-label-md"}>
                {actions.text("Neural LLM v4")}
              </span>
            </nav>

            <div
              className={
                "flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-surface-container-lowest p-8 rounded-xl shadow-sm"
              }
            >
              <div className={"flex items-start gap-5"}>
                <div
                  className={
                    "w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center shrink-0 shadow-md"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-primary text-[32px]"
                    }
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {"neurology"}
                  </span>
                </div>
                <div>
                  <div className={"flex flex-wrap items-center gap-3 mb-2"}>
                    <h1
                      className={
                        "text-headline-lg font-headline-lg text-on-surface"
                      }
                    >
                      {actions.text("Neural LLM v4")}
                    </h1>
                    <span
                      className={
                        "inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-label-md"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[14px]"}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {"verified"}
                      </span>
                      {actions.text(" Verified\n            ")}
                    </span>
                    <span
                      className={
                        "bg-surface-container-high text-on-surface px-2 py-0.5 rounded text-code-sm font-code-sm"
                      }
                    >
                      {actions.text("v4.2.0")}
                    </span>
                    <span
                      className={
                        "bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-label-md flex items-center gap-1"
                      }
                    >
                      <span
                        className={"w-2 h-2 rounded-full bg-emerald-500"}
                      ></span>
                      {actions.text(
                        " Active & Operational (99.99% Uptime)\n            ",
                      )}
                    </span>
                  </div>
                  <div
                    className={
                      "flex flex-wrap items-center gap-4 text-body-md text-on-surface-variant"
                    }
                  >
                    <span
                      className={
                        "flex items-center gap-1 text-on-surface font-label-md"
                      }
                    >
                      {actions.text(
                        "\n              by DeepMatrix AI \n              ",
                      )}
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[16px] text-primary"
                        }
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {"workspace_premium"}
                      </span>
                    </span>
                    <span>{actions.text("•")}</span>
                    <span
                      className={
                        "bg-surface-container px-2.5 py-0.5 rounded text-label-md text-on-surface"
                      }
                    >
                      {actions.text("AI & Machine Learning")}
                    </span>
                    <span>{actions.text("•")}</span>
                    <span className={"text-primary font-label-md"}>
                      {actions.text("Paid Tier ($0.002 / 1k tokens)")}
                    </span>
                  </div>
                </div>
              </div>

              <div className={"flex flex-wrap items-center gap-3"}>
                <button
                  data-action-text={"play_arrow Try API"}
                  className={
                    "px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Try API")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"play_arrow"}
                  </span>
                  {actions.text(" Try API\n        ")}
                </button>
                <button
                  data-action-text={"code Documentation"}
                  className={
                    "px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant/50 rounded-lg text-body-md font-label-md hover:bg-surface-container-low transition-all flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Documentation")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"code"}
                  </span>
                  {actions.text(" Documentation\n        ")}
                </button>
                <button
                  data-action-text={"View Plans"}
                  className={
                    "px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant/50 rounded-lg text-body-md font-label-md hover:bg-surface-container-low transition-all"
                  }
                  type="button"
                  aria-label={actions.text("View Plans")}
                >
                  {actions.text("\n          View Plans\n        ")}
                </button>
                <button
                  data-action-text={"bookmark"}
                  className={
                    "p-2.5 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/50 rounded-lg transition-all"
                  }
                  title={actions.text("Bookmark")}
                  type="button"
                  aria-label={actions.text("bookmark")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[20px]"}
                  >
                    {"bookmark"}
                  </span>
                </button>
                <button
                  data-action-text={"flag"}
                  className={
                    "p-2.5 bg-surface-container-lowest text-on-surface-variant hover:text-error border border-outline-variant/50 rounded-lg transition-all"
                  }
                  title={actions.text("Report API")}
                  type="button"
                  aria-label={actions.text("flag")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[20px]"}
                  >
                    {"flag"}
                  </span>
                </button>
              </div>
            </div>

            <div
              className={
                "flex items-center gap-8 border-b border-outline-variant/30 mb-8 overflow-x-auto"
              }
            >
              <a
                data-action-text={"Overview"}
                className={
                  "pb-3 text-body-md font-label-md text-primary border-b-2 border-primary"
                }
                href={"#"}
              >
                {actions.text("Overview")}
              </a>
              <a
                data-action-text={"Documentation"}
                className={
                  "pb-3 text-body-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                }
                href={"#"}
              >
                {actions.text("Documentation")}
              </a>
              <a
                data-action-text={"Playground"}
                className={
                  "pb-3 text-body-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                }
                href={"#"}
              >
                {actions.text("Playground")}
              </a>
              <a
                data-action-text={"Pricing"}
                className={
                  "pb-3 text-body-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                }
                href={"#"}
              >
                {actions.text("Pricing")}
              </a>
              <a
                data-action-text={"Versions 3"}
                className={
                  "pb-3 text-body-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
                }
                href={"#"}
              >
                {actions.text("Versions ")}
                <span
                  className={
                    "bg-surface-container px-1.5 py-0.2 rounded text-[11px]"
                  }
                >
                  {actions.text("3")}
                </span>
              </a>
              <a
                data-action-text={"Provider"}
                className={
                  "pb-3 text-body-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                }
                href={"#"}
              >
                {actions.text("Provider")}
              </a>
            </div>

            <div className={"grid grid-cols-1 lg:grid-cols-3 gap-8"}>
              <div className={"lg:col-span-2 space-y-8"}>
                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl shadow-sm"
                  }
                >
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface mb-4"
                    }
                  >
                    {actions.text("Overview & Capabilities")}
                  </h2>
                  <p
                    className={
                      "text-body-lg text-on-surface-variant mb-6 leading-relaxed"
                    }
                  >
                    {actions.text(
                      "\n            High-performance transformer execution engine with custom fine-tuning hooks, sub-50ms latency across 40+ global edge locations. Designed for enterprise-grade workloads demanding absolute reliability and scale.\n          ",
                    )}
                  </p>
                  <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    <div
                      className={
                        "flex items-start gap-3 p-4 bg-surface-container-low rounded-lg"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[20px] mt-0.5"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <div>
                        <h3
                          className={
                            "text-body-md font-label-md text-on-surface mb-1"
                          }
                        >
                          {actions.text("Streaming SSE Support")}
                        </h3>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Real-time token streaming with ultra-low time-to-first-token.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        "flex items-start gap-3 p-4 bg-surface-container-low rounded-lg"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[20px] mt-0.5"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <div>
                        <h3
                          className={
                            "text-body-md font-label-md text-on-surface mb-1"
                          }
                        >
                          {actions.text("Function Calling")}
                        </h3>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Native JSON schema validation and structured tool output.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        "flex items-start gap-3 p-4 bg-surface-container-low rounded-lg"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[20px] mt-0.5"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <div>
                        <h3
                          className={
                            "text-body-md font-label-md text-on-surface mb-1"
                          }
                        >
                          {actions.text("Automatic Failover")}
                        </h3>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Multi-region redundancy with zero dropped connections.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        "flex items-start gap-3 p-4 bg-surface-container-low rounded-lg"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[20px] mt-0.5"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <div>
                        <h3
                          className={
                            "text-body-md font-label-md text-on-surface mb-1"
                          }
                        >
                          {actions.text("On-Premise Bridge")}
                        </h3>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Hybrid deployment mode for strict data residency requirements.",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl shadow-sm"
                  }
                >
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface mb-4"
                    }
                  >
                    {actions.text("Use Cases & Integration")}
                  </h2>
                  <div className={"grid grid-cols-2 md:grid-cols-4 gap-4"}>
                    <div
                      className={
                        "p-4 bg-surface-container-low rounded-lg text-center"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[32px] mb-2"
                        }
                      >
                        {"smart_toy"}
                      </span>
                      <h3
                        className={
                          "text-body-md font-label-md text-on-surface mb-1"
                        }
                      >
                        {actions.text("Enterprise Chatbots")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Context-aware support")}
                      </p>
                    </div>
                    <div
                      className={
                        "p-4 bg-surface-container-low rounded-lg text-center"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[32px] mb-2"
                        }
                      >
                        {"hub"}
                      </span>
                      <h3
                        className={
                          "text-body-md font-label-md text-on-surface mb-1"
                        }
                      >
                        {actions.text("Autonomous Agents")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Complex multi-step workflows")}
                      </p>
                    </div>
                    <div
                      className={
                        "p-4 bg-surface-container-low rounded-lg text-center"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[32px] mb-2"
                        }
                      >
                        {"description"}
                      </span>
                      <h3
                        className={
                          "text-body-md font-label-md text-on-surface mb-1"
                        }
                      >
                        {actions.text("Summarization")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Real-time document digest")}
                      </p>
                    </div>
                    <div
                      className={
                        "p-4 bg-surface-container-low rounded-lg text-center"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[32px] mb-2"
                        }
                      >
                        {"code"}
                      </span>
                      <h3
                        className={
                          "text-body-md font-label-md text-on-surface mb-1"
                        }
                      >
                        {actions.text("Code Assistants")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Inline autocomplete & gen")}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-6"
                  }
                >
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Authentication & Endpoint")}
                  </h2>
                  <div className={"space-y-4"}>
                    <div>
                      <label
                        className={
                          "text-label-md font-label-md uppercase text-on-surface-variant block mb-1"
                        }
                      >
                        {actions.text("Authentication Method")}
                      </label>
                      <div
                        className={
                          "p-3 bg-surface-container-low rounded-lg text-code-md font-code-md text-on-surface flex items-center justify-between"
                        }
                      >
                        <span>
                          {actions.text("Bearer Token (")}
                          <span className={"text-primary"}>
                            {actions.text("Authorization: Bearer <token>")}
                          </span>
                          {actions.text(")")}
                        </span>
                        <button
                          data-action-text={"Copy Scheme"}
                          className={
                            "text-primary hover:underline text-body-sm"
                          }
                          type="button"
                          aria-label={actions.text("Copy Scheme")}
                        >
                          {actions.text("Copy Scheme")}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label
                        className={
                          "text-label-md font-label-md uppercase text-on-surface-variant block mb-1"
                        }
                      >
                        {actions.text("Base Endpoint")}
                      </label>
                      <div
                        className={
                          "p-3 bg-surface-container-low rounded-lg text-code-md font-code-md text-on-surface flex items-center justify-between"
                        }
                      >
                        <span>
                          {actions.text(
                            "https://api.deepmatrix.ai/v4/llm/inference",
                          )}
                        </span>
                        <button
                          data-action-text={"content_copy Copy URL"}
                          className={
                            "text-primary hover:underline text-body-sm flex items-center gap-1"
                          }
                          type="button"
                          aria-label={actions.text("Copy URL")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[16px]"}
                          >
                            {"content_copy"}
                          </span>
                          {actions.text(" Copy URL\n                ")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-[#0B1220] p-8 rounded-xl shadow-lg text-white space-y-4"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between border-b border-gray-800 pb-4"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        className={
                          "text-headline-sm font-headline-sm text-gray-200"
                        }
                      >
                        {actions.text("Quick-Start Example")}
                      </span>
                      <span
                        className={
                          "bg-primary/30 text-primary-fixed-dim px-2.5 py-0.5 rounded text-code-sm font-code-sm"
                        }
                      >
                        {actions.text("Python")}
                      </span>
                    </div>
                    <button
                      data-action-text={"content_copy Copy Code"}
                      className={
                        "text-gray-400 hover:text-white text-body-sm font-code-sm flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("Copy Code")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"content_copy"}
                      </span>
                      {actions.text(" Copy Code\n            ")}
                    </button>
                  </div>
                  <pre
                    className={
                      "font-code-md text-code-md text-indigo-200 overflow-x-auto p-2"
                    }
                  >
                    <code>
                      {
                        'import requests\n\nurl = "https://api.deepmatrix.ai/v4/llm/inference"\nheaders = {\n    "Authorization": "Bearer dm_live_998127389102",\n    "Content-Type": "application/json"\n}\npayload = {\n    "model": "neural-v4-turbo",\n    "prompt": "Explain quantum annealing in two sentences.",\n    "max_tokens": 128,\n    "temperature": 0.3\n}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())'
                      }
                    </code>
                  </pre>
                  <div className={"pt-4 border-t border-gray-800"}>
                    <span
                      className={
                        "text-label-md uppercase text-gray-400 block mb-2"
                      }
                    >
                      {actions.text("Response JSON (200 OK)")}
                    </span>
                    <pre
                      className={
                        "font-code-md text-code-md text-emerald-400 overflow-x-auto p-2 bg-black/40 rounded"
                      }
                    >
                      <code>
                        {
                          '{\n  "id": "chat-cmpl-8v719a",\n  "object": "chat.completion",\n  "created": 1710002938,\n  "model": "neural-v4-turbo",\n  "choices": [{\n    "text": "Quantum annealing is a metaheuristic technique used to find the global minimum of a given objective function over a given set of candidate solutions by a process using quantum fluctuations. It is particularly effective for complex combinatorial optimization problems.",\n    "index": 0,\n    "finish_reason": "stop"\n  }],\n  "usage": { "prompt_tokens": 14, "completion_tokens": 42, "total_tokens": 56 }\n}'
                        }
                      </code>
                    </pre>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-4"
                  }
                >
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Version History & Changelog")}
                  </h2>
                  <div className={"space-y-4"}>
                    <div
                      className={
                        "flex items-start gap-4 pb-4 border-b border-outline-variant/30"
                      }
                    >
                      <span
                        className={
                          "bg-primary-container text-on-primary-container px-2.5 py-1 rounded text-code-sm font-code-sm"
                        }
                      >
                        {actions.text("v4.2.0")}
                      </span>
                      <div className={"flex-1"}>
                        <div
                          className={"flex items-center justify-between mb-1"}
                        >
                          <h3
                            className={
                              "text-body-md font-label-md text-on-surface"
                            }
                          >
                            {actions.text(
                              "Enhanced Function Calling & Streaming Latency",
                            )}
                          </h3>
                          <span
                            className={"text-body-sm text-on-surface-variant"}
                          >
                            {actions.text("Oct 12, 2024")}
                          </span>
                        </div>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Reduced time-to-first-token by 18% and introduced native schema validation helpers.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={
                        "flex items-start gap-4 pb-4 border-b border-outline-variant/30"
                      }
                    >
                      <span
                        className={
                          "bg-surface-container text-on-surface px-2.5 py-1 rounded text-code-sm font-code-sm"
                        }
                      >
                        {actions.text("v4.1.0")}
                      </span>
                      <div className={"flex-1"}>
                        <div
                          className={"flex items-center justify-between mb-1"}
                        >
                          <h3
                            className={
                              "text-body-md font-label-md text-on-surface"
                            }
                          >
                            {actions.text("Multi-region Failover Engine")}
                          </h3>
                          <span
                            className={"text-body-sm text-on-surface-variant"}
                          >
                            {actions.text("Sep 01, 2024")}
                          </span>
                        </div>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Deployed active-active routing across APAC and EU datacenters.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={"flex items-start gap-4"}>
                      <span
                        className={
                          "bg-surface-container text-on-surface px-2.5 py-1 rounded text-code-sm font-code-sm"
                        }
                      >
                        {actions.text("v3.8.0")}
                      </span>
                      <div className={"flex-1"}>
                        <div
                          className={"flex items-center justify-between mb-1"}
                        >
                          <h3
                            className={
                              "text-body-md font-label-md text-on-surface"
                            }
                          >
                            {actions.text("Initial v3 Legacy Stable")}
                          </h3>
                          <span
                            className={"text-body-sm text-on-surface-variant"}
                          >
                            {actions.text("Jun 15, 2024")}
                          </span>
                        </div>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Stable release baseline for enterprise tier subscribers.",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl shadow-sm flex items-center justify-between gap-6"
                  }
                >
                  <div className={"flex items-center gap-4"}>
                    <div
                      className={
                        "w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-[20px]"
                      }
                    >
                      {actions.text("\n              DM\n            ")}
                    </div>
                    <div>
                      <div className={"flex items-center gap-2 mb-1"}>
                        <h3
                          className={
                            "text-headline-sm font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("DeepMatrix AI")}
                        </h3>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary text-[16px]"
                          }
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"verified"}
                        </span>
                      </div>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Verified enterprise partner • 14 APIs published • 99.9% response rate",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    data-action-text={"View Provider Profile"}
                    className={
                      "px-4 py-2 bg-surface-container text-on-surface rounded-lg text-body-md font-label-md hover:bg-surface-container-high transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("View Provider Profile")}
                  >
                    {actions.text(
                      "\n            View Provider Profile\n          ",
                    )}
                  </button>
                </div>
              </div>

              <div className={"space-y-6 lg:sticky lg:top-24 h-fit"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Pricing & Plans")}
                  </h3>
                  <div className={"p-4 bg-surface-container-low rounded-lg"}>
                    <div
                      className={"text-body-sm text-on-surface-variant mb-1"}
                    >
                      {actions.text("Pay-as-you-go")}
                    </div>
                    <div
                      className={
                        "text-headline-md font-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("$0.002 ")}
                      <span
                        className={
                          "text-body-sm text-on-surface-variant font-normal"
                        }
                      >
                        {actions.text("/ 1k tokens")}
                      </span>
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Includes standard edge routing and rate limits.",
                      )}
                    </div>
                  </div>
                  <div
                    className={
                      "p-4 bg-primary/5 border border-primary/20 rounded-lg"
                    }
                  >
                    <div className={"flex items-center justify-between mb-1"}>
                      <span
                        className={"text-body-md font-label-md text-primary"}
                      >
                        {actions.text("Pro Unlimited")}
                      </span>
                      <span
                        className={
                          "bg-primary text-on-primary px-2 py-0.5 rounded text-label-md"
                        }
                      >
                        {actions.text("Popular")}
                      </span>
                    </div>
                    <div
                      className={
                        "text-headline-md font-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("$490 ")}
                      <span
                        className={
                          "text-body-sm text-on-surface-variant font-normal"
                        }
                      >
                        {actions.text("/ mo")}
                      </span>
                    </div>
                    <div
                      className={"text-body-sm text-on-surface-variant mb-4"}
                    >
                      {actions.text(
                        "Dedicated inference nodes, zero rate limits, priority queue.",
                      )}
                    </div>
                    <button
                      data-action-text={"Subscribe Now"}
                      className={
                        "w-full py-2.5 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors"
                      }
                      type="button"
                      aria-label={actions.text("Subscribe Now")}
                    >
                      {actions.text(
                        "\n              Subscribe Now\n            ",
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Quota & Rate Limits")}
                  </h3>
                  <div className={"space-y-3"}>
                    <div>
                      <div className={"flex justify-between text-body-sm mb-1"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Monthly Quota")}
                        </span>
                        <span className={"text-on-surface font-label-md"}>
                          {actions.text("100,000 req / mo")}
                        </span>
                      </div>
                      <div
                        className={
                          "w-full bg-surface-container h-2 rounded-full overflow-hidden"
                        }
                      >
                        <div
                          className={"bg-primary h-full w-[24%] rounded-full"}
                        ></div>
                      </div>
                    </div>
                    <div
                      className={
                        "pt-3 border-t border-outline-variant/30 flex items-center justify-between"
                      }
                    >
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Rate Limit")}
                      </span>
                      <span
                        className={
                          "text-body-md font-code-md text-on-surface font-semibold"
                        }
                      >
                        {actions.text("50 req / sec")}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-3"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Security & Compliance")}
                  </h3>
                  <div
                    className={
                      "flex items-center gap-3 text-body-md text-on-surface-variant"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"verified_user"}
                    </span>
                    <span>{actions.text("SOC2 Type II Certified")}</span>
                  </div>
                  <div
                    className={
                      "flex items-center gap-3 text-body-md text-on-surface-variant"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"lock"}
                    </span>
                    <span>
                      {actions.text("End-to-End Encrypted (TLS 1.3)")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-2"
                  }
                >
                  <a
                    data-action-text={"Test in Sandbox open_in_new"}
                    className={
                      "flex items-center justify-between p-3 bg-surface-container-low hover:bg-surface-container rounded-lg text-body-md font-label-md text-on-surface transition-colors"
                    }
                    href={"#"}
                  >
                    <span>{actions.text("Test in Sandbox")}</span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"open_in_new"}
                    </span>
                  </a>
                  <a
                    data-action-text={"Download OpenAPI 3.1 Spec download"}
                    className={
                      "flex items-center justify-between p-3 bg-surface-container-low hover:bg-surface-container rounded-lg text-body-md font-label-md text-on-surface transition-colors"
                    }
                    href={"#"}
                  >
                    <span>{actions.text("Download OpenAPI 3.1 Spec")}</span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"download"}
                    </span>
                  </a>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Related APIs")}
                  </h3>
                  <div className={"space-y-3"}>
                    <a
                      data-action-text={
                        "Global FX Settlement Free Tier Real-time currency conversion and multi-lateral netting."
                      }
                      className={
                        "block p-3 bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors"
                      }
                      href={"#"}
                    >
                      <div className={"flex items-center justify-between mb-1"}>
                        <span
                          className={
                            "text-body-md font-label-md text-on-surface"
                          }
                        >
                          {actions.text("Global FX Settlement")}
                        </span>
                        <span className={"text-body-sm text-primary"}>
                          {actions.text("Free Tier")}
                        </span>
                      </div>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant truncate"
                        }
                      >
                        {actions.text(
                          "Real-time currency conversion and multi-lateral netting.",
                        )}
                      </p>
                    </a>
                    <a
                      data-action-text={
                        "Zero-Trust Auth $0.001/req Continuous identity verification and risk scoring."
                      }
                      className={
                        "block p-3 bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors"
                      }
                      href={"#"}
                    >
                      <div className={"flex items-center justify-between mb-1"}>
                        <span
                          className={
                            "text-body-md font-label-md text-on-surface"
                          }
                        >
                          {actions.text("Zero-Trust Auth")}
                        </span>
                        <span className={"text-body-sm text-primary"}>
                          {actions.text("$0.001/req")}
                        </span>
                      </div>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant truncate"
                        }
                      >
                        {actions.text(
                          "Continuous identity verification and risk scoring.",
                        )}
                      </p>
                    </a>
                    <a
                      data-action-text={
                        "HyperStream Weather Free Tier Sub-hourly meteorological radar data streams."
                      }
                      className={
                        "block p-3 bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors"
                      }
                      href={"#"}
                    >
                      <div className={"flex items-center justify-between mb-1"}>
                        <span
                          className={
                            "text-body-md font-label-md text-on-surface"
                          }
                        >
                          {actions.text("HyperStream Weather")}
                        </span>
                        <span className={"text-body-sm text-primary"}>
                          {actions.text("Free Tier")}
                        </span>
                      </div>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant truncate"
                        }
                      >
                        {actions.text(
                          "Sub-hourly meteorological radar data streams.",
                        )}
                      </p>
                    </a>
                  </div>
                </div>

                <div
                  className={"text-center text-body-sm text-on-surface-variant"}
                >
                  {actions.text(
                    "\n          Experiencing issues with this API? ",
                  )}
                  <a
                    data-action-text={"Contact Provider Support"}
                    className={"text-primary hover:underline"}
                    href={"#"}
                  >
                    {actions.text("Contact Provider Support")}
                  </a>
                  {actions.text(" or ")}
                  <a
                    data-action-text={"Report Violation"}
                    className={"text-error hover:underline"}
                    href={"#"}
                  >
                    {actions.text("Report Violation")}
                  </a>
                  {actions.text(".\n        ")}
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
