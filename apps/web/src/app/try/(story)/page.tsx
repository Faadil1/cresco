import type { Metadata } from "next";
import { WelcomeChapter } from "@/components/family-story-welcome";

export const metadata: Metadata = {
  title: "Cresco Family story - learn to decide together",
  description: "A short illustrated story for a teen and a Parent: pick a goal, learn, research invented companies, make a practice choice inside a limit, and talk it through. Pretend credits only. No sign-in.",
};
export default function TryWelcomePage() { return <WelcomeChapter/>; }
