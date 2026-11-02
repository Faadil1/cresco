"use client";

/**
 * Profile destination, after the original Cresco /profile list: goal,
 * interests, learning, wins, My Key and how the practice works. It never asks
 * for a name, age, email, account or guardian verification.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, HeartHandshake, KeyRound, RotateCcw, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import type { ReactNode } from "react";
import { KidBust } from "@/components/illustrations/people";
import { BadgeArt } from "@/components/illustrations/badges";
import { useFamilyStory } from "@/components/family-story-provider";
import { panel } from "@/components/family-story-ui";
import { remainingPeriod, selectedPracticeGoal } from "@/lib/family-public-practice";
import { GOAL_STORY, INTERESTS, childPathFor, practiceWins } from "@/lib/family-story-state";

function Row({ href, icon, title, detail, testId }: { href: string; icon: ReactNode; title: string; detail: ReactNode; testId?: string }) {
  return (
    <li>
      <Link href={href} data-testid={testId} className="flex min-h-16 items-center gap-3 px-1 py-2 hover:bg-surface-soft">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-family-action-soft text-family-action">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-navy-strong">{title}</span>
          <span className="block text-[12px] leading-5 text-ink-2">{detail}</span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-3"/>
      </Link>
    </li>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const path = childPathFor(goal.id);
  const wins = practiceWins(story);
  const interests = INTERESTS.filter(i => story.interests.includes(i.id)).map(i => i.label);
  return (
    <div className="space-y-4 md:space-y-5" data-testid="profile-screen">
      <h1 className="font-display text-[26px] leading-tight text-navy-strong md:text-[32px]">Profile</h1>
      <section className={`${panel} flex items-center gap-4 !p-4`} aria-label="Practice learner">
        <KidBust className="size-16 shrink-0"/>
        <div>
          <p className="text-[17px] font-extrabold text-navy-strong">Practice learner</p>
          <p className="text-[13px] leading-5 text-ink-2">No name, age or account needed. Everything here lives only in this browser tab.</p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className={`${panel} !px-3 !py-2`} aria-label="My practice">
          <ul className="divide-y divide-line-soft">
            <Row href="/try/goal" testId="profile-goal" icon={<Target className="size-5"/>} title="My goal"
              detail={story.goalChosen ? `${goal.label} · ${GOAL_STORY[goal.id].horizon} away · ${p.saved}/${goal.target} set aside` : "Not chosen yet · choose your dream"}/>
            <Row href="/try/goal/interests" testId="profile-interests" icon={<Sparkles className="size-5"/>} title="What I like"
              detail={interests.length ? interests.join(", ") : "Nothing picked · optional"}/>
            <Row href="/try/learn" testId="profile-learning" icon={<BookOpen className="size-5"/>} title="My learning"
              detail={`${p.childCompleted.length} of ${path.length} lessons done`}/>
            <Row href="/try/parent/key" icon={<KeyRound className="size-5"/>} title="My Key"
              detail={`Up to ${p.key.maxPerAction} credits a choice, ${remainingPeriod(p)} left. Only your Parent changes it, on purpose.`}/>
            <Row href="/try/parent" icon={<Users className="size-5"/>} title="Parent's view" detail="Simulated in this browser. No identity is verified."/>
            <Row href="/try/together" icon={<HeartHandshake className="size-5"/>} title="Talk it through" detail={p.togetherCompleted ? "Family check-in done" : "Share a view with your Parent"}/>
          </ul>
        </section>

        <section className={`${panel} !p-4`} aria-labelledby="profile-wins" data-testid="profile-wins">
          <h2 id="profile-wins" className="text-[17px] font-extrabold text-navy-strong">Your wins</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {wins.map(win => (
              <li key={win.badge} className="flex flex-col items-center gap-1 rounded-[16px] bg-surface-soft p-3 text-center">
                <BadgeArt badge={win.badge} earned={win.earned} className="size-12"/>
                <span className="text-[12px] font-bold text-navy-strong">{win.label}</span>
                <span className="text-[11px] text-ink-3">{win.earned ? "Earned" : "Not yet"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-ink-2">Badges celebrate what you did. They never change My Key.</p>
        </section>
      </div>

      <section className={`${panel} !p-4`} aria-labelledby="how-title">
        <h2 id="how-title" className="flex items-center gap-2 text-[17px] font-extrabold text-navy-strong"><ShieldCheck aria-hidden className="size-5 text-green-strong"/>How Cresco Family works</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6 text-navy">
          <li>100 pretend credits. No real money, wallet or investment.</li>
          <li>Inside My Key you decide alone. Above it, a simulated Parent decides once, for that exact choice.</li>
          <li>Companies and people are invented. Prices are examples, not advice.</li>
          <li>Nothing is saved: a full refresh starts a new family session.</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/try/lab" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-[13px] font-bold text-navy-strong">Free practice lab</Link>
          <button type="button" data-testid="profile-reset"
            onClick={() => { dispatch({ type: "practice", action: { type: "reset" } }); router.push("/try"); }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-[13px] font-bold text-navy-strong">
            <RotateCcw aria-hidden className="size-4"/>Start over for a new family
          </button>
        </div>
      </section>
    </div>
  );
}
