import type { Metadata } from "next";
import { GoalChapter } from "@/components/family-story-goal";

export const metadata: Metadata = { title: "My goal - Cresco Family story" };
export default function GoalPage() { return <GoalChapter/>; }
