"use client";

import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { FamilyStoryScene, StoryVignette } from "@/components/illustrations/family-story";
import { useFamilyStory } from "@/components/family-story-provider";
import { panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import { STORY_CHAPTERS } from "@/lib/family-story-routes";
import { chapterStatus } from "@/lib/family-story-state";

const BLURB: Record<string, string> = {
  goal: "Pick what you are saving for and what you like.",
  learn: "Short illustrated lessons that point back to your goal.",
  explore: "Research six invented companies before deciding.",
  decision: "See your limit before you click, then choose.",
  parent: "A simulated Parent sees the exact request and decides once.",
  outcome: "A receipt, your goal, and what a bad month would mean.",
  together: "Talk it through, then pick what to learn next.",
};

export function WelcomeChapter() {
  const { story } = useFamilyStory();
  const status = chapterStatus(story);
  const chapters = STORY_CHAPTERS.filter(chapter => chapter.id !== "welcome");
  const next = chapters.find(chapter => !status[chapter.id as keyof typeof status]);
  const started = chapters.some(chapter => status[chapter.id as keyof typeof status]);
  return (
    <div className="space-y-8">
      <section aria-labelledby="welcome-title" className="grid items-center gap-5 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
        <div>
          <p className="cresco-section-kicker">Cresco Family · a short story for two</p>
          <h1 id="welcome-title" className="mt-2 font-display text-[clamp(36px,7vw,64px)] leading-[0.98] text-navy-strong">
            Learn to decide, <em className="text-green-strong">together.</em>
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-7 text-ink-2">
            A teen practices with pretend credits. Inside a limit the Parent sets, the teen decides alone.
            Above it, the Parent says yes or no, once, for that exact choice.
          </p>
          <p data-testid="welcome-key" className="mt-3 flex items-start gap-2 rounded-[16px] bg-green-soft px-4 py-3 text-[13px] font-semibold leading-6 text-navy-strong">
            <KeyRound aria-hidden className="mt-1 size-4 shrink-0 text-green-strong"/>
            <span><strong>My Key</strong> is that limit: {story.practice.key.maxPerAction} credits at a time to start. Learning never widens it.</span>
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href={started && next ? next.path : "/try/goal"} className={primaryBtn} data-testid="welcome-start">
              {started && next ? `Continue: ${next.label}` : "Start my story"}<ArrowRight aria-hidden className="size-4"/>
            </Link>
            <Link href="/try/explore" className={secondaryBtn}>Skip ahead: explore companies</Link>
          </div>
          <p className="mt-3 text-[12px] text-ink-3">No sign-in. Pretend credits only: Practice is fictional and nothing here is a real account. Revisit any chapter at any time.</p>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-green/20 bg-surface shadow-soft">
          <FamilyStoryScene className="block h-auto w-full" title="An illustrated parent and teenager exploring Cresco together at home. Fictional practice only."/>
        </div>
      </section>

      <section aria-label="Two perspectives" className="grid gap-4 md:grid-cols-2">
        <article className={panel}>
          <StoryVignette role="teen" className="mb-3 block h-auto w-full rounded-[16px]"/>
          <h2 className="font-display text-[26px] text-navy-strong">The teen decides</h2>
          <p className="mt-1 text-[13px] leading-6 text-ink-2">Saves toward a goal, learns, researches, and makes small practice choices alone inside the Key.</p>
        </article>
        <article className={panel}>
          <StoryVignette role="parent" className="mb-3 block h-auto w-full rounded-[16px]"/>
          <h2 className="font-display text-[26px] text-navy-strong">The Parent guides</h2>
          <p className="mt-1 text-[13px] leading-6 text-ink-2">Sees the goal and the reason, approves once or declines with a reason, and can change the Key on purpose. Simulated here: no identity is verified.</p>
        </article>
      </section>

      <section aria-labelledby="chapters-title">
        <h2 id="chapters-title" className="font-display text-[28px] text-navy-strong">Your story in seven short chapters</h2>
        <ol className="mt-3 grid gap-2 md:grid-cols-2" data-testid="welcome-chapters">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <Link href={chapter.path} className="flex min-h-14 items-center gap-3 rounded-[16px] border border-line-soft bg-surface p-3 hover:border-green">
                <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${status[chapter.id as keyof typeof status] ? "bg-green-strong text-white" : "bg-green-soft text-green-strong"}`}>{status[chapter.id as keyof typeof status] ? "✓" : index + 1}</span>
                <span><span className="block text-[15px] font-bold text-navy-strong">{chapter.label}</span><span className="block text-[12px] text-ink-2">{BLURB[chapter.id]}</span></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
