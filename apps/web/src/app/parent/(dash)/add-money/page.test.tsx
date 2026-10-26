import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { addMoney, dispatch, toast } = vi.hoisted(() => ({
  addMoney: vi.fn(),
  dispatch: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/components/mode", () => ({
  MoneyBalanceCard: ({ balance }: { balance: number }) => <div>Demo balance: {balance}</div>,
}));

vi.mock("@/components/ui/feedback", () => ({
  useToast: () => toast,
}));

vi.mock("@/components/ui/primitives", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Chip: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) =>
    <button type="button" onClick={onClick}>{children}</button>,
  ActionButton: ({
    children, onClick, disabled, href,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    href?: string;
  }) => href
    ? <a href={href}>{children}</a>
    : <button type="button" disabled={disabled} onClick={onClick}>{children}</button>,
}));

vi.mock("@/hooks/single-flight", () => ({
  useSingleFlight: () => (fn: () => Promise<void>) => fn,
}));

vi.mock("@/services", () => ({
  funding: { addMoney },
}));

vi.mock("@/state/store", () => ({
  useStore: () => ({
    state: { profile: { childName: "Jordan" }, money: { balance: 40 } },
    dispatch,
  }),
}));

import AddMoneyPage from "./page";

describe("CRESCO practice-only funding", () => {
  beforeEach(() => {
    addMoney.mockReset();
    dispatch.mockReset();
    toast.mockReset();
  });

  it("does not change the demo balance on a failed backend request and enables retry", async () => {
    addMoney.mockRejectedValueOnce(new Error("network unavailable"));
    render(<AddMoneyPage />);

    const button = screen.getByRole("button", { name: /Add .* practice funds/i });
    await userEvent.click(button);

    expect(await screen.findByRole("alert")).toHaveTextContent("Practice funds were not confirmed");
    expect(button).toBeEnabled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });

  it("fails closed if a backend reply does not explicitly confirm no payment", async () => {
    addMoney.mockResolvedValueOnce({ status: "DEMO_CREDITED", amount: 25 });
    render(<AddMoneyPage />);

    await userEvent.click(screen.getByRole("button", { name: /Add .* practice funds/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Practice funds were not confirmed");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("credits only a verified practice-only response of the requested amount", async () => {
    addMoney.mockResolvedValueOnce({
      status: "DEMO_CREDITED", amount: 25, realPaymentTaken: false,
    });
    render(<AddMoneyPage />);

    await userEvent.click(screen.getByRole("button", { name: /Add .* practice funds/i }));

    expect(await screen.findByText(/practice funds added/i)).toBeInTheDocument();
    expect(dispatch).toHaveBeenCalledWith({ type: "addFunds", amount: 25 });
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it("refuses a response credit amount different from the selected practice amount", async () => {
    addMoney.mockResolvedValueOnce({
      status: "DEMO_CREDITED", amount: 50, realPaymentTaken: false,
    });
    render(<AddMoneyPage />);

    await userEvent.click(screen.getByRole("button", { name: /Add .* practice funds/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Practice funds were not confirmed");
    expect(dispatch).not.toHaveBeenCalled();
  });
});
