"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingFrame } from "@/components/onboarding";
import { StoryVignette } from "@/components/illustrations/family-story";
import { ActionButton } from "@/components/ui/primitives";
import { auth } from "@/services";
import { useStore } from "@/state/store";

export default function StartPage() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [busy, setBusy] = useState<"guided" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async (kind: "guided" | "demo") => {
    setBusy(kind);
    setError(null);
    try {
      const session = await auth.signInDemo("child", state.profile.childName);
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
      title="Let's get you started"
      subtitle="Learning comes first. You won't need a wallet or any money to begin."
      footer={
        <div className="space-y-3">
          <ActionButton onClick={() => go("guided")} disabled={busy !== null} arrow>
            {busy === "guided" ? "Opening practice…" : "Start guided practice (demo)"}
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => go("demo")} disabled={busy !== null}>
            {busy === "demo" ? "Opening demo…" : `Try the demo as ${state.profile.childName}`}
          </ActionButton>
        </div>
      }
    >
      <div className="mx-auto max-w-[350px] overflow-hidden rounded-[22px] border border-line-soft">
        <StoryVignette role="teen" className="block w-full" />
      </div>
      <p className="mt-3 rounded-[14px] bg-surface-soft px-3.5 py-3 text-[12.5px] text-ink-2">
        Demo only: no verified family account is created. Please do not enter a real child’s personal information. Practice progress and requests may be stored by the demo backend.
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-[14px] border border-loss/25 bg-loss-soft px-3.5 py-3 text-[12.5px] font-medium text-loss-text"
        >
          {error}
        </p>
      ) : null}
    </OnboardingFrame>
  );
}
