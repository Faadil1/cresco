import type { ReactNode } from "react";
import { FamilyAppShell } from "@/components/family-app-shell";

export default function StoryLayout({ children }: { children: ReactNode }) {
  return <FamilyAppShell>{children}</FamilyAppShell>;
}
