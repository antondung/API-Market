import { useScreenActions } from "../features/screen-actions";
export default function Screen18() {
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
          <div className={"flex flex-col gap-space-lg mb-space-xl"}>
            <div
              className={
                "flex flex-col md:flex-row md:items-end justify-between gap-space-md"
              }
            >
              <div>
                <div
                  className={
                    "flex items-center gap-space-xs text-primary font-label-md uppercase tracking-wider mb-space-xs"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"terminal"}
                  </span>
                  <span>{actions.text("Sprint 1 • Lifecycle Simulator")}</span>
                </div>
                <h1
                  className={
                    "text-headline-lg font-headline-lg text-on-surface"
                  }
                >
                  {actions.text("Authentication & Routing Flow")}
                </h1>
              </div>
              <div
                className={
                  "flex items-center gap-space-sm bg-surface-container-high p-space-xs rounded-xl"
                }
              >
                <span
                  className={
                    "text-body-sm text-on-surface-variant px-space-xs font-code-md"
                  }
                >
                  {actions.text("ENV: sandbox-us-01")}
                </span>
                <div
                  className={
                    "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                  }
                ></div>
              </div>
            </div>

            <div
              className={
                "flex items-center gap-space-xs overflow-x-auto pb-space-xs no-scrollbar"
              }
            >
              <button
                data-action-text={"01 Standard Login"}
                id={"tab-1"}
                type="button"
                aria-label={actions.text("01 Standard Login")}
                data-handler={"switchStage(1)"}
                className={
                  actions.visible("tab-1", true)
                    ? "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-primary text-on-primary shadow-sm"
                    : "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-primary text-on-primary shadow-sm hidden"
                }
              >
                <span className={"font-code-md opacity-60"}>
                  {actions.text("01")}
                </span>
                {actions.text(" Standard Login\n      ")}
              </button>
              <button
                data-action-text={"02 Protected Auth"}
                id={"tab-2"}
                type="button"
                aria-label={actions.text("02 Protected Auth")}
                data-handler={"switchStage(2)"}
                className={
                  actions.visible("tab-2", true)
                    ? "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    : "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high hidden"
                }
              >
                <span className={"font-code-md opacity-60"}>
                  {actions.text("02")}
                </span>
                {actions.text(" Protected Auth\n      ")}
              </button>
              <button
                data-action-text={"03 Loading"}
                id={"tab-3"}
                type="button"
                aria-label={actions.text("03 Loading")}
                data-handler={"switchStage(3)"}
                className={
                  actions.visible("tab-3", true)
                    ? "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    : "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high hidden"
                }
              >
                <span className={"font-code-md opacity-60"}>
                  {actions.text("03")}
                </span>
                {actions.text(" Loading\n      ")}
              </button>
              <button
                data-action-text={"04 Redirection"}
                id={"tab-4"}
                type="button"
                aria-label={actions.text("04 Redirection")}
                data-handler={"switchStage(4)"}
                className={
                  actions.visible("tab-4", true)
                    ? "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    : "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high hidden"
                }
              >
                <span className={"font-code-md opacity-60"}>
                  {actions.text("04")}
                </span>
                {actions.text(" Redirection\n      ")}
              </button>
              <button
                data-action-text={"05 Bad Credentials"}
                id={"tab-5"}
                type="button"
                aria-label={actions.text("05 Bad Credentials")}
                data-handler={"switchStage(5)"}
                className={
                  actions.visible("tab-5", true)
                    ? "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    : "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high hidden"
                }
              >
                <span className={"font-code-md opacity-60"}>
                  {actions.text("05")}
                </span>
                {actions.text(" Bad Credentials\n      ")}
              </button>
              <button
                data-action-text={"06 Access Denied"}
                id={"tab-6"}
                type="button"
                aria-label={actions.text("06 Access Denied")}
                data-handler={"switchStage(6)"}
                className={
                  actions.visible("tab-6", true)
                    ? "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    : "stage-tab flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-body-sm font-label-md transition-all whitespace-nowrap bg-surface-container text-on-surface-variant hover:bg-surface-container-high hidden"
                }
              >
                <span className={"font-code-md opacity-60"}>
                  {actions.text("06")}
                </span>
                {actions.text(" Access Denied\n      ")}
              </button>
            </div>
          </div>

          <div className={"relative w-full max-w-xl mx-auto"}>
            <div
              className={
                "absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-surface-container-high rounded-3xl -z-10 blur-xl"
              }
            ></div>

            <div
              id={"stage-1"}
              className={
                actions.visible("stage-1", true)
                  ? "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all"
                  : "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all hidden"
              }
            >
              <div className={"flex flex-col gap-space-xs mb-space-lg"}>
                <span
                  className={
                    "text-label-md font-label-md text-primary uppercase tracking-wider"
                  }
                >
                  {actions.text("Authentication Portal")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Sign in to API Hub")}
                </h2>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "Enter your developer credentials to access your endpoints and webhooks.",
                  )}
                </p>
              </div>
              <form
                className={"flex flex-col gap-space-md"}
                onSubmit={actions.submit}
              >
                <div className={"flex flex-col gap-space-xs"}>
                  <label
                    className={"text-body-sm font-label-md text-on-surface"}
                  >
                    {actions.text("Developer Email")}
                  </label>
                  <input
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
                    }
                    required={true}
                    type={"email"}
                    defaultValue={"alex.vance@apihub.dev"}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <div className={"flex flex-col gap-space-xs"}>
                  <div className={"flex items-center justify-between"}>
                    <label
                      className={"text-body-sm font-label-md text-on-surface"}
                    >
                      {actions.text("Password")}
                    </label>
                    <a
                      data-action-text={"Forgot password?"}
                      className={"text-body-sm text-primary hover:underline"}
                      href={"#"}
                      data-handler={"event.preventDefault();"}
                    >
                      {actions.text("Forgot password?")}
                    </a>
                  </div>
                  <div className={"relative flex items-center"}>
                    <input
                      className={
                        "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all pr-10"
                      }
                      id={"s1-pass"}
                      required={true}
                      type={"password"}
                      defaultValue={"supersecretpassword123"}
                    />
                    <button
                      data-action-text={"visibility"}
                      className={
                        "absolute right-3 text-on-surface-variant hover:text-on-surface"
                      }
                      type={"button"}
                      aria-label={actions.text("View")}
                      data-handler={"togglePassword('s1-pass')"}
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
                <div className={"flex items-center gap-space-xs my-space-xs"}>
                  <input
                    defaultChecked={true}
                    className={
                      "w-4 h-4 rounded text-primary focus:ring-primary"
                    }
                    id={"remember"}
                    type={"checkbox"}
                  />
                  <label
                    className={
                      "text-body-sm text-on-surface-variant select-none"
                    }
                    htmlFor={"remember"}
                  >
                    {actions.text("Remember this device for 30 days")}
                  </label>
                </div>
                <button
                  data-action-text={"Sign In to Dashboard arrow_forward"}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all flex items-center justify-center gap-space-xs shadow-md"
                  }
                  type={"submit"}
                  aria-label={actions.text("Sign In to Dashboard")}
                >
                  <span>{actions.text("Sign In to Dashboard")}</span>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_forward"}
                  </span>
                </button>
              </form>
              <div
                className={
                  "mt-space-lg pt-space-md text-center border-t border-surface-container"
                }
              >
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "\n          Don't have an API developer account? \n          ",
                  )}
                  <a
                    data-action-text={"Create workspace"}
                    className={"text-primary font-label-md hover:underline"}
                    href={"#"}
                    data-handler={"event.preventDefault();"}
                  >
                    {actions.text("Create workspace")}
                  </a>
                </p>
              </div>
            </div>

            <div
              id={"stage-2"}
              className={
                actions.visible("stage-2", false)
                  ? "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all"
                  : "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all hidden"
              }
            >
              <div
                className={
                  "flex items-start gap-space-sm p-space-md rounded-lg bg-amber-500/10 text-amber-900 mb-space-lg"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-amber-600 mt-0.5"}
                >
                  {"lock_person"}
                </span>
                <div className={"flex flex-col gap-space-xs"}>
                  <span className={"font-label-md text-amber-900"}>
                    {actions.text("Authentication Required")}
                  </span>
                  <p className={"text-body-sm text-amber-800"}>
                    {actions.text(
                      "You attempted to access a protected sandbox endpoint. Please sign in to resume your session.",
                    )}
                  </p>
                </div>
              </div>

              <div
                className={
                  "flex flex-col p-space-md rounded-lg bg-surface-container-low mb-space-lg gap-space-xs"
                }
              >
                <span
                  className={
                    "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Target Endpoint")}
                </span>
                <div
                  className={
                    "flex items-center gap-space-sm font-code-md text-body-sm bg-surface p-space-sm rounded"
                  }
                >
                  <span
                    className={
                      "px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold"
                    }
                  >
                    {actions.text("POST")}
                  </span>
                  <span className={"text-on-surface truncate"}>
                    {actions.text("/v1/sandbox/deployments/cluster-east-02")}
                  </span>
                </div>
                <div
                  className={
                    "flex items-center justify-between text-body-sm text-on-surface-variant mt-1"
                  }
                >
                  <span>
                    {actions.text("Required Scope: ")}
                    <strong className={"text-on-surface font-code-md"}>
                      {actions.text("deploy:write")}
                    </strong>
                  </span>
                  <span>{actions.text("Session will redirect back")}</span>
                </div>
              </div>
              <form
                className={"flex flex-col gap-space-md"}
                onSubmit={actions.submit}
              >
                <div className={"flex flex-col gap-space-xs"}>
                  <label
                    className={"text-body-sm font-label-md text-on-surface"}
                  >
                    {actions.text("Developer Email")}
                  </label>
                  <input
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
                    }
                    required={true}
                    type={"email"}
                    defaultValue={"alex.vance@apihub.dev"}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <div className={"flex flex-col gap-space-xs"}>
                  <label
                    className={"text-body-sm font-label-md text-on-surface"}
                  >
                    {actions.text("Password")}
                  </label>
                  <div className={"relative flex items-center"}>
                    <input
                      className={
                        "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all pr-10"
                      }
                      id={"s2-pass"}
                      required={true}
                      type={"password"}
                      defaultValue={"supersecretpassword123"}
                    />
                    <button
                      data-action-text={"visibility"}
                      className={
                        "absolute right-3 text-on-surface-variant hover:text-on-surface"
                      }
                      type={"button"}
                      aria-label={actions.text("View")}
                      data-handler={"togglePassword('s2-pass')"}
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
                <button
                  data-action-text={"Authenticate & Continue bolt"}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all flex items-center justify-center gap-space-xs shadow-md mt-space-xs"
                  }
                  type={"submit"}
                  aria-label={actions.text("Authenticate & Continue")}
                >
                  <span>{actions.text("Authenticate & Continue")}</span>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"bolt"}
                  </span>
                </button>
              </form>
            </div>

            <div
              id={"stage-3"}
              className={
                actions.visible("stage-3", false)
                  ? "stage-content flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all min-h-[400px]"
                  : "stage-content flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all min-h-[400px] hidden"
              }
            >
              <div
                className={
                  "relative w-16 h-16 mb-space-lg flex items-center justify-center"
                }
              >
                <div
                  className={
                    "absolute inset-0 rounded-full border-4 border-primary/20"
                  }
                ></div>
                <div
                  className={
                    "absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                  }
                ></div>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[24px]"
                  }
                >
                  {"key"}
                </span>
              </div>
              <h2
                className={
                  "text-headline-md font-headline-md text-on-surface mb-space-xs"
                }
              >
                {actions.text("Verifying Credentials")}
              </h2>
              <p
                className={
                  "text-body-md text-on-surface-variant max-w-sm mb-space-lg"
                }
              >
                {actions.text(
                  "Validating cryptographic token signatures and checking role permissions...",
                )}
              </p>

              <div
                className={
                  "w-full flex flex-col gap-space-md opacity-60 pointer-events-none text-left"
                }
              >
                <div className={"flex flex-col gap-space-xs"}>
                  <label
                    className={"text-body-sm font-label-md text-on-surface"}
                  >
                    {actions.text("Developer Email")}
                  </label>
                  <input
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none"
                    }
                    disabled={true}
                    type={"email"}
                    defaultValue={"alex.vance@apihub.dev"}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <div className={"flex flex-col gap-space-xs"}>
                  <label
                    className={"text-body-sm font-label-md text-on-surface"}
                  >
                    {actions.text("Password")}
                  </label>
                  <input
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none"
                    }
                    disabled={true}
                    type={"password"}
                    defaultValue={"••••••••••••••••"}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <button
                  data-action-text={"progress_activity Signing In..."}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md flex items-center justify-center gap-space-xs cursor-not-allowed"
                  }
                  disabled={true}
                  type={"button"}
                  aria-label={actions.text("Signing In...")}
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined animate-spin text-[16px]"
                    }
                  >
                    {"progress_activity"}
                  </span>
                  <span>{actions.text("Signing In...")}</span>
                </button>
              </div>
              <div className={"mt-space-lg"}>
                <button
                  data-action-text={"Simulate Success Response →"}
                  className={
                    "text-body-sm text-primary hover:underline font-label-md"
                  }
                  type="button"
                  aria-label={actions.text("Simulate Success Response \u2192")}
                  data-handler={"switchStage(4)"}
                >
                  {actions.text("Simulate Success Response →")}
                </button>
              </div>
            </div>

            <div
              id={"stage-4"}
              className={
                actions.visible("stage-4", false)
                  ? "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all"
                  : "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all hidden"
              }
            >
              <div
                className={
                  "flex items-center gap-space-sm p-space-md rounded-lg bg-emerald-500/10 text-emerald-900 mb-space-lg"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-emerald-600"}
                >
                  {"check_circle"}
                </span>
                <div className={"flex flex-col"}>
                  <span className={"font-label-md text-emerald-900"}>
                    {actions.text("Authentication Successful")}
                  </span>
                  <p className={"text-body-sm text-emerald-800"}>
                    {actions.text(
                      "Token issued (JWT). Evaluating post-login routing rules...",
                    )}
                  </p>
                </div>
              </div>
              <h3
                className={
                  "text-headline-sm font-headline-sm text-on-surface mb-space-md"
                }
              >
                {actions.text("Role-Based Routing Matrix")}
              </h3>
              <div className={"flex flex-col gap-space-sm mb-space-lg"}>
                <div
                  className={
                    "flex items-center justify-between p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-all"
                  }
                >
                  <div className={"flex items-center gap-space-sm"}>
                    <span
                      className={
                        "px-space-xs py-0.5 rounded bg-primary-container text-on-primary-container text-[11px] font-code-md"
                      }
                    >
                      {actions.text("CONSUMER")}
                    </span>
                    <span
                      className={"text-body-md text-on-surface font-code-md"}
                    >
                      {actions.text("/dashboard/sandbox")}
                    </span>
                  </div>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[18px]"
                    }
                  >
                    {"arrow_forward"}
                  </span>
                </div>
                <div
                  className={
                    "flex items-center justify-between p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-all"
                  }
                >
                  <div className={"flex items-center gap-space-sm"}>
                    <span
                      className={
                        "px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container text-[11px] font-code-md"
                      }
                    >
                      {actions.text("PROVIDER")}
                    </span>
                    <span
                      className={"text-body-md text-on-surface font-code-md"}
                    >
                      {actions.text("/provider/apis")}
                    </span>
                  </div>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[18px]"
                    }
                  >
                    {"arrow_forward"}
                  </span>
                </div>
                <div
                  className={
                    "flex items-center justify-between p-space-sm rounded-lg bg-surface hover:bg-surface-container transition-all"
                  }
                >
                  <div className={"flex items-center gap-space-sm"}>
                    <span
                      className={
                        "px-space-xs py-0.5 rounded bg-tertiary-container text-on-tertiary-container text-[11px] font-code-md"
                      }
                    >
                      {actions.text("ADMIN")}
                    </span>
                    <span
                      className={"text-body-md text-on-surface font-code-md"}
                    >
                      {actions.text("/admin/cluster-health")}
                    </span>
                  </div>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-on-surface-variant text-[18px]"
                    }
                  >
                    {"arrow_forward"}
                  </span>
                </div>
                <div
                  className={
                    "flex items-center justify-between p-space-sm rounded-lg bg-primary/10 border border-primary/20"
                  }
                >
                  <div className={"flex items-center gap-space-sm"}>
                    <span
                      className={
                        "px-space-xs py-0.5 rounded bg-primary text-on-primary text-[11px] font-code-md"
                      }
                    >
                      {actions.text("ORIGINAL TARGET")}
                    </span>
                    <span
                      className={
                        "text-body-md text-primary font-code-md font-bold"
                      }
                    >
                      {actions.text("/v1/sandbox/deployments")}
                    </span>
                  </div>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[18px]"
                    }
                  >
                    {"bolt"}
                  </span>
                </div>
              </div>
              <div
                className={
                  "flex items-center justify-between pt-space-md border-t border-surface-container"
                }
              >
                <span className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("Redirecting in 3 seconds...")}
                </span>
                <button
                  data-action-text={"Go To Destination Now"}
                  className={
                    "py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Go To Destination Now")}
                  data-handler={"switchStage(1)"}
                >
                  {actions.text("\n          Go To Destination Now\n        ")}
                </button>
              </div>
            </div>

            <div
              id={"stage-5"}
              className={
                actions.visible("stage-5", false)
                  ? "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all"
                  : "stage-content flex flex-col bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all hidden"
              }
            >
              <div
                className={
                  "flex items-start gap-space-sm p-space-md rounded-lg bg-error-container text-on-error-container mb-space-lg"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-error mt-0.5"}
                >
                  {"error"}
                </span>
                <div className={"flex flex-col gap-space-xs"}>
                  <span className={"font-label-md"}>
                    {actions.text("Authentication Failed")}
                  </span>
                  <p className={"text-body-sm opacity-90"}>
                    {actions.text(
                      "Invalid email or password combination. Please check your credentials and try again. (Attempt 2/5)",
                    )}
                  </p>
                </div>
              </div>
              <div className={"flex flex-col gap-space-xs mb-space-lg"}>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Sign in to API Hub")}
                </h2>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "Enter your developer credentials to access your endpoints.",
                  )}
                </p>
              </div>
              <form
                className={"flex flex-col gap-space-md"}
                onSubmit={actions.submit}
              >
                <div className={"flex flex-col gap-space-xs"}>
                  <label
                    className={"text-body-sm font-label-md text-on-surface"}
                  >
                    {actions.text("Developer Email")}
                  </label>

                  <input
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none ring-2 ring-error/50 transition-all"
                    }
                    required={true}
                    type={"email"}
                    defaultValue={"alex.vance@apihub.dev"}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <div className={"flex flex-col gap-space-xs"}>
                  <div className={"flex items-center justify-between"}>
                    <label
                      className={"text-body-sm font-label-md text-on-surface"}
                    >
                      {actions.text("Password")}
                    </label>
                    <a
                      data-action-text={"Forgot password?"}
                      className={"text-body-sm text-primary hover:underline"}
                      href={"#"}
                      data-handler={"event.preventDefault();"}
                    >
                      {actions.text("Forgot password?")}
                    </a>
                  </div>
                  <div className={"relative flex items-center"}>
                    <input
                      data-source-placeholder={"••••••••••••••••"}
                      className={
                        "w-full px-space-md py-space-sm rounded-lg bg-surface font-code-md text-on-surface outline-none ring-2 ring-error/50 transition-all pr-10"
                      }
                      id={"s5-pass"}
                      placeholder={actions.text("••••••••••••••••")}
                      required={true}
                      type={"password"}
                      defaultValue={""}
                    />
                    <button
                      data-action-text={"visibility"}
                      className={
                        "absolute right-3 text-on-surface-variant hover:text-on-surface"
                      }
                      type={"button"}
                      aria-label={actions.text("View")}
                      data-handler={"togglePassword('s5-pass')"}
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
                <button
                  data-action-text={"Try Again refresh"}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all flex items-center justify-center gap-space-xs shadow-md mt-space-xs"
                  }
                  type={"submit"}
                  aria-label={actions.text("Try Again")}
                >
                  <span>{actions.text("Try Again")}</span>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"refresh"}
                  </span>
                </button>
              </form>
            </div>

            <div
              id={"stage-6"}
              className={
                actions.visible("stage-6", false)
                  ? "stage-content flex flex-col items-center text-center bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all"
                  : "stage-content flex flex-col items-center text-center bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-all hidden"
              }
            >
              <div
                className={
                  "w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-space-lg"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[32px]"}
                >
                  {"block"}
                </span>
              </div>
              <div
                className={
                  "inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface font-code-md text-body-sm mb-space-sm"
                }
              >
                <span>{actions.text("HTTP 403 Forbidden")}</span>
              </div>
              <h2
                className={
                  "text-headline-md font-headline-md text-on-surface mb-space-xs"
                }
              >
                {actions.text("Access Denied")}
              </h2>
              <p
                className={
                  "text-body-md text-on-surface-variant max-w-sm mb-space-lg"
                }
              >
                {actions.text("Your account (")}
                <code className={"font-code-md text-on-surface"}>
                  {"alex.vance@apihub.dev"}
                </code>
                {actions.text(") does not have the required ")}
                <code className={"font-code-md text-on-surface"}>
                  {"admin:cluster"}
                </code>
                {actions.text(" role to view this operational zone.")}
              </p>

              <div className={"w-full flex flex-col gap-space-sm"}>
                <button
                  data-action-text={"dashboard Return to Dashboard"}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all flex items-center justify-center gap-space-xs shadow-md"
                  }
                  type="button"
                  aria-label={actions.text("Return to Dashboard")}
                  data-handler={"switchStage(1)"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"dashboard"}
                  </span>
                  <span>{actions.text("Return to Dashboard")}</span>
                </button>
                <div className={"grid grid-cols-2 gap-space-sm"}>
                  <button
                    data-action-text={"swap_horiz Switch Workspace"}
                    className={
                      "py-space-sm px-space-md rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-all flex items-center justify-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Switch Workspace")}
                    data-handler={"switchStage(2)"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"swap_horiz"}
                    </span>
                    <span>{actions.text("Switch Workspace")}</span>
                  </button>
                  <a
                    data-action-text={"storefront Marketplace"}
                    className={
                      "py-space-sm px-space-md rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-all flex items-center justify-center gap-space-xs"
                    }
                    href={"#"}
                    data-handler={"event.preventDefault(); switchStage(1);"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"storefront"}
                    </span>
                    <span>{actions.text("Marketplace")}</span>
                  </a>
                </div>
              </div>
              <div
                className={
                  "mt-space-lg pt-space-md border-t border-surface-container w-full text-left"
                }
              >
                <div
                  className={
                    "flex items-center justify-between text-body-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Need elevated permissions?")}</span>
                  <a
                    data-action-text={"Request access →"}
                    className={"text-primary hover:underline font-label-md"}
                    href={"#"}
                    data-handler={"event.preventDefault();"}
                  >
                    {actions.text("Request access →")}
                  </a>
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
