import type { PotStatus } from "@/lib/pot-state";

export const potStatusBadgeStyles: Record<PotStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  FUNDED: "bg-base/10 text-base ring-base/20",
  FINALIZED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-rose-50 text-rose-600 ring-rose-200",
  EXPIRED: "bg-amber-50 text-amber-700 ring-amber-200",
  REFUNDABLE: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const potStatusChipStyles: Record<PotStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600",
  FUNDED: "bg-base/10 text-base",
  FINALIZED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-rose-50 text-rose-600",
  EXPIRED: "bg-amber-50 text-amber-700",
  REFUNDABLE: "bg-rose-50 text-rose-700",
};

export const potStatusTextStyles: Record<PotStatus, string> = {
  ACTIVE: "text-emerald-600",
  FUNDED: "text-base",
  FINALIZED: "text-slate-700",
  CANCELLED: "text-rose-600",
  EXPIRED: "text-amber-700",
  REFUNDABLE: "text-rose-700",
};
