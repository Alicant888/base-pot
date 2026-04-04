"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppFrameProps = {
  children: ReactNode;
};

export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname();
  const hideHeader =
    pathname === "/create" ||
    pathname === "/my-pots" ||
    pathname === "/archive" ||
    pathname.startsWith("/pot/");
  const mainClassName = hideHeader
    ? "mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4"
    : "mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8";

  return (
    <div className="min-h-screen">
      {hideHeader ? null : (
        <header className="border-b border-slate-200/70 bg-white/84 backdrop-blur sm:border-slate-200/80">
          <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 sm:justify-between sm:px-6 sm:py-4 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full px-1 py-1 text-lg font-semibold tracking-tight"
            >
              <span className="inline-flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_18px_rgba(5,5,5,0.06)]">
                <Image
                  src="/brand/logo.png"
                  alt="Base Pot logo"
                  width={32}
                  height={32}
                  className="size-8 object-contain"
                  priority
                />
              </span>
              <span>Base Pot</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-semibold text-muted sm:flex">
              <Link href="/">Home</Link>
              <Link href="/create">Create</Link>
            </nav>
          </div>
        </header>
      )}
      <main className={mainClassName}>{children}</main>
    </div>
  );
}
