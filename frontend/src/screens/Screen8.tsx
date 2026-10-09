import { useScreenActions } from "../features/screen-actions";
export default function Screen8() {
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
              "mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-4"
            }
          >
            <div>
              <div className={"flex items-center gap-space-sm mb-space-xs"}>
                <span
                  className={
                    "px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-sm uppercase tracking-wider"
                  }
                >
                  {actions.text("Sprint 1 Deliverable")}
                </span>
                <span className={"text-on-surface-variant font-code-sm"}>
                  {actions.text("Auth Simulator v1.4")}
                </span>
              </div>
              <h1 className={"font-headline-lg text-on-surface tracking-tight"}>
                {actions.text("Authentication Session Lifecycle")}
              </h1>
              <p
                className={
                  "text-body-lg text-on-surface-variant max-w-2xl mt-1"
                }
              >
                {actions.text(
                  "\n        Interactive state machine simulator testing token renewal, expiry modals, security revocations, and network error handling under enterprise constraints.\n      ",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-space-sm"}>
              <button
                data-action-text={"restart_alt Reset State"}
                className={
                  "px-3 py-1.5 bg-surface-container-high hover:bg-surface-variant text-on-surface text-body-sm rounded flex items-center gap-space-xs transition-colors"
                }
                type="button"
                aria-label={actions.text("Reset State")}
                data-handler={"resetSimulator()"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"restart_alt"}
                </span>
                {actions.text(" Reset State\n      ")}
              </button>
              <button
                data-action-text={"bolt Live Test Runner"}
                className={
                  "px-3 py-1.5 bg-primary text-on-primary text-body-sm rounded flex items-center gap-space-xs hover:bg-primary-container transition-colors shadow-sm"
                }
                type="button"
                aria-label={actions.text("Live Test Runner")}
                data-handler={"triggerRandomSim()"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"bolt"}
                </span>
                {actions.text(" Live Test Runner\n      ")}
              </button>
            </div>
          </div>

          <div className={"w-full overflow-x-auto no-scrollbar mb-space-lg"}>
            <div
              className={
                "flex items-center gap-space-xs min-w-max pb-2 border-b border-outline-variant/30"
              }
            >
              <button
                data-action-text={"01 Auth Init"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all bg-surface-container-high text-primary"
                }
                data-stage={"1"}
                type="button"
                aria-label={actions.text("01 Auth Init")}
                data-handler={"switchStage(1)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("01")}
                </span>
                {actions.text("\n        Auth Init\n      ")}
              </button>
              <button
                data-action-text={"02 Silent Renewal"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all text-on-surface-variant hover:bg-surface-container-low"
                }
                data-stage={"2"}
                type="button"
                aria-label={actions.text("02 Silent Renewal")}
                data-handler={"switchStage(2)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("02")}
                </span>
                {actions.text("\n        Silent Renewal\n      ")}
              </button>
              <button
                data-action-text={"03 Session Expired"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all text-on-surface-variant hover:bg-surface-container-low"
                }
                data-stage={"3"}
                type="button"
                aria-label={actions.text("03 Session Expired")}
                data-handler={"switchStage(3)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("03")}
                </span>
                {actions.text("\n        Session Expired\n      ")}
              </button>
              <button
                data-action-text={"04 Revoked"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all text-on-surface-variant hover:bg-surface-container-low"
                }
                data-stage={"4"}
                type="button"
                aria-label={actions.text("04 Revoked")}
                data-handler={"switchStage(4)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("04")}
                </span>
                {actions.text("\n        Revoked\n      ")}
              </button>
              <button
                data-action-text={"05 Profile Dropdown"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all text-on-surface-variant hover:bg-surface-container-low"
                }
                data-stage={"5"}
                type="button"
                aria-label={actions.text("05 Profile Dropdown")}
                data-handler={"switchStage(5)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("05")}
                </span>
                {actions.text("\n        Profile Dropdown\n      ")}
              </button>
              <button
                data-action-text={"06 Protected Logout"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all text-on-surface-variant hover:bg-surface-container-low"
                }
                data-stage={"6"}
                type="button"
                aria-label={actions.text("06 Protected Logout")}
                data-handler={"switchStage(6)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("06")}
                </span>
                {actions.text("\n        Protected Logout\n      ")}
              </button>
              <button
                data-action-text={"07 Network Failure"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all text-on-surface-variant hover:bg-surface-container-low"
                }
                data-stage={"7"}
                type="button"
                aria-label={actions.text("07 Network Failure")}
                data-handler={"switchStage(7)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("07")}
                </span>
                {actions.text("\n        Network Failure\n      ")}
              </button>
              <button
                data-action-text={"08 API Error"}
                className={
                  "stage-tab px-3 py-2 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all text-on-surface-variant hover:bg-surface-container-low"
                }
                data-stage={"8"}
                type="button"
                aria-label={actions.text("08 API Error")}
                data-handler={"switchStage(8)"}
              >
                <span
                  className={
                    "w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-sm text-[11px]"
                  }
                >
                  {actions.text("08")}
                </span>
                {actions.text("\n        API Error\n      ")}
              </button>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-12 gap-gutter"}>
            <div
              className={
                "lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between min-h-[480px] relative overflow-hidden"
              }
            >
              <div
                className={
                  "flex items-center justify-between pb-space-md border-b border-outline-variant/20 mb-space-md"
                }
              >
                <div className={"flex items-center gap-space-sm"}>
                  <div
                    className={"w-3 h-3 rounded-full bg-primary animate-pulse"}
                  ></div>
                  <span
                    id={"sim-state-indicator"}
                    className={
                      actions.visible("sim-state-indicator", true)
                        ? "font-code-sm text-on-surface font-medium"
                        : "font-code-sm text-on-surface font-medium hidden"
                    }
                  >
                    {actions.text("Stage 01: Auth Initialization")}
                  </span>
                </div>
                <div className={"flex items-center gap-space-xs"}>
                  <span
                    className={
                      "px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-sm"
                    }
                  >
                    {actions.text("ENV: sandbox-us-east")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "flex-1 flex items-center justify-center relative py-space-md"
                }
              >
                <div
                  id={"stage-1-view"}
                  className={
                    actions.visible("stage-1-view", true)
                      ? "stage-view w-full flex flex-col items-center justify-center text-center py-8"
                      : "stage-view w-full flex flex-col items-center justify-center text-center py-8 hidden"
                  }
                >
                  <div
                    className={
                      "w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-space-md relative"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[32px] animate-spin"
                      }
                    >
                      {"progress_activity"}
                    </span>
                  </div>
                  <h3
                    className={"font-headline-md text-on-surface mb-space-xs"}
                  >
                    {actions.text("Validating Active Security Context")}
                  </h3>
                  <p
                    className={
                      "text-body-md text-on-surface-variant max-w-sm mb-space-md"
                    }
                  >
                    {actions.text(
                      "\n            Verifying secure HttpOnly cookies and checking OAuth2 access token validity against edge auth workers...\n          ",
                    )}
                  </p>
                  <div
                    className={
                      "w-48 h-1.5 bg-surface-container rounded-full overflow-hidden"
                    }
                  >
                    <div
                      className={
                        "h-full bg-primary animate-pulse w-3/4 rounded-full"
                      }
                    ></div>
                  </div>
                </div>

                <div
                  id={"stage-2-view"}
                  className={
                    actions.visible("stage-2-view", false)
                      ? "stage-view w-full flex-col items-center justify-center text-center py-8"
                      : "stage-view w-full flex-col items-center justify-center text-center py-8 hidden"
                  }
                >
                  <div
                    className={
                      "absolute top-2 right-2 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-body-sm flex items-center gap-space-xs shadow-sm animate-bounce"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[14px]"}
                    >
                      {"sync"}
                    </span>
                    {actions.text(
                      "\n            Token Expiring in 45s • Refreshing silently...\n          ",
                    )}
                  </div>
                  <div
                    className={
                      "max-w-md w-full bg-surface-container-low p-6 rounded-xl text-left shadow-sm"
                    }
                  >
                    <div className={"flex items-center justify-between mb-4"}>
                      <span className={"font-code-sm text-on-surface-variant"}>
                        {actions.text("Background Worker Task")}
                      </span>
                      <span
                        className={
                          "px-2 py-0.5 bg-primary/10 text-primary font-code-sm rounded"
                        }
                      >
                        {actions.text("POST /oauth/token")}
                      </span>
                    </div>
                    <div className={"space-y-2 font-code-sm text-on-surface"}>
                      <div
                        className={
                          "flex items-center justify-between text-xs text-on-surface-variant border-b border-outline-variant/20 pb-1"
                        }
                      >
                        <span>{actions.text("Payload: refresh_token")}</span>
                        <span>{actions.text("Status: 200 OK")}</span>
                      </div>
                      <p
                        className={
                          "text-xs text-on-surface-variant truncate font-mono"
                        }
                      >
                        {actions.text("Bearer eyJhbGciOiJIUzI1Ni...X92n0sK")}
                      </p>
                      <div
                        className={
                          "flex items-center gap-space-xs text-xs text-emerald-600 mt-2"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check_circle"}
                        </span>
                        {actions.text(
                          "\n                New Access Token issued seamlessly without UI disruption.\n              ",
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  id={"stage-3-view"}
                  className={
                    actions.visible("stage-3-view", false)
                      ? "stage-view w-full flex-col items-center justify-center text-center py-8 relative"
                      : "stage-view w-full flex-col items-center justify-center text-center py-8 relative hidden"
                  }
                >
                  <div
                    className={
                      "absolute inset-0 bg-on-surface/20 backdrop-blur-[2px] rounded-xl flex items-center justify-center p-4"
                    }
                  >
                    <div
                      className={
                        "bg-surface-container-lowest max-w-sm w-full p-6 rounded-xl shadow-xl text-left border border-outline-variant/30 animate-in fade-in zoom-in-95"
                      }
                    >
                      <div
                        className={
                          "w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center mb-4"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined"}
                        >
                          {"timer_off"}
                        </span>
                      </div>
                      <h4 className={"font-headline-sm text-on-surface mb-1"}>
                        {actions.text("Your session has expired")}
                      </h4>
                      <p
                        className={"text-body-sm text-on-surface-variant mb-4"}
                      >
                        {actions.text(
                          "\n                For your security, you have been logged out due to 30 minutes of inactivity. We saved your current workspace state.\n              ",
                        )}
                      </p>
                      <div
                        className={
                          "bg-surface-container-low p-2.5 rounded text-xs font-code-sm text-on-surface-variant mb-4"
                        }
                      >
                        <span className={"text-primary font-medium"}>
                          {actions.text("Restoration target:")}
                        </span>
                        {actions.text(
                          " /dashboard/endpoints/v2/analyze\n              ",
                        )}
                      </div>
                      <div className={"flex flex-col gap-space-xs"}>
                        <button
                          data-action-text={"Sign In Again"}
                          className={
                            "w-full py-2 bg-primary text-on-primary rounded font-medium text-body-sm hover:bg-primary-container transition-colors"
                          }
                          type="button"
                          aria-label={actions.text("Sign In Again")}
                          data-handler={
                            "alert('Redirecting to secure login with return_to parameter')"
                          }
                        >
                          {actions.text(
                            "\n                  Sign In Again\n                ",
                          )}
                        </button>
                        <button
                          data-action-text={"Go to Home"}
                          className={
                            "w-full py-2 bg-surface-container hover:bg-surface-variant text-on-surface rounded font-medium text-body-sm transition-colors"
                          }
                          type="button"
                          aria-label={actions.text("Go to Home")}
                          data-handler={"alert('Navigating to public home')"}
                        >
                          {actions.text(
                            "\n                  Go to Home\n                ",
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  id={"stage-4-view"}
                  className={
                    actions.visible("stage-4-view", false)
                      ? "stage-view w-full flex-col items-center justify-center text-center py-8"
                      : "stage-view w-full flex-col items-center justify-center text-center py-8 hidden"
                  }
                >
                  <div
                    className={
                      "max-w-md w-full bg-surface-container-lowest border border-error/20 p-6 rounded-xl shadow-sm"
                    }
                  >
                    <div
                      className={
                        "w-12 h-12 rounded-full bg-error-container text-error mx-auto flex items-center justify-center mb-3"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined"}
                      >
                        {"security_update_warning"}
                      </span>
                    </div>
                    <h4 className={"font-headline-md text-on-surface mb-1"}>
                      {actions.text("Security Revocation Detected")}
                    </h4>
                    <p className={"text-body-sm text-on-surface-variant mb-4"}>
                      {actions.text(
                        "\n              Your active token was revoked remotely from another device or administrative settings. No raw token identifiers are cached or exposed.\n            ",
                      )}
                    </p>
                    <div
                      className={
                        "bg-surface-container-low p-3 rounded mb-4 text-left"
                      }
                    >
                      <div
                        className={
                          "flex items-center justify-between text-xs font-code-sm text-on-surface-variant"
                        }
                      >
                        <span>{actions.text("Reason: REVOKED_BY_ADMIN")}</span>
                        <span>{actions.text("IP: 192.0.2.45")}</span>
                      </div>
                    </div>
                    <button
                      data-action-text={"Re-authenticate Now"}
                      className={
                        "px-4 py-2 bg-primary text-on-primary rounded text-body-sm font-medium hover:bg-primary-container"
                      }
                      type="button"
                      aria-label={actions.text("Re-authenticate Now")}
                      data-handler={
                        "alert('Initiating clean credential purge and re-authentication')"
                      }
                    >
                      {actions.text(
                        "\n              Re-authenticate Now\n            ",
                      )}
                    </button>
                  </div>
                </div>

                <div
                  id={"stage-5-view"}
                  className={
                    actions.visible("stage-5-view", false)
                      ? "stage-view w-full flex-col items-center justify-center text-center py-8 relative"
                      : "stage-view w-full flex-col items-center justify-center text-center py-8 relative hidden"
                  }
                >
                  <div
                    className={
                      "w-full max-w-sm bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 overflow-hidden text-left"
                    }
                  >
                    <div
                      className={
                        "p-3 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between"
                      }
                    >
                      <div className={"flex items-center gap-space-sm"}>
                        <div
                          className={
                            "w-8 h-8 rounded-full bg-primary text-on-primary font-medium flex items-center justify-center text-xs"
                          }
                        >
                          {actions.text("JD")}
                        </div>
                        <div>
                          <div
                            className={"text-xs font-medium text-on-surface"}
                          >
                            {actions.text("Jane Developer")}
                          </div>
                          <div
                            className={"text-[11px] text-on-surface-variant"}
                          >
                            {actions.text("jane@apihub.internal")}
                          </div>
                        </div>
                      </div>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-primary"}
                      >
                        {"expand_more"}
                      </span>
                    </div>

                    <div className={"p-1 space-y-0.5"}>
                      <button
                        data-action-text={"settings Workspace Settings"}
                        className={
                          "w-full px-3 py-2 text-left text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-space-sm rounded"
                        }
                        type="button"
                        aria-label={actions.text("Workspace Settings")}
                      >
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[16px] text-on-surface-variant"
                          }
                        >
                          {"settings"}
                        </span>
                        {actions.text(" Workspace Settings\n              ")}
                      </button>
                      <button
                        data-action-text={"api API Keys & Tokens"}
                        className={
                          "w-full px-3 py-2 text-left text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-space-sm rounded"
                        }
                        type="button"
                        aria-label={actions.text("API Keys & Tokens")}
                      >
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-[16px] text-on-surface-variant"
                          }
                        >
                          {"api"}
                        </span>
                        {actions.text(" API Keys & Tokens\n              ")}
                      </button>
                      <div
                        className={"h-[1px] bg-outline-variant/20 my-1"}
                      ></div>
                      <button
                        data-action-text={"logout Sign Out / Logout"}
                        className={
                          "w-full px-3 py-2 text-left text-body-sm text-error hover:bg-error-container/30 flex items-center gap-space-sm rounded"
                        }
                        type="button"
                        aria-label={actions.text("Sign Out / Logout")}
                        data-handler={"simulateLogout()"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"logout"}
                        </span>
                        {actions.text(" Sign Out / Logout\n              ")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  id={"stage-6-view"}
                  className={
                    actions.visible("stage-6-view", false)
                      ? "stage-view w-full flex-col items-center justify-center text-center py-8"
                      : "stage-view w-full flex-col items-center justify-center text-center py-8 hidden"
                  }
                >
                  <div
                    className={
                      "max-w-md w-full bg-surface-container-lowest p-6 rounded-xl shadow-sm"
                    }
                  >
                    <div
                      className={
                        "w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined"}
                      >
                        {"lock"}
                      </span>
                    </div>
                    <h4 className={"font-headline-md text-on-surface mb-1"}>
                      {actions.text("Protected Content Inaccessible")}
                    </h4>
                    <p className={"text-body-sm text-on-surface-variant mb-4"}>
                      {actions.text(
                        "\n              Session successfully terminated. Local storage purged, cookies cleared. Attempting to access protected endpoints returns 401 Unauthorized.\n            ",
                      )}
                    </p>
                    <div
                      className={
                        "flex items-center justify-center gap-space-sm"
                      }
                    >
                      <span
                        className={
                          "px-2.5 py-1 bg-surface-container font-code-sm text-xs rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("GET /api/v1/user → 401")}
                      </span>
                      <span
                        className={
                          "px-2.5 py-1 bg-surface-container font-code-sm text-xs rounded text-on-surface-variant"
                        }
                      >
                        {actions.text("JWT Cookie → Null")}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  id={"stage-7-view"}
                  className={
                    actions.visible("stage-7-view", false)
                      ? "stage-view w-full flex-col items-center justify-center text-center py-8"
                      : "stage-view w-full flex-col items-center justify-center text-center py-8 hidden"
                  }
                >
                  <div
                    className={
                      "max-w-md w-full bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl shadow-sm"
                    }
                  >
                    <div
                      className={
                        "w-12 h-12 rounded-full bg-surface-container text-on-surface-variant mx-auto flex items-center justify-center mb-3"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined"}
                      >
                        {"cloud_off"}
                      </span>
                    </div>
                    <h4 className={"font-headline-md text-on-surface mb-1"}>
                      {actions.text("Network Connection Lost")}
                    </h4>
                    <p className={"text-body-sm text-on-surface-variant mb-4"}>
                      {actions.text(
                        "\n              Unable to verify session state due to network timeout or offline status. Your current draft state is safely stored in memory.\n            ",
                      )}
                    </p>
                    <div
                      className={
                        "flex items-center justify-center gap-space-sm"
                      }
                    >
                      <button
                        data-action-text={"refresh Retry Now"}
                        className={
                          "px-4 py-2 bg-primary text-on-primary rounded text-body-sm font-medium flex items-center gap-space-xs hover:bg-primary-container"
                        }
                        type="button"
                        aria-label={actions.text("Retry Now")}
                        data-handler={"retryNetworkCheck()"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"refresh"}
                        </span>
                        {actions.text(" Retry Now\n              ")}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  id={"stage-8-view"}
                  className={
                    actions.visible("stage-8-view", false)
                      ? "stage-view w-full flex-col items-center justify-center text-center py-8"
                      : "stage-view w-full flex-col items-center justify-center text-center py-8 hidden"
                  }
                >
                  <div
                    className={
                      "max-w-md w-full bg-surface-container-lowest p-6 rounded-xl shadow-sm text-left border border-outline-variant/30"
                    }
                  >
                    <div className={"flex items-center justify-between mb-3"}>
                      <span
                        className={
                          "px-2 py-0.5 bg-error-container text-error font-code-sm rounded text-xs"
                        }
                      >
                        {actions.text("HTTP 401 Unauthorized")}
                      </span>
                      <span
                        className={
                          "font-code-sm text-xs text-on-surface-variant"
                        }
                      >
                        {actions.text("Endpoint: /v1/gateway/execute")}
                      </span>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant mb-3"}>
                      {actions.text(
                        "\n              The protected API request failed authentication mid-flight. The gateway attempted silent token refresh but fallback queue exhausted.\n            ",
                      )}
                    </p>
                    <div
                      className={
                        "bg-surface-container-low p-3 rounded font-code-sm text-xs text-on-surface mb-4"
                      }
                    >
                      {actions.text(
                        '\n              { "error": "token_expired", "retry_attempted": true, "code": 4012 }\n            ',
                      )}
                    </div>
                    <div className={"flex items-center gap-space-sm"}>
                      <button
                        data-action-text={"Sign In to Retry Request"}
                        className={
                          "flex-1 py-2 bg-primary text-on-primary text-center rounded text-body-sm font-medium hover:bg-primary-container"
                        }
                        type="button"
                        aria-label={actions.text("Sign In to Retry Request")}
                        data-handler={"alert('Re-authenticating user...')"}
                      >
                        {actions.text(
                          "\n                Sign In to Retry Request\n              ",
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "pt-space-md border-t border-outline-variant/20 flex items-center justify-between text-body-sm text-on-surface-variant"
                }
              >
                <div className={"flex items-center gap-space-xs"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[16px] text-primary"
                    }
                  >
                    {"info"}
                  </span>
                  <span
                    id={"stage-helper-text"}
                    className={
                      actions.visible("stage-helper-text", true)
                        ? ""
                        : " hidden"
                    }
                  >
                    {actions.text(
                      "Stage 1: Initializing background checks and security handshake.",
                    )}
                  </span>
                </div>
                <div className={"flex items-center gap-space-xs"}>
                  <button
                    data-action-text={"chevron_left"}
                    className={
                      "p-1.5 rounded bg-surface-container hover:bg-surface-variant text-on-surface transition-colors"
                    }
                    title={actions.text("Previous Stage")}
                    type="button"
                    aria-label={actions.text("Previous")}
                    data-handler={"prevStage()"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"chevron_left"}
                    </span>
                  </button>
                  <button
                    data-action-text={"chevron_right"}
                    className={
                      "p-1.5 rounded bg-surface-container hover:bg-surface-variant text-on-surface transition-colors"
                    }
                    title={actions.text("Next Stage")}
                    type="button"
                    aria-label={actions.text("Next")}
                    data-handler={"nextStage()"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"chevron_right"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className={"lg:col-span-4 flex flex-col gap-gutter"}>
              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-space-md shadow-sm"
                }
              >
                <h3
                  className={
                    "font-headline-sm text-on-surface mb-space-xs flex items-center gap-space-xs"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[18px]"
                    }
                  >
                    {"verified_user"}
                  </span>
                  {actions.text("\n          Security Architecture\n        ")}
                </h3>
                <p
                  className={"text-body-sm text-on-surface-variant mb-space-md"}
                >
                  {actions.text(
                    "\n          API HUB implements robust token lifecycles with zero-leakage token storage, sliding window renewals, and graceful degradation during network partitions.\n        ",
                  )}
                </p>
                <div className={"space-y-2 text-body-sm"}>
                  <div
                    className={
                      "flex items-center justify-between py-1 border-b border-outline-variant/20"
                    }
                  >
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Access Token TTL")}
                    </span>
                    <span className={"font-code-sm text-on-surface"}>
                      {actions.text("15 Minutes")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between py-1 border-b border-outline-variant/20"
                    }
                  >
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Refresh Strategy")}
                    </span>
                    <span className={"font-code-sm text-on-surface"}>
                      {actions.text("Silent Sliding Cookie")}
                    </span>
                  </div>
                  <div className={"flex items-center justify-between py-1"}>
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Revocation Protocol")}
                    </span>
                    <span className={"font-code-sm text-on-surface"}>
                      {actions.text("Immediate Webhook Sync")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex-1"
                }
              >
                <h3
                  className={
                    "font-headline-sm text-on-surface mb-space-xs flex items-center gap-space-xs"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[18px]"
                    }
                  >
                    {"tune"}
                  </span>
                  {actions.text("\n          Lifecycle Parameters\n        ")}
                </h3>
                <p
                  className={"text-body-sm text-on-surface-variant mb-space-md"}
                >
                  {actions.text(
                    "\n          Toggle simulation flags to test edge cases in real time.\n        ",
                  )}
                </p>
                <div className={"space-y-space-sm"}>
                  <label
                    className={
                      "flex items-center justify-between p-2 rounded bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
                    }
                  >
                    <div className={"text-body-sm text-on-surface font-medium"}>
                      {actions.text("Simulate Slow Network")}
                    </div>
                    <input
                      className={
                        "w-4 h-4 accent-primary rounded cursor-pointer"
                      }
                      id={"toggle-slow-net"}
                      type={"checkbox"}
                    />
                  </label>
                  <label
                    className={
                      "flex items-center justify-between p-2 rounded bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
                    }
                  >
                    <div className={"text-body-sm text-on-surface font-medium"}>
                      {actions.text("Auto-Refresh Tokens")}
                    </div>
                    <input
                      defaultChecked={true}
                      className={
                        "w-4 h-4 accent-primary rounded cursor-pointer"
                      }
                      id={"toggle-auto-refresh"}
                      type={"checkbox"}
                    />
                  </label>
                  <label
                    className={
                      "flex items-center justify-between p-2 rounded bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
                    }
                  >
                    <div className={"text-body-sm text-on-surface font-medium"}>
                      {actions.text("Strict Revocation Check")}
                    </div>
                    <input
                      className={
                        "w-4 h-4 accent-primary rounded cursor-pointer"
                      }
                      id={"toggle-strict-rev"}
                      type={"checkbox"}
                    />
                  </label>
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
