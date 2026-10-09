import { useScreenActions } from "../features/screen-actions";
export default function Screen37() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div
          className={
            "flex flex-col w-full items-center justify-center min-h-[75vh] px-space-gutter py-space-xl relative overflow-hidden"
          }
        >
          <div
            className={
              "absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -top-32 pointer-events-none -z-10"
            }
          ></div>
          <div
            className={
              "absolute w-[400px] h-[400px] rounded-full bg-secondary-container/30 blur-2xl -bottom-20 right-10 pointer-events-none -z-10"
            }
          ></div>

          <div
            className={
              "mb-space-lg flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-xs rounded-full shadow-sm"
            }
          >
            <span
              className={"w-2 h-2 rounded-full bg-error animate-pulse"}
            ></span>
            <span
              className={
                "font-code-md text-code-md text-on-surface-variant uppercase tracking-wider"
              }
            >
              {actions.text("Authentication Required")}
            </span>
            <span className={"text-outline"}>{actions.text("/")}</span>
            <span
              className={"font-code-md text-code-md text-primary font-medium"}
            >
              {actions.text("/dashboard/keys")}
            </span>
          </div>

          <div
            className={
              "w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl p-space-xl flex flex-col gap-space-lg relative transition-all duration-300 hover:shadow-2xl"
            }
          >
            <div className={"flex flex-col gap-space-xs text-center"}>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mx-auto mb-space-sm shadow-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"lock"}
                </span>
              </div>
              <h1
                className={"font-headline-lg text-headline-lg text-on-surface"}
              >
                {actions.text("Sign in to continue")}
              </h1>
              <p
                className={
                  "font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto"
                }
              >
                {actions.text(
                  "\n        You need to sign in and authorize your account to access API Key Management.\n      ",
                )}
              </p>
            </div>

            <div
              className={
                "bg-surface-container-low rounded-lg p-space-md flex items-center gap-space-md"
              }
            >
              <div
                className={
                  "p-space-xs rounded bg-surface-container text-primary"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"subdirectory_arrow_right"}
                </span>
              </div>
              <div className={"flex flex-col min-w-0"}>
                <span
                  className={
                    "font-label-md text-label-md text-outline uppercase tracking-wider"
                  }
                >
                  {actions.text("Destination")}
                </span>
                <span
                  className={
                    "font-code-md text-code-md text-on-surface truncate"
                  }
                >
                  {actions.text("After signing in, you'll return to ")}
                  <span className={"text-primary font-medium"}>
                    {actions.text("/dashboard/keys")}
                  </span>
                  {actions.text(".")}
                </span>
              </div>
            </div>

            <form
              className={"flex flex-col gap-space-md"}
              onSubmit={actions.submit}
            >
              <div className={"flex flex-col gap-space-xs"}>
                <label
                  className={
                    "font-label-md text-label-md text-on-surface font-medium"
                  }
                  htmlFor={"email"}
                >
                  {actions.text("Developer Email")}
                </label>
                <div className={"relative flex items-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "absolute left-space-md material-symbols-outlined text-outline text-[18px]"
                    }
                  >
                    {"mail"}
                  </span>
                  <input
                    data-source-placeholder={"developer@company.com"}
                    className={
                      "w-full bg-surface-container-lowest text-on-surface font-body-md pl-10 pr-space-md py-space-sm rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                    }
                    id={"email"}
                    placeholder={actions.text("developer@company.com")}
                    required={true}
                    type={"email"}
                  />
                </div>
              </div>
              <div className={"flex flex-col gap-space-xs"}>
                <div className={"flex items-center justify-between"}>
                  <label
                    className={
                      "font-label-md text-label-md text-on-surface font-medium"
                    }
                    htmlFor={"password"}
                  >
                    {actions.text("Password or API Token")}
                  </label>
                  <a
                    data-action-text={"Forgot?"}
                    className={
                      "font-body-sm text-body-sm text-primary hover:underline"
                    }
                    href={"#"}
                  >
                    {actions.text("Forgot?")}
                  </a>
                </div>
                <div className={"relative flex items-center"}>
                  <span
                    aria-hidden={true}
                    className={
                      "absolute left-space-md material-symbols-outlined text-outline text-[18px]"
                    }
                  >
                    {"key"}
                  </span>
                  <input
                    data-source-placeholder={"••••••••••••••••"}
                    className={
                      "w-full bg-surface-container-lowest text-on-surface font-code-md pl-10 pr-space-md py-space-sm rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                    }
                    id={"password"}
                    placeholder={actions.text("••••••••••••••••")}
                    required={true}
                    type={"password"}
                  />
                </div>
              </div>

              <button
                data-action-text={"Sign In to API Hub arrow_forward"}
                className={
                  "mt-space-sm w-full bg-primary hover:bg-primary/90 text-on-primary font-headline-sm py-space-md px-space-lg rounded-lg shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-space-sm"
                }
                type={"submit"}
                aria-label={actions.text("Sign In to API Hub")}
              >
                <span>{actions.text("Sign In to API Hub")}</span>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"arrow_forward"}
                </span>
              </button>
            </form>

            <div
              className={
                "pt-space-md flex items-center justify-between text-body-sm text-outline"
              }
            >
              <span>{actions.text("SSO / SAML available")}</span>
              <a
                data-action-text={"Enterprise Login open_in_new"}
                className={
                  "text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                }
                href={"#"}
              >
                <span>{actions.text("Enterprise Login")}</span>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[14px]"}
                >
                  {"open_in_new"}
                </span>
              </a>
            </div>
          </div>

          <div
            className={
              "mt-space-xl flex items-center gap-space-lg text-outline-variant font-code-md text-code-sm"
            }
          >
            <div className={"flex items-center gap-1"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[16px] text-primary"}
              >
                {"verified_user"}
              </span>
              <span>{actions.text("SOC2 Type II Certified")}</span>
            </div>
            <span>{actions.text("•")}</span>
            <span>{actions.text("TLS 1.3 End-to-End Encryption")}</span>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
