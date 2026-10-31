"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink } from "lucide-react";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { useFamilyStory } from "@/components/family-story-provider";
import { ChapterHeading, ChapterNav, ResultCard, panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import {
  CHILD_LEARNING, PARENT_LEARNING, selectedPracticeGoal,
  type LearningModule, type PracticeGoalId,
} from "@/lib/family-public-practice";
import { GOAL_STORY, childLessonNote, parentLessonNote } from "@/lib/family-story-state";

const FIRST_FOR_GOAL: Record<PracticeGoalId, string> = {
  bike: "c-save", gaming: "original-why-prices-move", trip: "original-build-your-portfolio",
};
/** The Child's path starts where the chosen goal needs it most; the rest keep their order. */
export function childPathFor(goalId: PracticeGoalId): LearningModule[] {
  const first = CHILD_LEARNING.find(item => item.id === FIRST_FOR_GOAL[goalId]);
  return first ? [first, ...CHILD_LEARNING.filter(item => item.id !== first.id)] : CHILD_LEARNING;
}
const isParentLesson = (id: string) => PARENT_LEARNING.some(item => item.id === id);

function LessonThumb({ lesson }: { lesson: LearningModule }) {
  return lesson.illustration
    ? <LessonIllustration kind={lesson.illustration} title={`${lesson.title} illustration`} className="h-16 w-24 shrink-0 overflow-hidden rounded-[12px]"/>
    : <BookOpen aria-hidden className="size-8 shrink-0 text-green-strong"/>;
}

export function LearnChapter() {
  const { story } = useFamilyStory();
  const goal = selectedPracticeGoal(story.practice);
  const g = GOAL_STORY[goal.id];
  const path = childPathFor(goal.id);
  const done = story.practice.childCompleted;
  const next = path.find(item => !done.includes(item.id));
  return (
    <div className="space-y-6">
      <ChapterHeading kicker="Chapter 2 · My learning path" title="Learn, one small step at a time"
        intro={<>For your <strong>{goal.label.toLowerCase()}</strong> ({g.horizon} away): {g.stance}</>}/>
      <div className={panel}>
        <div className="flex items-center justify-between gap-3 text-[13px] font-semibold text-navy-strong">
          <span data-testid="learn-progress">{done.length} of {path.length} lessons done</span>
          <span className="text-ink-2">Lessons never change My Key</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-green-soft" role="progressbar" aria-label="Child learning progress"
          aria-valuemin={0} aria-valuemax={path.length} aria-valuenow={done.length}>
          <div className="h-full rounded-full bg-green-strong" style={{ width: `${100 * done.length / path.length}%` }}/>
        </div>
        {next ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[18px] border border-green/25 bg-green-soft p-3">
            <LessonThumb lesson={next}/>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">Up next for your {goal.label.toLowerCase()} · {next.minutes} min</p>
              <p className="text-[17px] font-bold text-navy-strong">{next.title}</p>
            </div>
            <Link href={`/try/learn/${next.id}`} className={primaryBtn} data-testid="learn-up-next">Start</Link>
          </div>
        ) : <p className="mt-4 rounded-[14px] bg-green-soft p-3 text-[13px] font-semibold text-green-strong">Path complete. Review any lesson, or go and explore.</p>}
      </div>
      <ol className="grid gap-3 md:grid-cols-2" aria-label="All Child lessons">
        {path.map((lesson, index) => (
          <li key={lesson.id}>
            <Link href={`/try/learn/${lesson.id}`} className="flex min-h-24 items-center gap-3 rounded-[18px] border border-line bg-surface p-3 hover:border-green">
              <LessonThumb lesson={lesson}/>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-green-strong">Lesson {index + 1} · {lesson.minutes} min</span>
                <span className="block text-[16px] font-bold leading-5 text-navy-strong">{lesson.title}</span>
                <span className="block text-[12px] text-ink-2">{done.includes(lesson.id) ? "Done · review" : "Not started"}</span>
              </span>
              {done.includes(lesson.id) ? <CheckCircle2 aria-label="Completed" className="size-6 shrink-0 text-green-strong"/> : null}
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-[13px] text-ink-2">A Parent has a separate path: <Link className="font-semibold text-green-strong underline underline-offset-4" href="/try/parent/learn">Parent lessons</Link>.</p>
      <ChapterNav back={{ href: "/try/goal", label: "My goal" }} next={{ href: "/try/explore", label: "Explore companies" }}/>
    </div>
  );
}

export function LessonReader({ id }: { id: string }) {
  const { story, dispatch } = useFamilyStory();
  const parent = isParentLesson(id);
  const lessons = parent ? PARENT_LEARNING : childPathFor(story.practice.goalId);
  const lesson = lessons.find(item => item.id === id);
  const [slide, setSlide] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  if (!lesson) return null;
  const goal = selectedPracticeGoal(story.practice);
  const done = (parent ? story.practice.parentCompleted : story.practice.childCompleted).includes(lesson.id);
  const concepts = lesson.sections?.length
    ? lesson.sections
    : [{ title: lesson.title, body: lesson.concept, illustration: lesson.illustration ?? "piggy", realityCheck: undefined, source: lesson.source }];
  const total = concepts.length + 1;
  const onQuiz = slide >= concepts.length;
  const current = concepts[Math.min(slide, concepts.length - 1)];
  const note = parent ? parentLessonNote(goal, lesson.id) : childLessonNote(goal, lesson.id);
  const index = lessons.findIndex(item => item.id === lesson.id);
  const following = lessons[index + 1];
  const hubHref = parent ? "/try/parent/learn" : "/try/learn";
  return (
    <div className="space-y-5">
      <header>
        <Link href={hubHref} className="inline-flex min-h-11 items-center text-[13px] font-bold text-green-strong underline underline-offset-4">All {parent ? "Parent" : "Child"} lessons</Link>
        <p className="cresco-section-kicker mt-1">{parent ? "Parent's lens" : "Child's lens"} · Lesson {index + 1} · {lesson.minutes} min</p>
        <h1 className="mt-1 font-display text-[clamp(28px,5vw,42px)] leading-[1.05] text-navy-strong">{lesson.title}</h1>
        <div className="mt-3 flex gap-1.5" role="progressbar" aria-label="Lesson steps" aria-valuemin={1} aria-valuemax={total} aria-valuenow={slide + 1}>
          {Array.from({ length: total }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= slide ? "bg-green-strong" : "bg-line"}`}/>)}
        </div>
        <p className="mt-1 text-[12px] text-ink-2">{onQuiz ? "Quick check" : `Idea ${slide + 1} of ${concepts.length}`}</p>
      </header>

      {!onQuiz ? (
        <article className={`${panel} overflow-hidden !p-0`} data-testid="lesson-slide">
          <LessonIllustration kind={current.illustration} title={`${current.title} illustration`} className="block h-auto max-h-[240px] w-full"/>
          <div className="p-5">
            <h2 className="text-[20px] font-bold text-navy-strong">{current.title}</h2>
            <p className="mt-2 text-[15px] leading-7 text-navy">{current.body}</p>
            {current.realityCheck ? <p className="mt-3 rounded-[14px] bg-blue-soft p-3 text-[13px] leading-6 text-navy"><strong>Reality check: </strong>{current.realityCheck}</p> : null}
            {slide === 0 ? <p data-testid="goal-note" className="mt-3 rounded-[14px] bg-yellow-soft p-3 text-[13px] leading-6 text-navy-strong"><strong>For your {goal.label.toLowerCase()}: </strong>{note}</p> : null}
            {current.source ? (
              <p className="mt-3 text-[12px] leading-6 text-ink-2">
                <strong>Educational reference: </strong>
                <a href={current.source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-strong underline underline-offset-4">
                  {current.source.organization}: {current.source.title}<ExternalLink aria-hidden className="ml-1 inline size-3"/>
                </a>
                <span> · Source checked {current.source.verifiedAt} · U.S. educational context, not legal or financial advice</span>
              </p>
            ) : <p className="mt-3 text-[12px] text-ink-3">Cresco practice explanation, not an external research citation.</p>}
          </div>
        </article>
      ) : (
        <article className={panel} data-testid="lesson-quiz">
          {lesson.quizPrompt ? <p className="mb-3 rounded-[14px] bg-yellow-soft p-3 text-[13px] leading-6 text-navy">{lesson.quizPrompt}</p> : null}
          <fieldset className="space-y-2">
            <legend className="mb-3 text-[17px] font-bold text-navy-strong">{lesson.question}</legend>
            {lesson.choices.map((choice, i) => (
              <button key={choice} type="button" aria-pressed={answer === i} onClick={() => setAnswer(i)}
                className={`block min-h-12 w-full rounded-[14px] border p-3 text-left text-[14px] font-semibold ${answer === i ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-ink-2"}`}>{choice}</button>
            ))}
          </fieldset>
          {answer !== null ? (
            <div className="mt-4">
              <ResultCard tone={answer === lesson.answer ? "good" : "wait"} testId="lesson-feedback"
                title={answer === lesson.answer ? "Correct." : "Not quite. Look at the ideas again and try another answer."}>
                {answer === lesson.answer ? lesson.explanation : null}
              </ResultCard>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={primaryBtn} disabled={answer !== lesson.answer || done}
              onClick={() => dispatch({ type: "practice", action: { type: "complete", role: parent ? "parent" : "child", lessonId: lesson.id } })}>
              {done ? "Lesson completed" : "Complete lesson"}
            </button>
          </div>
          {done ? (
            <div className="mt-4 flex flex-wrap gap-3" data-testid="lesson-done-next">
              {following ? <Link href={`/try/learn/${following.id}`} className={primaryBtn}>Next lesson: {following.title}</Link> : null}
              <Link href={parent ? "/try/parent" : "/try/explore"} className={following ? secondaryBtn : primaryBtn}>{parent ? "Back to the Parent" : "Explore companies"}</Link>
            </div>
          ) : null}
          <p className="mt-3 text-[12px] text-ink-3">Educational only. Finishing a lesson never changes the practice Key, an approval or access to anything real.</p>
        </article>
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="button" className={secondaryBtn} disabled={slide === 0} onClick={() => { setSlide(slide - 1); setAnswer(null); }}>Back</button>
        {!onQuiz ? <button type="button" className={primaryBtn} onClick={() => setSlide(slide + 1)}>{slide === concepts.length - 1 ? "Quick check" : "Next idea"}</button> : <span/>}
      </div>
    </div>
  );
}
