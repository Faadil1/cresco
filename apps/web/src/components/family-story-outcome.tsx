"use client";

import Link from "next/link";
import { BadgeArt } from "@/components/illustrations/badges";
import { StoryVignette } from "@/components/illustrations/family-story";
import { useFamilyStory } from "@/components/family-story-provider";
import { FamilyPracticePortfolio } from "@/components/family-public-portfolio";
import { ChapterHeading, ChapterNav, ResultCard, panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import {
  CHILD_LEARNING, PRACTICE_ASSETS, evaluatePracticeScenario, remainingCredits, selectedPracticeGoal,
} from "@/lib/family-public-practice";
import { DECLINE_REASONS } from "@/lib/family-story-state";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";

const credits = (value: number) => value.toFixed(2);

export function OutcomeChapter() {
  const { story, act } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const approved = p.requests.find(r => r.status === "approved-once");
  const pending = p.requests.find(r => r.status === "pending");
  const lastRequest = p.requests[0];
  const lastReceipt = p.receipts[0];
  // Keep the Child's earlier reflection in the outcome, without claiming a real
  // financial outcome or making it part of permission enforcement.
  const storyAsset = lastReceipt?.asset ?? lastRequest?.asset;
  const episodeCompany = FAMILY_EXPLORE_CASES.find(item => item.practiceCode === storyAsset);
  const episodeChoice = episodeCompany
    ? lastRequest?.asset === storyAsset
      ? story.requestEpisodeChoices[lastRequest.id]
      : story.episodeChoices[episodeCompany.id]
    : undefined;
  const newestIsRequest = lastRequest && (!lastReceipt || lastRequest.id > lastReceipt.id);
  const name = (code: string) => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code;
  const downturn = evaluatePracticeScenario(p, "downturn");
  const declineReason = lastRequest ? DECLINE_REASONS.find(item => item.id === story.declineReasons[lastRequest.id]) : undefined;
  const badges = [
    { badge: "first-investor", earned: p.receipts.length > 0, label: "First practice choice" },
    { badge: "company-detective", earned: story.researched.length > 0, label: "Researched a company" },
    { badge: "diversification-pro", earned: Object.values(p.holdings).filter(shares => shares > 0).length >= 2, label: "Two different holdings" },
    { badge: "money-master", earned: p.childCompleted.length === CHILD_LEARNING.length, label: "Finished Child lessons" },
  ] as const;

  let hero;
  if (approved) {
    hero = (
      <ResultCard tone="good" title="Your Parent said yes, once." testId="outcome-hero">
        <p>{approved.amount} credits of {name(approved.asset)}. Your standing Key did not change, and this approval works one time only.</p>
        <button type="button" className={`mt-3 ${primaryBtn}`} data-testid="use-approval"
          onClick={() => act({ type: "practice", action: { type: "buy", asset: approved.asset, amount: approved.amount } })}>
          Use the approval: {approved.amount} {approved.asset}
        </button>
      </ResultCard>
    );
  } else if (pending) {
    hero = (
      <ResultCard tone="wait" title="Blocked by My Key. Your Parent is deciding." testId="outcome-hero">
        <p>{pending.amount} credits of {name(pending.asset)} is above your {p.key.maxPerAction}-credit limit, so nothing was bought. A simulated Parent can approve it once or decline it.</p>
        <Link href="/try/parent/request" className={`mt-3 ${primaryBtn}`} data-testid="to-parent">Hand the phone to your Parent</Link>
      </ResultCard>
    );
  } else if (newestIsRequest && lastRequest.status === "declined") {
    hero = (
      <ResultCard tone="info" title="Your Parent declined. Nothing was bought." testId="outcome-hero">
        <p>{declineReason?.explain ?? "Your Parent chose not to approve this exact choice."}</p>
        <span className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link href="/try/decision" className={primaryBtn} data-testid="try-smaller">Choose a smaller amount</Link>
          <Link href="/try/together" className={secondaryBtn}>Talk it through together</Link>
        </span>
      </ResultCard>
    );
  } else if (newestIsRequest && lastRequest.status === "stale") {
    hero = (
      <ResultCard tone="stop" title="That ask expired." testId="outcome-hero">
        <p>Your Parent changed My Key after you asked, so the old request no longer matches. You can choose again under the new Key.</p>
        <Link href="/try/decision" className={`mt-3 ${primaryBtn}`}>Choose again</Link>
      </ResultCard>
    );
  } else if (lastReceipt) {
    hero = (
      <ResultCard tone="good" title={lastReceipt.permission === "allow-once" ? "Done with your Parent's one-time approval." : "Done inside My Key, on your own."} testId="outcome-hero">
        <p data-testid="receipt-line"><strong>Receipt #{lastReceipt.id}:</strong> {lastReceipt.amount} credits · {name(lastReceipt.asset)} ({lastReceipt.asset}) · {lastReceipt.shares.toFixed(2)} pretend units.
          {lastReceipt.permission === "allow-once" ? " That approval is now used up and cannot be replayed." : " No approval was needed."}</p>
        <p className="mt-1 text-[11px] font-bold tracking-wide">PRACTICE ONLY - NOT EXECUTED ONCHAIN</p>
      </ResultCard>
    );
  } else {
    hero = (
      <ResultCard tone="info" title="Nothing has happened yet." testId="outcome-hero">
        <p>When you make a practice choice, this page shows the receipt, or what your Parent decided, and what it means for your goal.</p>
        <Link href="/try/decision" className={`mt-3 ${primaryBtn}`} data-testid="go-choose">Make a choice</Link>
      </ResultCard>
    );
  }

  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Chapter 6 · What happened" title="See where your choice led"
        art={<StoryVignette role={approved ? "approved" : "request"} className="block h-auto w-full rounded-[20px]" title="An illustrated teenager and parent after a practice decision"/>}/>
      {hero}
      {episodeCompany && episodeChoice !== undefined ? (
        <section className={panel} data-testid="episode-takeaway" aria-label="Remember your earlier choice">
          <p className="cresco-section-kicker">Your story, not just a receipt</p>
          <h2 className="mt-1 font-display text-[24px] text-navy-strong">Remember {episodeCompany.episode.person}?</h2>
          <p className="mt-2 text-[14px] leading-6 text-navy"><strong>You chose:</strong> {episodeCompany.episode.options[episodeChoice]}.</p>
          <p className="mt-1 text-[14px] leading-6 text-navy">{episodeCompany.episode.reflection[episodeChoice]}</p>
          <p className="mt-2 text-[12px] leading-5 text-ink-2">Think about what you would ask next. This story answer did not change your Key, approval or pretend balance.</p>
          <Link className="mt-3 inline-block text-[13px] font-bold text-green-strong underline underline-offset-4" href={`/try/explore/${episodeCompany.id}`}>Return to the fictional company</Link>
        </section>
      ) : null}

      <section aria-label="Consequences for your goal" className="grid gap-3 sm:grid-cols-3" data-testid="outcome-numbers">
        <div className={panel}>
          <p className="text-[12px] font-semibold text-ink-2">Set aside for your {goal.label.toLowerCase()}</p>
          <p className="mt-1 font-display text-[30px] text-navy-strong" data-testid="outcome-saved">{p.saved} / {goal.target}</p>
        </div>
        <div className={panel}>
          <p className="text-[12px] font-semibold text-ink-2">Practice credits available</p>
          <p className="mt-1 font-display text-[30px] text-navy-strong" data-testid="outcome-available">{remainingCredits(p)}</p>
        </div>
        <div className={panel}>
          <p className="text-[12px] font-semibold text-ink-2">Used for practice choices</p>
          <p className="mt-1 font-display text-[30px] text-navy-strong" data-testid="outcome-spent">{p.spent}</p>
        </div>
      </section>

      {p.spent > 0 ? (
        <section className={panel} data-testid="downturn-card">
          <h2 className="text-[18px] font-bold text-navy-strong">If a bad month hit (invented scenario)</h2>
          <p className="mt-1 text-[14px] leading-6 text-navy">
            Your {credits(downturn.original)} practice credits would be worth about <strong>{credits(downturn.hypothetical)}</strong>
            , a change of <strong>{credits(downturn.hypothetical - downturn.original)}</strong>. Your goal savings of {p.saved} are separate and do not move.
          </p>
          <p className="mt-1 text-[12px] text-ink-3">Invented percentages, not a prediction. Receipts and credits do not change.</p>
        </section>
      ) : null}

      <section className={panel} aria-labelledby="earned-title">
        <h2 id="earned-title" className="text-[18px] font-bold text-navy-strong">Earned in practice</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {badges.map(item => (
            <div key={item.badge} className="flex w-[110px] flex-col items-center gap-1 text-center">
              <BadgeArt badge={item.badge} earned={item.earned} className="size-14"/>
              <span className="text-[11px] font-semibold text-navy-strong">{item.label}</span>
              <span className="text-[10px] text-ink-3">{item.earned ? "Earned" : "Not yet"}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-2">Badges celebrate what you actually did. They never change My Key.</p>
      </section>

      <details className="rounded-[20px] border border-line-soft bg-surface p-4" data-testid="portfolio-details">
        <summary className="min-h-11 cursor-pointer text-[15px] font-bold text-navy-strong">Open the full portfolio, receipts and what-if scenarios</summary>
        <div className="mt-4"><FamilyPracticePortfolio state={p}/></div>
      </details>

      <ChapterNav back={{ href: "/try/decision", label: "Make another choice" }} next={{ href: "/try/together", label: "Talk it through" }}/>
    </div>
  );
}
