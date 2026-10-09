import { useScreenActions } from "../features/screen-actions";
export default function Screen5() {
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
              "w-full bg-surface-container-high rounded-xl p-space-md mb-space-lg flex items-center justify-between shadow-sm"
            }
          >
            <div className={"flex items-center gap-space-md"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-primary text-[24px]"}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {"science"}
              </span>
              <div>
                <h2
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("SANDBOX / TEST TRANSACTIONS")}
                </h2>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "No real financial settlement or live payment processing in MVP. All data reflects simulated mock gateways.",
                  )}
                </p>
              </div>
            </div>
            <div className={"flex items-center gap-space-sm"}>
              <span
                className={
                  "inline-flex items-center px-3 py-1 rounded-full text-label-md bg-primary-container text-on-primary-container font-medium"
                }
              >
                <span
                  className={
                    "w-2 h-2 rounded-full bg-primary animate-ping mr-2"
                  }
                ></span>
                {actions.text("Sandbox Mode Active\n      ")}
              </span>
            </div>
          </div>

          <div
            className={
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-space-md mb-space-xl"
            }
          >
            <div
              className={
                "bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Active Subs")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"verified"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("1,482")}
                </div>
                <div className={"text-code-sm text-primary mt-1"}>
                  {actions.text("+12% this week")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Expired")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-tertiary text-[20px]"
                  }
                >
                  {"schedule"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("142")}
                </div>
                <div className={"text-code-sm text-on-surface-variant mt-1"}>
                  {actions.text("Requiring renewal")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Cancelled")}
                </span>
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-error text-[20px]"}
                >
                  {"cancel"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("38")}
                </div>
                <div className={"text-code-sm text-error mt-1"}>
                  {actions.text("-4% vs last mo")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Suspended")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-secondary text-[20px]"
                  }
                >
                  {"block"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("12")}
                </div>
                <div className={"text-code-sm text-secondary mt-1"}>
                  {actions.text("Quota exceeded")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Simulated Volume")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"payments"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md font-code-md text-on-surface"
                  }
                >
                  {actions.text("$284,500")}
                </div>
                <div className={"text-code-sm text-primary mt-1"}>
                  {actions.text("Test Sandbox Ledger")}
                </div>
              </div>
            </div>

            <div
              className={
                "bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between"
              }
            >
              <div className={"flex items-center justify-between mb-space-sm"}>
                <span
                  className={
                    "text-label-md text-on-surface-variant uppercase tracking-wider"
                  }
                >
                  {actions.text("Success Rate")}
                </span>
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-primary text-[20px]"
                  }
                >
                  {"monitoring"}
                </span>
              </div>
              <div>
                <div
                  className={
                    "text-headline-md font-headline-md text-on-surface"
                  }
                >
                  {actions.text("98.4%")}
                </div>
                <div className={"text-code-sm text-primary mt-1"}>
                  {actions.text("Mock Gateway OK")}
                </div>
              </div>
            </div>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md"
            }
          >
            <div className={"flex flex-wrap items-center gap-space-sm flex-1"}>
              <div
                className={
                  "relative flex items-center bg-surface-container-low rounded-xl px-3 py-1.5 border border-outline-variant text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"calendar_today"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface font-medium cursor-pointer pr-4"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"Last 7 Days"}>
                    {actions.text("Last 7 Days")}
                  </option>
                  <option value={"Last 30 Days"}>
                    {actions.text("Last 30 Days")}
                  </option>
                  <option value={"Year to Date"}>
                    {actions.text("Year to Date")}
                  </option>
                </select>
              </div>
              <div
                className={
                  "relative flex items-center bg-surface-container-low rounded-xl px-3 py-1.5 border border-outline-variant text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"api"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface font-medium cursor-pointer pr-4"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All APIs"}>{actions.text("All APIs")}</option>
                  <option value={"Stripe Payments v2"}>
                    {actions.text("Stripe Payments v2")}
                  </option>
                  <option value={"GeoSpatial Routing"}>
                    {actions.text("GeoSpatial Routing")}
                  </option>
                  <option value={"Neural NLP Engine"}>
                    {actions.text("Neural NLP Engine")}
                  </option>
                </select>
              </div>
              <div
                className={
                  "relative flex items-center bg-surface-container-low rounded-xl px-3 py-1.5 border border-outline-variant text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"payments"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface font-medium cursor-pointer pr-4"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All Plans"}>
                    {actions.text("All Plans")}
                  </option>
                  <option value={"Enterprise Tier ($999/mo)"}>
                    {actions.text("Enterprise Tier ($999/mo)")}
                  </option>
                  <option value={"Pro Developer ($199/mo)"}>
                    {actions.text("Pro Developer ($199/mo)")}
                  </option>
                  <option value={"Starter Sandbox ($0/mo)"}>
                    {actions.text("Starter Sandbox ($0/mo)")}
                  </option>
                </select>
              </div>
              <div
                className={
                  "relative flex items-center bg-surface-container-low rounded-xl px-3 py-1.5 border border-outline-variant text-body-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={
                    "material-symbols-outlined text-on-surface-variant mr-2 text-[18px]"
                  }
                >
                  {"filter_list"}
                </span>
                <select
                  className={
                    "bg-transparent outline-none text-on-surface font-medium cursor-pointer pr-4"
                  }
                  aria-label={actions.text("Input")}
                >
                  <option value={"All Statuses"}>
                    {actions.text("All Statuses")}
                  </option>
                  <option value={"Active"}>{actions.text("Active")}</option>
                  <option value={"Expired"}>{actions.text("Expired")}</option>
                  <option value={"Suspended"}>
                    {actions.text("Suspended")}
                  </option>
                </select>
              </div>
            </div>
            <div className={"flex items-center gap-space-sm"}>
              <button
                data-action-text={"download Export Sandbox Logs"}
                className={
                  "bg-surface-container-low text-on-surface px-4 py-2 rounded-xl text-body-sm font-medium hover:bg-surface-container-high transition flex items-center gap-2"
                }
                type="button"
                aria-label={actions.text("Export Sandbox Logs")}
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-[18px]"}
                >
                  {"download"}
                </span>
                {actions.text(" Export Sandbox Logs\n      ")}
              </button>
            </div>
          </div>

          <div className={"flex items-center gap-space-md mb-space-lg"}>
            <button
              data-action-text={"subscriptions Subscription Management"}
              id={"tab-subs"}
              type="button"
              aria-label={actions.text("Subscription Management")}
              data-handler={"switchTab('subs')"}
              className={
                actions.visible("tab-subs", true)
                  ? "px-5 py-2.5 rounded-xl font-medium text-body-md transition bg-primary-container text-on-primary-container shadow-sm flex items-center gap-2"
                  : "px-5 py-2.5 rounded-xl font-medium text-body-md transition bg-primary-container text-on-primary-container shadow-sm flex items-center gap-2 hidden"
              }
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px]"}
              >
                {"subscriptions"}
              </span>
              {actions.text(" Subscription Management\n    ")}
            </button>
            <button
              data-action-text={"receipt_long Sandbox Transactions"}
              id={"tab-txns"}
              type="button"
              aria-label={actions.text("Sandbox Transactions")}
              data-handler={"switchTab('txns')"}
              className={
                actions.visible("tab-txns", true)
                  ? "px-5 py-2.5 rounded-xl font-medium text-body-md transition bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center gap-2"
                  : "px-5 py-2.5 rounded-xl font-medium text-body-md transition bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center gap-2 hidden"
              }
            >
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-[18px]"}
              >
                {"receipt_long"}
              </span>
              {actions.text(" Sandbox Transactions\n    ")}
            </button>
          </div>

          <div
            className={
              "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"
            }
            id={"section-subs"}
          >
            <div
              className={
                "px-6 py-4 flex items-center justify-between border-b border-surface-container-high"
              }
            >
              <div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Active Subscriptions Registry")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Real-time mapping of consumers to API provider plans with simulation state triggers.",
                  )}
                </p>
              </div>
              <span className={"text-code-md text-primary font-code-md"}>
                {actions.text("Showing 4 of 1,482 records")}
              </span>
            </div>
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    <th className={"py-3 px-6"}>
                      {actions.text("Subscription ID")}
                    </th>
                    <th className={"py-3 px-6"}>{actions.text("Consumer")}</th>
                    <th className={"py-3 px-6"}>
                      {actions.text("API Product")}
                    </th>
                    <th className={"py-3 px-6"}>{actions.text("Provider")}</th>
                    <th className={"py-3 px-6"}>{actions.text("Plan Tier")}</th>
                    <th className={"py-3 px-6"}>{actions.text("Status")}</th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Start / Expiration")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Sandbox Txn")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "divide-y divide-surface-container-high text-body-md text-on-surface"
                  }
                >
                  <tr
                    data-action-text={
                      "SUB-8401-AX Apex Fintech Labs Stripe Payments v2 Stripe Gateway Inc Enterprise ($999) Active 2023-10-01 2024-10-01 TXN-9942-SUCCESS"
                    }
                    className={
                      "hover:bg-surface-container-low transition cursor-pointer"
                    }
                    data-handler={"openModal('TXN-9942-SUCCESS')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "SUB-8401-AX Apex Fintech Labs Stripe Payments v2 Stripe Gateway Inc Enterprise ($999) Active 2023-10-01 2024-10-01 TXN-9942-SUCCESS",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("SUB-8401-AX")}
                    </td>
                    <td className={"py-4 px-6 font-medium"}>
                      {actions.text("Apex Fintech Labs")}
                    </td>
                    <td className={"py-4 px-6"}>
                      {actions.text("Stripe Payments v2")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Stripe Gateway Inc")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-code-sm bg-primary-container text-on-primary-container"
                        }
                      >
                        {actions.text("Enterprise ($999)")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-emerald-100 text-emerald-800"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.recordText("row-0", "Active")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2023-10-01")}
                      <br />
                      {actions.text("2024-10-01")}
                    </td>
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("TXN-9942-SUCCESS")}
                    </td>
                  </tr>
                  <tr
                    data-action-text={
                      "SUB-8402-BY CyberSec Dynamics Neural NLP Engine AI Core Systems Pro Dev ($199) Suspended 2023-11-15 2024-05-15 TXN-9943-FAIL"
                    }
                    className={
                      "hover:bg-surface-container-low transition cursor-pointer"
                    }
                    data-handler={"openModal('TXN-9943-FAIL')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "SUB-8402-BY CyberSec Dynamics Neural NLP Engine AI Core Systems Pro Dev ($199) Suspended 2023-11-15 2024-05-15 TXN-9943-FAIL",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("SUB-8402-BY")}
                    </td>
                    <td className={"py-4 px-6 font-medium"}>
                      {actions.text("CyberSec Dynamics")}
                    </td>
                    <td className={"py-4 px-6"}>
                      {actions.text("Neural NLP Engine")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("AI Core Systems")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-code-sm bg-surface-container-high text-on-surface"
                        }
                      >
                        {actions.text("Pro Dev ($199)")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-error-container text-on-error-container"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-error"}
                        ></span>
                        {actions.recordText("row-1", "Suspended")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2023-11-15")}
                      <br />
                      {actions.text("2024-05-15")}
                    </td>
                    <td className={"py-4 px-6 font-code-md text-error"}>
                      {actions.text("TXN-9943-FAIL")}
                    </td>
                  </tr>
                  <tr
                    data-action-text={
                      "SUB-8403-CZ Velo Logistics GeoSpatial Routing MapStack Corp Starter ($0) Pending Webhook 2024-02-01 2024-03-01 TXN-9944-PENDING"
                    }
                    className={
                      "hover:bg-surface-container-low transition cursor-pointer"
                    }
                    data-handler={"openModal('TXN-9944-PENDING')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "SUB-8403-CZ Velo Logistics GeoSpatial Routing MapStack Corp Starter ($0) Pending Webhook 2024-02-01 2024-03-01 TXN-9944-PENDING",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("SUB-8403-CZ")}
                    </td>
                    <td className={"py-4 px-6 font-medium"}>
                      {actions.text("Velo Logistics")}
                    </td>
                    <td className={"py-4 px-6"}>
                      {actions.text("GeoSpatial Routing")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("MapStack Corp")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-code-sm bg-surface-container-high text-on-surface"
                        }
                      >
                        {actions.text("Starter ($0)")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-amber-100 text-amber-800"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-amber-500"}
                        ></span>
                        {actions.text("Pending Webhook")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2024-02-01")}
                      <br />
                      {actions.text("2024-03-01")}
                    </td>
                    <td className={"py-4 px-6 font-code-md text-amber-600"}>
                      {actions.text("TXN-9944-PENDING")}
                    </td>
                  </tr>
                  <tr
                    data-action-text={
                      "SUB-8404-DX Quantum Health Biometric OCR v4 MedTech AI Enterprise ($999) Activation Error 2024-02-10 2024-03-10 TXN-9945-ERROR"
                    }
                    className={
                      "hover:bg-surface-container-low transition cursor-pointer"
                    }
                    data-handler={"openModal('TXN-9945-ERROR')"}
                    role="button"
                    tabIndex={0}
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "SUB-8404-DX Quantum Health Biometric OCR v4 MedTech AI Enterprise ($999) Activation Error 2024-02-10 2024-03-10 TXN-9945-ERROR",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("SUB-8404-DX")}
                    </td>
                    <td className={"py-4 px-6 font-medium"}>
                      {actions.text("Quantum Health")}
                    </td>
                    <td className={"py-4 px-6"}>
                      {actions.text("Biometric OCR v4")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("MedTech AI")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "px-2.5 py-1 rounded-full text-code-sm bg-primary-container text-on-primary-container"
                        }
                      >
                        {actions.text("Enterprise ($999)")}
                      </span>
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-rose-100 text-rose-800"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-rose-500"}
                        ></span>
                        {actions.text("Activation Error")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-body-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2024-02-10")}
                      <br />
                      {actions.text("2024-03-10")}
                    </td>
                    <td className={"py-4 px-6 font-code-md text-rose-600"}>
                      {actions.text("TXN-9945-ERROR")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            id={"section-txns"}
            className={
              actions.visible("section-txns", false)
                ? "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl"
                : "bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl hidden"
            }
          >
            <div
              className={
                "px-6 py-4 flex items-center justify-between border-b border-surface-container-high"
              }
            >
              <div>
                <h3
                  className={
                    "text-headline-sm font-headline-sm text-on-surface"
                  }
                >
                  {actions.text("Sandbox Payment Transactions")}
                </h3>
                <p className={"text-body-sm text-on-surface-variant"}>
                  {actions.text(
                    "Simulated payment gateway calls, mock webhooks, and ledger execution logs.",
                  )}
                </p>
              </div>
              <span className={"text-code-md text-primary font-code-md"}>
                {actions.text("Showing all sandbox states")}
              </span>
            </div>
            <div className={"overflow-x-auto"}>
              <table className={"w-full text-left border-collapse"}>
                <thead>
                  <tr
                    className={
                      "bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider"
                    }
                  >
                    <th className={"py-3 px-6"}>
                      {actions.text("Transaction ID")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Subscription ID")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Simulation Method")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Simulated Amount")}
                    </th>
                    <th className={"py-3 px-6"}>
                      {actions.text("Sandbox Status")}
                    </th>
                    <th className={"py-3 px-6"}>{actions.text("Timestamp")}</th>
                    <th className={"py-3 px-6 text-right"}>
                      {actions.text("Action")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={
                    "divide-y divide-surface-container-high text-body-md text-on-surface"
                  }
                >
                  <tr
                    className={"hover:bg-surface-container-low transition"}
                    data-record="row-0"
                    hidden={
                      !actions.matches(
                        "TXN-9942-SUCCESS SUB-8401-AX Stripe Sandbox v2 $999.00 Success 2024-02-14 14:32:01 Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("TXN-9942-SUCCESS")}
                    </td>
                    <td className={"py-4 px-6 font-code-md"}>
                      {actions.text("SUB-8401-AX")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Stripe Sandbox v2")}
                    </td>
                    <td className={"py-4 px-6 font-code-md font-medium"}>
                      {actions.text("$999.00")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-emerald-100 text-emerald-800"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-emerald-500"}
                        ></span>
                        {actions.text("Success")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2024-02-14 14:32:01")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary text-body-sm font-medium transition"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openModal('TXN-9942-SUCCESS')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>
                  <tr
                    className={"hover:bg-surface-container-low transition"}
                    data-record="row-1"
                    hidden={
                      !actions.matches(
                        "TXN-9943-FAIL SUB-8402-BY Mock Webhook Gateway $199.00 Failed (Insufficient Funds) 2024-02-14 12:15:40 Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("TXN-9943-FAIL")}
                    </td>
                    <td className={"py-4 px-6 font-code-md"}>
                      {actions.text("SUB-8402-BY")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Mock Webhook Gateway")}
                    </td>
                    <td className={"py-4 px-6 font-code-md font-medium"}>
                      {actions.text("$199.00")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-error-container text-on-error-container"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-error"}
                        ></span>
                        {actions.text("Failed (Insufficient Funds)")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2024-02-14 12:15:40")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary text-body-sm font-medium transition"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openModal('TXN-9943-FAIL')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>
                  <tr
                    className={"hover:bg-surface-container-low transition"}
                    data-record="row-2"
                    hidden={
                      !actions.matches(
                        "TXN-9944-PENDING SUB-8403-CZ Stripe Sandbox v2 $0.00 Pending Webhook 2024-02-14 15:00:12 Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("TXN-9944-PENDING")}
                    </td>
                    <td className={"py-4 px-6 font-code-md"}>
                      {actions.text("SUB-8403-CZ")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Stripe Sandbox v2")}
                    </td>
                    <td className={"py-4 px-6 font-code-md font-medium"}>
                      {actions.text("$0.00")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-amber-100 text-amber-800"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-amber-500"}
                        ></span>
                        {actions.text("Pending Webhook")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2024-02-14 15:00:12")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary text-body-sm font-medium transition"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openModal('TXN-9944-PENDING')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>
                  <tr
                    className={"hover:bg-surface-container-low transition"}
                    data-record="row-3"
                    hidden={
                      !actions.matches(
                        "TXN-9945-ERROR SUB-8404-DX Mock Webhook Gateway $999.00 Activation Error 2024-02-14 09:41:22 Inspect",
                      )
                    }
                  >
                    <td className={"py-4 px-6 font-code-md text-primary"}>
                      {actions.text("TXN-9945-ERROR")}
                    </td>
                    <td className={"py-4 px-6 font-code-md"}>
                      {actions.text("SUB-8404-DX")}
                    </td>
                    <td className={"py-4 px-6 text-on-surface-variant"}>
                      {actions.text("Mock Webhook Gateway")}
                    </td>
                    <td className={"py-4 px-6 font-code-md font-medium"}>
                      {actions.text("$999.00")}
                    </td>
                    <td className={"py-4 px-6"}>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm bg-rose-100 text-rose-800"
                        }
                      >
                        <span
                          className={"w-1.5 h-1.5 rounded-full bg-rose-500"}
                        ></span>
                        {actions.text("Activation Error")}
                      </span>
                    </td>
                    <td
                      className={
                        "py-4 px-6 text-code-sm text-on-surface-variant"
                      }
                    >
                      {actions.text("2024-02-14 09:41:22")}
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <button
                        data-action-text={"Inspect"}
                        className={
                          "px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary text-body-sm font-medium transition"
                        }
                        type="button"
                        aria-label={actions.text("Inspect")}
                        data-handler={"openModal('TXN-9945-ERROR')"}
                      >
                        {actions.text("Inspect")}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            id={"txn-modal"}
            className={
              actions.visible("txn-modal", true)
                ? "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-end transition-opacity opacity-0 pointer-events-none"
                : "fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-end transition-opacity opacity-0 pointer-events-none hidden"
            }
          >
            <div
              id={"modal-content"}
              className={
                actions.visible("modal-content", true)
                  ? "w-full max-w-xl h-full bg-surface-container-lowest shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300"
                  : "w-full max-w-xl h-full bg-surface-container-lowest shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 hidden"
              }
            >
              <div
                className={
                  "px-6 py-5 border-b border-surface-container-high flex items-center justify-between"
                }
              >
                <div className={"flex items-center gap-3"}>
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-primary text-[24px]"
                    }
                  >
                    {"troubleshoot"}
                  </span>
                  <div>
                    <h3
                      id={"modal-title"}
                      className={
                        actions.visible("modal-title", true)
                          ? "text-headline-sm font-headline-sm text-on-surface"
                          : "text-headline-sm font-headline-sm text-on-surface hidden"
                      }
                    >
                      {actions.text("Transaction Inspection")}
                    </h3>
                    <p
                      id={"modal-subtitle"}
                      className={
                        actions.visible("modal-subtitle", true)
                          ? "text-code-sm text-on-surface-variant"
                          : "text-code-sm text-on-surface-variant hidden"
                      }
                    >
                      {actions.text("TXN-9942-SUCCESS")}
                    </p>
                  </div>
                </div>
                <button
                  data-action-text={"close"}
                  className={
                    "w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition"
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

              <div
                className={"flex-1 overflow-y-auto p-space-lg space-y-space-lg"}
              >
                <div
                  id={"modal-state-box"}
                  className={
                    actions.visible("modal-state-box", true)
                      ? "p-4 rounded-xl bg-surface-container-low flex items-center justify-between"
                      : "p-4 rounded-xl bg-surface-container-low flex items-center justify-between hidden"
                  }
                >
                  <div>
                    <span
                      className={
                        "text-label-md text-on-surface-variant uppercase tracking-wider"
                      }
                    >
                      {actions.text("Sandbox Result")}
                    </span>
                    <div
                      id={"modal-status-text"}
                      className={
                        actions.visible("modal-status-text", true)
                          ? "text-headline-sm font-headline-sm text-emerald-700 mt-0.5"
                          : "text-headline-sm font-headline-sm text-emerald-700 mt-0.5 hidden"
                      }
                    >
                      {actions.text("Payment Successful (Mocked)")}
                    </div>
                  </div>
                  <div className={"text-right"}>
                    <span
                      className={
                        "text-label-md text-on-surface-variant uppercase tracking-wider"
                      }
                    >
                      {actions.text("Simulated Amount")}
                    </span>
                    <div
                      id={"modal-amount-text"}
                      className={
                        actions.visible("modal-amount-text", true)
                          ? "text-headline-sm font-code-md text-on-surface"
                          : "text-headline-sm font-code-md text-on-surface hidden"
                      }
                    >
                      {actions.text("$999.00")}
                    </div>
                  </div>
                </div>

                <div className={"grid grid-cols-2 gap-space-md"}>
                  <div className={"bg-surface-container-low p-3.5 rounded-xl"}>
                    <span
                      className={
                        "text-label-md text-on-surface-variant uppercase"
                      }
                    >
                      {actions.text("Simulation Method")}
                    </span>
                    <div
                      id={"modal-method"}
                      className={
                        actions.visible("modal-method", true)
                          ? "text-body-md font-medium text-on-surface mt-1"
                          : "text-body-md font-medium text-on-surface mt-1 hidden"
                      }
                    >
                      {actions.text("Stripe Sandbox v2")}
                    </div>
                  </div>
                  <div className={"bg-surface-container-low p-3.5 rounded-xl"}>
                    <span
                      className={
                        "text-label-md text-on-surface-variant uppercase"
                      }
                    >
                      {actions.text("Subscription Status")}
                    </span>
                    <div
                      id={"modal-sub-status"}
                      className={
                        actions.visible("modal-sub-status", true)
                          ? "text-body-md font-medium text-emerald-700 mt-1"
                          : "text-body-md font-medium text-emerald-700 mt-1 hidden"
                      }
                    >
                      {actions.text("Active & Provisioned")}
                    </div>
                  </div>
                </div>

                <div
                  id={"modal-error-box"}
                  className={
                    actions.visible("modal-error-box", false)
                      ? "p-4 rounded-xl bg-error-container text-on-error-container"
                      : "p-4 rounded-xl bg-error-container text-on-error-container hidden"
                  }
                >
                  <div className={"flex items-center gap-2 mb-1"}>
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-[18px]"}
                    >
                      {"error"}
                    </span>
                    <span className={"text-label-md uppercase font-medium"}>
                      {actions.text("Failure / Error Diagnostic")}
                    </span>
                  </div>
                  <p
                    id={"modal-error-text"}
                    className={
                      actions.visible("modal-error-text", true)
                        ? "text-body-sm"
                        : "text-body-sm hidden"
                    }
                  >
                    {actions.text(
                      "Card declined: Insufficient test funds in sandbox wallet.",
                    )}
                  </p>
                </div>

                <div>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-space-md flex items-center gap-2"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"timeline"}
                    </span>
                    {actions.text(" Event Timeline\n          ")}
                  </h4>
                  <div
                    id={"modal-timeline"}
                    className={
                      actions.visible("modal-timeline", true)
                        ? "space-y-4 border-l-2 border-surface-container-high pl-4 ml-2"
                        : "space-y-4 border-l-2 border-surface-container-high pl-4 ml-2 hidden"
                    }
                  >
                    <div className={"relative"}>
                      <span
                        className={
                          "absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest"
                        }
                      ></span>
                      <div className={"text-label-md text-on-surface-variant"}>
                        {actions.text("14:32:00.102")}
                      </div>
                      <div
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text(
                          "Webhook received from Stripe Sandbox API",
                        )}
                      </div>
                    </div>
                    <div className={"relative"}>
                      <span
                        className={
                          "absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest"
                        }
                      ></span>
                      <div className={"text-label-md text-on-surface-variant"}>
                        {actions.text("14:32:00.315")}
                      </div>
                      <div
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text(
                          "Gateway token authentication & test signature verified",
                        )}
                      </div>
                    </div>
                    <div className={"relative"}>
                      <span
                        className={
                          "absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest"
                        }
                      ></span>
                      <div className={"text-label-md text-on-surface-variant"}>
                        {actions.text("14:32:00.890")}
                      </div>
                      <div
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text(
                          "Sandbox ledger sync completed ($999.00 credited)",
                        )}
                      </div>
                    </div>
                    <div className={"relative"}>
                      <span
                        className={
                          "absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest"
                        }
                      ></span>
                      <div className={"text-label-md text-on-surface-variant"}>
                        {actions.text("14:32:01.042")}
                      </div>
                      <div
                        className={"text-body-md font-medium text-on-surface"}
                      >
                        {actions.text(
                          "Subscription activation completed (API keys provisioned)",
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4
                    className={
                      "text-headline-sm font-headline-sm text-on-surface mb-space-sm flex items-center gap-2"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={
                        "material-symbols-outlined text-primary text-[20px]"
                      }
                    >
                      {"code"}
                    </span>
                    {actions.text(" Raw Webhook Payload\n          ")}
                  </h4>
                  <pre
                    id={"modal-json"}
                    className={
                      actions.visible("modal-json", true)
                        ? "bg-inverse-surface text-inverse-on-surface p-4 rounded-xl text-code-md overflow-x-auto font-code-md"
                        : "bg-inverse-surface text-inverse-on-surface p-4 rounded-xl text-code-md overflow-x-auto font-code-md hidden"
                    }
                  >
                    <code>
                      {
                        '{\n  "id": "evt_1OMockSandboxV2",\n  "object": "event",\n  "api_version": "2023-11-16",\n  "data": {\n    "object": {\n      "id": "sub_8401AX",\n      "amount_paid": 99900,\n      "currency": "usd",\n      "status": "active",\n      "test_clock": "clck_109283"\n    }\n  }\n}'
                      }
                    </code>
                  </pre>
                </div>
              </div>

              <div
                className={
                  "px-6 py-4 border-t border-surface-container-high flex items-center justify-end gap-3"
                }
              >
                <button
                  data-action-text={"Close"}
                  className={
                    "px-4 py-2 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition text-body-sm font-medium"
                  }
                  type="button"
                  aria-label={actions.text("Close")}
                  data-handler={"closeModal()"}
                >
                  {actions.text("Close")}
                </button>
                <button
                  data-action-text={"replay Re-trigger Mock Webhook"}
                  className={
                    "px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition text-body-sm font-medium flex items-center gap-2"
                  }
                  type="button"
                  aria-label={actions.text("Re-trigger Mock Webhook")}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-[16px]"}
                  >
                    {"replay"}
                  </span>
                  {actions.text(" Re-trigger Mock Webhook\n        ")}
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
