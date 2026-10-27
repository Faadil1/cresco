/**
 * Read-only, explicitly role-scoped bridge from the Family learning/practice
 * experience into the separate v0.4 Devnet mandate workspace.
 *
 * Does NOT synchronize identities, sessions, wallets, learning progress,
 * approvals or balances. No token is placed in URLs, telemetry or UI.
 */
import { loadKeychain, workflowApi, type WorkflowRole } from "./worlds-fair-workflow";

export type FamilyAudience = "parent" | "teen";
export type FamilyWorkspaceConnection =
  | { kind: "no-workspace" }
  | { kind: "other-context" }
  | { kind: "missing-role" }
  | { kind: "shared-device-risk" }
  | { kind: "unavailable" }
  | { kind: "ready"; role: WorkflowRole; workspaceName: string; mandateReady: boolean };

export async function inspectFamilyWorkspace(audience: FamilyAudience): Promise<FamilyWorkspaceConnection> {
  const saved = loadKeychain();
  if (!saved.workspaceId) return { kind: "no-workspace" };
  try {
    const workspace = await workflowApi.getWorkspace(saved.workspaceId);
    // Older workspaces with no useCase are classified capital by the server;
    // an absent field is not evidence of a Family workspace.
    if (workspace.useCase !== "family") return { kind: "other-context" };

    // An adult's principal/risk bearer token must not silently accompany a
    // teen into their operator journey on a shared browser.
    if (audience === "teen" && (saved.tokens.principal || saved.tokens.risk)) {
      return { kind: "shared-device-risk" };
    }

    const candidates: WorkflowRole[] = audience === "parent" ? ["principal", "risk"] : ["operator"];
    const desired = candidates.find((role) => Boolean(saved.tokens[role]));
    if (!desired) return { kind: "missing-role" };

    // Possession of a localStorage key is not authentication. Ask the workflow
    // server to verify the bearer role before displaying a "Resume" action.
    const validated = await workflowApi.whoami(saved.workspaceId, saved.tokens[desired]!);
    if (validated.role !== desired || validated.workspaceId !== saved.workspaceId) {
      return { kind: "missing-role" };
    }
    return {
      kind: "ready",
      role: desired,
      workspaceName: workspace.name,
      mandateReady: workspace.chain.status === "READY",
    };
  } catch {
    // Includes offline, removed workspace and expired/invalid role token.
    // Fail closed, never claim the mandate is connected.
    return { kind: "unavailable" };
  }
}
