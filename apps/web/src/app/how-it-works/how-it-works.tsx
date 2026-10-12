"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { MandateRail, STEPS, type RailPoint } from "../worlds-fair/desk/desk-ui";
import type { UseCase } from "@/services/worlds-fair-workflow";

const WHO: Record<UseCase, { operator: string; principal: string }> = {
  family: { operator: "Maya", principal: "her parent" },
  capital: { operator: "The agent", principal: "the allocator" },
};

// What the line shows after each step: the story builds one action at a time.
const POINTS: RailPoint[][] = [
  [{ id: "a", amountMicroUsd: 300_000, kind: "alone" }],
  [
    { id: "a", amountMicroUsd: 300_000, kind: "alone" },
    { id: "b", amountMicroUsd: 750_000, kind: "pending" },
  ],
  [
    { id: "a", amountMicroUsd: 300_000, kind: "alone" },
    { id: "b", amountMicroUsd: 750_000, kind: "approved" },
  ],
];

const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors";

export function HowItWorksStepper() {
  const [step, setStep] = useState(0);
  const [useCase, setUseCase] = useState<UseCase>("family");
  const s = STEPS[useCase][step];
  const last = step === 2;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setStep((v) => Math.min(2, v + 1));
      if (e.key === "ArrowLeft") setStep((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section aria-labelledby="step-title" className="mt-12 md:mt-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ol aria-label="Steps" className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${STEPS[useCase][i].title}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-10 bg-blue" : "w-5 bg-line hover:bg-ink-3"}`}
              />
            </li>
          ))}
        </ol>
        <div role="radiogroup" aria-label="Setting" className="inline-flex rounded-full border border-line bg-surface p-1 text-[13px]">
          {(["family", "capital"] as UseCase[]).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={useCase === u}
              onClick={() => setUseCase(u)}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${useCase === u ? "bg-navy-strong text-bg" : "text-ink-2 hover:text-navy-strong"}`}
            >
              {u === "family" ? "Family" : "Delegated capital"}
            </button>
          ))}
        </div>
      </div>

      <div key={`${useCase}-${step}`} className="mt-10 grid gap-10 motion-safe:animate-[rise_320ms_cubic-bezier(0.2,0.8,0.2,1)_both] lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className={`font-display text-[96px] leading-[0.8] ${step === 1 ? "text-blue" : "text-navy-strong"}`}>0{step + 1}</p>
          <h2 id="step-title" className="mt-6 font-display text-[44px] font-normal leading-[1.02] tracking-[-0.02em] text-navy-strong md:text-[56px]">{s.title}</h2>
          <p className="mt-4 max-w-[40ch] text-[18px] leading-relaxed text-ink-2">{s.body}</p>
        </div>
        <div className="rounded-[28px] border border-line bg-surface p-6 md:p-8">
          <MandateRail limitMicroUsd={500_000} operator={WHO[useCase].operator} principal={WHO[useCase].principal} points={POINTS[step]} />
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <button type="button" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0} className={`${btn} border border-line text-navy-strong hover:bg-surface disabled:opacity-40`}>
          <ArrowLeft aria-hidden className="size-4" /> Back
        </button>
        {last ? (
          <div className="flex flex-wrap gap-3">
            <Link href="/start" className={`${btn} bg-navy-strong text-bg hover:bg-navy`}>Start with Family</Link>
            <Link href="/worlds-fair/desk?case=capital" className={`${btn} border border-line text-navy-strong hover:bg-surface`}>Start with Delegated capital</Link>
          </div>
        ) : (
          <button type="button" onClick={() => setStep((v) => Math.min(2, v + 1))} className={`${btn} bg-navy-strong text-bg hover:bg-navy`}>
            Next <ArrowRight aria-hidden className="size-4" />
          </button>
        )}
      </div>
    </section>
  );
}
