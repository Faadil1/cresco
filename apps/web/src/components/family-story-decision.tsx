"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { StoryVignette } from "@/components/illustrations/family-story";
import { useFamilyStory } from "@/components/family-story-provider";
import { KeyChip } from "@/components/family-story-explore";
import { ChapterHeading, ChapterNav, CompanyArt, panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";
import {
  PRACTICE_ASSETS, previewPracticeChoice, remainingCredits, type AssetCode,
} from "@/lib/family-public-practice";
import { REASONS, choiceImpact, type ReasonId } from "@/lib/family-story-state";

const toneFor = (kind: string) =>
  kind === "inside-key" || kind === "approved-once" ? "bg-green-soft text-green-strong"
    : kind === "needs-parent" || kind === "pending" ? "bg-yellow-soft text-navy-strong" : "bg-surface-soft text-navy-strong";

function Chooser() {
  const { story, dispatch } = useFamilyStory();
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Chapter 4 · Make a choice" title="Which company do you want to practice with?"
        intro="Practice choices exist for three of the six invented companies. The other three are research only."
        art={<StoryVignette role="teen" className="block h-auto w-full rounded-[20px]" title="An illustrated teenager deciding what to practice"/>}/>
      <KeyChip/>
      <ul className="grid gap-3 md:grid-cols-3" aria-label="Companies you can practice with">
        {PRACTICE_ASSETS.map(asset => {
          const item = FAMILY_EXPLORE_CASES.find(entry => entry.practiceCode === asset.code)!;
          const researched = story.researched.includes(item.id);
          return (
            <li key={asset.code} className={`${panel} !p-4`}>
              <CompanyArt id={item.id} name={asset.name} className="mb-3 block h-auto max-h-[120px] w-full overflow-hidden rounded-[14px]"/>
              <h2 className="text-[18px] font-bold text-navy-strong">{asset.name}</h2>
              <p className="text-[12px] text-ink-2">{asset.price} credits per unit · {researched ? "researched" : "not researched yet"}</p>
              <button type="button" className={`mt-3 w-full ${primaryBtn}`} onClick={() => dispatch({ type: "pick-asset", code: asset.code })}>Choose {asset.code}</button>
              {!researched ? <Link href={`/try/explore/${item.id}`} className="mt-2 inline-flex min-h-11 items-center text-[13px] font-bold text-green-strong underline underline-offset-4">Research it first</Link> : null}
            </li>
          );
        })}
      </ul>
      <ChapterNav back={{ href: "/try/explore", label: "Explore" }}/>
    </div>
  );
}

