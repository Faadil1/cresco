"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Coins,
  Layers,
  Lock,
  PieChart,
  Plus,
  Scale,
  TrendingUp,
} from "lucide-react";
import type { Achievement, Goal, LearningModule, Lesson, ModuleState } from "@/domain/types";
import { BadgeArt } from "./illustrations/badges";
import { GoalArt, Target } from "./illustrations/objects";
import { cn } from "./ui/primitives";

export function MissionCard({ title, body, href, done }: { title: string; body: string; xp: number; href: string; done?: boolean }) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-3.5 overflow-hidden rounded-[24px] border border-line-soft bg-surface p-4 pr-3"
    >
      <Target className="size-[62px] shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-navy-strong">{title}</p>
        <p className="mt-0.5 text-[13.5px] leading-snug text-ink-2">{body}</p>
        <p className="mt-1.5 text-[12.5px] text-green-strong">{done ? "Completed" : "Learning progress only · never changes your Key"}</p>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch">
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-yellow-soft text-orange-text">
          {done ? <Check className="size-4" strokeWidth={1.75} /> : <Plus className="size-4" strokeWidth={1.75} />}
        </span>
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-navy-strong text-bg">
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </span>
      </div>
    </Link>
  );
}

const MODULE_ICONS = {
  coins: Coins,
  building: Building2,
  pie: PieChart,
  trend: TrendingUp,
  scale: Scale,
  layers: Layers,
};

const TONE_BG: Record<LearningModule["tone"], string> = {
  green: "bg-green-soft text-green-strong",
  blue: "bg-blue-soft text-blue",
  lavender: "bg-lavender-soft text-[#4c58a8]",
  orange: "bg-yellow-soft text-orange-text",
  aqua: "bg-aqua-soft text-[#3d7a75]",
  pink: "bg-pink-soft text-[#a24f67]",
};

export function ModuleIcon({ module, size = 44, muted }: { module: LearningModule; size?: number; muted?: boolean }) {
  const Icon = MODULE_ICONS[module.icon];
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        TONE_BG[module.tone],
        muted && "opacity-60 saturate-50",
      )}
      style={{ width: size, height: size }}
    >
      <Icon className="size-[46%]" strokeWidth={1.75} />
    </span>
  );
}

export function LessonCard({ lesson, module, href, locked }: { lesson: Lesson; module: LearningModule; href: string; locked?: boolean }) {
  return (
    <Link href={href} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[18px] border border-line-soft bg-surface p-3">
      <ModuleIcon module={module} size={40} muted={locked} />
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold leading-tight text-navy-strong">{lesson.title}</p>
        <p className="mt-1 flex items-center gap-1 text-[12px] text-ink-2">
          {locked ? <Lock aria-hidden className="size-3" /> : <Clock aria-hidden className="size-3" />}
          {locked ? "Up next" : `${lesson.minutes} min`}
        </p>
      </div>
    </Link>
  );
}

export function ModuleRow({
  module,
  state,
  href,
}: {
  module: LearningModule;
  state: ModuleState;
  href?: string;
}) {
  const current = state === "current";
  const inner = (
    <>
      <span className={cn("rounded-full", current && "bg-white/20 p-[3px]")}>
        <ModuleIcon module={module} size={current ? 40 : 44} muted={state === "locked"} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-semibold leading-tight", current ? "text-white" : state === "locked" ? "text-navy/70" : "text-navy-strong")}>
          {module.title}
        </p>
        <p className={cn("mt-0.5 text-[12.5px] font-semibold", current ? "text-white" : "text-ink-2")}>{module.subtitle}</p>
        <p className={cn("mt-0.5 text-[12.5px] font-semibold", current ? "text-white" : "text-ink-3")}>
          Learning only · does not change your Key
        </p>
      </div>
      {state === "complete" ? (
        <span className="grid size-8 place-items-center rounded-full bg-green text-white" aria-label="Completed">
          <Check className="size-[18px]" strokeWidth={1.75} />
        </span>
      ) : state === "current" ? (
        <span className="grid size-9 place-items-center rounded-full bg-bg text-navy-strong" aria-hidden>
          <ChevronRight className="size-5" strokeWidth={1.75} />
        </span>
      ) : (
        <span className="grid size-8 place-items-center text-ink-3" aria-label="Locked">
          <Lock className="size-[18px]" strokeWidth={1.75} />
        </span>
      )}
    </>
  );
  const cls = cn(
    "flex items-center gap-3 rounded-[20px] px-3.5 py-3",
    current ? "bg-navy-strong" : "border border-line-soft bg-surface",
    state === "locked" && "bg-surface-soft",
  );
  if (href && state !== "locked") {
    return (
      <li>
        <Link href={href} className={cls} aria-current={current ? "step" : undefined}>
          {inner}
        </Link>
      </li>
    );
  }
  return (
    <li className={cls} aria-disabled={state === "locked" || undefined}>
      {inner}
    </li>
  );
}

