import { useScreenActions } from "../features/screen-actions";
export default function Screen10() {
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
              "relative overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-surface-container py-16 px-6 lg:px-12"
            }
          >
            <div
              className={
                "max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
              }
            >
              <div>
                <div className={"flex items-center gap-3 mb-3"}>
                  <span
                    className={
                      "px-3 py-1 bg-primary-container text-on-primary-container text-label-md rounded-full font-code-sm"
                    }
                  >
                    {actions.text("v1.4.0-sprint1")}
                  </span>
                  <span
                    className={
                      "flex items-center gap-1.5 text-code-sm text-on-surface-variant"
                    }
                  >
                    <span
                      className={
                        "w-2 h-2 rounded-full bg-emerald-500 inline-block"
                      }
                    ></span>
                    {actions.text(" WCAG 2.1 AA Compliant\n          ")}
                  </span>
                </div>
                <h1
                  className={
                    "text-headline-lg font-headline-lg text-on-surface mb-3"
                  }
                >
                  {actions.text("API HUB Design System & Component Library")}
                </h1>
                <p className={"text-body-lg text-on-surface-variant max-w-2xl"}>
                  {actions.text(
                    "\n          Elite engineering primitives, tokens, and accessible components built for high-velocity API platforms. Copy-paste ready, fully interactive, and meticulously aligned to our design language.\n        ",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-3"}>
                <button
                  data-action-text={"explore Explore Library"}
                  className={
                    "px-5 py-2.5 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Explore Library")}
                  data-handler={
                    "document.getElementById('section-buttons').scrollIntoView({behavior: 'smooth'})"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"explore"}
                  </span>
                  {actions.text(" Explore Library\n        ")}
                </button>
                <button
                  data-action-text={"terminal npm i @apihub/ui"}
                  className={
                    "px-5 py-2.5 bg-surface-container text-on-surface rounded-lg text-body-md font-code-md hover:bg-surface-container-high transition-all flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("npm i @apihub/ui")}
                  data-handler={
                    "navigator.clipboard.writeText('npm i @apihub/components'); showToast('Installed package command copied!')"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"terminal"}
                  </span>
                  {actions.text(" npm i @apihub/ui\n        ")}
                </button>
              </div>
            </div>
          </div>

          <div
            className={
              "sticky top-16 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 lg:px-12"
            }
          >
            <div
              className={
                "max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-3 no-scrollbar"
              }
            >
              <a
                data-action-text={"1. Buttons"}
                className={
                  "px-4 py-2 rounded-lg text-body-sm font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all whitespace-nowrap active-tab"
                }
                href={"#section-buttons"}
              >
                {actions.text("1. Buttons")}
              </a>
              <a
                data-action-text={"2. Form Controls"}
                className={
                  "px-4 py-2 rounded-lg text-body-sm font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all whitespace-nowrap"
                }
                href={"#section-forms"}
              >
                {actions.text("2. Form Controls")}
              </a>
              <a
                data-action-text={"3. Data Display"}
                className={
                  "px-4 py-2 rounded-lg text-body-sm font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all whitespace-nowrap"
                }
                href={"#section-data"}
              >
                {actions.text("3. Data Display")}
              </a>
              <a
                data-action-text={"4. Navigation"}
                className={
                  "px-4 py-2 rounded-lg text-body-sm font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all whitespace-nowrap"
                }
                href={"#section-nav"}
              >
                {actions.text("4. Navigation")}
              </a>
              <a
                data-action-text={"5. Overlays"}
                className={
                  "px-4 py-2 rounded-lg text-body-sm font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all whitespace-nowrap"
                }
                href={"#section-overlays"}
              >
                {actions.text("5. Overlays")}
              </a>
              <a
                data-action-text={"6. Feedback"}
                className={
                  "px-4 py-2 rounded-lg text-body-sm font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all whitespace-nowrap"
                }
                href={"#section-feedback"}
              >
                {actions.text("6. Feedback")}
              </a>
              <a
                data-action-text={"7. Account & Roles"}
                className={
                  "px-4 py-2 rounded-lg text-body-sm font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all whitespace-nowrap"
                }
                href={"#section-account"}
              >
                {actions.text("7. Account & Roles")}
              </a>
            </div>
          </div>

          <div
            className={
              "fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
            }
            id={"toast-container"}
          ></div>

          <div
            className={
              "max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col gap-20"
            }
          >
            <section
              className={"scroll-mt-28 flex flex-col gap-6"}
              id={"section-buttons"}
            >
              <div
                className={
                  "flex items-center justify-between border-b border-outline-variant/30 pb-4"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider block mb-1"
                    }
                  >
                    {actions.text("Section 01")}
                  </span>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Buttons & Interactive Triggers")}
                  </h2>
                </div>
                <span
                  className={
                    "px-3 py-1 bg-surface-container text-on-surface-variant rounded text-code-sm"
                  }
                >
                  {actions.text("WCAG AA Verified")}
                </span>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-6"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Variants & States")}
                    </h3>
                    <button
                      data-action-text={"code View Code"}
                      className={
                        "text-code-sm text-primary flex items-center gap-1 hover:underline"
                      }
                      type="button"
                      aria-label={actions.text("View Code")}
                      data-handler={"toggleCode('code-buttons')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"code"}
                      </span>
                      {actions.text(" View Code")}
                    </button>
                  </div>
                  <div className={"flex flex-wrap items-center gap-3"}>
                    <button
                      data-action-text={"Primary Action"}
                      className={
                        "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90 transition-colors shadow-sm"
                      }
                      type="button"
                      aria-label={actions.text("Primary Action")}
                    >
                      {actions.text("Primary Action")}
                    </button>
                    <button
                      data-action-text={"Secondary"}
                      className={
                        "px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg text-body-md font-label-md hover:bg-secondary-container/80 transition-colors"
                      }
                      type="button"
                      aria-label={actions.text("Secondary")}
                    >
                      {actions.text("Secondary")}
                    </button>
                    <button
                      data-action-text={"Outline"}
                      className={
                        "px-4 py-2 bg-surface border border-outline-variant text-on-surface rounded-lg text-body-md font-label-md hover:bg-surface-container transition-colors"
                      }
                      type="button"
                      aria-label={actions.text("Outline")}
                    >
                      {actions.text("Outline")}
                    </button>
                    <button
                      data-action-text={"Ghost"}
                      className={
                        "px-4 py-2 text-on-surface hover:bg-surface-container rounded-lg text-body-md font-label-md transition-colors"
                      }
                      type="button"
                      aria-label={actions.text("Ghost")}
                    >
                      {actions.text("Ghost")}
                    </button>
                    <button
                      data-action-text={"Destructive"}
                      className={
                        "px-4 py-2 bg-error text-on-error rounded-lg text-body-md font-label-md hover:bg-error/90 transition-colors"
                      }
                      type="button"
                      aria-label={actions.text("Destructive")}
                    >
                      {actions.text("Destructive")}
                    </button>
                  </div>
                  <div
                    className={
                      "flex flex-wrap items-center gap-3 pt-4 border-t border-outline-variant/20"
                    }
                  >
                    <button
                      data-action-text={"settings"}
                      className={
                        "p-2 bg-surface border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container transition-colors"
                      }
                      title={actions.text("Settings")}
                      type="button"
                      aria-label={actions.text("settings")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"settings"}
                      </span>
                    </button>
                    <button
                      data-action-text={"Disabled"}
                      className={
                        "px-4 py-2 bg-surface-container text-outline rounded-lg text-body-md font-label-md cursor-not-allowed opacity-60"
                      }
                      disabled={true}
                      type="button"
                      aria-label={actions.text("Disabled")}
                    >
                      {actions.text("Disabled")}
                    </button>
                    <button
                      data-action-text={"Processing..."}
                      className={
                        "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md flex items-center gap-2 cursor-wait"
                      }
                      type="button"
                      aria-label={actions.text("Processing...")}
                    >
                      <span
                        className={
                          "w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"
                        }
                      ></span>
                      {actions.text(" Processing...\n            ")}
                    </button>
                  </div>
                  <div
                    id={"code-buttons"}
                    className={
                      actions.visible("code-buttons", false)
                        ? "bg-inverse-surface text-inverse-on-surface p-4 rounded-lg font-code-sm overflow-x-auto"
                        : "bg-inverse-surface text-inverse-on-surface p-4 rounded-lg font-code-sm overflow-x-auto hidden"
                    }
                  >
                    {actions.text(
                      '\n            <button class="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md">Primary Action</button>\n          ',
                    )}
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-6"
                  }
                >
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface mb-2"
                      }
                    >
                      {actions.text("Button Scale & Dimensions")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Available in Small, Medium (default), and Large spatial footprints.",
                      )}
                    </p>
                  </div>
                  <div className={"flex flex-wrap items-center gap-4"}>
                    <button
                      data-action-text={"Small (py-1.5)"}
                      className={
                        "px-3 py-1.5 bg-primary text-on-primary rounded text-body-sm font-label-md"
                      }
                      type="button"
                      aria-label={actions.text("Small (py-1.5)")}
                    >
                      {actions.text("Small (py-1.5)")}
                    </button>
                    <button
                      data-action-text={"Medium (py-2)"}
                      className={
                        "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md"
                      }
                      type="button"
                      aria-label={actions.text("Medium (py-2)")}
                    >
                      {actions.text("Medium (py-2)")}
                    </button>
                    <button
                      data-action-text={"Large (py-3)"}
                      className={
                        "px-6 py-3 bg-primary text-on-primary rounded-xl text-body-lg font-label-md"
                      }
                      type="button"
                      aria-label={actions.text("Large (py-3)")}
                    >
                      {actions.text("Large (py-3)")}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={"scroll-mt-28 flex flex-col gap-6"}
              id={"section-forms"}
            >
              <div
                className={
                  "flex items-center justify-between border-b border-outline-variant/30 pb-4"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider block mb-1"
                    }
                  >
                    {actions.text("Section 02")}
                  </span>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Form Controls & Validation States")}
                  </h2>
                </div>
                <span
                  className={
                    "px-3 py-1 bg-surface-container text-on-surface-variant rounded text-code-sm"
                  }
                >
                  {actions.text("Interactive Inputs")}
                </span>
              </div>
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Text & Secure Fields")}
                  </h3>
                  <div className={"flex flex-col gap-1.5"}>
                    <label
                      className={
                        "text-label-md font-label-md text-on-surface flex items-center justify-between"
                      }
                    >
                      {actions.text("\n              API Client Name ")}
                      <span className={"text-error"}>
                        {actions.text("*Required")}
                      </span>
                    </label>
                    <input
                      data-source-placeholder={"e.g. production-auth-service"}
                      className={
                        "px-3.5 py-2 bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all font-code-md"
                      }
                      placeholder={actions.text("e.g. production-auth-service")}
                      type={"text"}
                      aria-label={actions.text("e.g. production-auth-service")}
                    />
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Used in gateway routing configurations.")}
                    </span>
                  </div>
                  <div className={"flex flex-col gap-1.5"}>
                    <label
                      className={"text-label-md font-label-md text-on-surface"}
                    >
                      {actions.text("API Secret Token")}
                    </label>
                    <div className={"relative flex items-center"}>
                      <input
                        className={
                          "w-full px-3.5 py-2 bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary font-code-md pr-10"
                        }
                        type={"password"}
                        defaultValue={"sk_live_983749283749283"}
                        aria-label={actions.text("Input")}
                      />
                      <button
                        data-action-text={"visibility"}
                        className={
                          "absolute right-3 text-outline hover:text-on-surface"
                        }
                        type="button"
                        aria-label={actions.text("View")}
                        data-handler={
                          "const i = this.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password';"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Selectors & Search")}
                  </h3>
                  <div className={"flex flex-col gap-1.5"}>
                    <label
                      className={"text-label-md font-label-md text-on-surface"}
                    >
                      {actions.text("Environment Gateway")}
                    </label>
                    <select
                      className={
                        "px-3.5 py-2 bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary"
                      }
                      aria-label={actions.text("Input")}
                    >
                      <option value={"us-east-1 (Primary Production)"}>
                        {actions.text("us-east-1 (Primary Production)")}
                      </option>
                      <option value={"eu-west-1 (Frankfurt Edge)"}>
                        {actions.text("eu-west-1 (Frankfurt Edge)")}
                      </option>
                      <option value={"ap-northeast-1 (Tokyo Relay)"}>
                        {actions.text("ap-northeast-1 (Tokyo Relay)")}
                      </option>
                    </select>
                  </div>
                  <div className={"flex flex-col gap-1.5"}>
                    <label
                      className={"text-label-md font-label-md text-on-surface"}
                    >
                      {actions.text("Search Endpoints")}
                    </label>
                    <div className={"relative flex items-center"}>
                      <span
                        aria-hidden={true}
                        className={
                          "absolute left-3.5 material-symbols-outlined text-outline text-[18px]"
                        }
                      >
                        {"search"}
                      </span>
                      <input
                        data-source-placeholder={"Filter by route (/v1/...)"}
                        className={
                          "w-full pl-10 pr-3.5 py-2 bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary font-code-md"
                        }
                        placeholder={actions.text("Filter by route (/v1/...)")}
                        type={"text"}
                        aria-label={actions.text("Filter by route (/v1/...)")}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Validation States")}
                  </h3>
                  <div className={"flex flex-col gap-1.5"}>
                    <label
                      className={"text-label-md font-label-md text-on-surface"}
                    >
                      {actions.text("Webhook URL (Error)")}
                    </label>
                    <input
                      className={
                        "px-3.5 py-2 bg-error-container/20 border border-error rounded-lg text-body-md text-error focus:outline-none font-code-md"
                      }
                      type={"text"}
                      defaultValue={"htts:/invalid-url.com"}
                      aria-label={actions.text("Input")}
                    />
                    <span
                      className={
                        "text-body-sm text-error flex items-center gap-1"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[14px]"}
                      >
                        {"error"}
                      </span>
                      {actions.text(
                        " Invalid protocol format. Must start with https://\n            ",
                      )}
                    </span>
                  </div>
                  <div className={"flex flex-col gap-1.5"}>
                    <label
                      className={"text-label-md font-label-md text-on-surface"}
                    >
                      {actions.text("Rate Limit Tier (Success)")}
                    </label>
                    <input
                      className={
                        "px-3.5 py-2 bg-surface border border-emerald-500 rounded-lg text-body-md text-on-surface focus:outline-none font-code-md"
                      }
                      type={"text"}
                      defaultValue={"Enterprise 10,000 req/min"}
                      aria-label={actions.text("Input")}
                    />
                    <span
                      className={
                        "text-body-sm text-emerald-600 flex items-center gap-1"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[14px]"}
                      >
                        {"check_circle"}
                      </span>
                      {actions.text(
                        " Quota successfully allocated.\n            ",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={"scroll-mt-28 flex flex-col gap-6"}
              id={"section-data"}
            >
              <div
                className={
                  "flex items-center justify-between border-b border-outline-variant/30 pb-4"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider block mb-1"
                    }
                  >
                    {actions.text("Section 03")}
                  </span>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Data Display, Tables & Skeletons")}
                  </h2>
                </div>
                <span
                  className={
                    "px-3 py-1 bg-surface-container text-on-surface-variant rounded text-code-sm"
                  }
                >
                  {actions.text("High Density Grid")}
                </span>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden"
                }
              >
                <div
                  className={
                    "p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Active API Endpoints")}
                    </h3>
                    <span
                      className={
                        "px-2.5 py-0.5 bg-primary-container text-on-primary-container rounded-full text-code-sm"
                      }
                    >
                      {actions.text("14 routes")}
                    </span>
                  </div>
                  <div className={"flex items-center gap-2"}>
                    <button
                      data-action-text={"Export JSON"}
                      className={
                        "px-3 py-1.5 bg-surface border border-outline-variant rounded text-body-sm hover:bg-surface-container"
                      }
                      type="button"
                      aria-label={actions.text("Export JSON")}
                    >
                      {actions.text("Export JSON")}
                    </button>
                    <button
                      data-action-text={"+ Add Route"}
                      className={
                        "px-3 py-1.5 bg-primary text-on-primary rounded text-body-sm hover:bg-primary/90"
                      }
                      type="button"
                      aria-label={actions.text("+ Add Route")}
                    >
                      {actions.text("+ Add Route")}
                    </button>
                  </div>
                </div>
                <div className={"overflow-x-auto"}>
                  <table className={"w-full text-left border-collapse"}>
                    <thead>
                      <tr
                        className={
                          "border-b border-outline-variant/30 text-label-md font-label-md text-on-surface-variant bg-surface-bright"
                        }
                      >
                        <th className={"p-4"}>
                          {actions.text("Method / Endpoint")}
                        </th>
                        <th className={"p-4"}>
                          {actions.text("Latency (p99)")}
                        </th>
                        <th className={"p-4"}>{actions.text("Status")}</th>
                        <th className={"p-4"}>
                          {actions.text("Requests / min")}
                        </th>
                        <th className={"p-4 text-right"}>
                          {actions.text("Actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={
                        "divide-y divide-outline-variant/20 text-body-md text-on-surface"
                      }
                    >
                      <tr
                        className={
                          "hover:bg-surface-container/50 transition-colors"
                        }
                        data-record="row-0"
                        hidden={
                          !actions.matches(
                            "GET /v1/clusters/us-east/metrics 42ms 200 OK 4,820 more_vert",
                          )
                        }
                      >
                        <td className={"p-4 flex items-center gap-3"}>
                          <span
                            className={
                              "px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded font-code-sm font-bold"
                            }
                          >
                            {actions.text("GET")}
                          </span>
                          <span className={"font-code-md"}>
                            {actions.text("/v1/clusters/us-east/metrics")}
                          </span>
                        </td>
                        <td
                          className={"p-4 font-code-md text-on-surface-variant"}
                        >
                          {actions.text("42ms")}
                        </td>
                        <td className={"p-4"}>
                          <span
                            className={
                              "px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-code-sm font-medium"
                            }
                          >
                            {actions.text("200 OK")}
                          </span>
                        </td>
                        <td className={"p-4 font-code-md"}>
                          {actions.text("4,820")}
                        </td>
                        <td className={"p-4 text-right"}>
                          <button
                            data-action-text={"more_vert"}
                            className={
                              "p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface"
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
                        </td>
                      </tr>
                      <tr
                        className={
                          "hover:bg-surface-container/50 transition-colors"
                        }
                        data-record="row-1"
                        hidden={
                          !actions.matches(
                            "POST /v1/auth/token/exchange 118ms 201 Created 1,250 more_vert",
                          )
                        }
                      >
                        <td className={"p-4 flex items-center gap-3"}>
                          <span
                            className={
                              "px-2 py-0.5 bg-indigo-500/10 text-primary rounded font-code-sm font-bold"
                            }
                          >
                            {actions.text("POST")}
                          </span>
                          <span className={"font-code-md"}>
                            {actions.text("/v1/auth/token/exchange")}
                          </span>
                        </td>
                        <td
                          className={"p-4 font-code-md text-on-surface-variant"}
                        >
                          {actions.text("118ms")}
                        </td>
                        <td className={"p-4"}>
                          <span
                            className={
                              "px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-code-sm font-medium"
                            }
                          >
                            {actions.text("201 Created")}
                          </span>
                        </td>
                        <td className={"p-4 font-code-md"}>
                          {actions.text("1,250")}
                        </td>
                        <td className={"p-4 text-right"}>
                          <button
                            data-action-text={"more_vert"}
                            className={
                              "p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface"
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
                        </td>
                      </tr>
                      <tr
                        className={
                          "hover:bg-surface-container/50 transition-colors"
                        }
                        data-record="row-2"
                        hidden={
                          !actions.matches(
                            "DEL /v1/webhooks/subscriptions/:id 310ms 429 Rate Limited 84 more_vert",
                          )
                        }
                      >
                        <td className={"p-4 flex items-center gap-3"}>
                          <span
                            className={
                              "px-2 py-0.5 bg-rose-500/10 text-error rounded font-code-sm font-bold"
                            }
                          >
                            {actions.text("DEL")}
                          </span>
                          <span className={"font-code-md"}>
                            {actions.text("/v1/webhooks/subscriptions/:id")}
                          </span>
                        </td>
                        <td
                          className={"p-4 font-code-md text-on-surface-variant"}
                        >
                          {actions.text("310ms")}
                        </td>
                        <td className={"p-4"}>
                          <span
                            className={
                              "px-2.5 py-1 bg-error-container text-on-error-container rounded-full text-code-sm font-medium"
                            }
                          >
                            {actions.text("429 Rate Limited")}
                          </span>
                        </td>
                        <td className={"p-4 font-code-md"}>
                          {actions.text("84")}
                        </td>
                        <td className={"p-4 text-right"}>
                          <button
                            data-action-text={"more_vert"}
                            className={
                              "p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface"
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
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  className={
                    "p-4 border-t border-outline-variant/30 flex items-center justify-between text-body-sm text-on-surface-variant bg-surface-bright"
                  }
                >
                  <span>
                    {actions.text("Showing ")}
                    <strong>{actions.text("1-3")}</strong>
                    {actions.text(" of ")}
                    <strong>{actions.text("14")}</strong>
                    {actions.text(" entries")}
                  </span>
                  <div className={"flex items-center gap-2"}>
                    <button
                      data-action-text={"Previous"}
                      className={
                        "px-3 py-1 bg-surface border border-outline-variant rounded opacity-50 cursor-not-allowed"
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
                        "px-3 py-1 bg-primary text-on-primary rounded font-bold"
                      }
                      type="button"
                      aria-label={actions.text("1")}
                    >
                      {actions.text("1")}
                    </button>
                    <button
                      data-action-text={"2"}
                      className={
                        "px-3 py-1 bg-surface border border-outline-variant rounded hover:bg-surface-container"
                      }
                      type="button"
                      aria-label={actions.text("2")}
                    >
                      {actions.text("2")}
                    </button>
                    <button
                      data-action-text={"3"}
                      className={
                        "px-3 py-1 bg-surface border border-outline-variant rounded hover:bg-surface-container"
                      }
                      type="button"
                      aria-label={actions.text("3")}
                    >
                      {actions.text("3")}
                    </button>
                    <button
                      data-action-text={"Next"}
                      className={
                        "px-3 py-1 bg-surface border border-outline-variant rounded hover:bg-surface-container"
                      }
                      type="button"
                      aria-label={actions.text("Next")}
                    >
                      {actions.text("Next")}
                    </button>
                  </div>
                </div>
              </div>

              <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Loading Skeleton Component")}
                  </h3>
                  <div className={"flex flex-col gap-3 animate-pulse"}>
                    <div
                      className={"h-6 bg-surface-container rounded w-3/4"}
                    ></div>
                    <div
                      className={"h-4 bg-surface-container rounded w-full"}
                    ></div>
                    <div
                      className={"h-4 bg-surface-container rounded w-5/6"}
                    ></div>
                    <div className={"flex gap-2 pt-2"}>
                      <div
                        className={"h-8 w-20 bg-surface-container rounded"}
                      ></div>
                      <div
                        className={"h-8 w-20 bg-surface-container rounded"}
                      ></div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center items-center text-center gap-3"
                  }
                >
                  <div
                    className={
                      "w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[24px]"}
                    >
                      {"inbox"}
                    </span>
                  </div>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Empty Table State")}
                  </h4>
                  <p
                    className={"text-body-sm text-on-surface-variant max-w-sm"}
                  >
                    {actions.text(
                      "No webhook events recorded in the last 24 hours. Trigger a test payload to verify connectivity.",
                    )}
                  </p>
                  <button
                    data-action-text={"Send Test Webhook"}
                    className={
                      "mt-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Send Test Webhook")}
                  >
                    {actions.text("Send Test Webhook")}
                  </button>
                </div>
              </div>
            </section>

            <section
              className={"scroll-mt-28 flex flex-col gap-6"}
              id={"section-nav"}
            >
              <div
                className={
                  "flex items-center justify-between border-b border-outline-variant/30 pb-4"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider block mb-1"
                    }
                  >
                    {actions.text("Section 04")}
                  </span>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Navigation Primitives & Menus")}
                  </h2>
                </div>
                <span
                  className={
                    "px-3 py-1 bg-surface-container text-on-surface-variant rounded text-code-sm"
                  }
                >
                  {actions.text("Breadcrumbs & Tabs")}
                </span>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-6"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Breadcrumbs & Segmented Tabs")}
                  </h3>

                  <nav
                    className={
                      "flex items-center gap-2 text-body-sm text-on-surface-variant"
                    }
                  >
                    <a
                      data-action-text={"home Dashboard"}
                      className={"hover:text-primary flex items-center gap-1"}
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"home"}
                      </span>
                      {actions.text(" Dashboard")}
                    </a>
                    <span>{actions.text("/")}</span>
                    <a
                      data-action-text={"API Catalog"}
                      className={"hover:text-primary"}
                      href={"#"}
                    >
                      {actions.text("API Catalog")}
                    </a>
                    <span>{actions.text("/")}</span>
                    <strong className={"text-on-surface"}>
                      {actions.text("Auth Service v2")}
                    </strong>
                  </nav>

                  <div className={"flex border-b border-outline-variant/30"}>
                    <button
                      data-action-text={"Overview"}
                      className={
                        "px-4 py-2 text-body-md font-label-md text-primary border-b-2 border-primary"
                      }
                      type="button"
                      aria-label={actions.text("Overview")}
                    >
                      {actions.text("Overview")}
                    </button>
                    <button
                      data-action-text={"Endpoints"}
                      className={
                        "px-4 py-2 text-body-md font-label-md text-on-surface-variant hover:text-on-surface"
                      }
                      type="button"
                      aria-label={actions.text("Endpoints")}
                    >
                      {actions.text("Endpoints")}
                    </button>
                    <button
                      data-action-text={"Webhooks"}
                      className={
                        "px-4 py-2 text-body-md font-label-md text-on-surface-variant hover:text-on-surface"
                      }
                      type="button"
                      aria-label={actions.text("Webhooks")}
                    >
                      {actions.text("Webhooks")}
                    </button>
                    <button
                      data-action-text={"Settings"}
                      className={
                        "px-4 py-2 text-body-md font-label-md text-on-surface-variant hover:text-on-surface"
                      }
                      type="button"
                      aria-label={actions.text("Settings")}
                    >
                      {actions.text("Settings")}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-6"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Dropdown Menu & Profile Snippet")}
                  </h3>
                  <div className={"flex items-center gap-6"}>
                    <div
                      className={
                        "w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 p-2 flex flex-col"
                      }
                    >
                      <div
                        className={
                          "px-3 py-2 border-b border-outline-variant/20 mb-1"
                        }
                      >
                        <p
                          className={
                            "text-label-md font-label-md text-on-surface"
                          }
                        >
                          {actions.text("alex.dev@apihub.io")}
                        </p>
                        <p className={"text-code-sm text-on-surface-variant"}>
                          {actions.text("Workspace Admin")}
                        </p>
                      </div>
                      <a
                        data-action-text={"person Profile Settings"}
                        className={
                          "px-3 py-2 rounded text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                        }
                        href={"#"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"person"}
                        </span>
                        {actions.text(" Profile Settings")}
                      </a>
                      <a
                        data-action-text={"api API Keys"}
                        className={
                          "px-3 py-2 rounded text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                        }
                        href={"#"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"api"}
                        </span>
                        {actions.text(" API Keys")}
                      </a>
                      <a
                        data-action-text={"logout Sign Out"}
                        className={
                          "px-3 py-2 rounded text-body-sm text-error hover:bg-error-container/20 flex items-center gap-2"
                        }
                        href={"#"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"logout"}
                        </span>
                        {actions.text(" Sign Out")}
                      </a>
                    </div>
                    <div className={"flex flex-col gap-2"}>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Contextual dropdowns feature keyboard navigation support, instant focus trapping, and soft shadow elevation.",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={"scroll-mt-28 flex flex-col gap-6"}
              id={"section-overlays"}
            >
              <div
                className={
                  "flex items-center justify-between border-b border-outline-variant/30 pb-4"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider block mb-1"
                    }
                  >
                    {actions.text("Section 05")}
                  </span>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Modals, Dialogs & Overlays")}
                  </h2>
                </div>
                <span
                  className={
                    "px-3 py-1 bg-surface-container text-on-surface-variant rounded text-code-sm"
                  }
                >
                  {actions.text("Interactive Triggers")}
                </span>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4"
                  }
                >
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface mb-2"
                      }
                    >
                      {actions.text("Standard Modal / Dialog")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Used for focused multi-step forms or configuration panels.",
                      )}
                    </p>
                  </div>
                  <button
                    data-action-text={"Launch Modal"}
                    className={
                      "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Launch Modal")}
                    data-handler={
                      "showModal('Standard Configuration Modal', 'This modal supports arbitrary configuration inputs, validation checking, and footer action buttons.')"
                    }
                  >
                    {actions.text("Launch Modal")}
                  </button>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4"
                  }
                >
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface mb-2"
                      }
                    >
                      {actions.text("Confirmation Dialog")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Prompts user for explicit confirmation before critical operations.",
                      )}
                    </p>
                  </div>
                  <button
                    data-action-text={"Trigger Confirm"}
                    className={
                      "px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg text-body-sm font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Trigger Confirm")}
                    data-handler={"showConfirmModal()"}
                  >
                    {actions.text("Trigger Confirm")}
                  </button>
                </div>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4"
                  }
                >
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface mb-2"
                      }
                    >
                      {actions.text("Destructive Action")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Warns about irreversible data deletion or cluster teardown.",
                      )}
                    </p>
                  </div>
                  <button
                    data-action-text={"Trigger Destructive"}
                    className={
                      "px-4 py-2 bg-error text-on-error rounded-lg text-body-sm font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Trigger Destructive")}
                    data-handler={"showDestructiveModal()"}
                  >
                    {actions.text("Trigger Destructive")}
                  </button>
                </div>
              </div>
            </section>

            <section
              className={"scroll-mt-28 flex flex-col gap-6"}
              id={"section-feedback"}
            >
              <div
                className={
                  "flex items-center justify-between border-b border-outline-variant/30 pb-4"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider block mb-1"
                    }
                  >
                    {actions.text("Section 06")}
                  </span>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Feedback, Toasts & Inline Alerts")}
                  </h2>
                </div>
                <span
                  className={
                    "px-3 py-1 bg-surface-container text-on-surface-variant rounded text-code-sm"
                  }
                >
                  {actions.text("Alerts & Spinners")}
                </span>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Inline Alerts")}
                  </h3>
                  <div
                    className={
                      "p-4 bg-emerald-500/10 text-emerald-800 rounded-lg flex items-start gap-3"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[20px] text-emerald-600"
                      }
                    >
                      {"check_circle"}
                    </span>
                    <div>
                      <h4 className={"text-label-md font-label-md"}>
                        {actions.text("Deployment Successful")}
                      </h4>
                      <p className={"text-body-sm"}>
                        {actions.text(
                          "Gateway version 2.4.1 has been propagated to all global edge nodes.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      "p-4 bg-error-container/20 text-on-error-container rounded-lg flex items-start gap-3"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[20px] text-error"
                      }
                    >
                      {"warning"}
                    </span>
                    <div>
                      <h4 className={"text-label-md font-label-md"}>
                        {actions.text("Rate Limit Threshold Reached")}
                      </h4>
                      <p className={"text-body-sm"}>
                        {actions.text(
                          "Your current billing tier has consumed 95% of monthly API allocations.",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Toast Notifications")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Click any button below to trigger a live floating notification toast.",
                    )}
                  </p>
                  <div className={"flex flex-wrap gap-3"}>
                    <button
                      data-action-text={"Success Toast"}
                      className={
                        "px-4 py-2 bg-emerald-600 text-on-primary rounded-lg text-body-sm font-label-md"
                      }
                      type="button"
                      aria-label={actions.text("Success Toast")}
                      data-handler={
                        "showToast('API key successfully generated and copied to clipboard!', 'success')"
                      }
                    >
                      {actions.text("Success Toast")}
                    </button>
                    <button
                      data-action-text={"Error Toast"}
                      className={
                        "px-4 py-2 bg-error text-on-error rounded-lg text-body-sm font-label-md"
                      }
                      type="button"
                      aria-label={actions.text("Error Toast")}
                      data-handler={
                        "showToast('Failed to connect to US-East cluster gateway.', 'error')"
                      }
                    >
                      {actions.text("Error Toast")}
                    </button>
                    <button
                      data-action-text={"Warning Toast"}
                      className={
                        "px-4 py-2 bg-amber-500 text-on-primary rounded-lg text-body-sm font-label-md"
                      }
                      type="button"
                      aria-label={actions.text("Warning Toast")}
                      data-handler={
                        "showToast('Scheduled maintenance starting in 15 minutes.', 'warning')"
                      }
                    >
                      {actions.text("Warning Toast")}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section
              className={"scroll-mt-28 flex flex-col gap-6"}
              id={"section-account"}
            >
              <div
                className={
                  "flex items-center justify-between border-b border-outline-variant/30 pb-4"
                }
              >
                <div>
                  <span
                    className={
                      "text-label-md font-label-md text-primary uppercase tracking-wider block mb-1"
                    }
                  >
                    {actions.text("Section 07")}
                  </span>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Account & Role Components")}
                  </h2>
                </div>
                <span
                  className={
                    "px-3 py-1 bg-surface-container text-on-surface-variant rounded text-code-sm"
                  }
                >
                  {actions.text("Auth & Permissions")}
                </span>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border-2 border-primary flex flex-col justify-between gap-4 relative"
                  }
                >
                  <span
                    className={
                      "absolute top-4 right-4 px-2 py-0.5 bg-primary text-on-primary rounded text-code-sm"
                    }
                  >
                    {actions.text("Selected")}
                  </span>
                  <div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[32px] text-primary mb-2"
                      }
                    >
                      {"admin_panel_settings"}
                    </span>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Workspace Administrator")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant mt-1"}>
                      {actions.text(
                        "Full control over billing, API gateways, team permission policies, and audit logs.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 pt-2 border-t border-outline-variant/20"
                    }
                  >
                    <span
                      className={
                        "px-2 py-1 bg-surface-container text-on-surface rounded text-code-sm"
                      }
                    >
                      {actions.text("All Scopes")}
                    </span>
                    <span
                      className={
                        "px-2 py-1 bg-surface-container text-on-surface rounded text-code-sm"
                      }
                    >
                      {actions.text("SSO Enforced")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 hover:border-primary transition-all flex flex-col justify-between gap-4 cursor-pointer"
                  }
                >
                  <div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[32px] text-on-surface-variant mb-2"
                      }
                    >
                      {"code"}
                    </span>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("API Developer")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant mt-1"}>
                      {actions.text(
                        "Create endpoints, manage webhooks, test routes via sandbox playground, view telemetry.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 pt-2 border-t border-outline-variant/20"
                    }
                  >
                    <span
                      className={
                        "px-2 py-1 bg-surface-container text-on-surface rounded text-code-sm"
                      }
                    >
                      {actions.text("Read/Write API")}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 hover:border-primary transition-all flex flex-col justify-between gap-4 cursor-pointer"
                  }
                >
                  <div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[32px] text-on-surface-variant mb-2"
                      }
                    >
                      {"visibility"}
                    </span>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Auditor / Observer")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant mt-1"}>
                      {actions.text(
                        "Read-only access to system logs, usage metrics, compliance reports, and security events.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "flex items-center gap-2 pt-2 border-t border-outline-variant/20"
                    }
                  >
                    <span
                      className={
                        "px-2 py-1 bg-surface-container text-on-surface rounded text-code-sm"
                      }
                    >
                      {actions.text("Read-Only")}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div
            id={"modal-backdrop"}
            className={
              actions.visible("modal-backdrop", false)
                ? "fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                : "fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden"
            }
          >
            <div
              id={"modal-box"}
              className={
                actions.visible("modal-box", true)
                  ? "bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 border border-outline-variant/30 transform transition-all scale-95 opacity-0"
                  : "bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 border border-outline-variant/30 transform transition-all scale-95 opacity-0 hidden"
              }
            >
              <div className={"flex items-center justify-between"}>
                <h3
                  id={"modal-title"}
                  className={
                    actions.visible("modal-title", true)
                      ? "text-headline-md font-headline-md text-on-surface"
                      : "text-headline-md font-headline-md text-on-surface hidden"
                  }
                >
                  {actions.text("Modal Title")}
                </h3>
                <button
                  data-action-text={"close"}
                  className={"p-1 text-outline hover:text-on-surface rounded"}
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeModal()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[20px]"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>
              <p
                id={"modal-desc"}
                className={
                  actions.visible("modal-desc", true)
                    ? "text-body-md text-on-surface-variant"
                    : "text-body-md text-on-surface-variant hidden"
                }
              >
                {actions.text("Modal description goes here...")}
              </p>
              <div
                className={
                  "flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/20"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-label-md"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeModal()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Confirm Action"}
                  className={
                    "px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-label-md"
                  }
                  type="button"
                  aria-label={actions.text("Confirm Action")}
                  data-handler={
                    "closeModal(); showToast('Action confirmed successfully!', 'success')"
                  }
                >
                  {actions.text("Confirm Action")}
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
