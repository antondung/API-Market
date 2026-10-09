import { useScreenActions } from "../features/screen-actions";
export default function Screen40() {
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
          <section
            className={"max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-8 w-full"}
          >
            <div
              className={
                "flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-8"
              }
            >
              <div>
                <div className={"flex items-center gap-2 mb-3"}>
                  <span
                    className={
                      "px-2.5 py-1 bg-primary-container text-on-primary-container text-code-sm font-code-sm rounded-full"
                    }
                  >
                    {actions.text("SPRINT 1 SPECIFICATION")}
                  </span>
                  <span
                    className={
                      "text-code-sm text-on-surface-variant font-code-sm"
                    }
                  >
                    {actions.text("VERSION 1.4.0-STABLE")}
                  </span>
                </div>
                <h1
                  className={
                    "text-headline-lg font-headline-lg text-on-surface tracking-tight"
                  }
                >
                  {actions.text(
                    "Validation, Error Handling & Request States UX Library",
                  )}
                </h1>
                <p
                  className={
                    "text-body-lg text-on-surface-variant mt-2 max-w-2xl"
                  }
                >
                  {actions.text(
                    "Standardized patterns, micro-interactions, and visual states designed to eliminate cognitive friction across all API HUB touchpoints.",
                  )}
                </p>
              </div>
              <div className={"flex items-center gap-3"}>
                <button
                  data-action-text={"code Export Tokens"}
                  className={
                    "px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-body-md font-label-md rounded-lg transition-all flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Export Tokens")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"code"}
                  </span>
                  {actions.text("\n          Export Tokens\n        ")}
                </button>
                <button
                  data-action-text={"download Download Figma Kit"}
                  className={
                    "px-4 py-2 bg-primary text-on-primary text-body-md font-label-md rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Download Figma Kit")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"download"}
                  </span>
                  {actions.text("\n          Download Figma Kit\n        ")}
                </button>
              </div>
            </div>
          </section>

          <section className={"max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full"}>
            <div className={"flex items-center justify-between mb-8"}>
              <div>
                <span
                  className={
                    "text-label-md font-label-md text-primary tracking-widest uppercase"
                  }
                >
                  {actions.text("Section 01")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("Client-Side Form Validation")}
                </h2>
              </div>
              <span
                className={
                  "text-code-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded"
                }
              >
                {actions.text("Real-time validation & helper texts")}
              </span>
            </div>
            <div
              className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}
            >
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <label
                    className={
                      "block text-body-sm font-label-md text-on-surface mb-2"
                    }
                  >
                    {actions.text("API Client Name ")}
                    <span className={"text-error"}>{actions.text("*")}</span>
                  </label>
                  <input
                    data-source-placeholder={"e.g. production-auth-service"}
                    className={
                      "w-full px-3 py-2.5 bg-surface border border-error rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-error/20"
                    }
                    placeholder={actions.text("e.g. production-auth-service")}
                    type={"text"}
                    defaultValue={""}
                    aria-label={actions.text("e.g. production-auth-service")}
                  />
                  <div
                    className={
                      "flex items-center gap-1.5 mt-2 text-error text-body-sm font-body-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"error"}
                    </span>
                    <span>{actions.text("API Client Name is required")}</span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("State: Missing Required")}</span>
                  <span className={"text-error font-bold"}>
                    {actions.text("Error #CS-01")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <label
                    className={
                      "block text-body-sm font-label-md text-on-surface mb-2"
                    }
                  >
                    {actions.text("Developer Email")}
                  </label>
                  <input
                    className={
                      "w-full px-3 py-2.5 bg-surface border border-error rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-error/20 font-code-md"
                    }
                    type={"text"}
                    defaultValue={"alex.dev@corp,internal"}
                    aria-label={actions.text("Input")}
                  />
                  <div
                    className={
                      "flex items-center gap-1.5 mt-2 text-error text-body-sm font-body-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"error"}
                    </span>
                    <span>
                      {actions.text(
                        "Please enter a valid developer email address",
                      )}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("State: Format Mismatch")}</span>
                  <span className={"text-error font-bold"}>
                    {actions.text("Error #CS-02")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <label
                    className={
                      "block text-body-sm font-label-md text-on-surface mb-2"
                    }
                  >
                    {actions.text("Master Key / Password")}
                  </label>
                  <input
                    className={
                      "w-full px-3 py-2.5 bg-surface border border-error rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-error/20 font-code-md"
                    }
                    type={"password"}
                    defaultValue={"secret123"}
                    aria-label={actions.text("Input")}
                  />
                  <div
                    className={
                      "flex items-start gap-1.5 mt-2 text-error text-body-sm font-body-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[16px] shrink-0 mt-0.5"
                      }
                    >
                      {"error"}
                    </span>
                    <span>
                      {actions.text(
                        "Must contain at least 12 characters, 1 uppercase letter, 1 number, and 1 symbol.",
                      )}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("State: Policy Violation")}</span>
                  <span className={"text-error font-bold"}>
                    {actions.text("Error #CS-03")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <label
                    className={
                      "block text-body-sm font-label-md text-on-surface mb-2"
                    }
                  >
                    {actions.text("Confirm Secret Key")}
                  </label>
                  <input
                    className={
                      "w-full px-3 py-2.5 bg-surface border border-error rounded-lg text-body-md text-on-surface focus:outline-none"
                    }
                    type={"password"}
                    defaultValue={"SecureKey#999!"}
                    aria-label={actions.text("Input")}
                  />
                  <div
                    className={
                      "flex items-center gap-1.5 mt-2 text-error text-body-sm font-body-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"error"}
                    </span>
                    <span>
                      {actions.text("Passwords do not match. Please re-enter")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("State: Mismatch")}</span>
                  <span className={"text-error font-bold"}>
                    {actions.text("Error #CS-04")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <label
                    className={
                      "block text-body-sm font-label-md text-on-surface mb-4"
                    }
                  >
                    {actions.text("Governance Agreement")}
                  </label>
                  <div
                    className={
                      "flex items-start gap-3 p-3 bg-error-container/30 border border-error rounded-lg"
                    }
                  >
                    <input
                      className={
                        "mt-1 w-4 h-4 text-primary rounded border-error focus:ring-error"
                      }
                      type={"checkbox"}
                      aria-label={actions.text("Input")}
                    />
                    <span className={"text-body-sm text-on-surface"}>
                      {actions.text(
                        "I agree to the API HUB Developer Terms of Service and SLA guidelines.",
                      )}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center gap-1.5 mt-2 text-error text-body-sm font-body-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"error"}
                    </span>
                    <span>
                      {actions.text(
                        "You must agree to the API HUB Developer Terms of Service",
                      )}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("State: Unchecked Required")}</span>
                  <span className={"text-error font-bold"}>
                    {actions.text("Error #CS-05")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <label
                    className={
                      "block text-body-sm font-label-md text-on-surface mb-2"
                    }
                  >
                    {actions.text("Webhook Endpoint URI")}
                  </label>
                  <input
                    className={
                      "w-full px-3 py-2.5 bg-surface border border-error rounded-lg text-body-md text-on-surface font-code-md"
                    }
                    type={"text"}
                    defaultValue={"ftp://internal.webhook.receiver/v1"}
                    aria-label={actions.text("Input")}
                  />
                  <div
                    className={
                      "flex items-center gap-1.5 mt-2 text-error text-body-sm font-body-sm"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"error"}
                    </span>
                    <span>
                      {actions.text(
                        "Invalid protocol format. Must start with https://",
                      )}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("State: Protocol Invalid")}</span>
                  <span className={"text-error font-bold"}>
                    {actions.text("Error #CS-06")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section
            className={
              "max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full bg-surface-container-low/50"
            }
          >
            <div className={"flex items-center justify-between mb-8"}>
              <div>
                <span
                  className={
                    "text-label-md font-label-md text-primary tracking-widest uppercase"
                  }
                >
                  {actions.text("Section 02")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("Backend Validation & State Responses")}
                </h2>
              </div>
              <span
                className={
                  "text-code-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded"
                }
              >
                {actions.text("API Response Payload Handling")}
              </span>
            </div>
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"}>
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("409 Conflict")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("/api/v1/auth/register")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-4 bg-error-container/20 border border-error/40 rounded-lg mb-4"
                    }
                  >
                    <div className={"flex items-start gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error mt-0.5"
                        }
                      >
                        {"warning"}
                      </span>
                      <div>
                        <h4
                          className={
                            "text-body-md font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("Email already registered")}
                        </h4>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text(
                            "This email is already associated with an active developer account. ",
                          )}
                          <a
                            data-action-text={"Sign in instead"}
                            className={"text-primary font-bold underline"}
                            href={"#"}
                          >
                            {actions.text("Sign in instead")}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "pt-4 border-t border-outline-variant/20 flex items-center justify-between text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Preserved Form Data: Active")}</span>
                  <span className={"text-emerald-600 font-medium"}>
                    {actions.text("Auto-recovery ready")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("401 Unauthorized")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("/api/v1/auth/token")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-4 bg-error-container/20 border border-error/40 rounded-lg mb-4"
                    }
                  >
                    <div className={"flex items-start gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error mt-0.5"
                        }
                      >
                        {"lock_reset"}
                      </span>
                      <div>
                        <h4
                          className={
                            "text-body-md font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("Authentication Failure")}
                        </h4>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text(
                            "Incorrect email or password. Please verify your credentials or reset your master key.",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "pt-4 border-t border-outline-variant/20 flex items-center justify-between text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Remaining Attempts: 3/5")}</span>
                  <a
                    data-action-text={"Reset Password"}
                    className={"text-primary font-bold hover:underline"}
                    href={"#"}
                  >
                    {actions.text("Reset Password")}
                  </a>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("403 Forbidden")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("/api/v1/provider/status")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-4 bg-error-container/20 border border-error/40 rounded-lg mb-4"
                    }
                  >
                    <div className={"flex items-start gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error mt-0.5"
                        }
                      >
                        {"block"}
                      </span>
                      <div>
                        <h4
                          className={
                            "text-body-md font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("Account Temporarily Suspended")}
                        </h4>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text(
                            "Your provider account has been temporarily suspended due to security audit. ",
                          )}
                          <a
                            data-action-text={"Contact support"}
                            className={"text-primary font-bold underline"}
                            href={"#"}
                          >
                            {actions.text("Contact support")}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "pt-4 border-t border-outline-variant/20 flex items-center justify-between text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Ticket Ref: #SEC-9921")}</span>
                  <span className={"text-error font-medium"}>
                    {actions.text("Action Required")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("422 Unprocessable")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("/api/v1/users/provision")}
                    </span>
                  </div>
                  <div
                    className={
                      "p-4 bg-error-container/20 border border-error/40 rounded-lg mb-4"
                    }
                  >
                    <div className={"flex items-start gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error mt-0.5"
                        }
                      >
                        {"security"}
                      </span>
                      <div>
                        <h4
                          className={
                            "text-body-md font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("Governance Violation")}
                        </h4>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text(
                            "Self-registration for Admin role is strictly prohibited by security governance.",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "pt-4 border-t border-outline-variant/20 flex items-center justify-between text-code-sm text-on-surface-variant"
                  }
                >
                  <span>{actions.text("Logged to Security SIEM")}</span>
                  <span className={"text-on-surface-variant"}>
                    {actions.text("Role: Developer Only")}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={"bg-surface-container-lowest p-6 rounded-xl shadow-sm"}
            >
              <div className={"flex items-center justify-between mb-4"}>
                <div className={"flex items-center gap-3"}>
                  <div
                    className={
                      "w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined"}
                    >
                      {"report"}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text(
                        "Submission Blocked: 4 Validation Errors Found",
                      )}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Your entered data has been securely preserved in local session storage.",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"Dismiss Summary"}
                  className={
                    "px-3 py-1.5 bg-surface-container text-on-surface text-body-sm font-label-md rounded-lg hover:bg-surface-container-high transition-colors"
                  }
                  type="button"
                  aria-label={actions.text("Dismiss Summary")}
                >
                  {actions.text("\n          Dismiss Summary\n        ")}
                </button>
              </div>
              <div
                className={
                  "grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-outline-variant/20"
                }
              >
                <div
                  className={
                    "p-3 bg-error-container/10 border-l-4 border-error rounded"
                  }
                >
                  <span className={"text-code-sm text-error font-bold block"}>
                    {actions.text("Field: client_name")}
                  </span>
                  <span className={"text-body-sm text-on-surface"}>
                    {actions.text("Required field missing")}
                  </span>
                </div>
                <div
                  className={
                    "p-3 bg-error-container/10 border-l-4 border-error rounded"
                  }
                >
                  <span className={"text-code-sm text-error font-bold block"}>
                    {actions.text("Field: rate_limit")}
                  </span>
                  <span className={"text-body-sm text-on-surface"}>
                    {actions.text("Must be between 100 and 10000")}
                  </span>
                </div>
                <div
                  className={
                    "p-3 bg-error-container/10 border-l-4 border-error rounded"
                  }
                >
                  <span className={"text-code-sm text-error font-bold block"}>
                    {actions.text("Field: webhook_url")}
                  </span>
                  <span className={"text-body-sm text-on-surface"}>
                    {actions.text("Invalid protocol format")}
                  </span>
                </div>
                <div
                  className={
                    "p-3 bg-error-container/10 border-l-4 border-error rounded"
                  }
                >
                  <span className={"text-code-sm text-error font-bold block"}>
                    {actions.text("Field: scopes")}
                  </span>
                  <span className={"text-body-sm text-on-surface"}>
                    {actions.text("At least one scope required")}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={"max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full"}>
            <div className={"flex items-center justify-between mb-8"}>
              <div>
                <span
                  className={
                    "text-label-md font-label-md text-primary tracking-widest uppercase"
                  }
                >
                  {actions.text("Section 03")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("API Request States & Lifecycle Simulator")}
                </h2>
              </div>
              <div
                className={
                  "flex items-center gap-2 bg-surface-container p-1 rounded-lg"
                }
              >
                <button
                  data-action-text={"Initial"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded bg-surface shadow-sm state-btn"
                  }
                  data-state={"initial"}
                  type="button"
                  aria-label={actions.text("Initial")}
                  data-handler={"switchState('initial')"}
                >
                  {actions.text("Initial")}
                </button>
                <button
                  data-action-text={"Loading"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant state-btn"
                  }
                  data-state={"loading"}
                  type="button"
                  aria-label={actions.text("Loading")}
                  data-handler={"switchState('loading')"}
                >
                  {actions.text("Loading")}
                </button>
                <button
                  data-action-text={"Success"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant state-btn"
                  }
                  data-state={"success"}
                  type="button"
                  aria-label={actions.text("Success")}
                  data-handler={"switchState('success')"}
                >
                  {actions.text("Success")}
                </button>
                <button
                  data-action-text={"Empty"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant state-btn"
                  }
                  data-state={"empty"}
                  type="button"
                  aria-label={actions.text("Empty")}
                  data-handler={"switchState('empty')"}
                >
                  {actions.text("Empty")}
                </button>
                <button
                  data-action-text={"Error"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant state-btn"
                  }
                  data-state={"error"}
                  type="button"
                  aria-label={actions.text("Error")}
                  data-handler={"switchState('error')"}
                >
                  {actions.text("Error")}
                </button>
                <button
                  data-action-text={"Timeout"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant state-btn"
                  }
                  data-state={"timeout"}
                  type="button"
                  aria-label={actions.text("Timeout")}
                  data-handler={"switchState('timeout')"}
                >
                  {actions.text("Timeout")}
                </button>
                <button
                  data-action-text={"Retrying"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant state-btn"
                  }
                  data-state={"retrying"}
                  type="button"
                  aria-label={actions.text("Retrying")}
                  data-handler={"switchState('retrying')"}
                >
                  {actions.text("Retrying")}
                </button>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-8 shadow-sm min-h-[320px] flex items-center justify-center relative overflow-hidden"
              }
            >
              <div
                id={"state-initial"}
                className={
                  actions.visible("state-initial", true)
                    ? "request-state flex flex-col items-center text-center max-w-md"
                    : "request-state flex flex-col items-center text-center max-w-md hidden"
                }
              >
                <div
                  className={
                    "w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-4"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[32px]"}
                  >
                    {"bolt"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Ready to Execute Request")}
                </h3>
                <p className={"text-body-md text-on-surface-variant mt-2"}>
                  {actions.text(
                    "Configure query parameters and headers above, then dispatch the API call to inspect live lifecycle transitions.",
                  )}
                </p>
                <button
                  data-action-text={"Send Test Request"}
                  className={
                    "mt-6 px-6 py-2.5 bg-primary text-on-primary font-label-md rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                  }
                  type="button"
                  aria-label={actions.text("Send Test Request")}
                  data-handler={"switchState('loading')"}
                >
                  {actions.text("\n          Send Test Request\n        ")}
                </button>
              </div>

              <div
                id={"state-loading"}
                className={
                  actions.visible("state-loading", false)
                    ? "request-state flex flex-col items-center text-center max-w-md"
                    : "request-state flex flex-col items-center text-center max-w-md hidden"
                }
              >
                <div className={"relative w-16 h-16 mb-4"}>
                  <div
                    className={
                      "absolute inset-0 border-4 border-primary/20 rounded-full"
                    }
                  ></div>
                  <div
                    className={
                      "absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"
                    }
                  ></div>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Executing API Request...")}
                </h3>
                <p
                  className={
                    "text-body-md text-on-surface-variant mt-2 font-code-md text-primary"
                  }
                >
                  {actions.text("POST /v1/endpoints/dispatch — 240ms elapsed")}
                </p>
                <button
                  data-action-text={"Cancel Request"}
                  className={
                    "mt-6 px-4 py-2 bg-error-container text-on-error-container font-label-md rounded-lg hover:bg-error-container/80 transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Cancel Request")}
                  data-handler={"switchState('cancelled')"}
                >
                  {actions.text("\n          Cancel Request\n        ")}
                </button>
              </div>

              <div
                id={"state-success"}
                className={
                  actions.visible("state-success", false)
                    ? "request-state w-full"
                    : "request-state w-full hidden"
                }
              >
                <div
                  className={
                    "flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20"
                  }
                >
                  <div className={"flex items-center gap-2"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-emerald-100 text-emerald-800 text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("200 OK")}
                    </span>
                    <span
                      className={
                        "text-code-sm font-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("Response received in 142ms")}
                    </span>
                  </div>
                  <span
                    className={
                      "text-code-sm font-code-sm text-emerald-600 font-bold"
                    }
                  >
                    {actions.text("● Live Connection")}
                  </span>
                </div>
                <pre
                  className={
                    "bg-inverse-surface text-inverse-on-surface p-4 rounded-lg font-code-md overflow-x-auto text-xs"
                  }
                >
                  <code>
                    {
                      '{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "client_id": "cli_99823101",\n    "rate_limit_remaining": 4982,\n    "sync_timestamp": "2024-10-24T12:00:00Z"\n  }\n}'
                    }
                  </code>
                </pre>
              </div>

              <div
                id={"state-empty"}
                className={
                  actions.visible("state-empty", false)
                    ? "request-state flex flex-col items-center text-center max-w-md"
                    : "request-state flex flex-col items-center text-center max-w-md hidden"
                }
              >
                <div
                  className={
                    "w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[32px]"}
                  >
                    {"inbox"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("No Records Found")}
                </h3>
                <p className={"text-body-md text-on-surface-variant mt-2"}>
                  {actions.text(
                    "The query executed successfully but returned 0 results for the specified date range.",
                  )}
                </p>
                <button
                  data-action-text={"Reset Query Filters"}
                  className={
                    "mt-6 px-4 py-2 bg-surface-container text-on-surface font-label-md rounded-lg hover:bg-surface-container-high"
                  }
                  type="button"
                  aria-label={actions.text("Reset Query Filters")}
                  data-handler={"switchState('initial')"}
                >
                  {actions.text("\n          Reset Query Filters\n        ")}
                </button>
              </div>

              <div
                id={"state-error"}
                className={
                  actions.visible("state-error", false)
                    ? "request-state flex flex-col items-center text-center max-w-md"
                    : "request-state flex flex-col items-center text-center max-w-md hidden"
                }
              >
                <div
                  className={
                    "w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-4"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[32px]"}
                  >
                    {"wifi_off"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Network Connection Lost")}
                </h3>
                <p className={"text-body-md text-on-surface-variant mt-2"}>
                  {actions.text(
                    "Unable to reach API HUB gateway. Please check your local network or VPN connection.",
                  )}
                </p>
                <button
                  data-action-text={"refresh Reconnect & Retry"}
                  className={
                    "mt-6 px-6 py-2.5 bg-primary text-on-primary font-label-md rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Reconnect & Retry")}
                  data-handler={"switchState('loading')"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"refresh"}
                  </span>
                  {actions.text("\n          Reconnect & Retry\n        ")}
                </button>
              </div>

              <div
                id={"state-timeout"}
                className={
                  actions.visible("state-timeout", false)
                    ? "request-state flex flex-col items-center text-center max-w-md"
                    : "request-state flex flex-col items-center text-center max-w-md hidden"
                }
              >
                <div
                  className={
                    "w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[32px]"}
                  >
                    {"timer_off"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Gateway Timeout (30s)")}
                </h3>
                <p className={"text-body-md text-on-surface-variant mt-2"}>
                  {actions.text(
                    "The upstream microservice did not respond within the 30,000ms threshold.",
                  )}
                </p>
                <button
                  data-action-text={"Retry with Extended Timeout"}
                  className={
                    "mt-6 px-6 py-2.5 bg-primary text-on-primary font-label-md rounded-lg hover:bg-primary/90"
                  }
                  type="button"
                  aria-label={actions.text("Retry with Extended Timeout")}
                  data-handler={"switchState('loading')"}
                >
                  {actions.text(
                    "\n          Retry with Extended Timeout\n        ",
                  )}
                </button>
              </div>

              <div
                id={"state-retrying"}
                className={
                  actions.visible("state-retrying", false)
                    ? "request-state flex flex-col items-center text-center max-w-md"
                    : "request-state flex flex-col items-center text-center max-w-md hidden"
                }
              >
                <div
                  className={
                    "relative w-16 h-16 mb-4 flex items-center justify-center bg-surface-container rounded-full text-primary"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[32px] animate-spin"
                    }
                  >
                    {"sync"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Attempt 2 of 3 in Progress")}
                </h3>
                <p className={"text-body-md text-on-surface-variant mt-2"}>
                  {actions.text(
                    "Automatic exponential backoff active. Next retry in 1.4 seconds.",
                  )}
                </p>
                <div
                  className={
                    "w-48 h-1.5 bg-surface-container rounded-full mt-4 overflow-hidden"
                  }
                >
                  <div
                    className={
                      "w-2/3 h-full bg-primary rounded-full animate-pulse"
                    }
                  ></div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={
              "max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full bg-surface-container-low/50"
            }
          >
            <div className={"flex items-center justify-between mb-8"}>
              <div>
                <span
                  className={
                    "text-label-md font-label-md text-primary tracking-widest uppercase"
                  }
                >
                  {actions.text("Section 04")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("HTTP Error Presentation Cards")}
                </h2>
              </div>
              <span
                className={
                  "text-code-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded"
                }
              >
                {actions.text("RFC 7807 Problem Details")}
              </span>
            </div>
            <div
              className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}
            >
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("400 Bad Request")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("GET /v1/query")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Malformed Query Parameters")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text(
                      "The request payload violates OpenAPI schema definition. Missing required query parameter ",
                    )}
                    <code
                      className={
                        "text-primary font-code-sm bg-surface px-1.5 py-0.5 rounded"
                      }
                    >
                      {"filter_by"}
                    </code>
                    {actions.text(".")}
                  </p>
                  <div
                    className={
                      "p-3 bg-surface rounded text-code-sm text-on-surface-variant font-code-md"
                    }
                  >
                    {actions.text(
                      "\n            error_code: INVALID_QUERY_SCHEMA\n          ",
                    )}
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between"
                  }
                >
                  <span className={"text-code-sm text-on-surface-variant"}>
                    {actions.text("Docs reference")}
                  </span>
                  <a
                    data-action-text={"API Schema ↗"}
                    className={
                      "text-primary text-body-sm font-bold hover:underline"
                    }
                    href={"#"}
                  >
                    {actions.text("API Schema ↗")}
                  </a>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("401 Unauthorized")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("Bearer Auth")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Token Missing or Expired")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text(
                      "Your JWT bearer token has expired or was revoked. Direct authentication required to proceed.",
                    )}
                  </p>
                  <div
                    className={
                      "p-3 bg-surface rounded text-code-sm text-on-surface-variant font-code-md"
                    }
                  >
                    {actions.text(
                      "\n            error_code: TOKEN_EXPIRED_03\n          ",
                    )}
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between"
                  }
                >
                  <span className={"text-code-sm text-on-surface-variant"}>
                    {actions.text("Session state: Dead")}
                  </span>
                  <button
                    data-action-text={"Sign In Now"}
                    className={
                      "px-3 py-1.5 bg-primary text-on-primary text-body-sm font-label-md rounded-lg hover:bg-primary/90"
                    }
                    type="button"
                    aria-label={actions.text("Sign In Now")}
                  >
                    {actions.text("Sign In Now")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("403 Forbidden")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("RBAC Control")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Secure Shell Breach / Insufficient Role")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text(
                      "Attempted access to enterprise endpoint without required scope ",
                    )}
                    <code
                      className={
                        "text-primary font-code-sm bg-surface px-1.5 py-0.5 rounded"
                      }
                    >
                      {"admin:billing"}
                    </code>
                    {actions.text(".")}
                  </p>
                  <div
                    className={
                      "p-3 bg-surface rounded text-code-sm text-on-surface-variant font-code-md"
                    }
                  >
                    {actions.text(
                      "\n            error_code: INSUFFICIENT_SCOPE\n          ",
                    )}
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between"
                  }
                >
                  <span className={"text-code-sm text-on-surface-variant"}>
                    {actions.text("Audit Ref: #403-SEC")}
                  </span>
                  <a
                    data-action-text={"Request Access"}
                    className={
                      "text-primary text-body-sm font-bold hover:underline"
                    }
                    href={"#"}
                  >
                    {actions.text("Request Access")}
                  </a>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("404 Not Found")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("GET Endpoint")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Resource Does Not Exist")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text("The requested route ")}
                    <code
                      className={
                        "text-primary font-code-sm bg-surface px-1.5 py-0.5 rounded"
                      }
                    >
                      {"/v1/routes/unknown"}
                    </code>
                    {actions.text(
                      " could not be matched against the routing table.",
                    )}
                  </p>
                  <div
                    className={
                      "p-3 bg-surface rounded text-code-sm text-on-surface-variant font-code-md"
                    }
                  >
                    {actions.text(
                      "\n            error_code: ROUTE_NOT_FOUND\n          ",
                    )}
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between"
                  }
                >
                  <span className={"text-code-sm text-on-surface-variant"}>
                    {actions.text("Catalog check")}
                  </span>
                  <a
                    data-action-text={"View API Catalog"}
                    className={
                      "text-primary text-body-sm font-bold hover:underline"
                    }
                    href={"#"}
                  >
                    {actions.text("View API Catalog")}
                  </a>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("409 Conflict")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("POST Webhook")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Duplicate Subscription")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text("A webhook URL matching ")}
                    <code
                      className={
                        "text-primary font-code-sm bg-surface px-1.5 py-0.5 rounded"
                      }
                    >
                      {"https://api.corp.io/hook"}
                    </code>
                    {actions.text(" is already registered under your team.")}
                  </p>
                  <div
                    className={
                      "p-3 bg-surface rounded text-code-sm text-on-surface-variant font-code-md"
                    }
                  >
                    {actions.text(
                      "\n            error_code: DUPLICATE_WEBHOOK\n          ",
                    )}
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between"
                  }
                >
                  <span className={"text-code-sm text-on-surface-variant"}>
                    {actions.text("Action")}
                  </span>
                  <a
                    data-action-text={"Edit Existing Webhook"}
                    className={
                      "text-primary text-body-sm font-bold hover:underline"
                    }
                    href={"#"}
                  >
                    {actions.text("Edit Existing Webhook")}
                  </a>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span
                      className={
                        "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                      }
                    >
                      {actions.text("429 Rate Limited")}
                    </span>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("Quota Exceeded")}
                    </span>
                  </div>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Rate Limit Exceeded")}
                  </h3>
                  <p className={"text-body-sm text-on-surface-variant mb-4"}>
                    {actions.text(
                      "You have exceeded 1,000 requests/minute tier limit. Retry-After header indicates cool down.",
                    )}
                  </p>
                  <div
                    className={
                      "p-3 bg-surface rounded flex items-center justify-between text-code-sm text-on-surface-variant font-code-md"
                    }
                  >
                    <span>{actions.text("Retry-After: 42s")}</span>
                    <span className={"text-error font-bold"}>
                      {actions.text("00:42 remaining")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between"
                  }
                >
                  <span className={"text-code-sm text-on-surface-variant"}>
                    {actions.text("Need higher limits?")}
                  </span>
                  <a
                    data-action-text={"Upgrade Tier"}
                    className={
                      "text-primary text-body-sm font-bold hover:underline"
                    }
                    href={"#"}
                  >
                    {actions.text("Upgrade Tier")}
                  </a>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-3"
                }
              >
                <div
                  className={
                    "flex flex-col md:flex-row md:items-center justify-between gap-4"
                  }
                >
                  <div>
                    <div className={"flex items-center gap-3 mb-2"}>
                      <span
                        className={
                          "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm font-code-sm rounded"
                        }
                      >
                        {actions.text("500 Server Error")}
                      </span>
                      <span className={"text-code-sm text-on-surface-variant"}>
                        {actions.text("Upstream Gateway Fault")}
                      </span>
                    </div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Internal Microservice Exception in ")}
                      <code
                        className={
                          "text-primary font-code-sm bg-surface px-1.5 py-0.5 rounded"
                        }
                      >
                        {"auth-service-v2"}
                      </code>
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant mt-1"}>
                      {actions.text(
                        "The server encountered an unexpected internal condition and could not fulfill your request. Incident ticket automatically generated.",
                      )}
                    </p>
                  </div>
                  <div className={"flex items-center gap-3 shrink-0"}>
                    <button
                      data-action-text={"refresh One-Click Retry"}
                      className={
                        "px-4 py-2 bg-primary text-on-primary text-body-md font-label-md rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text("One-Click Retry")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"refresh"}
                      </span>
                      {actions.text(
                        "\n              One-Click Retry\n            ",
                      )}
                    </button>
                    <button
                      data-action-text={
                        "support_agent Open Support Ticket (#INC-4482)"
                      }
                      className={
                        "px-4 py-2 bg-surface-container text-on-surface text-body-md font-label-md rounded-lg hover:bg-surface-container-high transition-all flex items-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text(
                        "Open Support Ticket (#INC-4482)",
                      )}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"support_agent"}
                      </span>
                      {actions.text(
                        "\n              Open Support Ticket (#INC-4482)\n            ",
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={"max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full"}>
            <div className={"flex items-center justify-between mb-8"}>
              <div>
                <span
                  className={
                    "text-label-md font-label-md text-primary tracking-widest uppercase"
                  }
                >
                  {actions.text("Section 05")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("Global Feedback & Notification System")}
                </h2>
              </div>
              <span
                className={
                  "text-code-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded"
                }
              >
                {actions.text("Toasts, Banners & Alerts")}
              </span>
            </div>
            <div className={"space-y-6"}>
              <div
                className={
                  "p-4 bg-error-container text-on-error-container rounded-xl flex items-center justify-between shadow-sm"
                }
              >
                <div className={"flex items-center gap-3"}>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"warning"}
                  </span>
                  <span className={"text-body-md font-body-md font-medium"}>
                    {actions.text(
                      "Critical Security Notice: API Key rotation required for 2 endpoints due to recent policy updates.",
                    )}
                  </span>
                </div>
                <button
                  data-action-text={"close"}
                  className={
                    "text-on-error-container hover:opacity-75 transition-opacity"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>
                <div
                  className={
                    "bg-surface-container-lowest p-4 rounded-xl shadow-md border-l-4 border-emerald-500 flex items-start justify-between"
                  }
                >
                  <div className={"flex items-start gap-3"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 mt-0.5"
                      }
                    >
                      {"check_circle"}
                    </span>
                    <div>
                      <h4
                        className={
                          "text-body-md font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Key Successfully Rotated")}
                      </h4>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant mt-0.5"
                        }
                      >
                        {actions.text(
                          "API key successfully rotated and copied to clipboard.",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    data-action-text={"close"}
                    className={"text-on-surface-variant hover:text-on-surface"}
                    type="button"
                    aria-label={actions.text("Close")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"close"}
                    </span>
                  </button>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-4 rounded-xl shadow-md border-l-4 border-error flex items-start justify-between"
                  }
                >
                  <div className={"flex items-start gap-3"}>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-error mt-0.5"}
                    >
                      {"error"}
                    </span>
                    <div>
                      <h4
                        className={
                          "text-body-md font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Synchronization Failed")}
                      </h4>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant mt-0.5"
                        }
                      >
                        {actions.text(
                          "Failed to synchronize webhook subscription.",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    data-action-text={"close"}
                    className={"text-on-surface-variant hover:text-on-surface"}
                    type="button"
                    aria-label={actions.text("Close")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"close"}
                    </span>
                  </button>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-4 rounded-xl shadow-md border-l-4 border-amber-500 flex items-start justify-between"
                  }
                >
                  <div className={"flex items-start gap-3"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-amber-600 mt-0.5"
                      }
                    >
                      {"warning"}
                    </span>
                    <div>
                      <h4
                        className={
                          "text-body-md font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Quota Warning")}
                      </h4>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant mt-0.5"
                        }
                      >
                        {actions.text(
                          "API quota at 90% capacity for current billing cycle.",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    data-action-text={"close"}
                    className={"text-on-surface-variant hover:text-on-surface"}
                    type="button"
                    aria-label={actions.text("Close")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"close"}
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={
                  "p-4 bg-surface-container rounded-xl flex items-center justify-between"
                }
              >
                <div className={"flex items-center gap-3"}>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-primary"}
                  >
                    {"info"}
                  </span>
                  <span className={"text-body-md text-on-surface"}>
                    {actions.text(
                      "Sandbox environment is currently running v2.4-rc1. Production requests remain isolated.",
                    )}
                  </span>
                </div>
                <a
                  data-action-text={"Release Notes"}
                  className={
                    "text-primary text-body-sm font-bold hover:underline"
                  }
                  href={"#"}
                >
                  {actions.text("Release Notes")}
                </a>
              </div>
            </div>
          </section>

          <section
            className={
              "max-w-7xl mx-auto px-6 lg:px-12 py-12 mb-12 w-full bg-surface-container-low/50"
            }
          >
            <div className={"flex items-center justify-between mb-8"}>
              <div>
                <span
                  className={
                    "text-label-md font-label-md text-primary tracking-widest uppercase"
                  }
                >
                  {actions.text("Section 06")}
                </span>
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("Form Submission Lifecycle Simulation")}
                </h2>
              </div>
              <div
                className={
                  "flex items-center gap-2 bg-surface-container p-1 rounded-lg"
                }
              >
                <button
                  data-action-text={"Idle"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded bg-surface shadow-sm sub-btn"
                  }
                  data-sub={"idle"}
                  type="button"
                  aria-label={actions.text("Idle")}
                  data-handler={"switchSubState('idle')"}
                >
                  {actions.text("Idle")}
                </button>
                <button
                  data-action-text={"Submitting"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant sub-btn"
                  }
                  data-sub={"submitting"}
                  type="button"
                  aria-label={actions.text("Submitting")}
                  data-handler={"switchSubState('submitting')"}
                >
                  {actions.text("Submitting")}
                </button>
                <button
                  data-action-text={"Success"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant sub-btn"
                  }
                  data-sub={"success"}
                  type="button"
                  aria-label={actions.text("Success")}
                  data-handler={"switchSubState('success')"}
                >
                  {actions.text("Success")}
                </button>
                <button
                  data-action-text={"Rejected"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant sub-btn"
                  }
                  data-sub={"rejected"}
                  type="button"
                  aria-label={actions.text("Rejected")}
                  data-handler={"switchSubState('rejected')"}
                >
                  {actions.text("Rejected")}
                </button>
                <button
                  data-action-text={"Disconnected"}
                  className={
                    "px-3 py-1 text-code-sm font-code-sm rounded text-on-surface-variant sub-btn"
                  }
                  data-sub={"disconnected"}
                  type="button"
                  aria-label={actions.text("Disconnected")}
                  data-handler={"switchSubState('disconnected')"}
                >
                  {actions.text("Disconnected")}
                </button>
              </div>
            </div>

            <div
              className={"bg-surface-container-lowest p-8 rounded-xl shadow-sm"}
            >
              <div className={"sub-state space-y-4"} id={"sub-idle"}>
                <div
                  className={
                    "flex items-center justify-between pb-4 border-b border-outline-variant/20"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Developer Profile Update Form")}
                  </h3>
                  <span
                    className={
                      "px-2.5 py-1 bg-surface-container text-on-surface text-code-sm rounded"
                    }
                  >
                    {actions.text("State: IDLE (Ready)")}
                  </span>
                </div>
                <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Developer Name")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-body-md text-on-surface"
                      }
                      type={"text"}
                      defaultValue={"Alex Vance"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Organization Slug")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-body-md text-on-surface font-code-md"
                      }
                      type={"text"}
                      defaultValue={"apihub-enterprise"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                </div>
                <div className={"flex justify-end gap-3 pt-4"}>
                  <button
                    data-action-text={"Reset"}
                    className={
                      "px-4 py-2 bg-surface-container text-on-surface rounded-lg text-body-md font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Reset")}
                  >
                    {actions.text("Reset")}
                  </button>
                  <button
                    data-action-text={"Save Changes"}
                    className={
                      "px-6 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md hover:bg-primary/90"
                    }
                    type="button"
                    aria-label={actions.text("Save Changes")}
                    data-handler={"switchSubState('submitting')"}
                  >
                    {actions.text("Save Changes")}
                  </button>
                </div>
              </div>

              <div
                id={"sub-submitting"}
                className={
                  actions.visible("sub-submitting", false)
                    ? "sub-state space-y-4"
                    : "sub-state space-y-4 hidden"
                }
              >
                <div
                  className={
                    "flex items-center justify-between pb-4 border-b border-outline-variant/20"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Developer Profile Update Form")}
                  </h3>
                  <span
                    className={
                      "px-2.5 py-1 bg-primary-container text-on-primary-container text-code-sm rounded animate-pulse"
                    }
                  >
                    {actions.text("State: SUBMITTING...")}
                  </span>
                </div>
                <div
                  className={
                    "grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 pointer-events-none"
                  }
                >
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Developer Name")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-body-md text-on-surface"
                      }
                      disabled={true}
                      type={"text"}
                      defaultValue={"Alex Vance"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Organization Slug")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-body-md text-on-surface font-code-md"
                      }
                      disabled={true}
                      type={"text"}
                      defaultValue={"apihub-enterprise"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                </div>
                <div className={"flex justify-end gap-3 pt-4"}>
                  <button
                    data-action-text={"Reset"}
                    className={
                      "px-4 py-2 bg-surface-container text-on-surface/50 rounded-lg text-body-md font-label-md cursor-not-allowed"
                    }
                    disabled={true}
                    type="button"
                    aria-label={actions.text("Reset")}
                  >
                    {actions.text("Reset")}
                  </button>
                  <button
                    data-action-text={"Saving..."}
                    className={
                      "px-6 py-2 bg-primary/70 text-on-primary rounded-lg text-body-md font-label-md flex items-center gap-2 cursor-not-allowed"
                    }
                    disabled={true}
                    type="button"
                    aria-label={actions.text("Saving...")}
                  >
                    <div
                      className={
                        "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      }
                    ></div>
                    {actions.text("\n            Saving...\n          ")}
                  </button>
                </div>
              </div>

              <div
                id={"sub-success"}
                className={
                  actions.visible("sub-success", false)
                    ? "sub-state py-8 text-center space-y-4"
                    : "sub-state py-8 text-center space-y-4 hidden"
                }
              >
                <div
                  className={
                    "w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[32px]"}
                  >
                    {"check"}
                  </span>
                </div>
                <h3
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Profile Successfully Updated!")}
                </h3>
                <p
                  className={
                    "text-body-md text-on-surface-variant max-w-sm mx-auto"
                  }
                >
                  {actions.text(
                    "Your changes have been propagated across all global edge nodes. Redirecting to dashboard...",
                  )}
                </p>
                <button
                  data-action-text={"Perform Another Update"}
                  className={
                    "px-6 py-2 bg-surface-container text-on-surface rounded-lg text-body-md font-label-md"
                  }
                  type="button"
                  aria-label={actions.text("Perform Another Update")}
                  data-handler={"switchSubState('idle')"}
                >
                  {actions.text("Perform Another Update")}
                </button>
              </div>

              <div
                id={"sub-rejected"}
                className={
                  actions.visible("sub-rejected", false)
                    ? "sub-state space-y-4"
                    : "sub-state space-y-4 hidden"
                }
              >
                <div
                  className={
                    "p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined"}
                  >
                    {"error"}
                  </span>
                  <span>
                    {actions.text(
                      "Server rejected submission: Organization slug is already claimed by another enterprise.",
                    )}
                  </span>
                </div>
                <div
                  className={
                    "flex items-center justify-between pb-4 border-b border-outline-variant/20"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Developer Profile Update Form")}
                  </h3>
                  <span
                    className={
                      "px-2.5 py-1 bg-error-container text-on-error-container text-code-sm rounded"
                    }
                  >
                    {actions.text("State: REJECTED")}
                  </span>
                </div>
                <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Developer Name")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-body-md text-on-surface"
                      }
                      type={"text"}
                      defaultValue={"Alex Vance"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Organization Slug")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-error rounded-lg text-body-md text-on-surface font-code-md"
                      }
                      type={"text"}
                      defaultValue={"apihub-enterprise"}
                      aria-label={actions.text("Input")}
                    />
                    <span className={"text-error text-body-sm mt-1 block"}>
                      {actions.text("Slug taken")}
                    </span>
                  </div>
                </div>
                <div className={"flex justify-end gap-3 pt-4"}>
                  <button
                    data-action-text={"Discard"}
                    className={
                      "px-4 py-2 bg-surface-container text-on-surface rounded-lg text-body-md font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Discard")}
                    data-handler={"switchSubState('idle')"}
                  >
                    {actions.text("Discard")}
                  </button>
                  <button
                    data-action-text={"Retry Submission"}
                    className={
                      "px-6 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Retry Submission")}
                    data-handler={"switchSubState('submitting')"}
                  >
                    {actions.text("Retry Submission")}
                  </button>
                </div>
              </div>

              <div
                id={"sub-disconnected"}
                className={
                  actions.visible("sub-disconnected", false)
                    ? "sub-state space-y-4"
                    : "sub-state space-y-4 hidden"
                }
              >
                <div
                  className={
                    "p-4 bg-amber-100 text-amber-900 rounded-lg flex items-center justify-between"
                  }
                >
                  <div className={"flex items-center gap-3"}>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined"}
                    >
                      {"wifi_off"}
                    </span>
                    <span>
                      {actions.text(
                        "Network connection lost while submitting. Form input values safely preserved locally.",
                      )}
                    </span>
                  </div>
                  <button
                    data-action-text={"One-Click Retry"}
                    className={
                      "px-3 py-1 bg-amber-900 text-white text-body-sm font-label-md rounded"
                    }
                    type="button"
                    aria-label={actions.text("One-Click Retry")}
                    data-handler={"switchSubState('submitting')"}
                  >
                    {actions.text("One-Click Retry")}
                  </button>
                </div>
                <div
                  className={
                    "flex items-center justify-between pb-4 border-b border-outline-variant/20"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Developer Profile Update Form")}
                  </h3>
                  <span
                    className={
                      "px-2.5 py-1 bg-amber-100 text-amber-800 text-code-sm rounded"
                    }
                  >
                    {actions.text("State: OFFLINE CACHED")}
                  </span>
                </div>
                <div
                  className={"grid grid-cols-1 md:grid-cols-2 gap-4 opacity-90"}
                >
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Developer Name")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-body-md text-on-surface"
                      }
                      type={"text"}
                      defaultValue={"Alex Vance"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-label-md text-on-surface mb-1"
                      }
                    >
                      {actions.text("Organization Slug")}
                    </label>
                    <input
                      className={
                        "w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-body-md text-on-surface font-code-md"
                      }
                      type={"text"}
                      defaultValue={"apihub-enterprise"}
                      aria-label={actions.text("Input")}
                    />
                  </div>
                </div>
                <div className={"flex justify-end gap-3 pt-4"}>
                  <button
                    data-action-text={"Cancel"}
                    className={
                      "px-4 py-2 bg-surface-container text-on-surface rounded-lg text-body-md font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Cancel")}
                    data-handler={"switchSubState('idle')"}
                  >
                    {actions.text("Cancel")}
                  </button>
                  <button
                    data-action-text={"refresh Retry Now"}
                    className={
                      "px-6 py-2 bg-primary text-on-primary rounded-lg text-body-md font-label-md flex items-center gap-2"
                    }
                    type="button"
                    aria-label={actions.text("Retry Now")}
                    data-handler={"switchSubState('submitting')"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"refresh"}
                    </span>
                    {actions.text("\n            Retry Now\n          ")}
                  </button>
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
