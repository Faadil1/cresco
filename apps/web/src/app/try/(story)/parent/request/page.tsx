import type { Metadata } from "next";
import { ParentRequest } from "@/components/family-story-parent";

export const metadata: Metadata = { title: "Parent request - Cresco Family story" };
export default function Page() { return <ParentRequest/>; }
