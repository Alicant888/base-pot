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
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] ring-1",
        status === "FINALIZED" ? "px-2.5 text-[11px] tracking-[0.12em]" : null,
        potStatusBadgeStyles[status],
      )}
    >
      {label ?? status}
    </span>
  );
}
