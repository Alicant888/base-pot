"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Share2 } from "lucide-react";

type PotCreatedNoticeProps = {
  slug: string;
  title: string;
};

export function PotCreatedNotice({ slug, title }: PotCreatedNoticeProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);

  const shareUrl = useMemo(
    () =>
      typeof window === "undefined"
        ? `/pot/${slug}`
        : new URL(`/pot/${slug}`, window.location.origin).toString(),
    [slug],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback("Link copied.");
    } catch {
      setFeedback("Copy failed.");
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Base Pot`,
          text: `Join ${title} on Base Pot.`,
          url: shareUrl,
        });
        setFeedback(null);
        return;
      } catch {
        // fall back to copy when share is dismissed or unavailable in the current webview
      }
    }

    await handleCopy();
  }

  function handleContinue() {
    router.replace(`/pot/${slug}`);
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] p-5 shadow-panel sm:p-6">
      <div className="flex items-start gap-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-mist text-base ring-1 ring-line">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base">Pot created</p>
          <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight text-ink [overflow-wrap:anywhere]">
            Link ready to share.
          </h2>
          <p className="mt-2 break-words text-sm leading-6 text-muted [overflow-wrap:anywhere]">
            Your pot is live. Share the link now, or continue into the pot page.
          </p>
          <p className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap rounded-2xl bg-white px-4 py-3 text-sm text-muted ring-1 ring-slate-200">
            {shareUrl}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-ink"
        >
          <Copy className="size-4" />
          Copy link
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-base px-4 py-3 text-sm font-semibold text-white"
        >
          <Share2 className="size-4" />
          Share
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-ink"
        >
          Continue
        </button>
      </div>

      {feedback ? <p className="mt-3 text-sm text-muted">{feedback}</p> : null}
    </section>
  );
}
