"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArrowRight, History, Plus, Undo2 } from "lucide-react";
import { useAccount } from "wagmi";

import { WalletPanel } from "@/components/wallet-panel";
import { potStatusChipStyles } from "@/lib/pot-status-ui";
import type { PotStatus } from "@/lib/pot-state";
import { cn, formatDateTime } from "@/lib/utils";

type CreatedPot = {
  slug: string;
  onchainPotId: number;
  title: string;
  description: string;
  goalAmount: string;
  deadline: string;
  createdAt: string;
  status: PotStatus;
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
  status: PotStatus;
};

type MyPotsResponse = {
  created: CreatedPot[];
  contributed: ContributedPot[];
};

type MyPotsPageProps = {
  mode?: "active" | "archive";
};

type HistoryCardItem = {
  key: string;
  archiveKey: string;
  href: Route | null;
  title: string;
  description: string;
  metaLeft: string;
  metaRight: string;
  footer: string;
  badge: PotStatus | null;
};

const EMPTY_DATA: MyPotsResponse = { created: [], contributed: [] };

function getArchiveStorageKey(address: string) {
  return `base-pot:archive:${address.toLowerCase()}`;
}

function readArchivedKeys(address: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(getArchiveStorageKey(address));
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

function writeArchivedKeys(address: string, keys: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getArchiveStorageKey(address), JSON.stringify([...keys]));
}

function getArchiveKey(slug: string | null, onchainPotId: number) {
  return slug ? `slug:${slug}` : `pot:${onchainPotId}`;
}

function buildActiveSections(data: MyPotsResponse, archivedKeys: Set<string>) {
  const created = data.created
    .map((item) => ({
      key: `created-${item.slug}`,
      archiveKey: getArchiveKey(item.slug, item.onchainPotId),
      href: `/pot/${item.slug}` as Route,
      title: item.title,
      description: item.description,
      metaLeft: `Goal ${item.goalAmount} USDC`,
      metaRight: `Created ${formatDateTime(item.createdAt)}`,
      footer: `Deadline ${formatDateTime(item.deadline)}`,
      badge: item.status,
    }))
    .filter((item) => !archivedKeys.has(item.archiveKey));

  const contributed = data.contributed
    .map((item) => ({
      key: `contributed-${item.onchainPotId}`,
      archiveKey: getArchiveKey(item.slug, item.onchainPotId),
      href: item.slug ? (`/pot/${item.slug}` as Route) : null,
      title: item.title,
      description: item.description,
      metaLeft: `You added ${item.contributedAmount} USDC`,
      metaRight: `Last activity ${formatDateTime(item.occurredAt)}`,
      footer: item.deadline
        ? `Deadline ${formatDateTime(item.deadline)}`
        : `Contract pot #${item.onchainPotId}`,
      badge: item.status,
    }))
    .filter((item) => !archivedKeys.has(item.archiveKey));

  return { created, contributed };
}

function buildArchiveItems(data: MyPotsResponse, archivedKeys: Set<string>) {
  const merged = new Map<string, HistoryCardItem>();

  for (const item of data.created) {
    const archiveKey = getArchiveKey(item.slug, item.onchainPotId);
    if (!archivedKeys.has(archiveKey)) {
      continue;
    }

    merged.set(archiveKey, {
      key: `archive-created-${item.slug}`,
      archiveKey,
      href: `/pot/${item.slug}` as Route,
      title: item.title,
      description: item.description,
      metaLeft: "Created pot",
      metaRight: formatDateTime(item.createdAt),
      footer: "",
      badge: item.status,
    });
  }

  for (const item of data.contributed) {
    const archiveKey = getArchiveKey(item.slug, item.onchainPotId);
    if (!archivedKeys.has(archiveKey) || merged.has(archiveKey)) {
      continue;
    }

    merged.set(archiveKey, {
      key: `archive-contributed-${item.onchainPotId}`,
      archiveKey,
      href: item.slug ? (`/pot/${item.slug}` as Route) : null,
      title: item.title,
      description: item.description,
      metaLeft: "Contributed pot",
      metaRight: formatDateTime(item.occurredAt),
      footer: "",
      badge: item.status,
    });
  }

  return [...merged.values()];
}

