import type { Metadata } from "next";
import { RealCompanyResearch } from "@/components/family-real-company-research";

export const metadata: Metadata = {
  title: "Real companies - Cresco Family",
  description: "Understand four real businesses with dated SEC annual figures, an optional third-party chart and a separate imaginary-dollar paper trade. No real money or orders.",
};
export default function RealCompaniesExplorePage() { return <RealCompanyResearch/>; }
