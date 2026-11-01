import type { Metadata } from "next";
import { ProfileScreen } from "@/components/family-story-profile";

export const metadata: Metadata = { title: "Profile - Cresco Family", description: "Your practice goal, interests, learning, wins and My Key. No name, age or account." };
export default function TryProfilePage() { return <ProfileScreen/>; }
