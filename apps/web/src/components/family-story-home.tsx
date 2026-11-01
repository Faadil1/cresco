"use client";

/**
 * The Child's personal Home, restored from the original Cresco /home: goal
 * card, today's mission, continue learning, wins, plus the Family-specific
 * My Key and Parent conversation. Every number comes from the in-memory
 * practice state; nothing here is fabricated usage data.
 */
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, KeyRound, MessagesSquare, PiggyBank, Target } from "lucide-react";
import { GoalArt } from "@/components/illustrations/objects";
import { BadgeArt } from "@/components/illustrations/badges";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { useFamilyStory } from "@/components/family-story-provider";
import { CompanyArt, panel, primaryBtn } from "@/components/family-story-ui";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";
import {
  PRACTICE_ASSETS, remainingCredits, remainingPeriod, selectedPracticeGoal,
} from "@/lib/family-public-practice";
import {
  DECLINE_REASONS, GOAL_STORY, REASONS, childPathFor, nextMission, orderExploreCases, personName, practiceWins,
} from "@/lib/family-story-state";

const GOAL_TONE = { bike: "from-blue-soft to-surface", gaming: "from-pink-soft to-surface", trip: "from-aqua-soft to-surface" } as const;
const sectionTitle = "flex items-center justify-between gap-3 text-[17px] font-extrabold text-navy-strong";
const seeAll = "inline-flex min-h-11 items-center gap-0.5 text-[13px] font-bold text-family-action";

export function GoalCard({ compact = false }: { compact?: boolean }) {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const percent = Math.min(100, Math.round(p.saved / goal.target * 100));
  return (
    <section data-testid="home-goal-card" aria-label="My goal"
      className={`rounded-[24px] border border-line-soft bg-gradient-to-br ${GOAL_TONE[goal.id]} p-4 shadow-sm md:p-5`}>
      <div className="flex items-center gap-3">
        <GoalArt goal={goal.id} className={compact ? "h-14 w-16 shrink-0" : "h-16 w-20 shrink-0 md:h-20 md:w-24"}/>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-ink-2">{story.goalChosen ? "Saving for" : "Not chosen yet"}</p>
          <p className="text-[19px] font-extrabold leading-6 text-navy-strong">{story.goalChosen ? goal.label : "Your dream"}</p>
          <p className="text-[12px] text-ink-2">{story.goalChosen ? `${GOAL_STORY[goal.id].horizon} away` : "Pick it to start"}</p>
        </div>
        <p className="text-right text-[12px] font-semibold text-ink-2"><span className="block text-[20px] font-extrabold text-navy-strong" data-testid="home-goal-saved">{p.saved}/{goal.target}</span>set aside</p>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-label={`${goal.label} savings`}
        aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={p.saved}>
        <div className="h-full rounded-full bg-green-strong" style={{ width: `${percent}%` }}/>
      </div>
      {story.goalChosen ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-ink-2">
          <span><strong className="text-navy-strong">{remainingCredits(p)}</strong> pretend credits free to use</span>
          <button type="button" disabled={remainingCredits(p) < 20} data-testid="home-save"
            onClick={() => dispatch({ type: "practice", action: { type: "save" } })}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-green/40 bg-surface px-4 text-[13px] font-bold text-green-strong disabled:opacity-50">
            <PiggyBank aria-hidden className="size-4"/>Set aside 20
          </button>
        </div>
      ) : null}
    </section>
  );
}

function MissionCard() {
  const { story } = useFamilyStory();
  const mission = nextMission(story);
  return (
    <section data-testid="home-mission" data-mission={mission.id} aria-labelledby="mission-title"
      className="rounded-[24px] border border-yellow/40 bg-yellow-soft p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-orange-text"><Target className="size-6"/></span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-text">{mission.kicker}</p>
          <h2 id="mission-title" className="text-[18px] font-extrabold leading-6 text-navy-strong">{mission.title}</h2>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-navy">{mission.body}</p>
        </div>
      </div>
      <Link href={mission.href} className={`mt-3 w-full sm:w-auto ${primaryBtn}`} data-testid="home-mission-go">
        {mission.cta}<ArrowRight aria-hidden className="size-4"/>
      </Link>
    </section>
  );
}

