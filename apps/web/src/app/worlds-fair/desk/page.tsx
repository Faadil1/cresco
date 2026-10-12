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
import { StoryVignette } from "@/components/illustrations/family-story";
import { Avatar, EventRow, ExternalChip, GuardianBadge, MandateRail, railPoints } from "./desk-ui";
import {
  devUsdc,
  loadKeychain,
  newIdempotencyKey,
  parseShareFragment,
  saveKeychain,
  setGuardianSigner,
  shareLink,
  toBase,
  usd,
  workflowApi,
  WorkflowApiError,
  type CreatedWorkspace,
  type DeskKeychain,
  type ExceptionRequest,
  type GuardianSignatureRequest,
  type IntentResult,
  type MandateView,
  type WorkflowEvent,
  type WorkflowRole,
  type UseCase,
  type Workspace,
} from "@/services/worlds-fair-workflow";

type Tab = WorkflowRole | "history" | "api";

// One on-chain mechanism, two presentations. Only words change: the CRESCO
// program, the mandate and the exception flow are identical.
const USE_CASES: Record<UseCase, {
  label: string;
  pitch: string;
  roles: Record<WorkflowRole, { title: string; blurb: string }>;
  defaults: { name: string; principal: string; operator: string; risk: string; limit: string };
  formTitle: string;
  operatorField: string;
  amountLabel: string;
}> = {
  family: {
    label: "Family",
    pitch: "A teenager invests on their own inside an allowance. A parent says yes once to an exact request, without changing the rules.",
    roles: {
      operator: { title: "Teen", blurb: "Invests on their own inside the allowance. Anything above it becomes a request to a parent." },
      principal: { title: "Parent", blurb: "Owns the allowance. Says yes once to an exact request, or no, without changing the rules." },
      risk: { title: "Second parent", blurb: "Sees what was spent this period, adjusts the limits, can answer requests too." },
    },
    defaults: { name: "Family desk", principal: "Parent", operator: "Maya (16)", risk: "Second parent", limit: "0.50" },
    formTitle: "Give a teenager an allowance they can use alone",
    operatorField: "Teen",
    amountLabel: "Amount to invest (devUSDC to devUSDT)",
  },
  capital: {
    label: "Delegated capital",
    pitch: "A strategy or AI agent trades on its own inside a standing mandate. The allocator grants one exact exception without widening it.",
    roles: {
      operator: { title: "Operator", blurb: "The delegated strategy or AI agent. Acts alone inside the standing mandate." },
      principal: { title: "Principal", blurb: "The allocator. Grants exact one-use exceptions and owns the mandate." },
      risk: { title: "Risk owner", blurb: "Watches period consumption, tunes asset limits, can decide exceptions." },
    },
    defaults: { name: "Delegated trading desk", principal: "Allocator", operator: "Momentum strategy", risk: "Risk owner", limit: "0.50" },
    formTitle: "Give a strategy standing authority",
    operatorField: "Operator (strategy or agent)",
    amountLabel: "Swap amount (devUSDC to devUSDT)",
  },
};

function caseOfWorkspace(ws: Workspace | null | undefined): UseCase {
  return ws?.useCase === "family" ? "family" : "capital";
}


const STATUS_TONE: Record<string, string> = {
  PENDING: "border-yellow/40 bg-yellow-soft text-orange-text",
  EXECUTING: "border-blue/25 bg-blue-soft text-blue",
  EXECUTED: "border-blue/25 bg-blue-soft text-blue",
  ACTIVE: "border-green/25 bg-green-soft text-green-strong",
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
  signTransaction?: <T>(transaction: T) => Promise<T>;
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

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

// Principal-wallet guardian: the wallet signs the exact transaction the server
// prepared (bootstrap, one exact grant, pause/resume/revoke, limits). The server
// verifies it is byte-for-byte the same message before sending it.
async function signGuardianTransaction(request: GuardianSignatureRequest) {
  const provider = solanaProvider();
  if (!provider?.signTransaction) throw new Error("No Solana wallet that can sign transactions was found (Phantom, Solflare or Backpack).");
  const connected = await provider.connect();
  if (connected.publicKey.toString() !== request.guardian) {
    throw new Error(`Connect the guardian wallet ${short(request.guardian)} to sign.`);
  }
  const { Transaction } = await import("@solana/web3.js");
  const tx = Transaction.from(base64ToBytes(request.transaction));
  const signed = await provider.signTransaction(tx);
  return bytesToBase64(signed.serialize());
}

setGuardianSigner(signGuardianTransaction);

function Pill({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[28px] border border-line bg-surface p-5 shadow-soft md:p-6 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">{children}</p>;
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
        <a key={s.signature} href={s.explorer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-blue hover:border-blue/40">
          {s.label} <ExternalLink className="size-3" />
        </a>
      ))}
    </div>
  );
}

const REQUEST_HEADLINE: Record<string, (n: { operator: string; principal: string }) => string> = {
  PENDING: (n) => `Waiting for ${n.principal}`,
  EXECUTING: () => "Executing on Solana",
  EXECUTED: (n) => `Approved by ${n.principal} · executed once`,
  REFUSED_BY_PRINCIPAL: (n) => `${n.principal} said no`,
  REFUSED_BY_PROGRAM: () => "Refused by the CRESCO program",
  STALE: () => "Stale: the mandate changed",
  EXPIRED: () => "Expired without a decision",
  NOT_REQUIRED: () => "Now fits the limit: resubmit as a normal trade",
  ROLLED_BACK: () => "Venue failed: rolled back, nothing consumed",
  NOT_EXECUTED: () => "Granted but not executed: allowance expires unused",
  UNKNOWN: () => "Outcome not confirmed: reconcile first",
};

