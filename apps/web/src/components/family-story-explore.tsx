"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, ShieldAlert } from "lucide-react";
import { ExploreSections } from "@/components/family-real-company-research";
import { useFamilyStory } from "@/components/family-story-provider";
import { MinaGroceryArt } from "@/components/illustrations/mina-grocery";
import {
  CompanyArt, RealityTag, ResultCard, StepHeader, TeachingTrend, kicker, pageTitle, panel, primaryBtn, secondaryBtn,
} from "@/components/family-story-ui";
import { FAMILY_EXPLORE_CASES, type FamilyExploreCase } from "@/lib/family-public-explore-data";
import { PRACTICE_ASSETS, remainingPeriod, selectedPracticeGoal } from "@/lib/family-public-practice";
import { goalForCase, interestMatches, metCases, orderExploreCases, personName } from "@/lib/family-story-state";

export function KeyChip() {
  const { story } = useFamilyStory();
  const key = story.practice.key;
  return (
    <p data-testid="explore-key-chip" className="flex items-start gap-2 rounded-[14px] border border-green/25 bg-green-soft px-3 py-2 text-[14px] leading-6 text-navy-strong">
      <KeyRound aria-hidden className="mt-1 size-4 shrink-0 text-green-strong"/>
      <span><strong>My Key:</strong> decide alone up to <strong>{key.maxPerAction} credits</strong> a choice ({remainingPeriod(story.practice)} left this period). Bigger choices go to your Parent.</span>
    </p>
  );
}

