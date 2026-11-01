"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Search, ShieldAlert } from "lucide-react";
import { useFamilyStory } from "@/components/family-story-provider";
import {
  ChapterHeading, CompanyArt, ResultCard, TeachingTrend, panel, primaryBtn, secondaryBtn,
} from "@/components/family-story-ui";
import {
  FAMILY_EXPLORE_CASES, filterFamilyExploreCases, type FamilyExploreCase,
} from "@/lib/family-public-explore-data";
import { PRACTICE_ASSETS, remainingPeriod, selectedPracticeGoal } from "@/lib/family-public-practice";
import { goalForCase, interestMatches, orderExploreCases, personName } from "@/lib/family-story-state";

const categories = ["All", "Technology", "Consumer", "Funds", "Services", "Energy", "Health"] as const;
type Category = (typeof categories)[number];

export function KeyChip() {
  const { story } = useFamilyStory();
  const key = story.practice.key;
  return (
    <p data-testid="explore-key-chip" className="flex items-start gap-2 rounded-[14px] border border-green/25 bg-green-soft px-3 py-2 text-[13px] font-semibold leading-6 text-navy-strong">
      <KeyRound aria-hidden className="mt-1 size-4 shrink-0 text-green-strong"/>
      <span>My Key: choose alone up to <strong>{key.maxPerAction} credits</strong> at a time ({remainingPeriod(story.practice)} left this practice period). Above that, your simulated Parent decides.</span>
    </p>
  );
}

