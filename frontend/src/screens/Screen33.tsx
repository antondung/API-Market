import { useScreenActions } from "../features/screen-actions";
export default function Screen33() {
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
              "mb-space-lg bg-surface-container-low p-space-sm rounded-lg flex flex-wrap items-center justify-between gap-space-sm shadow-sm"
            }
          >
            <div
              className={
                "flex items-center gap-space-xs text-label-md uppercase text-on-surface-variant font-headline-sm"
              }
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px] text-primary"}
              >
                {"tune"}
              </span>
              <span>{actions.text("Simulator Stages:")}</span>
            </div>
            <div className={"flex flex-wrap gap-space-xs"}>
              <button
                data-action-text={"01. Role"}
                id={"btn-stage-1"}
                type="button"
                aria-label={actions.text("01. Role")}
                data-handler={"switchStage(1)"}
                className={
                  actions.visible("btn-stage-1", true)
                    ? "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-primary text-on-primary font-bold"
                    : "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-primary text-on-primary font-bold hidden"
                }
              >
                {actions.text("01. Role")}
              </button>
              <button
                data-action-text={"02. Form"}
                id={"btn-stage-2"}
                type="button"
                aria-label={actions.text("02. Form")}
                data-handler={"switchStage(2)"}
                className={
                  actions.visible("btn-stage-2", true)
                    ? "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface"
                    : "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface hidden"
                }
              >
                {actions.text("02. Form")}
              </button>
              <button
                data-action-text={"03. Validation"}
                id={"btn-stage-3"}
                type="button"
                aria-label={actions.text("03. Validation")}
                data-handler={"switchStage(3)"}
                className={
                  actions.visible("btn-stage-3", true)
                    ? "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface"
                    : "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface hidden"
                }
              >
                {actions.text("03. Validation")}
              </button>
              <button
                data-action-text={"04. Loading"}
                id={"btn-stage-4"}
                type="button"
                aria-label={actions.text("04. Loading")}
                data-handler={"switchStage(4)"}
                className={
                  actions.visible("btn-stage-4", true)
                    ? "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface"
                    : "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface hidden"
                }
              >
                {actions.text("04. Loading")}
              </button>
              <button
                data-action-text={"05. Success"}
                id={"btn-stage-5"}
                type="button"
                aria-label={actions.text("05. Success")}
                data-handler={"switchStage(5)"}
                className={
                  actions.visible("btn-stage-5", true)
                    ? "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface"
                    : "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface hidden"
                }
              >
                {actions.text("05. Success")}
              </button>
              <button
                data-action-text={"06. Failure"}
                id={"btn-stage-6"}
                type="button"
                aria-label={actions.text("06. Failure")}
                data-handler={"switchStage(6)"}
                className={
                  actions.visible("btn-stage-6", true)
                    ? "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface"
                    : "stage-btn px-space-sm py-space-xs rounded text-label-md transition-all bg-surface-container-high text-on-surface hidden"
                }
              >
                {actions.text("06. Failure")}
              </button>
            </div>
          </div>

          <div
            className={
              "w-full bg-surface-container-lowest rounded-xl p-space-xl shadow-md transition-all relative overflow-hidden"
            }
          >
            <div
              className={
                "absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
              }
            ></div>

            <div
              id={"stage-1"}
              className={
                actions.visible("stage-1", true)
                  ? "stage-content space-y-space-lg"
                  : "stage-content space-y-space-lg hidden"
              }
            >
              <div className={"text-center space-y-space-xs"}>
                <span
                  className={
                    "text-label-md text-primary font-bold uppercase tracking-wider"
                  }
                >
                  {actions.text("Stage 01")}
                </span>
                <h2 className={"text-headline-md text-on-surface"}>
                  {actions.text("Select Your API HUB Role")}
                </h2>
                <p
                  className={
                    "text-body-md text-on-surface-variant max-w-md mx-auto"
                  }
                >
                  {actions.text(
                    "Choose how you plan to interact with our global high-performance infrastructure.",
                  )}
                </p>
              </div>
              <div
                className={
                  "grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-lg"
                }
              >
                <div
                  data-action-text={
                    "terminal check Consumer Consume high-availability APIs, integrate webhooks, track metrics, and scale client applications effortlessly."
                  }
                  className={
                    "role-card cursor-pointer bg-surface-container-low hover:bg-surface-container-high p-space-lg rounded-xl transition-all relative border-2 border-transparent group"
                  }
                  id={"card-consumer"}
                  data-handler={"selectRole('consumer')"}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className={"flex items-start justify-between mb-space-md"}
                  >
                    <div
                      className={
                        "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[24px]"}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {"terminal"}
                      </span>
                    </div>
                    <div
                      className={
                        "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-[14px]"
                      }
                      id={"check-consumer"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"check"}
                      </span>
                    </div>
                  </div>
                  <h3
                    className={
                      "text-headline-sm text-on-surface font-bold mb-space-xs"
                    }
                  >
                    {actions.text("Consumer")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Consume high-availability APIs, integrate webhooks, track metrics, and scale client applications effortlessly.",
                    )}
                  </p>
                </div>

                <div
                  data-action-text={
                    "dns check Provider Publish APIs, manage rate limits, monetize endpoints, and monitor developer consumption in real-time."
                  }
                  className={
                    "role-card cursor-pointer bg-surface-container-low hover:bg-surface-container-high p-space-lg rounded-xl transition-all relative border-2 border-transparent group"
                  }
                  id={"card-provider"}
                  data-handler={"selectRole('provider')"}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className={"flex items-start justify-between mb-space-md"}
                  >
                    <div
                      className={
                        "w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[24px]"}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {"dns"}
                      </span>
                    </div>
                    <div
                      className={
                        "w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[14px] opacity-40"
                      }
                      id={"check-provider"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"check"}
                      </span>
                    </div>
                  </div>
                  <h3
                    className={
                      "text-headline-sm text-on-surface font-bold mb-space-xs"
                    }
                  >
                    {actions.text("Provider")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Publish APIs, manage rate limits, monetize endpoints, and monitor developer consumption in real-time.",
                    )}
                  </p>
                </div>
              </div>
              <div className={"pt-space-md flex justify-end"}>
                <button
                  data-action-text={"Continue Registration arrow_forward"}
                  className={
                    "bg-primary hover:bg-primary-container text-on-primary px-space-lg py-space-sm rounded-lg font-headline-sm flex items-center gap-space-xs transition-colors shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Continue Registration")}
                  data-handler={"switchStage(2)"}
                >
                  <span>{actions.text("Continue Registration")}</span>
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
              id={"stage-2"}
              className={
                actions.visible("stage-2", false)
                  ? "stage-content space-y-space-lg"
                  : "stage-content space-y-space-lg hidden"
              }
            >
              <div className={"flex items-center justify-between"}>
                <div>
                  <span
                    className={
                      "text-label-md text-primary font-bold uppercase tracking-wider"
                    }
                  >
                    {actions.text("Stage 02")}
                  </span>
                  <h2
                    className={"text-headline-md text-on-surface"}
                    id={"form-title"}
                  >
                    {actions.text("Create Consumer Account")}
                  </h2>
                </div>
                <span
                  className={
                    "px-space-sm py-space-xs bg-primary/10 text-primary rounded-full text-label-md font-bold uppercase"
                  }
                  id={"role-badge"}
                >
                  {actions.text("Consumer Role")}
                </span>
              </div>
              <form className={"space-y-space-md"} onSubmit={actions.submit}>
                <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-md"}>
                  <div className={"space-y-space-xs"}>
                    <label
                      className={
                        "text-label-md text-on-surface font-medium flex items-center justify-between"
                      }
                    >
                      <span>{actions.text("Full Name")}</span>
                      <span className={"text-error"}>{actions.text("*")}</span>
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      }
                      type={"text"}
                      defaultValue={"Alex Mercer"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div className={"space-y-space-xs"}>
                    <label
                      className={
                        "text-label-md text-on-surface font-medium flex items-center justify-between"
                      }
                    >
                      <span>{actions.text("Email Address")}</span>
                      <span className={"text-error"}>{actions.text("*")}</span>
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      }
                      type={"email"}
                      defaultValue={"alex.mercer@enterprise.io"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                </div>
                <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-md"}>
                  <div className={"space-y-space-xs"}>
                    <label
                      className={
                        "text-label-md text-on-surface font-medium flex items-center justify-between"
                      }
                    >
                      <span>{actions.text("Password")}</span>
                      <span className={"text-error"}>{actions.text("*")}</span>
                    </label>
                    <div className={"relative"}>
                      <input
                        className={
                          "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        }
                        type={"password"}
                        defaultValue={"SuperSecure123!"}
                        aria-label={actions.text("Input")}
                      />
                      <span
                        aria-hidden={true}
                        className={
                          "absolute right-3 top-2.5 material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer"
                        }
                      >
                        {"visibility"}
                      </span>
                    </div>
                  </div>
                  <div className={"space-y-space-xs"}>
                    <label
                      className={
                        "text-label-md text-on-surface font-medium flex items-center justify-between"
                      }
                    >
                      <span>{actions.text("Confirm Password")}</span>
                      <span className={"text-error"}>{actions.text("*")}</span>
                    </label>
                    <div className={"relative"}>
                      <input
                        className={
                          "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        }
                        type={"password"}
                        defaultValue={"SuperSecure123!"}
                        aria-label={actions.text("Input")}
                      />
                      <span
                        aria-hidden={true}
                        className={
                          "absolute right-3 top-2.5 material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer"
                        }
                      >
                        {"visibility"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={"flex items-center gap-space-xs pt-space-xs"}>
                  <input
                    defaultChecked={true}
                    className={
                      "w-4 h-4 rounded text-primary focus:ring-primary"
                    }
                    type={"checkbox"}
                    aria-label={actions.text("Input")}
                  />
                  <span className={"text-body-sm text-on-surface-variant"}>
                    {actions.text("I agree to the ")}
                    <a
                      data-action-text={"API HUB Developer Terms"}
                      className={"text-primary underline"}
                      href={"#"}
                    >
                      {actions.text("API HUB Developer Terms")}
                    </a>
                    {actions.text(" & Privacy Policy.")}
                  </span>
                </div>
                <div
                  className={"pt-space-md flex items-center justify-between"}
                >
                  <button
                    data-action-text={"arrow_back Back to Role Selection"}
                    className={
                      "text-on-surface-variant hover:text-on-surface text-body-sm flex items-center gap-space-xs"
                    }
                    type={"button"}
                    aria-label={actions.text("Back to Role Selection")}
                    data-handler={"switchStage(1)"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"arrow_back"}
                    </span>
                    {actions.text(
                      "\n            Back to Role Selection\n          ",
                    )}
                  </button>
                  <button
                    data-action-text={"Create Account"}
                    className={
                      "bg-primary hover:bg-primary-container text-on-primary px-space-lg py-space-sm rounded-lg font-headline-sm transition-colors shadow-sm"
                    }
                    type={"submit"}
                    aria-label={actions.text("Create Account")}
                  >
                    {actions.text("\n            Create Account\n          ")}
                  </button>
                </div>
              </form>
            </div>

            <div
              id={"stage-3"}
              className={
                actions.visible("stage-3", false)
                  ? "stage-content space-y-space-lg"
                  : "stage-content space-y-space-lg hidden"
              }
            >
              <div>
                <span
                  className={
                    "text-label-md text-error font-bold uppercase tracking-wider"
                  }
                >
                  {actions.text("Stage 03")}
                </span>
                <h2 className={"text-headline-md text-on-surface"}>
                  {actions.text("Validation State Handling")}
                </h2>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "Real-time error highlighting for empty fields, invalid formats, and policy mismatches.",
                  )}
                </p>
              </div>
              <div className={"space-y-space-md"}>
                <div className={"space-y-space-xs"}>
                  <label
                    className={"text-label-md text-on-surface font-medium"}
                  >
                    {actions.text("Full Name")}
                  </label>
                  <input
                    data-source-placeholder={"Enter your full name"}
                    className={
                      "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface ring-2 ring-error focus:outline-none"
                    }
                    placeholder={actions.text("Enter your full name")}
                    type={"text"}
                    defaultValue={""}
                    aria-label={actions.text("Enter your full name")}
                  />
                  <p
                    className={
                      "text-label-md text-error flex items-center gap-space-xs"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[14px]"}
                    >
                      {"error"}
                    </span>
                    {actions.text(
                      "\n            Full name is required.\n          ",
                    )}
                  </p>
                </div>
                <div className={"space-y-space-xs"}>
                  <label
                    className={"text-label-md text-on-surface font-medium"}
                  >
                    {actions.text("Email Address")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface ring-2 ring-error focus:outline-none"
                    }
                    type={"text"}
                    defaultValue={"developer@invalid"}
                    aria-label={actions.text("Input")}
                  />
                  <p
                    className={
                      "text-label-md text-error flex items-center gap-space-xs"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[14px]"}
                    >
                      {"error"}
                    </span>
                    {actions.text(
                      "\n            Please enter a valid corporate email address (e.g., user@domain.com).\n          ",
                    )}
                  </p>
                </div>
                <div className={"space-y-space-xs"}>
                  <label
                    className={"text-label-md text-on-surface font-medium"}
                  >
                    {actions.text("Password")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface ring-2 ring-error focus:outline-none"
                    }
                    type={"password"}
                    defaultValue={"weak"}
                    aria-label={actions.text("Input")}
                  />
                  <p
                    className={
                      "text-label-md text-error flex items-center gap-space-xs"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[14px]"}
                    >
                      {"error"}
                    </span>
                    {actions.text(
                      "\n            Password must be at least 8 characters and include a special character & number.\n          ",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "p-space-md bg-error-container/20 rounded-lg flex items-start gap-space-sm text-error"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[20px]"}
                  >
                    {"warning"}
                  </span>
                  <div className={"text-body-sm"}>
                    <span className={"font-bold"}>
                      {actions.text("Duplicate Email Detected:")}
                    </span>
                    {actions.text(
                      " The address developer@invalid is already registered to an existing workspace. ",
                    )}
                    <a
                      data-action-text={"Sign in instead?"}
                      className={"underline font-bold"}
                      href={"#"}
                    >
                      {actions.text("Sign in instead?")}
                    </a>
                  </div>
                </div>
              </div>
              <div className={"flex justify-end pt-space-md"}>
                <button
                  data-action-text={"Proceed to Loading Demo"}
                  className={
                    "bg-primary hover:bg-primary-container text-on-primary px-space-lg py-space-sm rounded-lg font-headline-sm transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Proceed to Loading Demo")}
                  data-handler={"switchStage(4)"}
                >
                  {actions.text(
                    "\n          Proceed to Loading Demo\n        ",
                  )}
                </button>
              </div>
            </div>

            <div
              id={"stage-4"}
              className={
                actions.visible("stage-4", false)
                  ? "stage-content space-y-space-lg py-space-xl text-center"
                  : "stage-content space-y-space-lg py-space-xl text-center hidden"
              }
            >
              <div className={"max-w-md mx-auto space-y-space-md"}>
                <div
                  className={
                    "w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto animate-pulse"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[32px] animate-spin"
                    }
                  >
                    {"progress_activity"}
                  </span>
                </div>
                <h2 className={"text-headline-md text-on-surface"}>
                  {actions.text("Provisioning Your Workspace...")}
                </h2>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "We are securely hashing credentials, establishing cluster nodes, and generating initial API gateway tokens.",
                  )}
                </p>
                <div
                  className={
                    "w-full bg-surface-container-low h-2 rounded-full overflow-hidden"
                  }
                >
                  <div
                    className={"bg-primary h-full w-2/3 animate-pulse"}
                  ></div>
                </div>
                <div className={"pt-space-lg flex justify-center gap-space-sm"}>
                  <button
                    data-action-text={"Simulate Success"}
                    className={
                      "bg-primary text-on-primary px-space-md py-space-xs rounded text-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Simulate Success")}
                    data-handler={"switchStage(5)"}
                  >
                    {actions.text("Simulate Success")}
                  </button>
                  <button
                    data-action-text={"Simulate Failure"}
                    className={
                      "bg-surface-container-high text-on-surface px-space-md py-space-xs rounded text-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Simulate Failure")}
                    data-handler={"switchStage(6)"}
                  >
                    {actions.text("Simulate Failure")}
                  </button>
                </div>
              </div>
            </div>

            <div
              id={"stage-5"}
              className={
                actions.visible("stage-5", false)
                  ? "stage-content space-y-space-lg text-center py-space-md"
                  : "stage-content space-y-space-lg text-center py-space-md hidden"
              }
            >
              <div className={"max-w-md mx-auto space-y-space-md"}>
                <div
                  className={
                    "w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[36px]"}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {"verified"}
                  </span>
                </div>
                <h2 className={"text-headline-md text-on-surface"}>
                  {actions.text("Welcome to API HUB!")}
                </h2>
                <p className={"text-body-md text-on-surface-variant"}>
                  {actions.text(
                    "Your account has been successfully initialized. A verification link has also been dispatched to your primary email.",
                  )}
                </p>
                <div
                  className={
                    "p-space-md bg-surface-container-low rounded-lg text-left space-y-space-xs"
                  }
                >
                  <div className={"flex justify-between text-body-sm"}>
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Assigned Role:")}
                    </span>
                    <span
                      className={"font-bold text-on-surface"}
                      id={"success-role-text"}
                    >
                      {actions.text("Consumer Workspace")}
                    </span>
                  </div>
                  <div className={"flex justify-between text-body-sm"}>
                    <span className={"text-on-surface-variant"}>
                      {actions.text("API Gateway Node:")}
                    </span>
                    <span className={"font-code-sm text-primary"}>
                      {actions.text("us-east-cluster-04")}
                    </span>
                  </div>
                  <div className={"flex justify-between text-body-sm"}>
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Status:")}
                    </span>
                    <span className={"text-emerald-600 font-bold"}>
                      {actions.text("Active & Ready")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "pt-space-md flex flex-col sm:flex-row gap-space-sm justify-center"
                  }
                >
                  <button
                    data-action-text={"Go to Consumer Dashboard"}
                    className={
                      "bg-primary hover:bg-primary-container text-on-primary px-space-lg py-space-sm rounded-lg font-headline-sm transition-colors shadow-sm"
                    }
                    type="button"
                    aria-label={actions.text("Go to Consumer Dashboard")}
                    data-handler={"alert('Redirecting to dashboard...')"}
                  >
                    {actions.text(
                      "\n            Go to Consumer Dashboard\n          ",
                    )}
                  </button>
                  <button
                    data-action-text={"Reset Simulator"}
                    className={
                      "bg-surface-container-high text-on-surface hover:bg-surface-dim px-space-lg py-space-sm rounded-lg font-headline-sm transition-colors"
                    }
                    type="button"
                    aria-label={actions.text("Reset Simulator")}
                    data-handler={"switchStage(1)"}
                  >
                    {actions.text("\n            Reset Simulator\n          ")}
                  </button>
                </div>
              </div>
            </div>

            <div
              id={"stage-6"}
              className={
                actions.visible("stage-6", false)
                  ? "stage-content space-y-space-lg"
                  : "stage-content space-y-space-lg hidden"
              }
            >
              <div
                className={
                  "p-space-md bg-error-container rounded-lg text-on-error-container space-y-space-xs"
                }
              >
                <div
                  className={
                    "flex items-center gap-space-xs font-bold text-headline-sm"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[22px]"}
                  >
                    {"error"}
                  </span>
                  <span>
                    {actions.text("Gateway Connection Timeout / Rate Limited")}
                  </span>
                </div>
                <p className={"text-body-sm opacity-90"}>
                  {actions.text(
                    "The downstream auth cluster did not respond within the 5000ms threshold. All input data has been safely preserved in local memory.",
                  )}
                </p>
              </div>
              <div
                className={"space-y-space-md opacity-75 pointer-events-none"}
              >
                <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-md"}>
                  <div className={"space-y-space-xs"}>
                    <label
                      className={"text-label-md text-on-surface font-medium"}
                    >
                      {actions.text("Full Name")}
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface"
                      }
                      type={"text"}
                      defaultValue={"Alex Mercer"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div className={"space-y-space-xs"}>
                    <label
                      className={"text-label-md text-on-surface font-medium"}
                    >
                      {actions.text("Email Address")}
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-low px-space-md py-space-sm rounded text-body-md text-on-surface"
                      }
                      type={"email"}
                      defaultValue={"alex.mercer@enterprise.io"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                </div>
              </div>
              <div className={"pt-space-md flex items-center justify-between"}>
                <button
                  data-action-text={"edit Modify Form Data"}
                  className={
                    "text-on-surface-variant hover:text-on-surface text-body-sm flex items-center gap-space-xs"
                  }
                  type="button"
                  aria-label={actions.text("Modify Form Data")}
                  data-handler={"switchStage(2)"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"edit"}
                  </span>
                  {actions.text("\n          Modify Form Data\n        ")}
                </button>
                <button
                  data-action-text={"refresh Retry Request"}
                  className={
                    "bg-error hover:bg-red-700 text-on-error px-space-lg py-space-sm rounded-lg font-headline-sm flex items-center gap-space-xs transition-colors shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Retry Request")}
                  data-handler={"switchStage(4)"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"refresh"}
                  </span>
                  {actions.text("\n          Retry Request\n        ")}
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
