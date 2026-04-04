import { cn } from "@/lib/utils";
import { potStatusBadgeStyles } from "@/lib/pot-status-ui";
import type { PotStatus } from "@/lib/pot-state";

type StatusPillProps = {
  status: PotStatus;
  label?: string;
};

export function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[7.75rem] justify-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.12em] ring-1",
        status === "FINALIZED" ? "px-2 text-[10px] tracking-[0.06em]" : null,
        potStatusBadgeStyles[status],
      )}
    >
      {label ?? status}
    </span>
  );
}
