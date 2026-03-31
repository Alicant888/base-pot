import type { PotActivity } from "@/lib/onchain-activity";
import type { PotTuple } from "@/lib/pot-state";
import { derivePotStatus } from "@/lib/pot-state";
import { targetChain } from "@/lib/chains";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
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

export function PotOverview({ pot, onchainPot, activity }: PotPageStaticProps) {
  const raisedAmount = onchainPot?.[3] ?? 0n;
  const goalAmount = onchainPot?.[2] ?? parseUsdc(pot.goalAmount);
  const deadline = onchainPot?.[4]
    ? new Date(Number(onchainPot[4]) * 1000).toISOString()
    : pot.deadline;
  const progress = goalAmount === 0n ? 0 : Number((raisedAmount * 10000n) / goalAmount) / 100;
  const status = derivePotStatus(onchainPot);

  return (
    <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Share-ready pot
          </p>
          <div className="mt-3 flex items-center gap-3">
            {pot.emoji ? <span className="text-3xl">{pot.emoji}</span> : null}
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{pot.title}</h1>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{pot.description}</p>

      <div className="mt-8 grid gap-5 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 sm:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Raised</p>
          <p className="mt-2 text-2xl font-semibold">{formatUsdc(raisedAmount)} USDC</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Goal</p>
          <p className="mt-2 text-2xl font-semibold">{formatUsdc(goalAmount)} USDC</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Contributors
          </p>
          <p className="mt-2 text-2xl font-semibold">{activity.contributorCount}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Deadline</p>
          <p className="mt-2 text-lg font-semibold">{formatRelativeDeadline(deadline)}</p>
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar value={progress} />
        <div className="mt-2 flex justify-between text-sm text-muted">
          <span>{progress.toFixed(1)}% of target</span>
          <span>{formatDateTime(deadline)}</span>
        </div>
      </div>
    </section>
  );
}

export function PotSidebarStatic({ pot, onchainPot, activity }: PotPageStaticProps) {
  const recipientAddress = (onchainPot?.[1] ?? pot.recipientAddress) as string;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Pot details</p>
        <dl className="mt-4 space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Recipient</dt>
            <dd className="font-mono">{shortAddress(recipientAddress)}</dd>
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
            <dt className="text-muted">Metadata deadline</dt>
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
            activity.activities.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{item.type.replace("_", " ")}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    {formatDateTime(item.occurredAt)}
                  </p>
                </div>
                <p className="mt-2 text-muted">
                  {shortAddress(item.actorAddress)}
                  {item.amount ? ` | ${item.amount} USDC` : ""}
                </p>
              </div>
            ))
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
