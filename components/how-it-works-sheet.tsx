"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CircleDollarSign, Clock3, Share2, X } from "lucide-react";

const steps = [
  {
    icon: CircleDollarSign,
    title: "Create a pot",
    copy: "Set the goal, deadline, recipient, and amount.",
  },
  {
    icon: Share2,
    title: "Share the link",
    copy: "Send the same URL into Base App or your group chat.",
  },
  {
    icon: Clock3,
    title: "Finalize or refund",
    copy: "Finalize when it lands, or let contributors refund.",
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/24 px-4 py-6 backdrop-blur-[3px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white/96 p-4 text-center shadow-[0_30px_90px_rgba(5,5,5,0.18)] backdrop-blur sm:max-w-lg sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
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
                className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-ink"
                aria-label="Close how it works"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base">
                How it works
              </p>
              <h3 className="mt-2 text-[1.9rem] font-semibold leading-[1] tracking-tight text-ink">
                Create, share, finish.
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Three short steps, centered in one quick overlay.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.title}
                    className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 shadow-[0_10px_24px_rgba(5,5,5,0.04)]"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-base shadow-sm ring-1 ring-slate-200">
                        <Icon className="size-4" />
                      </div>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        0{index + 1}
                      </p>
                      <h4 className="mt-1 text-[1.1rem] font-semibold leading-[1.1] tracking-tight text-base">
                        {step.title}
                      </h4>
                      <p className="mt-2 max-w-[18rem] text-sm leading-6 text-muted">{step.copy}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-base px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,82,255,0.22)]"
            >
              Back to the app
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
