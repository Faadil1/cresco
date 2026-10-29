import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FamilyParentTrustCenter } from "./family-parent-trust-center";

afterEach(() => vi.unstubAllGlobals());

describe("Family Parent Trust Center", () => {
  it("clearly separates practice and Devnet, discloses crypto, risks and guardian limitations", async () => {
    render(<FamilyParentTrustCenter />);
    const center = screen.getByTestId("family-parent-trust-center");
    expect(within(center).getByText(/imaginary credits only/i)).toBeInTheDocument();
    expect(within(center).getByText(/this learning preview does not move money/i)).toBeInTheDocument();
    expect(within(center).getByText(/technical role and wallet demonstrations/i)).toBeInTheDocument();
    expect(within(center).getByText(/real financial services for minors are not offered here/i)).toBeInTheDocument();
    await userEvent.click(within(center).getByText(/is there crypto behind cresco/i));
    expect(within(center).getByText(/explores blockchain-based permission controls on solana/i)).toBeVisible();
    await userEvent.click(within(center).getByText(/who can see my child's data/i));
    expect(within(center).getByText(/asks for no name, email, age, wallet or child details/i)).toBeVisible();
  });

  it("gives clear correction for wrong answers and explicit no-consent status", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<FamilyParentTrustCenter />);
    const controls = screen.getAllByRole("group");
    const q1 = controls.find((x) => /if a child sets aside 20 practice credits/i.test(x.textContent ?? ""));
    expect(q1).toBeDefined();
    await userEvent.click(within(q1!).getByRole("button", { name: /yes, it is a real deposit/i }));
    expect(within(q1!).getByRole("status")).toHaveTextContent(/never deposits real money/i);
    await userEvent.click(within(q1!).getByRole("button", { name: /no, it is only a simulation/i }));
    expect(within(q1!).getByRole("status")).toHaveTextContent(/practice credits are imaginary/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not convert understanding into a real financial permission or persist answers", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<FamilyParentTrustCenter />);
    for (const label of [
      /no, it is only a simulation/i,
      /no, only the discussion is approved/i,
      /no, legal guardian checks are separate/i,
    ]) {
      await userEvent.click(screen.getByRole("button", { name: label }));
    }
    expect(screen.getByText(/this is not approval to open an account or invest/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /clear these answers/i }));
    expect(screen.queryByText(/you understand these three practice boundaries/i)).not.toBeInTheDocument();
    expect(screen.getByText(/not submitted, saved or used as legal consent/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
