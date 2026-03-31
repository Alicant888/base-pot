import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-white text-ink ring-slate-200",
  FUNDED: "bg-base/10 text-base ring-base/20",
  FINALIZED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
  EXPIRED: "bg-amber-50 text-amber-700 ring-amber-200",
  REFUNDABLE: "bg-rose-50 text-rose-700 ring-rose-200",
};

type StatusPillProps = {
  status: keyof typeof statusStyles;
  label?: string;
};

export function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] ring-1",
        statusStyles[status],
      )}
    >
      {label ?? status}
    </span>
  );
}
