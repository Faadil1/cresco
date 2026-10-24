import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { addMoney, dispatch, toast } = vi.hoisted(() => ({
  addMoney: vi.fn(), dispatch: vi.fn(), toast: vi.fn(),
}));

vi.mock("@/services", () => ({ funding: { addMoney } }));
vi.mock("@/state/store", () => ({
  useStore: () => ({ state: { profile: { childName: "Alex" }, money: { balance: 20 } }, dispatch }),
}));
vi.mock("@/components/mode", () => ({ MoneyBalanceCard: () => <div>Test balance</div> }));
vi.mock("@/components/ui/feedback", () => ({ useToast: () => toast }));
vi.mock("@/domain/format", () => ({ formatAmount: (x: number) => `$${x.toFixed(2)}` }));
vi.mock("@/hooks/single-flight", () => ({ useSingleFlight: () => (fn: () => Promise<void>) => fn }));
vi.mock("@/components/ui/primitives", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  Chip: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
  ActionButton: ({ children, onClick, disabled }: {
    children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  }) => <button type="button" onClick={onClick} disabled={disabled}>{children}</button>,
}));
import AddMoneyPage from "./page";

describe("demo-only credit is fail-closed and retryable", () => {
  beforeEach(() => { addMoney.mockReset(); dispatch.mockReset(); toast.mockReset(); });

  it("does not mutate balance or falsely confirm a failed backend response", async () => {
    addMoney.mockRejectedValueOnce(new Error("backend 503"));
    render(<AddMoneyPage />);
    expect(screen.getByRole("heading", { name: "Add demo credit" })).toBeVisible();
    expect(screen.getByText(/not a bank account or real investment/i)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Add $25.00 demo credit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be confirmed/i);
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Add $25.00 demo credit" })).toBeEnabled();
  });

  it("refuses inconsistent credit responses without local balance mutation", async () => {
    addMoney.mockResolvedValueOnce({ status: "DEVNET_TEST_CREDITED", amount: 99 });
    render(<AddMoneyPage />);
    await userEvent.click(screen.getByRole("button", { name: "Add $25.00 demo credit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be confirmed/i);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("updates local demo display only on confirmed matching test credit", async () => {
    addMoney.mockResolvedValueOnce({ status: "DEMO_CREDITED", amount: 25 });
    render(<AddMoneyPage />);
    await userEvent.click(screen.getByRole("button", { name: "Add $25.00 demo credit" }));
    await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: "addFunds", amount: 25 }));
    expect(screen.getByText(/demo credit added/i)).toBeVisible();
    expect(screen.getByText(/No payment was taken/i)).toBeVisible();
  });
});
