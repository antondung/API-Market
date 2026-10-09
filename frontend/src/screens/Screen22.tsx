import { useScreenActions } from "../features/screen-actions";
export default function Screen22() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full pb-16 space-y-12"}>
          <div
            className={
              "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-8 rounded-2xl"
            }
          >
            <div className={"flex items-center gap-6"}>
              <div className={"relative"}>
                <div
                  className={
                    "w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary text-headline-md shadow-md"
                  }
                >
                  {actions.text("\n          AV\n        ")}
                </div>
                <div
                  className={
                    "absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs shadow"
                  }
                  title={actions.text("Verified Provider")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px]"}
                  >
                    {"check"}
                  </span>
                </div>
              </div>
              <div>
                <div className={"flex items-center gap-3"}>
                  <h1
                    className={
                      "text-headline-lg font-headline-lg text-on-surface"
                    }
                  >
                    {actions.text("Alex Vance")}
                  </h1>
                  <span
                    className={
                      "px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-md"
                    }
                  >
                    {actions.text("Admin L4 Root")}
                  </span>
                </div>
                <p
                  className={
                    "text-body-md text-on-surface-variant font-code-md mt-1"
                  }
                >
                  {actions.text("alex.vance@apihub.dev • PRV-9082 Verified")}
                </p>
                <div className={"flex items-center gap-2 mt-3"}>
                  <span
                    className={
                      "px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-code-sm"
                    }
                  >
                    {actions.text("Workspace: ws_dev_8892a")}
                  </span>
                  <span
                    className={
                      "px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-code-sm"
                    }
                  >
                    {actions.text("Tier: Developer Free")}
                  </span>
                </div>
              </div>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"edit Edit Profile"}
                className={
                  "px-4 py-2 rounded-xl bg-primary text-on-primary text-body-md font-medium hover:bg-surface-tint transition-all shadow-sm flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Edit Profile")}
                data-handler={"triggerAction('Edit Profile')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"edit"}
                </span>
                {actions.text(" Edit Profile\n      ")}
              </button>
              <button
                data-action-text={"key Security"}
                className={
                  "px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-body-md font-medium hover:bg-surface-container-highest transition-all flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Security")}
                data-handler={"triggerAction('Change Password')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"key"}
                </span>
                {actions.text(" Security\n      ")}
              </button>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-8"}>
            <div className={"lg:col-span-2 space-y-8"}>
              <div
                className={
                  "bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <h2
                    className={
                      "text-headline-md font-headline-md text-on-surface"
                    }
                  >
                    {actions.text("Profile Information")}
                  </h2>
                  <span
                    className={"text-body-sm text-on-surface-variant"}
                    id={"form-status"}
                  >
                    {actions.text("Changes saved automatically")}
                  </span>
                </div>
                <form
                  className={"space-y-4"}
                  id={"profile-form"}
                  onSubmit={actions.submit}
                >
                  <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    <div>
                      <label
                        className={
                          "block text-body-sm font-medium text-on-surface mb-1"
                        }
                      >
                        {actions.text("Full Name")}
                      </label>
                      <input
                        className={
                          "w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
                        }
                        id={"fullname"}
                        required={true}
                        type={"text"}
                        defaultValue={"Alex Vance"}
                      />
                    </div>
                    <div>
                      <label
                        className={
                          "block text-body-sm font-medium text-on-surface mb-1"
                        }
                      >
                        {actions.text("Professional Title")}
                      </label>
                      <input
                        className={
                          "w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
                        }
                        id={"title"}
                        type={"text"}
                        defaultValue={"Principal API Architect"}
                      />
                    </div>
                  </div>
                  <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    <div>
                      <label
                        className={
                          "block text-body-sm font-medium text-on-surface mb-1"
                        }
                      >
                        {actions.text("Developer Email")}
                      </label>
                      <input
                        className={
                          "w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface font-code-md outline-none focus:ring-2 focus:ring-primary transition-all"
                        }
                        id={"email"}
                        required={true}
                        type={"email"}
                        defaultValue={"alex.vance@apihub.dev"}
                      />
                    </div>
                    <div>
                      <label
                        className={
                          "block text-body-sm font-medium text-on-surface mb-1"
                        }
                      >
                        {actions.text("Company / Organization")}
                      </label>
                      <input
                        className={
                          "w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
                        }
                        id={"company"}
                        type={"text"}
                        defaultValue={"Nexus Systems Inc."}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-medium text-on-surface mb-2"
                      }
                    >
                      {actions.text("Notification Preferences")}
                    </label>
                    <div className={"space-y-2"}>
                      <label
                        className={"flex items-center gap-3 cursor-pointer"}
                      >
                        <input
                          defaultChecked={true}
                          className={
                            "w-4 h-4 rounded text-primary focus:ring-primary"
                          }
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface-variant"}
                        >
                          {actions.text(
                            "API Quota Alerts (Triggered at 80% usage)",
                          )}
                        </span>
                      </label>
                      <label
                        className={"flex items-center gap-3 cursor-pointer"}
                      >
                        <input
                          defaultChecked={true}
                          className={
                            "w-4 h-4 rounded text-primary focus:ring-primary"
                          }
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface-variant"}
                        >
                          {actions.text("Security & Login Audit Notifications")}
                        </span>
                      </label>
                      <label
                        className={"flex items-center gap-3 cursor-pointer"}
                      >
                        <input
                          className={
                            "w-4 h-4 rounded text-primary focus:ring-primary"
                          }
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface-variant"}
                        >
                          {actions.text("Weekly Provider Performance Digest")}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={"flex items-center justify-end gap-3 pt-4"}>
                    <button
                      data-action-text={"Cancel"}
                      className={
                        "px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-body-md hover:bg-surface-container-highest transition-all"
                      }
                      type={"button"}
                      aria-label={actions.text("Cancel")}
                      data-handler={"resetForm()"}
                    >
                      {actions.text("Cancel")}
                    </button>
                    <button
                      data-action-text={"Save Changes"}
                      className={
                        "px-6 py-2 rounded-xl bg-primary text-on-primary text-body-md font-medium hover:bg-surface-tint transition-all shadow-sm flex items-center gap-2"
                      }
                      id={"save-btn"}
                      type={"submit"}
                      aria-label={actions.text("Save Changes")}
                    >
                      <span>{actions.text("Save Changes")}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6"
                }
              >
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Account & Workspace Summary")}
                </h2>
                <div className={"grid grid-cols-1 md:grid-cols-3 gap-4"}>
                  <div className={"p-4 rounded-xl bg-surface-container-low"}>
                    <span
                      className={
                        "text-label-md text-on-surface-variant uppercase"
                      }
                    >
                      {actions.text("Workspace ID")}
                    </span>
                    <p
                      className={
                        "text-body-md font-code-md text-on-surface mt-1"
                      }
                    >
                      {actions.text("ws_dev_8892a")}
                    </p>
                  </div>
                  <div className={"p-4 rounded-xl bg-surface-container-low"}>
                    <span
                      className={
                        "text-label-md text-on-surface-variant uppercase"
                      }
                    >
                      {actions.text("Created Date")}
                    </span>
                    <p
                      className={
                        "text-body-md font-medium text-on-surface mt-1"
                      }
                    >
                      {actions.text("Oct 14, 2023")}
                    </p>
                  </div>
                  <div className={"p-4 rounded-xl bg-surface-container-low"}>
                    <span
                      className={
                        "text-label-md text-on-surface-variant uppercase"
                      }
                    >
                      {actions.text("API Quota Status")}
                    </span>
                    <p
                      className={
                        "text-body-md font-medium text-emerald-700 mt-1"
                      }
                    >
                      {actions.text("Normal (14.2k / 50k)")}
                    </p>
                  </div>
                </div>
                <div
                  className={
                    "border-t border-outline-variant pt-6 flex items-center justify-between"
                  }
                >
                  <div>
                    <h3 className={"text-body-lg font-medium text-on-surface"}>
                      {actions.text("Active Workspace Switcher")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Currently managing resources inside Consumer & Provider contexts.",
                      )}
                    </p>
                  </div>
                  <select
                    className={
                      "bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-body-md text-on-surface font-medium outline-none cursor-pointer"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"Consumer Workspace (Primary)"}>
                      {actions.text("Consumer Workspace (Primary)")}
                    </option>
                    <option value={"Provider Workspace (Partner)"}>
                      {actions.text("Provider Workspace (Partner)")}
                    </option>
                    <option value={"Enterprise Sandbox"}>
                      {actions.text("Enterprise Sandbox")}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className={"space-y-8"}>
              <div
                className={
                  "bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6"
                }
              >
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Assigned Roles")}
                </h2>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Multi-role privileges configured for your identity across platform domains.",
                  )}
                </p>
                <div className={"space-y-3"}>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-primary"}
                      >
                        {"verified_user"}
                      </span>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Verified Consumer")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text("Standard API Request Access")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-md"
                      }
                    >
                      {actions.text("Active")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-emerald-700"}
                      >
                        {"api"}
                      </span>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Provider Partner")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text("Publish & Monetize Endpoints")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md"
                      }
                    >
                      {actions.text("Verified")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 rounded-xl bg-surface-container-low"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-purple-700"}
                      >
                        {"admin_panel_settings"}
                      </span>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Admin L4 Root")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text("Full Platform Governance")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-label-md"
                      }
                    >
                      {actions.text("Superuser")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-4"
                }
              >
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Topbar Dropdown Preview")}
                </h2>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Interactive simulation of the global navigation user menu.",
                  )}
                </p>
                <div
                  className={
                    "relative bg-surface-container-low p-4 rounded-xl border border-outline-variant"
                  }
                >
                  <div
                    className={
                      "w-full bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-2 space-y-1"
                    }
                  >
                    <div
                      className={
                        "px-3 py-2 border-b border-outline-variant mb-1"
                      }
                    >
                      <p className={"text-body-md font-medium text-on-surface"}>
                        {actions.text("Alex Vance")}
                      </p>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text("alex.vance@apihub.dev")}
                      </p>
                    </div>
                    <a
                      data-action-text={"person My Profile"}
                      className={
                        "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant text-body-md"
                      }
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"person"}
                      </span>
                      {actions.text(" My Profile\n            ")}
                    </a>
                    <a
                      data-action-text={"settings Account Settings"}
                      className={
                        "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant text-body-md"
                      }
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"settings"}
                      </span>
                      {actions.text(" Account Settings\n            ")}
                    </a>
                    <div
                      className={"border-t border-outline-variant my-1"}
                    ></div>
                    <a
                      data-action-text={"logout Logout"}
                      className={
                        "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-error-container text-on-error-container text-body-md"
                      }
                      href={"#"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[18px]"}
                      >
                        {"logout"}
                      </span>
                      {actions.text(" Logout\n            ")}
                    </a>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-4"
                }
              >
                <h2
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("Security & Sessions")}
                </h2>
                <div className={"space-y-3"}>
                  <div
                    className={"flex items-center justify-between text-body-md"}
                  >
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Two-Factor Authentication")}
                    </span>
                    <span
                      className={
                        "text-emerald-700 font-medium flex items-center gap-1"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"verified"}
                      </span>
                      {actions.text(" Enabled (TOTP)")}
                    </span>
                  </div>
                  <div
                    className={"flex items-center justify-between text-body-md"}
                  >
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Active Sessions")}
                    </span>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("3 devices connected")}
                    </span>
                  </div>
                  <div
                    className={"flex items-center justify-between text-body-md"}
                  >
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Password Last Changed")}
                    </span>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("42 days ago")}
                    </span>
                  </div>
                </div>
                <button
                  data-action-text={"Revoke All Other Sessions"}
                  className={
                    "w-full mt-2 py-2 rounded-xl bg-surface-container-high text-on-surface text-body-md font-medium hover:bg-surface-container-highest transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Revoke All Other Sessions")}
                  data-handler={"triggerAction('Revoke Sessions')"}
                >
                  {actions.text(
                    "\n          Revoke All Other Sessions\n        ",
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className={"space-y-6 pt-6"}>
            <div className={"flex items-center justify-between"}>
              <h2
                className={"text-headline-md font-headline-md text-on-surface"}
              >
                {actions.text("States & Error Handling Gallery")}
              </h2>
              <span className={"text-body-sm text-on-surface-variant"}>
                {actions.text("Sprint 1 Validation Artifacts")}
              </span>
            </div>
            <div
              className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}
            >
              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4"
                }
              >
                <span className={"text-label-md text-primary font-code-md"}>
                  {actions.text("01 / Loading Skeleton")}
                </span>
                <div className={"animate-pulse space-y-3"}>
                  <div className={"flex items-center gap-4"}>
                    <div
                      className={
                        "w-12 h-12 rounded-full bg-surface-container-high"
                      }
                    ></div>
                    <div className={"space-y-2 flex-1"}>
                      <div
                        className={
                          "h-4 bg-surface-container-high rounded w-3/4"
                        }
                      ></div>
                      <div
                        className={
                          "h-3 bg-surface-container-high rounded w-1/2"
                        }
                      ></div>
                    </div>
                  </div>
                  <div
                    className={"h-10 bg-surface-container-high rounded-xl"}
                  ></div>
                  <div
                    className={"h-10 bg-surface-container-high rounded-xl"}
                  ></div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4"
                }
              >
                <span className={"text-label-md text-error font-code-md"}>
                  {actions.text("02 / Fetch Failed")}
                </span>
                <div
                  className={
                    "p-4 rounded-xl bg-error-container text-on-error-container space-y-3"
                  }
                >
                  <div className={"flex items-center gap-2"}>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[20px]"}
                    >
                      {"error"}
                    </span>
                    <p className={"text-body-md font-medium"}>
                      {actions.text("Failed to load profile endpoint")}
                    </p>
                  </div>
                  <p className={"text-body-sm"}>
                    {actions.text(
                      "The upstream authorization server timed out while resolving identity token.",
                    )}
                  </p>
                  <button
                    data-action-text={"Retry Request"}
                    className={
                      "px-3 py-1.5 rounded-lg bg-surface text-on-surface text-body-sm font-medium hover:bg-surface-bright transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Retry Request")}
                    data-handler={"alert('Retrying fetch...')"}
                  >
                    {actions.text("\n            Retry Request\n          ")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4"
                }
              >
                <span className={"text-label-md text-error font-code-md"}>
                  {actions.text("03 / Inline Validation Error")}
                </span>
                <div className={"space-y-3"}>
                  <div>
                    <label
                      className={
                        "block text-body-sm font-medium text-on-surface mb-1"
                      }
                    >
                      {actions.text("Developer Email")}
                    </label>
                    <input
                      className={
                        "w-full bg-surface-container-low border border-error px-3 py-2 rounded-xl text-body-md text-on-surface font-code-md outline-none"
                      }
                      type={"text"}
                      defaultValue={"alex.vance@invalid"}
                      aria-label={actions.text("Input")}
                    />
                    <p className={"text-body-sm text-error mt-1"}>
                      {actions.text(
                        "Please enter a valid domain email address.",
                      )}
                    </p>
                  </div>
                  <button
                    data-action-text={"Save Changes"}
                    className={
                      "w-full py-2 rounded-xl bg-surface-container-high text-outline text-body-md font-medium cursor-not-allowed"
                    }
                    disabled={true}
                    type="button"
                    aria-label={actions.text("Save Changes")}
                  >
                    {actions.text("\n            Save Changes\n          ")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4"
                }
              >
                <span className={"text-label-md text-primary font-code-md"}>
                  {actions.text("04 / Missing Optional Info")}
                </span>
                <div
                  className={
                    "p-4 rounded-xl bg-surface-container-low border border-dashed border-outline-variant text-center space-y-2"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[32px] text-on-surface-variant"
                    }
                  >
                    {"add_a_photo"}
                  </span>
                  <p className={"text-body-md font-medium text-on-surface"}>
                    {actions.text("No Provider Bio Added")}
                  </p>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Provide a short description for your public API developer profile.",
                    )}
                  </p>
                  <button
                    data-action-text={"Add Bio"}
                    className={
                      "px-3 py-1.5 rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-surface-tint"
                    }
                    type="button"
                    aria-label={actions.text("Add Bio")}
                  >
                    {actions.text("Add Bio")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4"
                }
              >
                <span className={"text-label-md text-error font-code-md"}>
                  {actions.text("05 / Unauthorized (403)")}
                </span>
                <div
                  className={
                    "p-4 rounded-xl bg-surface-container-low text-center space-y-3"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[40px] text-error"
                    }
                  >
                    {"lock"}
                  </span>
                  <p className={"text-body-lg font-medium text-on-surface"}>
                    {actions.text("Access Restricted")}
                  </p>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Your current role (Consumer) does not permit access to Admin L4 audit parameters.",
                    )}
                  </p>
                  <span
                    className={
                      "inline-block px-3 py-1 rounded bg-error-container text-on-error-container text-code-sm"
                    }
                  >
                    {actions.text("Error Code: 403_FORBIDDEN")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4"
                }
              >
                <span className={"text-label-md text-emerald-700 font-code-md"}>
                  {actions.text("06 / Success Notification")}
                </span>
                <div
                  className={
                    "p-4 rounded-xl bg-emerald-100 text-emerald-900 space-y-2"
                  }
                >
                  <div className={"flex items-center gap-2"}>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[20px]"}
                    >
                      {"check_circle"}
                    </span>
                    <p className={"text-body-md font-medium"}>
                      {actions.text("Profile Updated Successfully")}
                    </p>
                  </div>
                  <p className={"text-body-sm"}>
                    {actions.text(
                      "All changes have been synced across active workspace sessions and token caches.",
                    )}
                  </p>
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
