import type { Metadata } from "next";
import { HomeScreen } from "@/components/family-story-home";

export const metadata: Metadata = { title: "Home - Cresco Family", description: "Your practice home: goal, today's mission, learning, people to meet and your Parent. Pretend credits only." };
export default function TryHomePage() { return <HomeScreen/>; }
