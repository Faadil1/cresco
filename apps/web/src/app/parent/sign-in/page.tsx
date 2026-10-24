"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingFrame } from "@/components/onboarding";
import { StoryVignette } from "@/components/illustrations/family-story";
import { ActionButton } from "@/components/ui/primitives";
import { auth } from "@/services";
import { useStore } from "@/state/store";

const DEMO_GUARDIAN_NAME = "Sam";

export default function ParentSignIn() {
  const router = useRouter();
  const { dispatch } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      // This grants a DEMO role, not verified guardian identity or parental consent.
      const session = await auth.signInDemo("parent", DEMO_GUARDIAN_NAME);
      dispatch({ type: "setProfile", profile: { parentName: DEMO_GUARDIAN_NAME } });
      dispatch({ type: "signIn", session });
      router.push("/parent");
    } catch {
      setError("CRESCO could not start the parent demo session. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingFrame
      back="/"
      title="Explore the parent&apos;s view"
      subtitle="Set sample rules and see what happens when a learner asks for an exception."
      footer={
        <ActionButton onClick={signIn} disabled={busy} arrow>
          {busy ? "Opening demo…" : "Continue as Sam (demo)"}
        </ActionButton>
      }
    >
      <div className="mx-auto max-w-[350px] overflow-hidden rounded-[22px] border border-line-soft">
        <StoryVignette role="parent" className="block w-full" />
      </div>
      <div className="mt-6 rounded-[14px] bg-surface-soft px-4 py-4 text-[13px] leading-relaxed text-ink-2">
        <p className="font-semibold text-navy-strong">No parent account is created here.</p>
        <p className="mt-1">Anyone can open this shared demonstration&apos;s parent view. This is not identity verification, parental consent or a secure family account.</p>
        <p className="mt-2">Please do not enter personal or payment information. The money in this demo is not real, and any approval here is not authorization for a real child&apos;s funds.</p>
      </div>
      {error ? (
        <p role="alert" className="mt-3 rounded-[14px] border border-loss/25 bg-loss-soft px-3.5 py-3 text-[12.5px] font-medium text-loss-text">
          {error}
        </p>
      ) : null}
    </OnboardingFrame>
  );
}
