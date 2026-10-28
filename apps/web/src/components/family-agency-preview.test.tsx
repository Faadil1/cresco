import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FamilyAgencyPreview } from "./family-agency-preview";

afterEach(() => vi.unstubAllGlobals());

describe("Cresco Family: local agency story, no financial capability", () => {
  it("lets the Teen set aside practice credits without a Parent approval and never creates value", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<FamilyAgencyPreview />);
    expect(screen.getByTestId("practice-available")).toHaveTextContent("100");
    expect(screen.getByTestId("practice-saved")).toHaveTextContent("0");

    await userEvent.click(screen.getByRole("button", { name: /set aside 20 practice credits/i }));
    expect(screen.getByTestId("practice-available")).toHaveTextContent("80");
    expect(screen.getByTestId("practice-saved")).toHaveTextContent("20");
    expect(screen.getByText(/you made a saving choice yourself/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("illustrates a Teen request and Parent approval without any purchase or authority change", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<FamilyAgencyPreview />);
    const parent = screen.getByRole("article", { name: /parent practice view/i });
    expect(within(parent).getByRole("button", { name: /approve practice discussion/i })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /ask to explore a diversified fund/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/waiting for a Parent decision/i);
    await userEvent.click(within(parent).getByRole("button", { name: /approve practice discussion/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/nothing was purchased/i);
    expect(screen.getByTestId("practice-available")).toHaveTextContent("100");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /ask to explore/i })).toBeDisabled();
  });

  it("supports a negative Parent decision, then resets all temporary state", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<FamilyAgencyPreview />);
    await userEvent.click(screen.getByRole("button", { name: /set aside 20 practice credits/i }));
    await userEvent.click(screen.getByRole("button", { name: /ask to explore a diversified fund/i }));
    await userEvent.click(screen.getByRole("button", { name: /decline practice discussion/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/Parent declined/i);
    expect(screen.getByTestId("practice-saved")).toHaveTextContent("20");
    await userEvent.click(screen.getByRole("button", { name: /reset practice/i }));
    expect(screen.getByTestId("practice-available")).toHaveTextContent("100");
    expect(screen.getByTestId("practice-saved")).toHaveTextContent("0");
    expect(screen.getByRole("status")).toHaveTextContent(/choices are yours/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("cannot save more than the imaginary opening credits", async () => {
    render(<FamilyAgencyPreview />);
    const save = screen.getByRole("button", { name: /set aside 20 practice credits/i });
    for (let n = 0; n < 5; n += 1) await userEvent.click(save);
    expect(screen.getByTestId("practice-available")).toHaveTextContent("0");
    expect(screen.getByTestId("practice-saved")).toHaveTextContent("100");
    expect(save).toBeDisabled();
  });
});
