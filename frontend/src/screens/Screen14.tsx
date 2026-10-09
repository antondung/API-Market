import { useScreenActions } from "../features/screen-actions";
export default function Screen14() {
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
          <section
            className={
              "relative pt-20 pb-28 px-6 lg:px-12 overflow-hidden bg-gradient-to-br from-surface via-surface-container-low to-surface"
            }
          >
            <div
              className={
                "absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
              }
            ></div>
            <div
              className={
                "absolute top-1/2 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"
              }
            ></div>
            <div className={"max-w-5xl mx-auto text-center relative z-10"}>
              <div
                className={
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary text-label-md mb-6"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"bolt"}
                </span>
                <span>
                  {actions.text(
                    "v3.2 Protocol Released — Explore 2,400+ Verified APIs",
                  )}
                </span>
              </div>
              <h1
                className={
                  "text-headline-lg font-headline-lg text-on-surface mb-6 max-w-4xl mx-auto tracking-tight"
                }
              >
                {actions.text("\n        Discover, Test & Integrate APIs. ")}
                <br />
                <span className={"text-primary"}>
                  {actions.text("All in One Place.")}
                </span>
              </h1>
              <p
                className={
                  "text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10"
                }
              >
                {actions.text(
                  "\n        The developer-first marketplace for reliable, high-performance APIs. Instant provisioning, unified SDKs, and sub-millisecond telemetry.\n      ",
                )}
              </p>

              <div
                className={
                  "max-w-2xl mx-auto bg-surface-container-lowest p-2 rounded-xl shadow-xl shadow-primary/5 flex items-center gap-3 relative"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-outline ml-3"}
                >
                  {"search"}
                </span>
                <input
                  data-source-placeholder={
                    "Search 2,400+ endpoints (e.g., embeddings, payments, geo-routing)..."
                  }
                  className={
                    "w-full bg-transparent text-body-md text-on-surface focus:outline-none placeholder:text-outline/70"
                  }
                  placeholder={actions.text(
                    "Search 2,400+ endpoints (e.g., embeddings, payments, geo-routing)...",
                  )}
                  type={"text"}
                  aria-label={actions.text(
                    "Search 2,400+ endpoints (e.g., embeddings, payments, geo-routing)...",
                  )}
                />
                <div
                  className={
                    "hidden sm:flex items-center gap-1 px-2 py-1 bg-surface-container rounded text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("⌘")}</span>
                  <span>{actions.text("K")}</span>
                </div>
                <button
                  data-action-text={"Search"}
                  className={
                    "px-6 py-3 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-all shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Search")}
                >
                  {actions.text("\n          Search\n        ")}
                </button>
              </div>

              <div
                className={
                  "flex flex-wrap items-center justify-center gap-2 mt-6"
                }
              >
                <span className={"text-body-sm text-outline mr-2"}>
                  {actions.text("Popular:")}
                </span>
                <a
                  data-action-text={"AI & ML"}
                  className={
                    "px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded text-body-sm text-on-surface-variant transition-colors"
                  }
                  href={"#"}
                >
                  {actions.text("AI & ML")}
                </a>
                <a
                  data-action-text={"Stripe Payments"}
                  className={
                    "px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded text-body-sm text-on-surface-variant transition-colors"
                  }
                  href={"#"}
                >
                  {actions.text("Stripe Payments")}
                </a>
                <a
                  data-action-text={"OpenAI GPT-4"}
                  className={
                    "px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded text-body-sm text-on-surface-variant transition-colors"
                  }
                  href={"#"}
                >
                  {actions.text("OpenAI GPT-4")}
                </a>
                <a
                  data-action-text={"Mapbox GL"}
                  className={
                    "px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded text-body-sm text-on-surface-variant transition-colors"
                  }
                  href={"#"}
                >
                  {actions.text("Mapbox GL")}
                </a>
                <a
                  data-action-text={"Twilio SMS"}
                  className={
                    "px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded text-body-sm text-on-surface-variant transition-colors"
                  }
                  href={"#"}
                >
                  {actions.text("Twilio SMS")}
                </a>
              </div>
            </div>
          </section>

          <section className={"py-16 px-6 lg:px-12 bg-surface-container-low"}>
            <div className={"max-w-6xl mx-auto"}>
              <div className={"text-center mb-10"}>
                <span
                  className={
                    "text-label-md font-label-md text-primary uppercase tracking-wider mb-2 block"
                  }
                >
                  {actions.text("Interactive Playground")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text(
                    "Test endpoints in real-time with automatic SDK generation",
                  )}
                </h2>
              </div>
              <div
                className={
                  "bg-[#0B1220] rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-on-dark"
                }
              >
                <div
                  className={
                    "lg:col-span-5 p-6 bg-[#0B1220] flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-center justify-between mb-6"}>
                      <div className={"flex items-center gap-2"}>
                        <span
                          className={
                            "px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-code-sm font-bold"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                        <span className={"text-code-md text-slate-200"}>
                          {actions.text("/v1/embeddings")}
                        </span>
                      </div>
                      <span
                        className={
                          "px-2 py-1 bg-slate-800 text-slate-400 rounded text-code-sm"
                        }
                      >
                        {actions.text("200 OK")}
                      </span>
                    </div>
                    <div className={"space-y-4"}>
                      <div>
                        <label
                          className={"text-code-sm text-slate-400 block mb-1"}
                        >
                          {actions.text("Headers")}
                        </label>
                        <div
                          className={
                            "p-3 bg-slate-900/80 rounded font-code-sm text-slate-300"
                          }
                        >
                          {actions.text(
                            "\n                  Authorization: Bearer hub_live_9x8...",
                          )}
                          <br />
                          {actions.text(
                            "\n                  Content-Type: application/json\n                ",
                          )}
                        </div>
                      </div>
                      <div>
                        <label
                          className={"text-code-sm text-slate-400 block mb-1"}
                        >
                          {actions.text("Request Body (JSON)")}
                        </label>
                        <div
                          className={
                            "p-3 bg-slate-900/80 rounded font-code-sm text-indigo-300"
                          }
                        >
                          {actions.text("\n                  {")}
                          <br />
                          {actions.text(
                            '\n                    "model": "text-embedding-3-small",',
                          )}
                          <br />
                          {actions.text(
                            '\n                    "input": "High-performance developer APIs"',
                          )}
                          <br />
                          {actions.text(
                            "\n                  }\n                ",
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={"mt-8 pt-4 flex items-center justify-between"}
                  >
                    <div
                      className={
                        "flex items-center gap-2 text-slate-400 text-code-sm"
                      }
                    >
                      <span
                        className={
                          "w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                        }
                      ></span>
                      <span>{actions.text("Latency: 42ms")}</span>
                    </div>
                    <button
                      data-action-text={"play_arrow Send Request"}
                      className={
                        "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-code-md font-bold transition-colors flex items-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text("Send Request")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"play_arrow"}
                      </span>
                      {actions.text(" Send Request\n            ")}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "lg:col-span-7 bg-[#070b14] p-6 font-code-md text-slate-300 overflow-x-auto border-t lg:border-t-0 lg:border-l border-slate-800"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-code-sm text-slate-400"
                    }
                  >
                    <div className={"flex items-center gap-4"}>
                      <button
                        data-action-text={"Response"}
                        className={
                          "text-white font-bold pb-1 border-b-2 border-indigo-500"
                        }
                        type="button"
                        aria-label={actions.text("Response")}
                      >
                        {actions.text("Response")}
                      </button>
                      <button
                        data-action-text={"cURL"}
                        className={"hover:text-white transition-colors"}
                        type="button"
                        aria-label={actions.text("cURL")}
                      >
                        {actions.text("cURL")}
                      </button>
                      <button
                        data-action-text={"Node.js"}
                        className={"hover:text-white transition-colors"}
                        type="button"
                        aria-label={actions.text("Node.js")}
                      >
                        {actions.text("Node.js")}
                      </button>
                      <button
                        data-action-text={"Python"}
                        className={"hover:text-white transition-colors"}
                        type="button"
                        aria-label={actions.text("Python")}
                      >
                        {actions.text("Python")}
                      </button>
                    </div>
                    <button
                      data-action-text={"content_copy Copy"}
                      className={"hover:text-white flex items-center gap-1"}
                      type="button"
                      aria-label={actions.text("Copy")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"content_copy"}
                      </span>
                      {actions.text(" Copy\n            ")}
                    </button>
                  </div>
                  <pre
                    className={"text-slate-300 text-code-md leading-relaxed"}
                  >
                    <code>
                      {
                        '{\n  "object": "list",\n  "data": [\n    {\n      "object": "embedding",\n      "index": 0,\n      "embedding": [\n        -0.01243, 0.03921, -0.00412, 0.05128,\n        -0.02194, 0.01123, 0.04812, -0.03194\n      ]\n    }\n  ],\n  "model": "text-embedding-3-small",\n  "usage": {\n    "prompt_tokens": 5,\n    "total_tokens": 5\n  }\n}'
                      }
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className={"py-20 px-6 lg:px-12 max-w-7xl mx-auto"}>
            <div
              className={
                "flex flex-col md:flex-row md:items-end justify-between mb-12"
              }
            >
              <div>
                <span
                  className={
                    "text-label-md font-label-md text-primary uppercase tracking-wider mb-2 block"
                  }
                >
                  {actions.text("Catalog Exploration")}
                </span>
                <h2
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("Explore Popular API Categories")}
                </h2>
              </div>
              <a
                data-action-text={"View all 24 categories arrow_forward"}
                className={
                  "text-body-md font-label-md text-primary hover:underline mt-4 md:mt-0 flex items-center gap-1"
                }
                href={"#"}
              >
                {actions.text("\n        View all 24 categories ")}
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"arrow_forward"}
                </span>
              </a>
            </div>
            <div
              className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"}
            >
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"smart_toy"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("AI & Machine Learning")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "LLMs, computer vision, speech synthesis, and vector embeddings.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("420 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+18% this month")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"payments"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Financial Services")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "Payment gateways, FX rates, crypto feeds, and fraud detection.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("310 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+12% this month")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"bolt"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Real-Time Data")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "Webhooks, live sports feeds, IoT telemetry, and stock tickers.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("185 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+24% this month")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"public"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Weather & Geospatial")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "Hyper-local weather, satellite imagery, and geocoding services.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("150 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+9% this month")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"map"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Mapping & Location")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "Turn-by-turn routing, vector tiles, and spatial analysis tools.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("95 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+15% this month")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"forum"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Communications")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "Programmable SMS, voice, video conferencing, and email relays.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("210 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+8% this month")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"code"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Developer Tools")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "CI/CD pipelines, error tracking, feature flags, and logging.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("340 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+30% this month")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl transition-all group cursor-pointer"
                }
              >
                <div
                  className={
                    "w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"security"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Security & Auth")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "OAuth2 providers, biometrics, bot detection, and JWT validation.",
                  )}
                </p>
                <div
                  className={
                    "flex items-center justify-between text-code-sm text-outline"
                  }
                >
                  <span>{actions.text("175 APIs")}</span>
                  <span className={"text-emerald-600 font-bold"}>
                    {actions.text("+14% this month")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={"py-20 px-6 lg:px-12 bg-surface-container-low"}>
            <div className={"max-w-7xl mx-auto"}>
              <div
                className={
                  "flex flex-col md:flex-row md:items-end justify-between mb-12"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider mb-2 block"
                    }
                  >
                    {actions.text("Verified & Benchmarked")}
                  </span>
                  <h2
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("Featured Production APIs")}
                  </h2>
                </div>
                <div className={"flex items-center gap-2 mt-4 md:mt-0"}>
                  <button
                    data-action-text={"All"}
                    className={
                      "px-4 py-2 bg-surface-container-lowest text-on-surface rounded-lg text-body-md font-label-md shadow-sm"
                    }
                    type="button"
                    aria-label={actions.text("All")}
                  >
                    {actions.text("All")}
                  </button>
                  <button
                    data-action-text={"AI & ML"}
                    className={
                      "px-4 py-2 hover:bg-surface-container text-on-surface-variant rounded-lg text-body-md font-label-md transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("AI & ML")}
                  >
                    {actions.text("AI & ML")}
                  </button>
                  <button
                    data-action-text={"Financial"}
                    className={
                      "px-4 py-2 hover:bg-surface-container text-on-surface-variant rounded-lg text-body-md font-label-md transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("Financial")}
                  >
                    {actions.text("Financial")}
                  </button>
                  <button
                    data-action-text={"Geospatial"}
                    className={
                      "px-4 py-2 hover:bg-surface-container text-on-surface-variant rounded-lg text-body-md font-label-md transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("Geospatial")}
                  >
                    {actions.text("Geospatial")}
                  </button>
                </div>
              </div>
              <div
                className={
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                }
              >
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-start justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-primary font-headline-md"
                          }
                        >
                          {actions.text("NS")}
                        </div>
                        <div>
                          <h3
                            className={
                              "text-headline-sm font-headline-sm text-on-surface"
                            }
                          >
                            {actions.text("NeuralSpeech AI")}
                          </h3>
                          <span className={"text-body-sm text-outline"}>
                            {actions.text("by DeepVoice Labs")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-code-sm font-bold"
                        }
                      >
                        {actions.text("99.99% Uptime")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface-variant mb-6"}>
                      {actions.text(
                        "Ultra-low latency text-to-speech synthesis with 45+ human-like voices and custom voice cloning capabilities.",
                      )}
                    </p>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between mb-4 pt-4 border-t border-outline-variant/20 text-code-sm"
                      }
                    >
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("Free Tier (10k chars)")}
                      </span>
                      <span className={"text-primary font-bold"}>
                        {actions.text("Pay-as-you-go")}
                      </span>
                    </div>
                    <div className={"grid grid-cols-2 gap-2"}>
                      <button
                        data-action-text={"Test in Playground"}
                        className={
                          "px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Test in Playground")}
                      >
                        {actions.text("Test in Playground")}
                      </button>
                      <button
                        data-action-text={"Subscribe"}
                        className={
                          "px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Subscribe")}
                      >
                        {actions.text("Subscribe")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-start justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-headline-md"
                          }
                        >
                          {actions.text("SP")}
                        </div>
                        <div>
                          <h3
                            className={
                              "text-headline-sm font-headline-sm text-on-surface"
                            }
                          >
                            {actions.text("StellarPay Financial")}
                          </h3>
                          <span className={"text-body-sm text-outline"}>
                            {actions.text("by Stellar Technologies")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-code-sm font-bold"
                        }
                      >
                        {actions.text("99.99% Uptime")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface-variant mb-6"}>
                      {actions.text(
                        "Global multi-currency payment orchestration engine with instant routing, automated fraud screening, and ledger sync.",
                      )}
                    </p>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between mb-4 pt-4 border-t border-outline-variant/20 text-code-sm"
                      }
                    >
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("Sandbox Free")}
                      </span>
                      <span className={"text-primary font-bold"}>
                        {actions.text("Volume Pricing")}
                      </span>
                    </div>
                    <div className={"grid grid-cols-2 gap-2"}>
                      <button
                        data-action-text={"Test in Playground"}
                        className={
                          "px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Test in Playground")}
                      >
                        {actions.text("Test in Playground")}
                      </button>
                      <button
                        data-action-text={"Subscribe"}
                        className={
                          "px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Subscribe")}
                      >
                        {actions.text("Subscribe")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-start justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-headline-md"
                          }
                        >
                          {actions.text("GR")}
                        </div>
                        <div>
                          <h3
                            className={
                              "text-headline-sm font-headline-sm text-on-surface"
                            }
                          >
                            {actions.text("GeoRoute Maps v2")}
                          </h3>
                          <span className={"text-body-sm text-outline"}>
                            {actions.text("by MapMatrix Inc")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-code-sm font-bold"
                        }
                      >
                        {actions.text("99.99% Uptime")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface-variant mb-6"}>
                      {actions.text(
                        "High-performance vector tiles, real-time traffic matrix calculations, and optimized delivery routing calculations.",
                      )}
                    </p>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between mb-4 pt-4 border-t border-outline-variant/20 text-code-sm"
                      }
                    >
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("Free Tier (50k req)")}
                      </span>
                      <span className={"text-primary font-bold"}>
                        {actions.text("Pay-as-you-go")}
                      </span>
                    </div>
                    <div className={"grid grid-cols-2 gap-2"}>
                      <button
                        data-action-text={"Test in Playground"}
                        className={
                          "px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Test in Playground")}
                      >
                        {actions.text("Test in Playground")}
                      </button>
                      <button
                        data-action-text={"Subscribe"}
                        className={
                          "px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Subscribe")}
                      >
                        {actions.text("Subscribe")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-start justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-headline-md"
                          }
                        >
                          {actions.text("SA")}
                        </div>
                        <div>
                          <h3
                            className={
                              "text-headline-sm font-headline-sm text-on-surface"
                            }
                          >
                            {actions.text("SecureAuth Identity")}
                          </h3>
                          <span className={"text-body-sm text-outline"}>
                            {actions.text("by AuthMatrix")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-code-sm font-bold"
                        }
                      >
                        {actions.text("100% Uptime")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface-variant mb-6"}>
                      {actions.text(
                        "Enterprise-grade OIDC/OAuth2 authentication provider with adaptive MFA, biometric passkey support, and SCIM provisioning.",
                      )}
                    </p>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between mb-4 pt-4 border-t border-outline-variant/20 text-code-sm"
                      }
                    >
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("Free (1k users)")}
                      </span>
                      <span className={"text-primary font-bold"}>
                        {actions.text("Enterprise SLA")}
                      </span>
                    </div>
                    <div className={"grid grid-cols-2 gap-2"}>
                      <button
                        data-action-text={"Test in Playground"}
                        className={
                          "px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Test in Playground")}
                      >
                        {actions.text("Test in Playground")}
                      </button>
                      <button
                        data-action-text={"Subscribe"}
                        className={
                          "px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Subscribe")}
                      >
                        {actions.text("Subscribe")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-start justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-headline-md"
                          }
                        >
                          {actions.text("MP")}
                        </div>
                        <div>
                          <h3
                            className={
                              "text-headline-sm font-headline-sm text-on-surface"
                            }
                          >
                            {actions.text("MarketPulse Live Data")}
                          </h3>
                          <span className={"text-body-sm text-outline"}>
                            {actions.text("by FinStream Data")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-code-sm font-bold"
                        }
                      >
                        {actions.text("99.99% Uptime")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface-variant mb-6"}>
                      {actions.text(
                        "Sub-millisecond WebSockets streaming global equities, forex ticks, crypto order books, and economic indicator feeds.",
                      )}
                    </p>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between mb-4 pt-4 border-t border-outline-variant/20 text-code-sm"
                      }
                    >
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("Free Sandbox")}
                      </span>
                      <span className={"text-primary font-bold"}>
                        {actions.text("Pay-as-you-go")}
                      </span>
                    </div>
                    <div className={"grid grid-cols-2 gap-2"}>
                      <button
                        data-action-text={"Test in Playground"}
                        className={
                          "px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Test in Playground")}
                      >
                        {actions.text("Test in Playground")}
                      </button>
                      <button
                        data-action-text={"Subscribe"}
                        className={
                          "px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Subscribe")}
                      >
                        {actions.text("Subscribe")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-start justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-headline-md"
                          }
                        >
                          {actions.text("CV")}
                        </div>
                        <div>
                          <h3
                            className={
                              "text-headline-sm font-headline-sm text-on-surface"
                            }
                          >
                            {actions.text("VisionAI Core")}
                          </h3>
                          <span className={"text-body-sm text-outline"}>
                            {actions.text("by OpticSystems")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-code-sm font-bold"
                        }
                      >
                        {actions.text("99.95% Uptime")}
                      </span>
                    </div>
                    <p className={"text-body-md text-on-surface-variant mb-6"}>
                      {actions.text(
                        "Real-time object detection, facial landmark recognition, optical character recognition (OCR), and visual moderation API.",
                      )}
                    </p>
                  </div>
                  <div>
                    <div
                      className={
                        "flex items-center justify-between mb-4 pt-4 border-t border-outline-variant/20 text-code-sm"
                      }
                    >
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("Free Tier (5k imgs)")}
                      </span>
                      <span className={"text-primary font-bold"}>
                        {actions.text("Pay-as-you-go")}
                      </span>
                    </div>
                    <div className={"grid grid-cols-2 gap-2"}>
                      <button
                        data-action-text={"Test in Playground"}
                        className={
                          "px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Test in Playground")}
                      >
                        {actions.text("Test in Playground")}
                      </button>
                      <button
                        data-action-text={"Subscribe"}
                        className={
                          "px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-body-md font-label-md transition-colors"
                        }
                        type="button"
                        aria-label={actions.text("Subscribe")}
                      >
                        {actions.text("Subscribe")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={"py-20 px-6 lg:px-12 max-w-7xl mx-auto"}>
            <div className={"text-center max-w-2xl mx-auto mb-16"}>
              <span
                className={
                  "text-label-md font-label-md text-primary uppercase tracking-wider mb-2 block"
                }
              >
                {actions.text("Streamlined Workflow")}
              </span>
              <h2
                className={
                  "text-headline-lg font-headline-lg text-on-surface mb-4"
                }
              >
                {actions.text("From Discovery to Production in Minutes")}
              </h2>
              <p className={"text-body-lg text-on-surface-variant"}>
                {actions.text(
                  "Our unified infrastructure removes friction at every stage of the developer lifecycle.",
                )}
              </p>
            </div>
            <div className={"grid grid-cols-1 md:grid-cols-5 gap-6"}>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl relative"
                }
              >
                <span
                  className={
                    "text-[48px] font-headline-lg text-primary/10 font-bold absolute top-4 right-4"
                  }
                >
                  {actions.text("01")}
                </span>
                <div
                  className={
                    "w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mb-4"
                  }
                >
                  {actions.text("1")}
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("Discover")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Browse verified APIs with benchmarks, OpenAPI specs, and pricing comparisons.",
                  )}
                </p>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl relative"
                }
              >
                <span
                  className={
                    "text-[48px] font-headline-lg text-primary/10 font-bold absolute top-4 right-4"
                  }
                >
                  {actions.text("02")}
                </span>
                <div
                  className={
                    "w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mb-4"
                  }
                >
                  {actions.text("2")}
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("Test in Browser")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Execute live requests instantly in our interactive playground without writing setup code.",
                  )}
                </p>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl relative"
                }
              >
                <span
                  className={
                    "text-[48px] font-headline-lg text-primary/10 font-bold absolute top-4 right-4"
                  }
                >
                  {actions.text("03")}
                </span>
                <div
                  className={
                    "w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mb-4"
                  }
                >
                  {actions.text("3")}
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("One-Click Subscribe")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Provision keys, set spending limits, and assign scopes instantly via unified billing.",
                  )}
                </p>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl relative"
                }
              >
                <span
                  className={
                    "text-[48px] font-headline-lg text-primary/10 font-bold absolute top-4 right-4"
                  }
                >
                  {actions.text("04")}
                </span>
                <div
                  className={
                    "w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mb-4"
                  }
                >
                  {actions.text("4")}
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("SDK Integration")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Copy generated SDK wrappers for TypeScript, Python, Go, and Ruby directly into your codebase.",
                  )}
                </p>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl relative"
                }
              >
                <span
                  className={
                    "text-[48px] font-headline-lg text-primary/10 font-bold absolute top-4 right-4"
                  }
                >
                  {actions.text("05")}
                </span>
                <div
                  className={
                    "w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mb-4"
                  }
                >
                  {actions.text("5")}
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("Live Telemetry")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Monitor sub-millisecond latency, error rates, and quota usage in real-time dashboards.",
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className={"py-20 px-6 lg:px-12 bg-surface-container-low"}>
            <div className={"max-w-7xl mx-auto"}>
              <div className={"text-center max-w-2xl mx-auto mb-16"}>
                <span
                  className={
                    "text-label-md font-label-md text-primary uppercase tracking-wider mb-2 block"
                  }
                >
                  {actions.text("Built for Engineers")}
                </span>
                <h2
                  className={
                    "text-headline-lg font-headline-lg text-on-surface mb-4"
                  }
                >
                  {actions.text("Uncompromising Developer Experience")}
                </h2>
                <p className={"text-body-lg text-on-surface-variant"}>
                  {actions.text(
                    "Every tool and feature is engineered to eliminate cognitive load and accelerate deployment.",
                  )}
                </p>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-8"}>
                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl flex gap-6"
                  }
                >
                  <div
                    className={
                      "w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[28px]"}
                    >
                      {"terminal"}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={
                        "text-headline-md font-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("Interactive Playground")}
                    </h3>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Test any endpoint instantly with sandbox credentials, mock payload generators, and automatic request history logging.",
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl flex gap-6"
                  }
                >
                  <div
                    className={
                      "w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[28px]"}
                    >
                      {"description"}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={
                        "text-headline-md font-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("Standardized OpenAPI 3.1 Specs")}
                    </h3>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Rigorous machine-readable documentation across all providers with guaranteed backward compatibility and version pinning.",
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl flex gap-6"
                  }
                >
                  <div
                    className={
                      "w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[28px]"}
                    >
                      {"key"}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={
                        "text-headline-md font-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("Automated API Key Rotation & Scopes")}
                    </h3>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Fine-grained permission scopes per token with automated zero-downtime key rotation policies and IP allowlisting.",
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-8 rounded-xl flex gap-6"
                  }
                >
                  <div
                    className={
                      "w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[28px]"}
                    >
                      {"monitoring"}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={
                        "text-headline-md font-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("Granular Usage Analytics")}
                    </h3>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Detailed telemetry on p99 latency, status code distributions, bandwidth consumption, and cost tracking per microservice.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={"py-20 px-6 lg:px-12 max-w-7xl mx-auto"}>
            <div
              className={
                "bg-primary text-on-primary rounded-2xl p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
              }
            >
              <div
                className={
                  "absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
                }
              ></div>
              <div className={"max-w-xl relative z-10"}>
                <span
                  className={
                    "px-3 py-1 bg-white/10 rounded-full text-label-md uppercase tracking-wider mb-4 inline-block"
                  }
                >
                  {actions.text("Monetize Your APIs")}
                </span>
                <h2
                  className={
                    "text-headline-lg font-headline-lg text-on-primary mb-4"
                  }
                >
                  {actions.text("Publish Your API on API HUB")}
                </h2>
                <p className={"text-body-lg text-on-primary/80 mb-8"}>
                  {actions.text(
                    "Reach thousands of elite developer teams. Enjoy 90% revenue share, instant global billing, automated metering, and deep developer analytics.",
                  )}
                </p>
                <div className={"flex flex-wrap items-center gap-4"}>
                  <a
                    data-action-text={"Become a Provider"}
                    className={
                      "px-6 py-3 bg-white text-primary rounded-lg text-body-md font-label-md hover:bg-white/90 transition-colors shadow-lg"
                    }
                    href={"#"}
                  >
                    {actions.text("Become a Provider")}
                  </a>
                  <a
                    data-action-text={"Read Provider Guide"}
                    className={
                      "px-6 py-3 bg-transparent hover:bg-white/10 text-white border border-white/30 rounded-lg text-body-md font-label-md transition-colors"
                    }
                    href={"#"}
                  >
                    {actions.text("Read Provider Guide")}
                  </a>
                </div>
              </div>
              <div
                className={
                  "w-full md:w-auto grid grid-cols-2 gap-4 relative z-10 shrink-0"
                }
              >
                <div
                  className={
                    "bg-white/10 backdrop-blur-md p-6 rounded-xl text-center"
                  }
                >
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-white block mb-1"
                    }
                  >
                    {actions.text("90%")}
                  </span>
                  <span className={"text-body-sm text-white/80"}>
                    {actions.text("Revenue Share")}
                  </span>
                </div>
                <div
                  className={
                    "bg-white/10 backdrop-blur-md p-6 rounded-xl text-center"
                  }
                >
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-white block mb-1"
                    }
                  >
                    {actions.text("< 1hr")}
                  </span>
                  <span className={"text-body-sm text-white/80"}>
                    {actions.text("Verification Time")}
                  </span>
                </div>
                <div
                  className={
                    "bg-white/10 backdrop-blur-md p-6 rounded-xl text-center"
                  }
                >
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-white block mb-1"
                    }
                  >
                    {actions.text("2.4k+")}
                  </span>
                  <span className={"text-body-sm text-white/80"}>
                    {actions.text("Active Teams")}
                  </span>
                </div>
                <div
                  className={
                    "bg-white/10 backdrop-blur-md p-6 rounded-xl text-center"
                  }
                >
                  <span
                    className={
                      "text-headline-lg font-headline-lg text-white block mb-1"
                    }
                  >
                    {actions.text("$4.2M")}
                  </span>
                  <span className={"text-body-sm text-white/80"}>
                    {actions.text("Paid to Providers")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={"py-20 px-6 lg:px-12 bg-surface-container-low"}>
            <div className={"max-w-4xl mx-auto"}>
              <div className={"text-center mb-16"}>
                <span
                  className={
                    "text-label-md font-label-md text-primary uppercase tracking-wider mb-2 block"
                  }
                >
                  {actions.text("Support & Details")}
                </span>
                <h2
                  className={
                    "text-headline-lg font-headline-lg text-on-surface mb-4"
                  }
                >
                  {actions.text("Frequently Asked Questions")}
                </h2>
                <p className={"text-body-lg text-on-surface-variant"}>
                  {actions.text(
                    "Everything you need to know about API keys, pricing, and infrastructure.",
                  )}
                </p>
              </div>
              <div className={"space-y-4"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2 flex items-center justify-between cursor-pointer"
                    }
                  >
                    <span>
                      {actions.text("How do API keys and authentication work?")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-outline"}
                    >
                      {"expand_more"}
                    </span>
                  </h3>
                  <p className={"text-body-md text-on-surface-variant"}>
                    {actions.text(
                      "All APIs on API HUB utilize standardized Bearer token authentication (`Authorization: Bearer hub_live_...`). You can generate, scope, and rotate keys instantly from your dashboard without modifying your core infrastructure code.",
                    )}
                  </p>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2 flex items-center justify-between cursor-pointer"
                    }
                  >
                    <span>
                      {actions.text(
                        "What happens when I exceed my rate limit?",
                      )}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-outline"}
                    >
                      {"expand_more"}
                    </span>
                  </h3>
                  <p className={"text-body-md text-on-surface-variant"}>
                    {actions.text(
                      "When you reach your plan's rate limit, APIs return a standard `429 Too Many Requests` header with a retry-after timestamp. You can configure automatic overage protection or hard rate-limiting caps in your billing settings.",
                    )}
                  </p>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2 flex items-center justify-between cursor-pointer"
                    }
                  >
                    <span>
                      {actions.text(
                        "Are there free tiers available for testing?",
                      )}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-outline"}
                    >
                      {"expand_more"}
                    </span>
                  </h3>
                  <p className={"text-body-md text-on-surface-variant"}>
                    {actions.text(
                      "Yes! Over 80% of APIs on the platform offer a generous free tier or permanent sandbox environment so you can test integrations thoroughly before committing to paid production volumes.",
                    )}
                  </p>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2 flex items-center justify-between cursor-pointer"
                    }
                  >
                    <span>{actions.text("How do enterprise SLAs work?")}</span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-outline"}
                    >
                      {"expand_more"}
                    </span>
                  </h3>
                  <p className={"text-body-md text-on-surface-variant"}>
                    {actions.text(
                      "Enterprise plans guarantee 99.99% uptime backed by financial credits, dedicated routing proxies, custom webhook signing keys, and 24/7 priority developer support.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
