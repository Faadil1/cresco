"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, ExternalLink, Play } from "lucide-react";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { ChapterEmblem, ChapterLandscape, MountainScene, type ChapterScene } from "@/components/illustrations/adventure";
import { GoalJar } from "@/components/family-story-home";
import { useFamilyStory } from "@/components/family-story-provider";
import { LESSON_ACTIVITIES } from "@/lib/family-learning-depth";
import { EXTENDED_LESSON_ACTIVITIES } from "@/lib/family-learning-expansion";
import { FamilyLessonLab } from "@/components/family-lesson-lab";
import { InteractiveLessonBody } from "@/components/family-lesson-interactive";
import { LESSON_CHAPTERS, interactiveLessonFor } from "@/lib/family-lesson-interactions";
import { JourneyTrack, ResultCard, pageTitle, panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import {
  PARENT_LEARNING, selectedPracticeGoal,
} from "@/lib/family-public-practice";
import { GOAL_STORY, chapterStatus, childLessonNote, childPathFor, parentLessonNote } from "@/lib/family-story-state";

export { childPathFor } from "@/lib/family-story-state";
const isParentLesson = (id: string) => PARENT_LEARNING.some(item => item.id === id);

/** Horizontal position of each trail stop, as a fraction of the free width: a gentle S-curve. */
const TRAIL_X = [0.06, 0.48, 0.9, 0.7, 0.24, 0.56] as const;
const CHAPTER_SCENE: Record<string, ChapterScene> = { money: "meadow", companies: "town", risk: "peaks" };

/** One curved dashed segment between two stops (stretches with the row; stroke stays constant). */
function TrailSegment({ from, to }: { from: number; to: number }) {
  const lo = Math.min(from, to), span = Math.abs(from - to);
  const ltr = from <= to;
  const d = `M${ltr ? 0 : 100} 0 C${ltr ? 0 : 100} 55 ${ltr ? 100 : 0} 45 ${ltr ? 100 : 0} 100`;
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible" className="trail-seg pointer-events-none absolute top-[44px] h-[88px]"
      style={{ left: `calc(${lo} * (100% - var(--reserve)) + 30px)`, width: `max(1px, calc(${span} * (100% - var(--reserve))))` }}>
      <path d={d} fill="none" stroke="#0b3b2b" strokeOpacity=".08" strokeWidth="20" strokeLinecap="round" transform="translate(0 3)"/>
      <path d={d} fill="none" stroke="#e3c78d" strokeWidth="18" strokeLinecap="round"/>
      <path d={d} fill="none" stroke="#f8e8c2" strokeWidth="13" strokeLinecap="round"/>
      <path d={d} fill="none" stroke="#d6b672" strokeOpacity=".8" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round"/>
    </svg>
  );
}

