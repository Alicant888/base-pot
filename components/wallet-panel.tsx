"use client";

import { useMemo } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { targetChain } from "@/lib/chains";
import { shortAddress } from "@/lib/utils";

type WalletPanelProps = {
  compact?: boolean;
};

export function WalletPanel({ compact = false }: WalletPanelProps) {
  const { address, chainId, status, isConnected } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const orderedConnectors = useMemo(
    () =>
      [...connectors].sort((left, right) =>
        left.id === "baseAccount" ? -1 : right.id === "baseAccount" ? 1 : 0,
      ),
    [connectors],
  );

  if (isConnected) {
    return (
      <div
        className={
          compact
            ? "rounded-[28px] border border-slate-200 bg-white/94 p-4 shadow-panel backdrop-blur"
            : "rounded-3xl border border-slate-200 bg-white p-4 shadow-panel"
        }
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Connected
            </p>
            <p className="mt-1 text-sm font-semibold">{shortAddress(address)}</p>
            <p className="mt-1 text-sm text-muted">
              {chainId === targetChain.id
                ? `Ready on ${targetChain.name}`
                : `Switch to ${targetChain.name}`}
            </p>
          </div>
          <button
            onClick={() => disconnect()}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "rounded-[30px] border border-slate-200 bg-white/94 p-4 shadow-panel backdrop-blur"
          : "rounded-[32px] border border-slate-200 bg-white p-5 shadow-panel"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Wallet</p>
      <h3 className={compact ? "mt-2 text-xl font-semibold" : "mt-2 text-2xl font-semibold"}>
        {compact ? "Connect your wallet first" : "Connect in Base App or a browser wallet"}
      </h3>
      <p className={compact ? "mt-2 text-sm leading-6 text-muted" : "mt-2 max-w-xl text-sm text-muted"}>
        {compact
          ? "Base Account is first. Standard injected wallets still work in a regular browser."
          : "The same pot URL works with Base Account in-app and standard injected wallets in a browser."}
      </p>
      <div className={compact ? "mt-4 grid gap-3" : "mt-4 flex flex-wrap gap-3"}>
        {orderedConnectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connectAsync({ connector })}
            disabled={isPending}
            className={
              connector.id === "baseAccount"
                ? "inline-flex items-center justify-center rounded-full bg-base px-5 py-3 text-sm font-semibold text-white"
                : "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink"
            }
          >
            {isPending ? "Connecting..." : connector.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">Status: {status}</p>
    </div>
  );
}
