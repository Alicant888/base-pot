"use client";

import { useEffect, useState } from "react";

import { shortAddress } from "@/lib/utils";

const basenameCache = new Map<string, string | null>();

type AddressLabelProps = {
  address?: string | null;
  className?: string;
};

export function AddressLabel({ address, className }: AddressLabelProps) {
  const normalizedAddress = address?.toLowerCase() ?? null;
  const [label, setLabel] = useState(() => shortAddress(address));

  useEffect(() => {
    setLabel(shortAddress(address));

    if (!address || !normalizedAddress) {
      return;
    }

    const addressKey = normalizedAddress;
    const cached = basenameCache.get(addressKey);
    if (typeof cached !== "undefined") {
      if (cached) {
        setLabel(cached);
      }
      return;
    }

    let cancelled = false;

    async function loadBasename() {
      try {
        const response = await fetch(`/api/basenames?address=${address}`, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error("Failed to resolve basename.");
        }

        const json = (await response.json()) as { basename?: string | null };
        const basename = json.basename?.trim() || null;
        basenameCache.set(addressKey, basename);

        if (!cancelled && basename) {
          setLabel(basename);
        }
      } catch {
        basenameCache.set(addressKey, null);
      }
    }

    void loadBasename();

    return () => {
      cancelled = true;
    };
  }, [address, normalizedAddress]);

  return (
    <span className={className} title={address ?? undefined}>
      {label}
    </span>
  );
}