export function LearnChapter() {
  const { story } = useFamilyStory();
  const goal = selectedPracticeGoal(story.practice);
  const g = GOAL_STORY[goal.id];
  const path = childPathFor(goal.id);
  const done = story.practice.childCompleted;
  const next = path.find(item => !done.includes(item.id));
  const chapters = LESSON_CHAPTERS.map(chapter => {
    const items = chapter.lessons.map(id => path.find(item => item.id === id)).filter((item): item is (typeof path)[number] => Boolean(item));
    return { ...chapter, items, done: items.filter(item => done.includes(item.id)).length, scene: CHAPTER_SCENE[chapter.id] ?? "meadow" };
  });
  const order = chapters.flatMap(chapter => chapter.items.map(item => item.id));
  return (
    <div className="space-y-5 pt-1 md:pt-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={pageTitle}>Learn</h1>
          <p className="mt-1 text-[15px] leading-6 text-ink-2">An adventure in three chapters for your <strong className="text-navy-strong">{goal.label.toLowerCase()}</strong>, {g.horizon} away. Every stop is open.</p>
        </div>
        <div className="flex min-w-[220px] items-center gap-3 rounded-full border border-line-soft bg-surface px-4 py-2 shadow-sm">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-green-soft" role="progressbar" aria-label="Child learning progress"
            aria-valuemin={0} aria-valuemax={path.length} aria-valuenow={done.length}>
            <div className="h-full rounded-full bg-green-strong" style={{ width: `${100 * done.length / path.length}%` }}/>
          </div>
          <span data-testid="learn-progress" className="shrink-0 text-[13px] font-extrabold text-navy-strong">{done.length} of {path.length} lessons done</span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
        {/* Companion column: up next first on phones, beside the trail on desktop. */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start" aria-label="Up next and your goal">
          {next ? (
            <section className="family-card overflow-hidden border border-family-action/15 max-lg:grid max-lg:grid-cols-[120px_1fr] sm:max-lg:grid-cols-[180px_1fr]" aria-labelledby="up-next-title" data-testid="learn-up-next-card">
              <div className="relative h-full min-h-[150px] overflow-hidden bg-[linear-gradient(170deg,#5936c7,#8a6ee6_70%,#c7b8f5)] lg:h-[150px]">
                <MountainScene className="absolute inset-0 h-full w-full"/>
              </div>
              <div className="p-4 lg:p-5">
                <p className="text-[12px] font-extrabold uppercase tracking-wider text-family-action">Up next · {next.minutes} min</p>
                <h2 id="up-next-title" className="mt-1 font-display text-[20px] leading-6 text-navy-strong">{next.title}</h2>
                <p className="mt-1 line-clamp-2 text-[14px] leading-5 text-ink-2">{next.concept}</p>
                <Link href={`/try/learn/${next.id}`} className={`mt-3 w-full ${primaryBtn} !min-h-11 !px-4`} data-testid="learn-up-next">
                  {done.length ? "Continue" : "Start"}<ArrowRight aria-hidden className="size-4"/>
                </Link>
              </div>
            </section>
          ) : (
            <p className="flex items-center gap-2 rounded-[20px] bg-green-soft p-4 text-[14px] font-semibold text-green-strong" data-testid="learn-complete">
              <CheckCircle2 aria-hidden className="size-5 shrink-0"/>Trail complete. Review any lesson, or go and meet someone in Explore.
            </p>
          )}
          <section className="family-card hidden border border-line-soft p-5 lg:block" aria-labelledby="learn-goal-title">
            <div className="flex items-center gap-3">
              <GoalJar saved={story.practice.saved} target={goal.target} label={story.goalChosen ? goal.label : "your dream"} className="h-[76px] w-[62px]"/>
              <div className="min-w-0">
                <h2 id="learn-goal-title" className="text-[15px] font-extrabold leading-5 text-navy-strong">Why these lessons?</h2>
                <p className="mt-1 text-[13px] leading-5 text-ink-2">Each one helps you plan your {goal.label.toLowerCase()}: budgets, prices, companies and risk.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {chapters.map((chapter, n) => (
                <li key={chapter.id} className="flex items-center gap-3">
                  <ChapterEmblem scene={chapter.scene} className="h-9 w-10 shrink-0"/>
                  <div className="min-w-0 flex-1">
                    <p className="flex justify-between gap-2 text-[13px] font-bold text-navy-strong"><span className="truncate">{n + 1}. {chapter.title}</span><span className="shrink-0 text-ink-2">{chapter.done}/{chapter.items.length}</span></p>
                    <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-green-strong" style={{ width: `${100 * chapter.done / Math.max(1, chapter.items.length)}%` }}/></div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* The trail: an ordered list of real links on illustrated chapter landscapes. */}
        <section aria-labelledby="path-title" data-testid="learn-chapters" className="min-w-0 space-y-5 lg:col-start-1 lg:row-start-1">
          <h2 id="path-title" className="sr-only">Your learning trail</h2>
          {chapters.map((chapter, n) => (
            <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`} data-testid={`learn-chapter-${chapter.id}`}
              className="relative isolate overflow-hidden rounded-[28px] border border-line-soft shadow-[var(--cresco-shadow-card)]">
              <ChapterLandscape scene={chapter.scene} className="absolute inset-0 -z-10 h-full w-full"/>
              <header className="relative mx-3 mt-3 flex items-center gap-3 rounded-[20px] border-[3px] border-[#c99a62] bg-[linear-gradient(180deg,#fffaf0,#fbefd3)] p-3 shadow-[0_4px_0_#a8744a,0_14px_24px_-14px_rgba(16,45,54,.55)] sm:mx-5 sm:mt-5 sm:max-w-[460px] sm:p-4">
                <span aria-hidden className="absolute -bottom-[22px] left-8 z-[-1] h-6 w-3 rounded-b bg-[#8a5a35]"/>
                <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-[16px] bg-[radial-gradient(circle_at_50%_40%,#ffffff,#eaf7ef)] ring-2 ring-[#ecd9ad]"><ChapterEmblem scene={chapter.scene} className="h-12 w-14"/></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-extrabold uppercase tracking-wider text-orange-text">Chapter {n + 1}</p>
                  <h3 id={`chapter-${chapter.id}`} className="font-display text-[19px] leading-6 text-navy-strong">{chapter.title}</h3>
                  <p className="text-[13px] leading-5 text-ink-2">{chapter.blurb}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-green-soft px-2.5 py-0.5 text-[12px] font-extrabold text-green-strong" data-testid={`learn-chapter-${chapter.id}-done`}>{chapter.done} of {chapter.items.length} done</span>
                </div>
              </header>
              <ol aria-label={`${chapter.title} lessons`} className="relative px-3 pb-5 pt-4 [--reserve:236px] sm:px-6 sm:[--reserve:330px]">
                {chapter.items.map((lesson, i) => {
                  const isDone = done.includes(lesson.id);
                  const isNext = lesson.id === next?.id;
                  const x = TRAIL_X[i % TRAIL_X.length];
                  const stop = order.indexOf(lesson.id) + 1;
                  return (
                    <li key={lesson.id} className="relative h-[88px]">
                      {i < chapter.items.length - 1 ? <TrailSegment from={x} to={TRAIL_X[(i + 1) % TRAIL_X.length]}/> : null}
                      <div className="absolute inset-y-0" style={{ left: `calc(${x} * (100% - var(--reserve)))` }}>
                        <Link href={`/try/learn/${lesson.id}`} aria-current={isNext ? "step" : undefined} data-testid={`learn-lesson-${lesson.id}`}
                          className="group flex h-full items-center gap-2.5 rounded-[20px] focus-visible:outline-offset-2">
                          <span aria-hidden className={`relative grid size-[60px] shrink-0 place-items-center rounded-full border-[5px] border-white text-[19px] font-black shadow-[0_3px_0_rgba(16,45,54,.18),0_10px_20px_-10px_rgba(16,45,54,.7)] transition-transform group-hover:-translate-y-0.5 group-hover:scale-105 motion-reduce:transition-none before:absolute before:inset-x-2 before:top-1 before:h-1/3 before:rounded-full before:bg-white/25 ${isDone ? "bg-[radial-gradient(circle_at_35%_30%,#34b27a,#147b56_70%)] text-white" : isNext ? "anim-glow bg-[radial-gradient(circle_at_35%_30%,#8a6ee6,#5936c7_70%)] text-white" : "bg-[radial-gradient(circle_at_35%_30%,#ffffff,#f3ead6_80%)] text-navy-strong"}`}>
                            {isDone ? <Check className="size-7" strokeWidth={3.2}/> : isNext ? <Play className="ml-0.5 size-6 fill-white"/> : stop}
                          </span>
                          <span className={`block w-max max-w-[calc(var(--reserve)-72px)] rounded-[16px] px-3 py-1.5 shadow-[0_2px_0_rgba(16,45,54,.08),0_8px_18px_-10px_rgba(16,45,54,.55)] ring-1 ${isNext ? "bg-family-action text-white ring-white/30" : "bg-surface/95 text-navy-strong ring-black/5 group-hover:bg-surface"}`}>
                            <span className="block text-[15px] font-extrabold leading-5">{lesson.title}</span>
                            <span className={`block text-[12px] font-semibold leading-4 ${isNext ? "text-white/90" : "text-ink-2"}`}>{isNext ? "Up next · " : ""}{lesson.minutes} min{isDone ? " · Done, review" : ""}</span>
                          </span>
                          {isDone ? <span className="sr-only">Completed</span> : null}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </section>
      </div>
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
  const activity = LESSON_ACTIVITIES[lesson.id] ?? EXTENDED_LESSON_ACTIVITIES[lesson.id];
  const needsAppliedReasoning = !done && Boolean(activity) && slide === Math.min(1, concepts.length - 1) && applied === null;
  const index = lessons.findIndex(item => item.id === lesson.id);
  const following = lessons.slice(index + 1).find(item => !(parent ? story.practice.parentCompleted : story.practice.childCompleted).includes(item.id)) ?? lessons[index + 1];
  const correct = answer === lesson.answer;
  const complete = () => dispatch({ type: "practice", action: { type: "complete", role: parent ? "parent" : "child", lessonId: lesson.id } });
  // Interactive lessons (issues #130, #132): activities then a check, same completion action.
  const interactive = parent ? null : interactiveLessonFor(lesson.id, { label: goal.label, target: goal.target, saved: story.practice.saved });
  const doneView = (
          <article className={`${panel} text-center`} data-testid="lesson-done">
            <CheckCircle2 aria-hidden className="mx-auto size-12 text-green-strong"/>
            <h2 className="anim-pop mt-2 text-[22px] font-extrabold text-navy-strong" role="status">Lesson complete</h2>
            {interactive?.objective ? <p className="mx-auto mt-2 max-w-[44ch] rounded-[14px] bg-green-soft px-3 py-2 text-[15px] font-semibold leading-6 text-green-strong" data-testid="lesson-objective"><span className="font-extrabold">You can now: </span>{interactive.objective.charAt(0).toLowerCase() + interactive.objective.slice(1)}</p> : null}
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
            {!parent ? (
              <div className="mx-auto mt-5 max-w-[460px] rounded-[16px] bg-surface-soft p-3 text-left" data-testid="lesson-loop">
                <p className="mb-1 text-[13px] font-bold text-navy-strong">Your learning loop</p>
                <JourneyTrack status={chapterStatus(story)} testId="lesson-loop-track"/>
              </div>
            ) : null}
            <p className="mt-3 text-[13px] text-ink-2">Finishing a lesson never changes the practice Key, an approval or access to anything real.</p>
          </article>
  );
  if (interactive) {
    return (
      <div className="flex min-h-[calc(100dvh-170px)] flex-col">
        <header className="mb-3">
          <p className="cresco-section-kicker">Lesson {index + 1} · {lesson.minutes} min · Interactive</p>
          <h1 className="mt-1 font-display text-[clamp(24px,4.4vw,34px)] leading-[1.12] text-navy-strong">{lesson.title}</h1>
        </header>
        <InteractiveLessonBody lesson={lesson} interactive={interactive} goal={{ label: goal.label, target: goal.target, saved: story.practice.saved }}
          done={done} onComplete={complete} doneView={doneView} note={note}/>
      </div>
    );
  }
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-170px)] w-full max-w-[720px] flex-col">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" role="progressbar" aria-label="Lesson steps" aria-valuemin={1} aria-valuemax={total} aria-valuenow={slide + 1}>
            {Array.from({ length: total }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i <= slide ? "bg-green-strong" : "bg-line"}`}/>)}
          </div>
          <span className="shrink-0 text-[12px] font-bold text-navy-strong">{onQuiz ? "Quick check" : `${slide + 1} of ${concepts.length}`}</span>
        </div>
        <p className="cresco-section-kicker mt-4">{parent ? "Parent lesson" : "Lesson"} {index + 1} · {lesson.minutes} min</p>
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
              {slide === Math.min(1, concepts.length - 1) && activity ? (
                <section className="mt-5 rounded-[18px] border border-family-action/25 bg-family-action-soft/40 p-4" data-testid="lesson-applied-exercise"
                  aria-label="Try it with a situation">
                  <p className="text-[12px] font-extrabold uppercase tracking-wider text-family-action">Try it · a real reasoning exercise</p>
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
                      <p className="mt-1 text-[12px] leading-5 text-ink-3">This is reflection, not a purchase or permission. You can try the other answer.</p>
                      <p className="mt-1 text-[12px] leading-5 text-ink-3">You can continue without choosing the best answer. Understanding the consequence matters more than guessing right.</p>
                    </div>
                  ) : <p className="mt-3 text-[12px] font-semibold text-family-action" data-testid="applied-try-first">Choose an answer to see its consequence before continuing.</p>}
                </section>
              ) : null}
              {slide === concepts.length - 1 ? <FamilyLessonLab lessonId={lesson.id} target={goal.target} saved={story.practice.saved}/> : null}
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
          doneView
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
            ? <button type="button" className={`flex-1 ${primaryBtn}`} disabled={needsAppliedReasoning} onClick={() => setSlide(slide + 1)}>{slide === concepts.length - 1 ? "Quick check" : "Next idea"}</button>
            : <button type="button" className={`flex-1 ${primaryBtn}`} disabled={!correct} onClick={complete}>Complete lesson</button>}
        </div>
      ) : null}
    </div>
  );
}
