"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, Users } from "lucide-react";
import { FamilyStoryScene } from "@/components/illustrations/family-story";
import { useFamilyStory } from "@/components/family-story-provider";
import { primaryBtn, secondaryBtn } from "@/components/family-story-ui";

/**
 * The invitation, like the original Cresco landing-into-onboarding: one hero
 * and one main action. The app itself (Home, Learn, Explore, Portfolio,
 * Profile) starts after the three setup scenes; a Parent can start first.
 */
export function WelcomeChapter() {
  const { story } = useFamilyStory();
  const returning = story.goalChosen;
  return (
    <section aria-labelledby="welcome-title" className="grid items-center gap-5 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
      <div className="order-2 md:order-1">
        <p className="cresco-section-kicker">Cresco Family · learn money with your Parent</p>
        <h1 id="welcome-title" className="mt-2 font-display text-[clamp(34px,6.5vw,58px)] leading-[1.02] text-navy-strong">
          Learn to decide, <span className="text-green-strong">together.</span>
        </h1>
        <p className="mt-3 max-w-[50ch] text-[15px] leading-7 text-ink-2">
          Save toward a dream, learn in short lessons, meet invented people with real-life dilemmas,
          and make small practice choices with pretend credits.
        </p>
        <p data-testid="welcome-key" className="mt-3 flex items-start gap-2 rounded-[16px] bg-green-soft px-4 py-3 text-[13px] font-semibold leading-6 text-navy-strong">
          <KeyRound aria-hidden className="mt-1 size-4 shrink-0 text-green-strong"/>
          <span><strong>My Key</strong>: decide alone up to {story.practice.key.maxPerAction} credits at a time. Bigger choices go to your Parent, once.</span>
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={returning ? "/try/home" : "/try/goal"} className={primaryBtn} data-testid="welcome-start">
            {returning ? "Back to my Home" : "Let's begin"}<ArrowRight aria-hidden className="size-4"/>
          </Link>
          <Link href="/try/parent" className={secondaryBtn} data-testid="start-as-parent"><Users aria-hidden className="size-4"/>I&apos;m the Parent</Link>
        </div>
        <p className="mt-3 text-[12px] text-ink-3">No sign-in, no name, no real money. Pretend credits only; nothing is saved after you close the tab.</p>
      </div>
      <div className="order-1 overflow-hidden rounded-[28px] border border-green/20 bg-surface shadow-soft md:order-2">
        <FamilyStoryScene className="block h-auto max-h-[34vh] w-full md:max-h-none" title="An illustrated parent and teenager exploring Cresco together at home. Fictional practice only."/>
      </div>
    </section>
  );
}
