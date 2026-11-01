"use client";

import { useState } from "react";
import { groceryMargin, priceDrop, savingsPlan } from "@/lib/family-learning-lab";

/**
 * Hands-on learning, not a financial action. Sliders only change local
 * examples shown in this lesson; nothing is dispatched to Family practice.
 */
export function FamilyLessonLab({
  lessonId, target, saved,
}: { lessonId: string; target: number; saved: number }) {
  const [periods, setPeriods] = useState(4);
  const [delivery, setDelivery] = useState(20);
  const [decline, setDecline] = useState(25);

  if (!["c-save", "c-explore", "c-risk", "p-risk"].includes(lessonId)) return null;

  return (
    <section aria-label="Hands-on learning lab" data-testid="lesson-math-lab"
      className="mt-5 rounded-[20px] border border-green/30 bg-green-soft p-4 md:p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-green-strong">Hands-on lab · Change the numbers</p>

      {lessonId === "c-save" ? (() => {
        const plan = savingsPlan(target, saved, periods);
        return (
          <>
            <h3 className="mt-1 text-[18px] font-bold text-navy-strong">Build your own saving plan</h3>
            <p className="mt-2 text-[13px] leading-6 text-navy">
              Your practice goal is {target} credits. You have {saved} saved, so you still need {plan.stillNeeded}.
              Choose how many practice periods you want to spread that across.
            </p>
            <label htmlFor="family-lab-periods" className="mt-4 flex justify-between gap-2 text-[13px] font-semibold text-navy-strong">
              Practice periods <strong>{periods}</strong>
            </label>
            <input id="family-lab-periods" aria-label="Practice periods" type="range" min="1" max="8" step="1"
              value={periods} onChange={event => setPeriods(Number(event.target.value))}
              className="mt-2 w-full accent-green-strong"/>
            <output data-testid="lab-savings-result" className="mt-3 block rounded-[14px] bg-surface p-3 text-[15px] font-bold text-navy-strong">
              Plan for {plan.perPeriod} pretend credits each period.
            </output>
            <p className="mt-2 text-[12px] leading-5 text-ink-2">Try fewer or more periods. This is a budgeting calculation, not actual saving or an investment.</p>
          </>
        );
      })() : null}

      {lessonId === "c-explore" ? (() => {
        const shop = groceryMargin(100, 65, delivery);
        return (
          <>
            <h3 className="mt-1 text-[18px] font-bold text-navy-strong">Can Mina's grocery cover its costs?</h3>
            <p className="mt-2 text-[13px] leading-6 text-navy">
              Imagine Mina's grocery earns 100 pretend credits in sales and pays 65 for other expenses.
              Now change its delivery bill.
            </p>
            <label htmlFor="family-lab-delivery" className="mt-4 flex justify-between gap-2 text-[13px] font-semibold text-navy-strong">
              Delivery cost <strong>{delivery} credits</strong>
            </label>
            <input id="family-lab-delivery" aria-label="Delivery cost" type="range" min="10" max="60" step="5"
              value={delivery} onChange={event => setDelivery(Number(event.target.value))}
              className="mt-2 w-full accent-green-strong"/>
            <output data-testid="lab-grocery-result" className="mt-3 block rounded-[14px] bg-surface p-3 text-[15px] font-bold text-navy-strong">
              {shop.remaining >= 0 ? `${shop.remaining} pretend credits left after costs.` : `${Math.abs(shop.remaining)} pretend credits short after costs.`}
            </output>
            <p className="mt-2 text-[12px] leading-5 text-ink-2">Growing sales do not guarantee profit. This is an invented example, not data about a real shop.</p>
          </>
        );
      })() : null}

      {lessonId === "c-risk" || lessonId === "p-risk" ? (() => {
        const result = priceDrop(20, decline);
        return (
          <>
            <h3 className="mt-1 text-[18px] font-bold text-navy-strong">What could a price drop mean?</h3>
            <p className="mt-2 text-[13px] leading-6 text-navy">
              Imagine 20 pretend credits invested in one fictional company. Change how far its example price falls.
            </p>
            <label htmlFor="family-lab-drop" className="mt-4 flex justify-between gap-2 text-[13px] font-semibold text-navy-strong">
              Hypothetical price drop <strong>{decline}%</strong>
            </label>
            <input id="family-lab-drop" aria-label="Hypothetical price drop" type="range" min="0" max="50" step="5"
              value={decline} onChange={event => setDecline(Number(event.target.value))}
              className="mt-2 w-full accent-green-strong"/>
            <output data-testid="lab-risk-result" className="mt-3 block rounded-[14px] bg-surface p-3 text-[15px] font-bold text-navy-strong">
              20 credits become {result.afterDrop.toFixed(2)}. That is {result.lost.toFixed(2)} lost in the example.
            </output>
            <p className="mt-2 text-[12px] leading-5 text-ink-2">This does not predict a market or change your practice portfolio. Losses can occur in real investments.</p>
          </>
        );
      })() : null}

      <p className="mt-3 border-t border-green/20 pt-3 text-[11px] font-semibold text-ink-2">
        Learning lab only · No credits spent · My Key and Parent decisions are unchanged.
      </p>
    </section>
  );
}
