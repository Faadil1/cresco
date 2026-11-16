import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FamilyClassicLab } from "@/components/family-classic-lab";

export const metadata: Metadata = {
  title: "Classic practice lab - Cresco Family",
  description: "The older all-in-one practice layout, kept for comparison. Pretend credits only; no sign-in, wallet or real funds.",
};

export default function TryFamilyPage() {
  // Dedicated public browser-only experience; never expose historical API routes.
  if (process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1") notFound();
  return <FamilyClassicLab/>;
}
