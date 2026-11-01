import { notFound } from "next/navigation";
import { CompanyChapter } from "@/components/family-story-explore";
import { STORY_EXPLORE_IDS } from "@/lib/family-story-routes";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!STORY_EXPLORE_IDS.includes(id)) notFound();
  return <CompanyChapter key={id} id={id}/>;
}
