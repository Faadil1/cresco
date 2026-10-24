import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, replace, dispatch, clearBackendSessionToken } = vi.hoisted(() => ({
  push: vi.fn(), replace: vi.fn(), dispatch: vi.fn(), clearBackendSessionToken: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/parent",
  useRouter: () => ({ push, replace }),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    <a href={href} {...rest}>{children}</a>,
}));
vi.mock("@/components/shell", () => ({ Wordmark: () => <span>CRESCO</span> }));
vi.mock("@/components/ui/primitives", () => ({ cn: (...items: string[]) => items.filter(Boolean).join(" ") }));
vi.mock("@/services", () => ({ auth: { signInDemo: vi.fn() } }));
vi.mock("@/services/cresco-backend", () => ({ clearBackendSessionToken }));
vi.mock("@/state/store", () => ({
  useStore: () => ({
    state: { session: { role: "parent" }, profile: { childName: "Alex" } },
    hydrated: true,
    dispatch,
  }),
}));
import ParentLayout from "./layout";

describe("shared demo parent lifecycle", () => {
  beforeEach(() => { push.mockReset(); replace.mockReset(); dispatch.mockReset(); clearBackendSessionToken.mockReset(); });

  it("exposes an Exit demo action that clears browser tokens and local state", async () => {
    render(<ParentLayout><p>Parent content</p></ParentLayout>);
    expect(screen.getByText("Parent content")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Exit shared demo" }));
    expect(clearBackendSessionToken).toHaveBeenCalledOnce();
    expect(dispatch).toHaveBeenCalledWith({ type: "signOut" });
    expect(push).toHaveBeenCalledWith("/");
  });
});
