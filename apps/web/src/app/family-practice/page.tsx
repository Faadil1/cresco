import { notFound } from "next/navigation";
import Link from "next/link";
import { FamilyPracticeLab } from "@/components/family-practice-lab";
import { Wordmark } from "@/components/shell";

export default function FamilyPracticePage() {
  // Never surface the Family-only research flow inside the historic Colosseum build.
  if (process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1") notFound();
  return (
    <main id="main" className="cresco-app-workspace min-h-dvh">
      <div className="mx-auto max-w-[1120px] px-5 pt-7 md:px-10">
        <header className="flex items-center justify-between">
          <Wordmark size="md"/>
          <Link href="/" className="text-[13px] font-bold text-green-strong underline underline-offset-4">
            About Cresco Family
          </Link>
        </header>
      </div>
      <FamilyPracticeLab/>
    </main>
  );
}
