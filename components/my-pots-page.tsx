"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, History, Plus } from "lucide-react";
import { useAccount } from "wagmi";

import { WalletPanel } from "@/components/wallet-panel";
import { formatDateTime } from "@/lib/utils";

type CreatedPot = {
  slug: string;
  onchainPotId: number;
  title: string;
  description: string;
  goalAmount: string;
  deadline: string;
  createdAt: string;
};

type ContributedPot = {
  slug: string | null;
  onchainPotId: number;
  title: string;
  description: string;
  goalAmount: string | null;
  deadline: string | null;
  contributedAmount: string;
  occurredAt: string;
};

type MyPotsResponse = {
  created: CreatedPot[];
  contributed: ContributedPot[];
};

export function MyPotsPage() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<MyPotsResponse>({ created: [], contributed: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!address || !isConnected) {
        setData({ created: [], contributed: [] });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/my-pots?address=${address}`, { cache: "no-store" });
        const json = (await response.json()) as MyPotsResponse & { error?: string };

        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load pot history.");
        }

        if (!cancelled) {
          setData({
            created: json.created ?? [],
            contributed: json.contributed ?? [],
          });
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Failed to load pot history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-5.5rem)] max-w-md items-center justify-center lg:min-h-[calc(100svh-7rem)]">
        <WalletPanel compact />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white/92 p-5 shadow-panel backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base">
              My pots
            </p>
            <h1 className="mt-3 text-[clamp(2rem,7vw,3rem)] font-semibold leading-[0.95] tracking-tight text-ink">
              Created and contributed.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Keep your own pots and the ones you backed in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-ink"
            >
              <History className="size-4" />
              Home
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-base px-4 py-3 text-sm font-semibold text-white"
            >
              <Plus className="size-4" />
              Create a pot
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <HistorySection
          title="Created"
          subtitle="Pots you started"
          loading={loading}
          emptyText="You have not created any pots yet."
          items={data.created.map((item) => ({
            key: `created-${item.slug}`,
            href: `/pot/${item.slug}` as Route,
            title: item.title,
            description: item.description,
            metaLeft: `Goal ${item.goalAmount} USDC`,
            metaRight: `Created ${formatDateTime(item.createdAt)}`,
            footer: `Deadline ${formatDateTime(item.deadline)}`,
          }))}
        />

        <HistorySection
          title="Contributed"
          subtitle="Pots you already backed"
          loading={loading}
          emptyText="Your contributions will show up here after you chip in to a pot."
          items={data.contributed.map((item) => ({
            key: `contributed-${item.onchainPotId}`,
            href: item.slug ? (`/pot/${item.slug}` as Route) : null,
            title: item.title,
            description: item.description,
            metaLeft: `You added ${item.contributedAmount} USDC`,
            metaRight: `Last activity ${formatDateTime(item.occurredAt)}`,
            footer: item.deadline
              ? `Deadline ${formatDateTime(item.deadline)}`
              : `Contract pot #${item.onchainPotId}`,
          }))}
        />
      </div>
    </div>
  );
}

type HistoryCardItem = {
  key: string;
  href: Route | null;
  title: string;
  description: string;
  metaLeft: string;
  metaRight: string;
  footer: string;
};

type HistorySectionProps = {
  title: string;
  subtitle: string;
  loading: boolean;
  emptyText: string;
  items: HistoryCardItem[];
};

function HistorySection({ title, subtitle, loading, emptyText, items }: HistorySectionProps) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base">{title}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{subtitle}</h2>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-4">
                <div className="h-5 w-32 rounded-full bg-slate-100" />
                <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
                <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-[24px] border border-slate-200 bg-slate-50/75 px-4 py-5 text-sm leading-6 text-muted">
            {emptyText}
          </p>
        ) : (
          items.map((item) => (
            <article key={item.key} className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                </div>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-ink"
                  >
                    Open
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <span className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-muted">
                    No link yet
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                <span>{item.metaLeft}</span>
                <span>{item.metaRight}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-ink">{item.footer}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
