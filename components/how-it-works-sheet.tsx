"use client";

import { useState } from "react";
import { CircleDollarSign, Clock3, Share2, X } from "lucide-react";

const steps = [
  {
    icon: CircleDollarSign,
    title: "Create a pot",
    copy: "Set a goal, deadline, recipient, and suggested amount in one short flow.",
  },
  {
    icon: Share2,
    title: "Share the link",
    copy: "Drop the same URL into Base App, Telegram, or any group chat.",
  },
  {
    icon: Clock3,
    title: "Finalize or refund",
    copy: "If the goal lands, finalize payout. If not, contributors claim refunds.",
  },
];

export function HowItWorksSheet() {
  const [open, setOpen] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/20 p-4 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="w-full max-w-xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(5,5,5,0.16)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  How it works
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                  One clean flow from link to payout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-ink"
                aria-label="Close how it works"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-3 px-5 py-5 sm:px-6 sm:py-6">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.title}
                    className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-base shadow-sm ring-1 ring-slate-200">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          0{index + 1}
                        </p>
                        <h4 className="mt-1 text-base font-semibold sm:text-lg">{step.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
