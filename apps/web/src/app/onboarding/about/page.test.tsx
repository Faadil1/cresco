import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, dispatch } = vi.hoisted(() => ({ push: vi.fn(), dispatch: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/onboarding", () => ({
  OnboardingFrame: ({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) => (
    <div>{children}{footer}</div>
  ),
}));
vi.mock("@/components/ui/primitives", () => ({
  ActionButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}));
vi.mock("@/state/store", () => ({ useStore: () => ({ dispatch }) }));
import AboutStep from "./page";

describe("CRESCO demo onboarding protects child personal information", () => {
  beforeEach(() => { push.mockReset(); dispatch.mockReset(); });

  it("asks no real name, email or age and states household is not private", () => {
    render(<AboutStep />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText(/without providing a real child's name, age or email/i)).toBeVisible();
    expect(screen.getByText(/not a personal account/i)).toBeVisible();
  });

  it("uses a fictional profile and moves to the existing Goal step", async () => {
    render(<AboutStep />);
    await userEvent.click(screen.getByRole("button", { name: "Next: choose a practice goal" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "setProfile", profile: { childName: "Alex", age: null } });
    expect(push).toHaveBeenCalledWith("/onboarding/goal");
  });
});
