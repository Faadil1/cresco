/**
 * Read-only, explicitly role-scoped bridge from the Family learning/practice
 * experience into the separate v0.4 Devnet mandate workspace.
 *
 * Does NOT synchronize identities, sessions, wallets, learning progress,
 * approvals or balances. No token is placed in URLs, telemetry or UI.
 */
import { loadKeychain, workflowApi, type WorkflowRole } from "./worlds-fair-workflow";

export type FamilyAudience = "parent" | "teen";
export type FamilyRequestActivity =
  | { kind: "loaded"; pendingDecisions: number; latestEventType: string | null }
  | { kind: "unavailable" };

export type FamilyWorkspaceConnection =
  | { kind: "no-workspace" }
  | { kind: "other-context" }
  | { kind: "missing-role" }
  | { kind: "shared-device-risk" }
  | { kind: "unavailable" }
  | { kind: "ready"; role: WorkflowRole; workspaceName: string; mandateReady: boolean; activity: FamilyRequestActivity };

export async function inspectFamilyWorkspace(audience: FamilyAudience): Promise<FamilyWorkspaceConnection> {
  const saved = loadKeychain();
  if (!saved.workspaceId) return { kind: "no-workspace" };
  try {
    // Do not fetch private workspace metadata until the viewer's role is known.
    // A teen in a shared browser must not inherit a stored guardian capability.
    if (audience === "teen" && (saved.tokens.principal || saved.tokens.risk)) {
      return { kind: "shared-device-risk" };
    }

    const candidates: WorkflowRole[] = audience === "parent" ? ["principal", "risk"] : ["operator"];
    const desired = candidates.find((role) => Boolean(saved.tokens[role]));
    if (!desired) return { kind: "missing-role" };

    // Verify the role first; a workspace identifier alone is never an access key.
    const validated = await workflowApi.whoami(saved.workspaceId, saved.tokens[desired]!);
    if (validated.role !== desired || validated.workspaceId !== saved.workspaceId) {
      return { kind: "missing-role" };
    }
    const workspace = await workflowApi.getWorkspace(saved.workspaceId, saved.tokens[desired]!);
    // Older workspaces with no useCase are classified capital by the server.
    if (workspace.useCase !== "family") return { kind: "other-context" };
    // Read role-scoped request activity only after a matching server whoami.
    // Failure to read notifications must not convert an authenticated read-only
    // navigation into a false claim that there are zero outstanding requests.
    let activity: FamilyRequestActivity = { kind: "unavailable" };
    try {
      const updates = await workflowApi.notifications(saved.workspaceId, saved.tokens[desired]!, 0);
      if (updates.role === desired && Number.isSafeInteger(updates.pendingDecisions) && updates.pendingDecisions >= 0) {
        const latest = Array.isArray(updates.notifications) ? updates.notifications.at(-1) : null;
        activity = {
          kind: "loaded",
          pendingDecisions: updates.pendingDecisions,
          // Never forward server-written summary, credentials or transaction data
          // into the bridge. Rendering uses a finite public event-label mapping.
          latestEventType: latest && typeof latest.type === "string" ? latest.type : null,
        };
      }
    } catch {
      // API/auth errors here mean UNKNOWN activity, not an empty inbox.
    }
    return {
      kind: "ready",
      role: desired,
      workspaceName: workspace.name,
      mandateReady: workspace.chain.status === "READY",
      activity,
    };
  } catch {
    // Includes offline, removed workspace and expired/invalid role token.
    // Fail closed, never claim the mandate is connected.
    return { kind: "unavailable" };
  }
}