function ChoiceForm({ code }: { code: AssetCode }) {
  const router = useRouter();
  const { story, dispatch, act } = useFamilyStory();
  const p = story.practice;
  const asset = PRACTICE_ASSETS.find(a => a.code === code)!;
  const item = FAMILY_EXPLORE_CASES.find(entry => entry.practiceCode === code)!;
  const [amount, setAmount] = useState(String(Math.min(10, p.key.maxPerAction)));
  const [reason, setReason] = useState<ReasonId>("goal-fit");
  const n = Number(amount);
  const preview = previewPracticeChoice(p, code, n);
  const impact = choiceImpact(story, Number.isFinite(n) ? n : 0);
  const limit = p.key.maxPerAction;
  const scale = Math.max(limit * 2, Number.isFinite(n) ? n : 0, 1);
  const label: Record<string, string> = {
    "inside-key": "Make this practice choice",
    "needs-parent": "Ask my Parent (blocked by my Key)",
    "approved-once": "Use my Parent's approval",
  };
  const disabled = !(preview.kind in label);
  const submit = () => {
    const before = p;
    const next = act({ type: "practice", action: { type: "buy", asset: code, amount: n }, reason });
    if (next.receipts.length > before.receipts.length || next.requests.length > before.requests.length) router.push("/try/outcome");
  };
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Chapter 4 · Make a choice" title={`Practice with ${asset.name}`}
        intro={<>{asset.description} Practice price: <strong>{asset.price} credits per unit</strong>.</>}
        art={<CompanyArt id={item.id} name={asset.name} className="hidden h-auto w-full overflow-hidden rounded-[20px] border border-line-soft md:block"/>}/>
      <section className={panel} aria-labelledby="amount-title">
        <h2 id="amount-title" className="text-[18px] font-bold text-navy-strong">How many practice credits?</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className={secondaryBtn} onClick={() => setAmount(String(Math.max(1, (Number.isFinite(n) ? n : 0) - 5)))} aria-label="Five fewer credits">-5</button>
          <input aria-label="Practice credits" type="number" inputMode="numeric" min="1" max="100" step="1" value={amount}
            onChange={event => setAmount(event.target.value)} className="min-h-12 w-28 rounded-[12px] border border-line bg-surface px-3 text-center text-[20px] font-bold text-navy-strong"/>
          <button type="button" className={secondaryBtn} onClick={() => setAmount(String(Math.min(100, (Number.isFinite(n) ? n : 0) + 5)))} aria-label="Five more credits">+5</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-full border border-green/40 bg-green-soft px-4 text-[13px] font-bold text-green-strong" onClick={() => setAmount(String(Math.min(10, limit)))}>A small choice ({Math.min(10, limit)})</button>
          <button type="button" className="min-h-11 rounded-full border border-orange/40 bg-yellow-soft px-4 text-[13px] font-bold text-navy-strong" onClick={() => setAmount(String(limit + 10))}>A bigger choice ({limit + 10})</button>
        </div>
        <div className="mt-4" aria-hidden>
          <div className="relative h-4 overflow-hidden rounded-full bg-surface-soft">
            <div className={`h-full rounded-full ${preview.kind === "inside-key" || preview.kind === "approved-once" ? "bg-green-strong" : "bg-orange"}`} style={{ width: `${Math.min(100, (Number.isFinite(n) ? n : 0) / scale * 100)}%` }}/>
            <div className="absolute inset-y-0 w-0.5 bg-navy-strong" style={{ left: `${limit / scale * 100}%` }}/>
          </div>
          <p className="mt-1 text-[11px] text-ink-2">The line is your Key limit ({limit}).</p>
        </div>
        <p data-testid="limit-preview" data-preview-kind={preview.kind} className={`mt-3 rounded-[14px] px-4 py-3 text-[14px] font-semibold leading-6 ${toneFor(preview.kind)}`}>
          <KeyRound aria-hidden className="mr-1.5 inline size-4"/>{preview.message}
        </p>
        {preview.kind !== "invalid" ? (
          <p data-testid="choice-impact" className="mt-3 text-[13px] leading-6 text-ink-2">
            If it goes through, you keep <strong>{impact.availableAfter}</strong> credits available and <strong>{impact.saved}</strong> stay set aside for your {impact.goal.label.toLowerCase()} ({impact.goalPercent}% of {impact.goal.target}). {remainingCredits(p) - n < 0 ? "That is more than you have." : ""}
          </p>
        ) : null}
      </section>
      {!story.researched.includes(item.id) ? (
        <p className="rounded-[14px] bg-yellow-soft px-4 py-3 text-[13px] leading-6 text-navy-strong" data-testid="research-nudge">
          You have not answered the research question for {asset.name}. <Link href={`/try/explore/${item.id}`} className="font-bold text-green-strong underline underline-offset-4">Read it first</Link> or continue anyway.
        </p>
      ) : null}
      <fieldset className={panel}>
        <legend className="px-1 text-[16px] font-bold text-navy-strong">Why this choice? <span className="text-[13px] font-normal text-ink-3">Your Parent sees this if it needs approval.</span></legend>
        <div className="mt-2 grid gap-2">
          {REASONS.map(option => (
            <label key={option.id} className={`flex min-h-12 items-center gap-3 rounded-[14px] border px-3 text-[14px] font-semibold ${reason === option.id ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-ink-2"}`}>
              <input type="radio" name="reason" checked={reason === option.id} onChange={() => setReason(option.id)}/>{option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" className={primaryBtn} data-testid="make-choice" disabled={disabled} onClick={submit}>{label[preview.kind] ?? "Choose another amount"}</button>
        <button type="button" className={secondaryBtn} onClick={() => dispatch({ type: "pick-asset", code: null })}>Pick another company</button>
      </div>
      {preview.kind === "pending" ? <p className="text-[13px] text-ink-2">Your Parent is deciding. <Link className="font-bold text-green-strong underline underline-offset-4" href="/try/parent/request">Open the request</Link>.</p> : null}
      <ChapterNav back={{ href: `/try/explore/${item.id}`, label: `About ${asset.name}` }} next={{ href: "/try/outcome", label: "What happened" }}/>
    </div>
  );
}

export function DecisionChapter() {
  const { story } = useFamilyStory();
  return story.pick ? <ChoiceForm key={story.pick} code={story.pick}/> : <Chooser/>;
}
