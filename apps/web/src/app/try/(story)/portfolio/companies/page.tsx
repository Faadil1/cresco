import type { Metadata } from "next";
import { RealCompanyResearch } from "@/components/family-real-company-research";

export const metadata: Metadata = {
  title: "Real companies - Cresco Family",
  description: "Learn about real companies with sourced SEC annual figures and optional display-only TradingView charts; no real holdings or trades.",
};
export default function RealCompaniesPage() { return <RealCompanyResearch/>; }
