import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/family-story-portfolio";

export const metadata: Metadata = { title: "Portfolio - Cresco Family", description: "Practice-only portfolio: fictional holdings, receipts and invented what-if scenarios." };
export default function TryPortfolioPage() { return <PortfolioScreen/>; }
