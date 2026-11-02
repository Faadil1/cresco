import type { Metadata } from "next";
import { RealCompanyResearch } from "@/components/family-real-company-research";

export const metadata: Metadata = {
  title: "Real companies - Cresco Family",
  description: "Research actual public companies using official sources, without real investments, live prices, or buying.",
};
export default function RealCompaniesPage() { return <RealCompanyResearch/>; }
