import type { Metadata } from "next";
import { PaperPortfolioScreen } from "@/components/family-story-portfolio";

export const metadata: Metadata = {
  title: "Paper dollars - Cresco Family",
  description: "Your separate imaginary-dollar paper portfolio of real company names. No real money, orders or accounts.",
};
export default function PaperPortfolioPage() { return <PaperPortfolioScreen/>; }
