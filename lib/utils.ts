import { clsx, type ClassValue } from "clsx";
import { formatUnits, parseUnits } from "viem";
import { twMerge } from "tailwind-merge";

import { USDC_DECIMALS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsdc(value: bigint, digits = 2) {
  const formatted = Number(formatUnits(value, USDC_DECIMALS));
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(formatted);
}

export function parseUsdc(value: string) {
  const normalized = value.trim() || "0";
  return parseUnits(normalized, USDC_DECIMALS);
}

export function shortAddress(address?: string | null) {
  if (!address) {
    return "Not set";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDateTime(input: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(input));
}

export function formatRelativeDeadline(input: string | Date) {
  const deadline = new Date(input).getTime();
  const delta = deadline - Date.now();
  const hours = Math.round(delta / 3_600_000);

  if (Math.abs(hours) < 24) {
    return `${hours >= 0 ? "in" : ""} ${Math.abs(hours)}h ${
      hours >= 0 ? "" : "ago"
    }`.trim();
  }

  const days = Math.round(hours / 24);
  return `${days >= 0 ? "in" : ""} ${Math.abs(days)}d ${
    days >= 0 ? "" : "ago"
  }`.trim();
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
