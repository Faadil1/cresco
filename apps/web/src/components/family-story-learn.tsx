"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, ExternalLink, PlayCircle } from "lucide-react";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { useFamilyStory } from "@/components/family-story-provider";
import { LESSON_ACTIVITIES } from "@/lib/family-learning-depth";
import { ResultCard, panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import {
  PARENT_LEARNING, selectedPracticeGoal,
} from "@/lib/family-public-practice";
import { GOAL_STORY, childLessonNote, childPathFor, parentLessonNote } from "@/lib/family-story-state";

export { childPathFor } from "@/lib/family-story-state";
const isParentLesson = (id: string) => PARENT_LEARNING.some(item => item.id === id);

export function LearnChapter() {
  const { story } = useFamilyStory();
  const goal = selectedPracticeGoal(story.practice);
  const g = GOAL_STORY[goal.id];
  const path = childPathFor(goal.id);
  const done = story.practice.childCompleted;
  const next = path.find(item => !done.includes(item.id));
  return (
    <div className="space-y-4 md:space-y-5">
      <header>
        <h1 className="font-display text-[26px] leading-tight text-navy-strong md:text-[32px]">Learn</h1>
        <p className="text-[13px] text-ink-2">Short lessons for your <strong className="text-navy-strong">{goal.label.toLowerCase()}</strong>, {g.horizon} away.</p>
      </header>
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-green-soft" role="progressbar" aria-label="Child learning progress"
          aria-valuemin={0} aria-valuemax={path.length} aria-valuenow={done.length}>
          <div className="h-full rounded-full bg-green-strong" style={{ width: `${100 * done.length / path.length}%` }}/>
        </div>
        <span data-testid="learn-progress" className="shrink-0 text-[13px] font-semibold text-navy-strong">{done.length} of {path.length} lessons done</span>
      </div>
      {next ? (
        <section className="overflow-hidden rounded-[24px] border border-line-soft bg-surface shadow-sm md:grid md:grid-cols-[280px_1fr]" aria-labelledby="up-next-title" data-testid="learn-up-next-card">
          {next.illustration ? <LessonIllustration kind={next.illustration} title={`${next.title} illustration`} className="block h-[150px] w-full md:h-full"/> : null}
          <div className="p-4 md:p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">Up next · {next.minutes} min</p>
            <h2 id="up-next-title" className="mt-1 text-[21px] font-extrabold leading-7 text-navy-strong">{next.title}</h2>
            <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-2">{next.concept}</p>
            <Link href={`/try/learn/${next.id}`} className={`mt-3 w-full sm:w-auto ${primaryBtn}`} data-testid="learn-up-next">
              {done.length ? "Continue" : "Start"}<ArrowRight aria-hidden className="size-4"/>
            </Link>
          </div>
        </section>
      ) : (
        <p className="flex items-center gap-2 rounded-[18px] bg-green-soft p-4 text-[14px] font-semibold text-green-strong" data-testid="learn-complete">
          <CheckCircle2 aria-hidden className="size-5"/>Path complete. Review any lesson below, or go and meet someone in Explore.
        </p>
      )}
      <section aria-labelledby="path-title">
        <h2 id="path-title" className="text-[17px] font-extrabold text-navy-strong">Your path</h2>
        <ol className="mt-2 divide-y divide-line-soft rounded-[20px] border border-line-soft bg-surface" aria-label="All Child lessons">
          {path.map((lesson, index) => {
            const isDone = done.includes(lesson.id);
            const isNext = lesson.id === next?.id;
            return (
              <li key={lesson.id}>
                <Link href={`/try/learn/${lesson.id}`} aria-current={isNext ? "step" : undefined}
                  className={`flex min-h-16 items-center gap-3 px-3 py-2 hover:bg-surface-soft ${isNext ? "bg-family-action-soft/60" : ""}`}>
                  <span aria-hidden className={`grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold ${isDone ? "bg-green-strong text-white" : isNext ? "bg-family-action text-white" : "bg-surface-soft text-ink-2"}`}>
                    {isDone ? <CheckCircle2 className="size-5"/> : isNext ? <PlayCircle className="size-5"/> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold leading-5 text-navy-strong">{lesson.title}</span>
                    <span className="block text-[12px] text-ink-2">{lesson.minutes} min · {isDone ? "Done · review" : isNext ? "Up next" : "Not started"}</span>
                  </span>
                  {isDone ? <span className="sr-only">Completed</span> : null}
                  <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-3"/>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
      <p className="text-[13px] text-ink-2">Lessons never change My Key. A Parent has a separate path: <Link className="font-semibold text-family-action underline underline-offset-4" href="/try/parent/learn">Parent lessons</Link>.</p>
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
  const [applied, setApplied] = useState<number | null>(null);
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
  const activity = LESSON_ACTIVITIES[lesson.id];
  const index = lessons.findIndex(item => item.id === lesson.id);
  const following = lessons.slice(index + 1).find(item => !(parent ? story.practice.parentCompleted : story.practice.childCompleted).includes(item.id)) ?? lessons[index + 1];
  const correct = answer === lesson.answer;
  const complete = () => dispatch({ type: "practice", action: { type: "complete", role: parent ? "parent" : "child", lessonId: lesson.id } });
  return (
    <div className="flex min-h-[calc(100dvh-170px)] flex-col">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" role="progressbar" aria-label="Lesson steps" aria-valuemin={1} aria-valuemax={total} aria-valuenow={slide + 1}>
            {Array.from({ length: total }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i <= slide ? "bg-green-strong" : "bg-line"}`}/>)}
          </div>
          <span className="shrink-0 text-[12px] font-bold text-navy-strong">{onQuiz ? "Quick check" : `${slide + 1} of ${concepts.length}`}</span>
        </div>
        <p className="cresco-section-kicker mt-4">{parent ? "Parent's lens" : "Child's lens"} · Lesson {index + 1} · {lesson.minutes} min</p>
        <h1 className="mt-1 font-display text-[clamp(24px,4.4vw,34px)] leading-[1.12] text-navy-strong">{lesson.title}</h1>
      </header>

      <div className="mt-4 flex-1">
        {!onQuiz ? (
          <article className={`${panel} overflow-hidden !p-0`} data-testid="lesson-slide">
            <LessonIllustration kind={current.illustration} title={`${current.title} illustration`} className="block h-auto max-h-[220px] w-full"/>
            <div className="p-5">
              <h2 className="text-[19px] font-extrabold text-navy-strong">{current.title}</h2>
              <p className="mt-2 text-[15px] leading-7 text-navy">{current.body}</p>
              {current.realityCheck ? <p className="mt-3 rounded-[14px] bg-blue-soft p-3 text-[13px] leading-6 text-navy"><strong>Reality check: </strong>{current.realityCheck}</p> : null}
              {slide === 1 && activity ? (
                <section className="mt-5 rounded-[18px] border border-family-action/25 bg-family-action-soft/40 p-4" data-testid="lesson-applied-exercise"
                  aria-label="Try it with a situation">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-family-action">Try it · a real reasoning exercise</p>
                  <p className="mt-2 text-[14px] leading-6 text-navy-strong">{activity.situation}</p>
                  <h3 className="mt-3 text-[16px] font-bold text-navy-strong">{activity.question}</h3>
                  <div className="mt-3 grid gap-2" role="group" aria-label="Apply this lesson">
                    {activity.options.map((option, i) => (
                      <button type="button" key={option} aria-pressed={applied === i}
                        onClick={() => setApplied(i)}
                        className={`min-h-12 rounded-[14px] border bg-surface p-3 text-left text-[13px] font-semibold leading-5 text-navy-strong ${applied === i ? "border-family-action" : "border-line"}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                  {applied !== null ? (
                    <div className="mt-3 rounded-[14px] bg-surface p-3" data-testid="applied-feedback" role="status">
                      <p className="text-[13px] leading-6 text-navy-strong">{activity.outcomes[applied]}</p>
                      <p className="mt-2 text-[13px] font-semibold leading-6 text-green-strong">{activity.insight}</p>
                      <p className="mt-1 text-[11px] leading-5 text-ink-3">This is reflection, not a purchase or permission. You can try the other answer.</p>
                    </div>
                  ) : null}
                </section>
              ) : null}
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
        ) : done ? (
          <article className={`${panel} text-center`} data-testid="lesson-done">
            <CheckCircle2 aria-hidden className="mx-auto size-12 text-green-strong"/>
            <h2 className="mt-2 text-[22px] font-extrabold text-navy-strong" role="status">Lesson complete</h2>
            <p className="mx-auto mt-1 max-w-[42ch] text-[14px] leading-6 text-ink-2">{lesson.explanation}</p>
            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center" data-testid="lesson-done-next">
              {parent ? (
                <>
                  <Link href="/try/parent" className={primaryBtn}>Back to the Parent</Link>
                  {following ? <Link href={`/try/learn/${following.id}`} className={secondaryBtn}>Next lesson: {following.title}</Link> : null}
                </>
              ) : (
                <>
                  <Link href="/try/home" className={primaryBtn} data-testid="lesson-back-home">Back to Home<ArrowRight aria-hidden className="size-4"/></Link>
                  {following ? <Link href={`/try/learn/${following.id}`} className={secondaryBtn}>Next lesson: {following.title}</Link> : null}
                  <Link href="/try/explore" className={secondaryBtn}>Explore companies</Link>
                </>
              )}
            </div>
            <p className="mt-3 text-[12px] text-ink-3">Finishing a lesson never changes the practice Key, an approval or access to anything real.</p>
          </article>
        ) : (
          <article className={panel} data-testid="lesson-quiz">
            {lesson.quizPrompt ? <p className="mb-3 rounded-[14px] bg-yellow-soft p-3 text-[13px] leading-6 text-navy">{lesson.quizPrompt}</p> : null}
            <fieldset className="space-y-2">
              <legend className="mb-3 text-[17px] font-bold text-navy-strong">{lesson.question}</legend>
              {lesson.choices.map((choice, i) => (
                <button key={choice} type="button" aria-pressed={answer === i} onClick={() => setAnswer(i)}
                  className={`block min-h-12 w-full rounded-[14px] border p-3 text-left text-[14px] font-semibold ${answer === i ? "border-family-action bg-family-action-soft text-navy-strong" : "border-line bg-surface text-ink-2"}`}>{choice}</button>
              ))}
            </fieldset>
            {answer !== null ? (
              <div className="mt-4">
                <ResultCard tone={correct ? "good" : "wait"} testId="lesson-feedback"
                  title={correct ? "Correct." : "Not quite. Look at the ideas again and try another answer."}>
                  {correct ? lesson.explanation : null}
                </ResultCard>
              </div>
            ) : null}
          </article>
        )}
      </div>

      {!(onQuiz && done) ? (
        <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex items-center gap-3 bg-gradient-to-t from-bg via-bg to-bg/0 px-4 pb-3 pt-4">
          <button type="button" className={`${secondaryBtn} !px-4`} disabled={slide === 0} onClick={() => { setSlide(slide - 1); setAnswer(null); }}>Back</button>
          {!onQuiz
            ? <button type="button" className={`flex-1 ${primaryBtn}`} onClick={() => setSlide(slide + 1)}>{slide === concepts.length - 1 ? "Quick check" : "Next idea"}</button>
            : <button type="button" className={`flex-1 ${primaryBtn}`} disabled={!correct} onClick={complete}>Complete lesson</button>}
        </div>
      ) : null}
    </div>
  );
}
