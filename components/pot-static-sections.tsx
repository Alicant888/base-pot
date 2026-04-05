import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { targetChain } from "@/lib/chains";
import { getBasenameMap } from "@/lib/basenames";
import type { PotActivity } from "@/lib/onchain-activity";
import type { PotTuple } from "@/lib/pot-state";
import { derivePotStatus } from "@/lib/pot-state";
import {
  formatDateTime,
  formatRelativeDeadline,
  formatUsdc,
  parseUsdc,
  shortAddress,
} from "@/lib/utils";

type PotPageStaticProps = {
  pot: {
    onchainPotId: number;
    title: string;
    description: string;
    goalAmount: string;
    deadline: string;
    recipientAddress: string;
    organizerAddress: string;
    emoji: string | null;
  };
  onchainPot: PotTuple | undefined;
  activity: {
    contributorCount: number;
    activities: PotActivity[];
  };
};

export async function PotOverview({ pot, onchainPot, activity }: PotPageStaticProps) {
  const displayEmoji = pot.emoji && pot.emoji !== "*" ? pot.emoji : null;
  const raisedAmount = onchainPot?.[3] ?? 0n;
  const goalAmount = onchainPot?.[2] ?? parseUsdc(pot.goalAmount);
  const deadline = onchainPot?.[4]
    ? new Date(Number(onchainPot[4]) * 1000).toISOString()
    : pot.deadline;
  const progress = goalAmount === 0n ? 0 : Number((raisedAmount * 10000n) / goalAmount) / 100;
  const status = derivePotStatus(onchainPot);

  return (
    <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Share-ready pot
        </p>
        <div className="shrink-0">
          <StatusPill status={status} />
        </div>
      </div>

      <div className="mt-3 flex w-full min-w-0 items-start gap-3">
        {displayEmoji ? <span className="text-3xl">{displayEmoji}</span> : null}
        <h1 className="min-w-0 w-full max-w-none break-words text-[1.65rem] font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-[2.1rem]">
          {pot.title}
        </h1>
      </div>

      <p className="mt-5 max-w-2xl break-words text-base leading-7 text-muted [overflow-wrap:anywhere]">
        {pot.description}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Raised</p>
          <p className="mt-2 text-xl font-semibold sm:text-2xl">{formatUsdc(raisedAmount)} USDC</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Goal</p>
          <p className="mt-2 text-xl font-semibold sm:text-2xl">{formatUsdc(goalAmount)} USDC</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Contributors</p>
          <p className="mt-2 text-xl font-semibold sm:text-2xl">{activity.contributorCount}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Deadline</p>
          <p className="mt-2 text-base font-semibold sm:text-lg">{formatRelativeDeadline(deadline)}</p>
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar value={progress} />
        <div className="mt-2 flex justify-between gap-4 text-sm text-muted">
          <span>{progress.toFixed(1)}% of target</span>
          <span className="break-words text-right [overflow-wrap:anywhere]">{formatDateTime(deadline)}</span>
        </div>
      </div>
    </section>
  );
}

export async function PotSidebarStatic({ pot, onchainPot, activity }: PotPageStaticProps) {
  const recipientAddress = (onchainPot?.[1] ?? pot.recipientAddress) as string;
  const basenames = await getBasenameMap([
    recipientAddress,
    ...activity.activities.map((item) => item.actorAddress),
  ]);
  const recipientLabel = basenames.get(recipientAddress.toLowerCase()) ?? shortAddress(recipientAddress);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Pot details</p>
        <dl className="mt-4 space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Recipient</dt>
            <dd className="max-w-[13rem] break-words text-right font-medium [overflow-wrap:anywhere]" title={recipientAddress}>
              {recipientLabel}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Chain</dt>
            <dd className="font-semibold">{targetChain.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Contract pot ID</dt>
            <dd className="font-semibold">#{pot.onchainPotId}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Deadline</dt>
            <dd className="font-semibold">{formatDateTime(pot.deadline)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Recent activity
        </p>
        <div className="mt-4 space-y-4">
          {activity.activities.length > 0 ? (
            activity.activities.slice(0, 8).map((item) => {
              const actorLabel = basenames.get(item.actorAddress.toLowerCase()) ?? shortAddress(item.actorAddress);

              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{item.type.replace("_", " ")}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">
                      {formatDateTime(item.occurredAt)}
                    </p>
                  </div>
                  <p className="mt-2 break-words text-muted [overflow-wrap:anywhere]" title={item.actorAddress}>
                    {actorLabel}
                    {item.amount ? ` | ${item.amount} USDC` : ""}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted">
              Activity appears here after successful contributions, refunds, or organizer actions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
