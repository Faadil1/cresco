"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  History,
  KeyRound,
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";

import { Wordmark } from "@/components/shell";
import {
  devUsdc,
  loadKeychain,
  newIdempotencyKey,
  parseShareFragment,
  saveKeychain,
  shareLink,
  toBase,
  usd,
  workflowApi,
  WorkflowApiError,
  type CreatedWorkspace,
  type DeskKeychain,
  type ExceptionRequest,
  type IntentResult,
  type MandateView,
  type WorkflowEvent,
  type WorkflowRole,
  type Workspace,
} from "@/services/worlds-fair-workflow";

type Tab = WorkflowRole | "history" | "api";

const ROLE_COPY: Record<WorkflowRole, { title: string; blurb: string }> = {
  operator: { title: "Operator", blurb: "The delegated strategy. Acts alone inside the standing mandate." },
  principal: { title: "Principal", blurb: "The allocator. Grants exact one-use exceptions and owns the mandate." },
  risk: { title: "Risk owner", blurb: "Watches period consumption, tunes asset limits, can decide exceptions." },
};

const STATUS_TONE: Record<string, string> = {
  PENDING: "border-yellow/40 bg-yellow-soft text-orange-text",
  EXECUTING: "border-blue/25 bg-blue-soft text-blue",
  EXECUTED: "border-green/25 bg-green-soft text-green-strong",
  REFUSED_BY_PRINCIPAL: "border-loss/20 bg-loss-soft text-loss-text",
  REFUSED_BY_PROGRAM: "border-loss/20 bg-loss-soft text-loss-text",
  STALE: "border-line bg-surface-soft text-ink-2",
  EXPIRED: "border-line bg-surface-soft text-ink-2",
  NOT_REQUIRED: "border-line bg-surface-soft text-ink-2",
  ROLLED_BACK: "border-lavender/30 bg-lavender-soft text-navy",
  NOT_EXECUTED: "border-lavender/30 bg-lavender-soft text-navy",
  UNKNOWN: "border-loss/30 bg-loss-soft text-loss-text",
};

function short(value: string | null | undefined, head = 6, tail = 5) {
  if (!value) return "n/a";
  return value.length <= head + tail + 3 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function errorText(error: unknown) {
  if (error instanceof WorkflowApiError) {
    if (error.code === "BUSY") return "Another write is in progress on this mandate. Wait a few seconds and retry.";
    return `${error.message} (${error.code})`;
  }
  return error instanceof Error ? error.message : String(error);
}

type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
};

function solanaProvider(): SolanaProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { phantom?: { solana?: SolanaProvider }; solana?: SolanaProvider };
  return w.phantom?.solana ?? w.solana ?? null;
}

async function signWithWallet(message: string) {
  const provider = solanaProvider();
  if (!provider) throw new Error("No Solana wallet found in this browser (Phantom, Solflare or Backpack).");
  const connected = await provider.connect();
  const { signature } = await provider.signMessage(new TextEncoder().encode(message), "utf8");
  let binary = "";
  signature.forEach((b) => (binary += String.fromCharCode(b)));
  return { publicKey: connected.publicKey.toString(), signature: btoa(binary) };
}

