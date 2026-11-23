import { describe, expect, it } from "vitest";
import { CHILD_LEARNING, PARENT_LEARNING } from "./family-public-practice";
import {
  INTERACTIVE_LESSON_IDS, LESSON_CHAPTERS, beatComplete, interactiveLessonFor, labResult,
  type DecideBeat, type LabBeat,
} from "./family-lesson-interactions";

const bike = { label: "New bike", target: 60, saved: 0 };

describe("interactive lessons (issue #130)", () => {
  it("exist for one saving lesson and one risk lesson, and never for Parent lessons", () => {
    expect([...INTERACTIVE_LESSON_IDS]).toEqual(["c-save", "c-risk"]);
    for (const lesson of PARENT_LEARNING) expect(interactiveLessonFor(lesson.id, bike)).toBeNull();
    for (const id of INTERACTIVE_LESSON_IDS) {
      const lesson = interactiveLessonFor(id, bike)!;
      expect(lesson.beats.map(b => b.kind)).toEqual(["decide", "lab", "check"]);
      // The check reuses the lesson's vetted question; every wrong answer has a specific hint.
      const vetted = CHILD_LEARNING.find(item => item.id === id)!;
      const check = lesson.beats[2] as { hints: string[] };
      vetted.choices.forEach((_, i) => expect(Boolean(check.hints[i]), `${id} hint ${i}`).toBe(i !== vetted.answer));
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