export function ExploreChapter() {
  const { story } = useFamilyStory();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const cases = useMemo(
    () => orderExploreCases(story.interests, filterFamilyExploreCases(query, category)),
    [story.interests, query, category],
  );
  const goal = selectedPracticeGoal(story.practice);
  const ordered = orderExploreCases(story.interests, FAMILY_EXPLORE_CASES);
  const featured = ordered.find(item => !story.viewed.includes(item.id)) ?? ordered[0];
  return (
    <div className="space-y-4 md:space-y-5">
      <header>
        <h1 className="font-display text-[26px] leading-tight text-navy-strong md:text-[32px]">Explore</h1>
        <p className="text-[13px] text-ink-2">Six invented companies, each with a real-life dilemma. Meet the person first, then research how it fits your <strong className="text-navy-strong">{goal.label.toLowerCase()}</strong>.</p>
      </header>
      <section aria-labelledby="featured-title" data-testid="explore-featured"
        className="grid items-center gap-4 overflow-hidden rounded-[24px] border border-yellow/40 bg-yellow-soft p-4 md:grid-cols-[1fr_220px] md:p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-text">{story.viewed.includes(featured.id) ? "Revisit a story" : "Someone to meet"} · {featured.name}</p>
          <h2 id="featured-title" className="mt-1 text-[20px] font-extrabold leading-6 text-navy-strong">{featured.episode.person}</h2>
          <p className="mt-1 text-[14px] leading-6 text-navy">{featured.episode.dilemma}</p>
          <Link href={`/try/explore/${featured.id}`} className={`mt-3 w-full sm:w-auto ${primaryBtn}`}>Meet {personName(featured)}<ArrowRight aria-hidden className="size-4"/></Link>
        </div>
        <CompanyArt id={featured.id} name={featured.name} className="hidden h-auto w-full overflow-hidden rounded-[18px] md:block"/>
      </section>
      <KeyChip/>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search invented companies</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-3.5 size-5 text-ink-2"/>
          <input type="search" aria-label="Search invented companies" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Search by company, sector or question"
            className="min-h-12 w-full rounded-[14px] border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-navy-strong"/>
        </label>
      </div>
      <div role="group" aria-label="Filter by sector" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {categories.map(item => (
          <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-[13px] font-bold ${category === item ? "border-family-action bg-family-action-soft text-family-action" : "border-line bg-surface text-navy-strong"}`}>{item}</button>
        ))}
      </div>
      <p className="text-[12px] text-ink-2" aria-live="polite">{cases.length} invented {cases.length === 1 ? "company" : "companies"} shown{story.interests.length ? " · yours first" : ""}.</p>
      {cases.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Invented companies">
          {cases.map(item => {
            const match = interestMatches(story.interests, item)[0];
            const seen = story.researched.includes(item.id) ? "Researched" : story.viewed.includes(item.id) ? "Opened" : null;
            const practice = item.practiceCode ? PRACTICE_ASSETS.find(a => a.code === item.practiceCode) : undefined;
            return (
              <li key={item.id} className={`${panel} flex flex-col !p-4`} data-testid={`company-${item.id}`}>
                <CompanyArt id={item.id} name={item.name} className="mb-3 block h-auto max-h-[96px] w-full overflow-hidden rounded-[14px] md:max-h-[130px]"/>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-ink-2">{item.category}</span>
                  {match ? <span className="rounded-full bg-yellow-soft px-2.5 py-1 text-[11px] font-bold text-navy-strong">You like: {match.label}</span> : null}
                  {seen ? <span className="rounded-full bg-green-soft px-2.5 py-1 text-[11px] font-bold text-green-strong">{seen}</span> : null}
                </div>
                <h2 className="mt-2 text-[19px] font-bold leading-6 text-navy-strong">{item.name}</h2>
                <p className="mt-1 text-[13px] font-semibold leading-6 text-green-strong">Meet {item.episode.person}</p>
                <p className="mt-1 flex-1 text-[13px] leading-5 text-navy">{item.episode.dilemma}</p>
                <p className="mt-2 hidden text-[12px] leading-5 text-ink-2 md:block"><strong>Behind the story: </strong>{item.model}</p>
                <p className="mt-2 text-[12px] text-ink-3">{practice ? `Practice price: ${practice.price} credits per unit` : "Research only: no practice choice"}</p>
                <Link href={`/try/explore/${item.id}`} className={`mt-3 ${secondaryBtn}`} aria-label={`Open ${item.name}`}>Meet {personName(item)}</Link>
              </li>
            );
          })}
        </ul>
      ) : <p className={`${panel} text-[13px] text-ink-2`}>No matching invented companies. Change your search or choose All.</p>}
      <p className="text-[13px] text-ink-2">Ready to try? <Link href="/try/decision" className="font-bold text-family-action underline underline-offset-4">Make a practice choice</Link> with one of the three practice companies.</p>
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
  return (
    <div className="space-y-3 md:space-y-5">
      <Link href="/try/explore" className="inline-flex min-h-11 items-center gap-1 text-[13px] font-bold text-family-action"><ArrowLeft aria-hidden className="size-4"/>All companies</Link>
      {/* Keep context, then the fictional person and decision. Avoid repeating the
          same long introduction before the first mobile decision. */}
      <ChapterHeading kicker={`${item.category} · Invented company`} title={item.name}/>
      <section className={`${panel} !p-4 md:!p-6`} aria-labelledby="human-story" data-testid="fictional-episode">
        <p className="cresco-section-kicker">Meet the person · fictional story</p>
        <div className="mt-2 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="human-story" className="font-display text-[24px] leading-tight text-navy-strong md:text-[26px]">{item.episode.person}</h2>
            <p className="mt-1.5 text-[14px] leading-6 text-navy md:mt-2 md:text-[15px] md:leading-7">{item.episode.scene}</p>
          </div>
          <CompanyArt id={item.id} name={item.name} className="block h-auto w-16 shrink-0 rounded-[14px] border border-line-soft sm:w-28 md:w-36"/>
        </div>
        <div className="mt-3 rounded-[18px] bg-yellow-soft p-3 md:mt-4 md:p-4">
          <h3 className="text-[16px] font-bold leading-6 text-navy-strong md:text-[17px]">{item.episode.dilemma}</h3>
          <div role="group" aria-label="Your response to the fictional dilemma" className="mt-2 grid gap-2 sm:grid-cols-2">
            {item.episode.options.map((option, index) => (
              <button type="button" key={option} aria-pressed={story.episodeChoices[item.id] === index}
                className={`min-h-12 rounded-[14px] border p-3 text-left text-[13px] font-semibold leading-5 md:text-[14px] ${story.episodeChoices[item.id] === index ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-navy-strong"}`}
                onClick={() => dispatch({ type: "choose-episode", id: item.id, option: index as 0 | 1 })}>
                {option}
              </button>
            ))}
          </div>
        </div>
        {story.episodeChoices[item.id] !== undefined ? (
          <div className="mt-3" data-testid="episode-reflection">
            <ResultCard tone="info" title="What your choice helps you notice">
              {item.episode.reflection[story.episodeChoices[item.id]]} You can reconsider this answer. It does not grant permission or spend credits.
            </ResultCard>
          </div>
        ) : (
          <p className="mt-3 text-[12px] leading-5 text-ink-2">Choose how you would respond. There is no permission or credit attached to the answer.</p>
        )}
      </section>
      {match ? <p className="rounded-[14px] bg-yellow-soft px-4 py-2 text-[13px] font-semibold text-navy-strong">You said you like {match.label.toLowerCase()}, so this story came first.</p> : null}
      <section className={panel} aria-label="Research notes">
        <dl className="grid gap-4 md:grid-cols-2">
          <div><dt className="text-[14px] font-bold text-navy-strong">Who is the customer?</dt><dd className="mt-1 text-[14px] leading-6 text-navy">{item.customer}</dd></div>
          <div><dt className="text-[14px] font-bold text-navy-strong">What could work?</dt><dd className="mt-1 text-[14px] leading-6 text-navy">{item.opportunity}</dd></div>
          <div><dt className="text-[14px] font-bold text-navy-strong">What might go wrong?</dt><dd className="mt-1 text-[14px] leading-6 text-navy">{item.uncertainty}</dd></div>
          <div><dt className="text-[14px] font-bold text-navy-strong">A question an investor asks</dt><dd className="mt-1 text-[14px] leading-6 text-navy">{item.researchPrompt}</dd></div>
        </dl>
        <div className="mt-4"><TeachingTrend item={item}/></div>
      </section>
      <section data-testid="goal-lens" className="rounded-[20px] border border-yellow/40 bg-yellow-soft p-4 text-[14px] leading-6 text-navy-strong">
        <strong>For your {selectedPracticeGoal(story.practice).label.toLowerCase()}: </strong>{goalForCase(story, item)}
      </section>
      <section className={panel} aria-labelledby="research-q">
        <h2 id="research-q" className="text-[18px] font-bold text-navy-strong">{item.question}</h2>
        <div className="mt-3 grid gap-2">
          {item.answers.map((text, i) => (
            <button type="button" key={text} aria-pressed={answer === i} onClick={() => { setAnswer(i); if (i === item.correctAnswer) dispatch({ type: "research-correct", id: item.id }); }}
              className={`min-h-12 rounded-[14px] border p-3 text-left text-[14px] font-semibold ${answer === i ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-ink-2"}`}>{text}</button>
          ))}
        </div>
        {answer !== null ? (
          <div className="mt-3">
            <ResultCard tone={answer === item.correctAnswer ? "good" : "wait"} testId="research-feedback"
              title={answer === item.correctAnswer ? "Good research question." : "Not quite. Read how it earns money and what could go wrong, then try again."}>
              {answer === item.correctAnswer ? item.lesson : null}
            </ResultCard>
          </div>
        ) : null}
        <p className="mt-3 text-[11px] leading-5 text-ink-3">Educational. This question grants no authority and changes no Key, credit or permission.</p>
      </section>
      <section className={panel} aria-label="Practice with this company">
        {practice ? (
          <>
            <h2 className="font-display text-[26px] text-navy-strong">Practice with {item.name}?</h2>
            <p className="mt-1 text-[13px] leading-6 text-ink-2">Fictional practice price: <strong>{practice.price} credits per unit</strong>. {researched ? <span className="inline-flex items-center gap-1 font-semibold text-green-strong"><CheckCircle2 aria-hidden className="size-4"/>You researched it.</span> : "Answer the question above first if you want to be ready. You do not have to."}</p>
            <button type="button" className={`mt-3 ${primaryBtn}`} data-testid="practice-this"
              onClick={() => { dispatch({ type: "pick-asset", code: practice.code }); router.push("/try/decision"); }}>Practice with {item.name}</button>
          </>
        ) : (
          <p className="flex items-start gap-2 text-[13px] leading-6 text-navy-strong"><ShieldAlert aria-hidden className="mt-1 size-4 shrink-0 text-orange-text"/>
            <span><strong>Research only.</strong> No practice choice is offered for {item.name}. It never creates a request or a receipt.</span></p>
        )}
      </section>
      <nav aria-label="More companies" className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/try/explore" className={secondaryBtn}><ArrowLeft aria-hidden className="size-4"/>All companies</Link>
        <Link href={`/try/explore/${neighbour.id}`} className={secondaryBtn}>Next: meet {personName(neighbour)}<ArrowRight aria-hidden className="size-4"/></Link>
      </nav>
    </div>
  );
}