export function MyPotsPage({ mode = "active" }: MyPotsPageProps) {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<MyPotsResponse>(EMPTY_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archivedKeys, setArchivedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!address || !isConnected) {
      setArchivedKeys(new Set());
      return;
    }

    setArchivedKeys(readArchivedKeys(address));
  }, [address, isConnected]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!address || !isConnected) {
        setData(EMPTY_DATA);
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

  function updateArchivedKeys(updater: (current: Set<string>) => Set<string>) {
    setArchivedKeys((current) => {
      const next = updater(current);
      if (address) {
        writeArchivedKeys(address, next);
      }
      return next;
    });
  }

  function archiveItem(archiveKey: string) {
    updateArchivedKeys((current) => {
      const next = new Set(current);
      next.add(archiveKey);
      return next;
    });
  }

  function restoreItem(archiveKey: string) {
    updateArchivedKeys((current) => {
      const next = new Set(current);
      next.delete(archiveKey);
      return next;
    });
  }

  const sections = useMemo(() => buildActiveSections(data, archivedKeys), [data, archivedKeys]);
  const archiveItems = useMemo(() => buildArchiveItems(data, archivedKeys), [data, archivedKeys]);

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base">
            {mode === "archive" ? "Archive" : "My pots"}
          </p>

          <div className="flex flex-wrap gap-3">
            {mode === "archive" ? (
              <Link
                href="/my-pots"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-ink"
              >
                <History className="size-4" />
                My pots
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      {mode === "archive" ? (
        <ArchiveSection
          loading={loading}
          emptyText="Archived pots will show up here."
          items={archiveItems}
          onRestore={restoreItem}
        />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <HistorySection
              title="Created"
              loading={loading}
              emptyText="You have not created any pots yet."
              items={sections.created}
              onArchive={archiveItem}
            />

            <HistorySection
              title="Contributed"
              loading={loading}
              emptyText="Your contributions will show up here after you chip in to a pot."
              items={sections.contributed}
              onArchive={archiveItem}
            />
          </div>

          <div className="flex justify-center pt-2">
            <Link
              href="/archive"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink shadow-panel"
            >
              <Archive className="size-4" />
              Archive
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

type HistorySectionProps = {
  title: string;
  loading: boolean;
  emptyText: string;
  items: HistoryCardItem[];
  onArchive: (archiveKey: string) => void;
};

function HistorySection({ title, loading, emptyText, items, onArchive }: HistorySectionProps) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base">{title}</p>

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
                <div className="min-w-0 flex-1">
                  <h3 className="min-w-0 break-words text-lg font-semibold tracking-tight text-ink [overflow-wrap:anywhere]">
                    {item.title}
                  </h3>
                  <p className="mt-2 break-words text-sm leading-6 text-muted [overflow-wrap:anywhere]">
                    {item.description}
                  </p>
                </div>
                <div className="ml-3 flex shrink-0 flex-col items-end gap-2">
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
                  {item.badge ? (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                        item.badge === "FINALIZED" ? "px-2 tracking-[0.12em]" : null,
                        potStatusChipStyles[item.badge],
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                <span>{item.metaLeft}</span>
                <span>{item.metaRight}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-ink">{item.footer}</p>
                <button
                  type="button"
                  onClick={() => onArchive(item.archiveKey)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-muted transition hover:border-slate-300 hover:text-ink"
                  aria-label={`Archive ${item.title}`}
                >
                  <Archive className="size-4" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

type ArchiveSectionProps = {
  loading: boolean;
  emptyText: string;
  items: HistoryCardItem[];
  onRestore: (archiveKey: string) => void;
};

function ArchiveSection({ loading, emptyText, items, onRestore }: ArchiveSectionProps) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="mt-1 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[20px] border border-slate-200 bg-slate-50/75 p-4">
                <div className="h-5 w-40 rounded-full bg-slate-100" />
                <div className="mt-3 h-4 w-24 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-[24px] border border-slate-200 bg-slate-50/75 px-4 py-5 text-sm leading-6 text-muted">
            {emptyText}
          </p>
        ) : (
          items.map((item) => (
            <article key={item.key} className="rounded-[20px] border border-slate-200 bg-slate-50/75 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold tracking-tight text-ink">{item.title}</h3>
                  {item.badge ? (
                    <span
                      className={cn(
                        "mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                        potStatusChipStyles[item.badge],
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-ink"
                    >
                      Open
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onRestore(item.archiveKey)}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-muted transition hover:border-slate-300 hover:text-ink"
                    aria-label={`Restore ${item.title}`}
                  >
                    <Undo2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
