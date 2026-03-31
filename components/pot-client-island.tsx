"use client";

import dynamic from "next/dynamic";

type PotClientIslandProps = {
  pot: {
    onchainPotId: number;
    goalAmount: string;
    organizerAddress: string;
    suggestedContribution: string | null;
  };
};

const PotClient = dynamic(
  () => import("@/components/pot-client").then((module) => module.PotClient),
  {
    ssr: false,
    loading: () => <PotClientFallback />,
  },
);

export function PotClientIsland({ pot }: PotClientIslandProps) {
  return <PotClient pot={pot} />;
}

function PotClientFallback() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-panel">
        <div className="h-4 w-24 rounded-full bg-slate-100" />
        <div className="mt-4 h-8 w-56 rounded-full bg-slate-100" />
        <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-4/5 rounded-full bg-slate-100" />
        <div className="mt-5 flex gap-3">
          <div className="h-11 w-32 rounded-full bg-slate-100" />
          <div className="h-11 w-36 rounded-full bg-slate-100" />
        </div>
      </section>

      <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
        <div className="h-4 w-24 rounded-full bg-slate-100" />
        <div className="mt-4 h-8 w-64 rounded-full bg-slate-100" />
        <div className="mt-6 h-12 w-full rounded-2xl bg-slate-100" />
        <div className="mt-4 flex gap-3">
          <div className="h-11 w-32 rounded-full bg-slate-100" />
          <div className="h-11 w-36 rounded-full bg-slate-100" />
        </div>
      </section>

      <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
        <div className="h-4 w-32 rounded-full bg-slate-100" />
        <div className="mt-4 h-8 w-72 rounded-full bg-slate-100" />
        <div className="mt-6 flex gap-3">
          <div className="h-11 w-32 rounded-full bg-slate-100" />
          <div className="h-11 w-32 rounded-full bg-slate-100" />
          <div className="h-11 w-32 rounded-full bg-slate-100" />
        </div>
      </section>
    </div>
  );
}