function RequestCard({ req, names, children }: { req: ExceptionRequest; names?: { operator: string; principal: string }; children?: React.ReactNode }) {
  const who = names ?? { operator: "The operator", principal: "the principal" };
  const headline = REQUEST_HEADLINE[req.status]?.(who) ?? req.status.replaceAll("_", " ");
  return (
    <article className={`rounded-[22px] border bg-white p-4 md:p-5 ${req.status === "PENDING" ? "border-yellow/50 shadow-soft" : "border-line"}`} data-testid={`request-${req.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar name={who.operator} tone="bg-yellow-soft text-orange-text" />
          <p className="text-[15px] font-semibold text-navy-strong">{who.operator} asks for {usd(req.requestedNotionalMicroUsd)}</p>
        </div>
        <Pill tone={STATUS_TONE[req.status] ?? STATUS_TONE.STALE}>{headline}</Pill>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-semibold">
        <div className="rounded-[14px] bg-yellow-soft p-3 text-orange-text">Requested {usd(req.requestedNotionalMicroUsd)}</div>
        <div className="rounded-[14px] bg-surface-soft p-3 text-navy">Standing limit {usd(req.standingMaxNotionalMicroUsd)}</div>
      </div>
      <p className="mt-3 text-[13px] font-semibold leading-relaxed text-ink-2">
        {req.status === "PENDING"
          ? `Approving covers this exact trade, once. The standing limit stays ${usd(req.standingMaxNotionalMicroUsd)}.`
          : req.execution
            ? `Executed once. Standing authority changed: ${req.execution.standingAuthorityChanged === false ? "no" : String(req.execution.standingAuthorityChanged)}.`
            : null}
      </p>
      {req.status === "PENDING" ? (
        <p className="mt-1 flex items-center gap-1 text-[12px] font-bold text-orange-text">
          <Clock className="size-3.5" /> Expires at {new Date(req.expiresAt).toLocaleTimeString()}
        </p>
      ) : null}
      {req.grant?.principalApprovalVerifiedOnChain ? (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-green-strong">
          <Wallet className="size-3.5" /> {who.principal}&apos;s wallet signature verified on-chain in the grant transaction
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
      <details className="mt-3 rounded-[14px] bg-surface-soft px-3 py-2">
        <summary className="cursor-pointer text-[12px] font-semibold text-navy">On-chain details</summary>
        <dl className="mt-2 grid gap-1 text-[12px] font-semibold text-ink-2">
          <div>Trade: swap {devUsdc(req.intent.inputAmount)} to devUSDT, max slippage {req.intent.maxSlippageBps} bps</div>
          <div>Policy Diff: {(req.policyDiff?.violatedDimensions ?? []).join(", ") || "n/a"}</div>
          <div>Refusal proven by: {req.refusal?.evidence === "PROGRAM_PREFLIGHT_SIMULATION" ? "the CRESCO program (preflight)" : req.refusal?.evidence ?? "n/a"}</div>
          <div>Mandate nonce: {req.mandateNonce} · request {req.id}</div>
          {req.staleReason ? <div>Stale: {req.staleReason}</div> : null}
        </dl>
      </details>
      {children}
    </article>
  );
}

function IntentOutcome({ result, requests = [], principal = "the principal" }: { result: IntentResult; requests?: ExceptionRequest[]; principal?: string }) {
  if (result.decision === "ALLOW") {
    return (
      <div role="status" className="mt-4 rounded-[18px] border border-green/25 bg-green-soft p-4 text-green-strong">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4" /> Done alone · inside the standing limit</p>
        <p className="mt-1 text-[13px] font-semibold">Executed on Solana for {usd(result.receipt.quote.notionalMicroUsd)}. Nobody had to approve it.{result.idempotentReplay ? " Replayed from the idempotency key." : ""}</p>
        <a href={result.receipt.explorer} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-blue">Transaction on Explorer <ExternalLink className="size-3" /></a>
      </div>
    );
  }
  if (result.decision === "PENDING_PRINCIPAL") {
    const live = requests.find((r) => r.id === result.request.id);
    if (live && live.status !== "PENDING") {
      const done = live.status === "EXECUTED";
      return (
        <div role="status" className={`mt-4 rounded-[18px] border p-4 ${done ? "border-blue/25 bg-blue-soft text-navy-strong" : "border-line bg-surface-soft text-navy"}`}>
          <p className="flex items-center gap-2 font-semibold">{done ? <CheckCircle2 className="size-4 text-blue" /> : null}{done ? `${principal} approved it · executed once` : `Request ${live.status.replaceAll("_", " ").toLowerCase()}`}</p>
          <p className="mt-1 text-[13px] font-semibold">
            {done ? "The standing limit did not change." : "Details and receipts are under the request."}
          </p>
        </div>
      );
    }
    return (
      <div role="status" className="mt-4 rounded-[18px] border border-yellow/50 bg-yellow-soft p-4 text-orange-text">
        <p className="flex items-center gap-2 font-semibold"><Clock className="size-4" /> Above the limit · asked {principal} once</p>
        <p className="mt-1 text-[13px] font-semibold">The CRESCO program refused it ({result.refusal.code}) and filed one exact request. Its live status is on the right.</p>
      </div>
    );
  }
  if (result.decision === "REFUSE") {
    return (
      <div role="status" className="mt-4 rounded-[18px] border border-loss/20 bg-loss-soft p-4 text-loss-text">
        <p className="font-semibold">Refused · {result.boundary} boundary ({result.code})</p>
        <p className="mt-1 text-[13px] font-semibold">This one cannot be approved: there is no exception path for a hard boundary.</p>
      </div>
    );
  }
  return (
    <div role="alert" className="mt-4 rounded-[18px] border border-loss/30 bg-loss-soft p-4 text-loss-text">
      <p className="font-semibold">Outcome UNKNOWN</p>
      <p className="mt-1 text-[13px] font-semibold">{result.message}</p>
      <p className="mt-1 text-[12px] font-bold">CRESCO does not show success when confirmation is uncertain. Use “Reconcile” before resubmitting.</p>
    </div>
  );
}

function UseCaseToggle({ value, onChange }: { value: UseCase; onChange: (next: UseCase) => void }) {
  return (
    <div role="radiogroup" aria-label="Use case" className="inline-flex rounded-full border border-line bg-white p-1 shadow-soft">
      {(["family", "capital"] as UseCase[]).map((u) => (
        <button
          key={u}
          type="button"
          role="radio"
          aria-checked={value === u}
          onClick={() => onChange(u)}
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${value === u ? "bg-navy-strong text-white" : "text-navy hover:text-blue"}`}
        >
          {USE_CASES[u].label}
        </button>
      ))}
    </div>
  );
}

