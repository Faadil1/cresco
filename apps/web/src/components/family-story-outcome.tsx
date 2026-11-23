"use client";

import Link from "next/link";
import { MinaGroceryArt } from "@/components/illustrations/mina-grocery";
import { StoryVignette } from "@/components/illustrations/family-story";
import { useFamilyStory } from "@/components/family-story-provider";
import { ArrowRight } from "lucide-react";
import { ChapterHeading, ResultCard, Stat, panel, primaryBtn, secondaryBtn, textLink } from "@/components/family-story-ui";
import {
  PRACTICE_ASSETS, evaluatePracticeScenario, remainingCredits, selectedPracticeGoal,
} from "@/lib/family-public-practice";
import { DECLINE_REASONS, personName } from "@/lib/family-story-state";
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
  // Research-only fictional cases have no practiceCode. Without this guard,
  // an empty storyAsset (no receipt/request yet) can accidentally match the
  // first research-only case and crash the empty /try/outcome deep link.
  const episodeCompany = storyAsset
    ? FAMILY_EXPLORE_CASES.find(item => item.practiceCode === storyAsset)
    : undefined;
  const episodeChoice = episodeCompany
    ? lastRequest && lastRequest.asset === storyAsset
      ? story.requestEpisodeChoices[lastRequest.id]
      : story.episodeChoices[episodeCompany.id]
    : undefined;
  const newestIsRequest = lastRequest && (!lastReceipt || lastRequest.id > lastReceipt.id);
  const name = (code: string) => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code;
  const downturn = evaluatePracticeScenario(p, "downturn");
  // After a real decision, and before the family has talked, the loop's next step is "Talk it through".
  const talkNext = !pending && !approved && (p.receipts.length > 0 || p.requests.some(r => r.status !== "pending")) && !p.togetherCompleted;
  const declineReason = lastRequest ? DECLINE_REASONS.find(item => item.id === story.declineReasons[lastRequest.id]) : undefined;

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
        <p className="mt-1 text-[13px] font-semibold">Practice receipt · no real money moved.</p>
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
      <ChapterHeading kicker="Your choice · result" title="What happened"
        art={<StoryVignette role={approved ? "approved" : "request"} className="block h-auto w-full rounded-[20px]" title="An illustrated teenager and parent after a practice decision"/>}/>
      {hero}
      {episodeCompany && episodeChoice !== undefined ? (
        <section className={panel} data-testid="episode-takeaway" aria-label="Remember your earlier choice">
          {episodeCompany.id === "markets" ? <MinaGroceryArt className="float-right mb-2 ml-3 h-[104px] w-[90px] overflow-hidden rounded-[14px] sm:h-[130px] sm:w-[112px]"/> : null}
          <p className="cresco-section-kicker">Your story, not just a receipt</p>
          <h2 className="mt-1 text-[18px] font-extrabold leading-6 text-navy-strong">Remember {personName(episodeCompany)}?</h2>
          <p className="mt-2 text-[14px] leading-6 text-navy"><strong>You chose:</strong> {episodeCompany.episode.options[episodeChoice]}.</p>
          <p className="mt-1 text-[14px] leading-6 text-navy">{episodeCompany.episode.reflection[episodeChoice]}</p>
          <p className="mt-2 text-[12px] leading-5 text-ink-2">Think about what you would ask next. This story answer did not change your Key, approval or pretend balance.</p>
          <Link className="mt-3 inline-block text-[13px] font-bold text-green-strong underline underline-offset-4" href={`/try/explore/${episodeCompany.id}`}>Return to the fictional company</Link>
        </section>
      ) : null}

      <section aria-label="Consequences for your goal" className={`${panel} !p-4 md:!p-5`} data-testid="outcome-numbers">
        <h2 className="text-[16px] font-extrabold text-navy-strong">Your 100 pretend credits now</h2>
        <dl className="mt-2 grid grid-cols-3 gap-2">
          <Stat label={`Saved for ${goal.label.toLowerCase()}`} value={<span data-testid="outcome-saved">{p.saved} / {goal.target}</span>}/>
          <Stat label="In practice" value={<span data-testid="outcome-spent">{p.spent}</span>}/>
          <Stat label="Free" value={<span data-testid="outcome-available">{remainingCredits(p)}</span>}/>
        </dl>
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

      {/* One primary next step: after a real decision the loop continues with "Talk it through". */}
      <nav aria-label="What next" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5" data-testid="outcome-next">
        {talkNext
          ? <Link href="/try/together" className={`w-full sm:w-auto ${primaryBtn}`} data-testid="outcome-talk">Talk it through<ArrowRight aria-hidden className="size-4"/></Link>
          : <Link href="/try/home" className={`w-full sm:w-auto ${primaryBtn}`} data-testid="outcome-home">Back to Home<ArrowRight aria-hidden className="size-4"/></Link>}
        <span className="flex flex-wrap gap-x-5">
          {talkNext
            ? <Link href="/try/home" className={textLink} data-testid="outcome-home">Back to Home</Link>
            : <Link href="/try/together" className={textLink}>Talk it through</Link>}
          <Link href="/try/decision" className={textLink}>Make another choice</Link>
          <Link href="/try/portfolio" className={textLink}>Open my portfolio</Link>
        </span>
      </nav>
    </div>
  );
}
