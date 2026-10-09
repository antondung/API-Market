import { useScreenActions } from "../features/screen-actions";
export default function Screen32() {
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
              "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
            }
          >
            <div>
              <div className={"flex items-center gap-2 mb-1"}>
                <span
                  className={
                    "text-label-md text-primary font-headline-sm uppercase tracking-wider"
                  }
                >
                  {actions.text("Provider Workspace")}
                </span>
                <span className={"text-on-surface-variant"}>
                  {actions.text("•")}
                </span>
                <span
                  className={
                    "text-label-md text-on-surface-variant font-code-md"
                  }
                >
                  {actions.text("v2.4.0-stable")}
                </span>
              </div>
              <h1
                className={
                  "text-headline-lg font-headline-lg text-on-surface tracking-tight"
                }
              >
                {actions.text("API Publishing & Compliance Review")}
              </h1>
            </div>
            <div className={"flex items-center gap-3"}>
              <button
                data-action-text={"history Revision History"}
                className={
                  "px-4 py-2 bg-surface-container-high text-on-surface rounded-xl text-body-md font-medium hover:bg-surface-container-highest transition-all flex items-center gap-2 shadow-sm"
                }
                type="button"
                aria-label={actions.text("Revision History")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"history"}
                </span>
                <span>{actions.text("Revision History")}</span>
              </button>
              <button
                data-action-text={"bolt Run Full Validation"}
                className={
                  "px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-body-md font-medium hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2 shadow-sm"
                }
                type="button"
                aria-label={actions.text("Run Full Validation")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"bolt"}
                </span>
                <span>{actions.text("Run Full Validation")}</span>
              </button>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-12 gap-6"}>
            <div className={"lg:col-span-7 space-y-6"}>
              <div
                className={
                  "bg-surface-container-low rounded-2xl p-6 shadow-sm relative overflow-hidden"
                }
              >
                <div
                  className={
                    "absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
                  }
                ></div>
                <div className={"flex items-start justify-between mb-6"}>
                  <div>
                    <div
                      className={"text-label-md text-on-surface-variant mb-1"}
                    >
                      {actions.text("ACTIVE TARGET API")}
                    </div>
                    <h2
                      className={
                        "text-headline-md font-headline-md text-on-surface flex items-center gap-2"
                      }
                    >
                      <span>{actions.text("HyperScale Analytics API")}</span>
                      <span
                        className={
                          "px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-label-md font-medium flex items-center gap-1"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"error"}
                        </span>
                        {actions.text(
                          "\n                Changes Requested\n              ",
                        )}
                      </span>
                    </h2>
                  </div>
                  <div className={"text-right"}>
                    <div
                      className={"text-label-md text-on-surface-variant mb-1"}
                    >
                      {actions.text("COMPLIANCE GATE")}
                    </div>
                    <div
                      className={
                        "text-body-md font-code-md text-error font-medium"
                      }
                    >
                      {actions.text("Blocked by Admin")}
                    </div>
                  </div>
                </div>

                <div className={"mt-8 pt-6 border-t border-outline-variant/30"}>
                  <div
                    className={
                      "text-label-md text-on-surface-variant mb-4 uppercase tracking-wider"
                    }
                  >
                    {actions.text("Publication Lifecycle Pipeline")}
                  </div>
                  <div className={"grid grid-cols-5 gap-2 relative"}>
                    <div className={"flex flex-col items-center text-center"}>
                      <div
                        className={
                          "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-md text-body-sm shadow-sm mb-2"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-sm font-medium text-on-surface"}
                      >
                        {actions.text("Draft")}
                      </span>
                      <span className={"text-label-md text-on-surface-variant"}>
                        {actions.text("Completed")}
                      </span>
                    </div>

                    <div className={"flex flex-col items-center text-center"}>
                      <div
                        className={
                          "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-md text-body-sm shadow-sm mb-2"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-sm font-medium text-on-surface"}
                      >
                        {actions.text("Submitted")}
                      </span>
                      <span className={"text-label-md text-on-surface-variant"}>
                        {actions.text("Oct 12")}
                      </span>
                    </div>

                    <div className={"flex flex-col items-center text-center"}>
                      <div
                        className={
                          "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-md text-body-sm shadow-sm mb-2"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-sm font-medium text-on-surface"}
                      >
                        {actions.text("Review")}
                      </span>
                      <span className={"text-label-md text-on-surface-variant"}>
                        {actions.text("Security Audit")}
                      </span>
                    </div>

                    <div
                      className={
                        "flex flex-col items-center text-center opacity-50"
                      }
                    >
                      <div
                        className={
                          "w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-code-md text-body-sm mb-2"
                        }
                      >
                        {actions.text("\n                4\n              ")}
                      </div>
                      <span
                        className={
                          "text-body-sm font-medium text-on-surface-variant"
                        }
                      >
                        {actions.text("Approved")}
                      </span>
                      <span className={"text-label-md text-on-surface-variant"}>
                        {actions.text("Pending Fix")}
                      </span>
                    </div>

                    <div
                      className={
                        "flex flex-col items-center text-center opacity-50"
                      }
                    >
                      <div
                        className={
                          "w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-code-md text-body-sm mb-2"
                        }
                      >
                        {actions.text("\n                5\n              ")}
                      </div>
                      <span
                        className={
                          "text-body-sm font-medium text-on-surface-variant"
                        }
                      >
                        {actions.text("Published")}
                      </span>
                      <span className={"text-label-md text-on-surface-variant"}>
                        {actions.text("Marketplace")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "bg-surface-container-low rounded-2xl p-6 shadow-sm border-l-4 border-error"
                }
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <div className={"flex items-center gap-3"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[20px]"}
                      >
                        {"rate_review"}
                      </span>
                    </div>
                    <div>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Admin Reviewer Feedback")}
                      </h3>
                      <span className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Reviewed by Security & Compliance Team • 2 hours ago",
                        )}
                      </span>
                    </div>
                  </div>
                  <span
                    className={
                      "px-3 py-1 bg-error-container text-on-error-container text-label-md font-medium rounded-full"
                    }
                  >
                    {actions.text("Action Required")}
                  </span>
                </div>
                <div
                  className={
                    "bg-surface rounded-xl p-4 mb-4 text-body-md text-on-surface leading-relaxed"
                  }
                >
                  <p className={"font-medium text-error mb-1"}>
                    {actions.text(
                      "Reason for Rejection / Modification Request:",
                    )}
                  </p>
                  {actions.text('\n          "The endpoint ')}
                  <code
                    className={
                      "px-1.5 py-0.5 bg-surface-container rounded font-code-md text-body-sm"
                    }
                  >
                    {"/v2/analytics/stream"}
                  </code>
                  {actions.text(
                    ' transmits unencrypted PII payloads in the header parameters. Additionally, rate-limiting tiers are missing custom header fallback options. Please patch these vulnerabilities and update your data-classification manifest."\n        ',
                  )}
                </div>
                <div className={"space-y-3 mb-6"}>
                  <div
                    className={
                      "text-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    {actions.text("Required Corrections Checklist")}
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error text-[18px]"
                        }
                      >
                        {"cancel"}
                      </span>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text(
                          "Encrypt header payload for PII data fields",
                        )}
                      </span>
                    </div>
                    <span
                      className={
                        "text-label-md text-error bg-error-container px-2 py-0.5 rounded"
                      }
                    >
                      {actions.text("Pending fix")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error text-[18px]"
                        }
                      >
                        {"cancel"}
                      </span>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text(
                          "Add X-RateLimit-Fallback header documentation",
                        )}
                      </span>
                    </div>
                    <span
                      className={
                        "text-label-md text-error bg-error-container px-2 py-0.5 rounded"
                      }
                    >
                      {actions.text("Pending fix")}
                    </span>
                  </div>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[18px]"
                        }
                      >
                        {"check_circle"}
                      </span>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Update Terms of Service agreement hash")}
                      </span>
                    </div>
                    <span
                      className={
                        "text-label-md text-primary bg-primary-container/20 px-2 py-0.5 rounded"
                      }
                    >
                      {actions.text("Completed")}
                    </span>
                  </div>
                </div>
                <div className={"flex items-center justify-end gap-3 pt-2"}>
                  <button
                    data-action-text={"View Diff Report"}
                    className={
                      "px-4 py-2 bg-surface text-on-surface border border-outline-variant/50 rounded-xl text-body-md font-medium hover:bg-surface-container-high transition-all"
                    }
                    type="button"
                    aria-label={actions.text("View Diff Report")}
                  >
                    {actions.text("\n            View Diff Report\n          ")}
                  </button>
                  <button
                    data-action-text={"edit_note Edit & Resubmit for Review"}
                    className={
                      "px-5 py-2 bg-primary text-on-primary rounded-xl text-body-md font-medium hover:bg-primary-container transition-all flex items-center gap-2 shadow-sm"
                    }
                    type="button"
                    aria-label={actions.text("Edit & Resubmit for Review")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"edit_note"}
                    </span>
                    <span>{actions.text("Edit & Resubmit for Review")}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={"lg:col-span-5 space-y-6"}>
              <div
                className={"bg-surface-container-low rounded-2xl p-6 shadow-sm"}
              >
                <div className={"flex items-center justify-between mb-4"}>
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Readiness Checklist")}
                  </h3>
                  <span
                    className={
                      "text-label-md font-code-md text-primary bg-primary-container/20 px-2.5 py-1 rounded-full"
                    }
                  >
                    {actions.text("5/6 Complete")}
                  </span>
                </div>
                <p className={"text-body-sm text-on-surface-variant mb-6"}>
                  {actions.text(
                    "All items must pass validation before submitting to the Admin queue for final publication.",
                  )}
                </p>
                <div className={"space-y-3"}>
                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Documentation Completeness")}
                      </span>
                    </div>
                    <span
                      className={
                        "text-label-md text-on-surface-variant font-code-md"
                      }
                    >
                      {actions.text("100% Spec")}
                    </span>
                  </div>

                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Endpoint Validation Result")}
                      </span>
                    </div>
                    <span className={"text-label-md text-primary font-code-md"}>
                      {actions.text("Passed 24/24")}
                    </span>
                  </div>

                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Provider Verification Result")}
                      </span>
                    </div>
                    <span className={"text-label-md text-primary font-code-md"}>
                      {actions.text("Verified Tier-2")}
                    </span>
                  </div>

                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Legal & Data Classification")}
                      </span>
                    </div>
                    <span className={"text-label-md text-primary font-code-md"}>
                      {actions.text("GDPR / SOC2")}
                    </span>
                  </div>

                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface rounded-xl"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                      </div>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Domain Verification Result")}
                      </span>
                    </div>
                    <span className={"text-label-md text-primary font-code-md"}>
                      {actions.text("api.hyperscale.io")}
                    </span>
                  </div>

                  <div
                    className={
                      "flex items-center justify-between p-3 bg-surface-container-high rounded-xl ring-1 ring-error/30"
                    }
                  >
                    <div className={"flex items-center gap-3"}>
                      <div
                        className={
                          "w-6 h-6 rounded-full bg-error-container text-on-error-container flex items-center justify-center"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"priority_high"}
                        </span>
                      </div>
                      <span
                        className={"text-body-md text-on-surface font-medium"}
                      >
                        {actions.text("Pricing / Plan Completeness")}
                      </span>
                    </div>
                    <span className={"text-label-md text-error font-code-md"}>
                      {actions.text("Missing Tiers")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    "mt-6 pt-4 border-t border-outline-variant/30 flex flex-col gap-3"
                  }
                >
                  <div
                    className={
                      "flex items-center justify-between text-body-sm text-on-surface-variant"
                    }
                  >
                    <span>{actions.text("Strict Admin Enforcement")}</span>
                    <span className={"text-on-surface font-medium"}>
                      {actions.text("Active")}
                    </span>
                  </div>
                  <button
                    data-action-text={"lock Submit for Review (1 item missing)"}
                    className={
                      "w-full py-3 bg-surface-container-high text-on-surface-variant rounded-xl text-body-md font-medium cursor-not-allowed flex items-center justify-center gap-2"
                    }
                    disabled={true}
                    type="button"
                    aria-label={actions.text(
                      "Submit for Review (1 item missing)",
                    )}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"lock"}
                    </span>
                    <span>
                      {actions.text("Submit for Review (1 item missing)")}
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={"bg-surface-container-low rounded-2xl p-6 shadow-sm"}
              >
                <div className={"flex items-center justify-between mb-3"}>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Alternative View: Published")}
                  </h4>
                  <span
                    className={
                      "px-2.5 py-0.5 bg-secondary-container text-on-secondary-container text-label-md font-medium rounded-full"
                    }
                  >
                    {actions.text("Live on Hub")}
                  </span>
                </div>
                <p className={"text-body-sm text-on-surface-variant mb-4"}>
                  {actions.text(
                    "Example of a successfully reviewed and publicly available API listing.",
                  )}
                </p>
                <div className={"p-4 bg-surface rounded-xl space-y-3"}>
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={"text-body-md font-medium text-on-surface"}
                    >
                      {actions.text("Core Telemetry API")}
                    </span>
                    <a
                      data-action-text={"View Marketplace open_in_new"}
                      className={
                        "text-primary text-body-sm font-medium flex items-center gap-1 hover:underline"
                      }
                      href={"#"}
                    >
                      <span>{actions.text("View Marketplace")}</span>
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[14px]"}
                      >
                        {"open_in_new"}
                      </span>
                    </a>
                  </div>
                  <div
                    className={
                      "flex items-center gap-4 text-label-md text-on-surface-variant"
                    }
                  >
                    <span>{actions.text("Global Uptime: 99.99%")}</span>
                    <span>{actions.text("•")}</span>
                    <span>{actions.text("1.2M req/day")}</span>
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
