"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, House, Share2 } from "lucide-react";

type PotBottomBarProps = {
  slug: string;
  title: string;
};

export function PotBottomBar({ slug, title }: PotBottomBarProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const shareUrl =
    typeof window === "undefined"
      ? `/pot/${slug}`
      : new URL(`/pot/${slug}`, window.location.origin).toString();

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
        // fall through to clipboard when share is dismissed or unsupported in the current webview
      }
    }

    await handleCopy();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white/96 p-3 shadow-[0_-8px_32px_rgba(5,5,5,0.08)] backdrop-blur">
        {feedback ? <p className="px-2 pb-2 text-center text-sm text-muted">{feedback}</p> : null}
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-ink"
          >
            <House className="size-4" />
            Back home
          </Link>
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
        </div>
      </div>
    </div>
  );
}
