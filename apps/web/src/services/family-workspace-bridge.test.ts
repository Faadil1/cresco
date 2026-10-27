import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadKeychain: vi.fn(),
  getWorkspace: vi.fn(),
  whoami: vi.fn(),
}));

vi.mock("./worlds-fair-workflow", () => ({
  loadKeychain: mocks.loadKeychain,
  workflowApi: { getWorkspace: mocks.getWorkspace, whoami: mocks.whoami },
}));

import { inspectFamilyWorkspace } from "./family-workspace-bridge";

const id = "ws-family1234";
const workspace = { id, name: "Home family", useCase: "family", chain: { status: "READY" } };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.loadKeychain.mockReturnValue({ workspaceId: id, tokens: { principal: "wf_principal_secret" } });
  mocks.getWorkspace.mockResolvedValue(workspace);
  mocks.whoami.mockResolvedValue({ workspaceId: id, role: "principal" });
});

describe("Family workspace role bridge", () => {
  it("does not contact the API when no workspace is saved", async () => {
    mocks.loadKeychain.mockReturnValue({ workspaceId: null, tokens: {} });
    expect(await inspectFamilyWorkspace("parent")).toEqual({ kind: "no-workspace" });
    expect(mocks.getWorkspace).not.toHaveBeenCalled();
    expect(mocks.whoami).not.toHaveBeenCalled();
  });

  it("never presents a delegated-capital workspace as a Family workspace", async () => {
    mocks.getWorkspace.mockResolvedValue({ ...workspace, useCase: "capital" });
    expect(await inspectFamilyWorkspace("parent")).toEqual({ kind: "other-context" });
    expect(mocks.whoami).not.toHaveBeenCalled();
  });

  it("does not assume that a missing useCase implies Family", async () => {
    mocks.getWorkspace.mockResolvedValue({ ...workspace, useCase: undefined });
    expect(await inspectFamilyWorkspace("parent")).toEqual({ kind: "other-context" });
  });

  it("validates a parent role on the server before allowing return to Devnet", async () => {
    const result = await inspectFamilyWorkspace("parent");
    expect(result).toEqual({ kind: "ready", workspaceName: "Home family", role: "principal", mandateReady: true });
    expect(mocks.whoami).toHaveBeenCalledWith(id, "wf_principal_secret");
    expect(JSON.stringify(result)).not.toContain("wf_principal_secret");
  });

  it("allows an independently scoped second parent role without widening its permissions", async () => {
    mocks.loadKeychain.mockReturnValue({ workspaceId: id, tokens: { risk: "wf_risk_secret" } });
    mocks.whoami.mockResolvedValue({ workspaceId: id, role: "risk" });
    expect(await inspectFamilyWorkspace("parent")).toMatchObject({ kind: "ready", role: "risk" });
  });

  it("requires a matching, server-verified teen operator role", async () => {
    mocks.loadKeychain.mockReturnValue({ workspaceId: id, tokens: { operator: "wf_operator_secret" } });
    mocks.whoami.mockResolvedValue({ workspaceId: id, role: "operator" });
    expect(await inspectFamilyWorkspace("teen")).toMatchObject({ kind: "ready", role: "operator" });
    mocks.whoami.mockResolvedValue({ workspaceId: id, role: "principal" });
    expect(await inspectFamilyWorkspace("teen")).toEqual({ kind: "missing-role" });
  });

  it("blocks shared-device teen access whenever guardian privileges are also stored", async () => {
    mocks.loadKeychain.mockReturnValue({ workspaceId: id, tokens: { operator: "wf_operator_secret", principal: "wf_principal_secret" } });
    expect(await inspectFamilyWorkspace("teen")).toEqual({ kind: "shared-device-risk" });
    expect(mocks.whoami).not.toHaveBeenCalled();
  });

  it("requires an appropriate private role link, never borrowing another role", async () => {
    mocks.loadKeychain.mockReturnValue({ workspaceId: id, tokens: { operator: "wf_operator_secret" } });
    expect(await inspectFamilyWorkspace("parent")).toEqual({ kind: "missing-role" });
    expect(mocks.whoami).not.toHaveBeenCalled();
  });

  it("fails closed on API failure or invalid role credentials without revealing tokens", async () => {
    mocks.getWorkspace.mockRejectedValueOnce(new Error("network offline"));
    expect(await inspectFamilyWorkspace("parent")).toEqual({ kind: "unavailable" });
    mocks.whoami.mockRejectedValueOnce(new Error("token mismatch"));
    expect(await inspectFamilyWorkspace("parent")).toEqual({ kind: "unavailable" });
  });
});
