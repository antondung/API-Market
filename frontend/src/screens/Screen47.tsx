import { useScreenActions } from "../features/screen-actions";
export default function Screen47() {
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
              "w-full bg-surface-container-low py-3 px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4"
            }
          >
            <div className={"flex items-center gap-2"}>
              <span
                aria-hidden={true}
                className={"material-symbols-outlined text-primary text-[18px]"}
              >
                {"tune"}
              </span>
              <span
                className={
                  "text-label-md font-label-md text-on-surface uppercase tracking-wider"
                }
              >
                {actions.text("Preview Checkout States:")}
              </span>
            </div>
            <div className={"flex items-center gap-2"}>
              <button
                data-action-text={"Initial Form"}
                className={
                  "px-3 py-1.5 rounded-lg text-body-sm font-label-md bg-primary text-on-primary transition-all"
                }
                id={"btn-initial"}
                type="button"
                aria-label={actions.text("Initial Form")}
                data-handler={"switchState('initial')"}
              >
                {actions.text("Initial Form")}
              </button>
              <button
                data-action-text={"Processing"}
                className={
                  "px-3 py-1.5 rounded-lg text-body-sm font-label-md bg-surface-container hover:bg-surface-container-highest text-on-surface transition-all"
                }
                id={"btn-processing"}
                type="button"
                aria-label={actions.text("Processing")}
                data-handler={"switchState('processing')"}
              >
                {actions.text("Processing")}
              </button>
              <button
                data-action-text={"Success View"}
                className={
                  "px-3 py-1.5 rounded-lg text-body-sm font-label-md bg-surface-container hover:bg-surface-container-highest text-on-surface transition-all"
                }
                id={"btn-success"}
                type="button"
                aria-label={actions.text("Success View")}
                data-handler={"switchState('success')"}
              >
                {actions.text("Success View")}
              </button>
              <button
                data-action-text={"Failure / Retry"}
                className={
                  "px-3 py-1.5 rounded-lg text-body-sm font-label-md bg-surface-container hover:bg-surface-container-highest text-on-surface transition-all"
                }
                id={"btn-failure"}
                type="button"
                aria-label={actions.text("Failure / Retry")}
                data-handler={"switchState('failure')"}
              >
                {actions.text("Failure / Retry")}
              </button>
            </div>
          </div>

          <div
            className={
              "w-full bg-primary-container text-on-primary-container px-6 py-3 flex items-center justify-center gap-3 text-body-sm font-body-sm text-center shadow-sm"
            }
          >
            <span
              aria-hidden={true}
              className={"material-symbols-outlined text-[20px]"}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {"science"}
            </span>
            <span>
              <strong>{actions.text("TEST ENVIRONMENT ONLY")}</strong>
              {actions.text(
                " — No actual charges will be made. Use sandbox tokens for verification.",
              )}
            </span>
          </div>

          <div className={"max-w-7xl mx-auto w-full px-6 lg:px-12 py-10"}>
            <div
              className={"grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"}
            >
              <div className={"lg:col-span-7 space-y-8"}>
                <div
                  id={"state-initial"}
                  className={
                    actions.visible("state-initial", true)
                      ? "space-y-8 transition-opacity duration-300"
                      : "space-y-8 transition-opacity duration-300 hidden"
                  }
                >
                  <div>
                    <h1
                      className={
                        "text-headline-lg font-headline-lg text-on-surface mb-2"
                      }
                    >
                      {actions.text("Complete Your Subscription")}
                    </h1>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Configure your sandbox payment method to activate instant API access.",
                      )}
                    </p>
                  </div>

                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-6 shadow-md space-y-6"
                    }
                  >
                    <h2
                      className={
                        "text-headline-sm font-headline-sm text-on-surface flex items-center gap-2"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-primary"}
                      >
                        {"payments"}
                      </span>
                      {actions.text(
                        "\n              Select Sandbox Payment Method\n            ",
                      )}
                    </h2>
                    <div className={"grid grid-cols-1 md:grid-cols-3 gap-4"}>
                      <label
                        className={
                          "cursor-pointer relative flex flex-col p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border-2 border-primary"
                        }
                      >
                        <input
                          defaultChecked={true}
                          className={"absolute top-4 right-4 accent-primary"}
                          name={"payment_method"}
                          type={"radio"}
                          aria-label={actions.text("payment_method")}
                        />
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary mb-2 text-[24px]"
                          }
                        >
                          {"credit_card"}
                        </span>
                        <span
                          className={
                            "text-headline-sm font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("Test Credit Card")}
                        </span>
                        <span
                          className={
                            "text-code-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text("Visa •••• 4242")}
                        </span>
                      </label>
                      <label
                        className={
                          "cursor-pointer relative flex flex-col p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border-2 border-transparent"
                        }
                      >
                        <input
                          className={"absolute top-4 right-4 accent-primary"}
                          name={"payment_method"}
                          type={"radio"}
                          aria-label={actions.text("payment_method")}
                        />
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary mb-2 text-[24px]"
                          }
                        >
                          {"token"}
                        </span>
                        <span
                          className={
                            "text-headline-sm font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("Dev Credits")}
                        </span>
                        <span
                          className={
                            "text-code-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text("Balance: $1,250.00")}
                        </span>
                      </label>
                      <label
                        className={
                          "cursor-pointer relative flex flex-col p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border-2 border-transparent"
                        }
                      >
                        <input
                          className={"absolute top-4 right-4 accent-primary"}
                          name={"payment_method"}
                          type={"radio"}
                          aria-label={actions.text("payment_method")}
                        />
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary mb-2 text-[24px]"
                          }
                        >
                          {"account_balance_wallet"}
                        </span>
                        <span
                          className={
                            "text-headline-sm font-headline-sm text-on-surface"
                          }
                        >
                          {actions.text("PayPal Sandbox")}
                        </span>
                        <span
                          className={
                            "text-code-sm text-on-surface-variant mt-1"
                          }
                        >
                          {actions.text("test-buyer@apihub.io")}
                        </span>
                      </label>
                    </div>

                    <div className={"space-y-4 pt-4"}>
                      <div>
                        <label
                          className={
                            "block text-label-md font-label-md text-on-surface mb-1"
                          }
                        >
                          {actions.text("Cardholder Name")}
                        </label>
                        <input
                          className={
                            "w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary"
                          }
                          type={"text"}
                          defaultValue={"Alex Developer"}
                          aria-label={actions.text("Input")}
                        />
                      </div>
                      <div>
                        <label
                          className={
                            "block text-label-md font-label-md text-on-surface mb-1"
                          }
                        >
                          {actions.text("Card Number")}
                        </label>
                        <div className={"relative"}>
                          <input
                            className={
                              "w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant font-code-md text-on-surface focus:outline-none focus:border-primary"
                            }
                            type={"text"}
                            defaultValue={"4242 •••• •••• 4242"}
                            aria-label={actions.text("Input")}
                          />
                          <span
                            className={
                              "absolute right-3 top-2.5 text-code-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold"
                            }
                          >
                            {actions.text("SANDBOX VALID")}
                          </span>
                        </div>
                      </div>
                      <div className={"grid grid-cols-2 gap-4"}>
                        <div>
                          <label
                            className={
                              "block text-label-md font-label-md text-on-surface mb-1"
                            }
                          >
                            {actions.text("Expiration Date")}
                          </label>
                          <input
                            className={
                              "w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant font-code-md text-on-surface focus:outline-none focus:border-primary"
                            }
                            type={"text"}
                            defaultValue={"12/28"}
                            aria-label={actions.text("Input")}
                          />
                        </div>
                        <div>
                          <label
                            className={
                              "block text-label-md font-label-md text-on-surface mb-1"
                            }
                          >
                            {actions.text("CVV / CVC")}
                          </label>
                          <input
                            className={
                              "w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant font-code-md text-on-surface focus:outline-none focus:border-primary"
                            }
                            type={"password"}
                            defaultValue={"888"}
                            aria-label={actions.text("Input")}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={"pt-4"}>
                      <button
                        data-action-text={
                          "lock_reset Simulate Instant Sandbox Payment ($149.00)"
                        }
                        className={
                          "w-full py-4 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-body-lg font-headline-sm transition-all shadow-lg flex items-center justify-center gap-2"
                        }
                        type="button"
                        aria-label={actions.text(
                          "Simulate Instant Sandbox Payment ($149.00)",
                        )}
                        data-handler={"switchState('processing')"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined"}
                        >
                          {"lock_reset"}
                        </span>
                        {actions.text(
                          "\n                Simulate Instant Sandbox Payment ($149.00)\n              ",
                        )}
                      </button>
                      <p
                        className={
                          "text-center text-code-sm text-on-surface-variant mt-3"
                        }
                      >
                        {actions.text(
                          "By clicking, you authorize API HUB Test Sandbox to simulate recurring monthly billings.",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  id={"state-processing"}
                  className={
                    actions.visible("state-processing", false)
                      ? "space-y-8 transition-opacity duration-300"
                      : "space-y-8 transition-opacity duration-300 hidden"
                  }
                >
                  <div>
                    <h1
                      className={
                        "text-headline-lg font-headline-lg text-on-surface mb-2"
                      }
                    >
                      {actions.text("Processing Transaction")}
                    </h1>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Communicating with sandbox gateway and provisioning API credentials...",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-12 shadow-md flex flex-col items-center justify-center space-y-6 text-center"
                    }
                  >
                    <div
                      className={
                        "relative w-20 h-20 flex items-center justify-center"
                      }
                    >
                      <div
                        className={
                          "absolute inset-0 rounded-full border-4 border-surface-container animate-spin border-t-primary"
                        }
                      ></div>
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-primary text-[36px] animate-pulse"
                        }
                      >
                        {"bolt"}
                      </span>
                    </div>
                    <div className={"space-y-2"}>
                      <h3
                        className={
                          "text-headline-md font-headline-md text-on-surface"
                        }
                      >
                        {actions.text("Validating Sandbox Token...")}
                      </h3>
                      <p
                        className={
                          "text-body-sm text-on-surface-variant max-w-sm"
                        }
                      >
                        {actions.text(
                          "Please wait while we simulate ledger settlement and allocate rate-limit clusters.",
                        )}
                      </p>
                    </div>
                    <div
                      className={
                        "w-full max-w-md bg-surface-container h-2 rounded-full overflow-hidden"
                      }
                    >
                      <div
                        className={"bg-primary h-full w-3/4 animate-pulse"}
                      ></div>
                    </div>
                  </div>
                </div>

                <div
                  id={"state-success"}
                  className={
                    actions.visible("state-success", false)
                      ? "space-y-8 transition-opacity duration-300"
                      : "space-y-8 transition-opacity duration-300 hidden"
                  }
                >
                  <div>
                    <div
                      className={
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-md font-label-md mb-3"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"check_circle"}
                      </span>
                      {actions.text(
                        "\n              SUBSCRIPTION ACTIVATED\n            ",
                      )}
                    </div>
                    <h1
                      className={
                        "text-headline-lg font-headline-lg text-on-surface mb-2"
                      }
                    >
                      {actions.text("Payment Successful!")}
                    </h1>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "Your Neural LLM v4 Pro subscription is fully operational in the sandbox environment.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-6 shadow-md space-y-6"
                    }
                  >
                    <div
                      className={
                        "grid grid-cols-2 gap-4 pb-6 border-b border-outline-variant/30"
                      }
                    >
                      <div>
                        <span
                          className={
                            "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider block mb-1"
                          }
                        >
                          {actions.text("Transaction ID")}
                        </span>
                        <span
                          className={
                            "font-code-md text-on-surface font-semibold bg-surface-container-low px-2 py-1 rounded"
                          }
                        >
                          {actions.text("txn_sandbox_994821")}
                        </span>
                      </div>
                      <div>
                        <span
                          className={
                            "text-label-md font-label-md text-on-surface-variant uppercase tracking-wider block mb-1"
                          }
                        >
                          {actions.text("Timestamp")}
                        </span>
                        <span className={"text-body-md text-on-surface"}>
                          {actions.text("Oct 24, 2024 - 14:32 UTC")}
                        </span>
                      </div>
                    </div>
                    <div className={"space-y-3"}>
                      <h3
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Next Steps Action Bar")}
                      </h3>
                      <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                        <a
                          data-action-text={
                            "key Create API Key Generate secret token"
                          }
                          className={
                            "p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-3 group"
                          }
                          href={"#"}
                        >
                          <div
                            className={
                              "w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={"material-symbols-outlined"}
                            >
                              {"key"}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                "text-headline-sm font-headline-sm text-on-surface block"
                              }
                            >
                              {actions.text("Create API Key")}
                            </span>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("Generate secret token")}
                            </span>
                          </div>
                        </a>
                        <a
                          data-action-text={
                            "terminal Open Playground Test endpoint instantly"
                          }
                          className={
                            "p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-3 group"
                          }
                          href={"#"}
                        >
                          <div
                            className={
                              "w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={"material-symbols-outlined"}
                            >
                              {"terminal"}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                "text-headline-sm font-headline-sm text-on-surface block"
                              }
                            >
                              {actions.text("Open Playground")}
                            </span>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("Test endpoint instantly")}
                            </span>
                          </div>
                        </a>
                        <a
                          data-action-text={
                            "description View Docs SDKs & Guides"
                          }
                          className={
                            "p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-3 group"
                          }
                          href={"#"}
                        >
                          <div
                            className={
                              "w-10 h-10 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={"material-symbols-outlined"}
                            >
                              {"description"}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                "text-headline-sm font-headline-sm text-on-surface block"
                              }
                            >
                              {actions.text("View Docs")}
                            </span>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("SDKs & Guides")}
                            </span>
                          </div>
                        </a>
                        <a
                          data-action-text={
                            "dashboard Go to Dashboard View usage metrics"
                          }
                          className={
                            "p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-3 group"
                          }
                          href={"#"}
                        >
                          <div
                            className={
                              "w-10 h-10 rounded-lg bg-inverse-surface text-inverse-on-surface flex items-center justify-center group-hover:scale-105 transition-transform"
                            }
                          >
                            <span
                              aria-hidden={true}
                              className={"material-symbols-outlined"}
                            >
                              {"dashboard"}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                "text-headline-sm font-headline-sm text-on-surface block"
                              }
                            >
                              {actions.text("Go to Dashboard")}
                            </span>
                            <span
                              className={"text-body-sm text-on-surface-variant"}
                            >
                              {actions.text("View usage metrics")}
                            </span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  id={"state-failure"}
                  className={
                    actions.visible("state-failure", false)
                      ? "space-y-8 transition-opacity duration-300"
                      : "space-y-8 transition-opacity duration-300 hidden"
                  }
                >
                  <div>
                    <div
                      className={
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container text-on-error-container text-label-md font-label-md mb-3"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={"material-symbols-outlined text-[16px]"}
                      >
                        {"error"}
                      </span>
                      {actions.text(
                        "\n              TRANSACTION DECLINED\n            ",
                      )}
                    </div>
                    <h1
                      className={
                        "text-headline-lg font-headline-lg text-on-surface mb-2"
                      }
                    >
                      {actions.text("Sandbox Payment Failed")}
                    </h1>
                    <p className={"text-body-md text-on-surface-variant"}>
                      {actions.text(
                        "The test card was rejected by the sandbox acquiring bank simulator.",
                      )}
                    </p>
                  </div>
                  <div
                    className={
                      "bg-surface-container-lowest rounded-xl p-6 shadow-md space-y-6"
                    }
                  >
                    <div
                      className={
                        "p-4 rounded-lg bg-error-container/30 border border-error/20 flex items-start gap-3"
                      }
                    >
                      <span
                        aria-hidden={true}
                        className={
                          "material-symbols-outlined text-error text-[24px]"
                        }
                      >
                        {"report"}
                      </span>
                      <div>
                        <h4
                          className={
                            "text-headline-sm font-headline-sm text-on-surface mb-1"
                          }
                        >
                          {actions.text("Error Code: card_declined_sandbox")}
                        </h4>
                        <p className={"text-body-sm text-on-surface-variant"}>
                          {actions.text(
                            "The simulator returned an insufficient funds exception for test card ending in 4242. Please switch test tokens or retry with mock funding.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={"flex items-center gap-4 pt-2"}>
                      <button
                        data-action-text={"refresh Retry with Another Card"}
                        className={
                          "flex-1 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-body-md font-headline-sm transition-all shadow-md flex items-center justify-center gap-2"
                        }
                        type="button"
                        aria-label={actions.text("Retry with Another Card")}
                        data-handler={"switchState('initial')"}
                      >
                        <span
                          aria-hidden={true}
                          className={"material-symbols-outlined"}
                        >
                          {"refresh"}
                        </span>
                        {actions.text(
                          "\n                Retry with Another Card\n              ",
                        )}
                      </button>
                      <button
                        data-action-text={"Simulate Override Success"}
                        className={
                          "px-6 py-3 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded-xl text-body-md font-headline-sm transition-all"
                        }
                        type="button"
                        aria-label={actions.text("Simulate Override Success")}
                        data-handler={"switchState('success')"}
                      >
                        {actions.text(
                          "\n                Simulate Override Success\n              ",
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={"lg:col-span-5 space-y-6"}>
                <div
                  className={
                    "bg-surface-container-lowest rounded-xl p-6 shadow-md space-y-6 sticky top-24"
                  }
                >
                  <div className={"flex items-start justify-between"}>
                    <div>
                      <span
                        className={
                          "text-label-md font-label-md text-primary bg-primary-fixed px-2.5 py-1 rounded font-semibold uppercase tracking-wider"
                        }
                      >
                        {actions.text("Pro Tier")}
                      </span>
                      <h2
                        className={
                          "text-headline-md font-headline-md text-on-surface mt-2"
                        }
                      >
                        {actions.text("Neural LLM v4")}
                      </h2>
                    </div>
                    <div className={"text-right"}>
                      <span
                        className={
                          "text-headline-lg font-headline-lg text-on-surface"
                        }
                      >
                        {actions.text("$149")}
                      </span>
                      <span
                        className={"text-body-sm text-on-surface-variant block"}
                      >
                        {actions.text("/month")}
                      </span>
                    </div>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant"}>
                    {actions.text(
                      "Ultra-high performance inference engine optimized for complex reasoning, multi-turn dialogue, and code generation.",
                    )}
                  </p>
                  <div
                    className={
                      "space-y-3 pt-2 border-t border-outline-variant/30"
                    }
                  >
                    <h4
                      className={
                        "text-label-md font-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Plan Quotas & Limits")}
                    </h4>
                    <div
                      className={
                        "flex items-center justify-between p-3 rounded-lg bg-surface-container-low"
                      }
                    >
                      <div className={"flex items-center gap-2"}>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary text-[18px]"
                          }
                        >
                          {"data_usage"}
                        </span>
                        <span className={"text-body-sm text-on-surface"}>
                          {actions.text("Monthly Request Quota")}
                        </span>
                      </div>
                      <span
                        className={"font-code-md text-on-surface font-semibold"}
                      >
                        {actions.text("500,000 req")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between p-3 rounded-lg bg-surface-container-low"
                      }
                    >
                      <div className={"flex items-center gap-2"}>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary text-[18px]"
                          }
                        >
                          {"speed"}
                        </span>
                        <span className={"text-body-sm text-on-surface"}>
                          {actions.text("Rate Limit")}
                        </span>
                      </div>
                      <span
                        className={"font-code-md text-on-surface font-semibold"}
                      >
                        {actions.text("50 req / sec")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex items-center justify-between p-3 rounded-lg bg-surface-container-low"
                      }
                    >
                      <div className={"flex items-center gap-2"}>
                        <span
                          aria-hidden={true}
                          className={
                            "material-symbols-outlined text-primary text-[18px]"
                          }
                        >
                          {"neurology"}
                        </span>
                        <span className={"text-body-sm text-on-surface"}>
                          {actions.text("Context Window")}
                        </span>
                      </div>
                      <span
                        className={"font-code-md text-on-surface font-semibold"}
                      >
                        {actions.text("128k tokens")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "space-y-3 pt-4 border-t border-outline-variant/30"
                    }
                  >
                    <h4
                      className={
                        "text-label-md font-label-md text-on-surface uppercase tracking-wider"
                      }
                    >
                      {actions.text("Order Breakdown")}
                    </h4>
                    <div
                      className={
                        "flex justify-between text-body-sm text-on-surface-variant"
                      }
                    >
                      <span>{actions.text("Neural LLM v4 (Pro Plan)")}</span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("$149.00")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex justify-between text-body-sm text-on-surface-variant"
                      }
                    >
                      <span>{actions.text("Estimated Tax (Sandbox)")}</span>
                      <span className={"font-code-md text-on-surface"}>
                        {actions.text("$0.00")}
                      </span>
                    </div>
                    <div
                      className={
                        "flex justify-between text-body-sm text-on-surface-variant"
                      }
                    >
                      <span>{actions.text("Sandbox Gateway Fee")}</span>
                      <span
                        className={
                          "font-code-md text-emerald-600 font-semibold"
                        }
                      >
                        {actions.text("Waived ($0.00)")}
                      </span>
                    </div>
                    <div
                      className={
                        "pt-3 border-t border-outline-variant/30 flex justify-between items-center"
                      }
                    >
                      <span
                        className={
                          "text-headline-sm font-headline-sm text-on-surface"
                        }
                      >
                        {actions.text("Total Due Today")}
                      </span>
                      <span
                        className={
                          "text-headline-md font-headline-md text-primary"
                        }
                      >
                        {actions.text("$149.00")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      "p-4 rounded-xl bg-surface-container-low flex items-center gap-3"
                    }
                  >
                    <span
                      aria-hidden={true}
                      className={"material-symbols-outlined text-primary"}
                    >
                      {"verified_user"}
                    </span>
                    <div className={"text-body-sm"}>
                      <span className={"font-semibold text-on-surface block"}>
                        {actions.text("Sandbox Guarantee")}
                      </span>
                      <span className={"text-on-surface-variant"}>
                        {actions.text(
                          "Instant token generation upon simulation completion.",
                        )}
                      </span>
                    </div>
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
