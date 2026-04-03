import Link from "next/link";

export function HowItWorksSheet() {
  return (
    <Link
      href="/how-it-works"
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/88 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:border-base/25 hover:bg-white"
    >
      How it works
    </Link>
  );
}