export function LessonProgress({ step, total, className }: { step: number; total: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label="Lesson progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e1e5ea]"
      >
        <div className="h-full rounded-full bg-green transition-[width] duration-500 ease-out" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <span className="text-[13px] text-ink-2 tabular">
        {step} of {total}
      </span>
    </div>
  );
}

export function QuizOption({
  label,
  selected,
  state,
  onSelect,
}: {
  label: string;
  selected: boolean;
  state: "idle" | "correct" | "incorrect";
  onSelect: () => void;
}) {
  const correct = selected && state === "correct";
  const incorrect = selected && state === "incorrect";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex h-[52px] w-full items-center gap-3 rounded-[14px] border-2 px-4 text-left text-[15px] font-medium transition-[border-color,background-color,transform] duration-200",
        correct
          ? "animate-bloom border-green bg-green-soft text-green-strong"
          : incorrect
            ? "border-[#e3c9b8] bg-[#f5f6f8] text-navy"
            : selected
              ? "border-blue bg-blue-soft text-navy"
              : "border-line-soft bg-surface text-navy hover:border-line",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2",
          correct ? "border-green bg-green" : selected ? "border-blue" : "border-[#c3cad3]",
        )}
      >
        {selected && !correct ? <span className="size-2.5 rounded-full bg-blue" /> : null}
        {correct ? <Check className="size-3 text-white" strokeWidth={4} /> : null}
      </span>
      <span className="flex-1">{label}</span>
      {correct ? (
        <span className="grid size-6 place-items-center rounded-full bg-green text-white" aria-label="Correct">
          <Check className="size-4" strokeWidth={1.75} />
        </span>
      ) : null}
    </button>
  );
}

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <li className="flex flex-col items-center rounded-[18px] px-1 py-2 text-center">
      <BadgeArt badge={achievement.id} earned={achievement.earned} className="size-[68px]" />
      <p className="mt-1.5 text-[13px] font-semibold leading-tight text-navy-strong">{achievement.title}</p>
      <p className="mt-0.5 text-[11.5px] leading-snug text-ink-2">{achievement.caption}</p>
      {!achievement.earned ? <span className="sr-only">Not earned yet</span> : null}
    </li>
  );
}

const GOAL_TONES: Record<Goal["tone"], string> = {
  blue: "bg-surface",
  pink: "bg-surface",
  yellow: "bg-surface",
  aqua: "bg-surface",
  rose: "bg-surface",
};

export function GoalCard({ goal, selected, onSelect, className }: { goal: Goal; selected: boolean; onSelect: () => void; className?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-end gap-2 rounded-[24px] border px-3 pb-3.5 pt-4 transition-[border-color,transform] duration-200 active:scale-[0.98]",
        GOAL_TONES[goal.tone],
        selected ? "border-blue ring-1 ring-blue" : "border-line-soft hover:border-line",
        className,
      )}
    >
      {selected ? (
        <span className="animate-bloom absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-blue text-white">
          <Check className="size-4" strokeWidth={1.75} />
        </span>
      ) : null}
      <GoalArt goal={goal.id} className="h-[70px] w-[100px]" />
      <span className="text-[14px] font-medium text-navy-strong">{goal.label}</span>
    </button>
  );
}
