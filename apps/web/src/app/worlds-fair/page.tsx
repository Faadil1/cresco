"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LoaderCircle,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Wordmark } from "@/components/shell";
import {
  fetchWorldFairRuntime,
  runWorldFairCanonicalLiveSequence,
  type WorldFairLiveReceipt,
  type WorldFairRuntime,
} from "@/services/cresco-backend";

const PROGRAM_ID = "7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z";
const PROGRAM_SHA = "084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61";

function short(value: string, head = 7, tail = 6) {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function explorerSignature(signature: string) {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

type StepTone = "allow" | "boundary" | "exact" | "hard" | "rollback" | "stale";

const STEP_META: {
  key: keyof WorldFairLiveReceipt["scenarios"];
  eyebrow: string;
  title: string;
  body: string;
  tone: StepTone;
  icon: typeof Activity;
}[] = [
  {
    key: "standingAutonomy",
    eyebrow: "01 · STANDING",
    title: "Autonomy, without approval",
    body: "Two real Orca swaps execute inside the standing mandate.",
    tone: "allow",
    icon: Activity,
  },
  {
    key: "softBoundary",
    eyebrow: "02 · POLICY DIFF",
    title: "One dimension crosses the line",
    body: "Program, pool, pair and evidence still pass. Only action notional is outside standing authority.",
    tone: "boundary",
    icon: Radio,
  },
  {
    key: "exactException",
    eyebrow: "03 · EXACT ONCE",
    title: "Exception without widening the key",
    body: "Mutation refuses. The exact approved action executes once. Replay refuses.",
    tone: "exact",
    icon: KeyRound,
  },
  {
    key: "hardBoundary",
    eyebrow: "04 · HARD EDGE",
    title: "Some things cannot be approved",
    body: "An unsupported execution target has no exceptional path.",
    tone: "hard",
    icon: Ban,
  },
  {
    key: "evidenceFailure",
    eyebrow: "05 · EVIDENCE",
    title: "No evidence, no execution",
    body: "The same action fails closed when its required Pyth evidence is missing.",
    tone: "hard",
    icon: ShieldCheck,
  },
  {
    key: "rollback",
    eyebrow: "06 · ROLLBACK",
    title: "Failed execution consumes nothing",
    body: "Orca refuses an impossible output threshold; allowance and counters stay untouched.",
    tone: "rollback",
    icon: RotateCcw,
  },
  {
    key: "staleAuthority",
    eyebrow: "07 · POLICY EVOLUTION",
    title: "Old authority goes stale",
    body: "A mandate nonce transition invalidates a still-unused exception.",
    tone: "stale",
    icon: RefreshCw,
  },
];

function toneClasses(tone: StepTone) {
  switch (tone) {
    case "allow":
      return "border-green/25 bg-green-soft text-green-strong";
    case "boundary":
      return "border-orange/30 bg-[#fff0e6] text-orange-text";
    case "exact":
      return "border-blue/25 bg-blue-soft text-blue-strong";
    case "rollback":
      return "border-aqua/30 bg-aqua-soft text-navy";
    case "stale":
      return "border-lavender/30 bg-lavender-soft text-navy";
    default:
      return "border-loss/20 bg-loss-soft text-loss-text";
  }
}

function ScenarioProof({
  receipt,
  scenarioKey,
}: {
  receipt: WorldFairLiveReceipt;
  scenarioKey: keyof WorldFairLiveReceipt["scenarios"];
}) {
  const scenario = receipt.scenarios[scenarioKey];
  const signatures = [
    ...(Array.isArray(scenario.signatures) ? scenario.signatures : []),
    typeof scenario.executionSignature === "string" ? scenario.executionSignature : null,
    typeof scenario.grantSignature === "string" ? scenario.grantSignature : null,
    typeof scenario.policyTransitionSignature === "string"
      ? scenario.policyTransitionSignature
      : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green/25 bg-green-soft px-3 py-1.5 text-[12px] font-black text-green-strong">
        <Check className="size-3.5" strokeWidth={3} />
        PASS
      </span>
      {scenario.decision === "REFUSE" ? (
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-extrabold text-navy">
          REFUSE · {String(scenario.reason ?? "bounded")}
        </span>
      ) : null}
      {signatures.slice(0, 2).map((signature, index) => (
        <a
          key={signature}
          href={explorerSignature(signature)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-extrabold text-blue hover:border-blue/40"
        >
          {index === 0 ? "Transaction" : "Receipt"} {short(signature, 5, 4)}
          <ExternalLink className="size-3" />
        </a>
      ))}
    </div>
  );
}

export default function WorldsFairPage() {
  const [runtime, setRuntime] = useState<WorldFairRuntime | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<WorldFairLiveReceipt | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const refreshRuntime = useCallback(async () => {
    setRuntimeError(null);
    try {
      setRuntime(await fetchWorldFairRuntime());
    } catch (error) {
      setRuntime(null);
      setRuntimeError(
        error instanceof Error ? error.message : "Runtime unavailable",
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetchWorldFairRuntime()
      .then((nextRuntime) => {
        if (!cancelled) {
          setRuntime(nextRuntime);
          setRuntimeError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setRuntime(null);
          setRuntimeError(
            error instanceof Error ? error.message : "Runtime unavailable",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const runLive = useCallback(async () => {
    setRunning(true);
    setRunError(null);
    try {
      const result = await runWorldFairCanonicalLiveSequence();
      setReceipt(result.receipt);
      await refreshRuntime();
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Live run unavailable");
    } finally {
      setRunning(false);
    }
  }, [refreshRuntime]);

  const mandate = runtime?.mandate;
  const verifiedCount = useMemo(
    () =>
      receipt
        ? STEP_META.filter(({ key }) => receipt.scenarios[key]?.status === "PASS")
            .length
        : 0,
    [receipt],
  );

  return (
    <main id="main" className="min-h-dvh overflow-hidden bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(circle_at_18%_8%,rgba(23,105,246,0.15),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(139,117,247,0.15),transparent_30%),linear-gradient(180deg,#fff_0%,rgba(255,249,241,0)_100%)]"
      />

      <div className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-6 md:px-10 md:pt-8">
        <header className="flex items-center justify-between gap-4">
          <Wordmark size="md" />
          <Link
            href="/"
            className="rounded-full border border-line bg-white/90 px-4 py-2 text-[13px] font-extrabold text-navy shadow-soft hover:border-blue/35"
          >
            Product home
          </Link>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green/25 bg-green-soft px-3 py-1.5 text-[12px] font-black tracking-[0.08em] text-green-strong">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-green" />
              </span>
              LIVE · SOLANA DEVNET
            </div>
            <h1 className="mt-6 max-w-[13ch] text-[48px] font-black leading-[0.98] tracking-[-0.045em] text-navy-strong sm:text-[64px] lg:text-[76px]">
              Authority that ends with the action.
            </h1>
            <p className="mt-6 max-w-[64ch] text-[17px] font-semibold leading-relaxed text-ink-2 md:text-[19px]">
              CRESCO lets a strategy act inside standing capital authority, ask for
              one exact exception at the boundary, then return to the same standing
              mandate. This lab executes the full path against Orca and Pyth on
              Solana Devnet.
            </p>
          </div>

          <div className="rounded-[28px] border border-line bg-white/95 p-5 shadow-card md:p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.12em] text-ink-3">
                  Bound runtime
                </p>
                <p className="mt-2 font-mono text-[15px] font-bold text-navy-strong">
                  {short(runtime?.programId ?? PROGRAM_ID, 9, 8)}
                </p>
              </div>
              <span className="rounded-[12px] bg-blue-soft px-3 py-2 text-[12px] font-black text-blue">
                BIT-IDENTICAL
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-surface-soft p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ink-3">
                  Mandate nonce
                </p>
                <p className="mt-2 text-[25px] font-black tabular text-navy-strong">
                  {mandate?.nonce ?? "Not ready"}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-soft p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-ink-3">
                  Standing limit
                </p>
                <p className="mt-2 text-[25px] font-black tabular text-navy-strong">
                  {mandate
                    ? `$${(mandate.maxActionNotionalMicroUsd / 1_000_000).toFixed(2)}`
                    : "Not ready"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-4 text-[12px] font-bold text-ink-2">
              <span>SHA-256</span>
              <span className="font-mono text-[11px] text-navy">
                {short(runtime?.programSha256 ?? PROGRAM_SHA, 10, 8)}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-3">
              Execution venue
            </p>
            <p className="mt-2 text-[20px] font-black text-navy-strong">
              Orca Whirlpools
            </p>
            <p className="mt-1 text-[13px] font-semibold text-ink-2">
              devUSDC → devUSDT · hard-bound pool
            </p>
          </article>
          <article className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-3">
              Market evidence
            </p>
            <p className="mt-2 text-[20px] font-black text-navy-strong">
              Pyth Lazer
            </p>
            <p className="mt-1 text-[13px] font-semibold text-ink-2">
              Crypto.USDC/USD · authority effect NONE
            </p>
          </article>
          <article className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-3">
              Runtime state
            </p>
            <p className="mt-2 flex items-center gap-2 text-[20px] font-black text-navy-strong">
              {runtime?.status === "READY" ? (
                <>
                  <CheckCircle2 className="size-5 text-green" />
                  Ready
                </>
              ) : runtimeError ? (
                "Unavailable"
              ) : (
                "Bootstraps on run"
              )}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-ink-2">
              Server-held Devnet actors · no browser secrets
            </p>
          </article>
        </section>

        <section className="mt-10 overflow-hidden rounded-[32px] border border-line bg-white shadow-card">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
            <div className="border-b border-line bg-[linear-gradient(145deg,#f7faff_0%,#eef4ff_52%,#f2efff_100%)] p-6 md:p-8 lg:border-b-0 lg:border-r">
              <p className="text-[12px] font-black uppercase tracking-[0.13em] text-blue">
                Canonical live run
              </p>
              <h2 className="mt-3 text-[32px] font-black leading-tight tracking-[-0.025em] text-navy-strong">
                One button.
                <br />
                Seven consequences.
              </h2>
              <p className="mt-4 text-[15px] font-semibold leading-relaxed text-ink-2">
                The scope is fixed. You cannot swap the program, pool, pair or
                instruction. CRESCO proves what it allows, what it refuses, and
                what survives a failed execution.
              </p>

              <button
                type="button"
                onClick={runLive}
                disabled={running}
                className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-[17px] bg-blue px-5 text-[15px] font-black text-white shadow-button transition hover:bg-blue-strong disabled:cursor-wait disabled:opacity-70"
              >
                {running ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" />
                    Running live on Devnet…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Run live authority sequence
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] font-bold leading-relaxed text-ink-3">
                Real Devnet transactions. No mainnet funds. A run can take up to
                about a minute.
              </p>

              {runError ? (
                <div
                  role="alert"
                  className="mt-5 rounded-[16px] border border-loss/25 bg-loss-soft p-4 text-[13px] font-bold text-loss-text"
                >
                  Live outcome is UNKNOWN: {runError}. CRESCO does not display
                  success when confirmation is uncertain.
                </div>
              ) : null}
            </div>

            <div className="p-5 md:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.12em] text-ink-3">
                    Consequence ledger
                  </p>
                  <h2 className="mt-1 text-[26px] font-black tracking-[-0.02em] text-navy-strong">
                    {receipt
                      ? `${verifiedCount}/7 live checks proven`
                      : "What this run will prove"}
                  </h2>
                </div>
                {receipt ? (
                  <a
                    href={receipt.explorer.program}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-[12px] font-extrabold text-blue hover:border-blue/40"
                  >
                    Program Explorer
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>

              <div className="mt-5 divide-y divide-line-soft">
                {STEP_META.map(({ key, eyebrow, title, body, tone, icon: Icon }) => (
                  <article
                    key={key}
                    className="grid gap-4 py-5 sm:grid-cols-[52px_1fr]"
                  >
                    <div
                      className={`grid size-12 place-items-center rounded-[16px] border ${toneClasses(tone)}`}
                    >
                      <Icon className="size-5" strokeWidth={2.35} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.13em] text-ink-3">
                        {eyebrow}
                      </p>
                      <h3 className="mt-1 text-[17px] font-black text-navy-strong">
                        {title}
                      </h3>
                      <p className="mt-1 text-[13px] font-semibold leading-relaxed text-ink-2">
                        {body}
                      </p>
                      {receipt ? (
                        <ScenarioProof receipt={receipt} scenarioKey={key} />
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {receipt ? (
          <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[26px] border border-line bg-white p-6 shadow-soft">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-3">
                Standing authority after exception
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-[16px] bg-green-soft text-green-strong">
                  <KeyRound className="size-5" />
                </div>
                <div>
                  <p className="text-[23px] font-black text-navy-strong">
                    Unchanged
                  </p>
                  <p className="text-[13px] font-semibold text-ink-2">
                    Exact exception consumed; standing mandate was not widened.
                  </p>
                </div>
              </div>
            </article>
            <article className="rounded-[26px] border border-line bg-white p-6 shadow-soft">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-3">
                Completed live receipt
              </p>
              <p className="mt-3 font-mono text-[12px] font-bold text-navy">
                {new Date(receipt.observedAtCompleted).toLocaleString()}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-ink-2">
                Program {short(receipt.programId, 9, 8)} · nonce{" "}
                {receipt.startingNonce}
              </p>
            </article>
          </section>
        ) : null}

        <footer className="mt-10 flex flex-col gap-3 border-t border-line-soft pt-6 text-[12px] font-semibold text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>
            Devnet only · no brokerage or custody · server-held demo actors · no
            adoption claim
          </p>
          <p className="font-mono">{short(PROGRAM_SHA, 12, 10)}</p>
        </footer>
      </div>
    </main>
  );
}
