import { describe, expect, it } from "vitest";
import { CHILD_LEARNING, PARENT_LEARNING } from "./family-public-practice";
import {
  INTERACTIVE_LESSON_IDS, LESSON_CHAPTERS, allocationProblems, beatComplete, interactiveLessonFor, labResult,
  type DecideBeat, type LabBeat,
} from "./family-lesson-interactions";

const bike = { label: "New bike", target: 60, saved: 0 };

describe("interactive lessons (issue #130)", () => {
  it("cover all 17 Child lessons, never Parent lessons, each ending in its vetted check with a hint per wrong answer", () => {
    expect([...INTERACTIVE_LESSON_IDS].sort()).toEqual(CHILD_LEARNING.map(item => item.id).sort());
    expect(INTERACTIVE_LESSON_IDS).toHaveLength(17);
    for (const lesson of PARENT_LEARNING) expect(interactiveLessonFor(lesson.id, bike)).toBeNull();
    for (const id of INTERACTIVE_LESSON_IDS) {
      const lesson = interactiveLessonFor(id, bike)!;
      expect(lesson.beats.at(-1)!.kind, id).toBe("check");
      expect(lesson.beats.length, id).toBeGreaterThanOrEqual(3);
      // The check reuses the lesson's vetted question; every wrong answer has a specific hint.
      const vetted = CHILD_LEARNING.find(item => item.id === id)!;
      const check = lesson.beats.at(-1) as { hints: string[] };
      vetted.choices.forEach((_, i) => expect(Boolean(check.hints[i]), `${id} hint ${i}`).toBe(i !== vetted.answer));
      if (id !== "c-save" && id !== "c-risk") expect(lesson.objective, id).toBeTruthy();
    }
  });

  it("use varied activities, not slider clones", () => {
    const kinds = INTERACTIVE_LESSON_IDS.flatMap(id => interactiveLessonFor(id, bike)!.beats.filter(b => b.kind !== "check").map(b => b.kind));
    expect(new Set(kinds)).toEqual(new Set(["decide", "lab", "sort", "allocate"]));
    expect(kinds.filter(k => k === "lab").length).toBeLessThan(kinds.length / 3);
    for (const id of INTERACTIVE_LESSON_IDS) {
      const beats = interactiveLessonFor(id, bike)!.beats.filter(b => b.kind !== "check");
      // Two different activities per lesson, except two linked decisions in Compare prices / Time matters.
      if (!["c-price", "c-volatility"].includes(id)) expect(new Set(beats.map(b => b.kind)).size, id).toBe(2);
    }
  });

  it("every activity in every lesson can actually be completed", () => {
    for (const id of INTERACTIVE_LESSON_IDS) {
      for (const beat of interactiveLessonFor(id, bike)!.beats) {
        if (beat.kind === "decide") expect(beatComplete(beat, { picked: beat.options[0].id }, bike)).toBe(true);
        if (beat.kind === "sort") {
          const wrong = Object.fromEntries(beat.items.map(item => [item.id, beat.buckets.find(b => b.id !== item.bucket)!.id]));
          expect(beatComplete(beat, { sorted: wrong }, bike), `${id} wrong sort`).toBe(false);
          expect(beatComplete(beat, { sorted: Object.fromEntries(beat.items.map(item => [item.id, item.bucket])) }, bike), `${id} sort`).toBe(true);
        }
        if (beat.kind === "lab") {
          const reachable = Array.from({ length: (beat.max - beat.min) / beat.step + 1 }, (_, i) => beat.min + i * beat.step).some(v => labResult(beat, bike, v).met);
          expect(reachable, `${id} lab goal reachable`).toBe(true);
          expect(labResult(beat, bike, beat.start).met, `${id} lab not solved at start`).toBe(false);
        }
        if (beat.kind === "allocate") {
          const start = Object.fromEntries(beat.buckets.map(b => [b.id, b.start]));
          expect(allocationProblems(beat, start).length, `${id} allocate not solved at start`).toBeGreaterThan(0);
          const values = Array.from({ length: beat.total / beat.step + 1 }, (_, i) => i * beat.step);
          const found = values.some(a => values.some(b => values.some(c => allocationProblems(beat, { [beat.buckets[0].id]: a, [beat.buckets[1].id]: b, [beat.buckets[2].id]: c }).length === 0)));
          expect(found, `${id} allocation solvable`).toBe(true);
        }
      }
    }
  });

  it("works the numbers from the Child's own goal, with invented classroom examples", () => {
    const save = interactiveLessonFor("c-save", { label: "Family trip", target: 100, saved: 20 })!.beats[0] as DecideBeat;
    const allIn = save.options.find(o => o.id === "all-in")!;
    expect(allIn.numbers).toEqual([{ label: "After a 25% drop", value: "15 credits" }, { label: "Still needed for the family trip", value: "85 credits" }]);
    expect(save.options.find(o => o.id === "set-aside")!.numbers[1].value).toBe("80 credits");
    const risk = interactiveLessonFor("c-risk", bike)!.beats[0] as DecideBeat;
    expect(risk.options.find(o => o.id === "all-orchard")!.numbers[0].value).toBe("14 credits");
    expect(risk.options.find(o => o.id === "split")!.numbers[0].value).toBe("15.5 credits");
  });

  it("moves on only after a real interaction: a pick, a lab goal met, a correct answer", () => {
    const [decide, lab, check] = interactiveLessonFor("c-save", bike)!.beats;
    expect(beatComplete(decide, { picked: null }, bike)).toBe(false);
    expect(beatComplete(decide, { picked: "not-an-option" }, bike)).toBe(false);
    expect(beatComplete(decide, { picked: "spend" }, bike)).toBe(true);
    // 60 needed: 3 periods = 20 each (over the 15 Key), 4 periods = 15 each (fits).
    expect(labResult(lab as LabBeat, bike, 3)).toMatchObject({ met: false });
    expect(labResult(lab as LabBeat, bike, 4)).toMatchObject({ met: true });
    expect(beatComplete(lab, { labValue: 1 }, bike)).toBe(false);
    expect(beatComplete(lab, { labValue: 4 }, bike)).toBe(true);
    expect(beatComplete(check, { correct: false }, bike)).toBe(false);
    expect(beatComplete(check, { correct: true }, bike)).toBe(true);
    const drop = interactiveLessonFor("c-risk", bike)!.beats[1] as LabBeat;
    expect(labResult(drop, bike, 20).met).toBe(false);
    expect(labResult(drop, bike, 25)).toMatchObject({ met: true, text: "20 credits become 15.00. That is 5.00 lost in the example." });
  });

  it("chapters cover every Child lesson exactly once", () => {
    const listed = LESSON_CHAPTERS.flatMap(chapter => chapter.lessons);
    expect(new Set(listed).size).toBe(listed.length);
    expect([...listed].sort()).toEqual(CHILD_LEARNING.map(item => item.id).sort());
  });
});
