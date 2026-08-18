"use client";

import { levelProgress } from "@/lib/gamification";
import ShimmerText from "@/components/kokonutui/shimmer-text";

/**
 * The level readout in the top bar: current level, job title, and how far along the bar to the
 * next one. Keeping XP permanently on screen is what makes earning it at the end of a session feel
 * like it went somewhere.
 *
 * Hidden on phones — the top bar's icon row already claims the full width there, so the pill would
 * only be squeezed into an unreadable sliver. Home's level card and the Stats overview show the
 * same numbers with room to breathe.
 */
export default function LevelPill({ xp, onClick }: { xp: number; onClick: () => void }) {
  const p = levelProgress(xp);
  return (
    <button
      onClick={onClick}
      title={`${p.title} · ${xp} XP · noch ${p.remaining} XP bis Level ${p.level + 1}`}
      aria-label={`Level ${p.level}, ${p.title}. Open statistics.`}
      className="group hidden sm:flex items-center gap-2 shrink-0 rounded-full border border-line-soft bg-card pl-1 pr-2.5 py-1 transition-all hover:border-line hover:-translate-y-0.5 hover:shadow-sm"
    >
      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue to-purple text-white text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums shadow-[0_3px_8px_-3px_rgba(0,113,227,0.6)]">
        {p.level}
      </span>
      <span className="flex flex-col items-start leading-none gap-1">
        <ShimmerText text={p.title} className="text-[10.5px] font-semibold" />
        <span className="w-16 h-1 rounded-full bg-line overflow-hidden">
          <span className="block h-full rounded-full bg-gradient-to-r from-blue to-purple transition-[width] duration-700" style={{ width: p.pct + "%" }} />
        </span>
      </span>
    </button>
  );
}
