import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "h-3 overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-slate-200",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-base transition-[width] duration-500"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
