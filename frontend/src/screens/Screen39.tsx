import { useScreenActions } from "../features/screen-actions";
export default function Screen39() {
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
              "flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
            }
          >
            <div>
              <div className={"flex items-center gap-2 mb-1"}>
                <span
                  className={
                    "text-xs uppercase tracking-wider font-label-md text-primary bg-primary-fixed px-2.5 py-1 rounded-full"
                  }
                >
                  {actions.text("User Settings")}
                </span>
                <span
                  className={"text-xs font-code-md text-on-surface-variant"}
                >
                  {actions.text("ID: usr_89f2a09b3c")}
                </span>
              </div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("Account & Profile")}
              </h1>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Manage your developer credentials, security preferences, and global workspace access.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"save Save Changes"}
                className={
                  "px-4 py-2 bg-primary-container text-on-primary-container font-label-md rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                }
                type="button"
                aria-label={actions.text("Save Changes")}
                data-handler={"showToast('Settings saved successfully')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"save"}
                </span>
                {actions.text("\n        Save Changes\n      ")}
              </button>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>
            <div
              className={
                "lg:col-span-3 flex flex-col gap-1 bg-surface-container-low p-2 rounded-2xl shadow-sm"
              }
            >
              <button
                data-action-text={"person Personal Profile"}
                className={
                  "tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-medium text-on-surface bg-primary-container text-on-primary-container transition-all cursor-pointer"
                }
                id={"nav-profile"}
                type="button"
                aria-label={actions.text("Personal Profile")}
                data-handler={"switchTab('profile')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"person"}
                </span>
                {actions.text("\n        Personal Profile\n      ")}
              </button>
              <button
                data-action-text={"security Security & 2FA"}
                className={
                  "tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
                }
                id={"nav-security"}
                type="button"
                aria-label={actions.text("Security & 2FA")}
                data-handler={"switchTab('security')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"security"}
                </span>
                {actions.text("\n        Security & 2FA\n      ")}
              </button>
              <button
                data-action-text={"admin_panel_settings Roles & Workspaces"}
                className={
                  "tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
                }
                id={"nav-roles"}
                type="button"
                aria-label={actions.text("Roles & Workspaces")}
                data-handler={"switchTab('roles')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"admin_panel_settings"}
                </span>
                {actions.text("\n        Roles & Workspaces\n      ")}
              </button>
              <button
                data-action-text={"notifications Notifications"}
                className={
                  "tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
                }
                id={"nav-notifications"}
                type="button"
                aria-label={actions.text("Notifications")}
                data-handler={"switchTab('notifications')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"notifications"}
                </span>
                {actions.text("\n        Notifications\n      ")}
              </button>
              <button
                data-action-text={"palette Appearance"}
                className={
                  "tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
                }
                id={"nav-appearance"}
                type="button"
                aria-label={actions.text("Appearance")}
                data-handler={"switchTab('appearance')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"palette"}
                </span>
                {actions.text("\n        Appearance\n      ")}
              </button>
              <button
                data-action-text={"history Activity History"}
                className={
                  "tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-medium text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
                }
                id={"nav-activity"}
                type="button"
                aria-label={actions.text("Activity History")}
                data-handler={"switchTab('activity')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"history"}
                </span>
                {actions.text("\n        Activity History\n      ")}
              </button>
              <button
                data-action-text={"warning Danger Zone"}
                className={
                  "tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-medium text-error hover:bg-error-container/30 transition-all cursor-pointer mt-4"
                }
                id={"nav-danger"}
                type="button"
                aria-label={actions.text("Danger Zone")}
                data-handler={"switchTab('danger')"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"warning"}
                </span>
                {actions.text("\n        Danger Zone\n      ")}
              </button>
            </div>

            <div className={"lg:col-span-9 flex flex-col gap-6"}>
              <div
                id={"tab-profile"}
                className={
                  actions.visible("tab-profile", true)
                    ? "tab-content flex flex-col gap-6"
                    : "tab-content flex flex-col gap-6 hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-6"
                  }
                >
                  <div className={"relative group"}>
                    <div
                      className={
                        "w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden"
                      }
                    >
                      <img
                        className={"w-full h-full object-cover"}
                        data-alt={
                          "A professional headshot avatar of an engineer with dark hair, friendly expression, subtle neutral background lighting, corporate tech aesthetic."
                        }
                        src={
                          "https://lh3.googleusercontent.com/aida-public/AB6AXuAjajEnxXarBJeKp9YuqfO9F-nR_ARRMyOY_Y7S3Sp6LcqcaNiLATc4BB9lmIy1qnYd8lZZTvZBG1OcsiwuLVMcFa3wZXY-7eEbxpWJui8v2RQJob1hgarkABnzbNrAWy0akfkXgsn7CTJIMdkWxxdNe1Wwu8qyJAhqoDweJpY12zORcgTVDs5uDXCSmra_OfJdPTPQeh1mo5Z45W0eprPtiQz78Jpkfl5KZTFKXFPM"
                        }
                        alt=""
                      />
                    </div>
                    <button
                      data-action-text={"photo_camera"}
                      className={
                        "absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
                      }
                      type="button"
                      aria-label={actions.text("photo_camera")}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"photo_camera"}
                      </span>
                    </button>
                  </div>
                  <div className={"flex-1 text-center md:text-left"}>
                    <h2
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Alex Mercer")}
                    </h2>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "@alex_mercer • Lead Integration Architect",
                      )}
                    </p>
                    <div
                      className={
                        "flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3"
                      }
                    >
                      <span
                        className={
                          "bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-md text-label-md"
                        }
                      >
                        {actions.text("Verified Developer")}
                      </span>
                      <span
                        className={
                          "bg-surface-container text-on-surface px-2.5 py-0.5 rounded-md text-label-md"
                        }
                      >
                        {actions.text("San Francisco, CA")}
                      </span>
                    </div>
                  </div>
                  <button
                    data-action-text={"Remove Photo"}
                    className={
                      "px-4 py-2 bg-surface-container-high text-on-surface font-label-md rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer"
                    }
                    type="button"
                    aria-label={actions.text("Remove Photo")}
                  >
                    {actions.text("\n            Remove Photo\n          ")}
                  </button>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-5"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Personal Information")}
                  </h3>
                  <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    <div className={"flex flex-col gap-1.5"}>
                      <label
                        className={
                          "text-label-md font-medium text-on-surface-variant"
                        }
                      >
                        {actions.text("Display Name")}
                      </label>
                      <input
                        className={
                          "bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                        }
                        type={"text"}
                        defaultValue={"Alex Mercer"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                    <div className={"flex flex-col gap-1.5"}>
                      <label
                        className={
                          "text-label-md font-medium text-on-surface-variant"
                        }
                      >
                        {actions.text("Username / Handle")}
                      </label>
                      <input
                        className={
                          "bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary font-code-md"
                        }
                        type={"text"}
                        defaultValue={"alex_mercer"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                  </div>
                  <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    <div className={"flex flex-col gap-1.5"}>
                      <label
                        className={
                          "text-label-md font-medium text-on-surface-variant"
                        }
                      >
                        {actions.text("Primary Email")}
                      </label>
                      <input
                        className={
                          "bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                        }
                        type={"email"}
                        defaultValue={"alex.mercer@enterprise.io"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                    <div className={"flex flex-col gap-1.5"}>
                      <label
                        className={
                          "text-label-md font-medium text-on-surface-variant"
                        }
                      >
                        {actions.text("Account ID (Read-only)")}
                      </label>
                      <input
                        className={
                          "bg-surface-container-low border border-outline-variant/50 rounded-xl px-3.5 py-2 text-code-md text-on-surface-variant select-all cursor-default"
                        }
                        readOnly={true}
                        type={"text"}
                        defaultValue={"usr_89f2a09b3c"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                  </div>
                  <div className={"flex flex-col gap-1.5"}>
                    <label
                      className={
                        "text-label-md font-medium text-on-surface-variant"
                      }
                    >
                      {actions.text("Bio")}
                    </label>
                    <textarea
                      className={
                        "bg-surface border border-outline-variant rounded-xl p-3.5 text-body-md text-on-surface focus:outline-none focus:border-primary resize-none"
                      }
                      rows={3}
                      aria-label={actions.text("Input")}
                      defaultValue={
                        "Building high-throughput gateway integrations and microservices. Fan of robust developer tooling and clean API contracts."
                      }
                    ></textarea>
                  </div>
                  <div className={"flex justify-end pt-2"}>
                    <button
                      data-action-text={"Save Profile"}
                      className={
                        "px-5 py-2.5 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-90 transition-all cursor-pointer"
                      }
                      type="button"
                      aria-label={actions.text("Save Profile")}
                      data-handler={"showToast('Profile updated successfully')"}
                    >
                      {actions.text(
                        "\n              Save Profile\n            ",
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                id={"tab-security"}
                className={
                  actions.visible("tab-security", false)
                    ? "tab-content flex flex-col gap-6"
                    : "tab-content flex flex-col gap-6 hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-5"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Change Password")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Ensure your account is using a long, random password to stay secure.",
                        )}
                      </p>
                    </div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[28px]"
                      }
                    >
                      {"lock_reset"}
                    </span>
                  </div>
                  <div className={"flex flex-col gap-4"}>
                    <div className={"flex flex-col gap-1.5"}>
                      <label
                        className={
                          "text-label-md font-medium text-on-surface-variant"
                        }
                      >
                        {actions.text("Current Password")}
                      </label>
                      <input
                        data-source-placeholder={"••••••••••••"}
                        className={
                          "bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                        }
                        placeholder={actions.text("••••••••••••")}
                        type={"password"}
                        aria-label={actions.text(
                          "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                        )}
                      />
                    </div>
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-4"}>
                      <div className={"flex flex-col gap-1.5"}>
                        <label
                          className={
                            "text-label-md font-medium text-on-surface-variant"
                          }
                        >
                          {actions.text("New Password")}
                        </label>
                        <input
                          data-source-placeholder={"••••••••••••"}
                          className={
                            "bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                          }
                          id={"new-pwd"}
                          placeholder={actions.text("••••••••••••")}
                          type={"password"}
                        />
                      </div>
                      <div className={"flex flex-col gap-1.5"}>
                        <label
                          className={
                            "text-label-md font-medium text-on-surface-variant"
                          }
                        >
                          {actions.text("Confirm New Password")}
                        </label>
                        <input
                          data-source-placeholder={"••••••••••••"}
                          className={
                            "bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                          }
                          placeholder={actions.text("••••••••••••")}
                          type={"password"}
                          aria-label={actions.text(
                            "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                          )}
                        />
                      </div>
                    </div>

                    <div className={"flex flex-col gap-1.5"}>
                      <div className={"flex justify-between text-label-md"}>
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Password Strength:")}
                        </span>
                        <span
                          className={"text-primary font-medium"}
                          id={"pwd-strength-text"}
                        >
                          {actions.text("Strong")}
                        </span>
                      </div>
                      <div
                        className={
                          "w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"
                        }
                      >
                        <div
                          className={
                            "w-3/4 h-full bg-primary transition-all duration-300"
                          }
                          id={"pwd-strength-bar"}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className={"flex justify-end pt-2"}>
                    <button
                      data-action-text={"Update Password"}
                      className={
                        "px-5 py-2.5 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-90 transition-all cursor-pointer"
                      }
                      type="button"
                      aria-label={actions.text("Update Password")}
                      data-handler={
                        "showToast('Password updated successfully')"
                      }
                    >
                      {actions.text(
                        "\n              Update Password\n            ",
                      )}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex items-center justify-between"
                  }
                >
                  <div className={"flex items-start gap-4"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary-fixed-dim shrink-0 mt-0.5"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"verified_user"}
                      </span>
                    </div>
                    <div>
                      <h4
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Two-Factor Authentication (2FA)")}
                      </h4>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant mt-0.5"
                        }
                      >
                        {actions.text(
                          "Secure your account with TOTP authenticator apps like 1Password or Google Authenticator.",
                        )}
                      </p>
                    </div>
                  </div>
                  <label
                    className={
                      "relative inline-flex items-center cursor-pointer"
                    }
                  >
                    <input
                      defaultChecked={true}
                      className={"sr-only peer"}
                      type={"checkbox"}
                      aria-label={actions.text("Input")}
                    />
                    <div
                      className={
                        "w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                      }
                    ></div>
                  </label>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Active Sessions")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Manage devices currently authenticated with your API HUB account.",
                        )}
                      </p>
                    </div>
                    <button
                      data-action-text={"Revoke All Others"}
                      className={
                        "text-xs text-error font-medium hover:underline cursor-pointer"
                      }
                      type="button"
                      aria-label={actions.text("Revoke All Others")}
                      data-handler={"showToast('All other sessions revoked')"}
                    >
                      {actions.text("Revoke All Others")}
                    </button>
                  </div>
                  <div
                    className={
                      "flex flex-col divide-y divide-outline-variant/20"
                    }
                  >
                    <div className={"py-3.5 flex items-center justify-between"}>
                      <div className={"flex items-center gap-3"}>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary text-[22px]"
                          }
                        >
                          {"laptop_mac"}
                        </span>
                        <div>
                          <p
                            className={
                              "text-body-md font-medium text-on-surface"
                            }
                          >
                            {actions.text(
                              "Chrome on macOS • San Francisco, US",
                            )}
                          </p>
                          <p
                            className={
                              "text-body-sm text-on-surface-variant font-code-md"
                            }
                          >
                            {actions.text("IP: 192.0.2.45 • Active now")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={
                          "bg-secondary-fixed text-on-secondary-fixed px-2.5 py-1 rounded-full text-label-md"
                        }
                      >
                        {actions.text("Current")}
                      </span>
                    </div>
                    <div className={"py-3.5 flex items-center justify-between"}>
                      <div className={"flex items-center gap-3"}>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-on-surface-variant text-[22px]"
                          }
                        >
                          {"phone_iphone"}
                        </span>
                        <div>
                          <p
                            className={
                              "text-body-md font-medium text-on-surface"
                            }
                          >
                            {actions.text("API HUB Mobile App • iOS 17")}
                          </p>
                          <p
                            className={
                              "text-body-sm text-on-surface-variant font-code-md"
                            }
                          >
                            {actions.text("IP: 192.0.2.88 • 2 hours ago")}
                          </p>
                        </div>
                      </div>
                      <button
                        data-action-text={"Revoke"}
                        className={
                          "text-xs text-on-surface-variant hover:text-error transition-all cursor-pointer"
                        }
                        type="button"
                        aria-label={actions.text("Revoke")}
                        data-handler={"showToast('Session revoked')"}
                      >
                        {actions.text("Revoke")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                id={"tab-roles"}
                className={
                  actions.visible("tab-roles", false)
                    ? "tab-content flex flex-col gap-6"
                    : "tab-content flex flex-col gap-6 hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Workspace Permissions")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Your assigned clearance levels across multi-tenant API organizations.",
                        )}
                      </p>
                    </div>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[28px]"
                      }
                    >
                      {"corporate_fare"}
                    </span>
                  </div>
                  <div className={"grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"}>
                    <div
                      className={
                        "bg-surface-container-low p-4 rounded-xl flex flex-col justify-between gap-3"
                      }
                    >
                      <div>
                        <div
                          className={"flex justify-between items-center mb-1"}
                        >
                          <span
                            className={
                              "text-label-md font-medium uppercase tracking-wider text-primary"
                            }
                          >
                            {actions.text("Consumer Workspace")}
                          </span>
                          <span
                            className={"w-2 h-2 rounded-full bg-primary"}
                          ></span>
                        </div>
                        <h4 className={"text-headline-sm text-on-surface"}>
                          {actions.text("Consumer Tier")}
                        </h4>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text(
                            "Access to SDKs, sandbox endpoints, and personal API keys.",
                          )}
                        </p>
                      </div>
                      <div
                        className={
                          "pt-2 border-t border-outline-variant/20 flex justify-between items-center text-body-sm"
                        }
                      >
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Role:")}
                        </span>
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("Standard Consumer")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={
                        "bg-surface-container-low p-4 rounded-xl flex flex-col justify-between gap-3"
                      }
                    >
                      <div>
                        <div
                          className={"flex justify-between items-center mb-1"}
                        >
                          <span
                            className={
                              "text-label-md font-medium uppercase tracking-wider text-secondary"
                            }
                          >
                            {actions.text("Provider Workspace")}
                          </span>
                          <span
                            className={"w-2 h-2 rounded-full bg-secondary"}
                          ></span>
                        </div>
                        <h4 className={"text-headline-sm text-on-surface"}>
                          {actions.text("Provider Tier")}
                        </h4>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text(
                            "Publish endpoints, configure webhooks, view analytics monetization.",
                          )}
                        </p>
                      </div>
                      <div
                        className={
                          "pt-2 border-t border-outline-variant/20 flex justify-between items-center text-body-sm"
                        }
                      >
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Role:")}
                        </span>
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("Lead Maintainer")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={
                        "bg-surface-container-low p-4 rounded-xl flex flex-col justify-between gap-3"
                      }
                    >
                      <div>
                        <div
                          className={"flex justify-between items-center mb-1"}
                        >
                          <span
                            className={
                              "text-label-md font-medium uppercase tracking-wider text-tertiary"
                            }
                          >
                            {actions.text("Admin Portal")}
                          </span>
                          <span
                            className={"w-2 h-2 rounded-full bg-tertiary"}
                          ></span>
                        </div>
                        <h4 className={"text-headline-sm text-on-surface"}>
                          {actions.text("Global Admin")}
                        </h4>
                        <p
                          className={
                            "text-body-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text(
                            "Audit logs, user provisioning, rate limits, and compliance settings.",
                          )}
                        </p>
                      </div>
                      <div
                        className={
                          "pt-2 border-t border-outline-variant/20 flex justify-between items-center text-body-sm"
                        }
                      >
                        <span className={"text-on-surface-variant"}>
                          {actions.text("Role:")}
                        </span>
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("Workspace Admin")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                id={"tab-notifications"}
                className={
                  actions.visible("tab-notifications", false)
                    ? "tab-content flex flex-col gap-6"
                    : "tab-content flex flex-col gap-6 hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-6"
                  }
                >
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Alert & Notification Channels")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Choose how and when you want to receive critical API infrastructure alerts.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "flex flex-col divide-y divide-outline-variant/20"
                    }
                  >
                    <div className={"py-4 flex items-center justify-between"}>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Quota Warnings (85% Threshold)")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Receive an instant alert when any API key reaches 85% of monthly quota.",
                          )}
                        </p>
                      </div>
                      <input
                        defaultChecked={true}
                        className={"w-5 h-5 accent-primary cursor-pointer"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                    <div className={"py-4 flex items-center justify-between"}>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Subscription Renewals & Invoicing")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Get notified for monthly billing cycles and plan upgrades.",
                          )}
                        </p>
                      </div>
                      <input
                        defaultChecked={true}
                        className={"w-5 h-5 accent-primary cursor-pointer"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                    <div className={"py-4 flex items-center justify-between"}>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("New API Review Comments")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Alert when consumer developers leave feedback on published APIs.",
                          )}
                        </p>
                      </div>
                      <input
                        className={"w-5 h-5 accent-primary cursor-pointer"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                    <div className={"py-4 flex items-center justify-between"}>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Security & Anomaly Alerts")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Immediate dispatch upon unusual IP access or multi-device login attempts.",
                          )}
                        </p>
                      </div>
                      <input
                        defaultChecked={true}
                        className={"w-5 h-5 accent-primary cursor-pointer"}
                        type={"checkbox"}
                        aria-label={actions.text("Input")}
                      />
                    </div>
                  </div>
                  <div className={"flex justify-end pt-2"}>
                    <button
                      data-action-text={"Save Preferences"}
                      className={
                        "px-5 py-2.5 bg-primary text-on-primary font-label-md rounded-xl hover:opacity-90 transition-all cursor-pointer"
                      }
                      type="button"
                      aria-label={actions.text("Save Preferences")}
                      data-handler={
                        "showToast('Notification settings updated')"
                      }
                    >
                      {actions.text(
                        "\n              Save Preferences\n            ",
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                id={"tab-appearance"}
                className={
                  actions.visible("tab-appearance", false)
                    ? "tab-content flex flex-col gap-6"
                    : "tab-content flex flex-col gap-6 hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-6"
                  }
                >
                  <div>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Theme & Interface Density")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Customize your visual developer workspace and table ergonomics.",
                      )}
                    </p>
                  </div>
                  <div className={"grid grid-cols-1 md:grid-cols-3 gap-4"}>
                    <div
                      className={
                        "border-2 border-primary bg-primary-fixed/20 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[28px] text-primary"
                        }
                      >
                        {"light_mode"}
                      </span>
                      <span
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Light Mode")}
                      </span>
                      <span className={"text-xs text-on-surface-variant"}>
                        {actions.text("Active")}
                      </span>
                    </div>
                    <div
                      className={
                        "border border-outline-variant/40 bg-surface p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:border-primary"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[28px] text-on-surface-variant"
                        }
                      >
                        {"dark_mode"}
                      </span>
                      <span
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Dark Mode")}
                      </span>
                      <span className={"text-xs text-on-surface-variant"}>
                        {actions.text("Available")}
                      </span>
                    </div>
                    <div
                      className={
                        "border border-outline-variant/40 bg-surface p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:border-primary"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[28px] text-on-surface-variant"
                        }
                      >
                        {"brightness_auto"}
                      </span>
                      <span
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("System Default")}
                      </span>
                      <span className={"text-xs text-on-surface-variant"}>
                        {actions.text("Auto sync")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "flex flex-col gap-2 pt-2 border-t border-outline-variant/20"
                    }
                  >
                    <label
                      className={
                        "text-label-md font-medium text-on-surface-variant"
                      }
                    >
                      {actions.text("Table Density")}
                    </label>
                    <div className={"flex gap-4"}>
                      <label
                        className={
                          "flex items-center gap-2 cursor-pointer text-body-md text-on-surface"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"accent-primary"}
                          name={"density"}
                          type={"radio"}
                          aria-label={actions.text("density")}
                        />
                        {actions.text(" Comfortable\n              ")}
                      </label>
                      <label
                        className={
                          "flex items-center gap-2 cursor-pointer text-body-md text-on-surface"
                        }
                      >
                        <input
                          className={"accent-primary"}
                          name={"density"}
                          type={"radio"}
                          aria-label={actions.text("density")}
                        />
                        {actions.text(
                          " Compact (High Density)\n              ",
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div
                id={"tab-activity"}
                className={
                  actions.visible("tab-activity", false)
                    ? "tab-content flex flex-col gap-6"
                    : "tab-content flex flex-col gap-6 hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Security & Account Log")}
                      </h3>
                      <p className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Recent audit events associated with user credentials.",
                        )}
                      </p>
                    </div>
                    <button
                      data-action-text={"download Export CSV"}
                      className={
                        "px-3 py-1.5 bg-surface-container-high text-on-surface font-label-md rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer flex items-center gap-1.5"
                      }
                      type="button"
                      aria-label={actions.text("Export CSV")}
                      data-handler={"showToast('Exporting logs...')"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"download"}
                      </span>
                      {actions.text(" Export CSV\n            ")}
                    </button>
                  </div>
                  <div className={"overflow-x-auto mt-2"}>
                    <table className={"w-full text-left border-collapse"}>
                      <thead>
                        <tr
                          className={
                            "border-b border-outline-variant/30 text-label-md text-on-surface-variant"
                          }
                        >
                          <th className={"py-3 px-3 font-medium"}>
                            {actions.text("Event Type")}
                          </th>
                          <th className={"py-3 px-3 font-medium"}>
                            {actions.text("IP Address")}
                          </th>
                          <th className={"py-3 px-3 font-medium"}>
                            {actions.text("Timestamp")}
                          </th>
                          <th className={"py-3 px-3 font-medium"}>
                            {actions.text("Status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={
                          "text-body-sm divide-y divide-outline-variant/10"
                        }
                      >
                        <tr
                          data-record="row-0"
                          hidden={
                            !actions.matches(
                              "login Login from Chrome (macOS) 192.0.2.45 Today, 09:42 UTC Success",
                            )
                          }
                        >
                          <td
                            className={
                              "py-3.5 px-3 font-medium text-on-surface flex items-center gap-2"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[16px] text-primary"
                              }
                            >
                              {"login"}
                            </span>
                            {actions.text(
                              " Login from Chrome (macOS)\n                  ",
                            )}
                          </td>
                          <td
                            className={
                              "py-3.5 px-3 font-code-md text-on-surface-variant"
                            }
                          >
                            {actions.text("192.0.2.45")}
                          </td>
                          <td className={"py-3.5 px-3 text-on-surface-variant"}>
                            {actions.text("Today, 09:42 UTC")}
                          </td>
                          <td className={"py-3.5 px-3"}>
                            <span
                              className={
                                "bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-label-md"
                              }
                            >
                              {actions.text("Success")}
                            </span>
                          </td>
                        </tr>
                        <tr
                          data-record="row-1"
                          hidden={
                            !actions.matches(
                              "key API Key Generated (prod_gateway) 192.0.2.45 Yesterday, 14:10 UTC Success",
                            )
                          }
                        >
                          <td
                            className={
                              "py-3.5 px-3 font-medium text-on-surface flex items-center gap-2"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[16px] text-primary"
                              }
                            >
                              {"key"}
                            </span>
                            {actions.text(
                              " API Key Generated (prod_gateway)\n                  ",
                            )}
                          </td>
                          <td
                            className={
                              "py-3.5 px-3 font-code-md text-on-surface-variant"
                            }
                          >
                            {actions.text("192.0.2.45")}
                          </td>
                          <td className={"py-3.5 px-3 text-on-surface-variant"}>
                            {actions.text("Yesterday, 14:10 UTC")}
                          </td>
                          <td className={"py-3.5 px-3"}>
                            <span
                              className={
                                "bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-label-md"
                              }
                            >
                              {actions.text("Success")}
                            </span>
                          </td>
                        </tr>
                        <tr
                          data-record="row-2"
                          hidden={
                            !actions.matches(
                              "lock_reset Password Changed 192.0.2.12 Oct 12, 2023 Success",
                            )
                          }
                        >
                          <td
                            className={
                              "py-3.5 px-3 font-medium text-on-surface flex items-center gap-2"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[16px] text-error"
                              }
                            >
                              {"lock_reset"}
                            </span>
                            {actions.text(
                              " Password Changed\n                  ",
                            )}
                          </td>
                          <td
                            className={
                              "py-3.5 px-3 font-code-md text-on-surface-variant"
                            }
                          >
                            {actions.text("192.0.2.12")}
                          </td>
                          <td className={"py-3.5 px-3 text-on-surface-variant"}>
                            {actions.text("Oct 12, 2023")}
                          </td>
                          <td className={"py-3.5 px-3"}>
                            <span
                              className={
                                "bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-label-md"
                              }
                            >
                              {actions.text("Success")}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div
                id={"tab-danger"}
                className={
                  actions.visible("tab-danger", false)
                    ? "tab-content flex flex-col gap-6"
                    : "tab-content flex flex-col gap-6 hidden"
                }
              >
                <div
                  className={
                    "bg-error-container/20 border border-error/30 p-6 rounded-2xl shadow-sm flex flex-col gap-6"
                  }
                >
                  <div>
                    <h3
                      className={"text-headline-sm font-headline-sm text-error"}
                    >
                      {actions.text("Danger Zone")}
                    </h3>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Destructive or sensitive actions regarding your API HUB profile and data.",
                      )}
                    </p>
                  </div>
                  <div className={"flex flex-col divide-y divide-error/20"}>
                    <div className={"py-4 flex items-center justify-between"}>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Sign out from all devices")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Immediately invalidate sessions across all browsers and apps.",
                          )}
                        </p>
                      </div>
                      <button
                        data-action-text={"Sign Out All"}
                        className={
                          "px-4 py-2 bg-surface border border-outline-variant text-on-surface font-label-md rounded-xl hover:bg-surface-container-high transition-all cursor-pointer"
                        }
                        type="button"
                        aria-label={actions.text("Sign Out All")}
                        data-handler={"showToast('Signed out everywhere')"}
                      >
                        {actions.text(
                          "\n                Sign Out All\n              ",
                        )}
                      </button>
                    </div>
                    <div className={"py-4 flex items-center justify-between"}>
                      <div>
                        <p
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Request Account Data Export")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Download a JSON archive of your personal metadata and audit records.",
                          )}
                        </p>
                      </div>
                      <button
                        data-action-text={"Export Data"}
                        className={
                          "px-4 py-2 bg-surface border border-outline-variant text-on-surface font-label-md rounded-xl hover:bg-surface-container-high transition-all cursor-pointer"
                        }
                        type="button"
                        aria-label={actions.text("Export Data")}
                        data-handler={
                          "showToast('Export queued. Check email shortly.')"
                        }
                      >
                        {actions.text(
                          "\n                Export Data\n              ",
                        )}
                      </button>
                    </div>
                    <div className={"py-4 flex items-center justify-between"}>
                      <div>
                        <p className={"text-body-md font-medium text-error"}>
                          {actions.text("Delete Account")}
                        </p>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "Permanently remove your account, API endpoints, and workspace keys.",
                          )}
                        </p>
                      </div>
                      <button
                        data-action-text={"Delete Account..."}
                        className={
                          "px-4 py-2 bg-error text-on-error font-label-md rounded-xl hover:opacity-90 transition-all cursor-pointer"
                        }
                        type="button"
                        aria-label={actions.text("Delete Account...")}
                        data-handler={"openDeleteModal()"}
                      >
                        {actions.text(
                          "\n                Delete Account...\n              ",
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 translate-y-20 opacity-0 transition-all duration-300 pointer-events-none"
            }
            id={"toast"}
          >
            <span
              aria-hidden={true}
              className={
                "material-symbols-outlined text-primary-fixed text-[20px]"
              }
            >
              {"check_circle"}
            </span>
            <span className={"text-body-md font-medium"} id={"toast-msg"}>
              {actions.text("Action completed")}
            </span>
          </div>

          <div
            id={"delete-modal"}
            className={
              actions.visible("delete-modal", false)
                ? "fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center"
                : "fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 flex flex-col gap-4"
              }
            >
              <div className={"flex items-center justify-between"}>
                <h3 className={"text-headline-sm font-headline-sm text-error"}>
                  {actions.text("Confirm Account Deletion")}
                </h3>
                <button
                  data-action-text={"close"}
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeDeleteModal()"}
                >
                  {"close"}
                </button>
              </div>
              <p className={"text-body-sm text-on-surface-variant"}>
                {actions.text(
                  "This action cannot be undone. All API keys, consumer subscriptions, and usage analytics tied to ",
                )}
                <strong>{actions.text("usr_89f2a09b3c")}</strong>
                {actions.text(" will be permanently purged.")}
              </p>
              <div className={"flex flex-col gap-1.5"}>
                <label
                  className={
                    "text-label-md font-medium text-on-surface-variant"
                  }
                >
                  {actions.text('Type "DELETE" to confirm')}
                </label>
                <input
                  data-source-placeholder={"DELETE"}
                  className={
                    "bg-surface border border-outline-variant rounded-xl px-3.5 py-2 text-body-md text-on-surface focus:outline-none focus:border-error"
                  }
                  id={"delete-confirm-input"}
                  placeholder={actions.text("DELETE")}
                  type={"text"}
                />
              </div>
              <div className={"flex justify-end gap-3 mt-2"}>
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-4 py-2 bg-surface-container-high text-on-surface font-label-md rounded-xl hover:bg-surface-container-highest cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeDeleteModal()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Permanently Delete"}
                  className={
                    "px-4 py-2 bg-error text-on-error font-label-md rounded-xl hover:opacity-90 cursor-pointer"
                  }
                  type="button"
                  aria-label={actions.text("Permanently Delete")}
                  data-handler={
                    "showToast('Account scheduled for deletion'); closeDeleteModal();"
                  }
                >
                  {actions.text("Permanently Delete")}
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
