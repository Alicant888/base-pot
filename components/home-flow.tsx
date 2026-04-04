"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowRight, CircleDollarSign, Clock3, History, ShieldCheck } from "lucide-react";

import { HowItWorksSheet } from "@/components/how-it-works-sheet";
import { WalletPanel } from "@/components/wallet-panel";

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

export function HomeFlow() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex min-h-[calc(100svh-5.5rem)] items-center justify-center lg:min-h-[calc(100svh-7rem)]">
        <section className="w-full max-w-md">
          <WalletPanel compact />
        </section>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100svh-5.5rem)] gap-4 lg:h-[calc(100svh-7rem)] lg:grid-cols-[0.82fr_1.18fr] lg:gap-5">
      <section className="order-1 flex min-h-0 flex-col items-center justify-center gap-4 lg:items-stretch lg:justify-center">
        <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white/88 p-5 text-center shadow-panel backdrop-blur sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base">
            Wallet connected
          </p>
          <h1 className="mt-3 text-[clamp(2rem,7vw,2.9rem)] font-semibold leading-[0.95] tracking-tight text-ink">
            Create the pot and share it.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            You are ready to start. Launch a new USDC pot in a few taps, open your history, or look
            through the flow once before you begin.
          </p>

          <div className="mt-5 grid gap-3">
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-base px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,82,255,0.22)]"
            >
              Create a pot
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/my-pots"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              <History className="size-4" />
              My pots
            </Link>
            <HowItWorksSheet />
          </div>
        </div>
      </section>

      <section className="order-2 hidden min-h-0 overflow-hidden rounded-[38px] border border-slate-200 bg-white shadow-panel lg:block">
        <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(0,82,255,0.16),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] p-6">
          <div className="absolute inset-x-6 top-6 h-24 rounded-[28px] bg-hero-grid opacity-60" />

          <div className="relative z-10">
            <p className="inline-flex rounded-full border border-line bg-white/86 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-base backdrop-blur">
              Wallet ready on Base
            </p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2rem,5vw,4.75rem)] font-semibold leading-[0.94] tracking-tight text-ink">
              Start the pot, then share one clean Base link.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              The wallet is already connected, so the next move is simple: create the pot, open
              your history, and send a link that feels native inside the app.
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
            <Link
              href="/my-pots"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              <History className="size-4" />
              My pots
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

            <div className="grid gap-3 self-end">
              <article className="rounded-[26px] border border-slate-200 bg-white/86 p-4 backdrop-blur">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-mist text-base ring-1 ring-line">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">Wallet already handled</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The entry step is done, so the screen can focus on the pot itself instead of a
                  full landing page.
                </p>
              </article>

              <article className="rounded-[26px] border border-slate-200 bg-white/86 p-4 backdrop-blur">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-mist text-base ring-1 ring-line">
                  <Clock3 className="size-5" />
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">Fast next move</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Create the pot now, open your history, or look through the flow and understand it
                  in one glance.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
