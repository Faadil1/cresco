import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, dispatch, signInDemo } = vi.hoisted(() => ({
  push: vi.fn(),
  dispatch: vi.fn(),
  signInDemo: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/components/onboarding", () => ({
  OnboardingFrame: ({
    children,
    footer,
  }: {
    children: React.ReactNode;
    footer: React.ReactNode;
  }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

vi.mock("@/components/illustrations/people", () => ({
  ParentBust: () => <div aria-hidden="true" />,
}));

vi.mock("@/components/ui/primitives", () => ({
  ActionButton: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/services", () => ({
  auth: { signInDemo },
}));

vi.mock("@/state/store", () => ({
  useStore: () => ({
    state: { profile: { parentName: "Alex" } },
    dispatch,
  }),
}));

import ParentSignIn from "./page";

describe("CRESCO parent sign-in recovery", () => {
  beforeEach(() => {
    push.mockReset();
    dispatch.mockReset();
    signInDemo.mockReset();
  });

  it("restores the parent button and shows a retryable error when backend session creation fails", async () => {
    signInDemo.mockRejectedValueOnce(new Error("CORS blocked"));

    render(<ParentSignIn />);

    await userEvent.click(
      screen.getByRole("button", { name: "Continue as Alex (demo)" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "CRESCO could not start the parent demo session. Please try again.",
    );
    expect(
      screen.getByRole("button", { name: "Continue as Alex (demo)" }),
    ).toBeEnabled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
