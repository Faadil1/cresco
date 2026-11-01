import { notFound } from "next/navigation";
import { LessonReader } from "@/components/family-story-learn";
import { STORY_LESSON_IDS } from "@/lib/family-story-routes";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(STORY_LESSON_IDS as readonly string[]).includes(id)) notFound();
  return <LessonReader key={id} id={id}/>;
}
