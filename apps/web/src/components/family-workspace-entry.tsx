"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, RefreshCw, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import {
  inspectFamilyWorkspace,
  type FamilyAudience,
  type FamilyWorkspaceConnection,
} from "@/services/family-workspace-bridge";

type View = FamilyWorkspaceConnection | { kind: "checking" };

const roleName = { principal: "Parent", risk: "Second parent", operator: "Teen" } as const;

// Never display unreviewed event summaries or raw activity payloads here.
// Unknown events stay unknown, rather than looking like financial success.
const eventLabels: Record<string, string> = {
  EXCEPTION_REQUESTED: "A request was submitted",
  EXCEPTION_EXECUTED: "A request was marked executed; inspect the Devnet receipt",
  EXCEPTION_REFUSED: "A request was refused",
  EXCEPTION_REFUSED_BY_PROGRAM: "The program refused a request",
  EXCEPTION_STALE: "A request became stale",
  EXCEPTION_EXPIRED: "A request expired",
  EXCEPTION_ROLLED_BACK: "A request was rolled back",
  EXCEPTION_NOT_REQUIRED: "A request no longer required an exception",
  MANDATE_STATUS_CHANGED: "The mandate status changed",
  POLICY_REVISED: "The mandate policy changed",
  ASSET_RULE_UPDATED: "An asset rule changed",
};

export function FamilyWorkspaceEntry({
  audience,
  compact = false,
}: {
  audience: FamilyAudience;
  compact?: boolean;
}) {
  const [view, setView] = useState<View>({ kind: "checking" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    void inspectFamilyWorkspace(audience).then((result) => {
      if (active) setView(result);
    });
    return () => { active = false; };
  }, [audience, revision]);

  const heading = "Your Family mandate on Solana";
  const linkClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-green-strong px-5 py-2 text-[13px] font-semibold text-white hover:bg-green";
  const refresh = (
    <button
      type="button"
      onClick={() => { setView({ kind: "checking" }); setRevision((value) => value + 1); }}
      aria-label="Refresh Family workspace status"
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-3 py-2 text-[12px] font-semibold text-navy hover:bg-surface-soft"
    >
      <RefreshCw aria-hidden className="size-3.5" /> Check again
    </button>
  );

  return (
    <section
      data-testid="family-workspace-entry"
      aria-label={heading}
      className={`rounded-[22px] border border-line-soft bg-surface p-5 ${compact ? "" : "md:p-6"}`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-green-soft text-green-strong">
          <Wallet aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-green-strong">Separate Devnet workspace</p>
          <h2 className="mt-1 font-display text-[clamp(22px,2.5vw,29px)] leading-tight text-navy-strong">{heading}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
            Family learning and practice use a different demo session. Your on-chain mandate and role permissions are managed in the Family workspace, not copied from this page.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[15px] bg-surface-soft p-4" role="status" aria-live="polite">
        {view.kind === "checking" ? (
          <p className="text-[13px] font-semibold text-ink-2">Checking this browser for an existing Family workspace…</p>
        ) : view.kind === "ready" ? (
          <>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-green-strong">
              <ShieldCheck aria-hidden className="size-4" /> Verified {roleName[view.role]} role · {view.mandateReady ? "Devnet mandate ready" : "Workspace needs mandate setup"}
            </p>
            <p className="mt-1 break-words text-[13px] text-ink-2">{view.workspaceName}</p>
            <div className="mt-3 rounded-[12px] border border-line-soft bg-surface px-3 py-2.5">
              {view.activity.kind === "unavailable" ? (
                <p className="text-[12px] leading-relaxed text-ink-2">Request activity could not be checked. Do not assume there are no pending decisions; open the workspace to verify.</p>
              ) : audience === "parent" ? (
                <p className="text-[12px] font-semibold text-navy-strong">
                  {view.activity.pendingDecisions === 0
                    ? "No requests awaiting guardian review at last check."
                    : `${view.activity.pendingDecisions} ${view.activity.pendingDecisions === 1 ? "request" : "requests"} awaiting guardian review at last check.`}
                </p>
              ) : (
                <p className="text-[12px] leading-relaxed text-navy-strong">
                  {view.activity.latestEventType
                    ? `Latest role-specific update: ${eventLabels[view.activity.latestEventType] ?? "An event needs review in the workspace"}.`
                    : "No recent role-specific decision updates returned."}
                </p>
              )}
              <p className="mt-1 text-[11px] text-ink-3">Read-only snapshot. Check the Devnet desk for current request status and receipts before acting.</p>
            </div>
            <div className="mt-3">
              <Link href="/worlds-fair/desk?case=family" className={linkClass}>
                Resume Family workspace <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </>
        ) : view.kind === "no-workspace" ? (
          <>
            <p className="text-[13px] font-semibold text-navy-strong">No Family workspace saved on this browser.</p>
            {audience === "parent" ? (
              <>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-2">Create a new Family mandate, then privately share each person&apos;s role link. Setup uses separate role credentials and Devnet demo tokens.</p>
                <Link href="/worlds-fair/desk?case=family" className={`${linkClass} mt-3`}>
                  Set up Family mandate <ArrowRight aria-hidden className="size-4" />
                </Link>
              </>
            ) : (
              <p className="mt-1 text-[12px] leading-relaxed text-ink-2">Ask your parent to create the Family mandate and privately share the Teen role link. You do not need parent authority to keep learning here.</p>
            )}
          </>
        ) : view.kind === "other-context" ? (
          <>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-strong"><ShieldAlert aria-hidden className="size-4" /> Another workspace is saved here.</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">This browser holds a Delegated Capital workspace, not a Family workspace. Opening the Family desk would reuse that workspace. Keep its private role links safe and use a separate browser profile for Family until workspace switching is supported.</p>
          </>
        ) : view.kind === "shared-device-risk" ? (
          <>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-navy-strong"><ShieldAlert aria-hidden className="size-4" /> Parent permissions are saved on this device.</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">Do not open a Teen workspace on a browser that can also approve as Parent. Use the Teen-only role link in a separate browser profile or device.</p>
          </>
        ) : view.kind === "missing-role" ? (
          <>
            <p className="text-[13px] font-semibold text-navy-strong">This browser does not have the {audience === "parent" ? "Parent" : "Teen"} role.</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">Ask the workspace owner to share the appropriate private role link. A Family demo sign-in does not grant Solana spending or approval authority.</p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-semibold text-navy-strong">Family workspace could not be verified.</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">This could be a network problem or a missing role permission. No on-chain connection or access is claimed. Check again when the API is available.</p>
          </>
        )}
      </div>
      {view.kind !== "checking" ? <div className="mt-3">{refresh}</div> : null}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        Solana Devnet only · demo assets · no brokerage, custody or real-money transfers. Learning does not authorize a trade.
      </p>
    </section>
  );
}
