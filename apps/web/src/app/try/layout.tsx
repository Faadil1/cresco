import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { FamilyStoryProvider } from "@/components/family-story-provider";

export default function TryLayout({ children }: { children: ReactNode }) {
  // Dedicated public browser-only experience; never exposed outside the Family-only build.
  if (process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1") notFound();
  return <FamilyStoryProvider>{children}</FamilyStoryProvider>;
}
