import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InteractiveLessonBody } from "./family-lesson-interactive";
import { CHILD_LEARNING } from "@/lib/family-public-practice";
import { interactiveLessonFor } from "@/lib/family-lesson-interactions";

const goal = { label: "New bike", target: 60, saved: 0 };

describe("InteractiveLessonBody", () => {
  it("completes once, only after every beat and a correct check; wrong answers are retryable", () => {
    const lesson = CHILD_LEARNING.find(item => item.id === "c-save")!;
    const onComplete = vi.fn();
    render(<InteractiveLessonBody lesson={lesson} interactive={interactiveLessonFor("c-save", goal)!} goal={goal}
      done={false} onComplete={onComplete} doneView={<p>done</p>}/>);
    const next = () => screen.getByRole("button", { name: /next idea|quick check/i });
    expect(next()).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /spend it on snacks/i }));
    expect(screen.getByTestId("decision-consequence")).toHaveTextContent(/starts again from zero/);
    fireEvent.click(next());
    expect(next()).toBeDisabled();
    fireEvent.change(screen.getByRole("slider", { name: "Practice periods" }), { target: { value: "6" } });
    expect(screen.getByTestId("lab-goal-met")).toBeInTheDocument();
    fireEvent.click(next());
    const complete = screen.getByRole("button", { name: /complete lesson/i });
    fireEvent.click(screen.getByRole("button", { name: /assume prices always rise/i }));
    expect(screen.getByTestId("lesson-feedback")).toHaveTextContent(/prices can fall as well as rise/i);
    expect(complete).toBeDisabled();
    fireEvent.click(complete);
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /choose a goal and a time horizon/i }));
    expect(complete).toBeEnabled();
    fireEvent.click(complete);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
