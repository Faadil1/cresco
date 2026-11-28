"use client";

/**
 * "Talk it through": the last step of the learning loop. The Child's and the
 * Parent's views sit side by side (on a phone: one after the other, with a
 * hand-over cue). Answers are conversation only: they never approve, buy or
 * change the Key. Uses the unchanged practice reducer actions.
 */
import Link from "next/link";
import { HeartHandshake, Receipt, Users } from "lucide-react";
import { MinaGroceryArt } from "@/components/illustrations/mina-grocery";
import { childChoices, parentChoices } from "@/components/family-public-studio";
import { useFamilyStory } from "@/components/family-story-provider";
import { ChapterHeading, ResultCard, kicker, panel, primaryBtn, secondaryBtn, textLink } from "@/components/family-story-ui";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";
import { CHILD_LEARNING, PARENT_LEARNING, PRACTICE_ASSETS, selectedPracticeGoal } from "@/lib/family-public-practice";
import { childPathFor, metCases } from "@/lib/family-story-state";

export function TogetherChapter() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const goalWord = goal.label.toLowerCase();
  const fitGoal = (title: string) => title.replace("bike goal", `${goalWord} goal`);
  const nextChild = childPathFor(goal.id).find(item => !p.childCompleted.includes(item.id));
  const nextParent = PARENT_LEARNING.find(item => !p.parentCompleted.includes(item.id));
  const met = metCases(story);
  const nextCompany = FAMILY_EXPLORE_CASES.find(item => !met.includes(item.id));
  const rememberedCompany = FAMILY_EXPLORE_CASES.find(item => story.episodeChoices[item.id] !== undefined);
  const rememberedChoice = rememberedCompany ? story.episodeChoices[rememberedCompany.id] : undefined;
  const decided = p.requests.filter(r => r.status !== "pending").length;
  const child = childChoices.find(choice => choice.id === p.discussion.child);
  const parent = parentChoices.find(choice => choice.id === p.discussion.parent);
  const name = (code: string) => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code;
  const lastReceipt = p.receipts[0];
  const lastRequest = p.requests[0];
  const latest = lastReceipt && (!lastRequest || lastReceipt.id > lastRequest.id)
    ? `Receipt #${lastReceipt.id}: ${lastReceipt.amount} credits of ${name(lastReceipt.asset)}, ${lastReceipt.permission === "allow-once" ? "with the Parent's one-time yes" : "chosen alone inside the Key"}.`
    : lastRequest ? `Ask #${lastRequest.id}: ${lastRequest.amount} credits of ${name(lastRequest.asset)} (${lastRequest.status === "declined" ? "declined" : lastRequest.status === "pending" ? "still waiting" : lastRequest.status === "stale" ? "expired after a Key change" : "approved once"}).`
      : null;

  const choiceButton = (selected: boolean, title: string, why: string, onClick: () => void) => (
    <button type="button" key={title} aria-pressed={selected} onClick={onClick}
      className={`min-h-12 rounded-[14px] border px-4 py-3 text-left ${selected ? "border-green-strong bg-green-soft" : "border-line bg-surface hover:border-family-action/40"}`}>
      <span className="block text-[15px] font-bold leading-5 text-navy-strong">{title}</span>
      <span className="mt-1 block text-[13px] leading-5 text-ink-2">{why}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Child + Parent · together" title="Talk it through"
        intro="One view each, then compare. Neither answer approves, buys or changes the Key. It is a conversation."/>

      {latest ? (
        <p className="flex items-start gap-2 rounded-[16px] border border-line-soft bg-surface px-4 py-3 text-[14px] leading-6 text-navy" data-testid="together-latest">
          <Receipt aria-hidden className="mt-1 size-4 shrink-0 text-green-strong"/>
          <span><strong className="text-navy-strong">What you are talking about: </strong>{latest}</span>
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${panel} !p-4 md:!p-5`} aria-labelledby="together-child-title">
          <p className={`${kicker} text-green-strong`}>1 · Child&apos;s view</p>
          <h2 id="together-child-title" className="mt-1 text-[18px] font-extrabold leading-6 text-navy-strong">What matters most for your {goalWord}?</h2>
          <p className="mt-1 text-[13px] text-ink-2">{p.saved} of {goal.target} pretend credits set aside.</p>
          <div className="mt-3 grid gap-2" role="group" aria-label="Child family goal choices">
            {childChoices.map(choice => choiceButton(p.discussion.child === choice.id, fitGoal(choice.title), choice.why,
              () => dispatch({ type: "practice", action: { type: "discussion-child", choice: choice.id } })))}
          </div>
        </section>
        <section className={`${panel} !p-4 md:!p-5`} aria-labelledby="together-parent-title">
          <p className={`${kicker} text-lavender`}>2 · Parent&apos;s view</p>
          <h2 id="together-parent-title" className="mt-1 text-[18px] font-extrabold leading-6 text-navy-strong">How would you guide this goal?</h2>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2 md:hidden"><Users aria-hidden className="size-4"/>Hand the phone to your Parent for this part.</p>
          <div className="mt-3 grid gap-2" role="group" aria-label="Parent family guidance choices">
            {parentChoices.map(choice => choiceButton(p.discussion.parent === choice.id, choice.title, choice.why,
              () => dispatch({ type: "practice", action: { type: "discussion-parent", choice: choice.id } })))}
          </div>
        </section>
      </div>

      <section className={`${panel} !p-4 md:!p-5`} aria-labelledby="together-compare-title">
        <h2 id="together-compare-title" className="flex items-center gap-2 text-[18px] font-extrabold text-navy-strong"><HeartHandshake aria-hidden className="size-5 text-green-strong"/>Compare your two views</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-[14px] bg-surface-soft p-3">
            <dt className="text-[13px] font-semibold text-ink-2">Child said</dt>
            <dd className="mt-1 text-[15px] font-bold text-navy-strong" data-testid="together-child-answer">{child ? fitGoal(child.title) : "Waiting for the Child"}</dd>
          </div>
          <div className="rounded-[14px] bg-surface-soft p-3">
            <dt className="text-[13px] font-semibold text-ink-2">Parent said</dt>
            <dd className="mt-1 text-[15px] font-bold text-navy-strong" data-testid="together-parent-answer">{parent ? parent.title : "Waiting for the Parent"}</dd>
          </div>
        </dl>
        {child && parent ? (
          <p className="mt-3 rounded-[14px] border border-green/20 bg-green-soft p-3 text-[14px] leading-6 text-navy-strong">
            <strong>Talk about it: </strong>the Child values that {child.why.charAt(0).toLowerCase() + child.why.slice(1)} The Parent suggests: {parent.why} Agree on one thing to learn next.
          </p>
        ) : null}
        <button type="button" className={`mt-3 w-full sm:w-auto ${primaryBtn}`}
          disabled={!child || !parent || p.togetherCompleted} onClick={() => dispatch({ type: "practice", action: { type: "together" } })}>
          {p.togetherCompleted ? "Family check-in completed" : "Mark our discussion complete"}
        </button>
      </section>

      {p.togetherCompleted ? (
        <>
          <ResultCard tone="good" title="Family check-in complete. That closes a full loop." testId="together-result">
            <p>Your story so far: a {goalWord} goal ({p.saved}/{goal.target} set aside), {p.childCompleted.length} Child and {p.parentCompleted.length} Parent lessons, {story.researched.length} companies researched, {p.receipts.length} practice {p.receipts.length === 1 ? "receipt" : "receipts"}, {decided} Parent {decided === 1 ? "decision" : "decisions"}.</p>
          </ResultCard>
          {rememberedCompany && rememberedChoice !== undefined ? (
            <section className={`${panel} !p-4 md:!p-5`} aria-label="A story to remember" data-testid="together-story-memory">
              {rememberedCompany.id === "markets" ? <MinaGroceryArt className="float-right mb-2 ml-3 h-[110px] w-[96px] overflow-hidden rounded-[14px]"/> : null}
              <p className={`${kicker} text-green-strong`}>A conversation to take home</p>
              <h2 className="mt-1 text-[18px] font-extrabold leading-6 text-navy-strong">Remember {rememberedCompany.episode.person}?</h2>
              <p className="mt-2 text-[14px] leading-6 text-navy">{rememberedCompany.episode.dilemma}</p>
              <p className="mt-2 text-[14px] leading-6 text-navy"><strong>Your first thought:</strong> {rememberedCompany.episode.options[rememberedChoice]}.</p>
              <p className="mt-2 text-[14px] leading-6 text-navy"><strong>Ask each other:</strong> What new fact could change your mind? There is no single correct family opinion here.</p>
              <Link className={textLink} href={`/try/explore/${rememberedCompany.id}`}>Revisit this story</Link>
            </section>
          ) : null}
          <section className={`${panel} !p-4 md:!p-5`} aria-labelledby="next-title" data-testid="next-chapter-choice">
            <h2 id="next-title" className="text-[18px] font-extrabold text-navy-strong">Start the next round</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {nextChild ? <Link className={secondaryBtn} href={`/try/learn/${nextChild.id}`}>Child lesson: {nextChild.title}</Link> : <span className="rounded-[14px] bg-green-soft p-3 text-[13px] font-semibold text-green-strong">All {CHILD_LEARNING.length} Child lessons done</span>}
              {nextParent ? <Link className={secondaryBtn} href={`/try/learn/${nextParent.id}`}>Parent lesson: {nextParent.title}</Link> : <span className="rounded-[14px] bg-green-soft p-3 text-[13px] font-semibold text-green-strong">All Parent lessons done</span>}
              {nextCompany ? <Link className={secondaryBtn} href={`/try/explore/${nextCompany.id}`}>Meet {nextCompany.name}</Link> : <Link className={secondaryBtn} href="/try/decision">Make another practice choice</Link>}
            </div>
          </section>
        </>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href="/try/home" className={p.togetherCompleted ? primaryBtn : secondaryBtn} data-testid="together-home">Back to Home</Link>
        <Link href="/try/outcome" className={textLink}>What happened</Link>
      </div>
    </div>
  );
}