export function ExploreChapter() {
  const { story } = useFamilyStory();
  const cases = useMemo(() => orderExploreCases(story.interests, FAMILY_EXPLORE_CASES), [story.interests]);
  const goal = selectedPracticeGoal(story.practice);
  const met = metCases(story);
  const startHere = cases.find(item => !met.includes(item.id));
  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className={pageTitle}>Explore</h1>
            <p className="mt-1 max-w-[62ch] text-[15px] leading-6 text-ink-2">Six invented people and their companies. Meet someone, think about their dilemma, then decide if it fits your <strong className="text-navy-strong">{goal.label.toLowerCase()}</strong>.</p>
          </div>
          <RealityTag kind="pretend"/>
        </div>
        <ExploreSections active="story"/>
      </header>
      <KeyChip/>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Invented companies">
        {cases.map(item => {
          const match = interestMatches(story.interests, item)[0];
          const seen = story.researched.includes(item.id) ? "Researched" : met.includes(item.id) ? "Met" : story.viewed.includes(item.id) ? "Opened" : null;
          const practice = item.practiceCode ? PRACTICE_ASSETS.find(a => a.code === item.practiceCode) : undefined;
          const isStart = item.id === startHere?.id;
          return (
            <li key={item.id} data-testid={`company-${item.id}`}
              className={`relative flex gap-3 rounded-[20px] border bg-surface p-3 md:flex-col md:p-4 ${isStart ? "border-family-action/50 ring-2 ring-family-action/15" : "border-line-soft"}`}>
              <CompanyArt id={item.id} name={item.name} className="block h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[14px] bg-surface-soft md:h-auto md:max-h-[120px] md:w-full"/>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap gap-1.5">
                  {isStart ? <span className="rounded-full bg-family-action px-2.5 py-0.5 text-[12px] font-bold text-white">Start here</span> : null}
                  {match ? <span className="rounded-full bg-yellow-soft px-2.5 py-0.5 text-[12px] font-bold text-navy-strong">You like: {match.label}</span> : null}
                  {seen ? <span className="rounded-full bg-green-soft px-2.5 py-0.5 text-[12px] font-bold text-green-strong">{seen}</span> : null}
                </div>
                <h2 className="mt-1 text-[17px] font-extrabold leading-6 text-navy-strong">
                  <Link href={`/try/explore/${item.id}`} aria-label={`Open ${item.name}`} className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:outline-none">{item.name}</Link>
                </h2>
                <p className="text-[14px] font-semibold leading-5 text-green-strong">Meet {item.episode.person}</p>
                <p className="mt-1 flex-1 text-[14px] leading-5 text-navy">{item.episode.dilemma}</p>
                <p className="mt-2 flex items-center justify-between gap-2 text-[13px] text-ink-2">
                  <span>{practice ? `Practice: ${practice.price} credits a unit` : "Research only"}</span>
                  <ArrowRight aria-hidden className="size-4 text-family-action"/>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[14px] text-ink-2">Ready to try? <Link href="/try/decision" className="font-bold text-family-action underline underline-offset-4">Make a practice choice</Link> with one of the three practice companies.</p>
    </div>
  );
}

export function CompanyChapter({ id }: { id: string }) {
  const router = useRouter();
  const { story, dispatch } = useFamilyStory();
  const item = FAMILY_EXPLORE_CASES.find(entry => entry.id === id) as FamilyExploreCase | undefined;
  const [answer, setAnswer] = useState<number | null>(null);
  useEffect(() => { if (item) dispatch({ type: "view-case", id: item.id }); }, [item, dispatch]);
  if (!item) return null;
  const practice = item.practiceCode ? PRACTICE_ASSETS.find(a => a.code === item.practiceCode) : undefined;
  const match = interestMatches(story.interests, item)[0];
  const index = FAMILY_EXPLORE_CASES.findIndex(entry => entry.id === item.id);
  const neighbour = FAMILY_EXPLORE_CASES[(index + 1) % FAMILY_EXPLORE_CASES.length];
  const researched = story.researched.includes(item.id);
  const chose = story.episodeChoices[item.id];
  return (
    <div className="space-y-3 md:space-y-5">
      <header>
        <div className="flex items-center justify-between gap-2">
          <Link href="/try/explore" className="inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-family-action"><ArrowLeft aria-hidden className="size-4"/>All companies</Link>
          <RealityTag kind="pretend" label="Pretend · invented company"/>
        </div>
        <p className={`${kicker} mt-1 hidden text-green-strong sm:block`}>Story company · {item.category}</p>
        <h1 className={`${pageTitle} !text-[24px] sm:!text-[34px]`}>{item.name}</h1>
      </header>
      {match ? <p className="rounded-[14px] bg-yellow-soft px-4 py-2 text-[14px] font-semibold text-navy-strong">You said you like {match.label.toLowerCase()}, so this story came first.</p> : null}

      <section className={`${panel} !p-4 md:!p-6`} aria-labelledby="human-story" data-testid="fictional-episode">
        <div className="flex items-start gap-3 md:gap-5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[13px] font-extrabold text-family-action">
              <span aria-hidden className={`grid size-7 place-items-center rounded-full ${chose !== undefined ? "bg-green-strong text-white" : "bg-family-action-soft"}`}>{chose !== undefined ? <CheckCircle2 className="size-4"/> : 1}</span>
              Meet the person
            </p>
            <h2 id="human-story" className="mt-1 text-[18px] font-extrabold leading-6 text-navy-strong">{item.episode.person}</h2>
            {item.id === "markets" ? (
              <>
                <p className="mt-1.5 text-[14px] leading-6 text-navy sm:hidden">Mina helps at her family grocery. More shoppers are arriving, but delivery costs just went up.</p>
                <p className="mt-1.5 hidden text-[15px] leading-6 text-navy sm:block">{item.episode.scene}</p>
              </>
            ) : <p className="mt-1.5 text-[15px] leading-6 text-navy">{item.episode.scene}</p>}
          </div>
          {item.id === "markets" ? (
            <MinaGroceryArt className="block h-[100px] w-[88px] shrink-0 overflow-hidden rounded-[14px] border border-line-soft sm:h-[160px] sm:w-[140px]" />
          ) : (
            <CompanyArt id={item.id} name={item.name} className="block h-auto w-20 shrink-0 rounded-[14px] border border-line-soft sm:w-32"/>
          )}
        </div>
        <div className="mt-3 rounded-[16px] bg-yellow-soft p-3 md:mt-4 md:p-4">
          <h3 className="text-[16px] font-bold leading-6 text-navy-strong">{item.episode.dilemma}</h3>
          <div role="group" aria-label="Your response to the fictional dilemma" className="mt-2 grid gap-2 sm:grid-cols-2">
            {item.episode.options.map((option, index) => (
              <button type="button" key={option} aria-pressed={chose === index}
                className={`min-h-12 rounded-[14px] border p-3 text-left text-[14px] font-semibold leading-5 ${chose === index ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-navy-strong"}`}
                onClick={() => dispatch({ type: "choose-episode", id: item.id, option: index as 0 | 1 })}>
                {option}
              </button>
            ))}
          </div>
        </div>
        {chose !== undefined ? (
          <div className="mt-3" data-testid="episode-reflection">
            <ResultCard tone="info" title="What your choice helps you notice">
              {item.episode.reflection[chose]} You can change your answer; it spends nothing.
            </ResultCard>
          </div>
        ) : <p className="mt-2 text-[13px] text-ink-2">There is no wrong answer. It spends nothing.</p>}
      </section>

      <section className={`${panel} !p-4 md:!p-6`} aria-label="Research notes">
        <StepHeader n={2} title="Research the business" done={researched}/>
        <dl className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-[14px] bg-surface-soft p-3"><dt className="text-[14px] font-bold text-navy-strong">Who pays?</dt><dd className="mt-1 text-[14px] leading-6 text-navy">{item.customer}</dd></div>
          <div className="rounded-[14px] bg-surface-soft p-3"><dt className="text-[14px] font-bold text-navy-strong">What could work?</dt><dd className="mt-1 text-[14px] leading-6 text-navy">{item.opportunity}</dd></div>
          <div className="rounded-[14px] bg-surface-soft p-3"><dt className="text-[14px] font-bold text-navy-strong">What might go wrong?</dt><dd className="mt-1 text-[14px] leading-6 text-navy">{item.uncertainty}</dd></div>
        </dl>
        <div className="mt-3"><TeachingTrend item={item}/></div>
        <p data-testid="goal-lens" className="mt-3 rounded-[14px] bg-yellow-soft p-3 text-[14px] leading-6 text-navy-strong">
          <strong>For your {selectedPracticeGoal(story.practice).label.toLowerCase()}: </strong>{goalForCase(story, item)}
        </p>
        <section className="mt-4" aria-labelledby="research-q">
          <h3 id="research-q" className="text-[17px] font-bold leading-6 text-navy-strong">{item.question}</h3>
          <div className="mt-2 grid gap-2">
            {item.answers.map((text, i) => (
              <button type="button" key={text} aria-pressed={answer === i} onClick={() => { setAnswer(i); if (i === item.correctAnswer) dispatch({ type: "research-correct", id: item.id }); }}
                className={`min-h-12 rounded-[14px] border p-3 text-left text-[14px] font-semibold ${answer === i ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-navy"}`}>{text}</button>
            ))}
          </div>
          {answer !== null ? (
            <div className="mt-3">
              <ResultCard tone={answer === item.correctAnswer ? "good" : "wait"} testId="research-feedback"
                title={answer === item.correctAnswer ? "Good research question." : "Not quite. Read who pays and what might go wrong, then try again."}>
                {answer === item.correctAnswer ? item.lesson : null}
              </ResultCard>
            </div>
          ) : null}
        </section>
      </section>

      <section className={`${panel} !p-4 md:!p-6`} aria-label="Practice with this company">
        <StepHeader n={3} title={practice ? `Decide: practice with ${item.name}?` : "Decide"}/>
        {practice ? (
          <>
            <p className="mt-2 text-[15px] leading-6 text-navy">Pretend price: <strong>{practice.price} credits a unit</strong>. {researched ? <span className="inline-flex items-center gap-1 font-semibold text-green-strong"><CheckCircle2 aria-hidden className="size-4"/>You researched it.</span> : "Researching first helps, but it is your call."}</p>
            <button type="button" className={`mt-3 w-full sm:w-auto ${primaryBtn}`} data-testid="practice-this"
              onClick={() => { dispatch({ type: "pick-asset", code: practice.code }); router.push("/try/decision"); }}>Practice with {item.name}<ArrowRight aria-hidden className="size-4"/></button>
          </>
        ) : (
          <p className="mt-2 flex items-start gap-2 text-[15px] leading-6 text-navy-strong"><ShieldAlert aria-hidden className="mt-1 size-4 shrink-0 text-orange-text"/>
            <span><strong>Research only.</strong> {item.name} has no practice choice. Think about what you would want to know before ever putting money in.</span></p>
        )}
      </section>
      <nav aria-label="More companies" className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/try/explore" className={secondaryBtn}><ArrowLeft aria-hidden className="size-4"/>All companies</Link>
        <Link href={`/try/explore/${neighbour.id}`} className={secondaryBtn}>Next: meet {personName(neighbour)}<ArrowRight aria-hidden className="size-4"/></Link>
      </nav>
    </div>
  );
}
