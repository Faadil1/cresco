"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/shell";
import { cn } from "@/components/ui/primitives";
import { auth } from "@/services";
import { useStore } from "@/state/store";

const LINKS = [
  { href: "/parent", label: "Overview" },
  { href: "/parent/limits", label: "Limits" },
  { href: "/parent/add-money", label: "Demo credit" },
  { href: "/parent/settings", label: "Settings" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { state, dispatch, hydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [switching, setSwitching] = useState(false);
  const allowed = state.session?.role === "parent";

  const switchToChild = async () => {
    setSwitching(true);
    try {
      const session = await auth.signInDemo("child", state.profile.childName);
      dispatch({ type: "signIn", session });
      router.push("/home");
    } finally {
      setSwitching(false);
    }
  };

  useEffect(() => {
    if (hydrated && !allowed) router.replace("/parent/sign-in");
  }, [hydrated, allowed, router]);

  return (
    <div className="cresco-app-workspace min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-4 px-5 md:px-8">
          <Link href="/parent" aria-label="Parent overview" className="flex items-center gap-2">
            <Wordmark size="sm" />
            <span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green-strong">Family · Parent</span>
          </Link>
          <nav aria-label="Parent" className="ml-auto hidden gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={cn(
                  "rounded-[11px] px-3 py-2 text-[14px] font-semibold",
                  pathname === l.href ? "bg-green-soft text-green-strong" : "text-ink-2 hover:text-navy",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={switchToChild}
            disabled={switching}
            className="ml-auto text-[13px] font-semibold text-green-strong hover:underline disabled:opacity-60 md:ml-2"
          >
            {switching ? "Switching…" : `${state.profile.childName}'s view`}
          </button>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1120px] px-5 pb-16 pt-5 md:px-8 md:pt-8">
        {hydrated && allowed ? children : null}
      </main>
    </div>
  );
}
