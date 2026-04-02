"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CircleDollarSign, Clock3, Share2, X } from "lucide-react";

const steps = [
  {
    icon: CircleDollarSign,
    title: "Create a pot",
    copy: "Set the goal, deadline, recipient, and suggested amount in one quick flow.",
    mobileCopy: "Set the goal, deadline, recipient, and amount.",
  },
  {
    icon: Share2,
    title: "Share the link",
    copy: "Send the same URL in Base App, Telegram, or any group chat.",
    mobileCopy: "Send the same URL into Base App or your group chat.",
  },
  {
    icon: Clock3,
    title: "Finalize or refund",
    copy: "If the goal lands, release the payout. If not, contributors claim refunds.",
    mobileCopy: "Finalize when it lands, or let contributors refund.",
  },
];

export function HowItWorksSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/88 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:border-base/25 hover:bg-white"
      >
        How it works
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/28 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-[100svh] w-full max-w-xl flex-col overflow-hidden bg-white shadow-[0_30px_90px_rgba(5,5,5,0.18)] sm:h-auto sm:max-h-[calc(100svh-3rem)] sm:rounded-[32px] sm:border sm:border-slate-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/96 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-ink transition hover:border-slate-300"
                  aria-label="Go back"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="hidden size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-ink sm:inline-flex"
                  aria-label="Close how it works"
                >
                  <X className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-ink transition hover:border-slate-300 sm:hidden"
                >
                  Done
                </button>
              </div>

              <div className="mt-4 text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base">
                  How it works
                </p>
                <h3 className="mt-2 text-[1.95rem] font-semibold leading-[1] tracking-tight text-ink sm:text-2xl">
                  Create, share, finish.
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted sm:hidden">
                  Three short steps, then you are back in the app.
                </p>
                <p className="mt-2 hidden text-sm leading-6 text-muted sm:block">
                  Open this, understand the path, and return to the app whenever you want.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-6">
              <div className="grid gap-3 sm:gap-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <article
                      key={step.title}
                      className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3.5 shadow-[0_10px_24px_rgba(5,5,5,0.04)] sm:rounded-[26px] sm:p-5"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-base shadow-sm ring-1 ring-slate-200 sm:size-11">
                          <Icon className="size-4 sm:size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted sm:text-xs">
                            0{index + 1}
                          </p>
                          <h4 className="mt-1 text-[1.1rem] font-semibold leading-[1.1] tracking-tight text-base sm:text-[1.35rem]">
                            {step.title}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-muted sm:hidden">{step.mobileCopy}</p>
                          <p className="mt-2 hidden text-sm leading-6 text-muted sm:block sm:text-[15px]">
                            {step.copy}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full bg-base px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,82,255,0.22)]"
              >
                Back to the app
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
