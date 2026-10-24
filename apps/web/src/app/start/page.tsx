"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingFrame } from "@/components/onboarding";
import { StoryVignette } from "@/components/illustrations/family-story";
import { ActionButton } from "@/components/ui/primitives";
import { auth } from "@/services";
import { useStore } from "@/state/store";

const DEMO_CHILD_NAME = "Alex";

export default function StartPage() {
  const router = useRouter();
  const { dispatch } = useStore();
  const [busy, setBusy] = useState<"onboarding" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async (kind: "onboarding" | "demo") => {
    setBusy(kind);
    setError(null);
    try {
      // No real name, child email or age is requested or sent in demo entry.
      const session = await auth.signInDemo("child", DEMO_CHILD_NAME);
      dispatch({ type: "setProfile", profile: { childName: DEMO_CHILD_NAME, age: null } });
      dispatch({ type: "signIn", session });
      router.push(kind === "demo" ? "/home" : "/onboarding/about");
    } catch {
      setError("CRESCO could not start the demo session. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <OnboardingFrame
      back="/"
      title="Start with a practice family"
      subtitle="See how a young person learns within family-set limits. No real money or account required."
      footer={
        <div className="space-y-3">
          <ActionButton onClick={() => go("onboarding")} disabled={busy !== null} arrow>
            {busy === "onboarding" ? "Opening…" : "Explore step by step"}
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => go("demo")} disabled={busy !== null}>
            {busy === "demo" ? "Opening demo…" : `Try the demo as ${DEMO_CHILD_NAME}`}
          </ActionButton>
        </div>
      }
    >
      <div className="mx-auto max-w-[350px] overflow-hidden rounded-[22px] border border-line-soft">
        <StoryVignette role="teen" className="block w-full" />
      </div>
      <div className="mt-6 rounded-[14px] bg-surface-soft px-4 py-4 text-[13px] leading-relaxed text-ink-2">
        <p className="font-semibold text-navy-strong">Sample profile: Alex</p>
        <p className="mt-1">This is a shared demonstration, not a private household. Please do not enter a real child&apos;s information or financial details.</p>
        <p className="mt-2">The sample balance is not cash, and demo stock examples are not real investments. Anyone can explore these demo roles.</p>
      </div>
      {error ? (
        <p role="alert" className="mt-3 rounded-[14px] border border-loss/25 bg-loss-soft px-3.5 py-3 text-[12.5px] font-medium text-loss-text">
          {error}
        </p>
      ) : null}
    </OnboardingFrame>
  );
}
