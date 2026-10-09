import { useScreenActions } from "../features/screen-actions";
export default function Screen45() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full bg-surface"}>
          <div
            className={
              "max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 flex flex-col gap-6"
            }
          >
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              }
            >
              <div
                className={
                  "flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto"
                }
              >
                <div className={"flex items-center gap-3"}>
                  <span
                    className={
                      "px-3 py-1 bg-primary-container text-on-primary-container rounded font-code-sm uppercase tracking-wider font-semibold"
                    }
                  >
                    {actions.text("POST")}
                  </span>
                  <div className={"flex flex-col"}>
                    <span
                      className={
                        "text-label-md text-on-surface-variant font-label-md"
                      }
                    >
                      {actions.text("Neural LLM v4")}
                    </span>
                    <span
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("/v1/llm/inference")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "hidden md:block h-8 w-[1px] bg-outline-variant/40"
                  }
                ></div>
                <div
                  className={
                    "flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg w-full md:w-auto overflow-x-auto"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[16px] text-on-surface-variant"
                    }
                  >
                    {"link"}
                  </span>
                  <span
                    className={
                      "font-code-md text-on-surface text-xs whitespace-nowrap"
                    }
                  >
                    {actions.text("https://api.apihub.com/v1/llm/inference")}
                  </span>
                  <button
                    data-action-text={"content_copy"}
                    className={
                      "ml-2 text-on-surface-variant hover:text-primary transition-colors flex items-center"
                    }
                    title={actions.text("Copy URL")}
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
              </div>
              <div
                className={
                  "flex items-center gap-4 w-full md:w-auto justify-between md:justify-end"
                }
              >
                <div
                  className={
                    "hidden xl:flex items-center gap-2 text-body-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg"
                  }
                >
                  <span
                    className={
                      "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                    }
                  ></span>
                  <span>{actions.text("94 / 100 Free Trials remaining")}</span>
                </div>
                <div
                  className={
                    "flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[16px] text-on-surface-variant"
                    }
                  >
                    {"key"}
                  </span>
                  <span className={"font-code-md text-xs text-on-surface"}>
                    {actions.text("nh_live_98v...")}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-low px-4 py-3 rounded-lg flex items-center justify-between text-body-sm text-on-surface-variant"
              }
            >
              <div className={"flex items-center gap-2"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-[18px] text-primary"
                  }
                >
                  {"security"}
                </span>
                <span>
                  {actions.text(
                    "Requests are proxied securely through the API HUB Gateway with zero-log edge routing.",
                  )}
                </span>
              </div>
              <div className={"hidden md:flex items-center gap-4 text-code-sm"}>
                <span className={"text-emerald-600 font-medium"}>
                  {actions.text("Region: us-east-1")}
                </span>
                <span>{actions.text("Latency: ~24ms")}</span>
              </div>
            </div>

            <div className={"flex items-center gap-2 overflow-x-auto pb-2"}>
              <span
                className={
                  "text-label-md text-on-surface-variant uppercase tracking-wider shrink-0 mr-2"
                }
              >
                {actions.text("Mock State:")}
              </span>
              <button
                data-action-text={"Success 200"}
                className={
                  "px-3 py-1.5 rounded-lg text-code-sm font-code-sm bg-primary text-on-primary transition-all shrink-0"
                }
                id={"btn-success"}
                type="button"
                aria-label={actions.text("Success 200")}
                data-handler={"setMockState('success')"}
              >
                {actions.text("Success 200")}
              </button>
              <button
                data-action-text={"Validation Error 400"}
                className={
                  "px-3 py-1.5 rounded-lg text-code-sm font-code-sm bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all shrink-0"
                }
                id={"btn-validation"}
                type="button"
                aria-label={actions.text("Validation Error 400")}
                data-handler={"setMockState('validation')"}
              >
                {actions.text("Validation Error 400")}
              </button>
              <button
                data-action-text={"Unauthorized 401"}
                className={
                  "px-3 py-1.5 rounded-lg text-code-sm font-code-sm bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all shrink-0"
                }
                id={"btn-unauthorized"}
                type="button"
                aria-label={actions.text("Unauthorized 401")}
                data-handler={"setMockState('unauthorized')"}
              >
                {actions.text("Unauthorized 401")}
              </button>
              <button
                data-action-text={"Rate Limit 429"}
                className={
                  "px-3 py-1.5 rounded-lg text-code-sm font-code-sm bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all shrink-0"
                }
                id={"btn-ratelimit"}
                type="button"
                aria-label={actions.text("Rate Limit 429")}
                data-handler={"setMockState('ratelimit')"}
              >
                {actions.text("Rate Limit 429")}
              </button>
              <button
                data-action-text={"Gateway Error 502"}
                className={
                  "px-3 py-1.5 rounded-lg text-code-sm font-code-sm bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all shrink-0"
                }
                id={"btn-gateway"}
                type="button"
                aria-label={actions.text("Gateway Error 502")}
                data-handler={"setMockState('gateway')"}
              >
                {actions.text("Gateway Error 502")}
              </button>
              <button
                data-action-text={"Trial Exhausted"}
                className={
                  "px-3 py-1.5 rounded-lg text-code-sm font-code-sm bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all shrink-0"
                }
                id={"btn-exhausted"}
                type="button"
                aria-label={actions.text("Trial Exhausted")}
                data-handler={"setMockState('exhausted')"}
              >
                {actions.text("Trial Exhausted")}
              </button>
            </div>

            <div
              className={"grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"}
            >
              <div
                className={
                  "bg-surface-container-lowest rounded-xl shadow-sm flex flex-col h-full overflow-hidden"
                }
              >
                <div
                  className={
                    "flex items-center border-b border-outline-variant/20 px-6 pt-4 gap-6 bg-surface-container-low/50"
                  }
                >
                  <button
                    data-action-text={"Body"}
                    id={"rtab-body"}
                    type="button"
                    aria-label={actions.text("Body")}
                    data-handler={"switchReqTab('body')"}
                    className={
                      actions.visible("rtab-body", true)
                        ? "pb-3 text-body-sm font-label-md text-primary border-b-2 border-primary transition-all"
                        : "pb-3 text-body-sm font-label-md text-primary border-b-2 border-primary transition-all hidden"
                    }
                  >
                    {actions.text("Body")}
                  </button>
                  <button
                    data-action-text={"Params (1)"}
                    id={"rtab-params"}
                    type="button"
                    aria-label={actions.text("Params (1)")}
                    data-handler={"switchReqTab('params')"}
                    className={
                      actions.visible("rtab-params", true)
                        ? "pb-3 text-body-sm font-label-md text-on-surface-variant hover:text-on-surface transition-all"
                        : "pb-3 text-body-sm font-label-md text-on-surface-variant hover:text-on-surface transition-all hidden"
                    }
                  >
                    {actions.text("Params (1)")}
                  </button>
                  <button
                    data-action-text={"Headers (3)"}
                    id={"rtab-headers"}
                    type="button"
                    aria-label={actions.text("Headers (3)")}
                    data-handler={"switchReqTab('headers')"}
                    className={
                      actions.visible("rtab-headers", true)
                        ? "pb-3 text-body-sm font-label-md text-on-surface-variant hover:text-on-surface transition-all"
                        : "pb-3 text-body-sm font-label-md text-on-surface-variant hover:text-on-surface transition-all hidden"
                    }
                  >
                    {actions.text("Headers (3)")}
                  </button>
                  <button
                    data-action-text={"Authentication"}
                    id={"rtab-auth"}
                    type="button"
                    aria-label={actions.text("Authentication")}
                    data-handler={"switchReqTab('auth')"}
                    className={
                      actions.visible("rtab-auth", true)
                        ? "pb-3 text-body-sm font-label-md text-on-surface-variant hover:text-on-surface transition-all"
                        : "pb-3 text-body-sm font-label-md text-on-surface-variant hover:text-on-surface transition-all hidden"
                    }
                  >
                    {actions.text("Authentication")}
                  </button>
                </div>

                <div className={"p-6 flex flex-col gap-5 flex-grow"}>
                  <div
                    id={"rcontent-body"}
                    className={
                      actions.visible("rcontent-body", true)
                        ? "flex flex-col gap-4"
                        : "flex flex-col gap-4 hidden"
                    }
                  >
                    <div
                      className={
                        "flex items-center justify-between text-code-sm text-on-surface-variant"
                      }
                    >
                      <span>{actions.text("Payload (JSON)")}</span>
                      <div className={"flex items-center gap-3"}>
                        <span
                          className={"text-emerald-600 flex items-center gap-1"}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[14px]"}
                          >
                            {"check_circle"}
                          </span>
                          {actions.text(" Valid JSON")}
                        </span>
                        <button
                          data-action-text={"Format"}
                          className={"hover:text-primary transition-colors"}
                          type="button"
                          aria-label={actions.text("Format")}
                        >
                          {actions.text("Format")}
                        </button>
                      </div>
                    </div>

                    <div
                      className={
                        "bg-surface-container-low rounded-lg p-4 font-code-md text-xs relative overflow-x-auto text-on-surface flex gap-4"
                      }
                    >
                      <div
                        className={
                          "flex flex-col text-right text-outline select-none opacity-60"
                        }
                      >
                        <span>{actions.text("1")}</span>
                        <span>{actions.text("2")}</span>
                        <span>{actions.text("3")}</span>
                        <span>{actions.text("4")}</span>
                        <span>{actions.text("5")}</span>
                        <span>{actions.text("6")}</span>
                        <span>{actions.text("7")}</span>
                      </div>

                      <div
                        className={
                          "flex-grow focus:outline-none font-code-md leading-relaxed whitespace-pre"
                        }
                        contentEditable={"true"}
                        spellCheck={"false"}
                      >
                        {actions.text("{\n  ")}
                        <span
                          className={"text-primary-container font-semibold"}
                        >
                          {actions.text('"model"')}
                        </span>
                        {actions.text(": ")}
                        <span className={"text-emerald-700"}>
                          {actions.text('"neural-llm-v4-turbo"')}
                        </span>
                        {actions.text(",\n  ")}
                        <span
                          className={"text-primary-container font-semibold"}
                        >
                          {actions.text('"prompt"')}
                        </span>
                        {actions.text(": ")}
                        <span className={"text-emerald-700"}>
                          {actions.text(
                            '"Explain quantum error correction in three concise bullet points."',
                          )}
                        </span>
                        {actions.text(",\n  ")}
                        <span
                          className={"text-primary-container font-semibold"}
                        >
                          {actions.text('"max_tokens"')}
                        </span>
                        {actions.text(": ")}
                        <span className={"text-amber-700"}>
                          {actions.text("256")}
                        </span>
                        {actions.text(",\n  ")}
                        <span
                          className={"text-primary-container font-semibold"}
                        >
                          {actions.text('"temperature"')}
                        </span>
                        {actions.text(": ")}
                        <span className={"text-amber-700"}>
                          {actions.text("0.2")}
                        </span>
                        {actions.text(",\n  ")}
                        <span
                          className={"text-primary-container font-semibold"}
                        >
                          {actions.text('"stream"')}
                        </span>
                        {actions.text(": ")}
                        <span className={"text-purple-700"}>
                          {actions.text("false")}
                        </span>
                        {actions.text("\n}")}
                      </div>
                    </div>
                    <div className={"flex flex-wrap gap-2 pt-1"}>
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-code-sm text-on-surface-variant"
                        }
                      >
                        {actions.text("model (required)")}
                      </span>
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-code-sm text-on-surface-variant"
                        }
                      >
                        {actions.text("prompt (required)")}
                      </span>
                      <span
                        className={
                          "px-2 py-1 bg-surface-container rounded text-code-sm text-on-surface-variant"
                        }
                      >
                        {actions.text("max_tokens (optional)")}
                      </span>
                    </div>
                  </div>

                  <div
                    id={"rcontent-params"}
                    className={
                      actions.visible("rcontent-params", false)
                        ? "flex flex-col gap-3"
                        : "flex flex-col gap-3 hidden"
                    }
                  >
                    <div
                      className={"text-code-sm text-on-surface-variant mb-1"}
                    >
                      {actions.text("Query Parameters")}
                    </div>
                    <div className={"grid grid-cols-12 gap-2 items-center"}>
                      <input
                        className={
                          "col-span-5 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                        }
                        type={"text"}
                        defaultValue={"include_usage"}
                        aria-label={actions.text("Input")}
                      />
                      <input
                        className={
                          "col-span-6 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                        }
                        type={"text"}
                        defaultValue={"true"}
                        aria-label={actions.text("Input")}
                      />
                      <button
                        data-action-text={"remove"}
                        className={
                          "col-span-1 text-outline hover:text-error text-center"
                        }
                        type="button"
                        aria-label={actions.text("remove")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"remove"}
                        </span>
                      </button>
                    </div>
                    <button
                      data-action-text={"+ Add Parameter"}
                      className={
                        "self-start text-primary text-body-sm font-label-md mt-2 flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("+ Add Parameter")}
                    >
                      {actions.text("+ Add Parameter")}
                    </button>
                  </div>

                  <div
                    id={"rcontent-headers"}
                    className={
                      actions.visible("rcontent-headers", false)
                        ? "flex flex-col gap-3"
                        : "flex flex-col gap-3 hidden"
                    }
                  >
                    <div
                      className={"text-code-sm text-on-surface-variant mb-1"}
                    >
                      {actions.text("HTTP Headers")}
                    </div>
                    <div className={"space-y-2"}>
                      <div className={"grid grid-cols-12 gap-2 items-center"}>
                        <input
                          className={
                            "col-span-5 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                          }
                          type={"text"}
                          defaultValue={"Authorization"}
                          aria-label={actions.text("Input")}
                        />
                        <input
                          className={
                            "col-span-6 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                          }
                          type={"text"}
                          defaultValue={"Bearer nh_live_98v..."}
                          aria-label={actions.text("Input")}
                        />
                        <button
                          data-action-text={"remove"}
                          className={
                            "col-span-1 text-outline hover:text-error text-center"
                          }
                          type="button"
                          aria-label={actions.text("remove")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"remove"}
                          </span>
                        </button>
                      </div>
                      <div className={"grid grid-cols-12 gap-2 items-center"}>
                        <input
                          className={
                            "col-span-5 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                          }
                          type={"text"}
                          defaultValue={"Content-Type"}
                          aria-label={actions.text("Input")}
                        />
                        <input
                          className={
                            "col-span-6 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                          }
                          type={"text"}
                          defaultValue={"application/json"}
                          aria-label={actions.text("Input")}
                        />
                        <button
                          data-action-text={"remove"}
                          className={
                            "col-span-1 text-outline hover:text-error text-center"
                          }
                          type="button"
                          aria-label={actions.text("remove")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"remove"}
                          </span>
                        </button>
                      </div>
                      <div className={"grid grid-cols-12 gap-2 items-center"}>
                        <input
                          className={
                            "col-span-5 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                          }
                          type={"text"}
                          defaultValue={"X-Request-Source"}
                          aria-label={actions.text("Input")}
                        />
                        <input
                          className={
                            "col-span-6 bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                          }
                          type={"text"}
                          defaultValue={"api-hub-playground"}
                          aria-label={actions.text("Input")}
                        />
                        <button
                          data-action-text={"remove"}
                          className={
                            "col-span-1 text-outline hover:text-error text-center"
                          }
                          type="button"
                          aria-label={actions.text("remove")}
                        >
                          <span
                            aria-hidden={true}
                            className={"material-symbols-outlined text-[18px]"}
                          >
                            {"remove"}
                          </span>
                        </button>
                      </div>
                    </div>
                    <button
                      data-action-text={"+ Add Header"}
                      className={
                        "self-start text-primary text-body-sm font-label-md mt-2 flex items-center gap-1"
                      }
                      type="button"
                      aria-label={actions.text("+ Add Header")}
                    >
                      {actions.text("+ Add Header")}
                    </button>
                  </div>

                  <div
                    id={"rcontent-auth"}
                    className={
                      actions.visible("rcontent-auth", false)
                        ? "flex flex-col gap-4"
                        : "flex flex-col gap-4 hidden"
                    }
                  >
                    <div className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("Authentication Type")}
                    </div>
                    <select
                      className={
                        "bg-surface-container-low px-3 py-2 rounded text-body-sm text-on-surface border border-outline-variant/30"
                      }
                      aria-label={actions.text("Input")}
                    >
                      <option value={"Bearer Token"}>
                        {actions.text("Bearer Token")}
                      </option>
                      <option value={"API Key Header (X-API-Key)"}>
                        {actions.text("API Key Header (X-API-Key)")}
                      </option>
                      <option value={"Basic Auth"}>
                        {actions.text("Basic Auth")}
                      </option>
                    </select>
                    <div className={"flex flex-col gap-2"}>
                      <label className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("Token Value")}
                      </label>
                      <input
                        className={
                          "bg-surface-container-low px-3 py-2 rounded text-code-sm text-on-surface border border-outline-variant/30"
                        }
                        type={"password"}
                        defaultValue={"nh_live_98v7asdf897asdf"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                  </div>

                  <div
                    className={
                      "mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between"
                    }
                  >
                    <div
                      className={
                        "flex items-center gap-2 text-code-sm text-on-surface-variant"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"bolt"}
                      </span>
                      <span>
                        {actions.text("Press ")}
                        <kbd
                          className={
                            "px-1.5 py-0.5 bg-surface-container rounded text-on-surface border border-outline-variant/40 font-code-sm"
                          }
                        >
                          {actions.text("⌘Enter")}
                        </kbd>
                        {actions.text(" to send")}
                      </span>
                    </div>
                    <button
                      data-action-text={"Send Request send"}
                      className={
                        "px-6 py-2.5 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 active:scale-95"
                      }
                      type="button"
                      aria-label={actions.text("Send Request")}
                      data-handler={"triggerSendRequest()"}
                    >
                      <span>{actions.text("Send Request")}</span>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"send"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-[#0B1220] rounded-xl shadow-lg flex flex-col h-full overflow-hidden text-slate-100 border border-slate-800"
                }
              >
                <div
                  className={
                    "flex flex-wrap items-center justify-between px-6 py-4 bg-[#111c30] border-b border-slate-800 gap-3"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <span
                      id={"resp-badge"}
                      className={
                        actions.visible("resp-badge", true)
                          ? "px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-code-sm font-semibold"
                          : "px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-code-sm font-semibold hidden"
                      }
                    >
                      {actions.text("200 OK")}
                    </span>
                    <div
                      className={
                        "flex items-center gap-4 text-slate-400 text-code-sm"
                      }
                    >
                      <span
                        id={"resp-time"}
                        className={
                          actions.visible("resp-time", true)
                            ? "flex items-center gap-1"
                            : "flex items-center gap-1 hidden"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"timer"}
                        </span>
                        {actions.text(" 142ms")}
                      </span>
                      <span
                        id={"resp-size"}
                        className={
                          actions.visible("resp-size", true)
                            ? "flex items-center gap-1"
                            : "flex items-center gap-1 hidden"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"data_object"}
                        </span>
                        {actions.text(" 1.2 KB")}
                      </span>
                    </div>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <div
                      className={
                        "flex items-center bg-slate-900 rounded p-0.5 border border-slate-800"
                      }
                    >
                      <button
                        data-action-text={"Formatted"}
                        id={"rtab-formatted"}
                        type="button"
                        aria-label={actions.text("Formatted")}
                        data-handler={"switchRespTab('formatted')"}
                        className={
                          actions.visible("rtab-formatted", true)
                            ? "px-2.5 py-1 rounded text-code-sm bg-slate-800 text-slate-200 transition-all"
                            : "px-2.5 py-1 rounded text-code-sm bg-slate-800 text-slate-200 transition-all hidden"
                        }
                      >
                        {actions.text("Formatted")}
                      </button>
                      <button
                        data-action-text={"Raw"}
                        id={"rtab-raw"}
                        type="button"
                        aria-label={actions.text("Raw")}
                        data-handler={"switchRespTab('raw')"}
                        className={
                          actions.visible("rtab-raw", true)
                            ? "px-2.5 py-1 rounded text-code-sm text-slate-400 hover:text-slate-200 transition-all"
                            : "px-2.5 py-1 rounded text-code-sm text-slate-400 hover:text-slate-200 transition-all hidden"
                        }
                      >
                        {actions.text("Raw")}
                      </button>
                      <button
                        data-action-text={"Headers"}
                        id={"rtab-resp-headers"}
                        type="button"
                        aria-label={actions.text("Headers")}
                        data-handler={"switchRespTab('headers')"}
                        className={
                          actions.visible("rtab-resp-headers", true)
                            ? "px-2.5 py-1 rounded text-code-sm text-slate-400 hover:text-slate-200 transition-all"
                            : "px-2.5 py-1 rounded text-code-sm text-slate-400 hover:text-slate-200 transition-all hidden"
                        }
                      >
                        {actions.text("Headers")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "p-6 font-code-md text-xs relative overflow-x-auto min-h-[380px] flex flex-col justify-between"
                  }
                >
                  <div
                    id={"resp-loading"}
                    className={
                      actions.visible("resp-loading", false)
                        ? "absolute inset-0 bg-[#0B1220]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10"
                        : "absolute inset-0 bg-[#0B1220]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 hidden"
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
                      }
                    ></div>
                    <span
                      className={"text-slate-300 font-code-sm animate-pulse"}
                    >
                      {actions.text("Routing through API HUB Gateway...")}
                    </span>
                  </div>

                  <div
                    id={"rbody-formatted"}
                    className={
                      actions.visible("rbody-formatted", true)
                        ? "flex gap-4"
                        : "flex gap-4 hidden"
                    }
                  >
                    <div
                      className={
                        "flex flex-col text-right text-slate-600 select-none"
                      }
                    >
                      <span>{actions.text("1")}</span>
                      <span>{actions.text("2")}</span>
                      <span>{actions.text("3")}</span>
                      <span>{actions.text("4")}</span>
                      <span>{actions.text("5")}</span>
                      <span>{actions.text("6")}</span>
                      <span>{actions.text("7")}</span>
                      <span>{actions.text("8")}</span>
                      <span>{actions.text("9")}</span>
                      <span>{actions.text("10")}</span>
                      <span>{actions.text("11")}</span>
                      <span>{actions.text("12")}</span>
                      <span>{actions.text("13")}</span>
                    </div>
                    <pre
                      id={"rbody-code-text"}
                      className={
                        actions.visible("rbody-code-text", true)
                          ? "text-slate-300 font-code-md leading-relaxed m-0"
                          : "text-slate-300 font-code-md leading-relaxed m-0 hidden"
                      }
                    >
                      {"{\n  "}
                      <span className={"text-indigo-400"}>{'"id"'}</span>
                      {": "}
                      <span className={"text-emerald-300"}>
                        {'"chatcmpl-8v9a7sdf987"'}
                      </span>
                      {",\n  "}
                      <span className={"text-indigo-400"}>{'"object"'}</span>
                      {": "}
                      <span className={"text-emerald-300"}>
                        {'"chat.completion"'}
                      </span>
                      {",\n  "}
                      <span className={"text-indigo-400"}>{'"created"'}</span>
                      {": "}
                      <span className={"text-amber-300"}>{"1709823421"}</span>
                      {",\n  "}
                      <span className={"text-indigo-400"}>{'"model"'}</span>
                      {": "}
                      <span className={"text-emerald-300"}>
                        {'"neural-llm-v4-turbo"'}
                      </span>
                      {",\n  "}
                      <span className={"text-indigo-400"}>{'"choices"'}</span>
                      {": [\n    {\n      "}
                      <span className={"text-indigo-400"}>{'"index"'}</span>
                      {": "}
                      <span className={"text-amber-300"}>{"0"}</span>
                      {",\n      "}
                      <span className={"text-indigo-400"}>{'"message"'}</span>
                      {": {\n        "}
                      <span className={"text-indigo-400"}>{'"role"'}</span>
                      {": "}
                      <span className={"text-emerald-300"}>
                        {'"assistant"'}
                      </span>
                      {",\n        "}
                      <span className={"text-indigo-400"}>{'"content"'}</span>
                      {": "}
                      <span className={"text-emerald-300"}>
                        {
                          '"1. Quantum states can be protected by entangling logical qubits with ancillary physical qubits in a surface code.\\n2. Syndrome measurements detect bit-flip and phase-flip errors without destroying the superposition.\\n3. Active feedback loops apply real-time corrective Pauli operations based on syndrome outcomes."'
                        }
                      </span>
                      {"\n      },\n      "}
                      <span className={"text-indigo-400"}>
                        {'"finish_reason"'}
                      </span>
                      {": "}
                      <span className={"text-emerald-300"}>{'"stop"'}</span>
                      {"\n    }\n  ],\n  "}
                      <span className={"text-indigo-400"}>{'"usage"'}</span>
                      {": {\n    "}
                      <span className={"text-indigo-400"}>
                        {'"prompt_tokens"'}
                      </span>
                      {": "}
                      <span className={"text-amber-300"}>{"19"}</span>
                      {",\n    "}
                      <span className={"text-indigo-400"}>
                        {'"completion_tokens"'}
                      </span>
                      {": "}
                      <span className={"text-amber-300"}>{"64"}</span>
                      {",\n    "}
                      <span className={"text-indigo-400"}>
                        {'"total_tokens"'}
                      </span>
                      {": "}
                      <span className={"text-amber-300"}>{"83"}</span>
                      {"\n  }\n}"}
                    </pre>
                  </div>

                  <div
                    id={"rbody-raw"}
                    className={
                      actions.visible("rbody-raw", false)
                        ? "text-slate-300 font-code-md whitespace-pre-wrap"
                        : "text-slate-300 font-code-md whitespace-pre-wrap hidden"
                    }
                  >
                    {actions.text(
                      '\n{"id":"chatcmpl-8v9a7sdf987","object":"chat.completion","created":1709823421,"model":"neural-llm-v4-turbo","choices":[{"index":0,"message":{"role":"assistant","content":"1. Quantum states can be protected by entangling logical qubits with ancillary physical qubits in a surface code.\\n2. Syndrome measurements detect bit-flip and phase-flip errors without destroying the superposition.\\n3. Active feedback loops apply real-time corrective Pauli operations based on syndrome outcomes."},"finish_reason":"stop"}],"usage":{"prompt_tokens":19,"completion_tokens":64,"total_tokens":83}}\n          ',
                    )}
                  </div>

                  <div
                    id={"rbody-headers"}
                    className={
                      actions.visible("rbody-headers", false)
                        ? "flex flex-col gap-2 text-slate-300 font-code-md"
                        : "flex flex-col gap-2 text-slate-300 font-code-md hidden"
                    }
                  >
                    <div
                      className={
                        "flex justify-between border-b border-slate-800 py-1"
                      }
                    >
                      <span className={"text-slate-500"}>
                        {actions.text("content-type")}
                      </span>
                      <span className={"text-slate-200"}>
                        {actions.text("application/json; charset=utf-8")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex justify-between border-b border-slate-800 py-1"
                      }
                    >
                      <span className={"text-slate-500"}>
                        {actions.text("x-apihub-request-id")}
                      </span>
                      <span className={"text-slate-200"}>
                        {actions.text("req_987asdf0987asdf")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex justify-between border-b border-slate-800 py-1"
                      }
                    >
                      <span className={"text-slate-500"}>
                        {actions.text("x-ratelimit-remaining")}
                      </span>
                      <span className={"text-slate-200"}>
                        {actions.text("93")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex justify-between border-b border-slate-800 py-1"
                      }
                    >
                      <span className={"text-slate-500"}>
                        {actions.text("x-gateway-latency")}
                      </span>
                      <span className={"text-slate-200"}>
                        {actions.text("24ms")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex justify-between border-b border-slate-800 py-1"
                      }
                    >
                      <span className={"text-slate-500"}>
                        {actions.text("strict-transport-security")}
                      </span>
                      <span className={"text-slate-200"}>
                        {actions.text("max-age=31536000")}
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      "mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between"
                    }
                  >
                    <div
                      className={
                        "flex items-center gap-2 text-slate-400 text-code-sm"
                      }
                    >
                      <span
                        className={"w-2 h-2 rounded-full bg-emerald-400"}
                      ></span>
                      <span>
                        {actions.text("Stream completed successfully")}
                      </span>
                    </div>
                    <div className={"flex items-center gap-2"}>
                      <button
                        data-action-text={"content_copy Copy"}
                        className={
                          "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-code-sm transition-colors flex items-center gap-1.5"
                        }
                        type="button"
                        aria-label={actions.text("Copy")}
                        data-handler={"copyResponse()"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"content_copy"}
                        </span>
                        <span>{actions.text("Copy")}</span>
                      </button>
                      <button
                        data-action-text={"download Download"}
                        className={
                          "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-code-sm transition-colors flex items-center gap-1.5"
                        }
                        type="button"
                        aria-label={actions.text("Download")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"download"}
                        </span>
                        <span>{actions.text("Download")}</span>
                      </button>
                      <button
                        data-action-text={"bookmark Save Snippet"}
                        className={
                          "px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-code-sm transition-colors flex items-center gap-1.5 font-medium"
                        }
                        type="button"
                        aria-label={actions.text("Save Snippet")}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"bookmark"}
                        </span>
                        <span>{actions.text("Save Snippet")}</span>
                      </button>
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
