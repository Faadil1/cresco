import { render, screen, waitFor } from "@testing-library/react";
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
  KidBust: () => <div aria-hidden="true" />,
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
    state: { profile: { childName: "Jordan" } },
    dispatch,
  }),
}));

import StartPage from "./page";

describe("CRESCO child sign-in recovery", () => {
  beforeEach(() => {
    push.mockReset();
    dispatch.mockReset();
    signInDemo.mockReset();
  });

  it("restores the demo button and shows a retryable error when backend session creation fails", async () => {
    signInDemo.mockRejectedValueOnce(new Error("CORS blocked"));

    render(<StartPage />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Try the demo as Jordan" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "CRESCO could not start the demo session. Please try again.",
    );
    expect(
      screen.getByRole("button", { name: "Try the demo as Jordan" }),
    ).toBeEnabled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
  it("runs guided practice with a demo child session, never a fake email sign-in", async () => {
    signInDemo.mockResolvedValueOnce({ role: "child", displayName: "Jordan", kind: "demo" });
    render(<StartPage />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Start guided practice (demo)" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/about"));
    expect(signInDemo).toHaveBeenCalledWith("child", "Jordan");
  });

});
