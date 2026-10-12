"use client";

// Presentational pieces of the CRESCO desk. No data fetching here.
import {
  ArrowUpRight,
  BadgeCheck,
  CircleSlash,
  Clock,
  ExternalLink,
  Hand,
  KeyRound,
  Pause,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

import type { ExceptionRequest, UseCase, WorkflowEvent } from "@/services/worlds-fair-workflow";

const money = (micro: number | null | undefined) =>
  micro == null || !Number.isFinite(Number(micro)) ? "n/a" : `$${(Number(micro) / 1e6).toFixed(2)}`;

export type RailPoint = { id: string; amountMicroUsd: number; kind: "alone" | "pending" | "approved" | "refused" };

/**
 * The signature visual: one line. Left of it the operator acts alone; right of
 * it the operator can only ask, once, for an exact trade. Approving it does not
 * move the line.
 */
export function MandateRail({
  limitMicroUsd,
  points,
  operator,
  principal,
  compact = false,
}: {
  limitMicroUsd: number;
  points: RailPoint[];
  operator: string;
  principal: string;
  compact?: boolean;
}) {
  const shown = points.slice(-6);
  const maxPoint = shown.reduce((m, p) => Math.max(m, p.amountMicroUsd), 0);
  const scale = Math.max(limitMicroUsd * 2, maxPoint * 1.15, 1);
  const limitPct = (limitMicroUsd / scale) * 100;
  const at = (v: number) => Math.min(96, Math.max(4, (v / scale) * 100));
  const dot: Record<RailPoint["kind"], string> = {
    alone: "size-3.5 bg-navy-strong",
    approved: "size-3.5 bg-green",
    pending: "size-4 border-2 border-blue bg-bg",
    refused: "size-3 bg-ink-3/50",
  };
  const label: Record<RailPoint["kind"], string> = { alone: "alone", approved: "approved once", pending: "waiting", refused: "not executed" };
  const withLabels = !compact && shown.length <= 5;
  return (
    <figure aria-label={`Standing limit ${money(limitMicroUsd)}`} className="w-full">
      <div className={`relative ${withLabels ? "h-[150px]" : "h-[96px]"}`}>
        <span className="absolute left-0 top-0 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">{operator} acts alone</span>
        <span className="absolute right-0 top-0 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">Above: asks {principal} once</span>
        <div className="absolute inset-x-0 top-[72px] h-px bg-navy-strong/70" />
        <div className="absolute right-0 top-[71px] h-[3px] bg-blue/25" style={{ left: `${limitPct}%` }} />
        <div className="absolute top-[24px] h-[96px] w-[1.5px] bg-blue" style={{ left: `${limitPct}%` }} />
        <span className="absolute top-[22px] whitespace-nowrap pl-3 font-display text-[32px] leading-none text-blue" style={{ left: `${limitPct}%` }}>
          {money(limitMicroUsd)}
          <span className="mt-1 block font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3">standing limit</span>
        </span>
        {shown.map((p) => (
          <span key={p.id} title={`${money(p.amountMicroUsd)} · ${label[p.kind]}`} className={`absolute top-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full ${dot[p.kind]}`} style={{ left: `${at(p.amountMicroUsd)}%` }} />
        ))}
        {withLabels
          ? shown.map((p) => (
              <span key={`l-${p.id}`} className="absolute top-[90px] -translate-x-1/2 whitespace-nowrap text-center text-[12px] text-ink-3" style={{ left: `${at(p.amountMicroUsd)}%` }}>
                <span className="block font-display text-[22px] leading-tight text-navy-strong">{money(p.amountMicroUsd)}</span>
                {label[p.kind]}
              </span>
            ))
          : null}
      </div>
    </figure>
  );
}

export function railPoints(events: WorkflowEvent[], requests: ExceptionRequest[]): RailPoint[] {
  const alone = events
    .filter((e) => e.type === "INTENT_ALLOWED")
    .map((e) => {
      const data = e.data as { quote?: { notionalMicroUsd?: number }; intent?: { inputAmount?: number } } | undefined;
      return { id: e.id, amountMicroUsd: Number(data?.quote?.notionalMicroUsd ?? data?.intent?.inputAmount ?? 0), kind: "alone" as const, at: e.at };
    });
  const asked = requests.map((r) => ({
    id: r.id,
    amountMicroUsd: Number(r.requestedNotionalMicroUsd ?? r.intent.inputAmount),
    kind: (r.status === "PENDING" || r.status === "EXECUTING" ? "pending" : r.status === "EXECUTED" ? "approved" : "refused") as RailPoint["kind"],
    at: r.createdAt,
  }));
  return [...alone, ...asked]
    .filter((p) => p.amountMicroUsd > 0)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .map(({ id, amountMicroUsd, kind }) => ({ id, amountMicroUsd, kind }));
}

export const STEPS: Record<UseCase, { title: string; body: string }[]> = {
  family: [
    { title: "Act alone", body: "Maya invests $0.30. It is under her $0.50 limit, so it executes on Solana. Nobody is asked." },
    { title: "Ask once", body: "She wants $0.75. The CRESCO program refuses it and files one exact request to her parent." },
    { title: "Approve exactly", body: "Her parent approves that one trade. It executes once. Her limit is still $0.50." },
  ],
  capital: [
    { title: "Act alone", body: "The strategy swaps $0.30. Inside its standing mandate, it executes on Solana with no approval." },
    { title: "Ask once", body: "It needs $0.75. The program refuses it and files one exact exception request to the allocator." },
    { title: "Approve exactly", body: "The allocator approves that exact trade. It executes once. The mandate is not widened." },
  ],
};

export function HowItWorks({ useCase }: { useCase: UseCase }) {
  return (
    <ol className="grid border-y border-line md:grid-cols-3">
      {STEPS[useCase].map((step, i) => (
        <li key={step.title} className={`py-7 md:py-8 ${i > 0 ? "border-t border-line md:border-l md:border-t-0 md:pl-8" : ""} ${i < 2 ? "md:pr-8" : ""}`}>
          <p className={`font-display text-[64px] leading-[0.8] ${i === 1 ? "text-blue" : "text-navy-strong"}`}>0{i + 1}</p>
          <p className="mt-5 text-[19px] font-semibold tracking-[-0.01em] text-navy-strong">{step.title}</p>
          <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed text-ink-2">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** Live evidence recorded on Devnet on 2026-10-12 (docs/worlds-fair/CURRENT-STATE-2026-10-12.md). */
export function ProofStrip() {
  const items = [
    { k: "Live campaign", v: "5 / 5 cycles", s: "Solana Devnet · Oct 12" },
    { k: "Act alone", v: "2.7 s", s: "p50, executed on-chain" },
    { k: "Refused at the line", v: "1.0 s", s: "p50, program preflight" },
    { k: "Approve + execute", v: "3.6 s", s: "p50, one exact exception" },
  ];
  return (
    <dl className="grid grid-cols-2 border-t border-line md:grid-cols-4">
      {items.map((it, i) => (
        <div key={it.k} className={`py-5 ${i % 2 === 1 ? "pl-5" : ""} md:pl-0 ${i > 0 ? "md:border-l md:border-line md:pl-6" : ""}`}>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">{it.k}</dt>
          <dd className="mt-2 font-display text-[36px] leading-none text-navy-strong">{it.v}</dd>
          <dd className="mt-2 text-[12px] text-ink-3">{it.s}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Avatar({ name, tone = "bg-blue-soft text-blue" }: { name: string; tone?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${tone}`}>{initial}</span>;
}

type Names = { operator: string; principal: string; risk: string };

const EVENT_LOOK: Record<string, { icon: typeof Zap; tone: string; title: (n: Names, e: WorkflowEvent) => string }> = {
  INTENT_ALLOWED: { icon: Zap, tone: "bg-green-soft text-green-strong", title: (n, e) => `${n.operator} acted alone · ${money((e.data as { quote?: { notionalMicroUsd?: number } })?.quote?.notionalMicroUsd)}` },
  EXCEPTION_REQUESTED: { icon: Hand, tone: "bg-yellow-soft text-orange-text", title: (n) => `${n.operator} asked once for an exact trade` },
  EXCEPTION_EXECUTED: { icon: BadgeCheck, tone: "bg-blue-soft text-blue", title: (n) => `${n.principal} approved exactly once · executed, limit unchanged` },
  EXCEPTION_REFUSED: { icon: CircleSlash, tone: "bg-loss-soft text-loss-text", title: (n, e) => `${e.actor === "risk" ? n.risk : n.principal} said no` },
  EXCEPTION_REFUSED_BY_PROGRAM: { icon: CircleSlash, tone: "bg-loss-soft text-loss-text", title: () => "The CRESCO program refused the exception" },
  EXCEPTION_STALE: { icon: Clock, tone: "bg-surface-soft text-ink-2", title: () => "Request went stale: the mandate changed" },
  EXCEPTION_EXPIRED: { icon: Clock, tone: "bg-surface-soft text-ink-2", title: () => "Request expired without a decision" },
  INTENT_REFUSED: { icon: CircleSlash, tone: "bg-loss-soft text-loss-text", title: () => "Refused at a hard boundary (no exception path)" },
  MANDATE_BOOTSTRAPPED: { icon: ShieldCheck, tone: "bg-blue-soft text-blue", title: () => "Mandate live on Solana Devnet" },
  MANDATE_STATUS_CHANGED: { icon: Pause, tone: "bg-lavender-soft text-navy", title: (n, e) => `${n.principal} set the mandate to ${String((e.data as { status?: string })?.status ?? "").toLowerCase()}` },
  POLICY_REVISED: { icon: KeyRound, tone: "bg-lavender-soft text-navy", title: (n) => `${n.principal} revised the standing limit` },
  ASSET_RULE_UPDATED: { icon: KeyRound, tone: "bg-lavender-soft text-navy", title: () => "Asset rule updated" },
  WALLET_BOUND: { icon: Wallet, tone: "bg-green-soft text-green-strong", title: (n) => `${n.principal} connected a wallet` },
  GUARDIAN_TRANSACTION_CONFIRMED: { icon: Wallet, tone: "bg-green-soft text-green-strong", title: (n) => `${n.principal}'s wallet signed on-chain` },
  OUTCOME_UNKNOWN: { icon: Clock, tone: "bg-loss-soft text-loss-text", title: () => "Outcome not confirmed: reconcile before any retry" },
  WORKSPACE_CREATED: { icon: Sparkles, tone: "bg-surface-soft text-navy", title: () => "Workspace created" },
};

export function EventRow({ event, names }: { event: WorkflowEvent; names: Names }) {
  const look = EVENT_LOOK[event.type] ?? { icon: Sparkles, tone: "bg-surface-soft text-navy", title: () => event.type.replaceAll("_", " ").toLowerCase() };
  const Icon = look.icon;
  return (
    <li className="relative flex gap-3 py-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-full ${look.tone}`}><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="text-[14px] font-semibold text-navy-strong">{look.title(names, event)}</p>
          <time className="text-[11px] font-bold tabular text-ink-3">{new Date(event.at).toLocaleTimeString()}</time>
        </div>
        <p className="mt-0.5 text-[12px] font-semibold text-ink-3">{event.summary}</p>
        {event.signatures?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {event.signatures.map((s) => (
              <a key={s.signature} href={s.explorer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-blue hover:border-blue/40">
                {s.label} <ExternalLink className="size-3" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function GuardianBadge({ walletGuardian, wallet }: { walletGuardian: boolean; wallet: string | null }) {
  if (walletGuardian) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green/30 bg-green-soft px-3 py-1 text-[12px] font-semibold text-green-strong">
        <Wallet className="size-3.5" /> Guardian: {wallet ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : "your wallet"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-soft px-3 py-1 text-[12px] font-semibold text-ink-2">
      <KeyRound className="size-3.5" /> Guardian: Devnet lab key
    </span>
  );
}

export function ExternalChip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-blue hover:border-blue/40">
      {children} <ArrowUpRight className="size-3.5" />
    </a>
  );
}