function Pill({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${tone}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[26px] border border-line bg-white p-5 shadow-soft md:p-6 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-3">{children}</p>;
}

function Bar({ pct, label }: { pct: number | null; label: string }) {
  const value = Math.min(Math.max(pct ?? 0, 0), 100);
  const tone = value >= 90 ? "bg-loss" : value >= 70 ? "bg-orange" : "bg-blue";
  return (
    <div>
      <div className="flex justify-between text-[12px] font-bold text-ink-2">
        <span>{label}</span>
        <span className="tabular">{pct == null ? "n/a" : `${value}%`}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Signatures({ event }: { event: Pick<WorkflowEvent, "signatures"> }) {
  if (!event.signatures?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {event.signatures.map((s) => (
        <a key={s.signature} href={s.explorer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-extrabold text-blue hover:border-blue/40">
          {s.label} <ExternalLink className="size-3" />
        </a>
      ))}
    </div>
  );
}

function RequestCard({ req, children }: { req: ExceptionRequest; children?: React.ReactNode }) {
  return (
    <article className="rounded-[20px] border border-line p-4" data-testid={`request-${req.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[12px] font-bold text-navy">{req.id}</p>
        <Pill tone={STATUS_TONE[req.status] ?? STATUS_TONE.STALE}>{req.status.replaceAll("_", " ")}</Pill>
      </div>
      <p className="mt-2 text-[15px] font-black text-navy-strong">
        Swap {devUsdc(req.intent.inputAmount)} → devUSDT · max slippage {req.intent.maxSlippageBps} bps
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] font-bold">
        <div className="rounded-[14px] bg-loss-soft p-3 text-loss-text">
          Requested {usd(req.requestedNotionalMicroUsd)}
        </div>
        <div className="rounded-[14px] bg-surface-soft p-3 text-ink-2">
          Standing limit {usd(req.standingMaxNotionalMicroUsd)}
        </div>
      </div>
      <p className="mt-2 text-[12px] font-semibold text-ink-2">
        Policy Diff: {(req.policyDiff?.violatedDimensions ?? []).join(", ") || "n/a"} · refusal proven by {req.refusal?.evidence === "PROGRAM_PREFLIGHT_SIMULATION" ? "the CRESCO program (preflight)" : req.refusal?.evidence ?? "n/a"} · mandate nonce {req.mandateNonce}
      </p>
      {req.status === "PENDING" ? (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-orange-text">
          <Clock className="size-3" /> Expires at {new Date(req.expiresAt).toLocaleTimeString()}
        </p>
      ) : null}
      {req.execution ? (
        <p className="mt-2 text-[12px] font-bold text-green-strong">
          Executed once · allowance consumed: {String(req.execution.allowanceConsumed)} · standing authority changed: {String(req.execution.standingAuthorityChanged)}
        </p>
      ) : null}
      {req.grant?.signature || req.execution?.signature ? (
        <Signatures
          event={{
            signatures: [
              ...(req.grant?.signature ? [{ label: "grant", signature: req.grant.signature, explorer: `https://explorer.solana.com/tx/${req.grant.signature}?cluster=devnet` }] : []),
              ...(req.execution?.signature ? [{ label: "execution", signature: req.execution.signature, explorer: `https://explorer.solana.com/tx/${req.execution.signature}?cluster=devnet` }] : []),
            ],
          }}
        />
      ) : null}
      {req.staleReason ? <p className="mt-2 text-[12px] font-semibold text-ink-2">Stale: {req.staleReason}</p> : null}
      {children}
    </article>
  );
}

function IntentOutcome({ result }: { result: IntentResult }) {
  if (result.decision === "ALLOW") {
    return (
      <div role="status" className="mt-4 rounded-[18px] border border-green/25 bg-green-soft p-4 text-green-strong">
        <p className="flex items-center gap-2 font-black"><CheckCircle2 className="size-4" /> ALLOW · executed inside standing authority</p>
        <p className="mt-1 text-[13px] font-semibold">Notional {usd(result.receipt.quote.notionalMicroUsd)} · no principal approval needed{result.idempotentReplay ? " · replayed from idempotency key" : ""}</p>
        <a href={result.receipt.explorer} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] font-extrabold text-blue">Transaction on Explorer <ExternalLink className="size-3" /></a>
      </div>
    );
  }
  if (result.decision === "PENDING_PRINCIPAL") {
    return (
      <div role="status" className="mt-4 rounded-[18px] border border-yellow/40 bg-yellow-soft p-4 text-orange-text">
        <p className="font-black">Outside standing authority · exact exception requested</p>
        <p className="mt-1 text-[13px] font-semibold">The CRESCO program refused it ({result.refusal.code}). Request {result.request.id} is waiting for the principal or risk owner.</p>
      </div>
    );
  }
  if (result.decision === "REFUSE") {
    return (
      <div role="status" className="mt-4 rounded-[18px] border border-loss/20 bg-loss-soft p-4 text-loss-text">
        <p className="font-black">REFUSE · {result.boundary} boundary ({result.code})</p>
        <p className="mt-1 text-[13px] font-semibold">No exception path exists for this refusal.</p>
      </div>
    );
  }
  return (
    <div role="alert" className="mt-4 rounded-[18px] border border-loss/30 bg-loss-soft p-4 text-loss-text">
      <p className="font-black">Outcome UNKNOWN</p>
      <p className="mt-1 text-[13px] font-semibold">{result.message}</p>
      <p className="mt-1 text-[12px] font-bold">CRESCO does not show success when confirmation is uncertain. Use “Reconcile” before resubmitting.</p>
    </div>
  );
}

