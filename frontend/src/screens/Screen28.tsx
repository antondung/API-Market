import { useScreenActions } from "../features/screen-actions";
export default function Screen28() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div className={"flex flex-col w-full pb-24"}>
          <div
            className={
              "flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl bg-surface-container-low p-space-lg rounded-xl"
            }
          >
            <div>
              <div className={"flex items-center gap-space-sm mb-space-xs"}>
                <span
                  className={
                    "px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed label-md font-label-md uppercase"
                  }
                >
                  {actions.text("Onboarding Pipeline")}
                </span>
                <span className={"text-on-surface-variant font-code-sm"}>
                  {actions.text("STEP 02 OF 04")}
                </span>
              </div>
              <h1
                className={"font-headline-lg text-headline-lg text-on-surface"}
              >
                {actions.text("Identity & Provider Verification")}
              </h1>
            </div>
            <div className={"flex items-center gap-2"}>
              <div className={"flex items-center gap-space-xs"}>
                <div
                  className={
                    "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md"
                  }
                >
                  {actions.text("1")}
                </div>
                <div className={"w-12 h-1 bg-primary"}></div>
              </div>
              <div className={"flex items-center gap-space-xs"}>
                <div
                  className={
                    "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md"
                  }
                >
                  {actions.text("2")}
                </div>
                <div className={"w-12 h-1 bg-outline-variant/40"}></div>
              </div>
              <div className={"flex items-center gap-space-xs"}>
                <div
                  className={
                    "w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-md"
                  }
                >
                  {actions.text("3")}
                </div>
                <div className={"w-12 h-1 bg-outline-variant/40"}></div>
              </div>
              <div className={"flex items-center gap-space-xs"}>
                <div
                  className={
                    "w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-md"
                  }
                >
                  {actions.text("4")}
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "relative bg-surface-container-lowest rounded-2xl p-space-xl mb-space-xl shadow-sm overflow-hidden flex flex-col lg:flex-row items-center gap-space-xl"
            }
          >
            <div
              className={
                "absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"
              }
            ></div>
            <div className={"flex-1 space-y-space-md"}>
              <div
                className={
                  "inline-flex items-center gap-space-sm px-3 py-1 rounded-full bg-surface-container text-primary font-label-md"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[16px]"}
                >
                  {"verified"}
                </span>
                <span>{actions.text("Trusted API Publisher Network")}</span>
              </div>
              <h2
                className={"font-headline-md text-headline-md text-on-surface"}
              >
                {actions.text("Monetize Your Services at Global Scale")}
              </h2>
              <p className={"font-body-lg text-on-surface-variant max-w-2xl"}>
                {actions.text(
                  "\n        Complete your provider verification to publish endpoints to the API Hub marketplace, access high-throughput gateways, and unlock automated billing.\n      ",
                )}
              </p>
              <div className={"grid grid-cols-3 gap-space-md pt-space-sm"}>
                <div
                  className={"bg-surface-container-low p-space-md rounded-xl"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-primary mb-2"}
                  >
                    {"bolt"}
                  </span>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("99.99%")}
                  </h4>
                  <p className={"font-body-sm text-on-surface-variant"}>
                    {actions.text("Gateway Uptime")}
                  </p>
                </div>
                <div
                  className={"bg-surface-container-low p-space-md rounded-xl"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-primary mb-2"}
                  >
                    {"payments"}
                  </span>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Net-0")}
                  </h4>
                  <p className={"font-body-sm text-on-surface-variant"}>
                    {actions.text("Payout Speed")}
                  </p>
                </div>
                <div
                  className={"bg-surface-container-low p-space-md rounded-xl"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-primary mb-2"}
                  >
                    {"shield"}
                  </span>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("SOC2 Type II")}
                  </h4>
                  <p className={"font-body-sm text-on-surface-variant"}>
                    {actions.text("Certified Security")}
                  </p>
                </div>
              </div>
            </div>
            <div
              className={
                "w-full lg:w-96 bg-surface-container-low p-space-lg rounded-xl flex flex-col gap-space-md"
              }
            >
              <div
                className={
                  "flex items-center gap-space-sm text-on-surface font-headline-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-primary"}
                >
                  {"info"}
                </span>
                <span>{actions.text("Verification Checklist")}</span>
              </div>
              <ul
                className={
                  "space-y-space-sm text-body-sm text-on-surface-variant"
                }
              >
                <li className={"flex items-center gap-space-sm"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[18px]"
                    }
                  >
                    {"check_circle"}
                  </span>
                  <span>
                    {actions.text("Legal Entity or Individual Proof")}
                  </span>
                </li>
                <li className={"flex items-center gap-space-sm"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[18px]"
                    }
                  >
                    {"check_circle"}
                  </span>
                  <span>{actions.text("Tax ID / EIN Verification")}</span>
                </li>
                <li className={"flex items-center gap-space-sm"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[18px]"
                    }
                  >
                    {"check_circle"}
                  </span>
                  <span>{actions.text("DNS Domain Ownership Record")}</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-2xl p-space-xl mb-space-xl shadow-sm"
            }
          >
            <div className={"mb-space-lg"}>
              <h3
                className={"font-headline-sm text-headline-sm text-on-surface"}
              >
                {actions.text("Select Account Entity Type")}
              </h3>
              <p className={"font-body-sm text-on-surface-variant"}>
                {actions.text(
                  "Choose how you will legally register your API publishing footprint.",
                )}
              </p>
            </div>
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-lg"}>
              <label
                className={
                  "relative flex flex-col p-space-lg rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all group"
                }
              >
                <input
                  defaultChecked={true}
                  className={
                    "absolute top-space-lg right-space-lg accent-primary"
                  }
                  name={"account_type"}
                  type={"radio"}
                  aria-label={actions.text("account_type")}
                />
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[32px] mb-space-md"
                  }
                >
                  {"business"}
                </span>
                <span
                  className={
                    "font-headline-sm text-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Organization / Corporation")}
                </span>
                <span className={"font-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "For registered companies, LLCs, or enterprises publishing commercial APIs. Requires EIN and corporate registry docs.",
                  )}
                </span>
              </label>
              <label
                className={
                  "relative flex flex-col p-space-lg rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all group"
                }
              >
                <input
                  className={
                    "absolute top-space-lg right-space-lg accent-primary"
                  }
                  name={"account_type"}
                  type={"radio"}
                  aria-label={actions.text("account_type")}
                />
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[32px] mb-space-md"
                  }
                >
                  {"person"}
                </span>
                <span
                  className={
                    "font-headline-sm text-headline-sm text-on-surface mb-1"
                  }
                >
                  {actions.text("Independent Developer")}
                </span>
                <span className={"font-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "For solo creators, indie hackers, and freelance engineers publishing public or private endpoints.",
                  )}
                </span>
              </label>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-2xl p-space-xl mb-space-xl shadow-sm"
            }
          >
            <div className={"mb-space-lg"}>
              <h3
                className={"font-headline-sm text-headline-sm text-on-surface"}
              >
                {actions.text("Organization & Compliance Details")}
              </h3>
              <p className={"font-body-sm text-on-surface-variant"}>
                {actions.text(
                  "Provide official legal documentation to expedite automated underwriting.",
                )}
              </p>
            </div>
            <form className={"space-y-space-lg"} onSubmit={actions.submit}>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-lg"}>
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Legal Organization Name")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-space-md py-space-sm font-body-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    type={"text"}
                    defaultValue={"Acme Developer Systems Inc."}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Primary Domain")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-space-md py-space-sm font-code-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    type={"text"}
                    defaultValue={"acme-api.io"}
                    aria-label={actions.text("Input")}
                  />
                </div>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-3 gap-space-lg"}>
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Contact Person")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-space-md py-space-sm font-body-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    type={"text"}
                    defaultValue={"Sarah Jenkins"}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("Corporate Phone")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-space-md py-space-sm font-code-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    type={"text"}
                    defaultValue={"+1 (555) 382-9000"}
                    aria-label={actions.text("Input")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "block font-label-md text-on-surface mb-space-xs"
                    }
                  >
                    {actions.text("EIN / Tax ID")}
                  </label>
                  <input
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-space-md py-space-sm font-code-md text-on-surface focus:outline-none focus:border-primary"
                    }
                    type={"text"}
                    defaultValue={"XX-XXXXXXX"}
                    aria-label={actions.text("Input")}
                  />
                </div>
              </div>
              <div>
                <label
                  className={"block font-label-md text-on-surface mb-space-xs"}
                >
                  {actions.text("Supporting Legal & Compliance Documents")}
                </label>
                <div
                  className={
                    "border-2 border-dashed border-outline-variant/60 rounded-xl p-space-xl text-center bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-[36px] text-primary mb-space-sm"
                    }
                  >
                    {"cloud_upload"}
                  </span>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface mb-1"
                    }
                  >
                    {actions.text("Drag & drop files here, or browse")}
                  </h4>
                  <p className={"font-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Supports PDF, PNG, or JPG (Articles of Incorporation, W-9, or Gov ID)",
                    )}
                  </p>
                  <div
                    className={
                      "mt-space-md inline-flex items-center gap-space-sm px-4 py-2 bg-surface-container-highest text-on-surface rounded-xl font-label-md"
                    }
                  >
                    <span>{actions.text("Select File")}</span>
                  </div>
                </div>
              </div>
              <div className={"flex justify-end gap-space-md pt-space-md"}>
                <button
                  data-action-text={"Save Draft"}
                  className={
                    "px-space-lg py-3 rounded-xl border border-outline-variant/60 text-on-surface font-label-md hover:bg-surface-container transition-all"
                  }
                  type={"button"}
                  aria-label={actions.text("Save Draft")}
                >
                  {actions.text("Save Draft")}
                </button>
                <button
                  data-action-text={"Submit for Review"}
                  className={
                    "px-space-xl py-3 rounded-xl bg-primary text-on-primary font-label-md shadow-sm hover:opacity-95 transition-all"
                  }
                  type={"button"}
                  aria-label={actions.text("Submit for Review")}
                >
                  {actions.text("Submit for Review")}
                </button>
              </div>
            </form>
          </div>

          <div className={"space-y-space-lg"}>
            <div className={"mb-space-md"}>
              <h3
                className={"font-headline-md text-headline-md text-on-surface"}
              >
                {actions.text("Verification Status Showcase")}
              </h3>
              <p className={"font-body-sm text-on-surface-variant"}>
                {actions.text(
                  "System states depending on underwriting and review output.",
                )}
              </p>
            </div>
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-space-lg"}>
              <div
                className={
                  "bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md uppercase"
                      }
                    >
                      {actions.text("Pending Review")}
                    </span>
                    <span className={"font-code-sm text-on-surface-variant"}>
                      {actions.text("ID: REQ-88219")}
                    </span>
                  </div>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Automated Underwriting in Progress")}
                  </h4>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text(
                      "Your tax identifiers and DNS records are currently undergoing verification against federal and registry databases.",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "p-space-md bg-surface-container-low rounded-xl flex items-center justify-between"
                  }
                >
                  <div className={"flex items-center gap-space-sm"}>
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary animate-spin"
                      }
                    >
                      {"progress_activity"}
                    </span>
                    <span className={"font-body-sm text-on-surface"}>
                      {actions.text("Estimated time: ~14 minutes")}
                    </span>
                  </div>
                  <span
                    className={
                      "font-label-md text-primary cursor-pointer hover:underline"
                    }
                  >
                    {actions.text("Refresh")}
                  </span>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md uppercase"
                      }
                    >
                      {actions.text("Verified Success")}
                    </span>
                    <span className={"font-code-sm text-on-surface-variant"}>
                      {actions.text("ID: REQ-77102")}
                    </span>
                  </div>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Provider Status: Active & Trusted")}
                  </h4>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text(
                      "All compliance checks cleared successfully. You can now publish unlimited endpoints and receive automated payouts.",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "p-space-md bg-surface-container-low rounded-xl flex items-center justify-between"
                  }
                >
                  <div className={"flex items-center gap-space-sm"}>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"verified_user"}
                    </span>
                    <span className={"font-body-sm text-on-surface"}>
                      {actions.text("Tier-1 Publisher Badge Granted")}
                    </span>
                  </div>
                  <button
                    data-action-text={"Open API Catalog"}
                    className={
                      "px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Open API Catalog")}
                  >
                    {actions.text("Open API Catalog")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-md uppercase"
                      }
                    >
                      {actions.text("Action Required / Rejected")}
                    </span>
                    <span className={"font-code-sm text-on-surface-variant"}>
                      {actions.text("ID: REQ-55410")}
                    </span>
                  </div>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Document Discrepancy Detected")}
                  </h4>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text(
                      'Administrator Feedback: "The uploaded Articles of Incorporation do not match the legal entity name provided. Please re-upload current certified copies."',
                    )}
                  </p>
                </div>
                <div
                  className={
                    "p-space-md bg-error-container/40 rounded-xl flex items-center justify-between"
                  }
                >
                  <span className={"font-body-sm text-on-surface"}>
                    {actions.text(
                      "Please correct the mismatched fields to resubmit.",
                    )}
                  </span>
                  <button
                    data-action-text={"Resubmit Documents"}
                    className={
                      "px-3 py-1.5 rounded-xl bg-error text-on-error font-label-md"
                    }
                    type="button"
                    aria-label={actions.text("Resubmit Documents")}
                  >
                    {actions.text("Resubmit Documents")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between"
                }
              >
                <div>
                  <div
                    className={"flex items-center justify-between mb-space-md"}
                  >
                    <span
                      className={
                        "px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md uppercase"
                      }
                    >
                      {actions.text("Suspended")}
                    </span>
                    <span className={"font-code-sm text-on-surface-variant"}>
                      {actions.text("ID: REQ-10293")}
                    </span>
                  </div>
                  <h4
                    className={
                      "font-headline-sm text-headline-sm text-on-surface mb-2"
                    }
                  >
                    {actions.text("Compliance Hold Active")}
                  </h4>
                  <p
                    className={
                      "font-body-sm text-on-surface-variant mb-space-md"
                    }
                  >
                    {actions.text(
                      "Your endpoint gateway traffic has been temporarily throttled due to an unverified tax reporting update. Contact provider support immediately.",
                    )}
                  </p>
                </div>
                <div
                  className={
                    "p-space-md bg-surface-container-low rounded-xl flex items-center justify-between"
                  }
                >
                  <div className={"flex items-center gap-space-sm"}>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-error"}
                    >
                      {"warning"}
                    </span>
                    <span className={"font-body-sm text-on-surface"}>
                      {actions.text("Gateways Restricted")}
                    </span>
                  </div>
                  <span
                    className={
                      "font-label-md text-primary cursor-pointer hover:underline"
                    }
                  >
                    {actions.text("Contact Compliance Support")}
                  </span>
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
