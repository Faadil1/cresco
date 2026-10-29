"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import {
  closePracticeSession, createPracticeSession, decidePracticeDiscussion, loadPracticeState,
  requestPracticeDiscussion, rotatePracticeTeenCode, savePracticeCredits, type PracticeCredentials,
  type PracticeInvitation, type PracticeReason, type PracticeSnapshot
} from "@/services/family-practice-client";

const reasons: { value: PracticeReason; label: string }[] = [
  { value: "LEARN_TOGETHER", label: "Let's learn together" },
  { value: "NEEDS_MORE_INFORMATION", label: "We need more information" },
  { value: "NOT_RIGHT_NOW", label: "Not right now" }
];

export function FamilyPracticeLab() {
  const [invitationCode, setInvitationCode] = useState("");
  const [issued, setIssued] = useState<PracticeInvitation | null>(null);
  const [practiceId, setPracticeId] = useState("");
  const [role, setRole] = useState<"teen" | "parent">("teen");
  const [roleCode, setRoleCode] = useState("");
  const [credentials, setCredentials] = useState<PracticeCredentials | null>(null);
  const [snapshot, setSnapshot] = useState<PracticeSnapshot | null>(null);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [reason, setReason] = useState<PracticeReason>("LEARN_TOGETHER");
  const currentCredentials = useRef<PracticeCredentials | null>(null);
  const unknownWriteHold = useRef(false);
  const [mustReview, setMustReview] = useState(false);
  const [eraseConfirmed, setEraseConfirmed] = useState(false);
  const [rotatedTeenCode, setRotatedTeenCode] = useState("");

  const refresh = useCallback(async (c: PracticeCredentials, silent = false) => {
    try {
      const next = await loadPracticeState(c);
      if (next.role !== c.role || next.practiceId !== c.practiceId ||
        next.kind !== "FICTIONAL_CREDITS_ONLY" || next.truthBoundary?.realMoney !== false) {
        throw new Error("PRACTICE_ROLE_OR_TRUTH_UNVERIFIED");
      }
      if (currentCredentials.current?.token !== c.token || currentCredentials.current?.practiceId !== c.practiceId) return;
      setSnapshot((previous) => previous && previous.practiceId === next.practiceId && previous.version > next.version ? previous : next);
      if (unknownWriteHold.current && silent) {
        setVerified(false);
        return; // automatic updates cannot clear an unknown write
      }
      if (!silent && unknownWriteHold.current) {
        unknownWriteHold.current = false;
        setMustReview(false);
      }
      setVerified(true);
      if (!silent) setNotice("Practice data verified. All credits are imaginary.");
    } catch {
      if (currentCredentials.current?.token !== c.token || currentCredentials.current?.practiceId !== c.practiceId) return;
      setVerified(false);
      setNotice("Cannot verify the current practice state. Actions are blocked. Check your access or connection.");
    }
  }, []);

  useEffect(() => {
    if (!credentials) return;
    // Defer the first read: do not synchronously cascade state from the effect body.
    queueMicrotask(() => void refresh(credentials));
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh(credentials, true);
    }, 12000);
    const focus = () => { void refresh(credentials, true); };
    window.addEventListener("focus", focus);
    return () => { clearInterval(interval); window.removeEventListener("focus", focus); };
  }, [credentials, refresh]);

  async function create() {
    setBusy(true);
    setNotice("");
    try {
      const result = await createPracticeSession(invitationCode.trim());
      setIssued(result);
      setPracticeId(result.practiceId);
      setInvitationCode("");
      setNotice("Practice created. Write down the Parent and Teen access codes; they will not be shown again after leaving this page.");
    } catch {
      setNotice("The separate Family practice service is unavailable, or the invitation is invalid. No account was created here.");
    } finally { setBusy(false); }
  }

  async function connect() {
    const c: PracticeCredentials = {
      practiceId: practiceId.trim().toLowerCase(),
      role,
      token: roleCode.trim()
    };
    if (!/^[0-9a-f-]{36}$/.test(c.practiceId) || !/^pr_[a-f0-9]{64}$/.test(c.token)) {
      setNotice("Enter a valid practice ID and the access code for your chosen role.");
      return;
    }
    currentCredentials.current = c;
    setRotatedTeenCode("");
    unknownWriteHold.current = false;
    setMustReview(false);
    setSnapshot(null);
    setVerified(false);
    setCredentials(null);
    setIssued(null);
    setRoleCode("");
    setCredentials(c);
  }

  async function act(fn: (c: PracticeCredentials) => Promise<PracticeSnapshot>) {
    if (!credentials || !verified || busy) return;
    setBusy(true);
    setVerified(false);
    setNotice("Checking the practice result…");
    try {
      const next = await fn(credentials);
      if (next.role !== credentials.role || next.practiceId !== credentials.practiceId ||
        next.kind !== "FICTIONAL_CREDITS_ONLY" || next.truthBoundary.realMoney !== false) {
        throw new Error("INVALID_PRACTICE_RESULT");
      }
      setSnapshot(next);
      unknownWriteHold.current = false;
      setMustReview(false);
      setVerified(true);
      setNotice("Practice action confirmed. No real money or asset changed hands.");
    } catch {
      unknownWriteHold.current = true;
      setMustReview(true);
      setVerified(false);
      setNotice("Action result unverified. Do not retry. Manually refresh and inspect the practice history first.");
    } finally { setBusy(false); }
  }

  async function replaceTeenCode() {
    if (!credentials || credentials.role !== "parent" || !verified || busy) return;
    setBusy(true);
    setVerified(false);
    setRotatedTeenCode("");
    try {
      const response = await rotatePracticeTeenCode(credentials);
      if (!response.rotated || !/^pr_[0-9a-f]{64}$/.test(response.teenToken)) {
        throw new Error("PRACTICE_ROTATION_RESULT_UNVERIFIED");
      }
      setRotatedTeenCode(response.teenToken);
      unknownWriteHold.current = false;
      setMustReview(false);
      setNotice("Teen code replaced. The previous code is invalid. Record the new code privately, then refresh history.");
    } catch {
      unknownWriteHold.current = true;
      setMustReview(true);
      setNotice("Code replacement unverified. The previous Teen code may already be revoked. Manually review the session before trying again.");
    } finally { setBusy(false); }
  }

  async function endResearchPractice() {
    if (!credentials || credentials.role !== "parent" || !eraseConfirmed || busy || !verified) return;
    setBusy(true);
    setVerified(false);
    setNotice("Ending this fictional practice and revoking both role codes…");
    try {
      const result = await closePracticeSession(credentials);
      if (!result.closed || !result.allRoleCodesRevoked || !result.fictionalHistoryCleared) {
        throw new Error("PRACTICE_CLOSURE_UNVERIFIED");
      }
      currentCredentials.current = null;
      unknownWriteHold.current = false;
      setMustReview(false);
      setEraseConfirmed(false);
      setRotatedTeenCode("");
      setSnapshot(null);
      setCredentials(null);
      setNotice("Practice ended. The service confirmed the fictional history was cleared and both role codes revoked.");
    } catch {
      setNotice("Closure could not be confirmed. The practice may still exist. Do not assume access codes are revoked; recheck privately.");
    } finally { setBusy(false); }
  }

  return (
    <section className="mx-auto max-w-[1120px] px-5 pb-20 pt-10 md:px-10" aria-labelledby="practice-lab-title">
      <div className="rounded-[28px] border border-green/20 bg-surface p-5 shadow-soft md:p-8">
        <p className="text-[12px] font-bold uppercase tracking-wider text-green-strong">Invitation-only · Adult research prototype</p>
        <h1 id="practice-lab-title" className="mt-3 font-display text-[clamp(36px,5vw,62px)] leading-tight text-navy-strong">
          Practice together. Keep your own decisions.
        </h1>
        <p className="mt-3 max-w-[70ch] text-[15px] leading-7 text-ink-2">
          Two separate access codes let adults test a Teen view and a Parent view on different devices.
          A young person can set aside <strong>20 fictional credits</strong>, ask to explore a fund,
          and see the adult&apos;s response. Nothing here is a real deposit, wallet, investment,
          verified family relationship or financial permission.
        </p>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-yellow-soft p-4">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-orange-text"/>
          <p className="text-[12px] leading-6 text-navy">
            Research with consenting adults and fictional child identities only.
            Never enter a child&apos;s name, age, financial details, wallet secret or real identity.
            This prototype is not approved for enrollment of actual minors.
          </p>
        </div>
      </div>

      {!credentials ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section aria-label="Create a practice" className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
            <h2 className="text-xl font-bold text-navy-strong">Create a new practice</h2>
            <p className="mt-2 text-[13px] leading-6 text-ink-2">
              For approved adult researchers only. A private invitation code is required.
              This is not an account registration for a child.
            </p>
            <label className="mt-5 block text-[13px] font-bold text-navy-strong" htmlFor="practice-invite">
              Research invitation code
            </label>
            <input id="practice-invite" type="password" autoComplete="off"
              value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-navy-strong"/>
            <button disabled={busy || invitationCode.trim().length < 16} type="button" onClick={() => void create()}
              className="mt-4 min-h-12 rounded-full bg-green-strong px-5 py-3 text-[13px] font-bold text-white disabled:opacity-50">
              Create fictional-credit practice
            </button>
            {issued && (
              <div data-testid="practice-issued-credentials" className="mt-5 rounded-xl border border-green/30 bg-green-soft p-4">
                <p className="text-[13px] font-bold text-green-strong">Save these separately. They appear only once.</p>
                <p className="mt-3 break-all text-[12px] text-navy-strong">Practice ID: <code>{issued.practiceId}</code></p>
                <p className="mt-2 break-all text-[12px] text-navy-strong">Parent code: <code>{issued.parentToken}</code></p>
                <p className="mt-2 break-all text-[12px] text-navy-strong">Teen role code: <code>{issued.teenToken}</code></p>
                <p className="mt-3 text-[11px] leading-5 text-ink-2">Do not put access codes in a URL, screenshots, public posts or messages to children. The prototype expires after 7 days.</p>
              </div>
            )}
          </section>

          <section aria-label="Open a practice role" className="rounded-[24px] border border-line bg-surface p-5 md:p-6">
            <h2 className="text-xl font-bold text-navy-strong">Open your role</h2>
            <p className="mt-2 text-[13px] leading-6 text-ink-2">
              Enter the practice ID and only the code assigned to this device. Parent and Teen views have different server permissions.
            </p>
            <fieldset className="mt-5">
              <legend className="text-[13px] font-bold text-navy-strong">Which view?</legend>
              <div className="mt-2 flex gap-2">
                {(["teen", "parent"] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={role === value}
                    onClick={() => setRole(value)}
                    className={`min-h-11 rounded-xl border px-5 py-2 text-[13px] font-bold ${role === value ? "border-green-strong bg-green-soft text-green-strong" : "border-line bg-surface-soft text-navy-strong"}`}>
                    {value === "teen" ? "Teen" : "Parent"}
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="practice-id" className="mt-4 block text-[13px] font-bold text-navy-strong">Practice ID</label>
            <input id="practice-id" value={practiceId} onChange={(e) => setPracticeId(e.target.value)}
              autoComplete="off" className="mt-2 w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-navy-strong"/>
            <label htmlFor="practice-role-code" className="mt-4 block text-[13px] font-bold text-navy-strong">
              {role === "teen" ? "Teen" : "Parent"} access code
            </label>
            <input id="practice-role-code" type="password" autoComplete="off" value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-navy-strong"/>
            <button type="button" onClick={() => void connect()} disabled={busy}
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy-strong px-5 py-3 text-[13px] font-bold text-white disabled:opacity-50">
              Open practice role <ArrowRight aria-hidden className="size-4"/>
            </button>
          </section>
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] border border-line bg-surface p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-green-strong">{credentials.role} · Imaginary credits only</p>
              <h2 className="mt-2 font-display text-[31px] text-navy-strong">
                {credentials.role === "teen" ? "My practice decisions" : "Practice guidance and requests"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void refresh(credentials)} disabled={busy}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 py-2 text-[12px] font-bold text-navy-strong disabled:opacity-50">
                <RefreshCw aria-hidden className="size-4"/> Refresh history
              </button>
              <button type="button" onClick={() => {
                currentCredentials.current = null;
                setRotatedTeenCode("");
                unknownWriteHold.current = false;
                setMustReview(false);
                setCredentials(null); setSnapshot(null); setVerified(false);
                setNotice("Role access closed in this tab. Nothing was deleted from the separate practice service.");
              }} className="min-h-11 rounded-full border border-line px-4 py-2 text-[12px] font-bold text-navy-strong">
                Leave role
              </button>
            </div>
          </div>
          <p role="status" aria-live="polite" className="mt-4 rounded-xl bg-surface-soft p-3 text-[13px] leading-6 text-navy-strong">{notice || "Verifying your practice…"}</p>
          {!verified && <p className="mt-2 text-[12px] font-bold text-loss-text">Unverified or offline: all actions are blocked.</p>}
          {mustReview && <p role="alert" className="mt-2 text-[12px] font-bold text-loss-text">
            A previous action may have completed. Background updates cannot unlock further actions.
            Inspect the history and press Refresh history before trying anything else.
          </p>}
          {snapshot && (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-green-soft p-4">
                  <p className="text-[12px] font-semibold text-ink-2">Imaginary credits available</p>
                  <p data-testid="practice-server-available" className="mt-1 font-display text-[38px] text-navy-strong">{snapshot.availableCredits}</p>
                </div>
                <div className="rounded-xl bg-surface-soft p-4">
                  <p className="text-[12px] font-semibold text-ink-2">Set aside in practice</p>
                  <p data-testid="practice-server-saved" className="mt-1 font-display text-[38px] text-navy-strong">{snapshot.savedCredits}</p>
                </div>
                <div className="rounded-xl bg-surface-soft p-4">
                  <p className="text-[12px] font-semibold text-ink-2">Practice history version</p>
                  <p className="mt-1 font-display text-[38px] text-navy-strong">{snapshot.version}</p>
                </div>
              </div>
              {credentials.role === "teen" && (
                <div className="mt-5 rounded-xl border border-green/20 p-4">
                  <h3 className="flex items-center gap-2 text-[16px] font-bold text-navy-strong"><BookOpen aria-hidden className="size-5"/> I can make choices in practice</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" disabled={!verified || busy || snapshot.availableCredits < 20}
                      onClick={() => void act(savePracticeCredits)}
                      className="min-h-12 rounded-full bg-green-strong px-5 py-3 text-[13px] font-bold text-white disabled:opacity-50">
                      Set aside 20 fictional credits
                    </button>
                    <button type="button" disabled={!verified || busy || snapshot.requests.some(r => r.status === "PENDING") || snapshot.requests.length >= 10}
                      onClick={() => void act(requestPracticeDiscussion)}
                      className="min-h-12 rounded-full border border-green/50 px-5 py-3 text-[13px] font-bold text-navy-strong disabled:opacity-50">
                      Ask to explore diversified funds
                    </button>
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-ink-2">Asking is not buying. The adult can approve or decline a discussion, not an actual investment.</p>
                </div>
              )}
              <section className="mt-5 rounded-xl border border-line p-4" aria-label="Practice requests">
                <h3 className="text-[16px] font-bold text-navy-strong">Requests and decisions</h3>
                {!snapshot.requests.length && <p className="mt-2 text-[13px] text-ink-2">No fictional learning requests yet.</p>}
                <div className="mt-3 grid gap-3">
                  {snapshot.requests.slice().reverse().map(req => (
                    <article key={req.id} className="rounded-xl bg-surface-soft p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="text-[13px] font-bold text-navy-strong">Explore diversified funds</p>
                        <span className="text-[12px] font-bold text-green-strong">{req.status.replaceAll("_", " ")}</span>
                      </div>
                      <p className="mt-1 text-[12px] text-ink-2">
                        {req.status === "PENDING" ? "Waiting for the Parent's practice reply." :
                          req.status === "DECLINE" ? "Parent declined the discussion. No purchase happened." :
                            "Parent agreed to discuss the idea. No purchase happened."}
                      </p>
                      {req.reason && <p className="mt-2 text-[12px] font-semibold text-navy-strong">
                        Reason: {reasons.find(r => r.value === req.reason)?.label}
                      </p>}
                      {credentials.role === "parent" && req.status === "PENDING" && (
                        <div className="mt-3">
                          <label htmlFor={`reason-${req.id}`} className="block text-[12px] font-bold text-navy-strong">Reason for your response</label>
                          <select id={`reason-${req.id}`} value={reason}
                            onChange={(e) => setReason(e.target.value as PracticeReason)}
                            className="mt-2 w-full max-w-sm rounded-xl border border-line bg-surface px-3 py-3 text-[13px] text-navy-strong">
                            {reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" disabled={!verified || busy}
                              onClick={() => void act((c) => decidePracticeDiscussion(c, req.id, "APPROVE_DISCUSSION", reason))}
                              className="min-h-11 rounded-full bg-green-strong px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50">
                              Approve discussion only
                            </button>
                            <button type="button" disabled={!verified || busy}
                              onClick={() => void act((c) => decidePracticeDiscussion(c, req.id, "DECLINE", reason))}
                              className="min-h-11 rounded-full border border-line px-4 py-2 text-[12px] font-bold text-navy-strong disabled:opacity-50">
                              Decline
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
              <section className="mt-5 rounded-xl border border-line p-4" aria-label="Practice history">
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-navy-strong"><Clock3 aria-hidden className="size-5"/> What happened in practice?</h3>
                {!snapshot.events.length && <p className="mt-2 text-[13px] text-ink-2">No practice events yet.</p>}
                <ol className="mt-3 grid gap-2">
                  {snapshot.events.slice().reverse().map(ev => (
                    <li key={ev.id} className="flex items-start gap-3 rounded-xl bg-surface-soft p-3 text-[12px] text-ink-2">
                      <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-green-strong"/>
                      <span><strong>{ev.actor === "teen" ? "Teen" : "Parent"}</strong>: {ev.type.replaceAll("_", " ").toLowerCase()} · {ev.credits ? `${ev.credits} imaginary credits · ` : ""}{new Date(ev.at).toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              </section>
              {credentials.role === "parent" && (
                <section className="mt-5 rounded-xl border border-line bg-surface-soft p-4" aria-label="Replace Teen role code">
                  <h3 className="text-[16px] font-bold text-navy-strong">Replace Teen practice code</h3>
                  <p className="mt-2 text-[12px] leading-6 text-ink-2">
                    If the old Teen practice code was shared or lost, replace it.
                    The old code stops working and the new one is displayed only here.
                    This does not verify a real child or parent.
                  </p>
                  <button type="button" disabled={!verified || busy}
                    onClick={() => void replaceTeenCode()}
                    className="mt-3 min-h-11 rounded-full border border-line bg-surface px-4 py-2 text-[12px] font-bold text-navy-strong disabled:opacity-50">
                    Revoke and replace Teen code
                  </button>
                  {rotatedTeenCode && (
                    <p data-testid="rotated-teen-code" className="mt-4 break-all rounded-xl bg-green-soft p-3 text-[12px] leading-6 text-navy-strong">
                      One-time new Teen code: <code>{rotatedTeenCode}</code>.
                      Store it privately and share it only with the adult researcher testing the Teen view.
                      The old code is invalid.
                    </p>
                  )}
                </section>
              )}
              {credentials.role === "parent" && (
                <section className="mt-5 rounded-xl border border-loss/30 bg-loss-soft p-4" aria-label="End research practice">
                  <h3 className="text-[16px] font-bold text-navy-strong">End and erase this practice</h3>
                  <p className="mt-2 text-[12px] leading-6 text-ink-2">
                    This ends the fictional research exercise, erases its server-side practice history
                    and invalidates both role codes. It cannot be undone. This is not a real financial account.
                  </p>
                  <label className="mt-3 flex items-start gap-3 text-[12px] font-semibold text-navy-strong">
                    <input type="checkbox" checked={eraseConfirmed} onChange={(e) => setEraseConfirmed(e.target.checked)}
                      className="mt-1 size-4 shrink-0 accent-red-700"/>
                    I understand that this fictional exercise and both access codes will be permanently closed.
                  </label>
                  <button type="button" disabled={!eraseConfirmed || !verified || busy}
                    onClick={() => void endResearchPractice()}
                    className="mt-3 min-h-11 rounded-full border border-loss/50 bg-surface px-5 py-2 text-[12px] font-bold text-loss-text disabled:opacity-50">
                    End practice and erase history
                  </button>
                </section>
              )}
            </>
          )}
        </div>
      )}
      {!credentials && <p role="status" aria-live="polite" className="mt-5 text-[13px] text-navy-strong">{notice}</p>}
      <p className="mt-5 text-[12px] leading-6 text-ink-2">
        Role codes are kept in this tab&apos;s temporary React state, not in a URL,
        cookie or browser storage. Refreshing the page requires entering your own code again.
        The practice is scheduled for server-side deletion after seven days, or the Parent-role tester can end it earlier. Backups may be retained by the hosting provider. This research
        prototype is not a regulated financial product, verified family account or guardian consent.
      </p>
    </section>
  );
}
