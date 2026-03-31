import Link from "next/link";
import { ArrowRight, Clock3, Share2, Wallet } from "lucide-react";

import { WalletPanel } from "@/components/wallet-panel";

const useCases = [
  {
    title: "Trip deposit",
    copy: "Collect one clean USDC target before the apartment booking deadline.",
  },
  {
    title: "Team gift",
    copy: "Drop one link in chat, watch progress move, then finalize when the goal lands.",
  },
  {
    title: "Event float",
    copy: "Run a time-boxed collection with a clear refund path if plans fall through.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-panel">
        <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex rounded-full bg-mist px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-base">
              Create → Share → Contribute → Finalize / Refund
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              One share link for USDC group collections on Base.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Base Pot keeps the flow narrow on purpose: spin up a goal, post the link, let people
              connect and contribute, then pay out or refund cleanly.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full bg-base px-6 py-4 text-sm font-semibold text-white"
              >
                Create a pot
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-4 text-sm font-semibold"
              >
                How it works
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                <Wallet className="size-5 text-base" />
                <p className="mt-3 text-sm font-semibold">Base App + browser wallets</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                <Share2 className="size-5 text-base" />
                <p className="mt-3 text-sm font-semibold">Share-ready destination page</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
                <Clock3 className="size-5 text-base" />
                <p className="mt-3 text-sm font-semibold">Finalize or refund when the timer ends</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[36px] bg-hero-grid opacity-70" />
            <div className="relative z-10 space-y-5 rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel">
              <div className="rounded-[28px] bg-ink p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Sample Pot
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Neighborhood festival float</h2>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Raising 600 USDC for deposits and supplies before Friday night.
                </p>
                <div className="mt-6 h-3 rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-white" />
                </div>
                <div className="mt-3 flex justify-between text-sm text-white/75">
                  <span>408 / 600 USDC</span>
                  <span>18 contributors</span>
                </div>
              </div>
              <WalletPanel compact />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-4 lg:grid-cols-3">
        {useCases.map((useCase, index) => (
          <article
            key={useCase.title}
            className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-panel"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              0{index + 1}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{useCase.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{useCase.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
