"use client";

import { useRouter } from "next/navigation";
import { OnboardingFrame } from "@/components/onboarding";
import { ActionButton } from "@/components/ui/primitives";
import { useStore } from "@/state/store";

export default function AboutStep() {
  const router = useRouter();
  const { dispatch } = useStore();

  return (
    <OnboardingFrame
      step={1}
      total={4}
      back="/start"
      title="Meet Alex"
      subtitle="A sample learner for exploring CRESCO safely."
      footer={
        <ActionButton
          arrow
          onClick={() => {
            dispatch({ type: "setProfile", profile: { childName: "Alex", age: null } });
            router.push("/onboarding/goal");
          }}
        >
          Next: choose a practice goal
        </ActionButton>
      }
    >
      <div className="rounded-[18px] border border-line-soft bg-surface-soft px-5 py-6">
        <p className="text-[17px] font-semibold text-navy-strong">Your learner is Alex (demo)</p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          You can try lessons and family decisions without providing a real child's name, age or email.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          This shared practice family is not a personal account. Keep all information fictional. Real family accounts and verified parental permissions are not available yet.
        </p>
      </div>
    </OnboardingFrame>
  );
}