function CreateWorkspace({ useCase, onCreated }: { useCase: UseCase; onCreated: (ws: CreatedWorkspace) => void }) {
  const copy = USE_CASES[useCase];
  const [name, setName] = useState(USE_CASES.family.defaults.name);
  const [principalLabel, setPrincipalLabel] = useState(USE_CASES.family.defaults.principal);
  const [operatorLabel, setOperatorLabel] = useState(USE_CASES.family.defaults.operator);
  const [riskLabel, setRiskLabel] = useState(USE_CASES.family.defaults.risk);
  const [limit, setLimit] = useState(USE_CASES.family.defaults.limit);
  const [shownCase, setShownCase] = useState<UseCase>("family");
  if (shownCase !== useCase) {
    const d = USE_CASES[useCase].defaults;
    setShownCase(useCase);
    setName(d.name);
    setPrincipalLabel(d.principal);
    setOperatorLabel(d.operator);
    setRiskLabel(d.risk);
    setLimit(d.limit);
  }
  const [webhookUrl, setWebhookUrl] = useState("");
  const [walletGuardian, setWalletGuardian] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ws = await workflowApi.createWorkspace({
        useCase,
        guardianMode: walletGuardian ? "principal-wallet" : "server",
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

  const input = "mt-1.5 w-full rounded-[14px] border border-line bg-white px-3.5 py-3 text-[15px] font-bold text-navy-strong transition-colors focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/10";
  const label = "text-[12px] font-semibold text-ink-2";
  return (
    <Card className="md:p-8">
      <Eyebrow>Try it on Solana Devnet</Eyebrow>
      <h2 className="mt-2 font-display text-[40px] font-normal leading-[1.02] tracking-[-0.02em] text-navy-strong">{copy.formTitle}</h2>
      <p className="mt-2 max-w-[62ch] text-[14px] font-semibold leading-relaxed text-ink-2">
        {copy.pitch} You get one private link per person, shown once.
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className={label}>{copy.roles.operator.title}<input className={input} value={operatorLabel} onChange={(e) => setOperatorLabel(e.target.value)} /></label>
          <label className={label}>{copy.roles.principal.title}<input className={input} value={principalLabel} onChange={(e) => setPrincipalLabel(e.target.value)} /></label>
          <label className={label}>{copy.roles.risk.title}<input className={input} value={riskLabel} onChange={(e) => setRiskLabel(e.target.value)} /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <label className={label}>Standing limit per trade (USD)
            <input className={`${input} text-[22px] tabular`} inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} aria-describedby="limit-help" />
            <span id="limit-help" className="mt-1 block text-[11px] font-semibold text-ink-3">Below it: acts alone. Above it: asks once. Devnet bounds 0.05 to 5.00.</span>
          </label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-[18px] border p-4 text-[13px] font-semibold text-ink-2 transition-colors ${walletGuardian ? "border-green/40 bg-green-soft" : "border-line bg-surface-soft hover:border-blue/30"}`}>
            <input type="checkbox" className="mt-1 size-4 accent-green" checked={walletGuardian} onChange={(e) => setWalletGuardian(e.target.checked)} />
            <span>
              <span className="flex items-center gap-1.5 font-semibold text-navy-strong"><Wallet className="size-4" /> My wallet is the on-chain guardian (non-custodial)</span>
              The {copy.roles.principal.title.toLowerCase()}&apos;s wallet signs the mandate, every exact exception and every pause, resume or revoke. The server holds no authority over the mandate. Needs a Solana wallet on Devnet with a little Devnet SOL.
            </span>
          </label>
        </div>
        <details className="rounded-[16px] border border-line px-4 py-3">
          <summary className="cursor-pointer text-[13px] font-semibold text-navy">More options</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className={label}>Desk name<input className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label className={label}>Webhook for exception requests (optional, https)<input className={input} value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.example.com/cresco" /></label>
          </div>
        </details>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className="flex min-h-12 items-center gap-2 rounded-[16px] bg-blue px-6 text-[15px] font-semibold text-white shadow-button transition-colors hover:bg-blue-strong disabled:opacity-60">
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Create workspace
          </button>
          <p className="text-[12px] font-semibold text-ink-3">Creates its own Devnet mandate, separate from the judge lab.</p>
        </div>
        {error ? <p role="alert" className="text-[13px] font-bold text-loss-text">{error}</p> : null}
      </form>
    </Card>
  );
}

const JOURNEY = ["Set the line", "Share one link per person", "Create the mandate", "Act and approve"];

// Where am I? A four-step path from an empty desk to a live mandate.
function JourneySteps({ current }: { current: number }) {
  return (
    <ol aria-label="Your progress" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
      {JOURNEY.map((label, i) => (
        <li key={label} aria-current={i === current ? "step" : undefined} className={`flex items-center gap-2 ${i === current ? "text-navy-strong" : i < current ? "text-ink-3" : "text-ink-3/70"}`}>
          <span className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold ${i === current ? "bg-blue text-white" : i < current ? "bg-navy-strong text-bg" : "border border-line"}`}>
            {i < current ? <Check aria-hidden className="size-3.5" /> : i + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}

function TokenHandoff({ ws, onDone }: { ws: CreatedWorkspace; onDone: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <Card className="border-blue/30">
      <Eyebrow>Role links · shown once</Eyebrow>
      <h2 className="mt-2 font-display text-[36px] font-normal leading-tight tracking-[-0.02em] text-navy-strong">Hand each role its own link</h2>
      <p className="mt-1 text-[13px] font-semibold text-ink-2">{ws.tokenNotice} This browser keeps all three so you can try every role.</p>
      <div className="mt-4 grid gap-3">
        {(["operator", "principal", "risk"] as WorkflowRole[]).map((role) => {
          const link = shareLink(origin, ws.id, role, ws.tokens[role]);
          return (
            <div key={role} className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-line p-3">
              <div>
                <p className="text-[13px] font-semibold text-navy-strong">{USE_CASES[caseOfWorkspace(ws)].roles[role].title}</p>
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
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-blue"
              >
                {copied === role ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied === role ? "Copied" : "Copy link"}
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={onDone} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy-strong px-6 text-[15px] font-medium text-bg hover:bg-navy">
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
  const [landingCase, setLandingCase] = useState<UseCase>("family");

  useEffect(() => {
    void Promise.resolve().then(() => {
    const requested = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("case") : null;
    if (requested === "family" || requested === "capital") setLandingCase(requested);
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
      if (decision === "APPROVE" && role === "principal" && ws?.roles.principal.wallet && ws.guardianMode !== "principal-wallet") {
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
  const roleCopy = USE_CASES[caseOfWorkspace(ws)].roles;
  const mandateStatus = mandate?.mandate?.status ?? (ws?.chain.status === "REVOKED" ? "REVOKED" : null);
  const notReady = Boolean(ws && ws.chain.status !== "READY");
  const walletGuardianWs = ws?.guardianMode === "principal-wallet";

  const caseCopy = USE_CASES[ws ? caseOfWorkspace(ws) : landingCase];
  const names = ws
    ? { operator: ws.roles.operator.label, principal: ws.roles.principal.label, risk: ws.roles.risk.label }
    : { operator: caseCopy.defaults.operator, principal: caseCopy.defaults.principal, risk: caseCopy.defaults.risk };
  const limitMicro = mandate?.mandate?.maxActionNotionalMicroUsd ?? ws?.policy.maxActionNotionalMicroUsd ?? 500_000;
  const points = railPoints(events, requests);
  const aloneCount = events.filter((e) => e.type === "INTENT_ALLOWED").length;
  const approvedCount = requests.filter((r) => r.status === "EXECUTED").length;
  const amountMicro = toBase(amount);
  const insideLimit = Number.isFinite(amountMicro) && amountMicro > 0 && amountMicro <= limitMicro;
  const quickAmounts = [Math.max(50_000, Math.round(limitMicro * 0.6 / 10_000) * 10_000), Math.round(limitMicro * 1.5 / 10_000) * 10_000];

  return (
    <main id="main" className="cresco-app-workspace relative min-h-screen">
      <div className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-6 md:px-10 md:pt-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark size="md" />
          <nav aria-label="CRESCO product" className="flex flex-wrap gap-2">
            <Link href="/" className="rounded-full border border-line bg-surface/90 px-4 py-2 text-[13px] font-medium text-navy shadow-soft hover:border-green/35">CRESCO home</Link>
            <Link href="/worlds-fair" className="rounded-full border border-line bg-surface/90 px-4 py-2 text-[13px] font-medium text-navy shadow-soft hover:border-green/35">Technical proof</Link>
            {id ? (
              <button type="button" onClick={() => { saveKeychain({ workspaceId: null, tokens: {} }); setKeychain({ workspaceId: null, tokens: {} }); setWs(null); setMandate(null); setRequests([]); setEvents([]); }} className="rounded-full border border-line bg-white/90 px-4 py-2 text-[13px] font-medium text-navy shadow-soft">
                Leave workspace
              </button>
            ) : null}
          </nav>
        </header>

        {!id ? (
          <>
            <div className="mt-10"><JourneySteps current={0} /></div>
            <section className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_0.78fr]">
              <div>
              <h1 className="max-w-[18ch] font-display text-[44px] font-normal leading-[0.98] tracking-[-0.03em] text-navy-strong md:text-[64px]">
                Set the line. <em className="text-green-strong">Everything else follows.</em>
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <UseCaseToggle value={landingCase} onChange={setLandingCase} />
                <Link href="/how-it-works" className="text-[14px] font-medium text-blue hover:underline">How it works</Link>
              </div>
              </div>
              <div className="cresco-editorial-panel overflow-hidden">
                <StoryVignette role={landingCase === "family" ? "parent" : "capital"} className="block w-full" />
                <p className="p-4 text-[12px] leading-relaxed text-ink-2">
                  {landingCase === "family"
                    ? "Family workspace · Parent, teen and second-parent roles. Demo assets only."
                    : "Delegated capital workspace · Operator, principal and risk-owner roles. Solana Devnet."}
                </p>
              </div>
            </section>

            <section className="mt-8">
              <CreateWorkspace useCase={landingCase} onCreated={onCreated} />
            </section>
          </>
        ) : null}

        <div className="mt-8 grid gap-6">
          {handoff ? (
            <>
              <JourneySteps current={1} />
              <TokenHandoff ws={handoff} onDone={() => setHandoff(null)} />
            </>
          ) : null}
          {loadError ? <p role="alert" className="rounded-[16px] border border-loss/25 bg-loss-soft p-4 text-[13px] font-bold text-loss-text">{loadError}</p> : null}
          {id && !ws && !loadError ? (
            <p className="flex items-center gap-2 text-[14px] font-bold text-ink-2"><LoaderCircle className="size-4 animate-spin" /> Loading the workspace…</p>
          ) : null}

          {ws && !handoff ? (
            <>
              {notReady && ws.chain.status === "NOT_BOOTSTRAPPED" ? <JourneySteps current={2} /> : null}
              <Card className="md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Eyebrow>{caseCopy.label} desk · {ws.id}</Eyebrow>
                    <h1 className="mt-1 font-display text-[40px] font-normal leading-none tracking-[-0.02em] text-navy-strong md:text-[52px]">{ws.name}</h1>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["operator", "principal", "risk"] as WorkflowRole[]).map((r) => (
                        <span key={r} className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-[12px] font-bold text-navy">
                          <Avatar name={names[r]} tone={r === "operator" ? "bg-green-soft text-green-strong" : r === "principal" ? "bg-blue-soft text-blue" : "bg-lavender-soft text-navy"} />
                          {names[r]}{names[r].toLowerCase() !== caseCopy.roles[r].title.toLowerCase() ? <span className="text-ink-3">· {caseCopy.roles[r].title}</span> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {mandateStatus ? (
                      <Pill tone={mandateStatus === "ACTIVE" ? STATUS_TONE.ACTIVE : mandateStatus === "PAUSED" ? STATUS_TONE.PENDING : STATUS_TONE.UNKNOWN}>Mandate {mandateStatus}</Pill>
                    ) : (
                      <Pill tone={STATUS_TONE.STALE}>{ws.chain.status.replaceAll("_", " ")}</Pill>
                    )}
                    <GuardianBadge walletGuardian={walletGuardianWs} wallet={ws.roles.principal.wallet} />
                    {ws.chain.accounts?.mandate ? <ExternalChip href={`https://explorer.solana.com/address/${ws.chain.accounts.mandate}?cluster=devnet`}>Mandate on Explorer</ExternalChip> : null}
                    <button type="button" onClick={refresh} aria-label="Refresh" className="grid size-8 place-items-center rounded-full border border-line bg-white text-navy hover:border-blue/40"><RefreshCw className="size-4" /></button>
                  </div>
                </div>

                <div className="mt-7">
                  <MandateRail limitMicroUsd={limitMicro} operator={names.operator} principal={names.principal} points={points} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] bg-surface-soft p-4">
                    <Eyebrow>Standing limit / trade</Eyebrow>
                    <p className="mt-1 font-display text-[34px] font-normal leading-tight tabular text-navy-strong">{usd(limitMicro)}</p>
                    <p className="text-[12px] font-semibold text-ink-3">Period cap {usd(mandate?.mandate?.maxPeriodNotionalMicroUsd ?? ws.policy.maxPeriodNotionalMicroUsd)}</p>
                  </div>
                  <div className="rounded-[18px] bg-surface-soft p-4">
                    <Eyebrow>Activity</Eyebrow>
                    <p className="mt-2 text-[24px] font-medium tracking-[-0.02em] tabular text-navy-strong">{aloneCount} alone · {approvedCount} approved</p>
                    <p className="text-[12px] font-semibold text-ink-3">Every one with an Explorer receipt</p>
                  </div>
                  <div className={`rounded-[18px] p-4 ${pending.length ? "bg-yellow-soft" : "bg-surface-soft"}`}>
                    <Eyebrow>Waiting for {names.principal}</Eyebrow>
                    <p className={`mt-1 font-display text-[34px] font-normal leading-tight tabular ${pending.length ? "text-orange-text" : "text-navy-strong"}`}>{pending.length}</p>
                    <p className="text-[12px] font-semibold text-ink-3">{pending.length ? "Exact requests to decide" : "Nothing to decide"}</p>
                  </div>
                </div>

                {notReady && token("principal") && ws.chain.status === "NOT_BOOTSTRAPPED" ? (
                  <div className="mt-5 rounded-[18px] border border-blue/25 bg-blue-soft p-5">
                    <p className="text-[15px] font-semibold text-navy-strong">Create the mandate on Solana Devnet</p>
                    {walletGuardianWs ? (
                      <p className="mt-1 text-[13px] font-semibold text-ink-2">Your wallet becomes the on-chain guardian: one transaction creates the charter, mandate, asset rule and trade vaults, and you sign it. The lab then funds the Devnet vault.</p>
                    ) : (
                      <p className="mt-1 text-[13px] font-semibold text-ink-2">Charter, mandate, asset rule, trade vaults and funding. Several transactions; safe to retry.</p>
                    )}
                    {walletGuardianWs && !ws.roles.principal.wallet ? (
                      <button type="button" disabled={Boolean(actionBusy)} onClick={bindWallet} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-blue px-4 text-[13px] font-semibold text-white disabled:opacity-60">
                        {actionBusy === "wallet" ? <LoaderCircle className="size-4 animate-spin" /> : <Wallet className="size-4" />} Connect the guardian wallet
                      </button>
                    ) : (
                      <button type="button" disabled={actionBusy === "bootstrap"} onClick={() => run("bootstrap", () => workflowApi.bootstrap(ws.id, token("principal")!))} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-blue px-4 text-[13px] font-semibold text-white disabled:opacity-60">
                        {actionBusy === "bootstrap" ? <LoaderCircle className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} {walletGuardianWs ? "Sign and create the mandate" : "Bootstrap mandate"}
                      </button>
                    )}
                  </div>
                ) : null}
                {actionError ? <p role="alert" className="mt-4 rounded-[14px] border border-loss/25 bg-loss-soft p-3 text-[13px] font-bold text-loss-text">{actionError}</p> : null}
              </Card>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">View as</span>
                <div role="tablist" aria-label="Desk views" className="flex flex-wrap gap-1.5 rounded-[22px] border border-line bg-white p-1 shadow-soft sm:rounded-full">
                  {([...roles, "history", "api"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={tab === t}
                      onClick={() => setTab(t)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${tab === t ? "bg-navy-strong text-white" : "text-navy hover:bg-surface-soft"}`}
                    >
                      {t === "history" ? <History className="size-4" /> : t === "api" ? <SlidersHorizontal className="size-4" /> : null}
                      {t === "history" ? "History" : t === "api" ? "API & agents" : roleCopy[t].title}
                      {(t === "principal" || t === "risk") && pendingCount > 0 ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange px-1.5 text-[11px] text-white"><Bell className="size-3" />{pendingCount}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "operator" && token("operator") ? (
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <Card className="md:p-7">
                    <div className="flex items-center gap-3">
                      <Avatar name={names.operator} tone="bg-green-soft text-green-strong" />
                      <div>
                        <p className="text-[16px] font-semibold text-navy-strong">{names.operator}</p>
                        <p className="text-[12px] font-semibold text-ink-2">{roleCopy.operator.blurb}</p>
                      </div>
                    </div>
                    <form onSubmit={submitIntent} className="mt-6 grid gap-4">
                      <label className="text-[12px] font-semibold text-ink-2">{USE_CASES[caseOfWorkspace(ws)].amountLabel}
                        <div className="relative mt-1.5">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[26px] font-semibold text-ink-3">$</span>
                          <input className="w-full rounded-[18px] border border-line bg-white py-4 pl-10 pr-4 font-display text-[40px] font-normal tabular text-navy-strong focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/10" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {quickAmounts.map((q) => (
                          <button key={q} type="button" onClick={() => setAmount((q / 1e6).toFixed(2))} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${q <= limitMicro ? "border-green/30 bg-green-soft text-green-strong" : "border-yellow/50 bg-yellow-soft text-orange-text"}`}>
                            {usd(q)} · {q <= limitMicro ? "inside the limit" : "above the limit"}
                          </button>
                        ))}
                      </div>
                      <p className={`rounded-[14px] px-4 py-3 text-[13px] font-bold ${insideLimit ? "bg-green-soft text-green-strong" : "bg-yellow-soft text-orange-text"}`}>
                        {insideLimit ? `Under ${usd(limitMicro)}: executes now, nobody is asked.` : `Above ${usd(limitMicro)}: the program refuses it and asks ${names.principal} once for this exact trade.`}
                      </p>
                      <details className="text-[12px] font-semibold text-ink-2">
                        <summary className="cursor-pointer text-navy">Advanced</summary>
                        <label className="mt-2 block">Max slippage (bps, 1–300)
                          <input className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[15px] font-bold text-navy-strong" inputMode="numeric" value={slippage} onChange={(e) => setSlippage(e.target.value)} />
                        </label>
                      </details>
                      <button type="submit" disabled={actionBusy === "intent" || notReady || mandateStatus === "REVOKED"} className="flex min-h-13 items-center justify-center gap-2 rounded-[16px] bg-blue px-5 py-3.5 text-[15px] font-semibold text-white shadow-button transition-colors hover:bg-blue-strong disabled:opacity-60">
                        {actionBusy === "intent" ? <><LoaderCircle className="size-4 animate-spin" /> Executing on Devnet…</> : <>Submit intent <ArrowRight className="size-4" /></>}
                      </button>
                      <p className="text-[11px] font-bold text-ink-3">Each submit carries an idempotency key: a network retry cannot execute twice.</p>
                    </form>
                    {intentResult ? <IntentOutcome result={intentResult} requests={requests} principal={names.principal} /> : null}
                  </Card>
                  <Card className="md:p-7">
                    <Eyebrow>My requests to {names.principal}</Eyebrow>
                    <div className="mt-4 grid gap-3">
                      {requests.length ? requests.slice(0, 8).map((r) => <RequestCard key={r.id} req={r} names={names} />) : <p className="rounded-[18px] border border-dashed border-line p-6 text-center text-[13px] font-semibold text-ink-2">No requests yet. Try an amount above the limit to create one.</p>}
                    </div>
                  </Card>
                </div>
              ) : null}

              {(tab === "principal" || tab === "risk") && token(tab) ? (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <Card className="md:p-7">
                    <div className="flex items-center gap-3">
                      <Avatar name={tab === "principal" ? names.principal : names.risk} tone={tab === "principal" ? "bg-blue-soft text-blue" : "bg-lavender-soft text-navy"} />
                      <div>
                        <p className="text-[16px] font-semibold text-navy-strong">{tab === "principal" ? names.principal : names.risk} · decisions</p>
                        <p className="text-[12px] font-semibold text-ink-2">{roleCopy[tab].blurb}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {pending.length ? pending.map((r) => (
                        <RequestCard key={r.id} req={r} names={names}>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => decide(r, "APPROVE", tab)} className="inline-flex min-h-11 items-center gap-1.5 rounded-[14px] bg-green px-5 text-[14px] font-semibold text-white shadow-soft transition-opacity hover:opacity-90 disabled:opacity-60">
                              {actionBusy === `decide-${r.id}` ? <LoaderCircle className="size-4 animate-spin" /> : tab === "principal" && ws.roles.principal.wallet ? <Wallet className="size-4" /> : <Check className="size-4" />}
                              Approve exactly once
                            </button>
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => decide(r, "REFUSE", tab)} className="inline-flex min-h-11 items-center gap-1.5 rounded-[14px] border border-loss/30 bg-white px-4 text-[14px] font-semibold text-loss-text disabled:opacity-60">
                              <X className="size-4" /> Refuse
                            </button>
                          </div>
                          {tab === "principal" && walletGuardianWs ? <p className="mt-2 text-[12px] font-semibold text-ink-3">Your wallet signs the exact grant. Sign within 90 seconds.</p> : null}
                        </RequestCard>
                      )) : <p className="rounded-[18px] border border-dashed border-line p-6 text-center text-[13px] font-semibold text-ink-2">Nothing waiting. Requests appear here as soon as {names.operator} crosses the limit.</p>}
                    </div>
                    <label className="mt-4 block text-[12px] font-semibold text-ink-2">Note with your decision (optional)
                      <input className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] font-semibold" value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} />
                    </label>
                    {requests.some((r) => r.status !== "PENDING") ? (
                      <details className="mt-5">
                        <summary className="cursor-pointer text-[13px] font-semibold text-navy">Decided requests</summary>
                        <div className="mt-3 grid gap-3">{requests.filter((r) => r.status !== "PENDING").slice(0, 10).map((r) => <RequestCard key={r.id} req={r} names={names} />)}</div>
                      </details>
                    ) : null}
                  </Card>

                  <div className="grid content-start gap-6">
                    <Card>
                      <Eyebrow>This period</Eyebrow>
                      {mandate?.consumption ? (
                        <div className="mt-3 grid gap-3">
                          <Bar pct={mandate.consumption.notionalUsedPct} label={`Notional ${usd(mandate.consumption.spentNotionalMicroUsd)} / ${usd(mandate.consumption.maxPeriodNotionalMicroUsd)}`} />
                          <Bar pct={mandate.consumption.amountUsedPct} label={`Amount ${devUsdc(mandate.consumption.spentAmount)} / ${devUsdc(mandate.consumption.maxPeriodAmount)}`} />
                          <p className="text-[11px] font-bold text-ink-3">Period ends {mandate.consumption.periodEndsAt ? new Date(mandate.consumption.periodEndsAt).toLocaleString() : "n/a"} · read from chain {new Date(mandate.observedAt).toLocaleTimeString()}</p>
                        </div>
                      ) : <p className="mt-2 text-[13px] font-semibold text-ink-2">Available once the mandate is live.</p>}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-[12px] font-semibold text-navy">Edit the asset rule</summary>
                        <form
                          className="mt-3 grid grid-cols-2 gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void run("rule", () => workflowApi.updateAssetRule(ws.id, token(tab)!, { ...(ruleAction ? { maxActionAmount: toBase(ruleAction) } : {}), ...(rulePeriod ? { maxPeriodAmount: toBase(rulePeriod) } : {}) }));
                          }}
                        >
                          <label className="text-[11px] font-semibold text-ink-2">Max / action (devUSDC)<input className="mt-1 w-full rounded-[12px] border border-line px-2 py-2 text-[13px] font-bold" value={ruleAction} onChange={(e) => setRuleAction(e.target.value)} placeholder={String((mandate?.assetRule?.maxActionAmount ?? ws.policy.maxActionAmount) / 1e6)} /></label>
                          <label className="text-[11px] font-semibold text-ink-2">Max / period (devUSDC)<input className="mt-1 w-full rounded-[12px] border border-line px-2 py-2 text-[13px] font-bold" value={rulePeriod} onChange={(e) => setRulePeriod(e.target.value)} placeholder={String((mandate?.assetRule?.maxPeriodAmount ?? ws.policy.maxPeriodAmount) / 1e6)} /></label>
                          <button type="submit" disabled={Boolean(actionBusy) || notReady} className="col-span-2 rounded-[12px] border border-line px-3 py-2 text-[12px] font-semibold text-navy disabled:opacity-60">Update asset rule (resets period counters)</button>
                        </form>
                      </details>
                    </Card>

                    {tab === "principal" ? (
                      <Card>
                        <Eyebrow>Your controls</Eyebrow>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {mandateStatus === "ACTIVE" ? (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => run("pause", () => workflowApi.setStatus(ws.id, token("principal")!, "PAUSED"))} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-semibold text-navy hover:border-blue/40"><Pause className="size-4" /> Pause</button>
                          ) : null}
                          {mandateStatus === "PAUSED" ? (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => run("resume", () => workflowApi.setStatus(ws.id, token("principal")!, "ACTIVE"))} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-semibold text-navy hover:border-blue/40"><Play className="size-4" /> Resume</button>
                          ) : null}
                          {mandateStatus && mandateStatus !== "REVOKED" ? (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={() => { if (window.confirm("Revoke permanently? This mandate can never be reactivated.")) void run("revoke", () => workflowApi.setStatus(ws.id, token("principal")!, "REVOKED", "REVOKE")); }} className="inline-flex items-center gap-1.5 rounded-[12px] border border-loss/30 px-3 py-2 text-[12px] font-semibold text-loss-text"><AlertTriangle className="size-4" /> Revoke</button>
                          ) : null}
                          <button type="button" disabled={Boolean(actionBusy) || notReady} onClick={() => run("topup", () => workflowApi.topUpVault(ws.id, token("principal")!))} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-semibold text-navy hover:border-blue/40">Top up Devnet vault</button>
                        </div>
                        <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (newLimit) void run("policy", () => workflowApi.revisePolicy(ws.id, token("principal")!, { maxActionNotionalMicroUsd: toBase(newLimit) })); }}>
                          <label className="text-[11px] font-semibold text-ink-2">New standing limit (USD)<input className="mt-1 w-32 rounded-[12px] border border-line px-2 py-2 text-[13px] font-bold" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder={String(limitMicro / 1e6)} /></label>
                          <button type="submit" disabled={Boolean(actionBusy) || notReady} className="rounded-[12px] bg-navy px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-60">Revise policy</button>
                        </form>
                        <p className="mt-2 text-[11px] font-bold text-ink-3">Any change to the mandate makes pending requests stale automatically.</p>
                        <div className="mt-4 border-t border-line-soft pt-4">
                          {walletGuardianWs && ws.roles.principal.wallet ? (
                            <p className="flex items-center gap-2 text-[12px] font-bold text-green-strong"><Wallet className="size-4" /> On-chain guardian: {short(ws.roles.principal.wallet)}. Every exception and lifecycle change is a transaction this wallet signs.</p>
                          ) : ws.roles.principal.wallet ? (
                            <p className="flex items-center gap-2 text-[12px] font-bold text-green-strong"><Wallet className="size-4" /> Approvals require a signature from {short(ws.roles.principal.wallet)}</p>
                          ) : (
                            <button type="button" disabled={Boolean(actionBusy)} onClick={bindWallet} className="inline-flex items-center gap-1.5 rounded-[12px] border border-line px-3 py-2 text-[12px] font-semibold text-navy"><Wallet className="size-4" /> Bind my wallet for approvals</button>
                          )}
                        </div>
                      </Card>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {tab === "history" ? (
                <Card className="md:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Eyebrow>What happened · newest first</Eyebrow>
                    {roles[0] ? (
                      <button type="button" disabled={Boolean(actionBusy)} onClick={() => run("reconcile", () => workflowApi.reconcile(ws.id, token(roles[0])!))} className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-navy">Reconcile unknown outcomes</button>
                    ) : null}
                  </div>
                  <ol className="mt-3 divide-y divide-line-soft">
                    {events.map((e) => <EventRow key={e.id} event={e} names={names} />)}
                  </ol>
                </Card>
              ) : null}

              {tab === "api" ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="md:p-7">
                    <Eyebrow>AI agent as operator (MCP)</Eyebrow>
                    <p className="mt-2 text-[13px] font-semibold leading-relaxed text-ink-2">Give Claude, or any MCP client, the operator link of this desk. It can act inside the limit and ask once above it. It has no tool to approve, raise its limit, pause or revoke.</p>
                    <pre className="mt-4 overflow-x-auto rounded-[16px] bg-navy-strong p-4 text-[12px] leading-relaxed text-white">{`claude mcp add cresco-operator \\
  -e CRESCO_API_URL=$CRESCO_API \\
  -e CRESCO_WORKSPACE_ID=${ws.id} \\
  -e CRESCO_OPERATOR_TOKEN=$OPERATOR_TOKEN \\
  -- node integrations/mcp/cresco-mcp.mjs`}</pre>
                    <p className="mt-3 text-[12px] font-bold text-ink-3">Tools: cresco_get_mandate, cresco_submit_intent, cresco_get_request, cresco_wait_for_decision, cresco_history.</p>
                  </Card>
                  <Card className="md:p-7">
                    <Eyebrow>HTTP API for strategies</Eyebrow>
                    <p className="mt-2 text-[13px] font-semibold text-ink-2">Two calls: submit an intent, then read its decision. Full contract: <code className="font-mono">GET /api/v0.4/worlds-fair/openapi</code>.</p>
                    <pre className="mt-4 overflow-x-auto rounded-[16px] bg-navy-strong p-4 text-[12px] leading-relaxed text-white">{`curl -X POST $CRESCO_API/api/v0.4/worlds-fair/workspaces/${ws.id}/intents \\
  -H "authorization: Bearer $OPERATOR_TOKEN" \\
  -H "idempotency-key: order-$(date +%s)" \\
  -H "content-type: application/json" \\
  -d '{"action":"SWAP_EXACT_IN","inputAmount":200000,"maxSlippageBps":100}'

# 200 ALLOW (executed) · 202 PENDING_PRINCIPAL (Policy Diff + request)
# 200 REFUSE (hard boundary) · 409 BUSY · 503 UNKNOWN (reconcile first)`}</pre>
                    <p className="mt-3 text-[12px] font-bold text-ink-3">Example client: <code className="font-mono">examples/worlds-fair-strategy-client.mjs</code></p>
                  </Card>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <footer className="mt-16 border-t border-line pt-5 text-[12px] font-semibold text-ink-3">
          Solana Devnet only · no mainnet funds, brokerage or custody · {ws && walletGuardianWs ? "guardian: the principal's own wallet" : "guardian: Devnet lab key unless the principal wallet mode is chosen"} · no customer validation claimed.
        </footer>
      </div>
    </main>
  );
}
