import type { ReactNode } from "react";
import { StoryFrame } from "@/components/family-story-ui";

export default function StoryLayout({ children }: { children: ReactNode }) {
  return <StoryFrame>{children}</StoryFrame>;
}