function ContinueLearning({ skip }: { skip?: string }) {
  const { story } = useFamilyStory();
  const p = story.practice;
  const path = childPathFor(p.goalId);
  // The mission already shows one lesson; do not repeat it right below.
  const upcoming = path.filter(item => !p.childCompleted.includes(item.id) && `/try/learn/${item.id}` !== skip).slice(0, 2);
  return (
    <section aria-labelledby="continue-title" data-testid="home-learning">
      <h2 id="continue-title" className={sectionTitle}>
        <span>Continue learning <span className="ml-1 text-[13px] font-semibold text-ink-2">{p.childCompleted.length} of {path.length} done</span></span>
        <Link href="/try/learn" className={seeAll}>See all<ChevronRight aria-hidden className="size-4"/></Link>
      </h2>
      {upcoming.length ? (
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {upcoming.map(lesson => (
            <li key={lesson.id}>
              <Link href={`/try/learn/${lesson.id}`} className="flex min-h-[72px] items-center gap-3 rounded-[18px] border border-line-soft bg-surface p-2.5 hover:border-family-action">
                {lesson.illustration
                  ? <LessonIllustration kind={lesson.illustration} title={`${lesson.title} illustration`} className="h-14 w-16 shrink-0 overflow-hidden rounded-[12px]"/>
                  : <BookOpen aria-hidden className="size-8 shrink-0 text-green-strong"/>}
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold leading-5 text-navy-strong">{lesson.title}</span>
                  <span className="block text-[12px] text-ink-2">{lesson.minutes} min</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : p.childCompleted.length === path.length ? (
        <p className="mt-2 flex items-center gap-2 rounded-[16px] bg-green-soft p-3 text-[13px] font-semibold text-green-strong"><CheckCircle2 aria-hidden className="size-4"/>Every Child lesson done. Review any time in Learn.</p>
      ) : <p className="mt-2 text-[13px] text-ink-2">Your last lesson is today&apos;s mission above.</p>}
    </section>
  );
}

function MeetNext({ skip }: { skip?: string }) {
  const { story } = useFamilyStory();
  const ordered = orderExploreCases(story.interests, FAMILY_EXPLORE_CASES);
  const next = ordered.find(item => !story.viewed.includes(item.id) && `/try/explore/${item.id}` !== skip)
    ?? ordered.find(item => `/try/explore/${item.id}` !== skip)!;
  const seen = story.viewed.length;
  return (
    <section aria-labelledby="meet-title" data-testid="home-next-person">
      <h2 id="meet-title" className={sectionTitle}>
        <span>People to meet <span className="ml-1 text-[13px] font-semibold text-ink-2">{seen} of {FAMILY_EXPLORE_CASES.length} met</span></span>
        <Link href="/try/explore" className={seeAll}>Explore<ChevronRight aria-hidden className="size-4"/></Link>
      </h2>
      <Link href={`/try/explore/${next.id}`} className="mt-2 flex items-center gap-3 rounded-[18px] border border-line-soft bg-surface p-3 hover:border-family-action">
        <CompanyArt id={next.id} name={next.name} className="h-16 w-20 shrink-0 overflow-hidden rounded-[12px]"/>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-navy-strong">{personName(next)} · {next.name}</span>
          <span className="line-clamp-2 block text-[12px] leading-5 text-ink-2">{next.episode.dilemma}</span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-3"/>
      </Link>
    </section>
  );
}

function KeyCard() {
  const { story } = useFamilyStory();
  const p = story.practice;
  return (
    <section className={`${panel} !p-4`} data-testid="home-key" aria-labelledby="key-title">
      <h2 id="key-title" className="flex items-center gap-2 text-[15px] font-extrabold text-navy-strong"><KeyRound aria-hidden className="size-5 text-green-strong"/>My Key</h2>
      <p className="mt-1 text-[13px] leading-5 text-navy">Decide alone up to <strong>{p.key.maxPerAction} credits</strong> a choice. <strong>{remainingPeriod(p)}</strong> left this practice period.</p>
      <p className="mt-1 text-[12px] leading-5 text-ink-2">Bigger choices go to your Parent, once. Lessons never change your Key.</p>
    </section>
  );
}

function ParentPreview() {
  const { story } = useFamilyStory();
  const p = story.practice;
  const pending = p.requests.find(r => r.status === "pending");
  const latest = p.requests[0];
  const name = (code: string) => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code;
  let body;
  if (pending) {
    body = <>Waiting: <strong>{pending.amount} credits of {name(pending.asset)}</strong>. Your reason: “{REASONS.find(r => r.id === story.reasons[pending.id])?.label ?? "No reason given"}”.</>;
  } else if (latest && latest.status === "declined") {
    body = <>Your Parent declined {latest.amount} credits: “{DECLINE_REASONS.find(r => r.id === story.declineReasons[latest.id])?.label ?? "Not this time"}”.</>;
  } else if (latest && (latest.status === "approved-once" || latest.status === "used")) {
    body = <>Your Parent approved {latest.amount} credits of {name(latest.asset)}, once. Your Key stayed the same.</>;
  } else {
    body = <>Nothing is waiting. Your Parent sees your goal and, only when you ask above your Key, the exact choice and your reason.</>;
  }
  return (
    <section className={`${panel} !p-4`} data-testid="home-parent-preview" aria-labelledby="parent-preview-title">
      <h2 id="parent-preview-title" className="flex items-center gap-2 text-[15px] font-extrabold text-navy-strong"><MessagesSquare aria-hidden className="size-5 text-lavender"/>With your Parent</h2>
      <p className="mt-1 text-[13px] leading-5 text-navy">{body}</p>
      <div className="mt-2 flex flex-wrap gap-x-4">
        <Link href={pending ? "/try/parent/request" : "/try/parent"} className={seeAll}>{pending ? "Hand to my Parent" : "Parent's view"}<ChevronRight aria-hidden className="size-4"/></Link>
        <Link href="/try/together" className={seeAll}>{p.togetherCompleted ? "Your last talk" : "Talk it through"}<ChevronRight aria-hidden className="size-4"/></Link>
      </div>
    </section>
  );
}

function WinsCard() {
  const { story } = useFamilyStory();
  const wins = practiceWins(story);
  return (
    <section className={`${panel} !p-4`} aria-labelledby="wins-title" data-testid="home-wins">
      <h2 id="wins-title" className={sectionTitle}>
        <span>Your wins <span className="ml-1 text-[13px] font-semibold text-ink-2">{wins.filter(w => w.earned).length} of {wins.length}</span></span>
        <Link href="/try/profile" className={seeAll}>Profile<ChevronRight aria-hidden className="size-4"/></Link>
      </h2>
      <ul className="mt-2 flex gap-2">
        {wins.map(win => (
          <li key={win.badge} title={`${win.label}: ${win.earned ? "earned" : "not yet"}`}>
            <BadgeArt badge={win.badge} earned={win.earned} className="size-11"/>
            <span className="sr-only">{win.label}: {win.earned ? "earned" : "not yet"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeScreen() {
  const { story } = useFamilyStory();
  const mission = nextMission(story);
  return (
    <div className="space-y-4 md:space-y-5" data-testid="home-screen">
      <header>
        <h1 className="font-display text-[26px] leading-tight text-navy-strong md:text-[32px]">Hi there <span aria-hidden>👋</span></h1>
        <p className="text-[13px] text-ink-2">Your practice home · pretend credits, learning first</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <div className="space-y-4">
          <GoalCard/>
          <MissionCard/>
          <ContinueLearning skip={mission.href}/>
          <MeetNext skip={mission.href}/>
        </div>
        <div className="space-y-4">
          <KeyCard/>
          <ParentPreview/>
          <WinsCard/>
        </div>
      </div>
    </div>
  );
}
