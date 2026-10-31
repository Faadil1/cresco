import type { Metadata } from "next";
import { LearnChapter } from "@/components/family-story-learn";

export const metadata: Metadata = { title: "My learning path - Cresco Family story" };
export default function LearnPage() { return <LearnChapter/>; }
