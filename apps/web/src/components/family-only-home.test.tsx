import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FamilyOnlyHome } from "./family-only-home";

vi.mock("@/components/family-agency-preview", () => ({
  FamilyAgencyPreview: () => <section aria-label="Mocked practice experience" />,
}));
vi.mock("@/components/family-parent-trust-center", () => ({
  FamilyParentTrustCenter: () => <section aria-label="Mocked Parent Trust Center" />,
}));
vi.mock("@/components/shell", () => ({
  Wordmark: () => <span>Cresco</span>,
}));

describe("Family-only landing first impression", () => {
  it("shows the promise, one main action and the learning loop on the first screen", () => {
    render(<FamilyOnlyHome />);
    expect(screen.getByRole("heading", { level: 1, name: /your child takes the lead.*you set the boundaries/i })).toBeInTheDocument();
    const loop = screen.getByTestId("family-three-steps");
    expect(within(loop).getAllByRole("listitem")).toHaveLength(5);
    expect(within(loop).getByRole("heading", { name: /decide inside the key/i })).toBeInTheDocument();
    const worlds = screen.getByTestId("family-two-worlds");
    expect(within(worlds).getByText(/100 pretend credits/i)).toBeInTheDocument();
    expect(within(worlds).getByText(/imaginary dollars\. no orders/i)).toBeInTheDocument();
  });

  it("does not imply real child accounts, licensed finance or an approved real investment", () => {
    render(<FamilyOnlyHome />);
    expect(screen.getByText(/this is a fictional learning exercise/i)).toBeInTheDocument();
    expect(screen.getByText(/single-browser simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/does not prove separate accounts, legal guardianship/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /try cresco - no sign-in/i })).toHaveAttribute("href", "/try");
    expect(screen.getByRole("link", { name: /what parents should know/i })).toHaveAttribute("href", "#family-trust");
    expect(screen.queryByRole("link", { name: /invest now|buy stocks|earn yield/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /separate family setup preview/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/invited adult researchers/i)).not.toBeInTheDocument();
  });
});
