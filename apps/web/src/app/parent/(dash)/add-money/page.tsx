"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { MoneyBalanceCard } from "@/components/mode";
import { useToast } from "@/components/ui/feedback";
import { ActionButton, Card, Chip, PageHeader } from "@/components/ui/primitives";
import { formatAmount } from "@/domain/format";
import { funding } from "@/services";
import { useSingleFlight } from "@/hooks/single-flight";
import { useStore } from "@/state/store";

const AMOUNTS = [10, 25, 50, 100];

export default function AddMoneyPage() {
  const { state, dispatch } = useStore();
  const guard = useSingleFlight();
  const toast = useToast();
  const [amount, setAmount] = useState<number | "custom">(25);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const value = amount === "custom" ? Number(custom) : amount;
  const valid = Number.isFinite(value) && value > 0 && value <= 500;

  const add = guard(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await funding.addMoney({ amount: value });
      if ((res.status !== "DEMO_CREDITED" && res.status !== "DEVNET_TEST_CREDITED") || res.realPaymentTaken !== false || !Number.isFinite(res.amount) || res.amount !== value) {
        throw new Error("Unverified practice-credit result");
      }
      dispatch({ type: "addFunds", amount: res.amount });
      setDone(res.amount);
      toast(`${formatAmount(res.amount)} practice funds added`);
    } catch {
      setError("We could not confirm this practice credit. Your displayed balance was not updated. Check the balance before trying again.");
    } finally {
      setBusy(false);
    }
  });

  return (
    <div className="animate-rise mx-auto max-w-[560px]">
      <PageHeader title="Add practice funds" subtitle={`Simulated funds for ${state.profile.childName}'s demo balance`} back="/parent" />
      <div className="mt-5">
        <MoneyBalanceCard balance={state.money.balance} />
      </div>

      {done != null ? (
        <Card className="mt-5 p-5 text-center">
          <CheckCircle2 aria-hidden className="animate-bloom mx-auto size-12 text-green" />
          <p className="mt-2 text-[18px] font-semibold text-navy-strong">{formatAmount(done)} in practice funds added</p>
          <p className="mt-1 text-[13.5px] text-ink-2">Demo funds only. No payment was taken.</p>
          <ActionButton className="mt-4" href="/parent" variant="secondary">
            Back to overview
          </ActionButton>
        </Card>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Amount">
            {AMOUNTS.map((a) => (
              <Chip key={a} selected={amount === a} onClick={() => setAmount(a)} className="h-12 flex-1 px-4 text-[15px]">
                {formatAmount(a)}
              </Chip>
            ))}
            <Chip selected={amount === "custom"} onClick={() => setAmount("custom")} className="h-12 flex-1 px-4 text-[15px]">
              Custom
            </Chip>
          </div>
          {amount === "custom" ? (
            <label className="mt-3 block">
              <span className="text-[14px] font-semibold text-navy-strong">Custom amount (up to $500)</span>
              <input
                inputMode="decimal"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="$0"
                className="mt-1.5 h-[52px] w-full rounded-[15px] border border-line bg-surface px-4 text-[16px] font-medium text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
              />
            </label>
          ) : null}
          <p className="mt-4 rounded-[14px] bg-yellow-soft px-3.5 py-3 text-[13px] font-semibold text-[#6e5119]">
            Practice only. No bank or card is connected, no payment is taken, and the balance cannot be withdrawn or spent outside this demo.
          </p>
          {error ? <p role="alert" className="mt-3 text-[13px] font-semibold text-loss-text">{error}</p> : null}
          <ActionButton className="mt-5" disabled={!valid || busy} onClick={add}>
            {busy ? "Adding…" : `Add ${valid ? formatAmount(value) : ""} practice funds`}
          </ActionButton>
        </>
      )}
    </div>
  );
}
