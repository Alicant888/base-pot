import Link from "next/link";
import { ArrowRight, CircleDollarSign, Clock3, ShieldCheck, Sparkles } from "lucide-react";

import { HowItWorksSheet } from "@/components/how-it-works-sheet";
import { WalletPanel } from "@/components/wallet-panel";

const quickSignals = [
  {
    title: "One page",
    copy: "Open, connect, act.",
  },
  {
    title: "Base-native",
    copy: "Built for Base App first.",
  },
  {
    title: "Refund path",
    copy: "Clean fallback if the goal misses.",
  },
];

const sampleStats = [
  {
    label: "Raised",
    value: "408 / 600",
  },
  {
    label: "Contributors",
    value: "18",
  },
  {
    label: "Deadline",
    value: "Tonight",
  },
];

export default function LandingPage() {
  return (
    <div className="grid h-[calc(100svh-6rem)] gap-4 overflow-hidden lg:h-[calc(100svh-7rem)] lg:grid-cols-[0.88fr_1.12fr] lg:gap-5">
      <section className="order-1 flex min-h-0 flex-col gap-4">
        <div className="rounded-[34px] border border-slate-200/90 bg-white/88 p-4 shadow-panel backdrop-blur sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Start here
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[2rem]">
                Base Pot
              </h1>
            </div>
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-mist text-base ring-1 ring-line">
              <Sparkles className="size-5" />
            </div>
          </div>

          <WalletPanel compact />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {quickSignals.map((signal) => (
            <article
              key={signal.title}
              className="rounded-[24px] border border-slate-200 bg-white/82 p-3 shadow-panel backdrop-blur"
            >
              <p className="text-sm font-semibold leading-5">{signal.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{signal.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="order-2 min-h-0 overflow-hidden rounded-[38px] border border-slate-200 bg-white shadow-panel">
        <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(0,82,255,0.16),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] p-5 sm:p-6">
          <div className="absolute inset-x-5 top-5 h-24 rounded-[28px] bg-hero-grid opacity-60 sm:inset-x-6 sm:top-6" />

          <div className="relative z-10">
            <p className="inline-flex rounded-full border border-line bg-white/86 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-base backdrop-blur">
              Mobile-first Base App flow
            </p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2rem,6vw,4.75rem)] font-semibold leading-[0.94] tracking-tight text-ink">
              Collect USDC without turning the link into a website.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              Open the link, connect the wallet, understand the goal instantly, and move into
              action without hunting through a long landing page.
            </p>
          </div>

          <div className="relative z-10 mt-5 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-base px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,82,255,0.22)] transition hover:bg-[#0047db]"
            >
              Create a pot
              <ArrowRight className="size-4" />
            </Link>
            <HowItWorksSheet />
          </div>

          <div className="relative z-10 mt-5 grid min-h-0 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[30px] bg-ink p-5 text-white shadow-[0_18px_54px_rgba(5,5,5,0.12)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                    Sample pot
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.9rem]">
                    Neighborhood festival float
                  </h3>
                </div>
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                  <CircleDollarSign className="size-5" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-white/74">
                Raising deposits and supply costs before the Friday vendor deadline.
              </p>

              <div className="mt-5 h-3 rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full bg-white" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {sampleStats.map((stat) => (
                  <div key={stat.label} className="rounded-[20px] bg-white/8 px-3 py-3 ring-1 ring-white/8">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 self-end sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-[26px] border border-slate-200 bg-white/86 p-4 backdrop-blur">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-mist text-base ring-1 ring-line">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">Wallet first</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Base Account is the first move on mobile, with injected wallets still available in
                  a normal browser.
                </p>
              </article>

              <article className="rounded-[26px] border border-slate-200 bg-white/86 p-4 backdrop-blur">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-mist text-base ring-1 ring-line">
                  <Clock3 className="size-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">Action in one view</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The goal, deadline, progress, and next move should all fit naturally inside the
                  first app screen.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
