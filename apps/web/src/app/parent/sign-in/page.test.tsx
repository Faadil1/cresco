import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, dispatch, signInDemo } = vi.hoisted(() => ({
  push: vi.fn(), dispatch: vi.fn(), signInDemo: vi.fn(),
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
import ParentSignIn from "./page";

describe("CRESCO parent DEMO entry (not verified guardian auth)", () => {
  beforeEach(() => { push.mockReset(); dispatch.mockReset(); signInDemo.mockReset(); });

  it("discloses an unverified shared guardian role and requests no email", () => {
    render(<ParentSignIn />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText(/Anyone can open this shared demonstration/i)).toBeVisible();
    expect(screen.getByText(/not identity verification/i)).toBeVisible();
  });

  it("always uses the fictional parent alias, not personal information", async () => {
    signInDemo.mockResolvedValueOnce({ role: "parent", displayName: "Sam", kind: "demo" });
    render(<ParentSignIn />);
    await userEvent.click(screen.getByRole("button", { name: "Continue as Sam (demo)" }));
    expect(signInDemo).toHaveBeenCalledWith("parent", "Sam");
    expect(dispatch).toHaveBeenCalledWith({ type: "setProfile", profile: { parentName: "Sam" } });
    expect(push).toHaveBeenCalledWith("/parent");
  });

  it("shows retryable error with no sign-in dispatch when session creation fails", async () => {
    signInDemo.mockRejectedValueOnce(new Error("CORS blocked"));
    render(<ParentSignIn />);
    await userEvent.click(screen.getByRole("button", { name: "Continue as Sam (demo)" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("CRESCO could not start the parent demo session. Please try again.");
    expect(screen.getByRole("button", { name: "Continue as Sam (demo)" })).toBeEnabled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