function CreateWorkspace({ onCreated }: { onCreated: (ws: CreatedWorkspace) => void }) {
  const [name, setName] = useState("Delegated trading desk");
  const [principalLabel, setPrincipalLabel] = useState("Allocator");
  const [operatorLabel, setOperatorLabel] = useState("Momentum strategy");
  const [riskLabel, setRiskLabel] = useState("Risk owner");
  const [limit, setLimit] = useState("0.50");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ws = await workflowApi.createWorkspace({
        name,
        principalLabel,
        operatorLabel,
        riskLabel,
        policy: { maxActionNotionalMicroUsd: toBase(limit) },
        ...(webhookUrl ? { webhookUrl } : {}),
      });
      onCreated(ws);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-[14px] border border-line bg-white px-3 py-2.5 text-[14px] font-semibold text-navy-strong focus:border-blue focus:outline-none";
  return (
    <Card>
      <Eyebrow>New workspace</Eyebrow>
      <h2 className="mt-2 text-[26px] font-black tracking-[-0.02em] text-navy-strong">Give a strategy standing authority</h2>
      <p className="mt-2 max-w-[60ch] text-[14px] font-semibold text-ink-2">
        Creates its own Devnet mandate (not the judge lab). You receive one token per role, shown once, to hand to each person.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-[12px] font-black text-ink-2">Desk name<input className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-[12px] font-black text-ink-2">Standing limit per action (USD)
          <input className={input} inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} aria-describedby="limit-help" />
          <span id="limit-help" className="mt-1 block text-[11px] font-semibold text-ink-3">Devnet bounds: 0.05 to 5.00</span>
        </label>
        <label className="text-[12px] font-black text-ink-2">Principal<input className={input} value={principalLabel} onChange={(e) => setPrincipalLabel(e.target.value)} /></label>
        <label className="text-[12px] font-black text-ink-2">Operator (strategy)<input className={input} value={operatorLabel} onChange={(e) => setOperatorLabel(e.target.value)} /></label>
        <label className="text-[12px] font-black text-ink-2">Risk owner<input className={input} value={riskLabel} onChange={(e) => setRiskLabel(e.target.value)} /></label>
        <label className="text-[12px] font-black text-ink-2">Webhook for exception requests (optional, https)<input className={input} value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.example.com/cresco" /></label>
        <div className="md:col-span-2">
          <button type="submit" disabled={busy} className="flex min-h-12 items-center gap-2 rounded-[16px] bg-blue px-5 text-[14px] font-black text-white shadow-button hover:bg-blue-strong disabled:opacity-60">
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Create workspace
          </button>
          {error ? <p role="alert" className="mt-3 text-[13px] font-bold text-loss-text">{error}</p> : null}
        </div>
      </form>
    </Card>
  );
}

