import Link from "next/link";
import { CircleDollarSign, Clock3, Share2 } from "lucide-react";

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

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-5.5rem)] max-w-md items-center justify-center lg:min-h-[calc(100svh-7rem)]">
      <div className="w-full px-4 py-2 sm:px-0 sm:py-0">
        <div className="grid gap-3 sm:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 text-center shadow-[0_10px_24px_rgba(5,5,5,0.04)]"
              >
                <div className="flex flex-col items-center">
                  <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-base shadow-sm ring-1 ring-slate-200">
                    <Icon className="size-4" />
                  </div>
                  <h1 className="mt-3 text-[1.1rem] font-semibold leading-[1.1] tracking-tight text-base">
                    {index + 1}. {step.title}
                  </h1>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-muted">{step.copy}</p>
                </div>
              </article>
            );
          })}
        </div>

        <Link
          href="/"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-base px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,82,255,0.22)]"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
