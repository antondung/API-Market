import { useScreenActions } from "../features/screen-actions";
export default function Screen3() {
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
              "px-space-gutter pt-space-lg pb-space-md grid grid-cols-1 md:grid-cols-4 gap-space-md"
            }
          >
            <div
              className={
                "bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm"
              }
            >
              <div>
                <div
                  className={
                    "text-label-md uppercase tracking-wider text-on-surface-variant font-medium"
                  }
                >
                  {actions.text("Pending Review")}
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("24")}
                </div>
                <div
                  className={
                    "text-body-sm text-primary mt-1 flex items-center gap-1 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px]"}
                  >
                    {"trending_up"}
                  </span>
                  {actions.text(" +12% this week\n        ")}
                </div>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"hourglass_top"}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm"
              }
            >
              <div>
                <div
                  className={
                    "text-label-md uppercase tracking-wider text-on-surface-variant font-medium"
                  }
                >
                  {actions.text("Under Investigation")}
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("7")}
                </div>
                <div className={"text-body-sm text-on-surface-variant mt-1"}>
                  {actions.text("SLA: 4 hours left")}
                </div>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"fact_check"}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm"
              }
            >
              <div>
                <div
                  className={
                    "text-label-md uppercase tracking-wider text-on-surface-variant font-medium"
                  }
                >
                  {actions.text("Approved Providers")}
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface mt-1"
                  }
                >
                  {actions.text("1,429")}
                </div>
                <div
                  className={
                    "text-body-sm text-emerald-600 mt-1 flex items-center gap-1 font-medium"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[14px]"}
                  >
                    {"verified"}
                  </span>
                  {actions.text(" 99.4% compliant\n        ")}
                </div>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"verified_user"}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-low p-space-md rounded-xl flex items-center justify-between shadow-sm"
              }
            >
              <div>
                <div
                  className={
                    "text-label-md uppercase tracking-wider text-on-surface-variant font-medium"
                  }
                >
                  {actions.text("Flagged / Suspended")}
                </div>
                <div
                  className={
                    "text-headline-md font-headline-md text-error mt-1"
                  }
                >
                  {actions.text("3")}
                </div>
                <div className={"text-body-sm text-error mt-1"}>
                  {actions.text("Immediate action req.")}
                </div>
              </div>
              <div
                className={
                  "w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[24px]"}
                >
                  {"gpp_bad"}
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              "px-space-gutter grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start"
            }
          >
            <div
              className={
                "xl:col-span-7 bg-surface-container-low rounded-xl shadow-sm overflow-hidden flex flex-col"
              }
            >
              <div
                className={
                  "p-space-md bg-surface-container-low flex flex-col gap-space-md"
                }
              >
                <div className={"flex items-center justify-between"}>
                  <div>
                    <h2
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Verification Queue")}
                    </h2>
                    <p className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Review entity details, corporate validation, and compliance evidence.",
                      )}
                    </p>
                  </div>
                  <button
                    data-action-text={"tune Advanced Filter"}
                    className={
                      "px-space-md py-space-xs bg-primary-container text-on-primary-container rounded-xl text-body-sm font-medium hover:opacity-90 transition-all flex items-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Advanced Filter")}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[16px]"}
                    >
                      {"tune"}
                    </span>
                    {actions.text("\n            Advanced Filter\n          ")}
                  </button>
                </div>

                <div
                  id={"filter-tabs"}
                  className={
                    actions.visible("filter-tabs", true)
                      ? "flex items-center gap-space-xs overflow-x-auto pb-1"
                      : "flex items-center gap-space-xs overflow-x-auto pb-1 hidden"
                  }
                >
                  <button
                    data-action-text={"All (34)"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium bg-primary text-on-primary transition-all"
                    }
                    type="button"
                    aria-label={actions.text("All (34)")}
                    data-handler={"filterQueue('all')"}
                  >
                    {actions.text("All (34)")}
                  </button>
                  <button
                    data-action-text={"Pending (24)"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Pending (24)")}
                    data-handler={"filterQueue('pending')"}
                  >
                    {actions.text("Pending (24)")}
                  </button>
                  <button
                    data-action-text={"Under Review (7)"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Under Review (7)")}
                    data-handler={"filterQueue('review')"}
                  >
                    {actions.text("Under Review (7)")}
                  </button>
                  <button
                    data-action-text={"Approved"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Approved")}
                    data-handler={"filterQueue('approved')"}
                  >
                    {actions.text("Approved")}
                  </button>
                  <button
                    data-action-text={"Suspended (3)"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
                    }
                    type="button"
                    aria-label={actions.text("Suspended (3)")}
                    data-handler={"filterQueue('flagged')"}
                  >
                    {actions.text("Suspended (3)")}
                  </button>
                </div>
              </div>

              <div
                className={
                  "divide-y divide-outline-variant/20 max-h-[700px] overflow-y-auto"
                }
                id={"provider-queue-list"}
              >
                <div
                  data-action-text={
                    "AC Acme FinTech Corp Organization acmefintech.io • Submitted Oct 24, 2023 Pending Risk Score: Low"
                  }
                  className={
                    "provider-item p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-all flex items-center justify-between border-l-4 border-primary"
                  }
                  data-status={"pending"}
                  data-handler={"selectProvider('acme')"}
                  role="button"
                  tabIndex={0}
                >
                  <div className={"flex items-center gap-space-md"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-primary"
                      }
                    >
                      {actions.text("\n              AC\n            ")}
                    </div>
                    <div>
                      <div className={"flex items-center gap-space-sm"}>
                        <span
                          className={
                            "font-headline-sm text-on-surface text-body-lg"
                          }
                        >
                          {actions.text("Acme FinTech Corp")}
                        </span>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-secondary-container text-on-secondary-container font-medium"
                          }
                        >
                          {actions.text("Organization")}
                        </span>
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant flex items-center gap-space-sm mt-0.5"
                        }
                      >
                        <span>{actions.text("acmefintech.io")}</span>
                        <span>{actions.text("•")}</span>
                        <span>{actions.text("Submitted Oct 24, 2023")}</span>
                      </div>
                    </div>
                  </div>
                  <div className={"flex flex-col items-end gap-space-xs"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full text-label-md bg-amber-100 text-amber-800 font-medium flex items-center gap-1"
                      }
                    >
                      <span
                        className={"w-1.5 h-1.5 rounded-full bg-amber-500"}
                      ></span>
                      {actions.text(" Pending\n            ")}
                    </span>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Risk Score: Low")}
                    </span>
                  </div>
                </div>

                <div
                  data-action-text={
                    "NE Nexus AI Labs Organization nexuslabs.ai • Submitted Oct 22, 2023 Under Review Compliance Flag"
                  }
                  className={
                    "provider-item p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-all flex items-center justify-between border-l-4 border-indigo-400"
                  }
                  data-status={"review"}
                  data-handler={"selectProvider('nexus')"}
                  role="button"
                  tabIndex={0}
                >
                  <div className={"flex items-center gap-space-md"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-primary"
                      }
                    >
                      {actions.text("\n              NE\n            ")}
                    </div>
                    <div>
                      <div className={"flex items-center gap-space-sm"}>
                        <span
                          className={
                            "font-headline-sm text-on-surface text-body-lg"
                          }
                        >
                          {actions.text("Nexus AI Labs")}
                        </span>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-secondary-container text-on-secondary-container font-medium"
                          }
                        >
                          {actions.text("Organization")}
                        </span>
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant flex items-center gap-space-sm mt-0.5"
                        }
                      >
                        <span>{actions.text("nexuslabs.ai")}</span>
                        <span>{actions.text("•")}</span>
                        <span>{actions.text("Submitted Oct 22, 2023")}</span>
                      </div>
                    </div>
                  </div>
                  <div className={"flex flex-col items-end gap-space-xs"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full text-label-md bg-indigo-100 text-indigo-800 font-medium flex items-center gap-1"
                      }
                    >
                      <span
                        className={"w-1.5 h-1.5 rounded-full bg-indigo-500"}
                      ></span>
                      {actions.text(" Under Review\n            ")}
                    </span>
                    <span className={"text-body-sm text-amber-600 font-medium"}>
                      {actions.text("Compliance Flag")}
                    </span>
                  </div>
                </div>

                <div
                  data-action-text={
                    "QP Quantum Pay Ltd Organization quantumpay.biz • Submitted Sep 15, 2023 Suspended Abuse Reports"
                  }
                  className={
                    "provider-item p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-all flex items-center justify-between border-l-4 border-error"
                  }
                  data-status={"flagged"}
                  data-handler={"selectProvider('quantum')"}
                  role="button"
                  tabIndex={0}
                >
                  <div className={"flex items-center gap-space-md"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-error-container flex items-center justify-center font-headline-sm text-error"
                      }
                    >
                      {actions.text("\n              QP\n            ")}
                    </div>
                    <div>
                      <div className={"flex items-center gap-space-sm"}>
                        <span
                          className={
                            "font-headline-sm text-on-surface text-body-lg"
                          }
                        >
                          {actions.text("Quantum Pay Ltd")}
                        </span>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-secondary-container text-on-secondary-container font-medium"
                          }
                        >
                          {actions.text("Organization")}
                        </span>
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant flex items-center gap-space-sm mt-0.5"
                        }
                      >
                        <span>{actions.text("quantumpay.biz")}</span>
                        <span>{actions.text("•")}</span>
                        <span>{actions.text("Submitted Sep 15, 2023")}</span>
                      </div>
                    </div>
                  </div>
                  <div className={"flex flex-col items-end gap-space-xs"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full text-label-md bg-error-container text-on-error-container font-medium flex items-center gap-1"
                      }
                    >
                      <span
                        className={"w-1.5 h-1.5 rounded-full bg-error"}
                      ></span>
                      {actions.text(" Suspended\n            ")}
                    </span>
                    <span className={"text-body-sm text-error font-medium"}>
                      {actions.text("Abuse Reports")}
                    </span>
                  </div>
                </div>

                <div
                  data-action-text={
                    "SJ Sarah Jenkins Individual sarahjenkins.dev • Submitted Oct 24, 2023 Pending Risk Score: Minimal"
                  }
                  className={
                    "provider-item p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-all flex items-center justify-between border-l-4 border-primary"
                  }
                  data-status={"pending"}
                  data-handler={"selectProvider('sarah')"}
                  role="button"
                  tabIndex={0}
                >
                  <div className={"flex items-center gap-space-md"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-sm text-primary"
                      }
                    >
                      {actions.text("\n              SJ\n            ")}
                    </div>
                    <div>
                      <div className={"flex items-center gap-space-sm"}>
                        <span
                          className={
                            "font-headline-sm text-on-surface text-body-lg"
                          }
                        >
                          {actions.text("Sarah Jenkins")}
                        </span>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-surface-container-high text-on-surface font-medium"
                          }
                        >
                          {actions.text("Individual")}
                        </span>
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant flex items-center gap-space-sm mt-0.5"
                        }
                      >
                        <span>{actions.text("sarahjenkins.dev")}</span>
                        <span>{actions.text("•")}</span>
                        <span>{actions.text("Submitted Oct 24, 2023")}</span>
                      </div>
                    </div>
                  </div>
                  <div className={"flex flex-col items-end gap-space-xs"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full text-label-md bg-amber-100 text-amber-800 font-medium flex items-center gap-1"
                      }
                    >
                      <span
                        className={"w-1.5 h-1.5 rounded-full bg-amber-500"}
                      ></span>
                      {actions.text(" Pending\n            ")}
                    </span>
                    <span className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Risk Score: Minimal")}
                    </span>
                  </div>
                </div>

                <div
                  data-action-text={
                    "CS CloudScale API Inc Organization cloudscale.io • Submitted Oct 10, 2023 Approved Verified Enterprise"
                  }
                  className={
                    "provider-item p-space-md bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-all flex items-center justify-between border-l-4 border-emerald-500"
                  }
                  data-status={"approved"}
                  data-handler={"selectProvider('cloud')"}
                  role="button"
                  tabIndex={0}
                >
                  <div className={"flex items-center gap-space-md"}>
                    <div
                      className={
                        "w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-headline-sm text-emerald-800"
                      }
                    >
                      {actions.text("\n              CS\n            ")}
                    </div>
                    <div>
                      <div className={"flex items-center gap-space-sm"}>
                        <span
                          className={
                            "font-headline-sm text-on-surface text-body-lg"
                          }
                        >
                          {actions.text("CloudScale API Inc")}
                        </span>
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-label-md bg-secondary-container text-on-secondary-container font-medium"
                          }
                        >
                          {actions.text("Organization")}
                        </span>
                      </div>
                      <div
                        className={
                          "text-body-sm text-on-surface-variant flex items-center gap-space-sm mt-0.5"
                        }
                      >
                        <span>{actions.text("cloudscale.io")}</span>
                        <span>{actions.text("•")}</span>
                        <span>{actions.text("Submitted Oct 10, 2023")}</span>
                      </div>
                    </div>
                  </div>
                  <div className={"flex flex-col items-end gap-space-xs"}>
                    <span
                      className={
                        "px-2.5 py-1 rounded-full text-label-md bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1"
                      }
                    >
                      <span
                        className={"w-1.5 h-1.5 rounded-full bg-emerald-500"}
                      ></span>
                      {actions.text(" Approved\n            ")}
                    </span>
                    <span
                      className={"text-body-sm text-emerald-700 font-medium"}
                    >
                      {actions.text("Verified Enterprise")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              id={"provider-detail-panel"}
              className={
                actions.visible("provider-detail-panel", true)
                  ? "xl:col-span-5 bg-surface-container-low rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg sticky top-20"
                  : "xl:col-span-5 bg-surface-container-low rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg sticky top-20 hidden"
              }
            >
              <div className={"flex items-start justify-between"}>
                <div className={"flex items-center gap-space-md"}>
                  <div
                    className={
                      "w-14 h-14 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center text-headline-md font-headline-md"
                    }
                    id={"detail-avatar"}
                  >
                    {actions.text("\n            AC\n          ")}
                  </div>
                  <div>
                    <div className={"flex items-center gap-space-sm"}>
                      <h3
                        className={
                          "text-headline-md font-headline-md text-on-surface"
                        }
                        id={"detail-name"}
                      >
                        {actions.text("Acme FinTech Corp")}
                      </h3>
                      <span
                        className={
                          "px-2 py-0.5 rounded-full text-label-md bg-secondary-container text-on-secondary-container font-medium"
                        }
                        id={"detail-badge"}
                      >
                        {actions.text("Organization")}
                      </span>
                    </div>
                    <p
                      className={"text-body-sm text-primary font-mono mt-0.5"}
                      id={"detail-domain"}
                    >
                      {actions.text("https://acmefintech.io")}
                    </p>
                  </div>
                </div>
                <div
                  className={
                    "px-3 py-1 rounded-full text-label-md bg-amber-100 text-amber-800 font-medium flex items-center gap-1"
                  }
                  id={"detail-status-pill"}
                >
                  <span className={"w-2 h-2 rounded-full bg-amber-500"}></span>
                  {actions.text(" Pending Review\n        ")}
                </div>
              </div>

              <div
                className={
                  "flex border-b border-outline-variant/30 gap-space-lg text-body-md font-medium text-on-surface-variant"
                }
              >
                <button
                  data-action-text={"Overview"}
                  className={
                    "detail-tab pb-2 border-b-2 border-primary text-primary transition-all"
                  }
                  data-target={"tab-overview"}
                  type="button"
                  aria-label={actions.text("Overview")}
                  data-handler={"switchDetailTab('overview')"}
                >
                  {actions.text("Overview")}
                </button>
                <button
                  data-action-text={"Evidence (3)"}
                  className={
                    "detail-tab pb-2 border-b-2 border-transparent hover:text-on-surface transition-all"
                  }
                  data-target={"tab-evidence"}
                  type="button"
                  aria-label={actions.text("Evidence (3)")}
                  data-handler={"switchDetailTab('evidence')"}
                >
                  {actions.text("Evidence (3)")}
                </button>
                <button
                  data-action-text={"APIs (4)"}
                  className={
                    "detail-tab pb-2 border-b-2 border-transparent hover:text-on-surface transition-all"
                  }
                  data-target={"tab-apis"}
                  type="button"
                  aria-label={actions.text("APIs (4)")}
                  data-handler={"switchDetailTab('apis')"}
                >
                  {actions.text("APIs (4)")}
                </button>
                <button
                  data-action-text={"Audit Trail"}
                  className={
                    "detail-tab pb-2 border-b-2 border-transparent hover:text-on-surface transition-all"
                  }
                  data-target={"tab-history"}
                  type="button"
                  aria-label={actions.text("Audit Trail")}
                  data-handler={"switchDetailTab('history')"}
                >
                  {actions.text("Audit Trail")}
                </button>
              </div>

              <div
                id={"tab-overview"}
                className={
                  actions.visible("tab-overview", true)
                    ? "detail-content flex flex-col gap-space-md"
                    : "detail-content flex flex-col gap-space-md hidden"
                }
              >
                <div
                  className={
                    "grid grid-cols-2 gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm"
                  }
                >
                  <div>
                    <div
                      className={
                        "text-label-md text-on-surface-variant uppercase"
                      }
                    >
                      {actions.text("Primary Contact")}
                    </div>
                    <div
                      className={
                        "text-body-md font-medium text-on-surface mt-1"
                      }
                      id={"detail-contact"}
                    >
                      {actions.text("Marcus Vance (CTO)")}
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("m.vance@acmefintech.io")}
                    </div>
                  </div>
                  <div>
                    <div
                      className={
                        "text-label-md text-on-surface-variant uppercase"
                      }
                    >
                      {actions.text("Registration No.")}
                    </div>
                    <div
                      className={"text-body-md font-mono text-on-surface mt-1"}
                      id={"detail-reg"}
                    >
                      {actions.text("DE-9948201-B")}
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text("Delaware, USA")}
                    </div>
                  </div>
                </div>

                <div
                  className={
                    "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <span
                      className={
                        "text-headline-sm font-headline-sm text-on-surface flex items-center gap-space-sm"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[20px]"
                        }
                      >
                        {"security"}
                      </span>
                      {actions.text(
                        "\n              Compliance & Risk Scan\n            ",
                      )}
                    </span>
                    <span
                      className={
                        "px-2 py-0.5 rounded text-label-md bg-emerald-100 text-emerald-800 font-medium"
                      }
                    >
                      {actions.text("Passed 5/5 checks")}
                    </span>
                  </div>
                  <div
                    className={
                      "space-y-space-xs text-body-sm text-on-surface-variant"
                    }
                  >
                    <div
                      className={
                        "flex items-center justify-between py-1 border-b border-outline-variant/10"
                      }
                    >
                      <span>
                        {actions.text(
                          "Domain WHOIS & SSL Certificate Validation",
                        )}
                      </span>
                      <span
                        className={
                          "text-emerald-600 font-medium flex items-center gap-1"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                        {actions.text(" Valid")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between py-1 border-b border-outline-variant/10"
                      }
                    >
                      <span>
                        {actions.text("Sanctions & Watchlist Screen (OFAC)")}
                      </span>
                      <span
                        className={
                          "text-emerald-600 font-medium flex items-center gap-1"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                        {actions.text(" Clear")}
                      </span>
                    </div>
                    <div className={"flex items-center justify-between py-1"}>
                      <span>
                        {actions.text("Malware / Threat Intelligence Scan")}
                      </span>
                      <span
                        className={
                          "text-emerald-600 font-medium flex items-center gap-1"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[14px]"}
                        >
                          {"check"}
                        </span>
                        {actions.text(" Clean")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={"flex flex-col gap-space-xs"}>
                  <label
                    className={
                      "text-label-md uppercase tracking-wider text-on-surface-variant font-medium"
                    }
                  >
                    {actions.text("Admin Internal Notes")}
                  </label>
                  <textarea
                    data-source-placeholder={
                      "Add compliance observations, risk notes, or interview details..."
                    }
                    className={
                      "w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-space-md text-body-md text-on-surface outline-none focus:border-primary transition-all h-20 resize-none"
                    }
                    placeholder={actions.text(
                      "Add compliance observations, risk notes, or interview details...",
                    )}
                    aria-label={actions.text(
                      "Add compliance observations, risk notes, or interview details...",
                    )}
                    defaultValue={""}
                  ></textarea>
                </div>
              </div>

              <div
                id={"tab-evidence"}
                className={
                  actions.visible("tab-evidence", false)
                    ? "detail-content flex flex-col gap-space-md"
                    : "detail-content flex flex-col gap-space-md hidden"
                }
              >
                <div className={"space-y-space-sm"}>
                  <div
                    className={
                      "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-space-md"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[28px]"
                        }
                      >
                        {"description"}
                      </span>
                      <div>
                        <div
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Articles_of_Incorporation_Signed.pdf")}
                        </div>
                        <div className={"text-body-sm text-on-surface-variant"}>
                          {actions.text("Uploaded 2 days ago • 2.4 MB")}
                        </div>
                      </div>
                    </div>
                    <button
                      data-action-text={"View"}
                      className={
                        "px-space-md py-space-xs bg-surface-container text-on-surface rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all"
                      }
                      type="button"
                      aria-label={actions.text("View")}
                    >
                      {actions.text("View")}
                    </button>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-space-md"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[28px]"
                        }
                      >
                        {"badge"}
                      </span>
                      <div>
                        <div
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("Director_ID_Verification.pdf")}
                        </div>
                        <div className={"text-body-sm text-on-surface-variant"}>
                          {actions.text("Uploaded 2 days ago • 1.1 MB")}
                        </div>
                      </div>
                    </div>
                    <button
                      data-action-text={"View"}
                      className={
                        "px-space-md py-space-xs bg-surface-container text-on-surface rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition-all"
                      }
                      type="button"
                      aria-label={actions.text("View")}
                    >
                      {actions.text("View")}
                    </button>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
                    }
                  >
                    <div className={"flex items-center gap-space-md"}>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[28px]"
                        }
                      >
                        {"language"}
                      </span>
                      <div>
                        <div
                          className={"text-body-md font-medium text-on-surface"}
                        >
                          {actions.text("DNS_TXT_Verification_Record")}
                        </div>
                        <div className={"text-body-sm text-on-surface-variant"}>
                          {actions.text("Verified via api-hub-challenge=9821a")}
                        </div>
                      </div>
                    </div>
                    <span
                      className={"text-emerald-600 font-medium text-body-sm"}
                    >
                      {actions.text("Verified")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                id={"tab-apis"}
                className={
                  actions.visible("tab-apis", false)
                    ? "detail-content flex flex-col gap-space-md"
                    : "detail-content flex flex-col gap-space-md hidden"
                }
              >
                <div className={"space-y-space-sm"}>
                  <div
                    className={
                      "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
                    }
                  >
                    <div>
                      <div className={"flex items-center gap-space-sm"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded text-label-md bg-emerald-100 text-emerald-800 font-medium"
                          }
                        >
                          {actions.text("GET")}
                        </span>
                        <span
                          className={
                            "font-headline-sm text-on-surface text-body-md"
                          }
                        >
                          {actions.text("/v1/fx/rates")}
                        </span>
                      </div>
                      <div
                        className={"text-body-sm text-on-surface-variant mt-1"}
                      >
                        {actions.text(
                          "Real-time foreign exchange spot & historical rates",
                        )}
                      </div>
                    </div>
                    <span
                      className={
                        "text-label-md bg-surface-container px-2 py-1 rounded"
                      }
                    >
                      {actions.text("Prod Ready")}
                    </span>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between"
                    }
                  >
                    <div>
                      <div className={"flex items-center gap-space-sm"}>
                        <span
                          className={
                            "px-2 py-0.5 rounded text-label-md bg-blue-100 text-blue-800 font-medium"
                          }
                        >
                          {actions.text("POST")}
                        </span>
                        <span
                          className={
                            "font-headline-sm text-on-surface text-body-md"
                          }
                        >
                          {actions.text("/v1/payments/initiate")}
                        </span>
                      </div>
                      <div
                        className={"text-body-sm text-on-surface-variant mt-1"}
                      >
                        {actions.text("Secure cross-border settlement gateway")}
                      </div>
                    </div>
                    <span
                      className={
                        "text-label-md bg-amber-100 text-amber-800 px-2 py-1 rounded"
                      }
                    >
                      {actions.text("Sandbox Only")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                id={"tab-history"}
                className={
                  actions.visible("tab-history", false)
                    ? "detail-content flex flex-col gap-space-md"
                    : "detail-content flex flex-col gap-space-md hidden"
                }
              >
                <div
                  className={
                    "space-y-space-md border-l-2 border-outline-variant/40 pl-space-md ml-space-sm"
                  }
                >
                  <div>
                    <div className={"text-label-md text-primary font-mono"}>
                      {actions.text("Today, 10:42 AM")}
                    </div>
                    <div
                      className={
                        "text-body-md font-medium text-on-surface mt-0.5"
                      }
                    >
                      {actions.text("Automated Compliance Scan Completed")}
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "System verified DNS TXT record and OFAC database. Status: Passed.",
                      )}
                    </div>
                  </div>
                  <div>
                    <div
                      className={
                        "text-label-md text-on-surface-variant font-mono"
                      }
                    >
                      {actions.text("Oct 24, 2023 - 09:15 AM")}
                    </div>
                    <div
                      className={
                        "text-body-md font-medium text-on-surface mt-0.5"
                      }
                    >
                      {actions.text("Application Submitted")}
                    </div>
                    <div className={"text-body-sm text-on-surface-variant"}>
                      {actions.text(
                        "Provider completed onboarding questionnaire and uploaded corporate docs.",
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={
                  "flex flex-col gap-space-sm pt-space-md border-t border-outline-variant/20"
                }
              >
                <div className={"grid grid-cols-2 gap-space-md"}>
                  <button
                    data-action-text={"check_circle Approve Provider"}
                    className={
                      "py-space-md px-space-md bg-primary text-on-primary font-medium rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Approve Provider")}
                    data-handler={"triggerAction('approve')"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"check_circle"}
                    </span>
                    {actions.text("\n            Approve Provider\n          ")}
                  </button>
                  <button
                    data-action-text={"cancel Reject Provider"}
                    className={
                      "py-space-md px-space-md bg-error-container text-on-error-container font-medium rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Reject Provider")}
                    data-handler={"triggerAction('reject')"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"cancel"}
                    </span>
                    {actions.text("\n            Reject Provider\n          ")}
                  </button>
                </div>
                <div className={"grid grid-cols-2 gap-space-md"}>
                  <button
                    data-action-text={"help Request Info"}
                    className={
                      "py-space-sm px-space-md bg-surface-container text-on-surface font-medium rounded-xl hover:bg-surface-container-high transition-all flex items-center justify-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Request Info")}
                    data-handler={"triggerAction('info')"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"help"}
                    </span>
                    {actions.text("\n            Request Info\n          ")}
                  </button>
                  <button
                    data-action-text={"block Suspend"}
                    className={
                      "py-space-sm px-space-md bg-surface-container text-error font-medium rounded-xl hover:bg-surface-container-high transition-all flex items-center justify-center gap-space-xs"
                    }
                    type="button"
                    aria-label={actions.text("Suspend")}
                    data-handler={"triggerAction('suspend')"}
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"block"}
                    </span>
                    {actions.text("\n            Suspend\n          ")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            id={"action-modal"}
            className={
              actions.visible("action-modal", false)
                ? "fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-space-gutter"
                : "fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-space-gutter hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl flex flex-col gap-space-lg animate-in fade-in zoom-in-95 duration-150"
              }
            >
              <div className={"flex items-center justify-between"}>
                <div className={"flex items-center gap-space-sm"}>
                  <div
                    id={"modal-icon-container"}
                    className={
                      actions.visible("modal-icon-container", true)
                        ? "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center"
                        : "w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center hidden"
                    }
                  >
                    <span
                      aria-hidden={true}
                      id={"modal-icon"}
                      className={
                        actions.visible("modal-icon", true)
                          ? "material-symbols-outlined text-[20px]"
                          : "material-symbols-outlined text-[20px] hidden"
                      }
                    >
                      {"verified"}
                    </span>
                  </div>
                  <h3
                    id={"modal-title"}
                    className={
                      actions.visible("modal-title", true)
                        ? "text-headline-md font-headline-md text-on-surface"
                        : "text-headline-md font-headline-md text-on-surface hidden"
                    }
                  >
                    {actions.text("Approve Provider")}
                  </h3>
                </div>
                <button
                  data-action-text={"close"}
                  className={
                    "w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeModal()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>
              <p
                id={"modal-desc"}
                className={
                  actions.visible("modal-desc", true)
                    ? "text-body-md text-on-surface-variant"
                    : "text-body-md text-on-surface-variant hidden"
                }
              >
                {actions.text(
                  "\n        You are about to grant verified provider status to ",
                )}
                <strong className={"text-on-surface"}>
                  {actions.text("Acme FinTech Corp")}
                </strong>
                {actions.text(
                  ". This will enable immediate API publishing privileges to the public marketplace.\n      ",
                )}
              </p>

              <div
                id={"modal-input-container"}
                className={
                  actions.visible("modal-input-container", false)
                    ? "flex flex-col gap-space-xs"
                    : "flex flex-col gap-space-xs hidden"
                }
              >
                <label
                  id={"modal-input-label"}
                  className={
                    actions.visible("modal-input-label", true)
                      ? "text-label-md uppercase tracking-wider text-error font-medium"
                      : "text-label-md uppercase tracking-wider text-error font-medium hidden"
                  }
                >
                  {actions.text("Reason for Rejection (Required)")}
                </label>
                <textarea
                  data-source-placeholder={
                    "Provide clear compliance feedback for the provider..."
                  }
                  id={"modal-reason"}
                  placeholder={actions.text(
                    "Provide clear compliance feedback for the provider...",
                  )}
                  className={
                    actions.visible("modal-reason", true)
                      ? "w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-space-md text-body-md text-on-surface outline-none focus:border-primary transition-all h-24 resize-none"
                      : "w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-space-md text-body-md text-on-surface outline-none focus:border-primary transition-all h-24 resize-none hidden"
                  }
                  defaultValue={""}
                ></textarea>
              </div>

              <div
                className={
                  "flex items-center justify-end gap-space-md pt-space-md border-t border-outline-variant/20"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-space-md py-space-sm bg-surface-container text-on-surface rounded-xl text-body-md font-medium hover:bg-surface-container-high transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeModal()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Confirm Approval"}
                  id={"modal-confirm-btn"}
                  type="button"
                  aria-label={actions.text("Confirm Approval")}
                  data-handler={"confirmAction()"}
                  className={
                    actions.visible("modal-confirm-btn", true)
                      ? "px-space-lg py-space-sm bg-primary text-on-primary rounded-xl text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-space-xs"
                      : "px-space-lg py-space-sm bg-primary text-on-primary rounded-xl text-body-md font-medium hover:opacity-90 transition-all flex items-center gap-space-xs hidden"
                  }
                >
                  {actions.text("\n          Confirm Approval\n        ")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"toast-banner"}
            className={
              actions.visible("toast-banner", false)
                ? "fixed bottom-6 right-6 bg-surface-container-highest text-on-surface p-space-md rounded-xl shadow-lg border border-outline-variant/40 flex items-center gap-space-md z-50 animate-in slide-in-from-bottom-5 duration-200"
                : "fixed bottom-6 right-6 bg-surface-container-highest text-on-surface p-space-md rounded-xl shadow-lg border border-outline-variant/40 flex items-center gap-space-md z-50 animate-in slide-in-from-bottom-5 duration-200 hidden"
            }
          >
            <div
              className={
                "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center"
              }
              id={"toast-icon-wrapper"}
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px]"}
                id={"toast-icon"}
              >
                {"check"}
              </span>
            </div>
            <div>
              <div
                className={"font-headline-sm text-body-md"}
                id={"toast-title"}
              >
                {actions.text("Action Successful")}
              </div>
              <div
                className={"text-body-sm text-on-surface-variant"}
                id={"toast-msg"}
              >
                {actions.text("Audit trail updated with decision record.")}
              </div>
            </div>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
