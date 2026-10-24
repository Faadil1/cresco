import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, dispatch, signInDemo } = vi.hoisted(() => ({
  push: vi.fn(),
  dispatch: vi.fn(),
  signInDemo: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/onboarding", () => ({
  OnboardingFrame: ({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) => (
    <div>{children}{footer}</div>
  ),
}));
vi.mock("@/components/illustrations/family-story", () => ({
  StoryVignette: () => <div aria-hidden="true" />,
}));
vi.mock("@/components/ui/primitives", () => ({
  ActionButton: ({ children, onClick, disabled }: {
    children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  }) => <button type="button" onClick={onClick} disabled={disabled}>{children}</button>,
}));
vi.mock("@/services", () => ({ auth: { signInDemo } }));
vi.mock("@/state/store", () => ({ useStore: () => ({ dispatch }) }));
import StartPage from "./page";

describe("CRESCO privacy-safe child demo entry", () => {
  beforeEach(() => { push.mockReset(); dispatch.mockReset(); signInDemo.mockReset(); });

  it("does not ask for an email, name or age before demo entry", () => {
    render(<StartPage />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText(/not a private household/i)).toBeVisible();
    expect(screen.getByText(/not real investments/i)).toBeVisible();
  });

  it("opens step-by-step onboarding with a fixed fictional profile only", async () => {
    signInDemo.mockResolvedValueOnce({ role: "child", displayName: "Alex", kind: "demo" });
    render(<StartPage />);
    await userEvent.click(screen.getByRole("button", { name: "Explore step by step" }));
    expect(signInDemo).toHaveBeenCalledWith("child", "Alex");
    expect(dispatch).toHaveBeenCalledWith({ type: "setProfile", profile: { childName: "Alex", age: null } });
    expect(push).toHaveBeenCalledWith("/onboarding/about");
  });

  it("restores the demo button and shows a retryable error when the backend session fails", async () => {
    signInDemo.mockRejectedValueOnce(new Error("CORS blocked"));
    render(<StartPage />);
    await userEvent.click(screen.getByRole("button", { name: "Try the demo as Alex" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("CRESCO could not start the demo session. Please try again.");
    expect(screen.getByRole("button", { name: "Try the demo as Alex" })).toBeEnabled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
