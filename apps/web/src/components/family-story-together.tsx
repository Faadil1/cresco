"use client";

import Link from "next/link";
import { useState } from "react";
import { Together } from "@/components/family-public-studio";
import { useFamilyStory } from "@/components/family-story-provider";
import { ChapterHeading, ChapterNav, ResultCard, panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";
import {
  CHILD_LEARNING, PARENT_LEARNING, selectedPracticeGoal, type FamilyRole,
} from "@/lib/family-public-practice";
import { childPathFor } from "@/components/family-story-learn";

export function TogetherChapter() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const [role, setRole] = useState<FamilyRole>("child");
  const goal = selectedPracticeGoal(p);
  const nextChild = childPathFor(goal.id).find(item => !p.childCompleted.includes(item.id));
  const nextParent = PARENT_LEARNING.find(item => !p.parentCompleted.includes(item.id));
  const nextCompany = FAMILY_EXPLORE_CASES.find(item => !story.viewed.includes(item.id));
  const rememberedCompany = FAMILY_EXPLORE_CASES.find(item => story.episodeChoices[item.id] !== undefined);
  const rememberedChoice = rememberedCompany ? story.episodeChoices[rememberedCompany.id] : undefined;
  const decided = p.requests.filter(r => r.status !== "pending").length;
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Chapter 7 · Together" title="Talk it through, then choose what is next"
        intro="Each person adds a view, one at a time. Neither answer approves or changes anything. It is a conversation."/>
      <div role="group" aria-label="Who is answering" className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={role === "child"} className={role === "child" ? primaryBtn : secondaryBtn} onClick={() => setRole("child")}>Answering as the Child</button>
        <button type="button" aria-pressed={role === "parent"} className={role === "parent" ? primaryBtn : secondaryBtn} onClick={() => setRole("parent")}>Answering as the Parent</button>
      </div>
      <Together role={role} state={p}
        childAnswer={choice => dispatch({ type: "practice", action: { type: "discussion-child", choice } })}
        parentAnswer={choice => dispatch({ type: "practice", action: { type: "discussion-parent", choice } })}
        onComplete={() => dispatch({ type: "practice", action: { type: "together" } })}/>
      {p.togetherCompleted ? (
        <>
          <ResultCard tone="good" title="Family check-in complete." testId="together-result">
            <p>Your story so far: a {goal.label.toLowerCase()} goal ({p.saved}/{goal.target} set aside), {p.childCompleted.length} Child and {p.parentCompleted.length} Parent lessons, {story.researched.length} companies researched, {p.receipts.length} practice {p.receipts.length === 1 ? "receipt" : "receipts"}, {decided} Parent {decided === 1 ? "decision" : "decisions"}.</p>
          </ResultCard>
          {rememberedCompany && rememberedChoice !== undefined ? (
            <section className={panel} aria-label="A story to remember" data-testid="together-story-memory">
              <p className="cresco-section-kicker">A conversation to take home · fictional example</p>
              <h2 className="mt-1 font-display text-[25px] text-navy-strong">Remember {rememberedCompany.episode.person}?</h2>
              <p className="mt-2 text-[14px] leading-6 text-navy">{rememberedCompany.episode.dilemma}</p>
              <p className="mt-2 text-[13px] leading-6 text-navy"><strong>Your first thought:</strong> {rememberedCompany.episode.options[rememberedChoice]}.</p>
              <p className="mt-2 text-[13px] leading-6 text-navy"><strong>Discuss together:</strong> What new fact could change your mind? There is no single correct family opinion here.</p>
              <Link className="mt-3 inline-block text-[13px] font-bold text-green-strong underline underline-offset-4"
                href={`/try/explore/${rememberedCompany.id}`}>Revisit this story</Link>
            </section>
          ) : null}
          <section className={panel} aria-labelledby="next-title" data-testid="next-chapter-choice">
            <h2 id="next-title" className="font-display text-[26px] text-navy-strong">What do you want to learn next?</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {nextChild ? <Link className={secondaryBtn} href={`/try/learn/${nextChild.id}`}>Child lesson: {nextChild.title}</Link> : <span className="rounded-[14px] bg-green-soft p-3 text-[13px] font-semibold text-green-strong">All {CHILD_LEARNING.length} Child lessons done</span>}
              {nextParent ? <Link className={secondaryBtn} href={`/try/learn/${nextParent.id}`}>Parent lesson: {nextParent.title}</Link> : <span className="rounded-[14px] bg-green-soft p-3 text-[13px] font-semibold text-green-strong">All Parent lessons done</span>}
              {nextCompany ? <Link className={secondaryBtn} href={`/try/explore/${nextCompany.id}`}>Meet {nextCompany.name}</Link> : <Link className={secondaryBtn} href="/try/decision">Make another practice choice</Link>}
            </div>
          </section>
        </>
      ) : null}
      <ChapterNav back={{ href: "/try/outcome", label: "What happened" }} next={{ href: "/try/learn", label: "Back to my learning path" }}/>
    </div>
  );
}
