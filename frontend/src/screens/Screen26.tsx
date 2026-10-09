import { useScreenActions } from "../features/screen-actions";
export default function Screen26() {
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
          <div className={"flex items-center justify-between mb-space-lg"}>
            <div>
              <h1
                className={"font-headline-lg text-headline-lg text-on-surface"}
              >
                {actions.text("API Provider Compliance & Verification")}
              </h1>
              <p className={"text-body-md text-on-surface-variant mt-1"}>
                {actions.text(
                  "Complete your ownership declarations, domain validations, and compliance milestones for the Provider Workspace.",
                )}
              </p>
            </div>
            <div className={"flex items-center gap-3"}>
              <span
                className={
                  "inline-flex items-center px-3 py-1 rounded-full text-label-md bg-surface-container-high text-primary font-medium"
                }
              >
                <span
                  className={
                    "w-2 h-2 rounded-full bg-primary animate-pulse mr-2"
                  }
                ></span>
                {actions.text(
                  "\n        Verification in Progress (Step 2/5)\n      ",
                )}
              </span>
              <button
                data-action-text={"save Save Draft"}
                className={
                  "px-4 py-2 bg-primary text-on-primary rounded-xl text-body-md font-medium hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Save Draft")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"save"}
                </span>
                {actions.text("\n        Save Draft\n      ")}
              </button>
            </div>
          </div>
          <div
            className={
              "flex items-center gap-2 mb-space-xl overflow-x-auto pb-2 border-b border-outline-variant/30"
            }
          >
            <button
              data-action-text={"1 Ownership Declaration"}
              className={
                "compliance-tab flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-body-md transition-all bg-primary text-on-primary shadow-sm"
              }
              data-tab={"0"}
              type="button"
              aria-label={actions.text("1 Ownership Declaration")}
              data-handler={"switchTab(0)"}
            >
              <span
                className={
                  "w-6 h-6 rounded-full bg-on-primary/20 flex items-center justify-center text-label-md"
                }
              >
                {actions.text("1")}
              </span>
              {actions.text("\n      Ownership Declaration\n    ")}
            </button>
            <button
              data-action-text={"2 Domain Verification"}
              className={
                "compliance-tab flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-body-md transition-all text-on-surface-variant hover:bg-surface-container-high"
              }
              data-tab={"1"}
              type="button"
              aria-label={actions.text("2 Domain Verification")}
              data-handler={"switchTab(1)"}
            >
              <span
                className={
                  "w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-label-md"
                }
              >
                {actions.text("2")}
              </span>
              {actions.text("\n      Domain Verification\n    ")}
            </button>
            <button
              data-action-text={"3 Data Classification"}
              className={
                "compliance-tab flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-body-md transition-all text-on-surface-variant hover:bg-surface-container-high"
              }
              data-tab={"2"}
              type="button"
              aria-label={actions.text("3 Data Classification")}
              data-handler={"switchTab(2)"}
            >
              <span
                className={
                  "w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-label-md"
                }
              >
                {actions.text("3")}
              </span>
              {actions.text("\n      Data Classification\n    ")}
            </button>
            <button
              data-action-text={"4 Provider Agreement"}
              className={
                "compliance-tab flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-body-md transition-all text-on-surface-variant hover:bg-surface-container-high"
              }
              data-tab={"3"}
              type="button"
              aria-label={actions.text("4 Provider Agreement")}
              data-handler={"switchTab(3)"}
            >
              <span
                className={
                  "w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-label-md"
                }
              >
                {actions.text("4")}
              </span>
              {actions.text("\n      Provider Agreement\n    ")}
            </button>
            <button
              data-action-text={"5 Compliance Summary"}
              className={
                "compliance-tab flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-body-md transition-all text-on-surface-variant hover:bg-surface-container-high"
              }
              data-tab={"4"}
              type="button"
              aria-label={actions.text("5 Compliance Summary")}
              data-handler={"switchTab(4)"}
            >
              <span
                className={
                  "w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-label-md"
                }
              >
                {actions.text("5")}
              </span>
              {actions.text("\n      Compliance Summary\n    ")}
            </button>
          </div>
          <div className={"w-full"}>
            <div className={"tab-content block"} id={"section-0"}>
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                <div
                  className={
                    "lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-6"
                  }
                >
                  <div>
                    <h2
                      className={
                        "font-headline-md text-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("API Ownership & Distribution Rights")}
                    </h2>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Declare whether you are the direct creator of this API or distributing under verified legal authorization.",
                      )}
                    </p>
                  </div>
                  <div className={"space-y-4"}>
                    <label
                      className={
                        "block text-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Select Ownership Type")}
                    </label>
                    <div className={"grid grid-cols-2 gap-4"}>
                      <label
                        className={
                          "flex flex-col p-4 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all border-2 border-transparent has-[:checked]:border-primary"
                        }
                      >
                        <div
                          className={"flex items-center justify-between mb-2"}
                        >
                          <span className={"font-medium text-on-surface"}>
                            {actions.text("Original Creator")}
                          </span>
                          <input
                            defaultChecked={true}
                            className={"accent-primary"}
                            name={"ownership_type"}
                            type={"radio"}
                            defaultValue={"original"}
                            aria-label={actions.text("ownership_type")}
                          />
                        </div>
                        <span
                          className={"text-body-sm text-on-surface-variant"}
                        >
                          {actions.text(
                            "You built and own the underlying source code and IP rights.",
                          )}
                        </span>
                      </label>
                      <label
                        className={
                          "flex flex-col p-4 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all border-2 border-transparent has-[:checked]:border-primary"
                        }
                      >
                        <div
                          className={"flex items-center justify-between mb-2"}
                        >
                          <span className={"font-medium text-on-surface"}>
                            {actions.text("Third-Party with Rights")}
                          </span>
                          <input
                            className={"accent-primary"}
                            name={"ownership_type"}
                            type={"radio"}
                            defaultValue={"third_party"}
                            aria-label={actions.text("ownership_type")}
                          />
                        </div>
                        <span
                          className={"text-body-sm text-on-surface-variant"}
                        >
                          {actions.text(
                            "Distributed under formal licensing, OEM, or resale agreement.",
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "block text-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Source / Upstream Provider")}
                    </label>
                    <input
                      data-source-placeholder={
                        "e.g., Acme Data Services Inc. or Internal Core Infra"
                      }
                      className={
                        "w-full bg-surface-container-low px-4 py-3 rounded-xl text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/50"
                      }
                      placeholder={actions.text(
                        "e.g., Acme Data Services Inc. or Internal Core Infra",
                      )}
                      type={"text"}
                      aria-label={actions.text(
                        "e.g., Acme Data Services Inc. or Internal Core Infra",
                      )}
                    />
                  </div>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "block text-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Ownership Explanation & Legal Basis")}
                    </label>
                    <textarea
                      data-source-placeholder={
                        "Describe how your organization obtained the distribution rights, proprietary algorithms used, or licensing contracts backing this API."
                      }
                      className={
                        "w-full bg-surface-container-low px-4 py-3 rounded-xl text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/50"
                      }
                      placeholder={actions.text(
                        "Describe how your organization obtained the distribution rights, proprietary algorithms used, or licensing contracts backing this API.",
                      )}
                      rows={4}
                      aria-label={actions.text(
                        "Describe how your organization obtained the distribution rights, proprietary algorithms used, or licensing contracts backing this API.",
                      )}
                      defaultValue={""}
                    ></textarea>
                  </div>
                  <div className={"space-y-3"}>
                    <label
                      className={
                        "block text-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Permitted Redistribution Rights")}
                    </label>
                    <div className={"space-y-2"}>
                      <label
                        className={
                          "flex items-center gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span className={"text-body-md text-on-surface"}>
                          {actions.text(
                            "Full commercial resale and enterprise monetization permitted",
                          )}
                        </span>
                      </label>
                      <label
                        className={
                          "flex items-center gap-3 p-3 rounded-xl bg-surface-container-low cursor-pointer"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span className={"text-body-md text-on-surface"}>
                          {actions.text(
                            "API caching and transformation rights secured",
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={"flex justify-end pt-4"}>
                    <button
                      data-action-text={
                        "Save & Continue to Domain Verification"
                      }
                      className={
                        "px-6 py-2.5 bg-primary text-on-primary rounded-xl text-body-md font-medium hover:bg-primary-container transition-all shadow-sm"
                      }
                      type="button"
                      aria-label={actions.text(
                        "Save & Continue to Domain Verification",
                      )}
                      data-handler={"switchTab(1)"}
                    >
                      {actions.text(
                        "\n              Save & Continue to Domain Verification\n            ",
                      )}
                    </button>
                  </div>
                </div>
                <div className={"space-y-6"}>
                  <div
                    className={
                      "bg-surface-container-low p-space-lg rounded-xl space-y-4"
                    }
                  >
                    <div className={"flex items-center gap-3 text-primary"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[24px]"}
                      >
                        {"verified_user"}
                      </span>
                      <h3
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Legal Clarification")}
                      </h3>
                    </div>
                    <p
                      className={
                        "text-body-sm text-on-surface-variant leading-relaxed"
                      }
                    >
                      {actions.text(
                        "\n              Domain verification alone does ",
                      )}
                      <strong>{actions.text("not")}</strong>
                      {actions.text(
                        " prove full legal ownership. API HUB requires explicit declaration of upstream rights to protect platform consumers from intellectual property disputes.\n            ",
                      )}
                    </p>
                    <div
                      className={
                        "p-3 bg-primary/10 rounded-xl text-body-sm text-primary flex items-start gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-[18px] mt-0.5"
                        }
                      >
                        {"info"}
                      </span>
                      <span>
                        {actions.text(
                          "Submitting false declarations will result in immediate suspension of the Provider Workspace account.",
                        )}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest p-space-lg rounded-xl space-y-3"
                    }
                  >
                    <h4
                      className={
                        "font-headline-sm text-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Verification Status")}
                    </h4>
                    <div
                      className={
                        "flex items-center justify-between py-2 border-b border-outline-variant/20"
                      }
                    >
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Ownership Declaration")}
                      </span>
                      <span
                        className={
                          "px-2.5 py-0.5 rounded-full text-label-md bg-emerald-100 text-emerald-800 font-medium"
                        }
                      >
                        {actions.text("Completed")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between py-2 border-b border-outline-variant/20"
                      }
                    >
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Domain Validation")}
                      </span>
                      <span
                        className={
                          "px-2.5 py-0.5 rounded-full text-label-md bg-amber-100 text-amber-800 font-medium"
                        }
                      >
                        {actions.text("Pending")}
                      </span>
                    </div>
                    <div className={"flex items-center justify-between py-2"}>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text("Data Safety Audit")}
                      </span>
                      <span
                        className={
                          "px-2.5 py-0.5 rounded-full text-label-md bg-surface-container-high text-on-surface-variant"
                        }
                      >
                        {actions.text("Not Started")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              id={"section-1"}
              className={
                actions.visible("section-1", false)
                  ? "tab-content"
                  : "tab-content hidden"
              }
            >
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                <div
                  className={
                    "lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-6"
                  }
                >
                  <div>
                    <h2
                      className={
                        "font-headline-md text-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("Base Domain & Endpoint Verification")}
                    </h2>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Verify control over your endpoint domain to enable secure gateway routing and SSL termination.",
                      )}
                    </p>
                  </div>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "block text-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Base Domain / Hostname")}
                    </label>
                    <div className={"flex gap-3"}>
                      <input
                        className={
                          "flex-1 bg-surface-container-low px-4 py-3 rounded-xl text-body-md font-code-md text-on-surface outline-none focus:ring-2 focus:ring-primary/50"
                        }
                        id={"domainInput"}
                        type={"text"}
                        defaultValue={"api.acmelabs.io"}
                      />
                      <button
                        data-action-text={"Update Domain"}
                        className={
                          "px-5 bg-surface-container-high text-on-surface rounded-xl text-body-md font-medium hover:bg-surface-container-highest transition-all"
                        }
                        type="button"
                        aria-label={actions.text("Update Domain")}
                      >
                        {actions.text("Update Domain")}
                      </button>
                    </div>
                  </div>
                  <div
                    className={
                      "bg-surface-container-low p-space-lg rounded-xl space-y-4"
                    }
                  >
                    <div className={"flex items-center justify-between"}>
                      <span
                        className={
                          "text-label-md text-on-surface uppercase tracking-wider"
                        }
                      >
                        {actions.text("Generated DNS TXT Token")}
                      </span>
                      <button
                        data-action-text={"content_copy Copy Token"}
                        className={
                          "flex items-center gap-1.5 text-primary text-body-sm font-medium hover:underline"
                        }
                        type="button"
                        aria-label={actions.text("Copy Token")}
                        data-handler={"copyToken()"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"content_copy"}
                        </span>
                        {actions.text(
                          "\n                Copy Token\n              ",
                        )}
                      </button>
                    </div>
                    <div
                      className={
                        "bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 flex items-center justify-between"
                      }
                    >
                      <code
                        className={"font-code-md text-body-md text-on-surface"}
                      >
                        {
                          "apihub-verification-token=9a8f7c6e5d4b3a210fedcba987654321"
                        }
                      </code>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-emerald-600"}
                      >
                        {"check_circle"}
                      </span>
                    </div>
                  </div>
                  <div className={"space-y-3"}>
                    <h3
                      className={
                        "font-headline-sm text-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Step-by-Step Instructions")}
                    </h3>
                    <ol
                      className={
                        "space-y-3 text-body-md text-on-surface-variant list-decimal list-inside bg-surface-container-low p-4 rounded-xl"
                      }
                    >
                      <li className={"pl-2"}>
                        {actions.text(
                          "Log in to your DNS registrar or hosting provider control panel.",
                        )}
                      </li>
                      <li className={"pl-2"}>
                        {actions.text(
                          "Create a new TXT record on your base domain: ",
                        )}
                        <code className={"font-code-md text-primary"}>
                          {"_apihub.api.acmelabs.io"}
                        </code>
                      </li>
                      <li className={"pl-2"}>
                        {actions.text(
                          "Paste the generated verification token value shown above into the TXT record value field.",
                        )}
                      </li>
                      <li className={"pl-2"}>
                        {actions.text("Click ")}
                        <strong className={"text-on-surface"}>
                          {actions.text("Verify Domain")}
                        </strong>
                        {actions.text(
                          " below once propagated (usually takes under 60 seconds).",
                        )}
                      </li>
                    </ol>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between pt-4 border-t border-outline-variant/20"
                    }
                  >
                    <div className={"flex items-center gap-2"}>
                      <span
                        className={
                          "px-3 py-1 rounded-full text-label-md bg-amber-100 text-amber-800 font-medium flex items-center gap-1.5"
                        }
                        id={"domainStatusBadge"}
                      >
                        <span
                          className={"w-2 h-2 rounded-full bg-amber-500"}
                        ></span>
                        {actions.text(" Unverified\n              ")}
                      </span>
                    </div>
                    <div className={"flex gap-3"}>
                      <button
                        data-action-text={"Verify Domain Now"}
                        className={
                          "px-6 py-2.5 bg-surface-container-high text-on-surface rounded-xl text-body-md font-medium hover:bg-surface-container-highest transition-all"
                        }
                        type="button"
                        aria-label={actions.text("Verify Domain Now")}
                        data-handler={"simulateVerification()"}
                      >
                        {actions.text(
                          "\n                Verify Domain Now\n              ",
                        )}
                      </button>
                      <button
                        data-action-text={"Next: Data Classification"}
                        className={
                          "px-6 py-2.5 bg-primary text-on-primary rounded-xl text-body-md font-medium hover:bg-primary-container transition-all shadow-sm"
                        }
                        type="button"
                        aria-label={actions.text("Next: Data Classification")}
                        data-handler={"switchTab(2)"}
                      >
                        {actions.text(
                          "\n                Next: Data Classification\n              ",
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={"space-y-6"}>
                  <div
                    className={
                      "bg-surface-container-low p-space-lg rounded-xl space-y-4"
                    }
                  >
                    <div className={"flex items-center gap-3 text-primary"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[24px]"}
                      >
                        {"dns"}
                      </span>
                      <h3
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Alternative Methods")}
                      </h3>
                    </div>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "\n              Can't edit your DNS records? You can also place an HTML verification file or configure a well-known endpoint response.\n            ",
                      )}
                    </p>
                    <div className={"space-y-2"}>
                      <button
                        data-action-text={
                          "HTTP File Upload Verification chevron_right"
                        }
                        className={
                          "w-full text-left p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container transition-all text-body-sm font-medium text-on-surface flex items-center justify-between"
                        }
                        type="button"
                        aria-label={actions.text(
                          "HTTP File Upload Verification",
                        )}
                      >
                        <span>
                          {actions.text("HTTP File Upload Verification")}
                        </span>
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"chevron_right"}
                        </span>
                      </button>
                      <button
                        data-action-text={
                          "TLS Certificate Fingerprint chevron_right"
                        }
                        className={
                          "w-full text-left p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container transition-all text-body-sm font-medium text-on-surface flex items-center justify-between"
                        }
                        type="button"
                        aria-label={actions.text("TLS Certificate Fingerprint")}
                      >
                        <span>
                          {actions.text("TLS Certificate Fingerprint")}
                        </span>
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[18px]"}
                        >
                          {"chevron_right"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              id={"section-2"}
              className={
                actions.visible("section-2", false)
                  ? "tab-content"
                  : "tab-content hidden"
              }
            >
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                <div
                  className={
                    "lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-6"
                  }
                >
                  <div>
                    <h2
                      className={
                        "font-headline-md text-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("Data Classification & Privacy Audit")}
                    </h2>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Specify the sensitivity and data types processed by your API endpoints.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "p-6 bg-surface-container-low rounded-xl space-y-4"
                    }
                  >
                    <label
                      className={
                        "block font-headline-sm text-headline-sm text-on-surface"
                      }
                    >
                      {actions.text(
                        "Does this API process personal or sensitive data?",
                      )}
                    </label>
                    <div className={"flex gap-4"}>
                      <label
                        className={
                          "flex items-center gap-3 px-6 py-3 rounded-xl bg-surface-container-lowest cursor-pointer shadow-sm"
                        }
                      >
                        <input
                          data-action-text={""}
                          defaultChecked={true}
                          className={"accent-primary w-4 h-4"}
                          name={"sensitive_data"}
                          type={"radio"}
                          defaultValue={"yes"}
                          aria-label={actions.text("sensitive_data")}
                          data-handler={"toggleSensitiveOptions(true)"}
                        />
                        <span className={"font-medium text-on-surface"}>
                          {actions.text(
                            "Yes, processes sensitive/personal data",
                          )}
                        </span>
                      </label>
                      <label
                        className={
                          "flex items-center gap-3 px-6 py-3 rounded-xl bg-surface-container-lowest cursor-pointer shadow-sm"
                        }
                      >
                        <input
                          data-action-text={""}
                          className={"accent-primary w-4 h-4"}
                          name={"sensitive_data"}
                          type={"radio"}
                          defaultValue={"no"}
                          aria-label={actions.text("sensitive_data")}
                          data-handler={"toggleSensitiveOptions(false)"}
                        />
                        <span className={"font-medium text-on-surface"}>
                          {actions.text("No personal or sensitive data")}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={"space-y-4"} id={"sensitiveCategories"}>
                    <label
                      className={
                        "block text-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Select Applicable Data Categories")}
                    </label>
                    <div className={"grid grid-cols-2 gap-3"}>
                      <label
                        className={
                          "flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface font-medium"}
                        >
                          {actions.text("Personal Identifiers (Name, ID, SSN)")}
                        </span>
                      </label>
                      <label
                        className={
                          "flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface font-medium"}
                        >
                          {actions.text("Contact Information (Email, Phone)")}
                        </span>
                      </label>
                      <label
                        className={
                          "flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                        }
                      >
                        <input
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface font-medium"}
                        >
                          {actions.text("Precise Location Data (GPS, IP Geo)")}
                        </span>
                      </label>
                      <label
                        className={
                          "flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface font-medium"}
                        >
                          {actions.text("Financial & Transactional Records")}
                        </span>
                      </label>
                      <label
                        className={
                          "flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                        }
                      >
                        <input
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface font-medium"}
                        >
                          {actions.text("Authentication Tokens & Credentials")}
                        </span>
                      </label>
                      <label
                        className={
                          "flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                        }
                      >
                        <input
                          className={"w-4 h-4 accent-primary rounded"}
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <span
                          className={"text-body-md text-on-surface font-medium"}
                        >
                          {actions.text("Protected Health Information (PHI)")}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className={"space-y-2"}>
                    <label
                      className={
                        "block text-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Data Residency & Storage Regions")}
                    </label>
                    <select
                      className={
                        "w-full bg-surface-container-low px-4 py-3 rounded-xl text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/50"
                      }
                      aria-label={actions.text("Input")}
                    >
                      <option
                        value={
                          "Global Edge / Multi-Region (GDPR & CCPA Compliant)"
                        }
                      >
                        {actions.text(
                          "Global Edge / Multi-Region (GDPR & CCPA Compliant)",
                        )}
                      </option>
                      <option
                        value={"United States Only (AWS us-east-1 / us-west-2)"}
                      >
                        {actions.text(
                          "United States Only (AWS us-east-1 / us-west-2)",
                        )}
                      </option>
                      <option
                        value={
                          "European Union Sovereign Cloud (Frankfurt/Dublin)"
                        }
                      >
                        {actions.text(
                          "European Union Sovereign Cloud (Frankfurt/Dublin)",
                        )}
                      </option>
                    </select>
                  </div>
                  <div className={"flex justify-end pt-4"}>
                    <button
                      data-action-text={"Save & Continue to Provider Agreement"}
                      className={
                        "px-6 py-2.5 bg-primary text-on-primary rounded-xl text-body-md font-medium hover:bg-primary-container transition-all shadow-sm"
                      }
                      type="button"
                      aria-label={actions.text(
                        "Save & Continue to Provider Agreement",
                      )}
                      data-handler={"switchTab(3)"}
                    >
                      {actions.text(
                        "\n              Save & Continue to Provider Agreement\n            ",
                      )}
                    </button>
                  </div>
                </div>
                <div className={"space-y-6"}>
                  <div
                    className={
                      "bg-surface-container-low p-space-lg rounded-xl space-y-4"
                    }
                  >
                    <div className={"flex items-center gap-3 text-primary"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[24px]"}
                      >
                        {"shield"}
                      </span>
                      <h3
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Compliance Guarantee")}
                      </h3>
                    </div>
                    <p
                      className={
                        "text-body-sm text-on-surface-variant leading-relaxed"
                      }
                    >
                      {actions.text(
                        "\n              Accurate data classification ensures your API is matched with enterprise consumers who meet stringent regulatory requirements (SOC2, HIPAA, ISO27001).\n            ",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              id={"section-3"}
              className={
                actions.visible("section-3", false)
                  ? "tab-content"
                  : "tab-content hidden"
              }
            >
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                <div
                  className={
                    "lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-6"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <div>
                      <h2
                        className={
                          "font-headline-md text-headline-md text-on-surface mb-1"
                        }
                      >
                        {actions.text("API Provider Service Agreement")}
                      </h2>
                      <p className={"text-body-md text-on-surface-variant"}>
                        {actions.text(
                          "Review terms and conditions for publishing APIs on the API HUB marketplace.",
                        )}
                      </p>
                    </div>
                    <span
                      className={
                        "px-3 py-1 rounded-full text-label-md bg-surface-container-high text-primary font-medium"
                      }
                    >
                      {actions.text("v4.2-2025")}
                    </span>
                  </div>
                  <div
                    className={
                      "h-64 overflow-y-auto bg-surface-container-low p-6 rounded-xl text-body-sm text-on-surface-variant space-y-4 leading-relaxed"
                    }
                  >
                    <h4 className={"font-headline-sm text-on-surface"}>
                      {actions.text("1. Service Level Commitments & Uptime")}
                    </h4>
                    <p>
                      {actions.text(
                        "Providers guarantee a minimum monthly uptime of 99.9% across all published production endpoints. Failure to meet availability SLAs may result in automated tier downgrades or revenue withholding.",
                      )}
                    </p>
                    <h4 className={"font-headline-sm text-on-surface"}>
                      {actions.text("2. Data Privacy & Consumer Protection")}
                    </h4>
                    <p>
                      {actions.text(
                        "Providers agree not to log, harvest, or monetize consumer payload data beyond immediate diagnostic error handling and billing metering. Unauthorized data retention is a material breach of contract.",
                      )}
                    </p>
                    <h4 className={"font-headline-sm text-on-surface"}>
                      {actions.text(
                        "3. Indemnification & Intellectual Property",
                      )}
                    </h4>
                    <p>
                      {actions.text(
                        "Provider warrants they hold full ownership or valid redistribution rights as declared in Section 1. Provider shall indemnify API HUB against any third-party copyright or patent infringement claims.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "p-4 bg-surface-container-low rounded-xl space-y-4"
                    }
                  >
                    <label className={"flex items-start gap-3 cursor-pointer"}>
                      <input
                        className={"mt-1 w-4 h-4 accent-primary rounded"}
                        id={"agreementCheckbox"}
                        type={"checkbox"}
                      />
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text(
                          "\n                I have read, understood, and unconditionally agree to the API Provider Service Agreement (v4.2) and warrant that all ownership and data classifications provided are authentic.\n              ",
                        )}
                      </span>
                    </label>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between pt-4 border-t border-outline-variant/20"
                    }
                  >
                    <div
                      className={"text-body-sm text-on-surface-variant italic"}
                      id={"timestampContainer"}
                    >
                      {actions.text(
                        "\n              Acceptance timestamp: Not yet accepted\n            ",
                      )}
                    </div>
                    <button
                      data-action-text={"Review Compliance Summary"}
                      className={
                        "px-6 py-2.5 bg-primary/50 text-on-primary rounded-xl text-body-md font-medium cursor-not-allowed transition-all shadow-sm"
                      }
                      disabled={true}
                      id={"proceedSummaryBtn"}
                      type="button"
                      aria-label={actions.text("Review Compliance Summary")}
                      data-handler={"switchTab(4)"}
                    >
                      {actions.text(
                        "\n              Review Compliance Summary\n            ",
                      )}
                    </button>
                  </div>
                </div>
                <div className={"space-y-6"}>
                  <div
                    className={
                      "bg-surface-container-low p-space-lg rounded-xl space-y-4"
                    }
                  >
                    <div className={"flex items-center gap-3 text-primary"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[24px]"}
                      >
                        {"gavel"}
                      </span>
                      <h3
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Binding Acceptance")}
                      </h3>
                    </div>
                    <p
                      className={
                        "text-body-sm text-on-surface-variant leading-relaxed"
                      }
                    >
                      {actions.text(
                        "\n              Checking this box generates a cryptographic timestamped audit log entry tied directly to your Provider Workspace account ID.\n            ",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              id={"section-4"}
              className={
                actions.visible("section-4", false)
                  ? "tab-content"
                  : "tab-content hidden"
              }
            >
              <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
                <div
                  className={
                    "lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-6"
                  }
                >
                  <div>
                    <h2
                      className={
                        "font-headline-md text-headline-md text-on-surface mb-2"
                      }
                    >
                      {actions.text("Compliance Review Summary")}
                    </h2>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Review all completed verification milestones before final submission to the security and compliance team.",
                      )}
                    </p>
                  </div>
                  <div className={"space-y-3"}>
                    <div
                      className={
                        "flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-emerald-600"
                          }
                        >
                          {"check_circle"}
                        </span>
                        <div>
                          <h4 className={"font-medium text-on-surface"}>
                            {actions.text("1. API Ownership Declaration")}
                          </h4>
                          <p className={"text-body-sm text-on-surface-variant"}>
                            {actions.text(
                              "Original Creator declared with redistribution rights",
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-emerald-100 text-emerald-800 font-medium"
                        }
                      >
                        {actions.text("Verified")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-amber-600"}
                          id={"summaryDomainIcon"}
                        >
                          {"schedule"}
                        </span>
                        <div>
                          <h4 className={"font-medium text-on-surface"}>
                            {actions.text("2. Domain Verification")}
                          </h4>
                          <p className={"text-body-sm text-on-surface-variant"}>
                            {actions.text("api.acmelabs.io (DNS TXT Record)")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-amber-100 text-amber-800 font-medium"
                        }
                        id={"summaryDomainBadge"}
                      >
                        {actions.text("Pending DNS Check")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-emerald-600"
                          }
                        >
                          {"check_circle"}
                        </span>
                        <div>
                          <h4 className={"font-medium text-on-surface"}>
                            {actions.text("3. Data Classification Audit")}
                          </h4>
                          <p className={"text-body-sm text-on-surface-variant"}>
                            {actions.text(
                              "Personal, Contact, and Financial data declared",
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-emerald-100 text-emerald-800 font-medium"
                        }
                      >
                        {actions.text("Completed")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
                      }
                    >
                      <div className={"flex items-center gap-3"}>
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-amber-600"}
                          id={"summaryAgreementIcon"}
                        >
                          {"schedule"}
                        </span>
                        <div>
                          <h4 className={"font-medium text-on-surface"}>
                            {actions.text("4. Provider Agreement")}
                          </h4>
                          <p className={"text-body-sm text-on-surface-variant"}>
                            {actions.text("Service Level & Privacy Terms v4.2")}
                          </p>
                        </div>
                      </div>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-label-md bg-amber-100 text-amber-800 font-medium"
                        }
                        id={"summaryAgreementBadge"}
                      >
                        {actions.text("Pending Acceptance")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "p-4 bg-amber-50 rounded-xl border border-amber-200/50 flex items-start gap-3"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-amber-800 text-[20px] mt-0.5"
                      }
                    >
                      {"warning"}
                    </span>
                    <div className={"text-body-sm text-amber-900"}>
                      <span className={"font-medium block mb-1"}>
                        {actions.text("Explicit Confirmation Required")}
                      </span>
                      {actions.text(
                        "\n              By clicking submit below, you certify that all information is accurate and that domain verification does not substitute for full legal ownership warranties.\n            ",
                      )}
                    </div>
                  </div>
                  <div className={"flex justify-end pt-4"}>
                    <button
                      data-action-text={
                        "send Submit Compliance Package for Review"
                      }
                      className={
                        "px-8 py-3 bg-primary text-on-primary rounded-xl text-body-lg font-medium hover:bg-primary-container transition-all shadow-md flex items-center gap-2"
                      }
                      type="button"
                      aria-label={actions.text(
                        "Submit Compliance Package for Review",
                      )}
                      data-handler={"submitComplianceReview()"}
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined"}
                      >
                        {"send"}
                      </span>
                      {actions.text(
                        "\n              Submit Compliance Package for Review\n            ",
                      )}
                    </button>
                  </div>
                </div>
                <div className={"space-y-6"}>
                  <div
                    className={
                      "bg-surface-container-low p-space-lg rounded-xl space-y-4"
                    }
                  >
                    <div className={"flex items-center gap-3 text-primary"}>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[24px]"}
                      >
                        {"support_agent"}
                      </span>
                      <h3
                        className={
                          "font-headline-sm text-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Review SLA")}
                      </h3>
                    </div>
                    <p
                      className={
                        "text-body-sm text-on-surface-variant leading-relaxed"
                      }
                    >
                      {actions.text(
                        "\n              Once submitted, our compliance review board evaluates submissions within 24–48 business hours. You will receive notification via webhook and email.\n            ",
                      )}
                    </p>
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
