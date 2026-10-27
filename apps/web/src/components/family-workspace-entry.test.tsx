import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ inspectFamilyWorkspace: vi.fn() }));

vi.mock("@/services/family-workspace-bridge", () => ({
  inspectFamilyWorkspace: mocks.inspectFamilyWorkspace,
}));

import { FamilyWorkspaceEntry } from "./family-workspace-entry";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.inspectFamilyWorkspace.mockResolvedValue({ kind: "no-workspace" });
});

describe("Family Devnet workspace continuity entry", () => {
  it("lets a parent create a new Family workspace only when no other workspace is saved", async () => {
    render(<FamilyWorkspaceEntry audience="parent" />);
    expect(await screen.findByRole("link", { name: /set up family mandate/i })).toHaveAttribute("href", "/worlds-fair/desk?case=family");
    expect(screen.queryByText(/no email/i)).not.toBeInTheDocument();
    expect(screen.getByText(/different demo session/i)).toBeInTheDocument();
  });

  it("gives the teen a safe private-role handoff rather than exposing a parent setup CTA", async () => {
    render(<FamilyWorkspaceEntry audience="teen" />);
    expect(await screen.findByText(/Ask your parent to create the Family mandate/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /set up family mandate/i })).not.toBeInTheDocument();
  });

  it("allows a verified parent role to resume only the Family workflow", async () => {
    mocks.inspectFamilyWorkspace.mockResolvedValue({
      kind: "ready", workspaceName: "Family desk", role: "principal", mandateReady: true,
    });
    render(<FamilyWorkspaceEntry audience="parent" />);
    expect(await screen.findByText(/Verified Parent role/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /resume family workspace/i })).toHaveAttribute("href", "/worlds-fair/desk?case=family");
  });

  it("prevents a misleading Family CTA for a stored capital workspace", async () => {
    mocks.inspectFamilyWorkspace.mockResolvedValue({ kind: "other-context" });
    render(<FamilyWorkspaceEntry audience="parent" />);
    expect(await screen.findByText(/Delegated Capital workspace/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /family mandate|resume family/i })).not.toBeInTheDocument();
  });

  it("blocks a Teen link on a browser that also holds Parent permissions", async () => {
    mocks.inspectFamilyWorkspace.mockResolvedValue({ kind: "shared-device-risk" });
    render(<FamilyWorkspaceEntry audience="teen" />);
    expect(await screen.findByText(/Parent permissions are saved/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /resume family/i })).not.toBeInTheDocument();
  });

  it("can recheck an unavailable API without creating a workspace or writing to the chain", async () => {
    mocks.inspectFamilyWorkspace.mockResolvedValueOnce({ kind: "unavailable" })
      .mockResolvedValueOnce({ kind: "no-workspace" });
    render(<FamilyWorkspaceEntry audience="parent" />);
    expect(await screen.findByText(/could not be verified/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /refresh family workspace status/i }));
    await waitFor(() => expect(mocks.inspectFamilyWorkspace).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole("link", { name: /set up family mandate/i })).toBeInTheDocument();
  });
});
