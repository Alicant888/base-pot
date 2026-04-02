import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreatePotForm } from "@/components/create-pot-form";

export default function CreatePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:gap-6">
      <div className="max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-ink shadow-sm backdrop-blur"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-xs">
          Create pot
        </p>
        <h1 className="mt-3 max-w-3xl text-[clamp(2.4rem,10vw,4.8rem)] font-semibold leading-[0.94] tracking-tight text-ink">
          Build the pot in one clean screen.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
          Set the target, deadline, recipient, and suggested amount, then move straight to the
          shareable link.
        </p>
      </div>

      <CreatePotForm />
    </div>
  );
}
