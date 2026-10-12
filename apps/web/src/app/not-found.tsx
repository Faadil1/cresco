import { PlantPot } from "@/components/illustrations/objects";
import { ActionButton } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-[420px] flex-col items-center justify-center px-5 text-center">
      <PlantPot className="size-24" />
      <h1 className="mt-4 text-[34px] font-display font-normal text-navy-strong">This page hasn&apos;t grown yet</h1>
      <p className="mt-2 text-[15px] text-ink-2">The link may be old or mistyped.</p>
      <ActionButton href="/home" className="mt-6">
        Go to Home
      </ActionButton>
    </main>
  );
}
