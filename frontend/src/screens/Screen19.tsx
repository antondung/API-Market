import { useScreenActions } from "../features/screen-actions";
export default function Screen19() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full pb-16"}>
          <div
            className={
              "w-full bg-surface-container-low rounded-2xl p-space-xl mb-space-xl relative overflow-hidden"
            }
          >
            <div
              className={
                "absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none"
              }
            ></div>
            <div className={"max-w-3xl"}>
              <div
                className={
                  "inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed font-label-md mb-space-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"security"}
                </span>
                {actions.text("\n        Enterprise Auth & IAM Suite\n      ")}
              </div>
              <h1 className={"font-headline-lg text-on-surface mb-space-sm"}>
                {actions.text("API HUB Authentication & Session Security")}
              </h1>
              <p className={"font-body-lg text-on-surface-variant"}>
                {actions.text(
                  "\n        Comprehensive OAuth2, JWT token lifecycle management, and secure session components designed for ultra-high-velocity engineering teams. Explore individual interactive flows or test complete IAM states below.\n      ",
                )}
              </p>
            </div>

            <div
              className={
                "mt-space-xl flex flex-wrap gap-space-sm items-center border-t border-outline-variant/30 pt-space-lg"
              }
            >
              <span
                className={
                  "font-label-md text-on-surface-variant uppercase tracking-wider mr-space-xs"
                }
              >
                {actions.text("Interactive Modes:")}
              </span>
              <button
                data-action-text={"1. Login"}
                className={
                  "tab-btn px-space-md py-space-sm rounded-lg font-label-md transition-all bg-primary text-on-primary shadow-sm"
                }
                data-target={"login"}
                type="button"
                aria-label={actions.text("1. Login")}
                data-handler={"switchTab('login')"}
              >
                {actions.text("1. Login")}
              </button>
              <button
                data-action-text={"2. Register"}
                className={
                  "tab-btn px-space-md py-space-sm rounded-lg font-label-md transition-all bg-surface text-on-surface hover:bg-surface-container"
                }
                data-target={"register"}
                type="button"
                aria-label={actions.text("2. Register")}
                data-handler={"switchTab('register')"}
              >
                {actions.text("2. Register")}
              </button>
              <button
                data-action-text={"3. Password Recovery"}
                className={
                  "tab-btn px-space-md py-space-sm rounded-lg font-label-md transition-all bg-surface text-on-surface hover:bg-surface-container"
                }
                data-target={"reset"}
                type="button"
                aria-label={actions.text("3. Password Recovery")}
                data-handler={"switchTab('reset')"}
              >
                {actions.text("3. Password Recovery")}
              </button>
              <button
                data-action-text={"4. Verification"}
                className={
                  "tab-btn px-space-md py-space-sm rounded-lg font-label-md transition-all bg-surface text-on-surface hover:bg-surface-container"
                }
                data-target={"verification"}
                type="button"
                aria-label={actions.text("4. Verification")}
                data-handler={"switchTab('verification')"}
              >
                {actions.text("4. Verification")}
              </button>
              <button
                data-action-text={"5. Errors & States"}
                className={
                  "tab-btn px-space-md py-space-sm rounded-lg font-label-md transition-all bg-surface text-on-surface hover:bg-surface-container"
                }
                data-target={"errors"}
                type="button"
                aria-label={actions.text("5. Errors & States")}
                data-handler={"switchTab('errors')"}
              >
                {actions.text("5. Errors & States")}
              </button>
              <button
                data-action-text={"6. 403 & Protected"}
                className={
                  "tab-btn px-space-md py-space-sm rounded-lg font-label-md transition-all bg-surface text-on-surface hover:bg-surface-container"
                }
                data-target={"access"}
                type="button"
                aria-label={actions.text("6. 403 & Protected")}
                data-handler={"switchTab('access')"}
              >
                {actions.text("6. 403 & Protected")}
              </button>
              <button
                data-action-text={"Master Grid View"}
                className={
                  "tab-btn px-space-md py-space-sm rounded-lg font-label-md transition-all bg-surface-container-high text-primary font-bold"
                }
                data-target={"grid"}
                type="button"
                aria-label={actions.text("Master Grid View")}
                data-handler={"switchTab('grid')"}
              >
                {actions.text("Master Grid View")}
              </button>
            </div>
          </div>

          <div className={"w-full"} id={"auth-container"}>
            <div
              id={"panel-login"}
              className={
                actions.visible("panel-login", true)
                  ? "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl"
                  : "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl hidden"
              }
            >
              <div className={"text-center mb-space-lg"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[40px] mb-space-sm"
                  }
                >
                  {"vpn_key"}
                </span>
                <h2 className={"font-headline-md text-on-surface"}>
                  {actions.text("Welcome back to API HUB")}
                </h2>
                <p
                  className={"font-body-sm text-on-surface-variant mt-space-xs"}
                >
                  {actions.text(
                    "Enter your developer credentials to access your API keys and endpoints.",
                  )}
                </p>
              </div>
              <div className={"grid grid-cols-2 gap-space-sm mb-space-lg"}>
                <button
                  data-action-text={"code GitHub"}
                  className={
                    "flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors font-label-md text-on-surface"
                  }
                  type={"button"}
                  aria-label={actions.text("GitHub")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"code"}
                  </span>
                  {actions.text("\n          GitHub\n        ")}
                </button>
                <button
                  data-action-text={"public Google"}
                  className={
                    "flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors font-label-md text-on-surface"
                  }
                  type={"button"}
                  aria-label={actions.text("Google")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"public"}
                  </span>
                  {actions.text("\n          Google\n        ")}
                </button>
              </div>
              <div
                className={"relative flex py-space-sm items-center mb-space-lg"}
              >
                <div
                  className={"flex-grow border-t border-outline-variant/40"}
                ></div>
                <span
                  className={
                    "flex-shrink mx-space-md text-body-sm text-on-surface-variant"
                  }
                >
                  {actions.text("or continue with email")}
                </span>
                <div
                  className={"flex-grow border-t border-outline-variant/40"}
                ></div>
              </div>
              <form
                className={"flex flex-col gap-space-md"}
                onSubmit={actions.submit}
              >
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Developer Email")}
                  </label>
                  <input
                    data-source-placeholder={"developer@enterprise.io"}
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-code-md text-on-surface"
                    }
                    placeholder={actions.text("developer@enterprise.io")}
                    required={true}
                    type={"email"}
                    aria-label={actions.text("developer@enterprise.io")}
                  />
                </div>
                <div>
                  <div
                    className={"flex justify-between items-center mb-space-xs"}
                  >
                    <label className={"font-label-md text-on-surface"}>
                      {actions.text("Password")}
                    </label>
                    <a
                      data-action-text={"Forgot password?"}
                      className={"font-label-md text-primary hover:underline"}
                      href={"#"}
                      data-handler={"switchTab('reset'); return false;"}
                    >
                      {actions.text("Forgot password?")}
                    </a>
                  </div>
                  <div className={"relative"}>
                    <input
                      data-source-placeholder={"••••••••••••"}
                      className={
                        "w-full px-space-md py-space-sm rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-code-md text-on-surface pr-10"
                      }
                      id={"login-pwd"}
                      placeholder={actions.text("••••••••••••")}
                      required={true}
                      type={"password"}
                    />
                    <button
                      data-action-text={"visibility"}
                      className={
                        "absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                      }
                      type={"button"}
                      aria-label={actions.text("View")}
                      data-handler={"togglePassword('login-pwd')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className={"flex items-center justify-between"}>
                  <label
                    className={"flex items-center gap-space-xs cursor-pointer"}
                  >
                    <input
                      className={
                        "rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                      }
                      type={"checkbox"}
                      aria-label={actions.text("Input")}
                    />
                    <span className={"font-body-sm text-on-surface-variant"}>
                      {actions.text("Remember this device for 30 days")}
                    </span>
                  </label>
                </div>
                <button
                  data-action-text={"Authenticate & Generate Token"}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors shadow-sm"
                  }
                  type={"submit"}
                  aria-label={actions.text("Authenticate & Generate Token")}
                >
                  {actions.text(
                    "\n          Authenticate & Generate Token\n        ",
                  )}
                </button>
              </form>
              <p
                className={
                  "text-center font-body-sm text-on-surface-variant mt-space-lg"
                }
              >
                {actions.text("\n        Don't have an API HUB account? ")}
                <a
                  data-action-text={"Create developer account"}
                  className={"text-primary font-medium hover:underline"}
                  href={"#"}
                  data-handler={"switchTab('register'); return false;"}
                >
                  {actions.text("Create developer account")}
                </a>
              </p>
            </div>

            <div
              id={"panel-register"}
              className={
                actions.visible("panel-register", false)
                  ? "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl"
                  : "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl hidden"
              }
            >
              <div className={"text-center mb-space-lg"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[40px] mb-space-sm"
                  }
                >
                  {"terminal"}
                </span>
                <h2 className={"font-headline-md text-on-surface"}>
                  {actions.text("Create Developer Account")}
                </h2>
                <p
                  className={"font-body-sm text-on-surface-variant mt-space-xs"}
                >
                  {actions.text(
                    "Get instant access to 500+ production-ready APIs.",
                  )}
                </p>
              </div>
              <form
                className={"flex flex-col gap-space-md"}
                onSubmit={actions.submit}
              >
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Full Name / Organization")}
                  </label>
                  <input
                    data-source-placeholder={"Alex Mercer (Apex Corp)"}
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface"
                    }
                    placeholder={actions.text("Alex Mercer (Apex Corp)")}
                    required={true}
                    type={"text"}
                    aria-label={actions.text("Alex Mercer (Apex Corp)")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Work Email")}
                  </label>
                  <input
                    data-source-placeholder={"alex@apex.io"}
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-code-md text-on-surface"
                    }
                    placeholder={actions.text("alex@apex.io")}
                    required={true}
                    type={"email"}
                    aria-label={actions.text("alex@apex.io")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Password")}
                  </label>
                  <input
                    data-source-placeholder={"••••••••••••"}
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-code-md text-on-surface"
                    }
                    id={"reg-pwd"}
                    placeholder={actions.text("••••••••••••")}
                    required={true}
                    type={"password"}
                  />
                </div>

                <div className={"bg-surface-container p-space-sm rounded-lg"}>
                  <div
                    className={"flex justify-between items-center mb-space-xs"}
                  >
                    <span className={"font-label-md text-on-surface-variant"}>
                      {actions.text("Password Strength")}
                    </span>
                    <span
                      className={"font-label-md text-error"}
                      id={"strength-text"}
                    >
                      {actions.text("Weak")}
                    </span>
                  </div>
                  <div
                    className={
                      "w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden"
                    }
                  >
                    <div
                      className={
                        "bg-error h-full w-1/4 transition-all duration-300"
                      }
                      id={"strength-bar"}
                    ></div>
                  </div>
                  <ul
                    className={
                      "mt-space-xs space-y-1 font-body-sm text-on-surface-variant"
                    }
                  >
                    <li
                      className={"flex items-center gap-space-xs"}
                      id={"req-len"}
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[14px] text-error"
                        }
                      >
                        {"cancel"}
                      </span>
                      {actions.text(" At least 8 characters")}
                    </li>
                    <li
                      className={"flex items-center gap-space-xs"}
                      id={"req-num"}
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[14px] text-error"
                        }
                      >
                        {"cancel"}
                      </span>
                      {actions.text(" Contains a number & symbol")}
                    </li>
                  </ul>
                </div>
                <label
                  className={"flex items-start gap-space-xs cursor-pointer"}
                >
                  <input
                    className={
                      "mt-1 rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                    }
                    required={true}
                    type={"checkbox"}
                    aria-label={actions.text("Input")}
                  />
                  <span className={"font-body-sm text-on-surface-variant"}>
                    {actions.text("I agree to the API HUB ")}
                    <a
                      data-action-text={"Terms of Service"}
                      className={"text-primary underline"}
                      href={"#"}
                    >
                      {actions.text("Terms of Service")}
                    </a>
                    {actions.text(" and ")}
                    <a
                      data-action-text={"Developer SLA"}
                      className={"text-primary underline"}
                      href={"#"}
                    >
                      {actions.text("Developer SLA")}
                    </a>
                    {actions.text(".")}
                  </span>
                </label>
                <button
                  data-action-text={"Initialize Account & Keys"}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors shadow-sm"
                  }
                  type={"submit"}
                  aria-label={actions.text("Initialize Account & Keys")}
                >
                  {actions.text(
                    "\n          Initialize Account & Keys\n        ",
                  )}
                </button>
              </form>
            </div>

            <div
              id={"panel-reset"}
              className={
                actions.visible("panel-reset", false)
                  ? "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl"
                  : "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl hidden"
              }
            >
              <div className={"text-center mb-space-lg"}>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[40px] mb-space-sm"
                  }
                >
                  {"lock_reset"}
                </span>
                <h2 className={"font-headline-md text-on-surface"}>
                  {actions.text("Password Recovery")}
                </h2>
                <p
                  className={"font-body-sm text-on-surface-variant mt-space-xs"}
                >
                  {actions.text(
                    "Enter your registered email to receive a secure recovery token.",
                  )}
                </p>
              </div>
              <form
                className={"flex flex-col gap-space-md"}
                onSubmit={actions.submit}
              >
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Account Email")}
                  </label>
                  <input
                    data-source-placeholder={"developer@enterprise.io"}
                    className={
                      "w-full px-space-md py-space-sm rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-code-md text-on-surface"
                    }
                    placeholder={actions.text("developer@enterprise.io")}
                    required={true}
                    type={"email"}
                    aria-label={actions.text("developer@enterprise.io")}
                  />
                </div>
                <button
                  data-action-text={"Send Recovery Token"}
                  className={
                    "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors shadow-sm"
                  }
                  type={"submit"}
                  aria-label={actions.text("Send Recovery Token")}
                >
                  {actions.text("\n          Send Recovery Token\n        ")}
                </button>
                <div
                  id={"reset-sent-msg"}
                  className={
                    actions.visible("reset-sent-msg", false)
                      ? "p-space-md rounded-lg bg-primary-fixed/30 text-on-primary-fixed font-body-sm text-center"
                      : "p-space-md rounded-lg bg-primary-fixed/30 text-on-primary-fixed font-body-sm text-center hidden"
                  }
                >
                  {actions.text(
                    "\n          Recovery link sent! Check your inbox for further instructions.\n        ",
                  )}
                </div>
              </form>
              <div className={"mt-space-lg text-center"}>
                <a
                  data-action-text={"arrow_back Return to Login"}
                  className={
                    "font-body-sm text-primary hover:underline flex items-center justify-center gap-space-xs"
                  }
                  href={"#"}
                  data-handler={"switchTab('login'); return false;"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"arrow_back"}
                  </span>
                  {actions.text(" Return to Login\n        ")}
                </a>
              </div>
            </div>

            <div
              id={"panel-verification"}
              className={
                actions.visible("panel-verification", false)
                  ? "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl text-center"
                  : "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl text-center hidden"
              }
            >
              <div
                className={
                  "w-16 h-16 bg-primary-fixed text-primary rounded-full flex items-center justify-center mx-auto mb-space-lg"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[32px]"}
                >
                  {"mark_email_unread"}
                </span>
              </div>
              <h2 className={"font-headline-md text-on-surface mb-space-xs"}>
                {actions.text("Verify Your Email Address")}
              </h2>
              <p className={"font-body-sm text-on-surface-variant mb-space-lg"}>
                {actions.text(
                  "\n        We've sent a verification magic link to ",
                )}
                <strong className={"text-on-surface font-code-md"}>
                  {actions.text("dev***@enterprise.io")}
                </strong>
                {actions.text(
                  ". Please confirm your email to activate full API rate limits.\n      ",
                )}
              </p>
              <div
                className={
                  "p-space-md bg-surface-container rounded-lg mb-space-lg flex items-center justify-between"
                }
              >
                <div className={"text-left"}>
                  <div className={"font-label-md text-on-surface"}>
                    {actions.text("Verification Status")}
                  </div>
                  <div className={"font-body-sm text-on-surface-variant"}>
                    {actions.text("Pending confirmation")}
                  </div>
                </div>
                <span
                  className={
                    "px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md"
                  }
                >
                  {actions.text("Awaiting")}
                </span>
              </div>
              <button
                data-action-text={"Resend Verification Email"}
                className={
                  "w-full py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors shadow-sm mb-space-md"
                }
                type="button"
                aria-label={actions.text("Resend Verification Email")}
                data-handler={
                  "alert('Verification email resent successfully!')"
                }
              >
                {actions.text("\n        Resend Verification Email\n      ")}
              </button>
              <a
                data-action-text={"Sign in with a different account"}
                className={
                  "font-body-sm text-on-surface-variant hover:text-primary"
                }
                href={"#"}
                data-handler={"switchTab('login'); return false;"}
              >
                {actions.text(
                  "\n        Sign in with a different account\n      ",
                )}
              </a>
            </div>

            <div
              id={"panel-errors"}
              className={
                actions.visible("panel-errors", false)
                  ? "auth-panel max-w-lg mx-auto w-full flex flex-col gap-space-lg"
                  : "auth-panel max-w-lg mx-auto w-full flex flex-col gap-space-lg hidden"
              }
            >
              <div
                className={
                  "bg-error-container text-on-error-container p-space-md rounded-xl flex items-start gap-space-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"error"}
                </span>
                <div className={"flex-grow"}>
                  <div className={"font-label-md font-bold"}>
                    {actions.text("Authentication Failed (401 Unauthorized)")}
                  </div>
                  <p className={"font-body-sm mt-space-xs"}>
                    {actions.text(
                      "Invalid client secret or expired Bearer JWT token. Please re-authenticate your developer session.",
                    )}
                  </p>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm text-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-error text-[36px] mb-space-sm"
                  }
                >
                  {"timer_off"}
                </span>
                <h3 className={"font-headline-sm text-on-surface mb-space-xs"}>
                  {actions.text("Session Expired")}
                </h3>
                <p
                  className={"font-body-sm text-on-surface-variant mb-space-md"}
                >
                  {actions.text(
                    "For your security, this sandbox session has timed out due to 15 minutes of inactivity.",
                  )}
                </p>
                <div
                  className={
                    "inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container rounded-lg font-code-md text-on-surface mb-space-md"
                  }
                >
                  {actions.text("\n          Auto-redirecting in ")}
                  <span className={"text-primary font-bold"} id={"countdown"}>
                    {actions.text("10")}
                  </span>
                  {actions.text("s...\n        ")}
                </div>
                <div>
                  <button
                    data-action-text={"Re-authenticate Now"}
                    className={
                      "px-space-md py-space-sm bg-primary text-on-primary rounded-lg font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Re-authenticate Now")}
                    data-handler={"switchTab('login')"}
                  >
                    {actions.text("Re-authenticate Now")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm text-center flex flex-col items-center"
                }
              >
                <div
                  className={
                    "w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-space-md"
                  }
                ></div>
                <div className={"font-headline-sm text-on-surface"}>
                  {actions.text("Validating OAuth Scope...")}
                </div>
                <p className={"font-body-sm text-on-surface-variant"}>
                  {actions.text("Handshaking with API HUB identity provider.")}
                </p>
              </div>
            </div>

            <div
              id={"panel-access"}
              className={
                actions.visible("panel-access", false)
                  ? "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl text-center"
                  : "auth-panel max-w-md mx-auto w-full bg-surface-container-lowest rounded-xl shadow-md p-space-xl text-center hidden"
              }
            >
              <div
                className={
                  "w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-space-lg"
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
                  "inline-block px-space-sm py-0.5 rounded bg-error-container text-on-error-container font-code-sm mb-space-sm"
                }
              >
                {actions.text("HTTP 403 FORBIDDEN")}
              </div>
              <h2 className={"font-headline-md text-on-surface mb-space-xs"}>
                {actions.text("Insufficient Permissions")}
              </h2>
              <p className={"font-body-sm text-on-surface-variant mb-space-lg"}>
                {actions.text("\n        Your current API key lacks the ")}
                <code
                  className={
                    "font-code-sm bg-surface-container px-1 py-0.5 rounded text-primary"
                  }
                >
                  {"enterprise:billing"}
                </code>
                {actions.text(
                  " scope required to access this endpoint module.\n      ",
                )}
              </p>
              <div
                className={
                  "p-space-md bg-surface-container rounded-lg text-left mb-space-lg font-code-sm space-y-1"
                }
              >
                <div className={"text-on-surface-variant"}>
                  {actions.text("// Required Scope:")}
                </div>
                <div className={"text-primary"}>
                  {actions.text("scope:write:financial_v2")}
                </div>
                <div className={"text-on-surface-variant mt-2"}>
                  {actions.text("// Provided Key Scope:")}
                </div>
                <div className={"text-error"}>
                  {actions.text("scope:read:public_v1")}
                </div>
              </div>
              <div className={"flex gap-space-sm"}>
                <button
                  data-action-text={"Switch Account"}
                  className={
                    "flex-1 py-space-sm px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90"
                  }
                  type="button"
                  aria-label={actions.text("Switch Account")}
                  data-handler={"switchTab('login')"}
                >
                  {actions.text("Switch Account")}
                </button>
                <button
                  data-action-text={"Request Scope"}
                  className={
                    "flex-1 py-space-sm px-space-md rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high"
                  }
                  type="button"
                  aria-label={actions.text("Request Scope")}
                  data-handler={
                    "alert('Access request submitted to workspace admin.')"
                  }
                >
                  {actions.text("Request Scope")}
                </button>
              </div>
            </div>

            <div
              id={"panel-grid"}
              className={
                actions.visible("panel-grid", false)
                  ? "auth-panel w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg"
                  : "auth-panel w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg hidden"
              }
            >
              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "font-label-md px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed"
                      }
                    >
                      {actions.text("Flow 01")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"login"}
                    </span>
                  </div>
                  <h3
                    className={"font-headline-sm text-on-surface mb-space-xs"}
                  >
                    {actions.text("Standard Login")}
                  </h3>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text(
                      "Email/Password auth with OAuth2 SSO integrations.",
                    )}
                  </p>
                </div>
                <button
                  data-action-text={"Launch View"}
                  className={
                    "w-full py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Launch View")}
                  data-handler={"switchTab('login')"}
                >
                  {actions.text("Launch View")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "font-label-md px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed"
                      }
                    >
                      {actions.text("Flow 02")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"person_add"}
                    </span>
                  </div>
                  <h3
                    className={"font-headline-sm text-on-surface mb-space-xs"}
                  >
                    {actions.text("Developer Registration")}
                  </h3>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text("Real-time strength meter & org mapping.")}
                  </p>
                </div>
                <button
                  data-action-text={"Launch View"}
                  className={
                    "w-full py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Launch View")}
                  data-handler={"switchTab('register')"}
                >
                  {actions.text("Launch View")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "font-label-md px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed"
                      }
                    >
                      {actions.text("Flow 03")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"lock_reset"}
                    </span>
                  </div>
                  <h3
                    className={"font-headline-sm text-on-surface mb-space-xs"}
                  >
                    {actions.text("Password Recovery")}
                  </h3>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text("Secure token generation & email dispatch.")}
                  </p>
                </div>
                <button
                  data-action-text={"Launch View"}
                  className={
                    "w-full py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Launch View")}
                  data-handler={"switchTab('reset')"}
                >
                  {actions.text("Launch View")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "font-label-md px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed"
                      }
                    >
                      {actions.text("Flow 04")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"mark_email_unread"}
                    </span>
                  </div>
                  <h3
                    className={"font-headline-sm text-on-surface mb-space-xs"}
                  >
                    {actions.text("Email Verification")}
                  </h3>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text("Pending state notice & resend logic.")}
                  </p>
                </div>
                <button
                  data-action-text={"Launch View"}
                  className={
                    "w-full py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Launch View")}
                  data-handler={"switchTab('verification')"}
                >
                  {actions.text("Launch View")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "font-label-md px-space-sm py-0.5 rounded bg-error-container text-on-error-container"
                      }
                    >
                      {actions.text("Flow 05")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-error"}
                    >
                      {"warning"}
                    </span>
                  </div>
                  <h3
                    className={"font-headline-sm text-on-surface mb-space-xs"}
                  >
                    {actions.text("Errors & Timeouts")}
                  </h3>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text("401 alerts, countdown timers & spinners.")}
                  </p>
                </div>
                <button
                  data-action-text={"Launch View"}
                  className={
                    "w-full py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Launch View")}
                  data-handler={"switchTab('errors')"}
                >
                  {actions.text("Launch View")}
                </button>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "font-label-md px-space-sm py-0.5 rounded bg-error-container text-on-error-container"
                      }
                    >
                      {actions.text("Flow 06")}
                    </span>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-error"}
                    >
                      {"block"}
                    </span>
                  </div>
                  <h3
                    className={"font-headline-sm text-on-surface mb-space-xs"}
                  >
                    {actions.text("Access Denied (403)")}
                  </h3>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text(
                      "Scope mismatch & endpoint restriction preview.",
                    )}
                  </p>
                </div>
                <button
                  data-action-text={"Launch View"}
                  className={
                    "w-full py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Launch View")}
                  data-handler={"switchTab('access')"}
                >
                  {actions.text("Launch View")}
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
