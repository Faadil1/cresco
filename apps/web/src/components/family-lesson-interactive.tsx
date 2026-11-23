"use client";

/**
 * Presentation primitives for interactive lessons (issue #130, P1):
 * DecideBeatView, LabBeatView and CheckBeatView, run in order by
 * InteractiveLessonBody. Moving on needs a real interaction (a pick, a lab goal
 * met, a correct answer); retries are free and never penalised. The only state
 * change is the existing "complete lesson" practice action, fired once, after
 * a correct check. No credits, Key or approval are touched.
 */
import { useState, type ReactNode } from "react";
import { CheckCircle2, Lightbulb, RotateCcw } from "lucide-react";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { ResultCard, panel, primaryBtn, secondaryBtn } from "@/components/family-story-ui";
import type { LearningModule } from "@/lib/family-public-practice";
import {
  beatComplete, labGoalMessage, labResult,
  type Beat, type CheckBeat, type DecideBeat, type InteractiveLesson, type LabBeat, type LessonGoal,
} from "@/lib/family-lesson-interactions";

const toneRing = { good: "border-green-strong bg-green-soft", careful: "border-orange/50 bg-yellow-soft", risky: "border-loss/40 bg-loss-soft" } as const;

export function DecideBeatView({ beat, picked, onPick }: { beat: DecideBeat; picked: string | null; onPick: (id: string) => void }) {
  const choice = beat.options.find(option => option.id === picked);
  return (
    <section data-testid="beat-decide" aria-labelledby={`${beat.id}-q`} className="space-y-3">
      <p className="text-[15px] leading-6 text-navy">{beat.situation}</p>
      <h2 id={`${beat.id}-q`} className="text-[18px] font-extrabold leading-6 text-navy-strong">{beat.question}</h2>
      <div role="group" aria-label={beat.question} className="grid gap-2">
        {beat.options.map(option => (
          <button key={option.id} type="button" aria-pressed={picked === option.id} onClick={() => onPick(option.id)}
            className={`min-h-12 rounded-[14px] border px-4 py-3 text-left text-[15px] font-bold leading-5 text-navy-strong ${picked === option.id ? toneRing[option.tone] : "border-line bg-surface hover:border-family-action/40"}`}>
            {option.label}
          </button>
        ))}
      </div>
      {choice ? (
        <div role="status" data-testid="decision-consequence" data-tone={choice.tone} className={`rounded-[16px] border p-4 ${toneRing[choice.tone]}`}>
          <p className="text-[15px] font-bold leading-6 text-navy-strong">What happens next</p>
          <p className="mt-1 text-[15px] leading-6 text-navy">{choice.consequence}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            {choice.numbers.map(n => (
              <div key={n.label} className="rounded-[12px] bg-surface px-3 py-2">
                <dt className="text-[13px] text-ink-2">{n.label}</dt>
                <dd className="text-[18px] font-extrabold text-navy-strong">{n.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-start gap-2 text-[14px] font-semibold leading-6 text-green-strong"><Lightbulb aria-hidden className="mt-1 size-4 shrink-0"/>{beat.insight}</p>
          <p className="mt-1 text-[13px] text-ink-2">Curious? Try another answer. There is no penalty.</p>
        </div>
      ) : <p className="text-[13px] font-semibold text-family-action">Pick one to see what would happen.</p>}
    </section>
  );
}

export function LabBeatView({ beat, goal, value, onChange }: { beat: LabBeat; goal: LessonGoal; value: number; onChange: (v: number) => void }) {
  const result = labResult(beat, goal, value);
  const label = beat.lab === "savings" ? "Practice periods" : "Hypothetical price drop";
  const shown = beat.lab === "savings" ? `${value}` : `${value}%`;
  return (
    <section data-testid="beat-lab" data-lab={beat.lab} aria-labelledby={`${beat.id}-t`} className="space-y-3">
      <h2 id={`${beat.id}-t`} className="text-[18px] font-extrabold leading-6 text-navy-strong">{beat.title}</h2>
      <p className="text-[15px] leading-6 text-navy">{beat.prompt}</p>
      <div className="rounded-[16px] border border-green/30 bg-green-soft p-4">
        <label htmlFor={`${beat.id}-range`} className="flex justify-between gap-2 text-[15px] font-bold text-navy-strong">{label}<span>{shown}</span></label>
        <input id={`${beat.id}-range`} aria-label={label} type="range" min={beat.min} max={beat.max} step={beat.step}
          value={value} onChange={event => onChange(Number(event.target.value))} className="mt-2 w-full accent-green-strong"/>
        <output data-testid={beat.lab === "savings" ? "lab-savings-result" : "lab-risk-result"} className="mt-3 block rounded-[12px] bg-surface p-3 text-[16px] font-bold text-navy-strong">{result.text}</output>
      </div>
      {result.met
        ? <p role="status" data-testid="lab-goal-met" className="flex items-start gap-2 rounded-[14px] bg-green-soft p-3 text-[15px] font-semibold leading-6 text-green-strong"><CheckCircle2 aria-hidden className="mt-1 size-4 shrink-0"/>{labGoalMessage(beat, goal)}</p>
        : <p className="text-[13px] font-semibold text-family-action">Move the slider until the goal is met.</p>}
      <p className="text-[13px] text-ink-2">An invented classroom example. It spends nothing and changes no balance.</p>
    </section>
  );
}

export function CheckBeatView({ beat, lesson, answer, onAnswer }: { beat: CheckBeat; lesson: LearningModule; answer: number | null; onAnswer: (i: number) => void }) {
  const correct = answer === lesson.answer;
  return (
    <section data-testid="lesson-quiz" aria-label="Quick check" className="space-y-3">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-[18px] font-extrabold text-navy-strong">{lesson.question}</legend>
        {lesson.choices.map((choice, i) => (
          <button key={choice} type="button" aria-pressed={answer === i} onClick={() => onAnswer(i)}
            className={`block min-h-12 w-full rounded-[14px] border p-3 text-left text-[15px] font-semibold ${answer === i ? (correct ? "border-green-strong bg-green-soft" : "border-orange/50 bg-yellow-soft") : "border-line bg-surface"} text-navy-strong`}>{choice}</button>
        ))}
      </fieldset>
      {answer !== null ? (
        <ResultCard tone={correct ? "good" : "wait"} testId="lesson-feedback" title={correct ? "Correct." : "Not quite. Here is a hint, try again."}>
          {correct ? lesson.explanation : <span className="inline-flex items-start gap-2"><RotateCcw aria-hidden className="mt-1 size-4 shrink-0"/>{beat.hints[answer] || "Look back at what happened in the first two steps."}</span>}
        </ResultCard>
      ) : null}
    </section>
  );
}

/** Runs an interactive lesson. Calls onComplete once, only after a correct check. */
export function InteractiveLessonBody({ lesson, interactive, goal, done, onComplete, doneView }: {
  lesson: LearningModule; interactive: InteractiveLesson; goal: LessonGoal; done: boolean;
  onComplete: () => void; doneView: ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Record<string, string | null>>({});
  const [labs, setLabs] = useState<Record<string, number>>({});
  const [answer, setAnswer] = useState<number | null>(null);
  const beats = interactive.beats;
  const beat: Beat = beats[Math.min(step, beats.length - 1)];
  const labValue = beat.kind === "lab" ? labs[beat.id] ?? beat.start : undefined;
  const complete = beatComplete(beat, { picked: picked[beat.id], labValue, correct: answer === lesson.answer }, goal);
  const isCheck = beat.kind === "check";
  if (done && isCheck) return <>{doneView}</>;
  return (
    <div className="flex flex-1 flex-col" data-testid="lesson-interactive">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" role="progressbar" aria-label="Lesson steps" aria-valuemin={1} aria-valuemax={beats.length} aria-valuenow={step + 1}>
          {beats.map((b, i) => <span key={b.id} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-green-strong" : "bg-line"}`}/>)}
        </div>
        <span className="shrink-0 text-[13px] font-bold text-navy-strong">{isCheck ? "Quick check" : `${step + 1} of ${beats.length - 1}`}</span>
      </div>
      {step === 0 ? <p className="mt-3 text-[14px] leading-6 text-ink-2">{interactive.intro}</p> : null}
      <article className={`${panel} mt-3 flex-1 overflow-hidden !p-0`}>
        {beat.kind === "decide" ? <LessonIllustration kind={lesson.illustration ?? "piggy"} title={`${lesson.title} illustration`} className="block h-auto max-h-[160px] w-full"/> : null}
        <div className="p-4 md:p-6">
          {beat.kind === "decide" ? <DecideBeatView beat={beat} picked={picked[beat.id] ?? null} onPick={id => setPicked(p => ({ ...p, [beat.id]: id }))}/> : null}
          {beat.kind === "lab" ? <LabBeatView beat={beat} goal={goal} value={labValue ?? beat.start} onChange={v => setLabs(l => ({ ...l, [beat.id]: v }))}/> : null}
          {beat.kind === "check" ? <CheckBeatView beat={beat} lesson={lesson} answer={answer} onAnswer={setAnswer}/> : null}
        </div>
      </article>
      {lesson.sections?.length ? (
        <details className="mt-3 rounded-[16px] border border-line-soft bg-surface px-4 py-1" data-testid="lesson-read-more">
          <summary className="flex min-h-11 cursor-pointer items-center text-[14px] font-bold text-navy-strong">Read the full lesson ({lesson.sections.length} short ideas)</summary>
          <div className="space-y-3 pb-3">
            {lesson.sections.map(section => (
              <div key={section.title}>
                <h3 className="text-[15px] font-bold text-navy-strong">{section.title}</h3>
                <p className="text-[14px] leading-6 text-navy">{section.body}</p>
                {section.realityCheck ? <p className="mt-1 text-[13px] leading-5 text-ink-2"><strong>Reality check: </strong>{section.realityCheck}</p> : null}
              </div>
            ))}
          </div>
        </details>
      ) : null}
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex items-center gap-3 bg-gradient-to-t from-bg via-bg to-bg/0 px-4 pb-3 pt-4">
        <button type="button" className={`${secondaryBtn} !px-4`} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        {isCheck
          ? <button type="button" className={`flex-1 ${primaryBtn}`} disabled={!complete} onClick={onComplete}>Complete lesson</button>
          : <button type="button" className={`flex-1 ${primaryBtn}`} disabled={!complete} onClick={() => setStep(step + 1)}>{beats[step + 1]?.kind === "check" ? "Quick check" : "Next idea"}</button>}
      </div>
    </div>
  );
}
