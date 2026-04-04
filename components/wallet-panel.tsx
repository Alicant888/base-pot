"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { AddressLabel } from "@/components/address-label";
import { targetChain } from "@/lib/chains";

type WalletPanelProps = {
  compact?: boolean;
};

export function WalletPanel({ compact = false }: WalletPanelProps) {
  const { address, chainId, status, isConnected } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [availableConnectorIds, setAvailableConnectorIds] = useState<string[]>([]);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function detectAvailability() {
      const checks = await Promise.all(
        connectors.map(async (connector) => {
          if (connector.id !== "injected") {
            return connector.id;
          }

          try {
            const provider = await connector.getProvider();
            return provider ? connector.id : null;
          } catch {
            return null;
          }
        }),
      );

      if (!cancelled) {
        setAvailableConnectorIds(checks.filter((id): id is string => Boolean(id)));
      }
    }

    void detectAvailability();

    return () => {
      cancelled = true;
    };
  }, [connectors]);

  const orderedConnectors = useMemo(
    () =>
      [...connectors]
        .filter((connector) => availableConnectorIds.includes(connector.id))
        .sort((left, right) =>
          left.id === "baseAccount" ? -1 : right.id === "baseAccount" ? 1 : 0,
        ),
    [availableConnectorIds, connectors],
  );

  const injectedAvailable = availableConnectorIds.includes("injected");
  const showRabbyHint = isMobileViewport && !injectedAvailable;

  if (isConnected) {
    return (
      <div
        className={
          compact
            ? "rounded-[28px] border border-slate-200 bg-white/96 p-4 text-center shadow-panel backdrop-blur"
            : "rounded-3xl border border-slate-200 bg-white p-4 shadow-panel"
        }
      >
        <div className={compact ? "space-y-3" : "flex items-center justify-between gap-4"}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Connected
            </p>
            <p className="mt-1 text-sm font-semibold">
              <AddressLabel address={address} />
            </p>
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
          ? "rounded-[30px] border border-slate-200 bg-white/96 p-5 text-center shadow-panel backdrop-blur"
          : "rounded-[32px] border border-slate-200 bg-white p-5 shadow-panel"
      }
    >
      {compact ? null : (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Wallet</p>
      )}
      <h3
        className={
          compact
            ? "text-2xl font-semibold tracking-tight"
            : "mt-2 text-2xl font-semibold"
        }
      >
        {compact ? "Connect your wallet" : "Connect in Base App or a browser wallet"}
      </h3>
      <p
        className={
          compact
            ? "mt-2 text-sm leading-6 text-muted"
            : "mt-2 max-w-xl text-sm text-muted"
        }
      >
        {compact
          ? "Use Base Account in the Base app, or connect an injected wallet in a regular browser."
          : "The same pot URL works with Base Account in-app and standard injected wallets in a browser."}
      </p>
      <div className={compact ? "mt-5 grid gap-3" : "mt-4 flex flex-wrap gap-3"}>
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
      {showRabbyHint ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Rabby on mobile usually works from the Rabby in-app browser, not from a regular mobile
          browser tab.
        </p>
      ) : null}
      {compact ? null : (
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">Status: {status}</p>
      )}
    </div>
  );
}
