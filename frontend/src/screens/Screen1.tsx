import { useScreenActions } from "../features/screen-actions";
export default function Screen1() {
  const actions = useScreenActions();
  return (
    <>
      <section
        className="stitch-screen"
        onClick={actions.click}
        onChange={actions.change}
        onKeyDown={actions.keydown}
      >
        <div
          className={
            "flex flex-col w-full items-center justify-center min-h-[80vh] px-space-md"
          }
        >
          <div className={"relative w-full max-w-xl"}>
            <div
              className={
                "absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-surface-container-highest/20 rounded-xl blur-xl pointer-events-none"
              }
            ></div>

            <div
              className={
                "relative bg-surface-container-lowest rounded-xl shadow-xl p-space-xl flex flex-col items-center text-center"
              }
            >
              <div
                className={
                  "absolute top-space-md right-space-md flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-low text-on-surface-variant font-label-md"
                }
              >
                <span
                  className={"w-2 h-2 rounded-full bg-error animate-pulse"}
                ></span>
                <span>{actions.text("ERROR 403: SECURE_SHELL_BREACH")}</span>
              </div>

              <div
                className={
                  "w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-space-lg text-primary shadow-sm"
                }
              >
                <span
                  aria-hidden={true}
                  className={"material-symbols-outlined text-4xl"}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {"security"}
                </span>
              </div>

              <h1
                className={
                  "font-headline-lg text-headline-lg text-on-surface mb-space-sm"
                }
              >
                {actions.text("\n        Access Denied\n      ")}
              </h1>

              <p
                className={
                  "font-body-md text-body-md text-on-surface-variant max-w-md mb-space-xl leading-relaxed"
                }
              >
                {actions.text("\n        Your current account credentials (")}
                <span
                  className={
                    "text-primary font-code-md bg-surface-container px-space-xs py-0.5 rounded"
                  }
                >
                  {actions.text("Consumer role")}
                </span>
                {actions.text(
                  ") do not have administrative privileges to access the Admin Console.\n      ",
                )}
              </p>

              <div
                className={
                  "w-full bg-surface-container-low rounded-lg p-space-md mb-space-xl text-left flex flex-col gap-space-xs font-code-md text-code-sm text-on-surface-variant"
                }
              >
                <div className={"flex justify-between items-center"}>
                  <span className={"text-outline"}>
                    {actions.text("REQUEST_ID:")}
                  </span>
                  <span className={"text-on-surface"}>
                    {actions.text("req_88f9a2b4e7c10")}
                  </span>
                </div>
                <div className={"flex justify-between items-center"}>
                  <span className={"text-outline"}>
                    {actions.text("TARGET_SCOPE:")}
                  </span>
                  <span className={"text-on-surface"}>
                    {actions.text("admin:console:write")}
                  </span>
                </div>
                <div className={"flex justify-between items-center"}>
                  <span className={"text-outline"}>
                    {actions.text("IDENTITY:")}
                  </span>
                  <span className={"text-on-surface"}>
                    {actions.text("dev@consumer-tier.internal")}
                  </span>
                </div>
              </div>

              <div className={"flex flex-col sm:flex-row gap-space-md w-full"}>
                <button
                  data-action-text={"dashboard Go to Permitted Dashboard"}
                  className={
                    "flex-1 bg-primary-container hover:bg-primary text-on-primary font-label-md py-space-md px-space-lg rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-space-sm group"
                  }
                  type="button"
                  aria-label={actions.text("Go to Permitted Dashboard")}
                  data-handler={"window.location.href='#'"}
                >
                  <span
                    aria-hidden={true}
                    className={
                      "material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform"
                    }
                  >
                    {"dashboard"}
                  </span>
                  {actions.text(
                    "\n          Go to Permitted Dashboard\n        ",
                  )}
                </button>

                <button
                  data-action-text={"swap_horiz Choose Another Workspace"}
                  className={
                    "flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md py-space-md px-space-lg rounded-lg transition-all duration-200 flex items-center justify-center gap-space-sm"
                  }
                  type="button"
                  aria-label={actions.text("Choose Another Workspace")}
                  data-handler={"window.location.href='#'"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-lg"}
                  >
                    {"swap_horiz"}
                  </span>
                  {actions.text(
                    "\n          Choose Another Workspace\n        ",
                  )}
                </button>
              </div>

              <div className={"mt-space-lg"}>
                <button
                  data-action-text={"arrow_back Return to Previous Page"}
                  className={
                    "font-label-md text-secondary hover:text-primary transition-colors flex items-center gap-space-xs"
                  }
                  type="button"
                  aria-label={actions.text("Return to Previous Page")}
                  data-handler={"window.history.back()"}
                >
                  <span
                    aria-hidden={true}
                    className={"material-symbols-outlined text-sm"}
                  >
                    {"arrow_back"}
                  </span>
                  {actions.text(
                    "\n          Return to Previous Page\n        ",
                  )}
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