function TokenHandoff({ ws, onDone }: { ws: CreatedWorkspace; onDone: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <Card className="border-blue/30">
      <Eyebrow>Role links · shown once</Eyebrow>
      <h2 className="mt-2 text-[22px] font-black text-navy-strong">Hand each role its own link</h2>
      <p className="mt-1 text-[13px] font-semibold text-ink-2">{ws.tokenNotice} This browser keeps all three so you can try every role.</p>
      <div className="mt-4 grid gap-3">
        {(["operator", "principal", "risk"] as WorkflowRole[]).map((role) => {
          const link = shareLink(origin, ws.id, role, ws.tokens[role]);
          return (
            <div key={role} className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-line p-3">
              <div>
                <p className="text-[13px] font-black text-navy-strong">{ROLE_COPY[role].title}</p>
                <p className="font-mono text-[11px] text-ink-3">{short(link, 38, 10)}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    setCopied(role);
                  } catch {
                    setCopied(null);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[12px] font-extrabold text-blue"
              >
                {copied === role ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied === role ? "Copied" : "Copy link"}
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={onDone} className="mt-4 inline-flex items-center gap-1 text-[13px] font-black text-blue">
        Continue to the desk <ArrowRight className="size-4" />
      </button>
    </Card>
  );
}

async function loadDesk(id: string) {
  const ws = await workflowApi.getWorkspace(id);
  const [requests, events] = await Promise.all([workflowApi.listRequests(id), workflowApi.history(id, 60)]);
  let mandate: MandateView | null = null;
  if (ws.chain.status === "READY") {
    try {
      mandate = await workflowApi.mandate(id);
    } catch {
      mandate = null; // chain read can fail transiently; the desk still renders product state
    }
  }
  return { ws, requests, events, mandate };
}

export default function WorldFairDeskPage() {
  const [keychain, setKeychain] = useState<DeskKeychain>({ workspaceId: null, tokens: {} });
  const [handoff, setHandoff] = useState<CreatedWorkspace | null>(null);
  const [ws, setWs] = useState<Workspace | null>(null);
  const [mandate, setMandate] = useState<MandateView | null>(null);
  const [requests, setRequests] = useState<ExceptionRequest[]>([]);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [tab, setTab] = useState<Tab>("operator");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [amount, setAmount] = useState("0.20");
  const [slippage, setSlippage] = useState("100");
  const [note, setNote] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [ruleAction, setRuleAction] = useState("");
  const [rulePeriod, setRulePeriod] = useState("");
  const idemRef = useRef<string>(newIdempotencyKey());

  useEffect(() => {
    void Promise.resolve().then(() => {
    const stored = loadKeychain();
    const shared = typeof window !== "undefined" ? parseShareFragment(window.location.hash) : null;
    if (shared) {
      const next: DeskKeychain = {
        workspaceId: shared.workspaceId,
        tokens: stored.workspaceId === shared.workspaceId ? { ...stored.tokens, [shared.role]: shared.token } : { [shared.role]: shared.token },
      };
      saveKeychain(next);
      setKeychain(next);
      setTab(shared.role);
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setKeychain(stored);
      const first = (["operator", "principal", "risk"] as WorkflowRole[]).find((r) => stored.tokens[r]);
      if (first) setTab(first);
    }
    });
  }, []);

  const id = keychain.workspaceId;
  const roles = useMemo(() => (["operator", "principal", "risk"] as WorkflowRole[]).filter((r) => keychain.tokens[r]), [keychain]);
  const token = (role: WorkflowRole) => keychain.tokens[role] ?? null;

  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void loadDesk(id)
      .then((data) => {
        if (cancelled) return;
        setWs(data.ws);
        setRequests(data.requests);
        setEvents(data.events);
        setMandate(data.mandate);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  // CAP-11: approvers are notified of pending exception requests while the desk is open.
  useEffect(() => {
    const approverToken = keychain.tokens.principal ?? keychain.tokens.risk;
    if (!id || !approverToken) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const view = await workflowApi.notifications(id, approverToken);
        if (!cancelled) setPendingCount(view.pendingDecisions);
      } catch {
        /* notification polling is UX only */
      }
    };
    void tick();
    const timer = setInterval(tick, 10_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id, keychain]);

  async function run(label: string, fn: () => Promise<unknown>) {
    setActionBusy(label);
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(errorText(err));
    } finally {
      setActionBusy(null);
      refresh();
    }
  }

  function onCreated(created: CreatedWorkspace) {
    const next = { workspaceId: created.id, tokens: created.tokens };
    saveKeychain(next);
    setKeychain(next);
    setHandoff(created);
    setTab("principal");
  }

  async function submitIntent(e: React.FormEvent) {
    e.preventDefault();
    const t = token("operator");
    if (!id || !t) return;
    await run("intent", async () => {
      const res = await workflowApi.submitIntent(id, t, { inputAmount: toBase(amount), maxSlippageBps: Number(slippage) }, idemRef.current);
      setIntentResult(res.body);
      idemRef.current = newIdempotencyKey();
    });
  }

  async function decide(req: ExceptionRequest, decision: "APPROVE" | "REFUSE", role: WorkflowRole) {
    const t = token(role);
    if (!id || !t) return;
    await run(`decide-${req.id}`, async () => {
      if (decision === "APPROVE" && role === "principal" && ws?.roles.principal.wallet) {
        const issuedAt = new Date().toISOString();
        const { message } = await workflowApi.approvalMessage(id, req.id, issuedAt);
        const signed = await signWithWallet(message);
        if (signed.publicKey !== ws.roles.principal.wallet) throw new Error(`Connect the bound wallet ${short(ws.roles.principal.wallet)} to approve.`);
        await workflowApi.decide(id, req.id, t, { decision, note: note || undefined, issuedAt, walletSignature: signed.signature });
      } else {
        await workflowApi.decide(id, req.id, t, { decision, note: note || undefined });
      }
      setNote("");
    });
  }

  async function bindWallet() {
    const t = token("principal");
    if (!id || !t) return;
    await run("wallet", async () => {
      const issuedAt = new Date().toISOString();
      const { message } = await workflowApi.walletMessage(id, issuedAt);
      const signed = await signWithWallet(message);
      await workflowApi.bindWallet(id, t, { publicKey: signed.publicKey, signature: signed.signature, issuedAt });
    });
  }

  const pending = requests.filter((r) => r.status === "PENDING");
  const mandateStatus = mandate?.mandate?.status ?? (ws?.chain.status === "REVOKED" ? "REVOKED" : null);
  const notReady = Boolean(ws && ws.chain.status !== "READY");

  return (
    <main className="relative min-h-screen bg-bg">
      <div className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-6 md:px-10 md:pt-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark size="md" />
          <nav className="flex gap-2">
            <Link href="/worlds-fair" className="rounded-full border border-line bg-white/90 px-4 py-2 text-[13px] font-extrabold text-navy shadow-soft hover:border-blue/35">Judge lab (7/7)</Link>
            {id ? (
              <button type="button" onClick={() => { saveKeychain({ workspaceId: null, tokens: {} }); setKeychain({ workspaceId: null, tokens: {} }); setWs(null); setMandate(null); setRequests([]); setEvents([]); }} className="rounded-full border border-line bg-white/90 px-4 py-2 text-[13px] font-extrabold text-navy shadow-soft">
                Leave workspace
              </button>
            ) : null}
          </nav>
        </header>

        <section className="mt-10">
          <p className="text-[12px] font-black uppercase tracking-[0.13em] text-blue">World’s Fair · delegated capital desk</p>
          <h1 className="mt-3 max-w-[22ch] text-[40px] font-black leading-[1.02] tracking-[-0.04em] text-navy-strong md:text-[54px]">
            The strategy acts. The principal decides the exceptions.
          </h1>
          <p className="mt-4 max-w-[70ch] text-[16px] font-semibold leading-relaxed text-ink-2">
            Real Orca swaps on Solana Devnet inside a standing on-chain mandate. Outside it, the CRESCO program refuses and the
            request goes to a person who can grant one exact exception, without widening the mandate.
          </p>
        </section>

        <div className="mt-8 grid gap-6">
          {!id ? <CreateWorkspace onCreated={onCreated} /> : null}
          {handoff ? <TokenHandoff ws={handoff} onDone={() => setHandoff(null)} /> : null}
          {loadError ? <p role="alert" className="rounded-[16px] border border-loss/25 bg-loss-soft p-4 text-[13px] font-bold text-loss-text">{loadError}</p> : null}

          {ws ? (
            <>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Eyebrow>Workspace {ws.id}</Eyebrow>
                    <h2 className="mt-1 text-[26px] font-black text-navy-strong">{ws.name}</h2>
                    <p className="mt-1 text-[13px] font-semibold text-ink-2">
                      {ws.roles.operator.label} · {ws.roles.principal.label} · {ws.roles.risk.label}
                      {ws.roles.principal.wallet ? ` · principal wallet ${short(ws.roles.principal.wallet)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {mandateStatus ? (
                      <Pill tone={mandateStatus === "ACTIVE" ? STATUS_TONE.EXECUTED : mandateStatus === "PAUSED" ? STATUS_TONE.PENDING : STATUS_TONE.UNKNOWN}>Mandate {mandateStatus}</Pill>
                    ) : (
                      <Pill tone={STATUS_TONE.STALE}>{ws.chain.status.replaceAll("_", " ")}</Pill>
                    )}
                    {mandate?.mandate ? <Pill tone="border-line bg-surface-soft text-navy">nonce {mandate.mandate.nonce}</Pill> : null}
                    {ws.chain.accounts?.mandate ? (
                      <a href={`https://explorer.solana.com/address/${ws.chain.accounts.mandate}?cluster=devnet`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[12px] font-extrabold text-blue">
                        Mandate account <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                    <button type="button" onClick={refresh} aria-label="Refresh" className="grid size-8 place-items-center rounded-full border border-line text-navy"><RefreshCw className="size-4" /></button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] bg-surface-soft p-4"><Eyebrow>Standing limit / action</Eyebrow><p className="mt-1 text-[22px] font-black tabular text-navy-strong">{usd(mandate?.mandate?.maxActionNotionalMicroUsd ?? ws.policy.maxActionNotionalMicroUsd)}</p></div>
                  <div className="rounded-[18px] bg-surface-soft p-4"><Eyebrow>Period notional cap</Eyebrow><p className="mt-1 text-[22px] font-black tabular text-navy-strong">{usd(mandate?.mandate?.maxPeriodNotionalMicroUsd ?? ws.policy.maxPeriodNotionalMicroUsd)}</p></div>
                  <div className="rounded-[18px] bg-surface-soft p-4"><Eyebrow>Pending exceptions</Eyebrow><p className="mt-1 text-[22px] font-black tabular text-navy-strong">{pending.length}</p></div>
                </div>
                {notReady && token("principal") && ws.chain.status === "NOT_BOOTSTRAPPED" ? (
                  <div className="mt-4 rounded-[18px] border border-blue/25 bg-blue-soft p-4">
                    <p className="text-[14px] font-black text-navy-strong">Create the mandate on Devnet</p>
                    <p className="mt-1 text-[13px] font-semibold text-ink-2">Charter, mandate, asset rule, trade vaults and funding. Several transactions; safe to retry.</p>
                    <button type="button" disabled={actionBusy === "bootstrap"} onClick={() => run("bootstrap", () => workflowApi.bootstrap(ws.id, token("principal")!))} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-blue px-4 text-[13px] font-black text-white disabled:opacity-60">
                      {actionBusy === "bootstrap" ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Bootstrap mandate
                    </button>
                  </div>
                ) : null}
                {actionError ? <p role="alert" className="mt-4 rounded-[14px] border border-loss/25 bg-loss-soft p-3 text-[13px] font-bold text-loss-text">{actionError}</p> : null}
              </Card>

              <div role="tablist" aria-label="Desk views" className="flex flex-wrap gap-2">
                {([...roles, "history", "api"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-black ${tab === t ? "border-blue bg-blue text-white" : "border-line bg-white text-navy"}`}
                  >
                    {t === "history" ? <History className="size-4" /> : t === "api" ? <SlidersHorizontal className="size-4" /> : null}
                    {t === "history" ? "History" : t === "api" ? "API" : ROLE_COPY[t].title}
                    {(t === "principal" || t === "risk") && pendingCount > 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-orange px-1.5 text-[11px] text-white"><Bell className="size-3" />{pendingCount}</span>
                    ) : null}
                  </button>
                ))}
              </div>

              {tab === "operator" && token("operator") ? (
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <Card>
                    <Eyebrow>{ROLE_COPY.operator.title}</Eyebrow>
                    <p className="mt-1 text-[13px] font-semibold text-ink-2">{ROLE_COPY.operator.blurb}</p>
                    <form onSubmit={submitIntent} className="mt-4 grid gap-3">
                      <label className="text-[12px] font-black text-ink-2">Swap amount (devUSDC → devUSDT)
                        <input className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[15px] font-bold text-navy-strong" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      </label>
                      <label className="text-[12px] font-black text-ink-2">Max slippage (bps, 1–300)
                        <input className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[15px] font-bold text-navy-strong" inputMode="numeric" value={slippage} onChange={(e) => setSlippage(e.target.value)} />
                      </label>
                      <button type="submit" disabled={actionBusy === "intent" || notReady || mandateStatus === "REVOKED"} className="flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-blue px-5 text-[14px] font-black text-white shadow-button disabled:opacity-60">
                        {actionBusy === "intent" ? <><LoaderCircle className="size-4 animate-spin" /> Executing on Devnet…</> : <>Submit intent <ArrowRight className="size-4" /></>}
                      </button>
                      <p className="text-[11px] font-bold text-ink-3">Each submit carries an idempotency key: a network retry cannot execute twice.</p>
                    </form>
                    {intentResult ? <IntentOutcome result={intentResult} /> : null}
                  </Card>
                  <Card>
                    <Eyebrow>My exception requests</Eyebrow>
                    <div className="mt-3 grid gap-3">
                      {requests.length ? requests.slice(0, 8).map((r) => <RequestCard key={r.id} req={r} />) : <p className="text-[13px] font-semibold text-ink-2">No requests yet. Submit an amount above the standing limit to create one.</p>}
                    </div>
                  </Card>
                </div>
              ) : null}

              {(tab === "principal" || tab === "risk") && token(tab) ? (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <Card>
                    <Eyebrow>{ROLE_COPY[tab].title} · decisions</Eyebrow>
                    <p className="mt-1 text-[13px] font-semibold text-ink-2">{ROLE_COPY[tab].blurb}</p>
                    <label className="mt-4 block text-[12px] font-black text-ink-2">Decision note (optional)
                      <input className="mt-1 w-full rounded-[14px] border border-line px-3 py-2 text-[14px] font-semibold" value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} />
                    </label>
                    <div className="mt-4 grid gap-3">
                      {pending.length ? pending.map((r) => (
                        <RequestCard key={r.id} req={r}>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => decide(r, "APPROVE", tab)} className="inline-flex min-h-10 items-center gap-1.5 rounded-[13px] bg-green px-4 text-[13px] font-black text-white disabled:opacity-60">
                              {actionBusy === `decide-${r.id}` ? <LoaderCircle className="size-4 animate-spin" /> : tab === "principal" && ws.roles.principal.wallet ? <Wallet className="size-4" /> : <Check className="size-4" />}
                              Approve exactly once
                            </button>
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => decide(r, "REFUSE", tab)} className="inline-flex min-h-10 items-center gap-1.5 rounded-[13px] border border-loss/30 bg-white px-4 text-[13px] font-black text-loss-text disabled:opacity-60">
                              <X className="size-4" /> Refuse
                            </button>
                          </div>
                        </RequestCard>
                      )) : <p className="text-[13px] font-semibold text-ink-2">Nothing waiting. Exception requests appear here as soon as the operator crosses the standing limit.</p>}
                    </div>
                    {requests.some((r) => r.status !== "PENDING") ? (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-[13px] font-black text-navy">Decided requests</summary>
                        <div className="mt-3 grid gap-3">{requests.filter((r) => r.status !== "PENDING").slice(0, 10).map((r) => <RequestCard key={r.id} req={r} />)}</div>
                      </details>
                    ) : null}
                  </Card>

                  <div className="grid gap-6">
                    <Card>
                      <Eyebrow>Period consumption</Eyebrow>
                      {mandate?.consumption ? (
                        <div className="mt-3 grid gap-3">
                          <Bar pct={mandate.consumption.notionalUsedPct} label={`Notional ${usd(mandate.consumption.spentNotionalMicroUsd)} / ${usd(mandate.consumption.maxPeriodNotionalMicroUsd)}`} />
                          <Bar pct={mandate.consumption.amountUsedPct} label={`Amount ${devUsdc(mandate.consumption.spentAmount)} / ${devUsdc(mandate.consumption.maxPeriodAmount)}`} />
                          <p className="text-[11px] font-bold text-ink-3">Period ends {mandate.consumption.periodEndsAt ? new Date(mandate.consumption.periodEndsAt).toLocaleString() : "n/a"} · read from chain {new Date(mandate.observedAt).toLocaleTimeString()}</p>
                        </div>
                      ) : <p className="mt-2 text-[13px] font-semibold text-ink-2">Available once the mandate is live.</p>}
                      <form
                        className="mt-4 grid grid-cols-2 gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void run("rule", () => workflowApi.updateAssetRule(ws.id, token(tab)!, { ...(ruleAction ? { maxActionAmount: toBase(ruleAction) } : {}), ...(rulePeriod ? { maxPeriodAmount: toBase(rulePeriod) } : {}) }));
                        }}
                      >
                        <label className="text-[11px] font-black text-ink-2">Max / action (devUSDC)<input className="mt-1 w-full rounded-[12px] border border-line px-2 py-2 text-[13px] font-bold" value={ruleAction} onChange={(e) => setRuleAction(e.target.value)} placeholder={String((mandate?.assetRule?.maxActionAmount ?? ws.policy.maxActionAmount) / 1e6)} /></label>
                        <label className="text-[11px] font-black text-ink-2">Max / period (devUSDC)<input className="mt-1 w-full rounded-[12px] border border-line px-2 py-2 text-[13px] font-bold" value={rulePeriod} onChange={(e) => setRulePeriod(e.target.value)} placeholder={String((mandate?.assetRule?.maxPeriodAmount ?? ws.policy.maxPeriodAmount) / 1e6)} /></label>
                        <button type="submit" disabled={Boolean(actionBusy) || notReady} className="col-span-2 rounded-[12px] border border-line px-3 py-2 text-[12px] font-black text-navy disabled:opacity-60">Update asset rule (resets period counters)</button>
                      </form>
                    </Card>

                    {tab === "principal" ? (
                      <Card>
                        <Eyebrow>Mandate lifecycle</Eyebrow>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {mandateStatus === "ACTIVE" ? (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => run("pause", () => workflowApi.setStatus(ws.id, token("principal")!, "PAUSED"))} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-black text-navy"><Pause className="size-4" /> Pause</button>
                          ) : null}
                          {mandateStatus === "PAUSED" ? (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => run("resume", () => workflowApi.setStatus(ws.id, token("principal")!, "ACTIVE"))} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-black text-navy"><Play className="size-4" /> Resume</button>
                          ) : null}
                          {mandateStatus && mandateStatus !== "REVOKED" ? (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => { if (window.confirm("Revoke permanently? This mandate can never be reactivated.")) void run("revoke", () => workflowApi.setStatus(ws.id, token("principal")!, "REVOKED", "REVOKE")); }} className="inline-flex items-center gap-1.5 rounded-[12px] border border-loss/30 px-3 py-2 text-[12px] font-black text-loss-text"><AlertTriangle className="size-4" /> Revoke</button>
                          ) : null}
                          <button type="button" disabled={Boolean(actionBusy) || notReady} onClick={() => run("topup", () => workflowApi.topUpVault(ws.id, token("principal")!))} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-black text-navy">Top up Devnet vault</button>
                        </div>
                        <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (newLimit) void run("policy", () => workflowApi.revisePolicy(ws.id, token("principal")!, { maxActionNotionalMicroUsd: toBase(newLimit) })); }}>
                          <label className="text-[11px] font-black text-ink-2">New standing limit (USD)<input className="mt-1 w-32 rounded-[12px] border border-line px-2 py-2 text-[13px] font-bold" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder={String((mandate?.mandate?.maxActionNotionalMicroUsd ?? ws.policy.maxActionNotionalMicroUsd) / 1e6)} /></label>
                          <button type="submit" disabled={Boolean(actionBusy) || notReady} className="rounded-[12px] bg-navy px-3 py-2 text-[12px] font-black text-white disabled:opacity-60">Revise policy</button>
                        </form>
                        <p className="mt-2 text-[11px] font-bold text-ink-3">Every lifecycle change advances the mandate nonce: pending exceptions become stale automatically.</p>
                        <div className="mt-4 border-t border-line-soft pt-4">
                          {ws.roles.principal.wallet ? (
                            <p className="flex items-center gap-2 text-[12px] font-bold text-green-strong"><Wallet className="size-4" /> Approvals require a signature from {short(ws.roles.principal.wallet)}</p>
                          ) : (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={bindWallet} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-black text-navy"><Wallet className="size-4" /> Bind my wallet for approvals</button>
                          )}
                        </div>
                      </Card>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {tab === "history" ? (
                <Card>
                  <div className="flex items-center justify-between gap-2">
                    <Eyebrow>Durable history · newest first</Eyebrow>
                    {roles[0] ? (
                      <button type="button" disabled={Boolean(actionBusy)} onClick={() => run("reconcile", () => workflowApi.reconcile(ws.id, token(roles[0])!))} className="rounded-full border border-line px-3 py-1.5 text-[12px] font-black text-navy">Reconcile unknown outcomes</button>
                    ) : null}
                  </div>
                  <ol className="mt-4 divide-y divide-line-soft">
                    {events.map((e) => (
                      <li key={e.id} className="py-3">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.08em] text-ink-3">
                          <span>{new Date(e.at).toLocaleString()}</span>
                          <span>·</span>
                          <span>{e.type.replaceAll("_", " ")}</span>
                          <span>·</span>
                          <span>{e.actor}</span>
                        </div>
                        <p className="mt-1 text-[14px] font-bold text-navy-strong">{e.summary}</p>
                        <Signatures event={e} />
                      </li>
                    ))}
                  </ol>
                </Card>
              ) : null}

              {tab === "api" ? (
                <Card>
                  <Eyebrow>Strategy integration</Eyebrow>
                  <p className="mt-2 text-[13px] font-semibold text-ink-2">A strategy integrates with two calls: submit an intent, then read its decision or wait for the principal. Full contract: <code className="font-mono">GET /api/v0.4/worlds-fair/openapi</code>.</p>
                  <pre className="mt-4 overflow-x-auto rounded-[16px] bg-navy-strong p-4 text-[12px] leading-relaxed text-white">{`curl -X POST $CRESCO_API/api/v0.4/worlds-fair/workspaces/${ws.id}/intents \\
  -H "authorization: Bearer $OPERATOR_TOKEN" \\
  -H "idempotency-key: order-$(date +%s)" \\
  -H "content-type: application/json" \\
  -d '{"action":"SWAP_EXACT_IN","inputAmount":200000,"maxSlippageBps":100}'

# 200 ALLOW (executed) · 202 PENDING_PRINCIPAL (Policy Diff + request)
# 200 REFUSE (hard boundary) · 409 BUSY · 503 UNKNOWN (reconcile first)`}</pre>
                  <p className="mt-3 text-[12px] font-bold text-ink-3">Example client: <code className="font-mono">examples/worlds-fair-strategy-client.mjs</code> · Truth boundary: Devnet only, server-held guardian and workspace delegate, no custody or customer claim.</p>
                </Card>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
