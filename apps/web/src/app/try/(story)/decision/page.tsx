import type { Metadata } from "next";
import { DecisionChapter } from "@/components/family-story-decision";

export const metadata: Metadata = { title: "Make a choice - Cresco Family story" };
export default function DecisionPage() { return <DecisionChapter/>; }
