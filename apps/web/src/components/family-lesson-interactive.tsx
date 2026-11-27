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
  allocationProblems, beatComplete, labGoalMessage, labResult,
  type AllocateBeat, type Beat, type CheckBeat, type DecideBeat, type InteractiveLesson, type LabBeat, type LessonGoal, type SortBeat,
} from "@/lib/family-lesson-interactions";

const toneRing = { good: "border-green-strong bg-green-soft", careful: "border-orange/50 bg-yellow-soft", risky: "border-loss/40 bg-loss-soft" } as const;

export function DecideBeatView({ beat, picked, onPick }: { beat: DecideBeat; picked: string | null; onPick: (id: string) => void }) {
  const choice = beat.options.find(option => option.id === picked);
  return (
    <section data-testid="beat-decide" aria-labelledby={`${beat.id}-q`} className="space-y-3">
      <p className="text-[15px] leading-6 text-navy">{beat.situation}</p>
      {beat.chart ? <InventedChart label={beat.chart.label} points={beat.chart.points}/> : null}
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
  const label = { savings: "Practice periods", drop: "Hypothetical price drop", fees: "Yearly fee", profit: "Total costs", grocery: "Delivery cost" }[beat.lab];
  const shown = beat.lab === "savings" ? `${value}` : beat.lab === "drop" ? `${value}%` : `${value} credits`;
  return (
    <section data-testid="beat-lab" data-lab={beat.lab} aria-labelledby={`${beat.id}-t`} className="space-y-3">
      <h2 id={`${beat.id}-t`} className="text-[18px] font-extrabold leading-6 text-navy-strong">{beat.title}</h2>
      <p className="text-[15px] leading-6 text-navy">{beat.prompt}</p>
      <div className="rounded-[16px] border border-green/30 bg-green-soft p-4">
        <label htmlFor={`${beat.id}-range`} className="flex justify-between gap-2 text-[15px] font-bold text-navy-strong">{label}<span>{shown}</span></label>
        <input id={`${beat.id}-range`} aria-label={label} type="range" min={beat.min} max={beat.max} step={beat.step}
          value={value} onChange={event => onChange(Number(event.target.value))} className="mt-2 w-full accent-green-strong"/>
        <output data-testid={`lab-${beat.lab === "drop" ? "risk" : beat.lab}-result`} className="mt-3 block rounded-[12px] bg-surface p-3 text-[16px] font-bold text-navy-strong">{result.text}</output>
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
      {lesson.quizPrompt ? <p className="rounded-[14px] bg-yellow-soft p-3 text-[14px] leading-6 text-navy">{lesson.quizPrompt}</p> : null}
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

/** A small invented price line for decide beats. Illustrative only; labelled as such. */
function InventedChart({ label, points }: { label: string; points: number[] }) {
  const min = Math.min(...points), max = Math.max(...points), w = 300, h = 90;
  const x = (i: number) => 8 + i * (w - 16) / (points.length - 1);
  const y = (v: number) => 8 + (max - v) * (h - 16) / Math.max(1, max - min);
  const path = points.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = points[points.length - 1], prev = points[points.length - 2];
  return (
    <figure className="rounded-[14px] border border-line-soft bg-surface-soft p-3" data-testid="beat-chart">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${label}. Ends ${last < prev ? "lower" : "higher"} than the day before.`} className="h-[90px] w-full">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={last < prev ? "text-loss" : "text-green-strong"}/>
        <circle cx={x(points.length - 1)} cy={y(last)} r="4.5" className={last < prev ? "fill-loss" : "fill-green-strong"}/>
      </svg>
      <figcaption className="text-[12px] text-ink-2">{label}</figcaption>
    </figure>
  );
}

export function SortBeatView({ beat, sorted, onSort }: { beat: SortBeat; sorted: Record<string, string>; onSort: (item: string, bucket: string) => void }) {
  const done = beat.items.filter(item => sorted[item.id] === item.bucket).length;
  return (
    <section data-testid="beat-sort" aria-labelledby={`${beat.id}-t`} className="space-y-3">
      <h2 id={`${beat.id}-t`} className="text-[18px] font-extrabold leading-6 text-navy-strong">{beat.title}</h2>
      <p className="text-[15px] leading-6 text-navy">{beat.prompt}</p>
      <ul className="space-y-2">
        {beat.items.map(item => {
          const choice = sorted[item.id];
          const right = choice === item.bucket;
          return (
            <li key={item.id} data-testid={`sort-item-${item.id}`} data-state={!choice ? "open" : right ? "right" : "wrong"}
              className={`rounded-[14px] border p-3 transition-colors motion-reduce:transition-none ${!choice ? "border-line bg-surface" : right ? "border-green/50 bg-green-soft" : "border-orange/50 bg-yellow-soft"}`}>
              <p className="text-[15px] font-bold leading-5 text-navy-strong">{item.label}</p>
              <div role="group" aria-label={`Group for: ${item.label}`} className="mt-2 flex flex-wrap gap-2">
                {beat.buckets.map(bucket => (
                  <button key={bucket.id} type="button" aria-pressed={choice === bucket.id} onClick={() => onSort(item.id, bucket.id)}
                    className={`min-h-11 rounded-full border px-4 text-[14px] font-bold ${choice === bucket.id ? "border-family-action bg-family-action text-white" : "border-line bg-surface text-navy-strong hover:border-family-action/50"}`}>
                    {bucket.label}
                  </button>
                ))}
              </div>
              {choice ? <p role="status" className="mt-2 text-[14px] leading-5 text-navy">{right ? "Yes. " : "Not quite, try the other group. "}{item.why}</p> : null}
            </li>
          );
        })}
      </ul>
      <p className="text-[13px] font-semibold text-ink-2" data-testid="sort-progress">{done} of {beat.items.length} in the right group</p>
    </section>
  );
}

export function AllocateBeatView({ beat, values, onChange }: { beat: AllocateBeat; values: Record<string, number>; onChange: (bucket: string, value: number) => void }) {
  const problems = allocationProblems(beat, values);
  const sum = beat.buckets.reduce((t, b) => t + (values[b.id] ?? b.start), 0);
  return (
    <section data-testid="beat-allocate" aria-labelledby={`${beat.id}-t`} className="space-y-3">
      <h2 id={`${beat.id}-t`} className="text-[18px] font-extrabold leading-6 text-navy-strong">{beat.title}</h2>
      <p className="text-[15px] leading-6 text-navy">{beat.prompt}</p>
      <ul className="space-y-2">
        {beat.buckets.map(b => {
          const v = values[b.id] ?? b.start;
          return (
            <li key={b.id} className="flex items-center gap-3 rounded-[14px] border border-line bg-surface p-3" data-testid={`allocate-${b.id}`}>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-navy-strong">{b.label}</span>
                <span className="mt-1 block h-2 overflow-hidden rounded-full bg-surface-soft" aria-hidden><span className="block h-full rounded-full bg-family-action transition-[width] motion-reduce:transition-none" style={{ width: `${100 * v / beat.total}%` }}/></span>
              </span>
              <button type="button" aria-label={`Less for ${b.label}`} disabled={v <= 0} onClick={() => onChange(b.id, Math.max(0, v - beat.step))}
                className="grid size-11 place-items-center rounded-full border border-line text-[20px] font-bold text-navy-strong disabled:opacity-40">-</button>
              <output aria-live="polite" aria-label={`${b.label}: ${v} credits`} className="w-10 text-center text-[18px] font-extrabold text-navy-strong">{v}</output>
              <button type="button" aria-label={`More for ${b.label}`} disabled={sum >= beat.total + beat.step * 4} onClick={() => onChange(b.id, v + beat.step)}
                className="grid size-11 place-items-center rounded-full border border-line text-[20px] font-bold text-navy-strong disabled:opacity-40">+</button>
            </li>
          );
        })}
      </ul>
      <p className="text-[14px] font-semibold text-navy-strong" data-testid="allocate-total">Placed: {sum} of {beat.total} credits</p>
      {problems.length
        ? <ul className="list-disc space-y-0.5 pl-5 text-[14px] leading-6 text-orange-text" data-testid="allocate-problems">{problems.map(p => <li key={p}>{p}</li>)}</ul>
        : <p role="status" data-testid="allocate-met" className="flex items-start gap-2 rounded-[14px] bg-green-soft p-3 text-[15px] font-semibold leading-6 text-green-strong"><CheckCircle2 aria-hidden className="mt-1 size-4 shrink-0"/>{beat.success}</p>}
      <p className="text-[13px] text-ink-2">Pretend credits in a lesson. Nothing is spent and your balance does not change.</p>
    </section>
  );
}

/** Runs an interactive lesson. Calls onComplete once, only after a correct check. */
export function InteractiveLessonBody({ lesson, interactive, goal, done, onComplete, doneView, note }: {
  lesson: LearningModule; interactive: InteractiveLesson; goal: LessonGoal; done: boolean;
  onComplete: () => void; doneView: ReactNode;
  /** "For your goal" sentence that ties the lesson to the Child's own dream. */
  note?: string;
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Record<string, string | null>>({});
  const [labs, setLabs] = useState<Record<string, number>>({});
  const [answer, setAnswer] = useState<number | null>(null);
  const [sorts, setSorts] = useState<Record<string, Record<string, string>>>({});
  const [allocs, setAllocs] = useState<Record<string, Record<string, number>>>({});
  const beats = interactive.beats;
  const beat: Beat = beats[Math.min(step, beats.length - 1)];
  const labValue = beat.kind === "lab" ? labs[beat.id] ?? beat.start : undefined;
  const allocation = beat.kind === "allocate" ? Object.fromEntries(beat.buckets.map(b => [b.id, allocs[beat.id]?.[b.id] ?? b.start])) : undefined;
  const complete = beatComplete(beat, { picked: picked[beat.id], labValue, correct: answer === lesson.answer, sorted: sorts[beat.id], allocation }, goal);
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
      {step === 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-[14px] leading-6 text-ink-2">{interactive.intro}</p>
          {note ? <p data-testid="goal-note" className="rounded-[14px] bg-yellow-soft px-3 py-2 text-[14px] leading-6 text-navy-strong"><strong>For your {goal.label.toLowerCase()}: </strong>{note.replace(/^For your [^:]+:\s*/, "")}</p> : null}
        </div>
      ) : null}
      <article className={`${panel} mt-3 flex-1 overflow-hidden !p-0`}>
        {beat.kind === "decide" ? <LessonIllustration kind={lesson.illustration ?? "piggy"} title={`${lesson.title} illustration`} className="block h-auto max-h-[160px] w-full"/> : null}
        <div className="p-4 md:p-6">
          {beat.kind === "decide" ? <DecideBeatView beat={beat} picked={picked[beat.id] ?? null} onPick={id => setPicked(p => ({ ...p, [beat.id]: id }))}/> : null}
          {beat.kind === "lab" ? <LabBeatView beat={beat} goal={goal} value={labValue ?? beat.start} onChange={v => setLabs(l => ({ ...l, [beat.id]: v }))}/> : null}
          {beat.kind === "sort" ? <SortBeatView beat={beat} sorted={sorts[beat.id] ?? {}} onSort={(item, bucket) => setSorts(s => ({ ...s, [beat.id]: { ...s[beat.id], [item]: bucket } }))}/> : null}
          {beat.kind === "allocate" ? <AllocateBeatView beat={beat} values={allocation ?? {}} onChange={(bucket, v) => setAllocs(a => ({ ...a, [beat.id]: { ...a[beat.id], [bucket]: v } }))}/> : null}
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
                {section.source ? <p className="mt-1 text-[13px] leading-5 text-ink-2">Source: <a href={section.source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-family-action underline underline-offset-4">{section.source.organization}: {section.source.title} (opens outside Cresco)</a>, checked {section.source.verifiedAt}</p> : null}
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
