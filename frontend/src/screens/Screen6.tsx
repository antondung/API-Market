import { useScreenActions } from "../features/screen-actions";
export default function Screen6() {
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
              "px-space-gutter py-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-lg bg-surface-container-low"
            }
          >
            <div>
              <div className={"flex items-center gap-space-sm mb-space-xs"}>
                <span
                  className={
                    "text-label-md uppercase tracking-wider text-primary font-headline-sm"
                  }
                >
                  {actions.text("Directory & Access Control")}
                </span>
                <span className={"text-on-surface-variant/40"}>
                  {actions.text("•")}
                </span>
                <span className={"text-body-sm text-on-surface-variant"}>
                  {actions.text("2,459 Total Users")}
                </span>
              </div>
              <h1
                className={"text-headline-lg font-headline-lg text-on-surface"}
              >
                {actions.text("User Management & Security")}
              </h1>
            </div>
            <div className={"flex items-center gap-space-md"}>
              <button
                data-action-text={"person_add Invite User"}
                className={
                  "flex items-center gap-space-sm bg-primary text-on-primary px-space-md py-space-sm rounded-xl font-headline-sm text-body-md hover:bg-primary/90 transition-all shadow-sm"
                }
                type="button"
                aria-label={actions.text("Invite User")}
                data-handler={"openInviteModal()"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"person_add"}
                </span>
                <span>{actions.text("Invite User")}</span>
              </button>
              <button
                data-action-text={"download Export CSV"}
                className={
                  "flex items-center gap-space-sm bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-sm rounded-xl font-headline-sm text-body-md transition-all"
                }
                type="button"
                aria-label={actions.text("Export CSV")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                <span>{actions.text("Export CSV")}</span>
              </button>
            </div>
          </div>

          <div
            className={
              "px-space-gutter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md -mt-4 mb-space-xl"
            }
          >
            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Active Consumers")}
                </span>
                <span
                  className={
                    "w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"group"}
                  </span>
                </span>
              </div>
              <div className={"flex items-baseline gap-space-sm"}>
                <span
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("1,842")}
                </span>
                <span
                  className={
                    "text-body-sm text-emerald-600 font-medium flex items-center"
                  }
                >
                  {actions.text("+12% this month")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Verified Providers")}
                </span>
                <span
                  className={
                    "w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"api"}
                  </span>
                </span>
              </div>
              <div className={"flex items-baseline gap-space-sm"}>
                <span
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("534")}
                </span>
                <span
                  className={
                    "text-body-sm text-emerald-600 font-medium flex items-center"
                  }
                >
                  {actions.text("+4 new")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Platform Admins")}
                </span>
                <span
                  className={
                    "w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"shield_person"}
                  </span>
                </span>
              </div>
              <div className={"flex items-baseline gap-space-sm"}>
                <span
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("83")}
                </span>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("SEC-02 Compliant")}
                </span>
              </div>
            </div>
            <div
              className={
                "bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={"text-body-sm text-on-surface-variant font-medium"}
                >
                  {actions.text("Suspended Accounts")}
                </span>
                <span
                  className={
                    "w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error"
                  }
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"block"}
                  </span>
                </span>
              </div>
              <div className={"flex items-baseline gap-space-sm"}>
                <span
                  className={"text-headline-md font-headline-md text-error"}
                >
                  {actions.text("12")}
                </span>
                <span className={"text-body-sm text-error/80 font-medium"}>
                  {actions.text("Requires Review")}
                </span>
              </div>
            </div>
          </div>

          <div className={"px-space-gutter"}>
            <div
              className={
                "bg-surface-container-lowest rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden"
              }
            >
              <div
                className={
                  "p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md"
                }
              >
                <div className={"flex flex-wrap items-center gap-space-sm"}>
                  <button
                    data-action-text={"All Users"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium transition-all bg-primary text-on-primary"
                    }
                    data-filter={"all"}
                    type="button"
                    aria-label={actions.text("All Users")}
                    data-handler={"filterTable('all')"}
                  >
                    {actions.text("All Users")}
                  </button>
                  <button
                    data-action-text={"Consumers"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium transition-all bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }
                    data-filter={"consumer"}
                    type="button"
                    aria-label={actions.text("Consumers")}
                    data-handler={"filterTable('consumer')"}
                  >
                    {actions.text("Consumers")}
                  </button>
                  <button
                    data-action-text={"Providers"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium transition-all bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }
                    data-filter={"provider"}
                    type="button"
                    aria-label={actions.text("Providers")}
                    data-handler={"filterTable('provider')"}
                  >
                    {actions.text("Providers")}
                  </button>
                  <button
                    data-action-text={"Admins"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium transition-all bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }
                    data-filter={"admin"}
                    type="button"
                    aria-label={actions.text("Admins")}
                    data-handler={"filterTable('admin')"}
                  >
                    {actions.text("Admins")}
                  </button>
                  <div
                    className={"h-4 w-[1px] bg-outline-variant/40 mx-2"}
                  ></div>
                  <button
                    data-action-text={"Active"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium transition-all bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }
                    data-filter={"active"}
                    type="button"
                    aria-label={actions.text("Active")}
                    data-handler={"filterTable('active')"}
                  >
                    {actions.text("Active")}
                  </button>
                  <button
                    data-action-text={"Suspended"}
                    className={
                      "filter-btn px-space-md py-space-xs rounded-xl text-body-sm font-medium transition-all bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }
                    data-filter={"suspended"}
                    type="button"
                    aria-label={actions.text("Suspended")}
                    data-handler={"filterTable('suspended')"}
                  >
                    {actions.text("Suspended")}
                  </button>
                </div>
                <div className={"flex items-center gap-space-sm"}>
                  <div
                    className={
                      "flex items-center bg-surface-container px-space-md py-space-xs rounded-xl w-72 text-on-surface-variant"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-[18px] mr-space-sm"
                      }
                    >
                      {"search"}
                    </span>
                    <input
                      data-source-placeholder={"Filter by ID, name or email..."}
                      className={
                        "bg-transparent border-none outline-none text-body-md text-on-surface w-full placeholder:text-on-surface-variant/60"
                      }
                      id={"userSearchInput"}
                      placeholder={actions.text(
                        "Filter by ID, name or email...",
                      )}
                      type={"text"}
                    />
                  </div>
                </div>
              </div>

              <div className={"overflow-x-auto"}>
                <table className={"w-full text-left border-collapse"}>
                  <thead>
                    <tr
                      className={
                        "bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider"
                      }
                    >
                      <th className={"py-space-md px-space-lg font-medium"}>
                        {actions.text("User ID & Display Name")}
                      </th>
                      <th className={"py-space-md px-space-lg font-medium"}>
                        {actions.text("Email Address")}
                      </th>
                      <th className={"py-space-md px-space-lg font-medium"}>
                        {actions.text("Assigned Roles")}
                      </th>
                      <th className={"py-space-md px-space-lg font-medium"}>
                        {actions.text("Account Status")}
                      </th>
                      <th className={"py-space-md px-space-lg font-medium"}>
                        {actions.text("Registration Date")}
                      </th>
                      <th className={"py-space-md px-space-lg font-medium"}>
                        {actions.text("Last Activity")}
                      </th>
                      <th
                        className={
                          "py-space-md px-space-lg font-medium text-right"
                        }
                      >
                        {actions.text("Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={
                      "divide-y divide-surface-container text-body-md text-on-surface"
                    }
                  >
                    <tr
                      className={
                        "user-row hover:bg-surface-container-low/50 transition-colors"
                      }
                      data-role={"provider"}
                      data-search={
                        "usr_982341 alexandra chen alexandra.c@nexuscloud.io"
                      }
                      data-status={"active"}
                      data-record="row-0"
                      hidden={
                        !actions.matches(
                          "AC Alexandra Chen usr_982341 alexandra.c@nexuscloud.io Provider +1 Active Oct 14, 2023 2 mins ago visibility block",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-md"}>
                          <div
                            className={
                              "w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-headline-sm text-body-md flex-shrink-0"
                            }
                          >
                            {actions.text("AC")}
                          </div>
                          <div>
                            <div
                              data-action-text={"Alexandra Chen"}
                              className={
                                "font-medium text-on-surface hover:text-primary cursor-pointer"
                              }
                              data-handler={
                                "openUserDrawer('Alexandra Chen', 'usr_982341', 'alexandra.c@nexuscloud.io', 'Provider', 'Active')"
                              }
                              role="button"
                              tabIndex={0}
                            >
                              {actions.text("Alexandra Chen")}
                            </div>
                            <div
                              className={"font-code-sm text-on-surface-variant"}
                            >
                              {actions.text("usr_982341")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text("alexandra.c@nexuscloud.io")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-secondary-container text-on-secondary-container"
                          }
                        >
                          {actions.text("Provider")}
                        </span>
                        <span
                          className={
                            "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-surface-container text-on-surface-variant ml-1"
                          }
                        >
                          {actions.text("+1")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-emerald-50 text-emerald-700"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-0",
                            " Active\n                ",
                          )}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("Oct 14, 2023")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("2 mins ago")}
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"visibility"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openUserDrawer('Alexandra Chen', 'usr_982341', 'alexandra.c@nexuscloud.io', 'Provider', 'Active')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"block"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-error-container/50 flex items-center justify-center text-on-surface-variant hover:text-error transition-all"
                            }
                            title={actions.text("Suspend User")}
                            type="button"
                            aria-label={actions.text("block")}
                            data-handler={
                              "openActionModal('suspend', 'Alexandra Chen', 'usr_982341')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"block"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "user-row hover:bg-surface-container-low/50 transition-colors"
                      }
                      data-role={"admin"}
                      data-search={
                        "usr_104928 marcus vance marcus.v@apihub.internal"
                      }
                      data-status={"active"}
                      data-record="row-1"
                      hidden={
                        !actions.matches(
                          "MV Marcus Vance usr_104928 marcus.v@apihub.internal Admin Active Jan 10, 2023 Just now visibility block",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-md"}>
                          <div
                            className={
                              "w-10 h-10 rounded-full bg-on-primary-fixed text-on-primary flex items-center justify-center font-headline-sm text-body-md flex-shrink-0"
                            }
                          >
                            {actions.text("MV")}
                          </div>
                          <div>
                            <div
                              data-action-text={"Marcus Vance"}
                              className={
                                "font-medium text-on-surface hover:text-primary cursor-pointer"
                              }
                              data-handler={
                                "openUserDrawer('Marcus Vance', 'usr_104928', 'marcus.v@apihub.internal', 'Platform Admin', 'Active')"
                              }
                              role="button"
                              tabIndex={0}
                            >
                              {actions.text("Marcus Vance")}
                            </div>
                            <div
                              className={"font-code-sm text-on-surface-variant"}
                            >
                              {actions.text("usr_104928")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text("marcus.v@apihub.internal")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-primary-fixed text-on-primary-fixed"
                          }
                        >
                          {actions.text("Admin")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-emerald-50 text-emerald-700"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-1",
                            " Active\n                ",
                          )}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("Jan 10, 2023")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("Just now")}
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"visibility"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openUserDrawer('Marcus Vance', 'usr_104928', 'marcus.v@apihub.internal', 'Platform Admin', 'Active')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"block"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-error-container/50 flex items-center justify-center text-on-surface-variant hover:text-error transition-all"
                            }
                            title={actions.text("Suspend User")}
                            type="button"
                            aria-label={actions.text("block")}
                            data-handler={
                              "openActionModal('suspend', 'Marcus Vance', 'usr_104928')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"block"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "user-row hover:bg-surface-container-low/50 transition-colors"
                      }
                      data-role={"consumer"}
                      data-search={
                        "usr_554192 sarah jennings sarah.j@fintechlab.co"
                      }
                      data-status={"suspended"}
                      data-record="row-2"
                      hidden={
                        !actions.matches(
                          "SJ Sarah Jennings usr_554192 sarah.j@fintechlab.co Consumer Suspended Nov 22, 2023 3 days ago visibility settings_backup_restore",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-md"}>
                          <div
                            className={
                              "w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-headline-sm text-body-md flex-shrink-0"
                            }
                          >
                            {actions.text("SJ")}
                          </div>
                          <div>
                            <div
                              data-action-text={"Sarah Jennings"}
                              className={
                                "font-medium text-on-surface hover:text-primary cursor-pointer"
                              }
                              data-handler={
                                "openUserDrawer('Sarah Jennings', 'usr_554192', 'sarah.j@fintechlab.co', 'Consumer', 'Suspended')"
                              }
                              role="button"
                              tabIndex={0}
                            >
                              {actions.text("Sarah Jennings")}
                            </div>
                            <div
                              className={"font-code-sm text-on-surface-variant"}
                            >
                              {actions.text("usr_554192")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text("sarah.j@fintechlab.co")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-surface-container text-on-surface-variant"
                          }
                        >
                          {actions.text("Consumer")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-error-container text-on-error-container"
                          }
                        >
                          <span
                            className={"w-1.5 h-1.5 rounded-full bg-error"}
                          ></span>
                          {actions.recordText(
                            "row-2",
                            " Suspended\n                ",
                          )}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("Nov 22, 2023")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("3 days ago")}
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"visibility"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openUserDrawer('Sarah Jennings', 'usr_554192', 'sarah.j@fintechlab.co', 'Consumer', 'Suspended')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"settings_backup_restore"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-on-surface-variant hover:text-emerald-600 transition-all"
                            }
                            title={actions.text("Restore User")}
                            type="button"
                            aria-label={actions.text("settings_backup_restore")}
                            data-handler={
                              "openActionModal('restore', 'Sarah Jennings', 'usr_554192')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"settings_backup_restore"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "user-row hover:bg-surface-container-low/50 transition-colors"
                      }
                      data-role={"consumer"}
                      data-search={"usr_883419 david kim david@datasync.io"}
                      data-status={"active"}
                      data-record="row-3"
                      hidden={
                        !actions.matches(
                          "DK David Kim usr_883419 david@datasync.io Consumer Active Dec 01, 2023 1 hour ago visibility block",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-md"}>
                          <div
                            className={
                              "w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-headline-sm text-body-md flex-shrink-0"
                            }
                          >
                            {actions.text("DK")}
                          </div>
                          <div>
                            <div
                              data-action-text={"David Kim"}
                              className={
                                "font-medium text-on-surface hover:text-primary cursor-pointer"
                              }
                              data-handler={
                                "openUserDrawer('David Kim', 'usr_883419', 'david@datasync.io', 'Consumer', 'Active')"
                              }
                              role="button"
                              tabIndex={0}
                            >
                              {actions.text("David Kim")}
                            </div>
                            <div
                              className={"font-code-sm text-on-surface-variant"}
                            >
                              {actions.text("usr_883419")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text("david@datasync.io")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-surface-container text-on-surface-variant"
                          }
                        >
                          {actions.text("Consumer")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-emerald-50 text-emerald-700"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-3",
                            " Active\n                ",
                          )}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("Dec 01, 2023")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("1 hour ago")}
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"visibility"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openUserDrawer('David Kim', 'usr_883419', 'david@datasync.io', 'Consumer', 'Active')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"block"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-error-container/50 flex items-center justify-center text-on-surface-variant hover:text-error transition-all"
                            }
                            title={actions.text("Suspend User")}
                            type="button"
                            aria-label={actions.text("block")}
                            data-handler={
                              "openActionModal('suspend', 'David Kim', 'usr_883419')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"block"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      className={
                        "user-row hover:bg-surface-container-low/50 transition-colors"
                      }
                      data-role={"provider"}
                      data-search={
                        "usr_331902 elena rostova elena@geospatial.net"
                      }
                      data-status={"active"}
                      data-record="row-4"
                      hidden={
                        !actions.matches(
                          "ER Elena Rostova usr_331902 elena@geospatial.net Provider Active Aug 19, 2023 15 mins ago visibility block",
                        )
                      }
                    >
                      <td className={"py-space-md px-space-lg"}>
                        <div className={"flex items-center gap-space-md"}>
                          <div
                            className={
                              "w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-headline-sm text-body-md flex-shrink-0"
                            }
                          >
                            {actions.text("ER")}
                          </div>
                          <div>
                            <div
                              data-action-text={"Elena Rostova"}
                              className={
                                "font-medium text-on-surface hover:text-primary cursor-pointer"
                              }
                              data-handler={
                                "openUserDrawer('Elena Rostova', 'usr_331902', 'elena@geospatial.net', 'Provider', 'Active')"
                              }
                              role="button"
                              tabIndex={0}
                            >
                              {actions.text("Elena Rostova")}
                            </div>
                            <div
                              className={"font-code-sm text-on-surface-variant"}
                            >
                              {actions.text("usr_331902")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant font-code-md"
                        }
                      >
                        {actions.text("elena@geospatial.net")}
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-secondary-container text-on-secondary-container"
                          }
                        >
                          {actions.text("Provider")}
                        </span>
                      </td>
                      <td className={"py-space-md px-space-lg"}>
                        <span
                          className={
                            "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-emerald-50 text-emerald-700"
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-emerald-600"
                            }
                          ></span>
                          {actions.recordText(
                            "row-4",
                            " Active\n                ",
                          )}
                        </span>
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("Aug 19, 2023")}
                      </td>
                      <td
                        className={
                          "py-space-md px-space-lg text-on-surface-variant"
                        }
                      >
                        {actions.text("15 mins ago")}
                      </td>
                      <td className={"py-space-md px-space-lg text-right"}>
                        <div
                          className={
                            "flex items-center justify-end gap-space-xs"
                          }
                        >
                          <button
                            data-action-text={"visibility"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"
                            }
                            title={actions.text("View Details")}
                            type="button"
                            aria-label={actions.text("View")}
                            data-handler={
                              "openUserDrawer('Elena Rostova', 'usr_331902', 'elena@geospatial.net', 'Provider', 'Active')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"visibility"}
                            </span>
                          </button>
                          <button
                            data-action-text={"block"}
                            className={
                              "w-8 h-8 rounded-lg hover:bg-error-container/50 flex items-center justify-center text-on-surface-variant hover:text-error transition-all"
                            }
                            title={actions.text("Suspend User")}
                            type="button"
                            aria-label={actions.text("block")}
                            data-handler={
                              "openActionModal('suspend', 'Elena Rostova', 'usr_331902')"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={
                                "material-symbols-outlined text-[18px]"
                              }
                            >
                              {"block"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                className={
                  "p-space-lg bg-surface-container-lowest flex items-center justify-between text-body-sm text-on-surface-variant"
                }
              >
                <div>
                  {actions.text("Showing ")}
                  <span className={"font-medium text-on-surface"}>
                    {actions.text("1-5")}
                  </span>
                  {actions.text(" of ")}
                  <span className={"font-medium text-on-surface"}>
                    {actions.text("2,459")}
                  </span>
                  {actions.text(" users")}
                </div>
                <div className={"flex items-center gap-space-sm"}>
                  <button
                    data-action-text={"Previous"}
                    className={
                      "px-space-md py-space-xs rounded-lg bg-surface-container text-on-surface font-medium disabled:opacity-40"
                    }
                    disabled={true}
                    type="button"
                    aria-label={actions.text("Previous")}
                  >
                    {actions.text("Previous")}
                  </button>
                  <button
                    data-action-text={"1"}
                    className={
                      "px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-medium"
                    }
                    type="button"
                    aria-label={actions.text("1")}
                  >
                    {actions.text("1")}
                  </button>
                  <button
                    data-action-text={"2"}
                    className={
                      "px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium"
                    }
                    type="button"
                    aria-label={actions.text("2")}
                  >
                    {actions.text("2")}
                  </button>
                  <button
                    data-action-text={"3"}
                    className={
                      "px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium"
                    }
                    type="button"
                    aria-label={actions.text("3")}
                  >
                    {actions.text("3")}
                  </button>
                  <span className={"px-2"}>{actions.text("...")}</span>
                  <button
                    data-action-text={"492"}
                    className={
                      "px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium"
                    }
                    type="button"
                    aria-label={actions.text("492")}
                  >
                    {actions.text("492")}
                  </button>
                  <button
                    data-action-text={"Next"}
                    className={
                      "px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium"
                    }
                    type="button"
                    aria-label={actions.text("Next")}
                  >
                    {actions.text("Next")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            data-action-text={""}
            id={"userDrawerOverlay"}
            data-handler={"closeUserDrawer()"}
            role="button"
            tabIndex={0}
            className={
              actions.visible("userDrawerOverlay", false)
                ? "fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50 transition-opacity opacity-0"
                : "fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50 transition-opacity opacity-0 hidden"
            }
          ></div>
          <div
            id={"userDrawer"}
            className={
              actions.visible("userDrawer", true)
                ? "fixed top-0 right-0 h-full w-full max-w-xl bg-surface-container-lowest z-50 shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col"
                : "fixed top-0 right-0 h-full w-full max-w-xl bg-surface-container-lowest z-50 shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col hidden"
            }
          >
            <div
              className={
                "p-space-lg border-b border-surface-container flex items-center justify-between bg-surface-container-low"
              }
            >
              <div className={"flex items-center gap-space-md"}>
                <div
                  id={"drawerAvatar"}
                  className={
                    actions.visible("drawerAvatar", true)
                      ? "w-12 h-12 rounded-full bg-primary-fixed text-primary font-headline-md flex items-center justify-center text-body-lg"
                      : "w-12 h-12 rounded-full bg-primary-fixed text-primary font-headline-md flex items-center justify-center text-body-lg hidden"
                  }
                >
                  {actions.text("AC")}
                </div>
                <div>
                  <h2
                    id={"drawerName"}
                    className={
                      actions.visible("drawerName", true)
                        ? "text-headline-sm font-headline-sm text-on-surface"
                        : "text-headline-sm font-headline-sm text-on-surface hidden"
                    }
                  >
                    {actions.text("Alexandra Chen")}
                  </h2>
                  <span
                    id={"drawerId"}
                    className={
                      actions.visible("drawerId", true)
                        ? "text-code-sm text-on-surface-variant font-code-sm"
                        : "text-code-sm text-on-surface-variant font-code-sm hidden"
                    }
                  >
                    {actions.text("usr_982341")}
                  </span>
                </div>
              </div>
              <button
                data-action-text={"close"}
                className={
                  "w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all"
                }
                type="button"
                aria-label={actions.text("Close")}
                data-handler={"closeUserDrawer()"}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[20px]"}
                >
                  {"close"}
                </span>
              </button>
            </div>

            <div
              className={
                "flex border-b border-surface-container px-space-lg bg-surface-container-low/50"
              }
            >
              <button
                data-action-text={"Profile & Roles"}
                className={
                  "drawer-tab px-space-md py-space-sm border-b-2 border-primary text-primary font-medium text-body-sm"
                }
                data-tab={"profile"}
                type="button"
                aria-label={actions.text("Profile & Roles")}
                data-handler={"switchDrawerTab('profile')"}
              >
                {actions.text("Profile & Roles")}
              </button>
              <button
                data-action-text={"Provider Profile"}
                className={
                  "drawer-tab px-space-md py-space-sm border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-medium text-body-sm"
                }
                data-tab={"provider"}
                type="button"
                aria-label={actions.text("Provider Profile")}
                data-handler={"switchDrawerTab('provider')"}
              >
                {actions.text("Provider Profile")}
              </button>
              <button
                data-action-text={"Subscription"}
                className={
                  "drawer-tab px-space-md py-space-sm border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-medium text-body-sm"
                }
                data-tab={"subscription"}
                type="button"
                aria-label={actions.text("Subscription")}
                data-handler={"switchDrawerTab('subscription')"}
              >
                {actions.text("Subscription")}
              </button>
              <button
                data-action-text={"Activity Log"}
                className={
                  "drawer-tab px-space-md py-space-sm border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-medium text-body-sm"
                }
                data-tab={"activity"}
                type="button"
                aria-label={actions.text("Activity Log")}
                data-handler={"switchDrawerTab('activity')"}
              >
                {actions.text("Activity Log")}
              </button>
            </div>

            <div
              className={"flex-1 overflow-y-auto p-space-lg space-y-space-lg"}
            >
              <div
                id={"tab-profile"}
                className={
                  actions.visible("tab-profile", true)
                    ? "drawer-panel space-y-space-lg"
                    : "drawer-panel space-y-space-lg hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-low p-space-lg rounded-xl space-y-space-md"
                  }
                >
                  <h3
                    className={
                      "text-headline-sm font-headline-sm text-on-surface"
                    }
                  >
                    {actions.text("Identity & Contact")}
                  </h3>
                  <div className={"grid grid-cols-2 gap-space-md text-body-md"}>
                    <div>
                      <span
                        className={
                          "text-body-sm text-on-surface-variant block mb-0.5"
                        }
                      >
                        {actions.text("Email Address")}
                      </span>
                      <span
                        id={"drawerEmail"}
                        className={
                          actions.visible("drawerEmail", true)
                            ? "font-code-md text-on-surface"
                            : "font-code-md text-on-surface hidden"
                        }
                      >
                        {actions.text("alexandra.c@nexuscloud.io")}
                      </span>
                    </div>
                    <div>
                      <span
                        className={
                          "text-body-sm text-on-surface-variant block mb-0.5"
                        }
                      >
                        {actions.text("Account Status")}
                      </span>
                      <span
                        id={"drawerStatusBadge"}
                        className={
                          actions.visible("drawerStatusBadge", true)
                            ? "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-emerald-50 text-emerald-700"
                            : "inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-emerald-50 text-emerald-700 hidden"
                        }
                      >
                        {actions.text("Active")}
                      </span>
                    </div>
                    <div>
                      <span
                        className={
                          "text-body-sm text-on-surface-variant block mb-0.5"
                        }
                      >
                        {actions.text("MFA Verification")}
                      </span>
                      <span
                        className={
                          "text-on-surface font-medium flex items-center gap-1 text-emerald-700"
                        }
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined text-[16px]"}
                        >
                          {"verified"}
                        </span>
                        {actions.text(" Enabled (TOTP)\n              ")}
                      </span>
                    </div>
                    <div>
                      <span
                        className={
                          "text-body-sm text-on-surface-variant block mb-0.5"
                        }
                      >
                        {actions.text("API Keys Issued")}
                      </span>
                      <span className={"text-on-surface font-medium"}>
                        {actions.text("4 Active Tokens")}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "bg-surface-container-low p-space-lg rounded-xl space-y-space-md"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Role Assignments")}
                    </h3>
                    <span className={"text-code-sm text-on-surface-variant"}>
                      {actions.text("Server-Defined RBAC")}
                    </span>
                  </div>
                  <div className={"space-y-space-sm"}>
                    <label
                      className={
                        "flex items-center justify-between p-space-md bg-surface-container-lowest rounded-lg cursor-pointer"
                      }
                    >
                      <div className={"flex items-center gap-space-md"}>
                        <input
                          defaultChecked={true}
                          className={
                            "w-4 h-4 rounded text-primary focus:ring-primary"
                          }
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <div>
                          <div
                            className={
                              "font-medium text-on-surface text-body-md"
                            }
                          >
                            {actions.text("API Provider")}
                          </div>
                          <div
                            className={"text-body-sm text-on-surface-variant"}
                          >
                            {actions.text(
                              "Can publish, manage, and monetize endpoints",
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={"text-code-sm text-primary font-code-sm"}
                      >
                        {actions.text("ROLE_PROVIDER")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center justify-between p-space-md bg-surface-container-lowest rounded-lg cursor-pointer"
                      }
                    >
                      <div className={"flex items-center gap-space-md"}>
                        <input
                          defaultChecked={true}
                          className={
                            "w-4 h-4 rounded text-primary focus:ring-primary"
                          }
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <div>
                          <div
                            className={
                              "font-medium text-on-surface text-body-md"
                            }
                          >
                            {actions.text("API Consumer")}
                          </div>
                          <div
                            className={"text-body-sm text-on-surface-variant"}
                          >
                            {actions.text(
                              "Standard gateway access & rate limits",
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={"text-code-sm text-primary font-code-sm"}
                      >
                        {actions.text("ROLE_CONSUMER")}
                      </span>
                    </label>
                    <label
                      className={
                        "flex items-center justify-between p-space-md bg-surface-container-lowest rounded-lg cursor-pointer opacity-60"
                      }
                    >
                      <div className={"flex items-center gap-space-md"}>
                        <input
                          className={
                            "w-4 h-4 rounded text-primary focus:ring-primary"
                          }
                          type={"checkbox"}
                          aria-label={actions.text("Input")}
                        />
                        <div>
                          <div
                            className={
                              "font-medium text-on-surface text-body-md"
                            }
                          >
                            {actions.text("Platform Administrator")}
                          </div>
                          <div
                            className={"text-body-sm text-on-surface-variant"}
                          >
                            {actions.text(
                              "Full system control, audit logs & security policies",
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={
                          "text-code-sm text-on-surface-variant font-code-sm"
                        }
                      >
                        {actions.text("ROLE_ADMIN")}
                      </span>
                    </label>
                  </div>
                  <div className={"pt-2 flex justify-end"}>
                    <button
                      data-action-text={"Save Role Changes"}
                      className={
                        "bg-primary text-on-primary px-space-md py-space-xs rounded-xl text-body-sm font-medium"
                      }
                      type="button"
                      aria-label={actions.text("Save Role Changes")}
                      data-handler={
                        "showToast('Roles successfully updated. Audit event logged.')"
                      }
                    >
                      {actions.text("Save Role Changes")}
                    </button>
                  </div>
                </div>
              </div>

              <div
                id={"tab-provider"}
                className={
                  actions.visible("tab-provider", false)
                    ? "drawer-panel space-y-space-lg"
                    : "drawer-panel space-y-space-lg hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-low p-space-lg rounded-xl space-y-space-md"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Registered Organization")}
                    </h3>
                    <span
                      className={
                        "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-secondary-container text-on-secondary-container"
                      }
                    >
                      {actions.text("Verified Enterprise")}
                    </span>
                  </div>
                  <div className={"space-y-space-sm text-body-md"}>
                    <div>
                      <span
                        className={"text-body-sm text-on-surface-variant block"}
                      >
                        {actions.text("Organization Name")}
                      </span>
                      <span className={"font-medium text-on-surface"}>
                        {actions.text("NexusCloud Technologies Inc.")}
                      </span>
                    </div>
                    <div>
                      <span
                        className={"text-body-sm text-on-surface-variant block"}
                      >
                        {actions.text("Published Endpoints")}
                      </span>
                      <span className={"font-medium text-on-surface"}>
                        {actions.text("14 Production Endpoints (v2.4)")}
                      </span>
                    </div>
                    <div>
                      <span
                        className={"text-body-sm text-on-surface-variant block"}
                      >
                        {actions.text("Monetization Payout Account")}
                      </span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("Stripe Connect (acct_1M...84J)")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                id={"tab-subscription"}
                className={
                  actions.visible("tab-subscription", false)
                    ? "drawer-panel space-y-space-lg"
                    : "drawer-panel space-y-space-lg hidden"
                }
              >
                <div
                  className={
                    "bg-surface-container-low p-space-lg rounded-xl space-y-space-md"
                  }
                >
                  <div className={"flex items-center justify-between"}>
                    <h3
                      className={
                        "text-headline-sm font-headline-sm text-on-surface"
                      }
                    >
                      {actions.text("Enterprise Plan")}
                    </h3>
                    <span
                      className={
                        "inline-flex items-center px-space-sm py-0.5 rounded-full text-code-sm font-medium bg-primary-fixed text-on-primary-fixed"
                      }
                    >
                      {actions.text("$499 / mo")}
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Includes 10,000,000 API requests/month, dedicated edge routing, and 99.99% SLA guarantee.",
                    )}
                  </p>
                  <div
                    className={
                      "pt-space-sm border-t border-surface-container flex justify-between text-body-sm"
                    }
                  >
                    <span className={"text-on-surface-variant"}>
                      {actions.text("Current Usage:")}
                    </span>
                    <span className={"font-medium text-on-surface"}>
                      {actions.text("4.2M / 10M Requests (42%)")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                id={"tab-activity"}
                className={
                  actions.visible("tab-activity", false)
                    ? "drawer-panel space-y-space-md"
                    : "drawer-panel space-y-space-md hidden"
                }
              >
                <div className={"space-y-space-sm"}>
                  <div
                    className={
                      "p-space-md bg-surface-container-low rounded-xl flex items-start gap-space-md"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px] mt-0.5"
                      }
                    >
                      {"key"}
                    </span>
                    <div>
                      <div
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("API Key Rotated")}
                      </div>
                      <div className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Generated new production bearer token (pk_live_9982)",
                        )}
                      </div>
                      <div
                        className={
                          "text-code-sm text-on-surface-variant/60 mt-1"
                        }
                      >
                        {actions.text("2 hours ago • IP: 192.0.2.45")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "p-space-md bg-surface-container-low rounded-xl flex items-start gap-space-md"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-emerald-600 text-[20px] mt-0.5"
                      }
                    >
                      {"login"}
                    </span>
                    <div>
                      <div
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Successful OAuth Authentication")}
                      </div>
                      <div className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Logged in via GitHub SSO with hardware token",
                        )}
                      </div>
                      <div
                        className={
                          "text-code-sm text-on-surface-variant/60 mt-1"
                        }
                      >
                        {actions.text("Today at 09:14 AM • IP: 192.0.2.45")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "p-space-md bg-surface-container-low rounded-xl flex items-start gap-space-md"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-amber-600 text-[20px] mt-0.5"
                      }
                    >
                      {"warning"}
                    </span>
                    <div>
                      <div
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text("Rate Limit Threshold Reached (80%)")}
                      </div>
                      <div className={"text-body-sm text-on-surface-variant"}>
                        {actions.text(
                          "Triggered webhook alert for endpoint /v1/telemetry",
                        )}
                      </div>
                      <div
                        className={
                          "text-code-sm text-on-surface-variant/60 mt-1"
                        }
                      >
                        {actions.text("Yesterday at 4:30 PM")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                "p-space-lg border-t border-surface-container bg-surface-container-low flex items-center justify-between"
              }
            >
              <button
                data-action-text={"Suspend User Account"}
                className={
                  "text-error font-medium text-body-sm hover:underline"
                }
                type="button"
                aria-label={actions.text("Suspend User Account")}
                data-handler={
                  "openActionModal('suspend', document.getElementById('drawerName').innerText, document.getElementById('drawerId').innerText)"
                }
              >
                {actions.text("Suspend User Account")}
              </button>
              <button
                data-action-text={"Done"}
                className={
                  "bg-primary text-on-primary px-space-lg py-space-sm rounded-xl text-body-sm font-medium"
                }
                type="button"
                aria-label={actions.text("Done")}
                data-handler={"closeUserDrawer()"}
              >
                {actions.text("Done")}
              </button>
            </div>
          </div>

          <div
            id={"actionModal"}
            className={
              actions.visible("actionModal", false)
                ? "fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-space-gutter"
                : "fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-space-gutter hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all"
              }
            >
              <div
                className={
                  "p-space-lg bg-surface-container-low border-b border-surface-container flex items-center justify-between"
                }
              >
                <div className={"flex items-center gap-space-sm text-error"}>
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[24px]"}
                  >
                    {"warning"}
                  </span>
                  <h3
                    id={"modalTitle"}
                    className={
                      actions.visible("modalTitle", true)
                        ? "text-headline-sm font-headline-sm text-on-surface"
                        : "text-headline-sm font-headline-sm text-on-surface hidden"
                    }
                  >
                    {actions.text("Confirm Account Suspension")}
                  </h3>
                </div>
                <button
                  data-action-text={"close"}
                  className={
                    "w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeActionModal()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>
              <div className={"p-space-lg space-y-space-md"}>
                <p
                  id={"modalDescription"}
                  className={
                    actions.visible("modalDescription", true)
                      ? "text-body-md text-on-surface-variant"
                      : "text-body-md text-on-surface-variant hidden"
                  }
                >
                  {actions.text("\n          You are about to suspend ")}
                  <span
                    id={"modalUserName"}
                    className={
                      actions.visible("modalUserName", true)
                        ? "font-medium text-on-surface"
                        : "font-medium text-on-surface hidden"
                    }
                  >
                    {actions.text("User")}
                  </span>
                  {actions.text(" (")}
                  <span
                    id={"modalUserId"}
                    className={
                      actions.visible("modalUserId", true)
                        ? "font-code-sm"
                        : "font-code-sm hidden"
                    }
                  >
                    {actions.text("usr_00000")}
                  </span>
                  {actions.text(
                    "). This will immediately revoke all active API keys and terminate current gateway sessions.\n        ",
                  )}
                </p>
                <div
                  className={
                    "bg-error-container/30 p-space-md rounded-xl border border-error/20"
                  }
                >
                  <div className={"text-body-sm font-medium text-error mb-1"}>
                    {actions.text("Security Audit Impact")}
                  </div>
                  <div className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "This action is irreversible without administrator override and will be logged in the permanent compliance audit trail.",
                    )}
                  </div>
                </div>
                <div>
                  <label
                    className={
                      "text-body-sm font-medium text-on-surface block mb-1"
                    }
                  >
                    {actions.text("Type confirmation phrase (")}
                    <code className={"font-code-sm text-error"}>
                      {"SUSPEND"}
                    </code>
                    {actions.text(")")}
                  </label>
                  <input
                    data-source-placeholder={"SUSPEND"}
                    className={
                      "w-full bg-surface-container border border-outline-variant/40 rounded-xl px-space-md py-space-xs text-body-md outline-none focus:border-error"
                    }
                    id={"confirmInput"}
                    placeholder={actions.text("SUSPEND")}
                    type={"text"}
                  />
                </div>
              </div>
              <div
                className={
                  "p-space-lg bg-surface-container-low border-t border-surface-container flex items-center justify-end gap-space-sm"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-space-md py-space-sm rounded-xl text-body-sm font-medium text-on-surface-variant hover:bg-surface-container"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeActionModal()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Confirm Suspension"}
                  className={
                    "bg-error text-on-error px-space-lg py-space-sm rounded-xl text-body-sm font-medium hover:bg-error/90 transition-all"
                  }
                  type="button"
                  aria-label={actions.text("Confirm Suspension")}
                  data-handler={"executeAction()"}
                >
                  {actions.text("Confirm Suspension")}
                </button>
              </div>
            </div>
          </div>

          <div
            id={"inviteModal"}
            className={
              actions.visible("inviteModal", false)
                ? "fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-space-gutter"
                : "fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-space-gutter hidden"
            }
          >
            <div
              className={
                "bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
              }
            >
              <div
                className={
                  "p-space-lg bg-surface-container-low border-b border-surface-container flex items-center justify-between"
                }
              >
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Invite New API Hub User")}
                </h3>
                <button
                  data-action-text={"close"}
                  className={
                    "w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeInviteModal()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[18px]"}
                  >
                    {"close"}
                  </span>
                </button>
              </div>
              <div className={"p-space-lg space-y-space-md"}>
                <div>
                  <label
                    className={
                      "text-body-sm font-medium text-on-surface block mb-1"
                    }
                  >
                    {actions.text("Email Address")}
                  </label>
                  <input
                    data-source-placeholder={"developer@company.com"}
                    className={
                      "w-full bg-surface-container border border-outline-variant/40 rounded-xl px-space-md py-space-xs text-body-md outline-none focus:border-primary"
                    }
                    placeholder={actions.text("developer@company.com")}
                    type={"email"}
                    aria-label={actions.text("developer@company.com")}
                  />
                </div>
                <div>
                  <label
                    className={
                      "text-body-sm font-medium text-on-surface block mb-1"
                    }
                  >
                    {actions.text("Initial Role Assignment")}
                  </label>
                  <select
                    className={
                      "w-full bg-surface-container border border-outline-variant/40 rounded-xl px-space-md py-space-xs text-body-md outline-none focus:border-primary"
                    }
                    aria-label={actions.text("Input")}
                  >
                    <option value={"API Consumer"}>
                      {actions.text("API Consumer")}
                    </option>
                    <option value={"API Provider"}>
                      {actions.text("API Provider")}
                    </option>
                    <option value={"Platform Administrator"}>
                      {actions.text("Platform Administrator")}
                    </option>
                  </select>
                </div>
              </div>
              <div
                className={
                  "p-space-lg bg-surface-container-low border-t border-surface-container flex items-center justify-end gap-space-sm"
                }
              >
                <button
                  data-action-text={"Cancel"}
                  className={
                    "px-space-md py-space-sm rounded-xl text-body-sm font-medium text-on-surface-variant hover:bg-surface-container"
                  }
                  type="button"
                  aria-label={actions.text("Cancel")}
                  data-handler={"closeInviteModal()"}
                >
                  {actions.text("Cancel")}
                </button>
                <button
                  data-action-text={"Send Invitation"}
                  className={
                    "bg-primary text-on-primary px-space-lg py-space-sm rounded-xl text-body-sm font-medium"
                  }
                  type="button"
                  aria-label={actions.text("Send Invitation")}
                  data-handler={
                    "closeInviteModal(); showToast('Invitation email successfully dispatched.')"
                  }
                >
                  {actions.text("Send Invitation")}
                </button>
              </div>
            </div>
          </div>

          <div
            className={
              "fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-xl shadow-2xl z-50 transform translate-y-20 opacity-0 transition-all duration-300 flex items-center gap-space-md"
            }
            id={"actionToast"}
          >
            <span
              aria-hidden={true}
              className={"material-symbols-outlined text-emerald-400"}
            >
              {"check_circle"}
            </span>
            <span className={"text-body-md font-medium"} id={"toastMessage"}>
              {actions.text("Action completed successfully.")}
            </span>
          </div>
        </div>
      </section>
      {actions.overlay}
    </>
  );
}
