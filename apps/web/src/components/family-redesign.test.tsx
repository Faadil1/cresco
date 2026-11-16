import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/try/home" }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import { FamilyStoryProvider } from "./family-story-provider";
import { HomeScreen } from "./family-story-home";
import { PaperPortfolioScreen, PortfolioScreen } from "./family-story-portfolio";
import { JourneyTrack } from "./family-story-ui";
import { initialStory, chapterStatus } from "@/lib/family-story-state";

const inApp = (node: ReactNode) => render(<FamilyStoryProvider>{node}</FamilyStoryProvider>);

describe("Family redesign (2026-11-16)", () => {
  it("the journey track marks only what really happened and points at the first open step", () => {
    const status = { ...chapterStatus(initialStory()), goal: true, learn: true };
    render(<JourneyTrack status={status}/>);
    const nav = screen.getByRole("navigation", { name: "My learning loop" });
    expect(nav).toHaveAttribute("data-done", "2");
    expect(within(nav).getAllByRole("link")).toHaveLength(5);
    expect(within(nav).getByRole("link", { current: "step" })).toHaveAttribute("data-step", "explore");
  });

  it("Home shows the next step, the loop, credits and the Key without opening anything", () => {
    inApp(<HomeScreen/>);
    expect(screen.getByTestId("home-mission")).toHaveAttribute("data-mission", "choose-goal");
    expect(screen.getByTestId("journey-track")).toHaveAttribute("data-done", "0");
    expect(screen.getByTestId("home-key")).toHaveTextContent("15 credits");
    expect(screen.getByTestId("home-credit-bar")).toHaveAttribute("aria-label", expect.stringMatching(/0 saved.*100 free/));
    expect(screen.queryByText(/legacy|experiment/i)).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/^reality-/)).toHaveLength(1);
  });

  it("the two portfolios are separate pages with their own tag and are never summed", () => {
    const pretend = inApp(<PortfolioScreen/>);
    expect(screen.getByTestId("reality-pretend")).toBeInTheDocument();
    expect(screen.getByTestId("portfolio-available")).toHaveTextContent("100");
    expect(screen.queryByText(/\$1,000/)).not.toBeInTheDocument();
    expect(screen.queryByText(/onchain/i)).not.toBeInTheDocument();
    pretend.unmount();
    inApp(<PaperPortfolioScreen/>);
    expect(screen.getByTestId("reality-real")).toBeInTheDocument();
    expect(screen.getByTestId("paper-cash")).toHaveTextContent("$1,000.00");
    expect(screen.queryByTestId("portfolio-available")).not.toBeInTheDocument();
    expect(screen.getByTestId("paper-empty")).toBeInTheDocument();
  });
});
