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
  it("shows child action and parental boundaries within the first screen", () => {
    render(<FamilyOnlyHome />);
    expect(screen.getByRole("heading", { level: 1, name: /your child takes the lead.*you set the boundaries/i })).toBeInTheDocument();
    const rolePreview = screen.getByTestId("family-hero-role-comparison");
    expect(within(rolePreview).getByRole("heading", { name: /teen view.*i make a choice/i })).toBeInTheDocument();
    expect(within(rolePreview).getByRole("heading", { name: /parent view.*i guide the boundaries/i })).toBeInTheDocument();
    expect(within(rolePreview).getByText(/my next question: can i learn about diversified funds/i)).toBeInTheDocument();
    expect(within(rolePreview).getByText(/approve or decline the/i)).toBeInTheDocument();
  });

  it("does not imply real child accounts, licensed finance or an approved real investment", () => {
    render(<FamilyOnlyHome />);
    expect(screen.getByText(/no-money learning illustration, not a real family account/i)).toBeInTheDocument();
    expect(screen.getByText(/single-browser simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/does not prove separate accounts, legal guardianship/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /try the family practice story/i })).toHaveAttribute("href", "#family-agency-preview-title");
    expect(screen.getByRole("link", { name: /what parents should know/i })).toHaveAttribute("href", "#family-trust");
    expect(screen.queryByRole("link", { name: /invest now|buy stocks|earn yield/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /separate family setup preview/i })).toHaveAttribute("href", "/worlds-fair/desk?case=family");
  });
});
