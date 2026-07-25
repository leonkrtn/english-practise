"use client";

import { Award, Blocks, BookOpen, Crown, Flame, GraduationCap, Lock, Repeat, Target, TrendingUp, Trophy, Zap } from "lucide-react";
import type { Badge } from "@/lib/gamification";

/** Badge definitions name their icon as a string so lib/gamification.ts stays free of JSX and can
 * be imported anywhere; this map is the single place those names turn into components. */
const ICONS: Record<string, typeof Award> = {
  Award,
  Blocks,
  BookOpen,
  Crown,
  Flame,
  GraduationCap,
  Repeat,
  Target,
  TrendingUp,
  Trophy,
  Zap,
};

export function BadgeMedal({ badge, earned, size = 40 }: { badge: Badge; earned: boolean; size?: number }) {
  const Icon = earned ? ICONS[badge.icon] || Award : Lock;
  return (
    <span
      className={
        "rounded-full flex items-center justify-center shrink-0 transition-all " +
        (earned
          ? "bg-gradient-to-br from-amber to-amber-dark text-white shadow-[0_6px_16px_-6px_rgba(232,161,46,0.7)]"
          : "bg-line-soft text-ink-faint")
      }
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.45)} />
    </span>
  );
}

/** Full card used in the Stats screen's achievement grid — earned badges are in colour and show
 * their description, locked ones stay grey and show how far along the learner is instead. */
export function BadgeCard({ badge, earned, progress }: { badge: Badge; earned: boolean; progress?: [number, number] }) {
  const pct = progress && progress[1] > 0 ? Math.min(100, Math.round((progress[0] / progress[1]) * 100)) : null;
  return (
    <div
      className={
        "flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all " +
        (earned ? "bg-card border-amber/30 shadow-[0_2px_10px_-4px_rgba(232,161,46,0.35)]" : "bg-card/60 border-line-soft")
      }
    >
      <BadgeMedal badge={badge} earned={earned} size={38} />
      <div className="min-w-0 flex-1">
        <div className={"text-[13px] font-semibold truncate " + (earned ? "text-ink" : "text-ink-soft")}>{badge.title}</div>
        <div className="text-[11.5px] text-ink-faint leading-snug">{badge.description}</div>
        {!earned && pct !== null && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex-1 h-1 rounded-full bg-line-soft overflow-hidden">
              <span className="block h-full rounded-full bg-ink-faint/50" style={{ width: pct + "%" }} />
            </span>
            <span className="text-[10.5px] text-ink-faint tabular-nums shrink-0">
              {Math.min(progress![0], progress![1])}/{progress![1]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
