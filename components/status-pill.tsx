import { cn } from "@/lib/utils";
import { potStatusBadgeStyles, potStatusLabelStyles } from "@/lib/pot-status-ui";
import type { PotStatus } from "@/lib/pot-state";

type StatusPillProps = {
  status: PotStatus;
  label?: string;
};

export function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-[7.75rem] items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.12em] ring-1",
        potStatusBadgeStyles[status],
      )}
    >
      <span className={cn("inline-block uppercase", potStatusLabelStyles[status])}>
        {label ?? status}
      </span>
    </span>
  );
}
