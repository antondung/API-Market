import { useScreenActions } from "../features/screen-actions";
export default function Screen36() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full bg-surface text-on-surface"}>
          <div className={"w-full max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-6"}>
            <div
              className={
                "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
              }
            >
              <div>
                <div className={"flex items-center gap-2 mb-2"}>
                  <span
                    className={
                      "px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md"
                    }
                  >
                    {actions.text("Interactive Experience")}
                  </span>
                  <span
                    className={
                      "font-code-md text-code-md text-on-surface-variant"
                    }
                  >
                    {actions.text("API_LIFECYCLE_SIMULATOR_V2")}
                  </span>
                </div>
                <h1
                  className={
                    "font-headline-lg text-headline-lg text-on-surface mb-2"
                  }
                >
                  {actions.text("Try Before Subscribe Journey")}
                </h1>
                <p
                  className={
                    "font-body-lg text-body-lg text-on-surface-variant max-w-2xl"
                  }
                >
                  {actions.text(
                    "Experience the friction-free developer onboarding flow from instant sandbox discovery to live playground execution, trial exhaustion, and seamless enterprise subscription upgrade.",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-3"}>
                <button
                  data-action-text={"restart_alt Reset Simulator"}
                  className={
                    "px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Reset Simulator")}
                  data-handler={"resetDemoState()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"restart_alt"}
                  </span>
                  {actions.text("\n          Reset Simulator\n        ")}
                </button>
              </div>
            </div>

            <div
              className={
                "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 bg-surface-container-low p-2 rounded-xl shadow-sm"
              }
            >
              <button
                data-action-text={"STAGE 01 Discovery & CTA"}
                id={"tab-1"}
                type="button"
                aria-label={actions.text("STAGE 01 Discovery & CTA")}
                data-handler={"switchStage(1)"}
                className={
                  actions.visible("tab-1", true)
                    ? "journey-tab px-3 py-3 rounded-lg text-left transition-all bg-primary text-on-primary shadow-sm"
                    : "journey-tab px-3 py-3 rounded-lg text-left transition-all bg-primary text-on-primary shadow-sm hidden"
                }
              >
                <span
                  className={
                    "block font-label-md text-label-md opacity-80 mb-1"
                  }
                >
                  {actions.text("STAGE 01")}
                </span>
                <span
                  className={"block font-headline-sm text-headline-sm truncate"}
                >
                  {actions.text("Discovery & CTA")}
                </span>
              </button>
              <button
                data-action-text={"STAGE 02 Trial Intro Modal"}
                id={"tab-2"}
                type="button"
                aria-label={actions.text("STAGE 02 Trial Intro Modal")}
                data-handler={"switchStage(2)"}
                className={
                  actions.visible("tab-2", true)
                    ? "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container"
                    : "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container hidden"
                }
              >
                <span
                  className={
                    "block font-label-md text-label-md opacity-60 mb-1"
                  }
                >
                  {actions.text("STAGE 02")}
                </span>
                <span
                  className={"block font-headline-sm text-headline-sm truncate"}
                >
                  {actions.text("Trial Intro Modal")}
                </span>
              </button>
              <button
                data-action-text={"STAGE 03 Live Playground"}
                id={"tab-3"}
                type="button"
                aria-label={actions.text("STAGE 03 Live Playground")}
                data-handler={"switchStage(3)"}
                className={
                  actions.visible("tab-3", true)
                    ? "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container"
                    : "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container hidden"
                }
              >
                <span
                  className={
                    "block font-label-md text-label-md opacity-60 mb-1"
                  }
                >
                  {actions.text("STAGE 03")}
                </span>
                <span
                  className={"block font-headline-sm text-headline-sm truncate"}
                >
                  {actions.text("Live Playground")}
                </span>
              </button>
              <button
                data-action-text={"STAGE 04 Response Viewer"}
                id={"tab-4"}
                type="button"
                aria-label={actions.text("STAGE 04 Response Viewer")}
                data-handler={"switchStage(4)"}
                className={
                  actions.visible("tab-4", true)
                    ? "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container"
                    : "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container hidden"
                }
              >
                <span
                  className={
                    "block font-label-md text-label-md opacity-60 mb-1"
                  }
                >
                  {actions.text("STAGE 04")}
                </span>
                <span
                  className={"block font-headline-sm text-headline-sm truncate"}
                >
                  {actions.text("Response Viewer")}
                </span>
              </button>
              <button
                data-action-text={"STAGE 05 Trial Exhausted"}
                id={"tab-5"}
                type="button"
                aria-label={actions.text("STAGE 05 Trial Exhausted")}
                data-handler={"switchStage(5)"}
                className={
                  actions.visible("tab-5", true)
                    ? "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container"
                    : "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container hidden"
                }
              >
                <span
                  className={
                    "block font-label-md text-label-md opacity-60 mb-1"
                  }
                >
                  {actions.text("STAGE 05")}
                </span>
                <span
                  className={"block font-headline-sm text-headline-sm truncate"}
                >
                  {actions.text("Trial Exhausted")}
                </span>
              </button>
              <button
                data-action-text={"STAGE 06 Error & Rate Limits"}
                id={"tab-6"}
                type="button"
                aria-label={actions.text("STAGE 06 Error & Rate Limits")}
                data-handler={"switchStage(6)"}
                className={
                  actions.visible("tab-6", true)
                    ? "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container"
                    : "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container hidden"
                }
              >
                <span
                  className={
                    "block font-label-md text-label-md opacity-60 mb-1"
                  }
                >
                  {actions.text("STAGE 06")}
                </span>
                <span
                  className={"block font-headline-sm text-headline-sm truncate"}
                >
                  {actions.text("Error & Rate Limits")}
                </span>
              </button>
              <button
                data-action-text={"STAGE 07 Pro Context Switch"}
                id={"tab-7"}
                type="button"
                aria-label={actions.text("STAGE 07 Pro Context Switch")}
                data-handler={"switchStage(7)"}
                className={
                  actions.visible("tab-7", true)
                    ? "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container"
                    : "journey-tab px-3 py-3 rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container hidden"
                }
              >
                <span
                  className={
                    "block font-label-md text-label-md opacity-60 mb-1"
                  }
                >
                  {actions.text("STAGE 07")}
                </span>
                <span
                  className={"block font-headline-sm text-headline-sm truncate"}
                >
                  {actions.text("Pro Context Switch")}
                </span>
              </button>
            </div>
          </div>

          <main className={"w-full max-w-7xl mx-auto px-6 lg:px-12 pb-24"}>
            <div
              id={"stage-content-1"}
              className={
                actions.visible("stage-content-1", true)
                  ? "journey-panel space-y-8"
                  : "journey-panel space-y-8 hidden"
              }
            >
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-8"}>
                <div
                  className={
                    "lg:col-span-2 bg-surface-container-low p-8 rounded-xl shadow-sm flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-center justify-between mb-6"}>
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={
                            "w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-on-primary"
                          }
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[28px]"}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {"neurology"}
                          </span>
                        </div>
                        <div>
                          <h2
                            className={
                              "font-headline-md text-headline-md text-on-surface"
                            }
                          >
                            {actions.text("NeuralEmbed v3.2 Engine")}
                          </h2>
                          <p
                            className={
                              "font-body-sm text-body-sm text-on-surface-variant"
                            }
                          >
                            {actions.text(
                              "State-of-the-art vector embeddings with 1536 dimensions and sub-10ms latency.",
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className={
                          "px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md flex items-center gap-1.5 shadow-sm"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"bolt"}
                        </span>
                        {actions.text(
                          "\n                Free 100-Request Sandbox Trial\n              ",
                        )}
                      </div>
                    </div>

                    <div
                      className={
                        "bg-surface-container-lowest p-4 rounded-xl mb-6 shadow-sm flex items-center justify-between"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded font-code-sm font-bold"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                        <span
                          className={
                            "font-code-md text-code-md text-on-surface"
                          }
                        >
                          {actions.text(
                            "https://api.apihub.dev/v3/embeddings/generate",
                          )}
                        </span>
                      </div>
                      <button
                        data-action-text={"content_copy"}
                        className={
                          "text-on-surface-variant hover:text-on-surface transition-colors p-1"
                        }
                        title={actions.text("Copy Endpoint")}
                        type="button"
                        aria-label={actions.text("Copy")}
                        data-handler={"copyEndpoint()"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"content_copy"}
                        </span>
                      </button>
                    </div>
                    <div className={"grid grid-cols-3 gap-4 mb-6"}>
                      <div
                        className={"bg-surface-container-lowest p-4 rounded-xl"}
                      >
                        <span
                          className={
                            "block font-label-md text-label-md text-on-surface-variant mb-1"
                          }
                        >
                          {actions.text("LATENCY")}
                        </span>
                        <span
                          className={
                            "font-headline-sm text-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("12ms avg")}
                        </span>
                      </div>
                      <div
                        className={"bg-surface-container-lowest p-4 rounded-xl"}
                      >
                        <span
                          className={
                            "block font-label-md text-label-md text-on-surface-variant mb-1"
                          }
                        >
                          {actions.text("UPTIME")}
                        </span>
                        <span
                          className={
                            "font-headline-sm text-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("99.99%")}
                        </span>
                      </div>
                      <div
                        className={"bg-surface-container-lowest p-4 rounded-xl"}
                      >
                        <span
                          className={
                            "block font-label-md text-label-md text-on-surface-variant mb-1"
                          }
                        >
                          {actions.text("AUTH TYPE")}
                        </span>
                        <span
                          className={
                            "font-headline-sm text-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("Bearer Token")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between pt-6 border-t border-outline-variant/20"
                    }
                  >
                    <div
                      className={
                        "flex items-center gap-2 text-on-surface-variant"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"verified"}
                      </span>
                      <span className={"font-body-sm text-body-sm"}>
                        {actions.text(
                          "Zero credit card required for sandbox test",
                        )}
                      </span>
                    </div>
                    <button
                      data-action-text={"Try API Now arrow_forward"}
                      className={
                        "px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md"
                      }
                      type="button"
                      aria-label={actions.text("Try API Now")}
                      data-handler={"switchStage(2)"}
                    >
                      {actions.text(
                        "\n              Try API Now\n              ",
                      )}
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"arrow_forward"}
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-low p-8 rounded-xl shadow-sm flex flex-col justify-between"
                  }
                >
                  <div>
                    <h3
                      className={
                        "font-headline-sm text-headline-sm text-on-surface mb-4"
                      }
                    >
                      {actions.text("Provider Verification")}
                    </h3>
                    <div className={"flex items-center gap-3 mb-6"}>
                      <div
                        className={
                          "w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm"
                        }
                      >
                        {actions.text("NE")}
                      </div>
                      <div>
                        <h4
                          className={
                            "font-headline-sm text-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("NeuralEdge Inc.")}
                        </h4>
                        <p
                          className={
                            "font-body-sm text-body-sm text-on-surface-variant"
                          }
                        >
                          {actions.text("Verified Enterprise Partner")}
                        </p>
                      </div>
                    </div>
                    <div className={"space-y-4 mb-6"}>
                      <div className={"flex justify-between text-body-sm"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Active Sandboxes")}
                        </span>
                        <span className={"font-code-md text-on-surface"}>
                          {actions.text("14,280 today")}
                        </span>
                      </div>
                      <div className={"flex justify-between text-body-sm"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Success Rate")}
                        </span>
                        <span className={"font-code-md text-on-surface"}>
                          {actions.text("99.8%")}
                        </span>
                      </div>
                      <div className={"flex justify-between text-body-sm"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Trial Limit")}
                        </span>
                        <span className={"font-code-md text-on-surface"}>
                          {actions.text("100 Requests / Key")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={"p-4 bg-surface-container-lowest rounded-xl"}>
                    <p
                      className={
                        "font-body-sm text-body-sm text-on-surface-variant italic"
                      }
                    >
                      {actions.text(
                        '"Testing NeuralEmbed took under 30 seconds. The sandbox trial gave us exact telemetry before scaling to production."',
                      )}
                    </p>
                    <span
                      className={
                        "block font-label-md text-label-md text-on-surface mt-2"
                      }
                    >
                      {actions.text("— Lead Architect, FinScale")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              id={"stage-content-2"}
              className={
                actions.visible("stage-content-2", false)
                  ? "journey-panel space-y-8"
                  : "journey-panel space-y-8 hidden"
              }
            >
              <div
                className={
                  "max-w-2xl mx-auto bg-surface-container-low p-8 rounded-xl shadow-xl relative overflow-hidden"
                }
              >
                <div
                  className={
                    "absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"
                  }
                ></div>
                <div className={"text-center mb-8"}>
                  <div
                    className={
                      "w-16 h-16 bg-primary text-on-primary rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-md"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[32px]"}
                    >
                      {"rocket_launch"}
                    </span>
                  </div>
                  <h2
                    className={
                      "font-headline-lg text-headline-lg text-on-surface mb-2"
                    }
                  >
                    {actions.text("Welcome to Your Sandbox Trial")}
                  </h2>
                  <p
                    className={
                      "font-body-md text-body-md text-on-surface-variant"
                    }
                  >
                    {actions.text(
                      "Test the NeuralEmbed v3.2 API instantly with zero configuration, pre-provisioned ephemeral credentials, and full response telemetry.",
                    )}
                  </p>
                </div>
                <div className={"space-y-4 mb-8"}>
                  <div
                    className={
                      "flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl"
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"done"}
                      </span>
                    </div>
                    <div>
                      <h4
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("100 Free Requests Included")}
                      </h4>
                      <p
                        className={
                          "font-body-sm text-body-sm text-on-surface-variant"
                        }
                      >
                        {actions.text(
                          "Full access to production-grade endpoints with rate-limiting simulation.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl"
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"done"}
                      </span>
                    </div>
                    <div>
                      <h4
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Instant Ephemeral API Key")}
                      </h4>
                      <p
                        className={
                          "font-body-sm text-body-sm text-on-surface-variant"
                        }
                      >
                        {actions.text("Generated automatically on launch: ")}
                        <code
                          className={
                            "font-code-sm bg-surface-container px-2 py-0.5 rounded text-primary"
                          }
                        >
                          {"nh_sandbox_x89f2..."}
                        </code>
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl"
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"done"}
                      </span>
                    </div>
                    <div>
                      <h4
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Seamless Upgrade Path")}
                      </h4>
                      <p
                        className={
                          "font-body-sm text-body-sm text-on-surface-variant"
                        }
                      >
                        {actions.text(
                          "Convert your sandbox key to a live production subscription with one click when ready.",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={"flex items-center justify-end gap-4"}>
                  <button
                    data-action-text={"Back"}
                    className={
                      "px-6 py-3 text-on-surface-variant hover:text-on-surface font-label-md text-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Back")}
                    data-handler={"switchStage(1)"}
                  >
                    {actions.text("Back")}
                  </button>
                  <button
                    data-action-text={"Launch Live Playground"}
                    className={
                      "px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-md"
                    }
                    type="button"
                    aria-label={actions.text("Launch Live Playground")}
                    data-handler={"switchStage(3)"}
                  >
                    {actions.text(
                      "\n            Launch Live Playground\n          ",
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div
              id={"stage-content-3"}
              className={
                actions.visible("stage-content-3", false)
                  ? "journey-panel space-y-6"
                  : "journey-panel space-y-6 hidden"
              }
            >
              <div
                className={
                  "bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
                }
              >
                <div className={"flex items-center gap-4 w-full md:w-auto"}>
                  <div
                    className={
                      "w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center font-headline-sm"
                    }
                  >
                    {actions.text("NP")}
                  </div>
                  <div>
                    <div className={"flex items-center gap-2"}>
                      <h3
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Interactive Playground")}
                      </h3>
                      <span
                        className={
                          "px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full font-label-md text-[11px]"
                        }
                      >
                        {actions.text("Active Session")}
                      </span>
                    </div>
                    <p
                      className={
                        "font-code-sm text-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("Key: nh_sandbox_x89f2...99a")}
                    </p>
                  </div>
                </div>

                <div className={"flex flex-col items-end w-full md:w-72"}>
                  <div
                    className={
                      "flex justify-between w-full font-label-md text-label-md mb-1.5"
                    }
                  >
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Trial Requests Remaining")}
                    </span>
                    <span
                      className={"font-code-md text-primary font-bold"}
                      id={"trial-counter"}
                    >
                      {actions.text("94 / 100")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden"
                    }
                  >
                    <div
                      className={
                        "bg-primary h-full transition-all duration-300"
                      }
                      id={"trial-progress-bar"}
                      style={{ width: "94%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6"}>
                <div
                  className={
                    "bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-center justify-between mb-4"}>
                      <span
                        className={
                          "font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
                        }
                      >
                        {actions.text("Request Payload (JSON)")}
                      </span>
                      <div className={"flex items-center gap-2"}>
                        <button
                          data-action-text={"Load Sample"}
                          className={
                            "text-primary font-label-md text-label-md hover:underline"
                          }
                          type="button"
                          aria-label={actions.text("Load Sample")}
                          data-handler={"loadSamplePayload()"}
                        >
                          {actions.text("Load Sample")}
                        </button>
                      </div>
                    </div>
                    <div
                      className={
                        "bg-surface-container-lowest p-4 rounded-xl font-code-md text-code-md text-on-surface mb-6 relative"
                      }
                    >
                      <textarea
                        className={
                          "w-full h-48 bg-transparent resize-none focus:outline-none font-code-md text-on-surface"
                        }
                        id={"request-payload-input"}
                        spellCheck={"false"}
                        defaultValue={
                          '{\n  "model": "neural-embed-v3",\n  "input": "Enterprise API monetization and developer experience at scale.",\n  "encoding_format": "float",\n  "dimensions": 1536\n}'
                        }
                      ></textarea>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between pt-4 border-t border-outline-variant/20"
                    }
                  >
                    <span className={"font-code-sm text-on-surface-variant"}>
                      {actions.text("POST /v3/embeddings/generate")}
                    </span>
                    <button
                      data-action-text={"play_arrow Send Request"}
                      className={
                        "px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md"
                      }
                      id={"send-request-btn"}
                      type="button"
                      aria-label={actions.text("Send Request")}
                      data-handler={"executePlaygroundRequest()"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"play_arrow"}
                      </span>
                      {actions.text(
                        "\n              Send Request\n            ",
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-low p-6 rounded-xl shadow-sm flex flex-col justify-between"
                  }
                >
                  <div>
                    <div className={"flex items-center justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"
                          }
                        >
                          {actions.text("Response Viewer")}
                        </span>
                        <span
                          id={"response-status-badge"}
                          className={
                            actions.visible("response-status-badge", true)
                              ? "px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded font-code-sm font-bold"
                              : "px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded font-code-sm font-bold hidden"
                          }
                        >
                          {actions.text("200 OK")}
                        </span>
                      </div>
                      <span
                        id={"response-latency"}
                        className={
                          actions.visible("response-latency", true)
                            ? "font-code-sm text-on-surface-variant"
                            : "font-code-sm text-on-surface-variant hidden"
                        }
                      >
                        {actions.text("14ms")}
                      </span>
                    </div>
                    <div
                      className={
                        "bg-surface-container-lowest p-4 rounded-xl font-code-md text-code-md text-on-surface h-56 overflow-y-auto relative mb-4"
                      }
                    >
                      <div
                        id={"response-loading-state"}
                        className={
                          actions.visible("response-loading-state", false)
                            ? "absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center"
                            : "absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center hidden"
                        }
                      >
                        <div className={"flex items-center gap-3"}>
                          <div
                            className={
                              "w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"
                            }
                          ></div>
                          <span className={"font-body-md text-on-surface"}>
                            {actions.text("Executing trial request...")}
                          </span>
                        </div>
                      </div>
                      <pre
                        id={"response-json-output"}
                        className={
                          actions.visible("response-json-output", true)
                            ? "text-on-surface"
                            : "text-on-surface hidden"
                        }
                      >
                        <span className={"text-indigo-600"}>{"{"}</span>
                        <span className={"text-blue-600"}>{'"object"'}</span>
                        {": "}
                        <span className={"text-emerald-600"}>{'"list"'}</span>
                        {",\n  "}
                        <span className={"text-blue-600"}>{'"data"'}</span>
                        {": [\n    {\n      "}
                        <span className={"text-blue-600"}>{'"object"'}</span>
                        {": "}
                        <span className={"text-emerald-600"}>
                          {'"embedding"'}
                        </span>
                        {",\n      "}
                        <span className={"text-blue-600"}>{'"index"'}</span>
                        {": "}
                        <span className={"text-amber-600"}>{"0"}</span>
                        {",\n      "}
                        <span className={"text-blue-600"}>{'"embedding"'}</span>
                        {": [\n        "}
                        <span className={"text-amber-600"}>{"-0.0142"}</span>
                        {", "}
                        <span className={"text-amber-600"}>{"0.0381"}</span>
                        {", "}
                        <span className={"text-amber-600"}>{"-0.0092"}</span>
                        {", "}
                        <span className={"text-amber-600"}>{"..."}</span>
                        {"\n      ]\n    }\n  ],\n  "}
                        <span className={"text-blue-600"}>{'"usage"'}</span>
                        {": {\n    "}
                        <span className={"text-blue-600"}>
                          {'"prompt_tokens"'}
                        </span>
                        {": "}
                        <span className={"text-amber-600"}>{"12"}</span>
                        {",\n    "}
                        <span className={"text-blue-600"}>
                          {'"total_tokens"'}
                        </span>
                        {": "}
                        <span className={"text-amber-600"}>{"12"}</span>
                        {"\n  }\n"}
                        <span className={"text-indigo-600"}>{"}"}</span>
                      </pre>
                    </div>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between pt-4 border-t border-outline-variant/20"
                    }
                  >
                    <span className={"font-code-sm text-on-surface-variant"}>
                      {actions.text("Response size: 1.2 KB")}
                    </span>
                    <button
                      data-action-text={
                        "Simulate Trial Exhaustion arrow_forward"
                      }
                      className={
                        "text-primary font-label-md text-label-md hover:underline flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("Simulate Trial Exhaustion")}
                      data-handler={"switchStage(5)"}
                    >
                      {actions.text(
                        "\n              Simulate Trial Exhaustion ",
                      )}
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"arrow_forward"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              id={"stage-content-5"}
              className={
                actions.visible("stage-content-5", false)
                  ? "journey-panel space-y-8"
                  : "journey-panel space-y-8 hidden"
              }
            >
              <div
                className={
                  "bg-error-container p-6 rounded-xl flex items-center justify-between shadow-sm"
                }
              >
                <div className={"flex items-center gap-4"}>
                  <div
                    className={
                      "w-12 h-12 bg-error text-on-error rounded-xl flex items-center justify-center shrink-0"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[24px]"}
                    >
                      {"warning"}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={
                        "font-headline-sm text-headline-sm text-on-error-container mb-1"
                      }
                    >
                      {actions.text("Sandbox Trial Limit Reached")}
                    </h3>
                    <p
                      className={
                        "font-body-sm text-body-sm text-on-error-container/80"
                      }
                    >
                      {actions.text(
                        "You have successfully consumed all 100 complimentary sandbox requests for NeuralEmbed v3.2.",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"Upgrade to Pro"}
                  className={
                    "px-6 py-3 bg-error text-on-error rounded-lg font-label-md text-label-md hover:bg-error/90 transition-colors shadow-md"
                  }
                  type="button"
                  aria-label={actions.text("Upgrade to Pro")}
                  data-handler={"switchStage(7)"}
                >
                  {actions.text("\n          Upgrade to Pro\n        ")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-low p-8 rounded-xl shadow-sm text-center relative overflow-hidden"
                }
              >
                <div className={"max-w-xl mx-auto py-8"}>
                  <div
                    className={
                      "w-16 h-16 bg-surface-container-high rounded-full mx-auto flex items-center justify-center text-on-surface-variant mb-4"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[32px]"}
                    >
                      {"lock"}
                    </span>
                  </div>
                  <h2
                    className={
                      "font-headline-md text-headline-md text-on-surface mb-2"
                    }
                  >
                    {actions.text("Playground Locked")}
                  </h2>
                  <p
                    className={
                      "font-body-md text-body-md text-on-surface-variant mb-6"
                    }
                  >
                    {actions.text(
                      "To continue testing and unlock production rate limits (10,000 req/min), subscribe to an API Hub plan or apply your active subscription key.",
                    )}
                  </p>
                  <div
                    className={
                      "flex flex-col sm:flex-row items-center justify-center gap-4"
                    }
                  >
                    <button
                      data-action-text={"bolt View Plans & Pricing"}
                      className={
                        "w-full sm:w-auto px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text("View Plans & Pricing")}
                      data-handler={"switchStage(7)"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"bolt"}
                      </span>
                      {actions.text(
                        "\n              View Plans & Pricing\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={"Explore Error States"}
                      className={
                        "w-full sm:w-auto px-8 py-3 bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
                      }
                      type="button"
                      aria-label={actions.text("Explore Error States")}
                      data-handler={"switchStage(6)"}
                    >
                      {actions.text(
                        "\n              Explore Error States\n            ",
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              id={"stage-content-6"}
              className={
                actions.visible("stage-content-6", false)
                  ? "journey-panel space-y-6"
                  : "journey-panel space-y-6 hidden"
              }
            >
              <div
                className={"bg-surface-container-low p-6 rounded-xl shadow-sm"}
              >
                <h3
                  className={
                    "font-headline-sm text-headline-sm text-on-surface mb-2"
                  }
                >
                  {actions.text("Error & Rate Limit Simulator")}
                </h3>
                <p
                  className={
                    "font-body-sm text-body-sm text-on-surface-variant mb-6"
                  }
                >
                  {actions.text(
                    "Test how API Hub handles validation errors, rate limit exhaustion, and authentication failures with standardized RFC 7807 payloads.",
                  )}
                </p>

                <div className={"flex flex-wrap gap-3 mb-8"}>
                  <button
                    data-action-text={"400 Bad Request (Validation)"}
                    className={
                      "px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all bg-surface-container-high text-on-surface shadow-sm"
                    }
                    id={"err-btn-400"}
                    type="button"
                    aria-label={actions.text("400 Bad Request (Validation)")}
                    data-handler={"setErrorState(400)"}
                  >
                    {actions.text(
                      "\n            400 Bad Request (Validation)\n          ",
                    )}
                  </button>
                  <button
                    data-action-text={"429 Rate Limit Exceeded"}
                    className={
                      "px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all text-on-surface-variant hover:bg-surface-container"
                    }
                    id={"err-btn-429"}
                    type="button"
                    aria-label={actions.text("429 Rate Limit Exceeded")}
                    data-handler={"setErrorState(429)"}
                  >
                    {actions.text(
                      "\n            429 Rate Limit Exceeded\n          ",
                    )}
                  </button>
                  <button
                    data-action-text={"401 Unauthorized (Auth Required)"}
                    className={
                      "px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all text-on-surface-variant hover:bg-surface-container"
                    }
                    id={"err-btn-401"}
                    type="button"
                    aria-label={actions.text(
                      "401 Unauthorized (Auth Required)",
                    )}
                    data-handler={"setErrorState(401)"}
                  >
                    {actions.text(
                      "\n            401 Unauthorized (Auth Required)\n          ",
                    )}
                  </button>
                </div>

                <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                  <div
                    className={
                      "lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm"
                    }
                  >
                    <div className={"flex items-center justify-between mb-4"}>
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={
                            "px-3 py-1 bg-error-container text-on-error-container rounded font-code-sm font-bold"
                          }
                          id={"err-code-badge"}
                        >
                          {actions.text("400 Bad Request")}
                        </span>
                        <span
                          className={"font-code-sm text-on-surface-variant"}
                        >
                          {actions.text("application/problem+json")}
                        </span>
                      </div>
                      <span className={"font-code-sm text-on-surface-variant"}>
                        {actions.text("Timestamp: Just now")}
                      </span>
                    </div>
                    <pre
                      className={
                        "font-code-md text-code-md text-on-surface overflow-x-auto"
                      }
                      id={"err-json-output"}
                    >
                      <span className={"text-indigo-600"}>{"{"}</span>
                      <span className={"text-blue-600"}>{'"type"'}</span>
                      {": "}
                      <span className={"text-emerald-600"}>
                        {'"https://apihub.dev/errors/validation-error"'}
                      </span>
                      {",\n  "}
                      <span className={"text-blue-600"}>{'"title"'}</span>
                      {": "}
                      <span className={"text-emerald-600"}>
                        {'"Invalid Request Payload"'}
                      </span>
                      {",\n  "}
                      <span className={"text-blue-600"}>{'"status"'}</span>
                      {": "}
                      <span className={"text-amber-600"}>{"400"}</span>
                      {",\n  "}
                      <span className={"text-blue-600"}>{'"detail"'}</span>
                      {": "}
                      <span className={"text-emerald-600"}>
                        {
                          "\"The 'dimensions' property must be one of [512, 1024, 1536]. Provided: 2048.\""
                        }
                      </span>
                      {",\n  "}
                      <span className={"text-blue-600"}>{'"instance"'}</span>
                      {": "}
                      <span className={"text-emerald-600"}>
                        {'"/v3/embeddings/generate?req_id=98f2b"'}
                      </span>
                      <span className={"text-indigo-600"}>{"}"}</span>
                    </pre>
                  </div>

                  <div
                    className={
                      "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                    }
                  >
                    <div>
                      <h4
                        className={
                          "font-headline-sm text-headline-sm text-on-surface mb-2"
                        }
                        id={"err-recovery-title"}
                      >
                        {actions.text("Validation Recovery")}
                      </h4>
                      <p
                        className={
                          "font-body-sm text-body-sm text-on-surface-variant mb-6"
                        }
                        id={"err-recovery-desc"}
                      >
                        {actions.text(
                          "Review payload parameters against the OpenAPI schema spec. Ensure dimension size aligns with model constraints.",
                        )}
                      </p>
                    </div>
                    <button
                      data-action-text={"Return to Playground"}
                      className={
                        "w-full py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-md text-center"
                      }
                      type="button"
                      aria-label={actions.text("Return to Playground")}
                      data-handler={"switchStage(3)"}
                    >
                      {actions.text(
                        "\n              Return to Playground\n            ",
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              id={"stage-content-7"}
              className={
                actions.visible("stage-content-7", false)
                  ? "journey-panel space-y-8"
                  : "journey-panel space-y-8 hidden"
              }
            >
              <div
                className={"bg-surface-container-low p-8 rounded-xl shadow-sm"}
              >
                <div className={"max-w-3xl mx-auto text-center mb-8"}>
                  <span
                    className={
                      "px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md mb-2 inline-block"
                    }
                  >
                    {actions.text("Production Transition")}
                  </span>
                  <h2
                    className={
                      "font-headline-lg text-headline-lg text-on-surface mb-2"
                    }
                  >
                    {actions.text("Subscribed Access Context Switcher")}
                  </h2>
                  <p
                    className={
                      "font-body-md text-body-md text-on-surface-variant"
                    }
                  >
                    {actions.text(
                      "Seamlessly toggle between your Active Enterprise Subscription Key and Sandbox mode. Instantly unlock production rate limits and higher quotas.",
                    )}
                  </p>
                </div>

                <div
                  className={
                    "max-w-xl mx-auto bg-surface-container-lowest p-2 rounded-xl shadow-sm flex items-center mb-8"
                  }
                >
                  <button
                    data-action-text={"Sandbox Mode (Trial)"}
                    className={
                      "flex-1 py-3 px-4 rounded-lg font-label-md text-label-md transition-all text-on-surface-variant"
                    }
                    id={"context-btn-sandbox"}
                    type="button"
                    aria-label={actions.text("Sandbox Mode (Trial)")}
                    data-handler={"setContextMode('sandbox')"}
                  >
                    {actions.text(
                      "\n            Sandbox Mode (Trial)\n          ",
                    )}
                  </button>
                  <button
                    data-action-text={"Enterprise Pro (Active)"}
                    className={
                      "flex-1 py-3 px-4 rounded-lg font-label-md text-label-md transition-all bg-primary text-on-primary shadow-sm"
                    }
                    id={"context-btn-pro"}
                    type="button"
                    aria-label={actions.text("Enterprise Pro (Active)")}
                    data-handler={"setContextMode('pro')"}
                  >
                    {actions.text(
                      "\n            Enterprise Pro (Active)\n          ",
                    )}
                  </button>
                </div>

                <div
                  className={
                    "max-w-xl mx-auto bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-6"
                  }
                  id={"context-card-details"}
                >
                  <div className={"flex items-center justify-between"}>
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center"
                        }
                        id={"context-icon-bg"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[20px]"}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {"verified"}
                        </span>
                      </div>
                      <div>
                        <h4
                          className={
                            "font-headline-sm text-headline-sm text-on-surface"
                          }
                          id={"context-title"}
                        >
                          {actions.text("Enterprise Pro Subscription")}
                        </h4>
                        <p
                          className={
                            "font-body-sm text-body-sm text-on-surface-variant"
                          }
                          id={"context-subtitle"}
                        >
                          {actions.text(
                            "Unlimited high-concurrency production tier",
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        "px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-label-md text-xs"
                      }
                      id={"context-status-pill"}
                    >
                      {actions.text("Active")}
                    </span>
                  </div>
                  <div
                    className={
                      "space-y-3 pt-4 border-t border-outline-variant/20"
                    }
                  >
                    <div className={"flex justify-between text-body-sm"}>
                      <span className={"text-on-surface-variant"}>
                        {actions.text("Active API Key")}
                      </span>
                      <span
                        className={"font-code-md text-on-surface font-bold"}
                        id={"context-key-display"}
                      >
                        {actions.text("nh_live_98v72f...39x")}
                      </span>
                    </div>
                    <div className={"flex justify-between text-body-sm"}>
                      <span className={"text-on-surface-variant"}>
                        {actions.text("Rate Limit Quota")}
                      </span>
                      <span
                        className={"font-code-md text-on-surface"}
                        id={"context-quota-display"}
                      >
                        {actions.text("10,000 Requests / min")}
                      </span>
                    </div>
                    <div className={"flex justify-between text-body-sm"}>
                      <span className={"text-on-surface-variant"}>
                        {actions.text("SLA Guarantee")}
                      </span>
                      <span
                        className={"font-code-md text-on-surface"}
                        id={"context-sla-display"}
                      >
                        {actions.text("99.99% Uptime SLA")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "pt-4 border-t border-outline-variant/20 flex items-center justify-between"
                    }
                  >
                    <button
                      data-action-text={"content_copy Copy Production Key"}
                      className={
                        "text-primary font-label-md text-label-md hover:underline flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("Copy Production Key")}
                      data-handler={"copyActiveKey()"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"content_copy"}
                      </span>
                      {actions.text(" Copy Production Key\n            ")}
                    </button>
                    <button
                      data-action-text={"Test in Playground"}
                      className={
                        "px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-md"
                      }
                      type="button"
                      aria-label={actions.text("Test in Playground")}
                      data-handler={"switchStage(3)"}
                    >
                      {actions.text(
                        "\n              Test in Playground\n            ",
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
