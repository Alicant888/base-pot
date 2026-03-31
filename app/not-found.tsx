import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-panel sm:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Not found</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">That pot link does not exist.</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
        It may not have been created yet, or the slug was copied incorrectly. You can start a new
        one in a few seconds.
      </p>
      <Link
        href="/create"
        className="mt-8 inline-flex rounded-full bg-base px-6 py-3 text-sm font-semibold text-white"
      >
        Create a pot
      </Link>
    </div>
  );
}
